export interface NormalizedUser {
  id?: string | number
  userId?: string | number
  sub?: string | number
  email?: string
  name?: string
  role?: string
  roleName?: string
  roles?: string[]
  roleObject?: { name?: string; permissions?: (string | { name?: string })[] }
  permissions?: string[]
  tenantId?: string
  activeTenantId?: string
  organizationId?: string | number
  [key: string]: any
}

export function normalizeAuthUser<TUser = NormalizedUser>(rawUser: unknown): TUser | null {
  if (!rawUser || typeof rawUser !== 'object') return null

  let candidate: any = rawUser
  if (Array.isArray(candidate)) {
    candidate = candidate[0]
    if (!candidate || typeof candidate !== 'object') return null
  }

  // Unwrap { user: ... } or { data: ... } wrappers
  const user = candidate.user && typeof candidate.user === 'object' ? candidate.user : candidate

  // Determine role string cleanly
  let role: string | undefined = undefined
  if (typeof user.role === 'string') {
    role = user.role
  } else if (user.role && typeof user.role === 'object' && typeof user.role.name === 'string') {
    role = user.role.name
  } else if (typeof user.roleName === 'string') {
    role = user.roleName
  } else if (Array.isArray(user.roles) && user.roles.length > 0) {
    const firstRole = user.roles[0]
    role = typeof firstRole === 'string' ? firstRole : firstRole?.name
  }

  // Determine permissions array
  let permissions: string[] = []
  if (Array.isArray(user.permissions)) {
    permissions = user.permissions
      .map((p: any) => (typeof p === 'string' ? p : p?.name))
      .filter((p: any): p is string => typeof p === 'string' && p.length > 0)
  } else if (user.role && typeof user.role === 'object' && Array.isArray(user.role.permissions)) {
    permissions = user.role.permissions
      .map((p: any) => (typeof p === 'string' ? p : p?.name))
      .filter((p: any): p is string => typeof p === 'string' && p.length > 0)
  }

  return {
    ...user,
    ...(role ? { role, roleName: role } : {}),
    ...(permissions.length > 0 ? { permissions } : {}),
  } as TUser
}
