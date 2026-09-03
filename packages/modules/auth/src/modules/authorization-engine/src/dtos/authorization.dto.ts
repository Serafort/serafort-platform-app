export interface RoleDto {
  id: number
  name: string
  guard_name: string
  description?: string
  permissions: PermissionDto[]
  users_count?: number
  created_at: string
  updated_at: string
}

export interface PermissionDto {
  id: number
  name: string
  guard_name: string
  resource?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface CheckPermissionRequest {
  userId?: string | number
  resource?: string
  action?: string
  permission?: string
  organizationId?: number
}

export interface CheckPermissionResponse {
  allowed: boolean
  reason?: string
}

export interface AssignRoleRequest {
  userId: number
  roleId: number
}

export interface SyncRolePermissionsRequest {
  roleId: number
  permissionIds: number[]
}

export const AUTHORIZATION_VERSION = 'v1'

export const AuthorizationDtoVersions = {
  ROLE: AUTHORIZATION_VERSION,
  PERMISSION: AUTHORIZATION_VERSION,
  CHECK_PERMISSION: AUTHORIZATION_VERSION,
} as const
