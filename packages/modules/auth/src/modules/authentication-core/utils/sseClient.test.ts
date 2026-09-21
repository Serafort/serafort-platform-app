import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { openSseStream, SseHttpError } from './sseClient'

const { getAccessTokenMock } = vi.hoisted(() => ({
  getAccessTokenMock: vi.fn<() => string | null>(() => 'test-access-token'),
}))

vi.mock('@cap/platform-core', () => ({
  secureTokenManager: { getAccessToken: getAccessTokenMock },
}))

/** Serves `chunks` as a streaming response body. */
const streamResponse = (chunks: string[], init: { ok?: boolean; status?: number } = {}) => {
  const encoder = new TextEncoder()
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)))
      controller.close()
    },
  })
  return { ok: init.ok ?? true, status: init.status ?? 200, body } as unknown as Response
}

describe('openSseStream', () => {
  beforeEach(() => {
    getAccessTokenMock.mockReturnValue('test-access-token')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('sends the access token as a bearer header, never in the URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(streamResponse(['data: {"a":1}\n\n']))
    vi.stubGlobal('fetch', fetchMock)

    await openSseStream({
      url: '/api/admin/events/stream',
      signal: new AbortController().signal,
      onMessage: () => {},
    })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/admin/events/stream')
    expect(url).not.toContain('test-access-token')
    expect(init.headers.Authorization).toBe('Bearer test-access-token')
    expect(init.headers.Accept).toBe('text/event-stream')
  })

  it('omits the header entirely when no token is held', async () => {
    getAccessTokenMock.mockReturnValue(null)
    const fetchMock = vi.fn().mockResolvedValue(streamResponse([]))
    vi.stubGlobal('fetch', fetchMock)

    await openSseStream({
      url: '/stream',
      signal: new AbortController().signal,
      onMessage: () => {},
    })

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined()
  })

  it('emits one message per event frame', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        streamResponse(['data: {"id":1}\n\ndata: {"id":2}\n\n', 'data: {"id":3}\n\n']),
      ),
    )
    const messages: string[] = []

    await openSseStream({
      url: '/stream',
      signal: new AbortController().signal,
      onMessage: (raw) => messages.push(raw),
    })

    expect(messages).toEqual(['{"id":1}', '{"id":2}', '{"id":3}'])
  })

  it('reassembles a frame split across chunks', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(streamResponse(['data: {"half":', '"joined"}\n\n'])),
    )
    const messages: string[] = []

    await openSseStream({
      url: '/stream',
      signal: new AbortController().signal,
      onMessage: (raw) => messages.push(raw),
    })

    expect(messages).toEqual(['{"half":"joined"}'])
  })

  it('ignores keepalive comments', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(streamResponse([': keepalive 2026-01-01\n\n', 'data: {"real":true}\n\n'])),
    )
    const messages: string[] = []

    await openSseStream({
      url: '/stream',
      signal: new AbortController().signal,
      onMessage: (raw) => messages.push(raw),
    })

    expect(messages).toEqual(['{"real":true}'])
  })

  it('reports a refused stream so the caller can back off', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(streamResponse([], { ok: false, status: 401 })))
    const onError = vi.fn()

    await expect(
      openSseStream({
        url: '/stream',
        signal: new AbortController().signal,
        onMessage: () => {},
        onError,
      }),
    ).rejects.toBeInstanceOf(SseHttpError)

    expect(onError).toHaveBeenCalledOnce()
  })

  it('stays silent when the caller aborts', async () => {
    const controller = new AbortController()
    controller.abort()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('The operation was aborted')))
    const onError = vi.fn()

    await expect(
      openSseStream({
        url: '/stream',
        signal: controller.signal,
        onMessage: () => {},
        onError,
      }),
    ).resolves.toBeUndefined()

    expect(onError).not.toHaveBeenCalled()
  })
})
