// userDirectory.types.ts
// Contract DTOs and interfaces for User Directory module

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED'

export interface UserRoleDTO {
  id: number
  name: string
  slug: string
  description?: string | null
  permissions?: string[]
  isSystem?: boolean
}

export interface UserDirectoryItemDTO {
  id: number
  email: string
  firstName: string
  lastName: string
  fullName: string
  avatarUrl?: string | null
  phoneNumber?: string | null
  status: UserStatus
  isEmailVerified: boolean
  mfaEnabled: boolean
  roles: UserRoleDTO[]
  tenantId?: number | null
  tenantName?: string | null
  jobTitle?: string | null
  department?: string | null
  lastLoginAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface SecuritySummaryDTO {
  passwordLastChangedAt: string | null
  activeSessionsCount: number
  passkeysCount: number
  mfaEnrolledAt?: string | null
  failedLoginAttemptsCount?: number
  isLockedOut?: boolean
}

export interface UserSessionDTO {
  id: string
  ipAddress: string
  userAgent: string
  device?: string
  browser?: string
  os?: string
  location?: string
  lastActiveAt: string
  createdAt: string
  isCurrent?: boolean
}

export interface UserActivityLogDTO {
  id: string | number
  action: string
  description: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
  metadata?: Record<string, any>
}

export interface UserDetailDTO extends UserDirectoryItemDTO {
  jobTitle?: string | null
  department?: string | null
  company?: string | null
  location?: string | null
  website?: string | null
  bio?: string | null
  timezone?: string
  locale?: string
  dateFormat?: string
  directReportsCount?: number
  permissions: string[]
  securitySummary: SecuritySummaryDTO
  sessions?: UserSessionDTO[]
  recentActivity?: UserActivityLogDTO[]
}

export interface PaginatedUsersResponseDTO {
  data: UserDirectoryItemDTO[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
    firstPage: number
  }
}

export interface UserDirectoryFilterParams {
  page?: number
  perPage?: number
  limit?: number
  search?: string
  status?: UserStatus | 'ALL' | ''
  role?: string | number
  tenantId?: string | number
  department?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface InviteUserRequestDTO {
  email: string
  firstName: string
  lastName: string
  roleIds: number[]
  department?: string
  jobTitle?: string
  sendInviteEmail?: boolean
  temporaryPassword?: string
}

export interface UpdateUserRequestDTO {
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string | null
  jobTitle?: string | null
  department?: string | null
  company?: string | null
  location?: string | null
  website?: string | null
  bio?: string | null
  timezone?: string
  locale?: string
  dateFormat?: string
  status?: UserStatus
  roleIds?: number[]
}

export interface UpdateUserStatusRequestDTO {
  status: UserStatus
  reason?: string
}

export interface AssignRolesRequestDTO {
  roleIds: number[]
  reason?: string
  effectiveDate?: string
}

export interface BulkUserActionRequestDTO {
  userIds: number[]
  action: 'ACTIVATE' | 'DEACTIVATE' | 'SUSPEND' | 'DELETE' | 'RESEND_INVITE' | 'ASSIGN_ROLE'
  status?: UserStatus
  roleId?: number
  reason?: string
}

export interface RoleDTO {
  id: number
  name: string
  slug: string
  description?: string | null
  permissions?: Array<{ id: number; name: string; slug: string; description?: string }>
  usersCount?: number
  isDefault?: boolean
}
