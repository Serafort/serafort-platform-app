/**
 * Auto-generated / synchronized from Authentication backend.
 * Source: Authentication/app/contracts/dtos/user_dto.ts
 * DO NOT EDIT DIRECTLY - Use scripts/sync-contracts.mjs
 */

/**
 * User & Profile DTOs
 * Aligned with @cap/shared-types and @cap/auth-contracts.
 */

export interface UserDTO {
  id: number
  email: string
  name?: string
  firstName: string
  lastName: string
  role?: string
  roles: string[]
  permissions: string[]
  tenantId?: number | null
  avatarUrl?: string | null
  phone?: string | null
  status?: string
  mfaEnabled?: boolean
  isAdmin?: boolean
  emailVerified?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface UserProfileDTO {
  id: number
  userId: number
  bio?: string | null
  theme?: string | null
  emailOnNewDeviceLogin?: boolean
}

export interface CreateAdminUserDTO {
  email: string
  password?: string
  firstname: string
  lastname: string
  role_id?: number
}

export interface UpdateAdminUserDTO {
  email?: string
  firstname?: string
  lastname?: string
  role_id?: number
  is_active?: boolean
  apiAccessEnabled?: boolean
  maintenanceModeBypass?: boolean
}

export interface BulkUserActionDTO {
  ids: number[]
  action: 'activate' | 'deactivate' | 'delete' | 'assign_role' | 'ban'
  payload?: {
    role_id?: number
    reason?: string
  }
}

export interface UserStatsDTO {
  total: number
  active: number
  inactive: number
  banned: number
  new_today: number
  new_this_week: number
}
