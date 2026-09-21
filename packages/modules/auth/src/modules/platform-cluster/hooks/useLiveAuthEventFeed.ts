import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSSESubscription } from '../../authentication-core/hooks/useSSE'
import adminMonitoringService from '../services/admin-monitoring.service'
import { normalizeAuditLogRow, type AuditLogRow } from '../utils/normalizeAuditLog'
import { extractRows } from '../utils/errors'

/**
 * One authentication event as the monitor renders it.
 *
 * Every field here is something the server actually sends. The screen used to
 * carry a `latency` and a display `userName` that no endpoint produced, filled
 * from a client-side random generator; they are gone rather than faked.
 */
export interface LiveAuthEvent {
  id: string
  /** Epoch ms, so the row can be re-formatted in the viewer's locale. */
  receivedAt: number
  /** Server-reported event time, ISO 8601. */
  timestamp: string
  action: string
  actor: string
  kind: AuthEventKind
  /** Server-reported severity: how bad this is. */
  severity: string
  /** Server-reported outcome: whether it succeeded. Null when not reported. */
  status: string | null
  ip: string | null
  userAgent: string | null
  city: string | null
  country: string | null
  countryCode: string | null
  latitude: number | null
  longitude: number | null
  metadata: Record<string, unknown>
  /** The untouched server payload, for the detail panel's JSON view. */
  raw: Record<string, unknown>
}

export type AuthEventKind = 'success' | 'failed' | 'mfa' | 'refresh' | 'logout' | 'other'

export type FeedStatus = 'connecting' | 'live' | 'polling' | 'paused' | 'offline'

const MAX_EVENTS = 300
/** Trailing window the throughput figure is measured over. */
const THROUGHPUT_WINDOW_MS = 60_000

const FAILURE_PATTERN = /FAIL|DENIED|LOCK|SUSPEND|DISABL|INVALID|UNAUTHORIZED|BLOCK/
const FAILURE_STATUS_PATTERN = /^(FAILURE|FAILED|DENIED|ERROR|LOCKED|BLOCKED)$/
const LOGOUT_PATTERN = /LOGOUT|SIGN_?OUT|SESSION[._:\- ]?(END|EXPIR|REVOK)|REVOKE_?SESSION/
const MFA_PATTERN = /MFA|2FA|OTP|TOTP|CHALLENGE|VERIFY|PASSKEY|WEBAUTHN/
const REFRESH_PATTERN = /REFRESH|TOKEN|RENEW|ROTAT/
const SUCCESS_PATTERN = /SUCCESS|LOGIN|SIGN_?IN|AUTHENTICAT|GRANT|CREATED/

/**
 * Buckets a server event into the categories the filter chips offer.
 *
 * `status` only ever decides *failure*. It cannot promote an event to
 * "Success", because the stream stamps `status: 'success'` on anything that is
 * merely not an error — letting that through would file routine bookkeeping
 * under Success and leave the chip meaning nothing. What kind of event it is
 * comes from the action; whether it went wrong comes from either.
 *
 * Order matters: a failed MFA challenge is a failure first.
 */
export const classifyAuthEvent = (action: string, status?: string): AuthEventKind => {
  const actionText = action.toUpperCase()
  const statusText = (status ?? '').trim().toUpperCase()

  if (FAILURE_STATUS_PATTERN.test(statusText) || FAILURE_PATTERN.test(actionText)) return 'failed'
  if (LOGOUT_PATTERN.test(actionText)) return 'logout'
  if (MFA_PATTERN.test(actionText)) return 'mfa'
  if (REFRESH_PATTERN.test(actionText)) return 'refresh'
  if (SUCCESS_PATTERN.test(actionText)) return 'success'
  return 'other'
}

const asString = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number') return String(value)
  return null
}

const asNumber = (value: unknown): number | null => {
  const parsed = typeof value === 'string' ? Number(value) : value
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : null
}

