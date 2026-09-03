import authenticationService from "../../modules/authentication-core/services/auth.service"
import { authorizationService } from "../../modules/authorization-engine/src/services/authorization.service"
import type { ILogin, IForgetPassword, IResetPassword, FetchResponse } from '@cap/platform-core'

export interface VerifyEmailRequest { token: string; email?: string }
export interface ResendVerificationRequest { email: string }
import type {
  RoleDto,
  PermissionDto,
  CheckPermissionRequest,
  CheckPermissionResponse,
} from "../../modules/authorization-engine/src/dtos/authorization.dto"

export interface IIdaasFacade {
  auth: {
    login: (request: ILogin) => Promise<FetchResponse>
    refreshToken: () => Promise<FetchResponse>
    logout: () => Promise<FetchResponse>
    forgotPassword: (request: IForgetPassword) => Promise<FetchResponse>
    resetPassword: (request: IResetPassword) => Promise<FetchResponse>
    verifyEmail: (request: VerifyEmailRequest) => Promise<FetchResponse>
    resendVerification: (request: ResendVerificationRequest) => Promise<FetchResponse>
  }
  rbac: {
    listRoles: (params?: {
      page?: number
      limit?: number
      search?: string
    }) => Promise<{ roles: RoleDto[]; total: number }>
    getRole: (roleId: number) => Promise<RoleDto>
    createRole: (data: {
      name: string
      guard_name?: string
      description?: string
    }) => Promise<RoleDto>
    updateRole: (roleId: number, data: { name?: string; description?: string }) => Promise<RoleDto>
    deleteRole: (roleId: number) => Promise<void>
    listPermissions: () => Promise<PermissionDto[]>
    checkPermission: (request: CheckPermissionRequest) => Promise<CheckPermissionResponse>
    getRolePermissions: (roleId: number) => Promise<PermissionDto[]>
    syncRolePermissions: (roleId: number, permissionIds: number[]) => Promise<RoleDto>
    assignRoleToUser: (data: { user_id: number; role_id: number }) => Promise<void>
    getUserRoles: (userId: number) => Promise<RoleDto[]>
  }
}

class IdaasFacadeImpl implements IIdaasFacade {
  auth = {
    login: (request: ILogin) => authenticationService.signin(request),
    refreshToken: () => authenticationService.refreshToken(),
    logout: () => authenticationService.signout(),
    forgotPassword: (request: IForgetPassword) =>
      authenticationService.forgotPassword(request),
    resetPassword: (request: IResetPassword) => authenticationService.resetPassword(request),
    verifyEmail: (request: VerifyEmailRequest) =>
      authenticationService.verifyEmail(request.email || '', request.token),
    resendVerification: (request: ResendVerificationRequest) =>
      authenticationService.resendVerification(request.email),
  }

  rbac = {
    listRoles: (params?: { page?: number; limit?: number; search?: string }) =>
      authorizationService.role.listRoles(params),
    getRole: (roleId: number) => authorizationService.role.getRole(roleId),
    createRole: (data: { name: string; guard_name?: string; description?: string }) =>
      authorizationService.role.createRole(data),
    updateRole: (roleId: number, data: { name?: string; description?: string }) =>
      authorizationService.role.updateRole(roleId, data),
    deleteRole: (roleId: number) => authorizationService.role.deleteRole(roleId),
    listPermissions: () => authorizationService.permission.listPermissions(),
    checkPermission: (request: CheckPermissionRequest) =>
      authorizationService.checkPermission(request),
    getRolePermissions: (roleId: number) => authorizationService.role.getRolePermissions(roleId),
    syncRolePermissions: (roleId: number, permissionIds: number[]) =>
      authorizationService.role.syncRolePermissions(roleId, permissionIds),
    assignRoleToUser: (data: { user_id: number; role_id: number }) =>
      authorizationService.userRole.assignRoleToUser(data),
    getUserRoles: (userId: number) => authorizationService.userRole.getUserRoles(userId),
  }
}

export const idaasFacade = new IdaasFacadeImpl()

export type { IIdaasFacade as IdaasFacade }
