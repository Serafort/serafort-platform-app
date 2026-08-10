import { PolicySubject } from '../types/policy.types'
import { normalizeRole, hasAdminRole } from '@cap/shared-types'

/**
 * Normalizes user state from `@cap/platform-store` into a standardized `PolicySubject`.
 */
export function buildSubject(userRaw: any): PolicySubject | null {
  if (!userRaw) return null

  const user = userRaw.user || userRaw

  const role = normalizeRole(user.role) || normalizeRole(user.roleObject) || normalizeRole(user.roleName)

  const roles: string[] = []
  if (role) roles.push(role)

  // Super admin implicit role addition if admin role is detected
  if (hasAdminRole(role) && !roles.includes('admin')) roles.push('admin')

  const permissions: string[] = Array.isArray(user.permissions) ? user.permissions : []

  const attributes: Record<string, unknown> = {
    ...(user.metadata || {}),
    email: user.email,
    status: user.status,
    orgId: user.organizationId || user.orgId || user.roleObject?.organizationId,
  }

  return {
    id: user.id ?? 'anonymous',
    roles,
    permissions,
    attributes,
  }
}
