import { adminService, Role, Permission } from '../../services/adminService';
import { useAppStore } from '@cap/platform-store';
import type { IRoleReader, IRoleWriter, IRolePermissionManager, IPermissionReader, IPermissionWriter, IPermissionChecker, IUserRoleManager, IAuthorizationFacade } from '../ports';
import type { RoleDto, PermissionDto, CheckPermissionRequest, CheckPermissionResponse } from '../dtos/authorization.dto';

const mapRoleToDto = (role: Role): RoleDto => ({
  id: role.id,
  name: role.name,
  guard_name: role.guard_name ?? '',
  description: role.description ?? undefined,
  permissions: role.permissions?.map(mapPermissionToDto) ?? [],
  users_count: role.users_count,
  created_at: role.created_at ?? '',
  updated_at: role.updated_at ?? '',
})

const mapPermissionToDto = (permission: Permission): PermissionDto => ({
  id: permission.id,
  name: permission.name,
  guard_name: permission.guard_name ?? '',
  resource: permission.resource,
  description: permission.description ?? undefined,
  created_at: permission.created_at ?? '',
  updated_at: permission.updated_at ?? '',
})

export class RoleService implements IRoleReader, IRoleWriter, IRolePermissionManager {
  async listRoles(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<{ roles: RoleDto[]; total: number }> {
    const response = await adminService.listRoles(params)
    const data = response.data as unknown as { data: Role[]; total: number }
    return {
      roles: data.data.map(mapRoleToDto),
      total: data.total ?? 0,
    }
  }

  async getRole(roleId: number): Promise<RoleDto> {
    const response = await adminService.getRole(roleId)
    return mapRoleToDto(response.data as Role)
  }

  async createRole(data: {
    name: string
    guard_name?: string
    description?: string
  }): Promise<RoleDto> {
    const response = await adminService.createRole(data)
    return mapRoleToDto(response.data as Role)
  }

  async updateRole(
    roleId: number,
    data: { name?: string; description?: string },
  ): Promise<RoleDto> {
    const response = await adminService.updateRole(roleId, data)
    return mapRoleToDto(response.data as Role)
  }

  async deleteRole(roleId: number): Promise<void> {
    await adminService.deleteRole(roleId)
  }

  async getRolePermissions(roleId: number): Promise<PermissionDto[]> {
    const response = await adminService.getRolePermissions(roleId.toString())
    return (response.data as Permission[]).map(mapPermissionToDto)
  }

  async assignPermissionToRole(data: { role_id: number; permission_id: number }): Promise<void> {
    await adminService.assignPermissionToRole(data)
  }

  async syncRolePermissions(roleId: number, permissionIds: number[]): Promise<RoleDto> {
    const response = await adminService.syncRolePermissions(roleId, permissionIds)
    return mapRoleToDto(response.data as Role)
  }
}

export class PermissionService implements IPermissionReader, IPermissionWriter {
  async listPermissions(): Promise<PermissionDto[]> {
    const response = await adminService.listPermissions()
    return (response.data as Permission[]).map(mapPermissionToDto)
  }

  async getPermission(permissionId: number): Promise<PermissionDto> {
    const response = await adminService.getPermission(permissionId)
    return mapPermissionToDto(response.data as Permission)
  }

  async createPermission(data: {
    name: string
    guard_name?: string
    resource?: string
    description?: string
  }): Promise<PermissionDto> {
    const response = await adminService.createPermission(data)
    return mapPermissionToDto(response.data as Permission)
  }

  async updatePermission(
    permissionId: number,
    data: { name?: string; guard_name?: string; resource?: string; description?: string },
  ): Promise<PermissionDto> {
    const response = await adminService.updatePermission(permissionId, data)
    return mapPermissionToDto(response.data as Permission)
  }

  async deletePermission(permissionId: number): Promise<void> {
    await adminService.deletePermission(permissionId)
  }
}

export interface UserPermissionsContext {
  userId?: string | number
  organizationId?: string | number
  role?: string
  roleObject?: { name?: string; permissions?: (string | { name?: string })[] }
  permissions?: (string | { name?: string })[]
  isAuthenticated?: boolean
}

export class PermissionCheckerService implements IPermissionChecker {
  constructor(
    private readonly getCurrentUserPermissionsContext?: () => UserPermissionsContext | null,
  ) {}

