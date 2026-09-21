import { secureTokenManager } from '@cap/platform-core'

/**
 * Server-Sent Events over `fetch`, rather than the browser's `EventSource`.
 *
 * `EventSource` cannot set request headers. Every SSE endpoint in this
 * platform sits behind `middleware.auth({ guards: ['api', 'web'] })`, and the
 * SPA authenticates with a bearer access token held in memory — never a
 * cookie the browser would attach on its own. An `EventSource` against
 * `/api/admin/events/stream` therefore answers 401 before a single event is
 * delivered, which is why streams appeared to "connect and go quiet".
 *
 * Reading the response body as a stream lets us send `Authorization` like any
 * other request. The wire format is unchanged, so backends need no edits.
 */

export interface SseStreamHandlers {
  /** One decoded `data:` payload. Parsing is the caller's job. */
  onMessage: (raw: string) => void
  onOpen?: () => void
  /** Transport failed or the server closed the stream. */
  onError?: (error: Error) => void
}

export interface SseStreamOptions extends SseStreamHandlers {
  url: string
  signal: AbortSignal
}

/** Thrown when the server rejects the stream request outright. */
export class SseHttpError extends Error {
  constructor(readonly status: number) {
    super(`SSE stream refused with status ${status}`)
    this.name = 'SseHttpError'
  }
}

/**
 * Open a stream and pump events until `signal` aborts or the server ends it.
 *
 * Resolves when the stream closes cleanly; rejects on transport or HTTP
 * failure so callers can decide between retrying and falling back to polling.
 */
export async function openSseStream({
  url,
  signal,
  onMessage,
  onOpen,
  onError,
}: SseStreamOptions): Promise<void> {
  try {
    const token = secureTokenManager.getAccessToken()
    const response = await fetch(url, {
      method: 'GET',
      signal,
      credentials: 'include',
      headers: {
        Accept: 'text/event-stream',
        // [SECURITY] The token travels in a header, never as a query
        // parameter: a URL lands in server logs, proxy logs and referrers,
        // which is exactly where a bearer credential must not be.
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok || !response.body) {
      throw new SseHttpError(response.status)
    }

    onOpen?.()

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // Events are separated by a blank line; anything after the last one is
      // a partial event that has to wait for the next chunk.
      const frames = buffer.split('\n\n')
      buffer = frames.pop() ?? ''

      for (const frame of frames) {
        const data = frame
          .split('\n')
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trim())
          .join('\n')

        // Keepalive comments (`: keepalive …`) carry no data line — they keep
        // the connection warm and are not events.
        if (data) onMessage(data)
      }
    }
  } catch (error) {
    // An abort is this hook's own teardown, not a failure worth reporting.
    if (signal.aborted) return
    const normalized = error instanceof Error ? error : new Error(String(error))
    onError?.(normalized)
    throw normalized
  }
}
