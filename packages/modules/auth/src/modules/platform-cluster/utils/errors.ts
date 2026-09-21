/**
 * Narrowing helpers for `catch (err: unknown)` and mutation `onError` callbacks.
 *
 * The API client rejects with axios-style errors (`response.status`,
 * `response.data`, `message`), but nothing guarantees that shape, so every
 * read goes through these guards instead of an `any` annotation.
 */

interface ErrorResponseLike {
  status?: number
  data?: unknown
}

interface ErrorLike {
  message?: unknown
  response?: ErrorResponseLike
}

const asErrorLike = (err: unknown): ErrorLike =>
  typeof err === 'object' && err !== null ? (err as ErrorLike) : {}

/** The human-readable message of a rejected value, when it carries one. */
export const getErrorMessage = (err: unknown): string | undefined => {
  if (typeof err === 'string') return err || undefined
  const { message } = asErrorLike(err)
  return typeof message === 'string' && message ? message : undefined
}

/** The HTTP status of a rejected request, when the failure had a response. */
export const getErrorStatus = (err: unknown): number | undefined => {
  const status = asErrorLike(err).response?.status
  return typeof status === 'number' ? status : undefined
}

/** The response body of a rejected request, when the failure had a response. */
export const getErrorResponseData = (err: unknown): unknown => asErrorLike(err).response?.data

/** Coerce anything thrown into a real `Error` (for state typed `Error | null`). */
export const toError = (err: unknown): Error =>
  err instanceof Error ? err : new Error(getErrorMessage(err) ?? 'Unknown error')

/**
 * List endpoints answer either a bare array or a `{ data: [...] }` envelope.
 * Returns the rows in both cases, and `[]` for anything else.
 */
export const extractRows = <T = Record<string, unknown>>(raw: unknown): T[] => {
  if (Array.isArray(raw)) return raw as T[]
  if (typeof raw === 'object' && raw !== null) {
    const inner = (raw as { data?: unknown }).data
    if (Array.isArray(inner)) return inner as T[]
  }
  return []
}