/**
 * Normalises a raw SSE payload (or a polled audit row) into `LiveAuthEvent`.
 *
 * Geo fields are read both from the top level and from `metadata`, because the
 * stream's `session:ip_changed` events carry the resolved location under
 * `metadata` while audit logs carry it at the top level.
 */
export const toLiveAuthEvent = (payload: Record<string, unknown>): LiveAuthEvent | null => {
  const action = asString(payload.action) ?? asString(payload.event) ?? 'event'
  const id =
    asString(payload.id) ??
    `${action}-${asString(payload.timestamp) ?? ''}-${asString(payload.ipAddress) ?? ''}`
  if (!id) return null

  const metadata = (payload.metadata as Record<string, unknown> | undefined) ?? {}
  const geo = metadata as Record<string, unknown>
  const status = asString(payload.status) ?? undefined

  return {
    id,
    receivedAt: Date.now(),
    timestamp: asString(payload.timestamp) ?? new Date().toISOString(),
    action,
    actor: asString(payload.actor) ?? asString(payload.actorLabel) ?? '',
    kind: classifyAuthEvent(action, status),
    // Severity and status answer different questions, and collapsing them
    // made the severity column report "success" on a failed sign-in.
    severity: asString(payload.severity) ?? 'info',
    status: status ?? null,
    ip: asString(payload.ipAddress) ?? asString(payload.newIp) ?? null,
    userAgent: asString(payload.userAgent),
    city: asString(payload.city) ?? asString(geo.city),
    country: asString(payload.country) ?? asString(geo.countryLong) ?? asString(geo.country),
    countryCode:
      asString(payload.countryCode) ?? asString(geo.countryShort) ?? asString(geo.countryCode),
    latitude: asNumber(payload.latitude) ?? asNumber(geo.latitude),
    longitude: asNumber(payload.longitude) ?? asNumber(geo.longitude),
    metadata,
    raw: payload,
  }
}

export interface UseLiveAuthEventFeedResult {
  events: LiveAuthEvent[]
  status: FeedStatus
  isPaused: boolean
  /** Events held back while paused. */
  bufferedCount: number
  /** Measured arrivals per minute over the trailing window. */
  throughputPerMinute: number
  /** When the current live connection opened, for the uptime readout. */
  connectedSince: number | null
  togglePause: () => void
  clear: () => void
}

/**
 * Subscribes the monitor to the real `/api/admin/events/stream` SSE feed.
 *
 * Three behaviours the previous screen lacked:
 *   - it backfills from the audit-log endpoint on mount, so the table shows
 *     genuine recent history instead of five hardcoded demo rows;
 *   - it falls back to polling when SSE cannot connect, rather than sitting
 *     silently on a dead subscription;
 *   - pausing buffers through a ref, so the pause state read by the arrival
 *     handler is always current.
 */
