// Shared loose-shape helpers for HTTP payloads whose backend contract is not
// (yet) modelled by a dedicated DTO. Prefer a named DTO where one exists; these
// exist so that no `any` leaks into the module.

/** A JSON object of unknown shape (response bodies, metadata bags). */
export type ApiRecord = Record<string, unknown>

/** Payload of endpoints that return an acknowledgement / untyped body. */
export type ApiPayload = ApiRecord | ApiRecord[] | null | undefined

/** Narrow an unknown thrown value into a display message. */
export function getErrorMessage(err: unknown, fallback = ''): string {
  if (typeof err === 'string') return err || fallback
  if (err && typeof err === 'object') {
    const e = err as { message?: unknown; response?: { data?: { message?: unknown } } }
    const fromResponse = e.response?.data?.message
    if (typeof fromResponse === 'string' && fromResponse) return fromResponse
    if (typeof e.message === 'string' && e.message) return e.message
  }
  return fallback
}

/** Like {@link getErrorMessage} but only reads `err.message` (no response body). */
export function getPlainErrorMessage(err: unknown, fallback = ''): string {
  if (typeof err === 'string') return err || fallback
  if (err && typeof err === 'object') {
    const m = (err as { message?: unknown }).message
    if (typeof m === 'string' && m) return m
  }
  return fallback
}