  async checkPermission(request: CheckPermissionRequest): Promise<CheckPermissionResponse> {
    // 1. Fail closed on missing/malformed request
    if (!request || typeof request !== 'object') {
      return { allowed: false, reason: 'Invalid or missing permission check request' }
    }

    const permissionTarget =
      request.permission ||
      (request.resource && request.action ? `${request.resource}.${request.action}` : request.resource)

    if (!permissionTarget) {
      return { allowed: false, reason: 'Missing permission or resource/action target in request' }
    }

    // 2. Obtain user context
    let userContext: UserPermissionsContext | null = null
    if (this.getCurrentUserPermissionsContext) {
      userContext = this.getCurrentUserPermissionsContext()
    } else {
      try {
        const storeState = useAppStore.getState()
        if (storeState && storeState.isAuthenticated && storeState.user) {
          const u = (storeState.user as any).user || storeState.user
          userContext = {
            userId: u.id || u.userId || u.sub,
            organizationId: u.organizationId || u.orgId || u.activeTenantId,
            role: u.role || u.roleName,
            roleObject: u.roleObject,
            permissions: Array.isArray(u.permissions) ? u.permissions : [],
            isAuthenticated: storeState.isAuthenticated,
          }
        }
      } catch {
        // Ignored if store is uninitialized
      }
    }

    // 3. Fail closed if unauthenticated or context missing
    if (!userContext || userContext.isAuthenticated === false) {
      return { allowed: false, reason: 'User is not authenticated or user context is missing' }
    }

    // If request specifies a userId, verify that it matches the authenticated user ID
    if (
      request.userId != null &&
      userContext.userId != null &&
      String(request.userId) !== String(userContext.userId)
    ) {
      return { allowed: false, reason: 'Request userId does not match authenticated user context' }
    }

    // 4. Role-based evaluation with tenant scoping
    const userRoleStr = (userContext.role || userContext.roleObject?.name || '').toString().toLowerCase()

    // Platform Super-admin role has global authority
    if (
      userRoleStr === 'super-admin' ||
      userRoleStr === 'super_admin' ||
      userRoleStr === 'superadmin' ||
      userRoleStr === 'platform_owner'
    ) {
      return { allowed: true }
    }

    // Tenant admin has authority within their own tenant scope
    if (userRoleStr === 'admin' || userRoleStr === 'tenant_admin' || userRoleStr === 'tenant_owner') {
      if (request.organizationId != null && userContext.organizationId != null) {
        if (String(request.organizationId) === String(userContext.organizationId)) {
          return { allowed: true }
        }
        return { allowed: false, reason: 'Organization ID mismatch for tenant admin role' }
      }
      return { allowed: true }
    }

    // 5. Explicit permissions evaluation
    const rawPermissions = [
      ...(Array.isArray(userContext.permissions) ? userContext.permissions : []),
      ...(Array.isArray(userContext.roleObject?.permissions) ? userContext.roleObject!.permissions! : []),
    ]

    const userPermissions = rawPermissions
      .map((p) => (typeof p === 'string' ? p : p?.name))
      .filter((p): p is string => typeof p === 'string' && p.length > 0)

    const isAllowed = userPermissions.some((perm) => {
      if (perm === '*' || perm === permissionTarget) return true
      if (request.resource && request.action) {
        if (perm === `${request.resource}.${request.action}` || perm === `${request.resource}:${request.action}`)
          return true
        if (perm === `${request.resource}.*` || perm === `${request.resource}:*`)
          return true
      }
      return false
    })

    if (isAllowed) {
      return { allowed: true }
    }

    return { allowed: false, reason: `Permission '${permissionTarget}' denied` }
  }
}

export class UserRoleService implements IUserRoleManager {
  async assignRoleToUser(data: { user_id: number; role_id: number }): Promise<void> {
    await adminService.assignRoleToUser(data.user_id, data.role_id)
  }

  async removeRoleFromUser(userId: number, _roleId: number): Promise<void> {
    console.warn('removeRoleFromUser not implemented', userId, _roleId)
  }

  async getUserRoles(userId: number): Promise<RoleDto[]> {
    const response = await adminService.getUser(userId)
    const user = response.data as unknown as { role?: Role }
    if (user.role) {
      return [mapRoleToDto(user.role)]
    }
    return []
  }
}

export class AuthorizationService implements IAuthorizationFacade {
  role = new RoleService()
  permission = new PermissionService()
  userRole = new UserRoleService()

  async checkPermission(request: CheckPermissionRequest): Promise<CheckPermissionResponse> {
    const checker = new PermissionCheckerService()
    return checker.checkPermission(request)
  }
}

export const authorizationService = new AuthorizationService()

