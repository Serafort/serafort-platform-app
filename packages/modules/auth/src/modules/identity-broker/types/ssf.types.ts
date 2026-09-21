export interface SSFConfig {
  id?: number
  enabled: boolean
  issuer?: string
  /**
   * The receiver identifier the transmitter stamps into each SET. Persisted by
   * the backend alongside `issuer`.
   */
  audience?: string
  delivery_method?: 'Push' | 'Poll' | string
  endpoint_url?: string
  events_supported?: string[]
  /** The subset of `events_supported` this stream actually transmits. */
  events_delivered?: string[]
  events_meta?: Array<{
    id: string
    name: string
    desc: string
  }>
  authorization_header?: string
  verification_token?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Fields the backend actually persists.
 *
 * `AdminSsfController.updateConfig` stores `request.only([...])` over exactly
 * this list. `endpoint_url`, `authorization_header` and `verification_token`
 * appear on `SSFConfig` because a stream needs them, but the update handler
 * drops them on the floor — a form that submits them reports success and
 * changes nothing. They are deliberately absent here so the type stops that
 * happening; add them back when the backend persists them.
 */
export interface UpdateSSFConfigDTO {
  enabled?: boolean
  issuer?: string
  audience?: string
  delivery_method?: 'Push' | 'Poll' | string
  events_supported?: string[]
  events_delivered?: string[]
  events_meta?: SSFConfig['events_meta']
}

export interface SSFTestStreamRequest {
  endpoint_url?: string
  events?: string[]
}

export interface SSFTestStreamResponse {
  success: boolean
  status?: 'delivered' | 'failed' | string
  statusCode?: number
  latencyMs?: number
  message?: string
  timestamp?: string
}

/**
 * The CAEP / RISC event types the transmitter advertises.
 *
 * `session-revoked` and `credential-change` are CAEP session-lifecycle signals;
 * `account-disabled` and `risky-login` are RISC account-state signals. The
 * backend's default `events_supported` lists exactly these four, so the console
 * offers them rather than a free-text field an operator could typo into a
 * silently-ignored broadcast.
 */
export const SSF_EVENT_TYPES = [
  'session-revoked',
  'credential-change',
  'account-disabled',
  'risky-login',
] as const

export type SSFEventType = (typeof SSF_EVENT_TYPES)[number] | (string & {})

/**
 * A manual broadcast.
 *
 * The field names are camelCase because that is what
 * `AdminSsfController.broadcast` reads — `request.only(['eventType', 'subject',
 * 'reason'])`. This interface previously declared `event_type` and
 * `event_payload`, neither of which the handler looks at, so every broadcast
 * was rejected with 400 "eventType and subject are required".
 */
export interface SSFBroadcastEventDTO {
  eventType: SSFEventType
  /** Who the signal is about: a subject identifier the receiver can resolve. */
  subject: string
  /** Free text recorded in the audit trail and sent with the signal. */
  reason?: string
}

export interface SSFBroadcastEventResponse {
  success: boolean
  message?: string
  eventType?: string
  subject?: string
  /** One entry per registered OIDC client the signal was addressed to. */
  results?: Array<{
    client_id: string
    /**
     * `simulated` until live push dispatch is switched on in the backend — the
     * signal is recorded and audited but not delivered over the wire. The
     * console surfaces this rather than implying a delivery that did not
     * happen.
     */
    status: string
    timestamp: string
  }>
  clientCount?: number
  timestamp?: string
}

/**
 * A history entry.
 *
 * `GET /api/admin/ssf/history` returns `audit_logs` rows filtered to the SSF
 * actions — not a purpose-built delivery log. So the shape is an audit row, and
 * what was broadcast lives in `metadata`.
 *
 * The previous declaration described a delivery record with `event_type`,
 * `status`, `statusCode` and `delivered_at`, none of which the endpoint sends.
 * Anything reading those fields was reading `undefined`.
 */
export interface SSFHistoryLog {
  id: string | number
  /** `SSF_SIGNAL_BROADCAST` for a real broadcast, `SSF_TEST_SIGNAL` for a test. */
  action: 'SSF_SIGNAL_BROADCAST' | 'SSF_TEST_SIGNAL' | string
  userId?: number | null
  metadata?: {
    eventType?: string
    subject?: string
    reason?: string
    clientCount?: number
    client_count?: number
    type?: string
    success?: boolean
    timestamp?: string
    [key: string]: unknown
  } | null
  created_at: string
  createdAt?: string
  updated_at?: string
}

/** Normalise the two casings the audit row can arrive with. */
export function historyTimestamp(log: SSFHistoryLog): string {
  return log.created_at ?? log.createdAt ?? ''
}

/** Recipient count, tolerating both casings the metadata has used. */
export function historyRecipientCount(log: SSFHistoryLog): number {
  return Number(log.metadata?.clientCount ?? log.metadata?.client_count ?? 0)
}
