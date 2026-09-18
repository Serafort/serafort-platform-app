/**
 * React Hook for Server-Sent Events (SSE)
 * Provides easy-to-use hooks for real-time server updates
 */
import React from 'react'
import { API_CONFIG } from '../config'

export interface SSEMessage<T = any> {
  event: string
  data: T
}

export interface SSEOptions {
  onOpen?: (event: Event) => void
  onError?: (event: Event) => void
  onClose?: () => void
  reconnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

export interface SSEHookReturn<T = any> {
  data: T | null
  error: string | null
  isConnected: boolean
  lastEvent: string | null
  close: () => void
  reconnect: () => void
}

/**
 * Generic SSE Hook
 *
 * @example
 * const { data, isConnected, error } = useSSE('/api/sse/scraping/123', {
 *   onOpen: () => console.log('Connected'),
 *   onError: (e) => console.error('Error:', e)
 * });
 */
export function useSSE<T = any>(endpoint: string, options: SSEOptions = {}): SSEHookReturn<T> {
  const {
    onOpen,
    onError,
    onClose,
    reconnect = true,
    reconnectInterval = 5173,
    maxReconnectAttempts = 5,
  } = options

  const [data, setData] = React.useState<T | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isConnected, setIsConnected] = React.useState(false)
  const [lastEvent, setLastEvent] = React.useState<string | null>(null)

  const eventSourceRef = React.useRef<EventSource | null>(null)
  const reconnectAttemptsRef = React.useRef(0)
  const reconnectTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined)

  const connectRef = React.useRef<() => void>(() => {})

  const connect = React.useCallback(() => {
    if (eventSourceRef.current) {
      return
    }

    try {
      const url = `${API_CONFIG.baseURL}${endpoint}`
      const eventSource = new EventSource(url, { withCredentials: true })

      eventSource.onopen = (event) => {
        setIsConnected(true)
        setError(null)
        reconnectAttemptsRef.current = 0
        onOpen?.(event)
      }

      eventSource.onerror = (event) => {
        setIsConnected(false)
        setError('Connection error')
        onError?.(event)

        if (reconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          reconnectTimeoutRef.current = setTimeout(() => {
            eventSource.close()
            eventSourceRef.current = null
            connectRef.current()
          }, reconnectInterval)
        } else {
          eventSource.close()
          eventSourceRef.current = null
        }
      }

      // Listen for all event types
      eventSource.addEventListener('connected', (e: MessageEvent) => {
        const parsedData = JSON.parse(e.data)
        setLastEvent('connected')
        setData(parsedData)
      })

      eventSource.addEventListener('progress', (e: MessageEvent) => {
        const parsedData = JSON.parse(e.data)
        setLastEvent('progress')
        setData(parsedData)
      })

      eventSource.addEventListener('status_change', (e: MessageEvent) => {
        const parsedData = JSON.parse(e.data)
        setLastEvent('status_change')
        setData(parsedData)
      })

      eventSource.addEventListener('complete', (e: MessageEvent) => {
        const parsedData = JSON.parse(e.data)
        setLastEvent('complete')
        setData(parsedData)
      })

      eventSource.addEventListener('result', (e: MessageEvent) => {
        const parsedData = JSON.parse(e.data)
        setLastEvent('result')
        setData(parsedData)
      })

      eventSource.addEventListener('error', (e: MessageEvent) => {
        const parsedData = JSON.parse(e.data)
        setLastEvent('error')
        setError(parsedData.message || 'Unknown error')
        setData(parsedData)
      })

      eventSource.addEventListener('heartbeat', () => {
        // Just keep connection alive, no state update needed
      })

      eventSourceRef.current = eventSource
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
      setIsConnected(false)
    }
  }, [endpoint, onOpen, onError, reconnect, reconnectInterval, maxReconnectAttempts])

  // Update ref
  React.useEffect(() => {
    connectRef.current = connect
  }, [connect])

  const disconnect = React.useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
      setIsConnected(false)
      onClose?.()
    }
  }, [onClose])

  const reconnectManually = React.useCallback(() => {
    disconnect()
    reconnectAttemptsRef.current = 0
    connect()
  }, [connect, disconnect])

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    data,
    error,
    isConnected,
    lastEvent,
    close: disconnect,
    reconnect: reconnectManually,
  }
}

/**
 * Hook for Scraping Progress
 *
 * @example
 * const { progress, status, isComplete } = useScrapingProgress(sessionId);
 */
export interface ScrapingProgressData {
  session_id: number
  jobs_scraped: number
  total_jobs: number
  progress: number
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped'
  completed_at?: string
}

export function useScrapingProgress(sessionId: number | null) {
  const endpoint = sessionId ? `/api/sse/scraping/${sessionId}` : ''
  const { data, error, isConnected, lastEvent, close } = useSSE<ScrapingProgressData>(endpoint, {
    reconnect: true,
    maxReconnectAttempts: 10,
  })

  const isComplete = lastEvent === 'complete' || data?.status === 'completed'
  const isFailed = data?.status === 'failed'
  const isStopped = data?.status === 'stopped'

  // Auto-close connection when complete
  React.useEffect(() => {
    if (isComplete || isFailed || isStopped) {
      const timer = setTimeout(() => {
        close()
      }, 2000) // Keep open for 2 seconds to show final state

      return () => clearTimeout(timer)
    }
  }, [isComplete, isFailed, isStopped, close])

  return {
    progress: data?.progress || 0,
    jobsScraped: data?.jobs_scraped || 0,
    totalJobs: data?.total_jobs || 0,
    status: data?.status || 'pending',
    isComplete,
    isFailed,
    isStopped,
    isConnected,
    error,
    data,
  }
}

/**
 * Hook for Resume Analysis Progress
 *
 * @example
 * const { stage, progress, result } = useAnalysisProgress(analysisId);
 */
export interface AnalysisProgressData {
  analysis_id: number
  stage: 'parsing' | 'extracting' | 'matching' | 'scoring' | 'complete'
  progress: number
  step?: string
  message?: string
}

export interface AnalysisResult {
  analysis_id: number
  resume_summary: {
    total_skills: number
    years_experience: number
    education_count: number
    certifications_count: number
  }
  top_roles: Array<{
    role_title: string
    overall_score: number
    matched_skills: string[]
    missing_skills: string[]
  }>
}

export function useAnalysisProgress(analysisId: number | null) {
  const endpoint = analysisId ? `/api/sse/analysis/${analysisId}` : ''
  const [result, setResult] = React.useState<AnalysisResult | null>(null)

  const { data, error, isConnected, lastEvent, close } = useSSE<
    AnalysisProgressData | AnalysisResult
  >(endpoint, {
    reconnect: true,
    maxReconnectAttempts: 10,
  })

  // Extract result when available
  React.useEffect(() => {
    if (lastEvent === 'result' && data && 'top_roles' in data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResult(data as AnalysisResult)
    }
  }, [lastEvent, data])

  const isComplete = lastEvent === 'result' || lastEvent === 'complete'
  const progressData =
    !isComplete && data && 'stage' in data ? (data as AnalysisProgressData) : null

  // Auto-close connection when complete
  React.useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        close()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isComplete, close])

  return {
    stage: progressData?.stage || 'pending',
    progress: progressData?.progress || 0,
    step: progressData?.step,
    message: progressData?.message,
    result,
    isComplete,
    isConnected,
    error,
    data,
  }
}
