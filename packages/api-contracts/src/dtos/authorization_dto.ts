/**
 * Auto-generated / synchronized from Authentication backend.
 * Source: Authentication/app/contracts/dtos/authorization_dto.ts
 * DO NOT EDIT DIRECTLY - Use scripts/sync-contracts.mjs
 */

/**
 * Authorization & RBAC/ABAC DTOs
 * Aligned with @cap/authorization, @cap/auth-contracts, and @cap/shared-types.
 */

export interface PermissionDto {
  id: number
  name: string
  guard_name: string
  resource?: string | null
  description?: string | null
  created_at?: string
  updated_at?: string
}

export interface RoleDto {
  id: number
  name: string
  guard_name: string
  description?: string | null
  permissions: PermissionDto[]
  parents?: RoleDto[]
  users_count?: number
  created_at?: string
  updated_at?: string
}

export interface CreateRoleRequestDTO {
  name: string
  guard_name?: string
  description?: string
  permission_ids?: number[]
}

export interface UpdateRoleRequestDTO {
  name?: string
  guard_name?: string
  description?: string
}

export interface CreatePermissionRequestDTO {
  name: string
  guard_name?: string
  resource?: string
  description?: string
}

export interface UpdatePermissionRequestDTO {
  name?: string
  guard_name?: string
  resource?: string
  description?: string
}

export interface RolePermissionSyncRequestDTO {
  permission_ids: number[]
}

export interface AssignRoleRequestDTO {
  user_id: number
  role_id: number
}

export interface CheckPermissionRequestDTO {
  user_id: number
  permission: string
  resource?: string
  organization_id?: number
  organizationId?: number
  context?: Record<string, unknown>
}

export interface CheckPermissionResponseDTO {
  allowed: boolean
  reason?: string
}

export interface MemberOverrideDTO {
  id: number
  memberId: number
  permissionId: number
  grant: boolean
  permission?: {
    id: number
    name: string
    resource: string
  }
}

export interface AccessPolicyRuleDTO {
  id: string
  effect: 'allow' | 'deny'
  actions: string[]
  resources: string[]
  conditions?: Record<string, unknown>
}

export interface AccessPolicyDTO {
  id: string | number
  name: string
  description?: string
  effect?: 'allow' | 'deny'
  priority?: number
  subjects?: string[]
  resources?: string[]
  actions?: string[]
  conditions?: Record<string, unknown>
  rules?: AccessPolicyRuleDTO[]
  created_at?: string
  updated_at?: string
}

export interface DeveloperApiKeyDTO {
  id: number
  name: string
  keyPrefix: string
  scopes: string[]
  expiresAt?: string | null
  lastUsedAt?: string | null
  createdAt: string
}

export interface WebhookDTO {
  id: number
  name: string
  url: string
  events: string[]
  secret?: string
  isActive: boolean
  createdAt: string
  updatedAt?: string
}
