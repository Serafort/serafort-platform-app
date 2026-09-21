import type {
  RoleDto,
  PermissionDto,
  CheckPermissionRequest,
  CheckPermissionResponse,
} from '../dtos/authorization.dto'

export interface IRoleReader {
  listRoles(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<{ roles: RoleDto[]; total: number }>
  getRole(roleId: string): Promise<RoleDto>
}

export interface IRoleWriter {
  createRole(data: { name: string; guard_name?: string; description?: string }): Promise<RoleDto>
  updateRole(roleId: string, data: { name?: string; description?: string }): Promise<RoleDto>
  deleteRole(roleId: string): Promise<void>
}

export interface IRolePermissionManager {
  getRolePermissions(roleId: string): Promise<PermissionDto[]>
  assignPermissionToRole(data: { role_id: string; permission_id: string }): Promise<void>
  syncRolePermissions(roleId: string, permissionIds: string[]): Promise<RoleDto>
}

export interface IPermissionReader {
  listPermissions(): Promise<PermissionDto[]>
  getPermission(permissionId: string): Promise<PermissionDto>
}

export interface IPermissionWriter {
  createPermission(data: {
    name: string
    guard_name?: string
    resource?: string
    description?: string
  }): Promise<PermissionDto>
  updatePermission(
    permissionId: string,
    data: { name?: string; guard_name?: string; resource?: string; description?: string },
  ): Promise<PermissionDto>
  deletePermission(permissionId: string): Promise<void>
}

export interface IPermissionChecker {
  checkPermission(request: CheckPermissionRequest): Promise<CheckPermissionResponse>
}

export interface IUserRoleManager {
  assignRoleToUser(data: { user_id: number; role_id: number }): Promise<void>
  removeRoleFromUser(userId: number, roleId: number): Promise<void>
  getUserRoles(userId: number): Promise<RoleDto[]>
}

export interface IAuthorizationFacade {
  role: IRoleReader & IRoleWriter & IRolePermissionManager
  permission: IPermissionReader & IPermissionWriter
  userRole: IUserRoleManager
  checkPermission: IPermissionChecker['checkPermission']
}
