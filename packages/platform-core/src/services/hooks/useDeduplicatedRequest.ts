import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchClient, FetchRequestConfig, FetchResponse, HttpError, requestDeduplicator } from '@cap/platform-store'

interface UseDeduplicatedRequestOptions<T> extends FetchRequestConfig {
  /**
   * Enable automatic request on mount
   * Default: true
   */
  enabled?: boolean

  /**
   * Callback on success
   */
  onSuccess?: (data: T) => void

  /**
   * Callback on error
   */
  onError?: (error: HttpError) => void

  /**
   * Refetch interval in milliseconds
   * Default: undefined (no auto-refetch)
   */
  refetchInterval?: number

  /**
   * Force deduplication even for non-GET requests
   */
  forceDeduplication?: boolean
}

interface UseDeduplicatedRequestResult<T> {
  data: T | null
  loading: boolean
  error: HttpError | null
  refetch: () => Promise<void>
  cancel: () => void
}

function useDeduplicatedRequest<T = any>(
  url: string,
  options: UseDeduplicatedRequestOptions<T> = {},
): UseDeduplicatedRequestResult<T> {
  const {
    enabled = true,
    onSuccess,
    onError,
    refetchInterval,
    forceDeduplication = false,
    ...fetchConfig
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(enabled)
  const [error, setError] = useState<HttpError | null>(null)

  const isMountedRef = useRef(true)
  const refetchIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const config: FetchRequestConfig & { url: string } = {
    url,
    method: 'GET',
    ...fetchConfig,
    headers: {
      ...fetchConfig.headers,
      ...(forceDeduplication && { 'X-Deduplicate': 'true' }),
    },
  }

  const configKey = JSON.stringify(config)

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const fetchData = useCallback(async () => {
    if (!isMountedRef.current) return

    setLoading(true)
    setError(null)

    try {
      // Need to cast the executor to match expected signature if needed, or ensure verify logic matches
      const response: FetchResponse<T> = await requestDeduplicator.deduplicateRequest(
        config,
        // We use a shim to call fetchClient.get/request with the config
        (deduplicatedConfig) => {
          // Extract url from config if it exists, otherwise use the closure 'url'
          // The deduplicator passes back the config it was given.
          // Our FetchClient methods usually take (url, config).
          // Since we attached 'url' to our config object for deduplication, we can use it, or the original url.
          const requestUrl = (deduplicatedConfig as any).url || url
          // We need to remove 'url' from config before passing to fetchClient if fetchClient doesn't expect it in config (it just ignores extra props usually)
          return fetchClient.get<T>(requestUrl, deduplicatedConfig)
        },
      )

      if (isMountedRef.current) {
        setData(response.data)
        setLoading(false)
        onSuccess?.(response.data)
      }
    } catch (err) {
      if (isMountedRef.current) {
        const httpError = err as HttpError
        setError(httpError)
        setLoading(false)
        onError?.(httpError)
      }
    }
  }, [url, configKey])

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const cancel = useCallback(() => {
    requestDeduplicator.cancelRequest(config)
  }, [configKey])

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchData()
    }

    return () => {
      isMountedRef.current = false
      if (refetchIntervalRef.current) {
        clearInterval(refetchIntervalRef.current)
      }
    }
  }, [enabled, fetchData])

  // Setup refetch interval
  useEffect(() => {
    if (refetchInterval && enabled) {
      refetchIntervalRef.current = setInterval(() => {
        fetchData()
      }, refetchInterval)

      return () => {
        if (refetchIntervalRef.current) {
          clearInterval(refetchIntervalRef.current)
        }
      }
    }
  }, [refetchInterval, enabled, fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    cancel,
  }
}

/**
 * Hook for making a deduplicated mutation request (POST, PUT, DELETE, etc.)
 */
function useDeduplicatedMutation<TData = any, TVariables = any>(
  options: Omit<UseDeduplicatedRequestOptions<TData>, 'enabled'> = {},
) {
  const [data, setData] = useState<TData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<HttpError | null>(null)

  const { onSuccess, onError, forceDeduplication = false, ...fetchConfig } = options

  const fetchConfigKey = JSON.stringify(fetchConfig)

  const mutate = useCallback(
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    async (url: string, variables?: TVariables): Promise<TData | null> => {
      setLoading(true)
      setError(null)

      const config: FetchRequestConfig & { url: string } = {
        url,
        method: 'POST',
        data: variables,
        ...fetchConfig,
        headers: {
          ...fetchConfig.headers,
          ...(forceDeduplication && { 'X-Deduplicate': 'true' }),
        },
      }

      try {
        const response: FetchResponse<TData> = await requestDeduplicator.deduplicateRequest(
          config,
          (deduplicatedConfig) => {
            const requestUrl = (deduplicatedConfig as any).url || url
            return fetchClient.request(requestUrl, deduplicatedConfig)
          },
        )

        setData(response.data)
        setLoading(false)
        onSuccess?.(response.data)
        return response.data
      } catch (err) {
        const httpError = err as HttpError
        setError(httpError)
        setLoading(false)
        onError?.(httpError)
        return null
      }
    },
    [fetchConfigKey, forceDeduplication, onSuccess, onError],
  )

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    mutate,
    reset,
  }
}

export default useDeduplicatedRequest
export { useDeduplicatedMutation }
