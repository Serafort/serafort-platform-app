import { useState, useEffect, useRef, useCallback } from 'react'
import adminMonitoringService, { AuditLogItem } from '../services/admin-monitoring.service'

export interface LiveAuthEvent {
  id: string | number
  type: string
  action: string
  actor: string
  ipAddress?: string
  userAgent?: string
  status: 'success' | 'failure' | 'warning' | 'locked' | string
  severity?: 'info' | 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  metadata?: Record<string, any>
  city?: string
  country?: string
}

export type StreamConnectionStatus =
  | 'connected'
  | 'connecting'
  | 'fallback_polling'
  | 'disconnected'
  | 'paused'

export interface UseAuthEventsStreamOptions {
  endpoint?: string
  maxBufferSize?: number
  enableFallbackPolling?: boolean
  pollingIntervalMs?: number
  batchIntervalMs?: number
  autoConnect?: boolean
}

export function useAuthEventsStream(options: UseAuthEventsStreamOptions = {}) {
  const {
    endpoint = '/api/admin/events/stream',
    maxBufferSize = 500,
    enableFallbackPolling = true,
    pollingIntervalMs = 5000,
    batchIntervalMs = 100,
    autoConnect = true,
  } = options

  const [events, setEvents] = useState<LiveAuthEvent[]>([])
  const [status, setStatus] = useState<StreamConnectionStatus>('disconnected')
  const [isPaused, setIsPaused] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const eventSourceRef = useRef<EventSource | null>(null)
  const pendingBufferRef = useRef<LiveAuthEvent[]>([])
  const batchTimerRef = useRef<any>(null)
  const pollingTimerRef = useRef<any>(null)
  const isPausedRef = useRef(isPaused)
  isPausedRef.current = isPaused

  // Flush buffer to state in micro-batches
  const flushBuffer = useCallback(() => {
    if (pendingBufferRef.current.length === 0) return
    const newItems = [...pendingBufferRef.current]
    pendingBufferRef.current = []

    setEvents((prev) => {
      const combined = [...newItems, ...prev]
      // Deduplicate by ID
      const seen = new Set<string | number>()
      const deduped: LiveAuthEvent[] = []
      for (const item of combined) {
        if (!seen.has(item.id)) {
          seen.add(item.id)
          deduped.push(item)
        }
      }
      return deduped.slice(0, maxBufferSize)
    })
  }, [maxBufferSize])

  const scheduleFlush = useCallback(() => {
    if (batchTimerRef.current) return
    batchTimerRef.current = setTimeout(() => {
      batchTimerRef.current = null
      flushBuffer()
    }, batchIntervalMs)
  }, [batchIntervalMs, flushBuffer])

  // Ingest incoming event
  const ingestEvent = useCallback(
    (event: LiveAuthEvent) => {
      if (isPausedRef.current) return
      pendingBufferRef.current.push(event)
      scheduleFlush()
    },
    [scheduleFlush],
  )

  // Fallback polling loop
  const startFallbackPolling = useCallback(() => {
    if (!enableFallbackPolling || pollingTimerRef.current) return
    setStatus('fallback_polling')

    const poll = async () => {
      if (isPausedRef.current) return
      try {
        const res = await adminMonitoringService.getAuditLogs({ limit: 20 })
        const raw = res.data
        const list: AuditLogItem[] = Array.isArray(raw) ? raw : (raw as any)?.data || []
        list.forEach((item) => {
          ingestEvent({
            id: item.id,
            type: 'audit_log',
            action: item.action || 'auth_event',
            actor: item.actor || 'system',
            ipAddress: item.ipAddress,
            userAgent: item.userAgent,
            status: item.status,
            severity: item.severity,
            timestamp: item.timestamp || new Date().toISOString(),
            metadata: item.metadata,
            city: item.city,
            country: item.country,
          })
        })
      } catch (err: any) {
        setError(err)
      }
    }

    poll()
    pollingTimerRef.current = setInterval(poll, pollingIntervalMs)
  }, [enableFallbackPolling, pollingIntervalMs, ingestEvent])

  const stopFallbackPolling = useCallback(() => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current)
      pollingTimerRef.current = null
    }
  }, [])

  // Connect SSE
  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    stopFallbackPolling()
    setStatus('connecting')
    setError(null)

    try {
      const es = new EventSource(endpoint, { withCredentials: true })
      eventSourceRef.current = es

      es.onopen = () => {
        setStatus('connected')
        setError(null)
      }

      es.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data)
          if (parsed.type === 'connected') return
          ingestEvent({
            id: parsed.id || `event-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            type: parsed.type || 'auth_event',
            action: parsed.action || 'login',
            actor: parsed.actor || 'user',
            ipAddress: parsed.ipAddress,
            userAgent: parsed.userAgent,
            status: parsed.status || 'success',
            severity: parsed.severity || 'info',
            timestamp: parsed.timestamp || new Date().toISOString(),
            metadata: parsed.metadata,
          })
        } catch {
          // Ignore invalid parse
        }
      }

      es.onerror = () => {
        es.close()
        eventSourceRef.current = null
        startFallbackPolling()
      }
    } catch (err: any) {
      setError(err)
      startFallbackPolling()
    }
  }, [endpoint, ingestEvent, startFallbackPolling, stopFallbackPolling])

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    stopFallbackPolling()
    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current)
      batchTimerRef.current = null
    }
    setStatus('disconnected')
  }, [stopFallbackPolling])

  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      const next = !prev
      if (!next) {
        flushBuffer()
      }
      return next
    })
  }, [flushBuffer])

  const clearEvents = useCallback(() => {
    pendingBufferRef.current = []
    setEvents([])
  }, [])

  useEffect(() => {
    if (autoConnect) {
      connect()
    }
    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect])

  return {
    events,
    status: isPaused ? 'paused' : status,
    isPaused,
    error,
    connect,
    disconnect,
    togglePause,
    clearEvents,
    count: events.length,
  }
}

export default useAuthEventsStream
