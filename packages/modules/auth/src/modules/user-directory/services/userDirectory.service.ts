// userDirectory.service.ts
// Service Layer for User Directory API Integration with dual-endpoint resilience

import { apiClient, FetchResponse } from '@cap/platform-core'
import {
  PaginatedUsersResponseDTO,
  UserDetailDTO,
  UserDirectoryFilterParams,
  InviteUserRequestDTO,
  UpdateUserRequestDTO,
  UpdateUserStatusRequestDTO,
  RoleDTO,
  UserSessionDTO,
  UserActivityLogDTO,
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

export const userDirectoryService = {
  /**
   * List Users (Paginated with search, filters, and sorting)
   */
  getUsers: async (
    params: UserDirectoryFilterParams = {},
  ): Promise<FetchResponse<PaginatedUsersResponseDTO>> => {
    const queryParams: Record<string, any> = {
      page: params.page || 1,
      limit: params.perPage || params.limit || 10,
      perPage: params.perPage || params.limit || 10,
      search: params.search,
      status: params.status === 'ALL' ? undefined : params.status,
      role: params.role,
      tenantId: params.tenantId,
      department: params.department,
      sortBy: params.sortBy || 'createdAt',
      sortOrder: params.sortOrder || 'desc',
    }

    const queryString = buildQueryString(queryParams)

    try {
      return await apiClient.get<PaginatedUsersResponseDTO>(
        `/api/v1/user-directory/users${queryString}`,
      )
    } catch {
      // Fallback to existing admin endpoint
      const response = await apiClient.get<any>(`/api/admin/users${queryString}`)
      const raw = response.data

      // Transform admin pagination structure if needed
      const normalizedData = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []

      const meta = raw?.meta || {
        total: raw?.total || normalizedData.length,
        perPage: raw?.perPage || params.perPage || 10,
        currentPage: raw?.currentPage || raw?.page || params.page || 1,
        lastPage:
          raw?.lastPage ||
          Math.ceil((raw?.total || normalizedData.length) / (params.perPage || 10)) ||
          1,
        firstPage: 1,
      }

      // Normalize items
      const formattedItems = normalizedData.map((item: any) => ({
        id: item.id,
        email: item.email,
        firstName: item.firstname || item.firstName || item.profile?.firstname || '',
        lastName: item.lastname || item.lastName || item.profile?.lastname || '',
        fullName:
          item.fullName ||
          item.profile?.name ||
          `${item.firstname || ''} ${item.lastname || ''}`.trim() ||
          item.email?.split('@')[0],
        avatarUrl: item.avatarUrl || item.profile?.avatarUrl || item.avatar || null,
        phoneNumber: item.phoneNumber || item.profile?.phone || item.phone || null,
        status: (item.status || (item.isActif ? 'ACTIVE' : 'INACTIVE')).toUpperCase(),
        isEmailVerified: Boolean(item.isEmailVerified || item.emailVerifiedAt),
        mfaEnabled: Boolean(item.mfaEnabled || item.twoFactorEnabled),
        roles: item.roles || (item.role ? [item.role] : []),
        tenantId: item.tenantId || item.organizationId || null,
        tenantName: item.tenantName || item.organization?.name || null,
        jobTitle: item.jobTitle || item.profile?.jobTitle || null,
        department: item.department || item.profile?.department || null,
        lastLoginAt: item.lastLoginAt || item.lastLogin || null,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
      }))

      return {
        ...response,
        data: {
          data: formattedItems,
          meta,
        },
      }
    }
  },

  /**
   * Get Single User Details & Metadata
   */
  getUserById: async (id: string | number): Promise<FetchResponse<UserDetailDTO>> => {
    try {
      return await apiClient.get<UserDetailDTO>(`/api/v1/user-directory/users/${id}`)
    } catch {
      const response = await apiClient.get<any>(`/api/admin/users/${id}`)
      const raw = response.data || {}

      const detail: UserDetailDTO = {
        id: raw.id,
        email: raw.email,
        firstName: raw.firstname || raw.firstName || raw.profile?.firstname || '',
        lastName: raw.lastname || raw.lastName || raw.profile?.lastname || '',
        fullName:
          raw.fullName ||
          raw.profile?.name ||
          `${raw.firstname || ''} ${raw.lastname || ''}`.trim() ||
          raw.email?.split('@')[0],
        avatarUrl: raw.avatarUrl || raw.profile?.avatarUrl || raw.avatar || null,
        phoneNumber: raw.phoneNumber || raw.profile?.phone || raw.phone || null,
        status: (raw.status || (raw.isActif ? 'ACTIVE' : 'INACTIVE')).toUpperCase(),
        isEmailVerified: Boolean(raw.isEmailVerified || raw.emailVerifiedAt),
        mfaEnabled: Boolean(raw.mfaEnabled || raw.twoFactorEnabled),
        roles: raw.roles || (raw.role ? [raw.role] : []),
        tenantId: raw.tenantId || raw.organizationId || null,
        tenantName: raw.tenantName || raw.organization?.name || null,
        jobTitle: raw.jobTitle || raw.profile?.jobTitle || null,
        department: raw.department || raw.profile?.department || null,
        company: raw.company || raw.profile?.company || null,
        location: raw.location || raw.profile?.location || null,
        website: raw.website || raw.profile?.website || null,
        bio: raw.bio || raw.profile?.bio || null,
        timezone: raw.timezone || raw.profile?.timezone || 'utc',
        locale: raw.locale || raw.profile?.locale || 'en-us',
        dateFormat: raw.dateFormat || raw.profile?.dateFormat || 'mm-dd-yyyy',
        directReportsCount: raw.directReportsCount || 0,
        permissions:
          raw.permissions || raw.role?.permissions?.map((p: any) => p.slug || p.name) || [],
        securitySummary: raw.securitySummary || {
          passwordLastChangedAt: raw.passwordLastChangedAt || null,
          activeSessionsCount: raw.activeSessionsCount || 1,
          passkeysCount: raw.passkeysCount || 0,
          failedLoginAttemptsCount: raw.failedLoginAttemptsCount || 0,
          isLockedOut: Boolean(raw.isLockedOut),
        },
        sessions: raw.sessions || [],
        recentActivity: raw.recentActivity || [],
        lastLoginAt: raw.lastLoginAt || raw.lastLogin || null,
        createdAt: raw.createdAt || new Date().toISOString(),
        updatedAt: raw.updatedAt || new Date().toISOString(),
      }

      return {
        ...response,
        data: detail,
      }
    }
  },

  /**
   * Create / Invite Single User
   */
  inviteUser: async (payload: InviteUserRequestDTO): Promise<FetchResponse<any>> => {
    try {
      return await apiClient.post('/api/v1/user-directory/users/invite', payload)
    } catch {
      return await apiClient.post('/api/admin/users', {
        email: payload.email,
        firstname: payload.firstName,
        lastname: payload.lastName,
        role_id: payload.roleIds?.[0] || 1,
        password: payload.temporaryPassword || undefined,
        department: payload.department,
        jobTitle: payload.jobTitle,
      })
    }
  },

  /**
   * Bulk Invite Users
   */
  bulkInviteUsers: async (payload: {
    emails: string[]
    roleIds: number[]
    department?: string
    sendInviteEmail?: boolean
  }): Promise<FetchResponse<any>> => {
    try {
      return await apiClient.post('/api/v1/user-directory/users/bulk-invite', payload)
    } catch {
      // Create users sequentially as fallback
      const promises = payload.emails.map((email) =>
        apiClient.post('/api/admin/users', {
          email,
          firstname: email.split('@')[0],
          lastname: '',
          role_id: payload.roleIds[0] || 1,
          department: payload.department,
        }),
      )
      const results = await Promise.allSettled(promises)
      const succeeded = results.filter((r) => r.status === 'fulfilled').length
      return {
        data: { success: true, count: succeeded, total: payload.emails.length },
        status: 200,
        statusText: 'OK',
        headers: {},
      } as any
    }
  },

  /**
   * Update User Profile Details
   */
  updateUser: async (
    id: string | number,
    payload: UpdateUserRequestDTO,
  ): Promise<FetchResponse<any>> => {
    try {
      return await apiClient.put(`/api/v1/user-directory/users/${id}`, payload)
    } catch {
      return await apiClient.put(`/api/admin/users/${id}`, {
        firstname: payload.firstName,
        lastname: payload.lastName,
        email: payload.email,
        fullName: `${payload.firstName || ''} ${payload.lastName || ''}`.trim(),
        roleId: payload.roleIds?.[0],
        phone: payload.phoneNumber,
        department: payload.department,
        jobTitle: payload.jobTitle,
        timezone: payload.timezone,
        locale: payload.locale,
      })
    }
  },

  /**
   * Update Account Status (ACTIVE, INACTIVE, SUSPENDED, BANNED)
   */
  updateUserStatus: async (
    id: string | number,
    payload: UpdateUserStatusRequestDTO,
  ): Promise<FetchResponse<any>> => {
    try {
      return await apiClient.patch(`/api/v1/user-directory/users/${id}/status`, payload)
    } catch {
      if (payload.status === 'SUSPENDED' || payload.status === 'BANNED') {
        return await apiClient.post(`/api/admin/users/${id}/suspend`, { reason: payload.reason })
      } else if (payload.status === 'ACTIVE') {
        return await apiClient
          .post(`/api/admin/users/${id}/unsuspend`)
          .catch(() => apiClient.patch(`/api/admin/users/${id}/status`, { status: 'ACTIVE' }))
      } else {
        return await apiClient.patch(`/api/admin/users/${id}/status`, { status: payload.status })
      }
    }
  },

  /**
   * Soft-delete / Remove User
   */
  deleteUser: async (id: string | number, reason?: string): Promise<FetchResponse<any>> => {
    try {
      return await apiClient.delete(`/api/v1/user-directory/users/${id}`)
    } catch {
      return await apiClient.delete(`/api/admin/users/${id}`, { data: { reason } })
    }
  },

  /**
   * Fetch All Available Roles
   */
  getRoles: async (): Promise<FetchResponse<RoleDTO[]>> => {
    try {
      return await apiClient.get<RoleDTO[]>('/api/v1/roles')
    } catch {
      const response = await apiClient.get<any>('/api/admin/rbac/roles')
      const raw = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
          ? response.data.data
          : []

      const formattedRoles: RoleDTO[] = raw.map((r: any) => ({
        id: r.id,
        name: r.name,
        slug: r.slug || r.name.toLowerCase().replace(/\s+/g, '-'),
        description: r.description || '',
        permissions: r.permissions || [],
        usersCount: r.usersCount || r.users_count || 0,
        isDefault: Boolean(r.isDefault || r.is_default),
      }))

      return {
        ...response,
        data: formattedRoles,
      }
    }
  },

  /**
   * Sync / Assign Roles to User
   */
  syncUserRoles: async (
    id: string | number,
    roleIds: number[],
    reason?: string,
  ): Promise<FetchResponse<any>> => {
    try {
      return await apiClient.put(`/api/v1/user-directory/users/${id}/roles`, { roleIds, reason })
    } catch {
      return await apiClient.post(`/api/admin/users/${id}/assign-role`, {
        roleId: roleIds[0],
        roleIds,
        reason,
      })
    }
  },

  /**
   * Bulk Update User Statuses
   */
  bulkUpdateStatus: async (
    userIds: number[],
    status: string,
    reason?: string,
  ): Promise<FetchResponse<any>> => {
    try {
      return await apiClient.post('/api/v1/user-directory/users/bulk-status', {
        userIds,
        status,
        reason,
      })
    } catch {
      return await apiClient.post('/api/admin/users/bulk', {
        userIds,
        action:
          status === 'ACTIVE' ? 'activate' : status === 'SUSPENDED' ? 'suspend' : 'deactivate',
        reason,
      })
    }
  },

  /**
   * Bulk Delete Users
   */
  bulkDelete: async (userIds: number[], reason?: string): Promise<FetchResponse<any>> => {
    try {
      return await apiClient.post('/api/v1/user-directory/users/bulk-delete', { userIds, reason })
    } catch {
      return await apiClient.post('/api/admin/users/bulk', {
        userIds,
        action: 'delete',
        reason,
      })
    }
  },

  /**
   * Fetch User Active Sessions
   */
  getUserSessions: async (id: string | number): Promise<FetchResponse<UserSessionDTO[]>> => {
    try {
      return await apiClient.get<UserSessionDTO[]>(`/api/v1/user-directory/users/${id}/sessions`)
    } catch {
      const res = await apiClient.get<any>(`/api/admin/users/${id}/sessions`)
      return {
        ...res,
        data: Array.isArray(res.data) ? res.data : res.data?.data || [],
      }
    }
  },

  /**
   * Fetch User Activity / Audit Logs
   */
  getUserActivityLogs: async (
    id: string | number,
    limit: number = 20,
  ): Promise<FetchResponse<UserActivityLogDTO[]>> => {
    try {
      return await apiClient.get<UserActivityLogDTO[]>(
        `/api/v1/user-directory/users/${id}/activity?limit=${limit}`,
      )
    } catch {
      const res = await apiClient.get<any>(`/api/admin/audit-logs?userId=${id}&limit=${limit}`)
      const raw = Array.isArray(res.data) ? res.data : res.data?.data || []
      return {
        ...res,
        data: raw.map((log: any) => ({
          id: log.id,
          action: log.action || log.event || 'Activity',
          description: log.description || log.message || log.action || '',
          ipAddress: log.ipAddress || log.ip_address,
          userAgent: log.userAgent || log.user_agent,
          createdAt: log.createdAt || log.created_at,
          metadata: log.metadata || log.payload,
        })),
      }
    }
  },

  /**
   * Trigger Admin Password Reset Link
   */
  sendPasswordReset: async (id: string | number): Promise<FetchResponse<any>> => {
    return await apiClient.post(`/api/admin/users/${id}/reset-password`, {})
  },

  /**
   * Reset User MFA
   */
  resetMfa: async (id: string | number): Promise<FetchResponse<any>> => {
    return await apiClient.post(`/api/admin/users/${id}/mfa-reset`, {})
  },

  /**
   * Impersonate User
   */
  impersonateUser: async (id: string | number): Promise<FetchResponse<any>> => {
    return await apiClient.post(`/api/admin/users/${id}/impersonate`, {})
  },

  /**
   * Export Users as CSV (Server stream or client-side fallback)
   */
  exportUsers: async (
    params: UserDirectoryFilterParams = {},
    fallbackData?: any[],
  ): Promise<void> => {
    const queryString = buildQueryString(params)
    const exportUrl = `/api/v1/user-directory/users/export${queryString}`

    try {
      const response = await fetch(exportUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })
      if (!response.ok) throw new Error(`Export failed with status: ${response.status}`)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(downloadUrl)
    } catch {
      // Client-side CSV generation fallback
      const usersToExport = fallbackData || []
      const headers = [
        'ID',
        'Email',
        'Full Name',
        'Status',
        'Roles',
        'Department',
        'Job Title',
        'Created At',
      ]
      const rows = usersToExport.map((u) => [
        u.id,
        `"${(u.email || '').replace(/"/g, '""')}"`,
        `"${(u.fullName || '').replace(/"/g, '""')}"`,
        u.status,
        `"${(u.roles?.map((r: any) => r.name || r).join(', ') || '').replace(/"/g, '""')}"`,
        `"${(u.department || '').replace(/"/g, '""')}"`,
        `"${(u.jobTitle || '').replace(/"/g, '""')}"`,
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
    }
  },
}

export default userDirectoryService
