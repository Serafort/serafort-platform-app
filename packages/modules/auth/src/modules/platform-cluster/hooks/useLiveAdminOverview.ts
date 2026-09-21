import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSSESubscription } from '@idaas/authentication-core/hooks/useSSE'

/** Minimum gap between two refreshes, however many events arrive. */
const REFRESH_THROTTLE_MS = 3000

/**
 * Events that can actually move a number on the admin overview. The stream
 * carries every audit row, and refetching nine COUNT queries because someone
 * edited their avatar would be waste dressed up as freshness.
 */
const STATS_AFFECTING_ACTIONS = [
  'LOGIN_SUCCESS',
  'FAILED_LOGIN',
  'LOGOUT',
  'USER_SUSPENDED',
  'USER_UNSUSPENDED',
  'USER_CREATED',
  'USER_DELETED',
  'MFA_ENABLED',
  'MFA_DISABLED',
  'MFA_VERIFIED',
  'PASSKEY_REGISTERED',
  'PASSKEY_DELETED',
  'BAN_APPEAL_SUBMITTED',
  'BAN_APPEAL_REVIEWED',
]

export type LiveStatus = 'live' | 'offline'

interface StreamEvent {
  type?: string
  action?: string
}

const affectsStats = (event: StreamEvent): boolean => {
  if (event?.type === 'connected') return false
  // Security alerts (lockouts, IP changes) are always worth a refresh.
  if (event?.type === 'security_alert') return true
  const action = String(event?.action ?? '').toUpperCase()
  return STATS_AFFECTING_ACTIONS.some((known) => action.includes(known))
}

/**
 * Keeps the admin overview's figures current from the live event stream.
 *
 * The screen used to be a single fetch with a five-minute `staleTime`, so
 * "Active sessions" and "Failed logins" were a snapshot of whenever the page
 * happened to be opened. Rather than poll on a timer, this subscribes to the
 * same audit stream the real-time events screen reads and invalidates the
 * dashboard query when an event arrives that could change a tile.
 */
export function useLiveAdminOverview(queryKey: readonly unknown[]) {
  const queryClient = useQueryClient()
  const [lastEventAt, setLastEventAt] = useState<Date | null>(null)

  const lastRefreshRef = useRef(0)
  const trailingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const missedWhileHiddenRef = useRef(false)

  const refresh = useCallback(() => {
    lastRefreshRef.current = Date.now()
    void queryClient.invalidateQueries({ queryKey })
    // queryKey is a literal tuple from the caller; stringify keeps the
    // identity stable without demanding the caller memoize it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, JSON.stringify(queryKey)])

  const scheduleRefresh = useCallback(() => {
    // A background tab should not refetch; remember that it owes one.
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      missedWhileHiddenRef.current = true
      return
    }

    const elapsed = Date.now() - lastRefreshRef.current
    if (elapsed >= REFRESH_THROTTLE_MS) {
      refresh()
      return
    }
    // Inside the throttle window: coalesce this and any further events into
    // one refresh at the end of it, so a burst of logins costs one refetch.
    if (trailingTimerRef.current) return
    trailingTimerRef.current = setTimeout(() => {
      trailingTimerRef.current = null
      refresh()
    }, REFRESH_THROTTLE_MS - elapsed)
  }, [refresh])

  const handleMessage = useCallback(
    (event: StreamEvent) => {
      if (!affectsStats(event)) return
      setLastEventAt(new Date())
      scheduleRefresh()
    },
    [scheduleRefresh],
  )

  const { isConnected } = useSSESubscription<StreamEvent>('/api/admin/events/stream', {
    onMessage: handleMessage,
    // A dashboard is left open for hours; the default three attempts would
    // retire the stream for good after one backend restart.
    maxRetries: 50,
    initialRetryInterval: 2000,
  })

  // Catch up on whatever happened while the tab was in the background.
  useEffect(() => {
    if (typeof document === 'undefined') return
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && missedWhileHiddenRef.current) {
        missedWhileHiddenRef.current = false
        refresh()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [refresh])

  useEffect(
    () => () => {
      if (trailingTimerRef.current) clearTimeout(trailingTimerRef.current)
    },
    [],
  )

  return {
    status: (isConnected ? 'live' : 'offline') as LiveStatus,
    lastEventAt,
  }
}

export default useLiveAdminOverview
