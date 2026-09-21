/**
 * The Authentication service answers list endpoints in two shapes depending on
 * the route: a bare array, or a paginated envelope `{ data: T[], meta }`. This
 * narrows an untyped payload to the array in either case, and to `[]` otherwise.
 */
export function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const inner = (payload as { data: unknown }).data
    if (Array.isArray(inner)) return inner as T[]
  }
  return []
}

/** Reads `meta` off a paginated envelope, or `undefined` for a bare array. */
export function unwrapMeta<M extends object>(payload: unknown): M | undefined {
  if (payload && typeof payload === 'object' && !Array.isArray(payload) && 'meta' in payload) {
    const meta = (payload as { meta: unknown }).meta
    if (meta && typeof meta === 'object') return meta as M
  }
  return undefined
}
