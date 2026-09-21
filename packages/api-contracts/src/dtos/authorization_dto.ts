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
  id: string
  name: string
  guard_name: string
  resource?: string | null
  description?: string | null
  created_at?: string
  updated_at?: string
}

export interface RoleDto {
  id: string
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
  user_id: string
  role_id: string
}

export interface CheckPermissionRequestDTO {
  user_id: string
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
  id: string
  memberId: string
  permissionId: string
  grant: boolean
  permission?: {
    id: string
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
  id: string
  name: string
  keyPrefix: string
  scopes: string[]
  expiresAt?: string | null
  lastUsedAt?: string | null
  createdAt: string
}

export interface WebhookDTO {
  id: string
  name: string
  url: string
  events: string[]
  secret?: string
  isActive: boolean
  createdAt: string
  updatedAt?: string
}
