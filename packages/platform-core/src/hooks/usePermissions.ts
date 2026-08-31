import { useAppStore } from '@cap/platform-store'
import { hasAdminRole, normalizeRole, Roles } from '@cap/shared-types/auth'
import { useAbility } from '@cap/authorization'

export const usePermissions = () => {
  const user = useAppStore((state) => state.user)
  const isAuthenticated = useAppStore((state) => state.isAuthenticated)
  const { can } = useAbility()

  /**
   * Check if the currently authenticated user has ALL of the specified roles
   * @param roles Single role enum or array of role enums
   * @param logic 'AND' (default) requires all roles, 'OR' requires at least one
   */
  const hasRole = (roles: Roles | Roles[] | string | string[], logic: 'AND' | 'OR' = 'OR'): boolean => {
    if (!isAuthenticated || !user) return false

    const userData = (user as any).user || user
    const userRole =
      normalizeRole(userData.role) ||
      normalizeRole(userData.roleId) ||
      normalizeRole(userData.role_id) ||
      normalizeRole(userData.roleObject) ||
      normalizeRole(userData.roleName) ||
      normalizeRole(userData.role_name)

    if (!userRole) {
      if (userData.isAdmin || (user as any).isAdmin) return true
      return false
    }

    const rolesArray = (Array.isArray(roles) ? roles : [roles])
      .map((role) => normalizeRole(role))
      .filter(Boolean) as string[]

    if (hasAdminRole(userRole)) {
      return true
    }

    // Evaluate via authorization policy engine
    const isPermitted = can('access', {
      type: 'role',
      attributes: { roles: rolesArray, logic, userRole },
    })

    if (isPermitted) return true

    if (logic === 'OR') {
      return rolesArray.includes(userRole)
    }

    return rolesArray.every((role) => userRole === role)
  }

  /**
   * Check if the currently authenticated user has specific string-based permissions
   * @param permissions Single permission string or array of permission strings
   * @param logic 'AND' (default) requires all permissions, 'OR' requires at least one
   */
  const hasPermission = (permissions: string | string[], logic: 'AND' | 'OR' = 'AND'): boolean => {
    if (!isAuthenticated || !user) return false

    const userData = (user as any).user || user

    const userPermissions: string[] = Array.isArray(userData.permissions)
      ? userData.permissions
      : []

    if (userPermissions.length === 0) {
      if (
        hasAdminRole(userData.role) ||
        hasAdminRole(userData.roleId) ||
        hasAdminRole(userData.role_id) ||
        hasAdminRole(userData.roleObject) ||
        hasAdminRole(userData.roleName) ||
        hasAdminRole(userData.role_name) ||
        userData.isAdmin ||
        (user as any).isAdmin
      )
        return true
      return false
    }

    const permsArray = Array.isArray(permissions) ? permissions : [permissions]

    // Evaluate via policy engine first
    const isPermitted = can('access', {
      type: 'permission',
      attributes: { permissions: permsArray, logic },
    })

    if (isPermitted) return true

    if (logic === 'OR') {
      return permsArray.some((perm) => userPermissions.includes(perm))
    }

    return permsArray.every((perm) => userPermissions.includes(perm))
  }

  return { hasRole, hasPermission, can }
}
