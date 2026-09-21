/**
 * The sign-in flow's mutations reject with an Axios-style error. Typing every
 * `onError` handler as `(error: any)` let unrelated property typos compile and
 * made the handlers hard to read. `parseAuthRequestError` narrows an unknown
 * rejection to just the fields the flow acts on, without pulling axios' types
 * into this module.
 */
export interface AuthRequestError {
  /** DOMException name for WebAuthn failures, e.g. `'NotAllowedError'`. */
  name?: string
  /** Client-side error message (network failure, aborted ceremony). */
  message?: string
  /** HTTP status of the failed response, when there was one. */
  status?: number
  /** Parsed `Retry-After` header (seconds) on a 423 lockout response. */
  retryAfterSeconds?: number
  /** Remaining sign-in attempts before lockout, from a 401 body. */
  attemptsRemaining?: number
  /** RFC 7807 `detail` field from the response body. */
  detail?: string
  /** Free-form `message` field from the response body. */
  serverMessage?: string
  /** Machine-readable `error` code from the response body, e.g. `'invalid_user_code'`. */
  errorCode?: string
}

interface AxiosLikeError {
  name?: unknown
  message?: unknown
  response?: {
    status?: unknown
    headers?: Record<string, unknown>
    data?: {
      detail?: unknown
      message?: unknown
      error?: unknown
      attemptsRemaining?: unknown
    }
  }
}

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined

const asNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    return Number.isNaN(parsed) ? undefined : parsed
  }
  return undefined
}

export const parseAuthRequestError = (error: unknown): AuthRequestError => {
  const source = (error ?? {}) as AxiosLikeError
  const body = source.response?.data ?? {}

  return {
    name: asString(source.name),
    message: asString(source.message),
    status: asNumber(source.response?.status),
    retryAfterSeconds: asNumber(source.response?.headers?.['retry-after']),
    attemptsRemaining: asNumber(body.attemptsRemaining),
    detail: asString(body.detail),
    serverMessage: asString(body.message),
    errorCode: asString(body.error),
  }
}
