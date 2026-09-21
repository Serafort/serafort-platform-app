import { useEffect, useState, useCallback, useRef } from 'react'
import { openSseStream } from '../utils/sseClient'

interface SSEOptions<TData> {
  onMessage?: (data: TData) => void
  onError?: (error: Error) => void
  onOpen?: () => void
  maxRetries?: number
  initialRetryInterval?: number
  enabled?: boolean
}

/**
 * A generic hook for subscribing to Server-Sent Events (SSE).
 * Handles connection management, automatic reconnection with exponential backoff,
 * and message parsing.
 *
 * The transport is `openSseStream` (fetch + `Authorization`) rather than
 * `EventSource`: these endpoints require a bearer token that `EventSource`
 * has no way to send, so it could only ever have received a 401.
 */
export function useSSESubscription<TData = unknown>(url: string, options: SSEOptions<TData> = {}) {
  const {
    onMessage,
    onError,
    onOpen,
    maxRetries = 3,
    initialRetryInterval = 1000,
    enabled = true,
  } = options

  const [data, setData] = useState<TData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [prevUrl, setPrevUrl] = useState(url)

  // Reset retry count during render if the URL changes
  if (url !== prevUrl) {
    setPrevUrl(url)
    setRetryCount(0)
  }

  const abortRef = useRef<AbortController | null>(null)
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Use refs for callbacks to avoid unnecessary re-connections if callbacks aren't memoized
  const onMessageRef = useRef(onMessage)
  const onErrorRef = useRef(onError)
  const onOpenRef = useRef(onOpen)

  useEffect(() => {
    onMessageRef.current = onMessage
    onErrorRef.current = onError
    onOpenRef.current = onOpen
  }, [onMessage, onError, onOpen])

  useEffect(() => {
    abortRef.current?.abort()
    abortRef.current = null

    if (!enabled) return

    const controller = new AbortController()
    abortRef.current = controller

    openSseStream({
      url,
      signal: controller.signal,
      onOpen: () => {
        setIsConnected(true)
        setError(null)
        setRetryCount(0)
        onOpenRef.current?.()
      },
      onMessage: (raw) => {
        try {
          const parsedData = JSON.parse(raw) as TData
          setData(parsedData)
          onMessageRef.current?.(parsedData)
        } catch (err) {
          console.error('Failed to parse SSE message', { error: err, rawData: raw })
        }
      },
      onError: (err) => {
        setIsConnected(false)
        setError(err)
        onErrorRef.current?.(err)
      },
    })
      .then(() => {
        // The server closed the stream. Treat it like any other drop so the
        // backoff below reconnects instead of leaving a dead subscription.
        if (controller.signal.aborted) return
        setIsConnected(false)
      })
      .catch(() => {
        // onError already reported it; the retry schedule is handled below.
      })
      .finally(() => {
        if (controller.signal.aborted) return
        if (retryCount < maxRetries) {
          const interval = initialRetryInterval * Math.pow(2, retryCount)
          retryTimeoutRef.current = setTimeout(() => {
            setRetryCount((prev) => prev + 1)
          }, interval)
        }
      })

    return () => {
      controller.abort()
      setIsConnected(false)
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [url, maxRetries, initialRetryInterval, retryCount, enabled])

  const close = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
    }
    setIsConnected(false)
  }, [])

  return { data, isConnected, error, close }
}