export function useLiveAuthEventFeed(): UseLiveAuthEventFeedResult {
  const [events, setEvents] = useState<LiveAuthEvent[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const [bufferedCount, setBufferedCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [connectedSince, setConnectedSince] = useState<number | null>(null)
  const [hasLoadedBackfill, setHasLoadedBackfill] = useState(false)

  const bufferRef = useRef<LiveAuthEvent[]>([])
  const isPausedRef = useRef(isPaused)
  isPausedRef.current = isPaused

  /** Arrival timestamps, kept separately so throughput survives the row cap. */
  const arrivalsRef = useRef<number[]>([])
  const [throughputPerMinute, setThroughputPerMinute] = useState(0)

  const mergeEvents = useCallback((incoming: LiveAuthEvent[]) => {
    if (incoming.length === 0) return
    setEvents((previous) => {
      const seen = new Set<string>()
      const merged: LiveAuthEvent[] = []
      for (const event of [...incoming, ...previous]) {
        if (seen.has(event.id)) continue
        seen.add(event.id)
        merged.push(event)
      }
      return merged.slice(0, MAX_EVENTS)
    })
  }, [])

  const ingest = useCallback(
    (payload: Record<string, unknown>) => {
      // The stream's opening handshake is not an auth event.
      if (payload?.type === 'connected') return
      const event = toLiveAuthEvent(payload)
      if (!event) return

      arrivalsRef.current.push(event.receivedAt)

      if (isPausedRef.current) {
        bufferRef.current.unshift(event)
        bufferRef.current = bufferRef.current.slice(0, MAX_EVENTS)
        setBufferedCount(bufferRef.current.length)
        return
      }
      mergeEvents([event])
    },
    [mergeEvents],
  )

  useSSESubscription<Record<string, unknown>>('/api/admin/events/stream', {
    onMessage: ingest,
    onOpen: () => {
      setIsConnected(true)
      setConnectedSince((current) => current ?? Date.now())
    },
    onError: () => {
      setIsConnected(false)
      setConnectedSince(null)
    },
  })

  // Backfill: the stream only carries what happens from now on, so without
  // this the operator stares at an empty table until something occurs.
  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    adminMonitoringService
      .getAuditLogs({ limit: 50 })
      .then((response) => {
        if (cancelled) return
        const mapped = extractRows<AuditLogRow>(response.data)
          .map((row) => toLiveAuthEvent({ ...normalizeAuditLogRow(row) }))
          .filter(Boolean) as LiveAuthEvent[]
        mergeEvents(mapped)
      })
      .catch(() => {
        // A missing history endpoint must not take the live stream down with
        // it; the feed still works, it just starts empty.
      })
      .finally(() => {
        if (!cancelled) setHasLoadedBackfill(true)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [mergeEvents])

  // Polling fallback, active only while the stream is down.
  useEffect(() => {
    if (isConnected || !hasLoadedBackfill) return undefined

    const poll = () => {
      if (isPausedRef.current) return
      adminMonitoringService
        .getAuditLogs({ limit: 20 })
        .then((response) => {
          const mapped = extractRows<AuditLogRow>(response.data)
            .map((row) => toLiveAuthEvent({ ...normalizeAuditLogRow(row) }))
            .filter(Boolean) as LiveAuthEvent[]
          mergeEvents(mapped)
        })
        .catch(() => {})
    }

    const interval = setInterval(poll, 10_000)
    return () => clearInterval(interval)
  }, [isConnected, hasLoadedBackfill, mergeEvents])

  // Recompute throughput on a slow tick rather than per arrival, so a burst
  // cannot turn the readout into a render storm.
  useEffect(() => {
    const recompute = () => {
      const cutoff = Date.now() - THROUGHPUT_WINDOW_MS
      arrivalsRef.current = arrivalsRef.current.filter((at) => at >= cutoff)
      setThroughputPerMinute(arrivalsRef.current.length)
    }
    recompute()
    const interval = setInterval(recompute, 2_000)
    return () => clearInterval(interval)
  }, [])

  const togglePause = useCallback(() => {
    setIsPaused((wasPaused) => {
      if (wasPaused) {
        const buffered = bufferRef.current
        bufferRef.current = []
        setBufferedCount(0)
        if (buffered.length > 0) mergeEvents(buffered)
      }
      return !wasPaused
    })
  }, [mergeEvents])

  const clear = useCallback(() => {
    bufferRef.current = []
    setBufferedCount(0)
    setEvents([])
  }, [])

  const status: FeedStatus = useMemo(() => {
    if (isPaused) return 'paused'
    if (isConnected) return 'live'
    if (!hasLoadedBackfill) return 'connecting'
    return 'polling'
  }, [isPaused, isConnected, hasLoadedBackfill])

  return {
    events,
    status,
    isPaused,
    bufferedCount,
    throughputPerMinute,
    connectedSince,
    togglePause,
    clear,
  }
}

export default useLiveAuthEventFeed
