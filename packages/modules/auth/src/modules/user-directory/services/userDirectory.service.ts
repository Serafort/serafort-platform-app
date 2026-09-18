// userDirectory.service.ts
// Service layer wiring the User Directory UI to the Serafort Authentication
// backend (`C:\Node.Js\proj\Authentication`). All paths come from the shared
// `ENDPOINTS` registry rather than being hand-written, so this file tracks the
// backend's route table automatically.
//
// The backend's admin user model is intentionally narrower than the UI's
// aspirational DTOs: a `User` has exactly one `roleId` (no many-to-many role
// assignment), and there is no `jobTitle`/`department` column anywhere in the
// schema. Where the UI still collects those fields (multi-select roles, job
// title/department inputs), this layer takes the first selected role and
// drops the fields the backend cannot persist, rather than pretending they
// are saved.

import { apiClient, FetchResponse, ENDPOINTS } from '@cap/platform-core'
import {
  PaginatedUsersResponseDTO,
  UserDetailDTO,
  UserDirectoryFilterParams,
  UserDirectoryItemDTO,
  InviteUserRequestDTO,
  UpdateUserRequestDTO,
  UpdateUserStatusRequestDTO,
  RoleDTO,
  UserSessionDTO,
  UserActivityLogDTO,
  UserStatus,
} from '../types/userDirectory.types'

/**
 * Helper to build clean query string from filter object
 */
function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'ALL') {
      searchParams.append(key, String(value))
    }
  })
  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}

/**
 * The backend only ever writes `ACTIVE`, `PENDING` (via `deactivateUser`) or
 * `SUSPENDED` onto `users.status` — there is no distinct `BANNED` value, and
 * `PATCH /:id/ban` is a named alias for the same suspend transition. `PENDING`
 * is this directory's "deactivated" state.
 */
function normalizeStatus(rawStatus: unknown): UserStatus {
  const status = String(rawStatus || '').toUpperCase()
  if (status === 'ACTIVE') return 'ACTIVE'
  if (status === 'SUSPENDED') return 'SUSPENDED'
  if (status === 'PENDING' || status === 'INACTIVE' || status === 'DELETED') return 'INACTIVE'
  return 'INACTIVE'
}

/**
 * Maps a `User.serialize()` payload (optionally with `profile`, `role`, and
 * `organizationMembers` preloaded) onto the directory's DTO shape.
 */
