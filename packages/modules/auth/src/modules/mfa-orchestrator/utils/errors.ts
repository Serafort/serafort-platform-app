/**
 * Narrowing helpers for `catch (err: unknown)`.
 *
 * Errors reaching the auth screens come from three places: the browser
 * (`DOMException` from WebAuthn), `apiClient` (an `HttpError` carrying
 * `status` and, on some paths, a `response.data` envelope) and plain `Error`.
 * These helpers read the union of those shapes without ever assuming one.
 */
interface ErrorLike {
  name?: unknown
  message?: unknown
  status?: unknown
  response?: { status?: unknown; data?: { message?: unknown; error?: unknown } }
}

const asErrorLike = (err: unknown): ErrorLike =>
  typeof err === 'object' && err !== null ? (err as ErrorLike) : {}

const asText = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined

/** `DOMException.name` / `Error.name`, e.g. `NotAllowedError`. */
export function errorName(err: unknown): string | undefined {
  return asText(asErrorLike(err).name)
}

/** HTTP status, whether it sits on the error or on its `response`. */
export function errorStatus(err: unknown): number | undefined {
  const e = asErrorLike(err)
  const status = e.status ?? e.response?.status
  return typeof status === 'number' ? status : undefined
}

/** The server's own message when there is one (`response.data`), else `undefined`. */
export function serverMessage(err: unknown): string | undefined {
  const data = asErrorLike(err).response?.data
  return asText(data?.message) ?? asText(data?.error)
}

/** Server message, then `Error.message`, then `undefined`. */
export function errorMessage(err: unknown): string | undefined {
  return serverMessage(err) ?? asText(asErrorLike(err).message)
}
