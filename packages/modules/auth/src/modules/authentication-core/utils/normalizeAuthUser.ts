export function normalizeAuthUser<TUser = any>(rawUser: unknown): TUser | null {
  if (!rawUser) return null

  const value: any = rawUser as any

  if (Array.isArray(value)) {
    const first = value[0]
    if (!first) return null
    return (first.user ?? first) as TUser
  }

  return (value.user ?? value) as TUser
}