function normalizeUser(raw: any): UserDetailDTO {
  const role = raw.role
  const membership = Array.isArray(raw.organizationMembers) ? raw.organizationMembers[0] : null

  return {
    id: raw.id,
    email: raw.email,
    firstName: raw.firstName || '',
    lastName: raw.lastName || '',
    fullName: raw.name || `${raw.firstName || ''} ${raw.lastName || ''}`.trim() || raw.email,
    avatarUrl: raw.avatarUrl || raw.avatar || null,
    phoneNumber: raw.phoneNumber || null,
    status: normalizeStatus(raw.status),
    isEmailVerified: Boolean(raw.isEmailVerified || raw.emailVerified),
    mfaEnabled: Boolean(raw.mfaEnabled),
    roles: role ? [{ id: role.id, name: role.name, slug: role.slug, permissions: role.permissions }] : [],
    tenantId: raw.tenantId || null,
    tenantName: membership?.organization?.name || null,
    jobTitle: null,
    department: null,
    company: raw.profile?.company || null,
    location: raw.profile?.location || null,
    website: raw.profile?.websiteUrl || raw.profile?.website || null,
    bio: raw.profile?.biography || null,
    timezone: raw.timezone || 'utc',
    locale: raw.language || 'en-us',
    dateFormat: raw.dateFormat || 'mm-dd-yyyy',
    directReportsCount: 0,
    permissions: (role?.permissions || []).map((p: any) => p.slug || p.name),
    securitySummary: {
      passwordLastChangedAt: null,
      activeSessionsCount: 0,
      passkeysCount: 0,
      mfaEnrolledAt: raw.mfaEnrolledAt || null,
      failedLoginAttemptsCount: 0,
      isLockedOut: false,
    },
    sessions: [],
    recentActivity: [],
    lastLoginAt: raw.lastLoginAt || null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

/**
 * Applies a bulk action to each id individually via `Promise.allSettled` and
 * reports back in the same `{ message, results }` shape the backend's own
 * `/api/admin/users/bulk` endpoint uses — needed for `SUSPENDED` and `DELETE`,
 * which that endpoint does not support as bulk actions.
 */
async function applyPerUser(
  userIds: Array<string | number>,
  action: (id: string | number) => Promise<unknown>,
): Promise<FetchResponse<{ message: string; results: Array<{ id: string | number; status: string }> }>> {
  const settled = await Promise.allSettled(userIds.map((id) => action(id)))
  const results = settled.map((outcome, index) => ({
    id: userIds[index],
    status: outcome.status === 'fulfilled' ? 'success' : 'error',
    message: outcome.status === 'rejected' ? String((outcome.reason as any)?.message || outcome.reason) : undefined,
  }))
  return {
    data: { message: 'Bulk action completed', results },
    status: 200,
    statusText: 'OK',
    headers: {} as any,
    config: {} as any,
    ok: true,
  }
}

export const userDirectoryService = {
  /**
   * List Users (Paginated with search, filters, and sorting)
   */
  getUsers: async (
    params: UserDirectoryFilterParams = {},
  ): Promise<FetchResponse<PaginatedUsersResponseDTO>> => {
    const queryString = buildQueryString({
      page: params.page || 1,
      limit: params.perPage || params.limit || 10,
      search: params.search,
      status: params.status === 'ALL' ? undefined : params.status,
      role: params.role,
    })

    const response = await apiClient.get<any>(`${ENDPOINTS.admin.users.index}${queryString}`)
    const raw = response.data

    return {
      ...response,
      data: {
        data: (raw?.data || []).map((item: any) => normalizeUser(item) as UserDirectoryItemDTO),
        meta: raw?.meta,
      },
    }
  },

  /**
   * Get Single User Details & Metadata
   */
  getUserById: async (id: string | number): Promise<FetchResponse<UserDetailDTO>> => {
    const response = await apiClient.get<any>(ENDPOINTS.admin.users.byId(Number(id)))
    return { ...response, data: normalizeUser(response.data) }
  },

  /**
   * Create / Invite Single User
   */
  inviteUser: async (payload: InviteUserRequestDTO): Promise<FetchResponse<any>> => {
    return apiClient.post(ENDPOINTS.admin.users.store, {
      email: payload.email,
      firstname: payload.firstName,
      lastname: payload.lastName,
      roleId: payload.roleIds?.[0],
      password: payload.temporaryPassword || undefined,
    })
  },

  /**
   * Bulk Invite Users — the backend has no batch-create endpoint, so each
   * invite is issued as its own `POST /api/admin/users` call.
   */
  bulkInviteUsers: async (payload: {
    emails: string[]
    roleIds: number[]
    department?: string
    sendInviteEmail?: boolean
  }): Promise<FetchResponse<any>> => {
    const results = await Promise.allSettled(
      payload.emails.map((email) =>
        apiClient.post(ENDPOINTS.admin.users.store, {
          email,
          firstname: email.split('@')[0],
          lastname: '',
          roleId: payload.roleIds?.[0],
        }),
      ),
    )
    const succeeded = results.filter((r) => r.status === 'fulfilled').length
    return {
      data: { success: true, count: succeeded, total: payload.emails.length },
      status: 200,
      statusText: 'OK',
      headers: {} as any,
      config: {} as any,
      ok: true,
    }
  },

  /**
   * Update User Profile Details
   *
   * `jobTitle`/`department`/`bio`/`company`/`location`/`website`/`dateFormat`
   * have no backing column and are intentionally not sent — the backend would
   * silently ignore them, which is worse than not claiming to save them.
   */
  updateUser: async (
    id: string | number,
    payload: UpdateUserRequestDTO,
  ): Promise<FetchResponse<any>> => {
    return apiClient.put(ENDPOINTS.admin.users.byId(Number(id)), {
      email: payload.email,
      firstname: payload.firstName,
      lastname: payload.lastName,
      fullName:
        payload.firstName || payload.lastName
          ? `${payload.firstName || ''} ${payload.lastName || ''}`.trim()
          : undefined,
      phone: payload.phoneNumber || undefined,
      timezone: payload.timezone,
      language: payload.locale,
      roleId: payload.roleIds?.[0],
    })
  },

  /**
   * Update Account Status (ACTIVE, INACTIVE, SUSPENDED, BANNED)
   */
  updateUserStatus: async (
    id: string | number,
    payload: UpdateUserStatusRequestDTO,
  ): Promise<FetchResponse<any>> => {
    if (payload.status === 'BANNED') {
      return apiClient.patch(ENDPOINTS.admin.users.ban(Number(id)), { reason: payload.reason })
    }
    return apiClient.patch(ENDPOINTS.admin.users.updateStatus(Number(id)), {
      status: payload.status,
      reason: payload.reason,
    })
  },

  /**
   * Soft-delete / Remove User. `reason` is accepted for API-symmetry with the
   * other status-changing calls but the backend's `destroy()` does not read a
   * request body, so it is not sent.
   */
  deleteUser: async (id: string | number, _reason?: string): Promise<FetchResponse<any>> => {
    return apiClient.delete(ENDPOINTS.admin.users.byId(Number(id)))
  },

  /**
   * Fetch All Available Roles
   */
  getRoles: async (): Promise<FetchResponse<RoleDTO[]>> => {
    const response = await apiClient.get<any>(ENDPOINTS.rbac.roles.list)
    const raw = response.data?.data || []

    return {
      ...response,
      data: raw.map((r: any) => ({
        id: r.id,
        name: r.name,
        slug: r.slug || r.name.toLowerCase().replace(/\s+/g, '-'),
        description: r.description || '',
        permissions: r.permissions || [],
        usersCount: r.usersCount || 0,
        isDefault: false,
      })),
    }
  },

  /**
   * Assign a role to a user. The backend has one `roleId` per user, so a
   * multi-role selection in the UI resolves to its first entry.
   */
  syncUserRoles: async (
    id: string | number,
    roleIds: number[],
    reason?: string,
  ): Promise<FetchResponse<any>> => {
    return apiClient.post(ENDPOINTS.admin.users.assignRole(Number(id)), {
      roleId: roleIds[0],
      reason,
    })
  },

  /**
   * Bulk Update User Statuses. `/api/admin/users/bulk` only understands
   * `activate` / `deactivate` / `restore` / `reset-mfa` / `ban` — `SUSPENDED`
   * has no bulk action, so it falls back to one `suspend` call per user.
   */
  bulkUpdateStatus: async (
    userIds: number[],
    status: string,
    reason?: string,
  ): Promise<FetchResponse<any>> => {
    if (status === 'ACTIVE') {
      return apiClient.post(ENDPOINTS.admin.users.bulkAction, { userIds, action: 'activate', reason })
    }
    if (status === 'INACTIVE') {
      return apiClient.post(ENDPOINTS.admin.users.bulkAction, { userIds, action: 'deactivate', reason })
    }
    if (status === 'BANNED') {
      return applyPerUser(userIds, (id) =>
        apiClient.patch(ENDPOINTS.admin.users.ban(Number(id)), { reason }),
      )
    }
    // SUSPENDED
    return applyPerUser(userIds, (id) =>
      apiClient.post(ENDPOINTS.admin.users.suspend(Number(id)), { reason }),
    )
  },

  /**
   * Bulk Delete Users — no bulk-delete action exists server-side, so this
   * issues one `DELETE` per user.
   */
  bulkDelete: async (userIds: number[], _reason?: string): Promise<FetchResponse<any>> => {
    return applyPerUser(userIds, (id) => apiClient.delete(ENDPOINTS.admin.users.byId(Number(id))))
  },

  /**
   * Fetch User Active Sessions.
   *
   * The backend answers with rows from `auth_access_tokens`
   * (`id`, `name`, `createdAt`, `lastUsedAt`, `expiresAt`) — there is no
   * stored IP address, user agent, or device/browser breakdown for this
   * table, so those DTO fields are left unset rather than fabricated.
   */
  getUserSessions: async (id: string | number): Promise<FetchResponse<UserSessionDTO[]>> => {
    const res = await apiClient.get<any>(ENDPOINTS.admin.users.sessions(Number(id)))
    const raw = Array.isArray(res.data) ? res.data : res.data?.data || []
    return {
      ...res,
      data: raw.map((session: any) => ({
        id: session.id,
        ipAddress: '',
        userAgent: '',
        device: session.name,
        lastActiveAt: session.lastUsedAt || session.createdAt,
        createdAt: session.createdAt,
      })),
    }
  },

  /**
   * Fetch User Activity / Audit Logs.
   *
   * `/api/admin/audit-logs` reads the user filter from the query parameter
   * `user_id` (snake_case) — it is a request parameter, not a JSON body, so
   * it is exempt from the backend's camelCase response middleware.
   */
  getUserActivityLogs: async (
    id: string | number,
    limit: number = 20,
  ): Promise<FetchResponse<UserActivityLogDTO[]>> => {
    const res = await apiClient.get<any>(
      `${ENDPOINTS.admin.auditLogs.index}?user_id=${id}&limit=${limit}`,
    )
    const raw = Array.isArray(res.data) ? res.data : res.data?.data || []
    return {
      ...res,
      data: raw.map((log: any) => ({
        id: log.id,
        action: log.action,
        description: log.action,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
        metadata: log.metadata,
      })),
    }
  },

  /**
   * Trigger Admin Password Reset Link
   */
  sendPasswordReset: async (id: string | number): Promise<FetchResponse<any>> => {
    return apiClient.post(ENDPOINTS.admin.users.resetPassword(Number(id)), {})
  },

  /**
   * Reset User MFA
   */
  resetMfa: async (id: string | number): Promise<FetchResponse<any>> => {
    return apiClient.post(ENDPOINTS.admin.users.resetMfa(Number(id)), {})
  },

  /**
   * Impersonate User (platform-admin only, enforced server-side)
   */
  impersonateUser: async (id: string | number): Promise<FetchResponse<any>> => {
    return apiClient.post(ENDPOINTS.admin.users.impersonate(Number(id)), {})
  },

  /**
   * Export Users as CSV. There is no server-side export endpoint for the
   * directory, so this always builds the CSV client-side from whatever page
   * of results is currently loaded.
   */
  exportUsers: async (_params: UserDirectoryFilterParams = {}, fallbackData?: any[]): Promise<void> => {
    const usersToExport = fallbackData || []
    const headers = ['ID', 'Email', 'Full Name', 'Status', 'Roles', 'Created At']
    const rows = usersToExport.map((u) => [
      u.id,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${(u.fullName || '').replace(/"/g, '""')}"`,
      u.status,
      `"${(u.roles?.map((r: any) => r.name || r).join(', ') || '').replace(/"/g, '""')}"`,
      u.createdAt,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  },
}

export default userDirectoryService
