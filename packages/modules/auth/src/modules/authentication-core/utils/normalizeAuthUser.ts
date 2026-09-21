import type { IAuth } from '@cap/shared-types'

export interface NormalizedUser {
  id?: string | number
  userId?: string | number
  sub?: string | number
  email?: string
  name?: string
  role?: string | number
  roleName?: string
  roles?: string[]
  roleObject?: { name?: string; permissions?: (string | { name?: string })[] }
  permissions?: string[]
  tenantId?: string
  activeTenantId?: string
  organizationId?: string | number
  [key: string]: unknown
}

type LooseRecord = Record<string, unknown>

const isRecord = (value: unknown): value is LooseRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** A permission arrives either as a bare string or as `{ name }`. */
const permissionName = (p: unknown): string | undefined => {
  if (typeof p === 'string') return p
  if (isRecord(p) && typeof p.name === 'string') return p.name
  return undefined
}

const toPermissionList = (list: unknown[]): string[] =>
  list.map(permissionName).filter((p): p is string => typeof p === 'string' && p.length > 0)

/**
 * The layout's role checks compare a single numeric `role`. Some payloads carry
 * the role as an object (`{ id, name }`) and others as a numeric string, so the
 * object is kept as `roleObject`/`roleName` and `role` collapses to its id.
 * Mutates and returns the same object so call sites can keep their reference.
 */
export function coerceSessionRole<TUser extends object>(user: TUser): TUser {
  const target = user as LooseRecord
  const role = target.role
  if (isRecord(role)) {
    target.roleObject = role
    target.roleName = role.name
    target.role = role.id
  }
  if (typeof target.role === 'string' && !Number.isNaN(Number(target.role))) {
    target.role = Number(target.role)
  }
  return user
}

/**
 * The global app store types its user as `IAuth`; the session payloads this
 * module normalises are a looser superset. This is the single place that
 * bridges the two, rather than an `as any` at every call site.
 */
export function toAppUser(user: NormalizedUser | null | undefined): IAuth | null {
  return (user ?? null) as unknown as IAuth | null
}

export function normalizeAuthUser<TUser = NormalizedUser>(rawUser: unknown): TUser | null {
  if (!rawUser || typeof rawUser !== 'object') return null

  let candidate: unknown = rawUser
  if (Array.isArray(candidate)) {
    candidate = candidate[0]
    if (!candidate || typeof candidate !== 'object') return null
  }
  if (!isRecord(candidate)) return null

  // Unwrap { user: ... } or { data: ... } wrappers
  const user: LooseRecord = isRecord(candidate.user) ? candidate.user : candidate

  // Determine role string cleanly
  let role: string | undefined = undefined
  if (typeof user.role === 'string') {
    role = user.role
  } else if (isRecord(user.role) && typeof user.role.name === 'string') {
    role = user.role.name
  } else if (typeof user.roleName === 'string') {
    role = user.roleName
  } else if (Array.isArray(user.roles) && user.roles.length > 0) {
    role = permissionName(user.roles[0])
  }

  // Determine permissions array
  let permissions: string[] = []
  if (Array.isArray(user.permissions)) {
    permissions = toPermissionList(user.permissions)
  } else if (isRecord(user.role) && Array.isArray(user.role.permissions)) {
    permissions = toPermissionList(user.role.permissions)
  }

  return {
    ...user,
    ...(role ? { role, roleName: role } : {}),
    ...(permissions.length > 0 ? { permissions } : {}),
  } as unknown as TUser
}
