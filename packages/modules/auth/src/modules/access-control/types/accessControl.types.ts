/**
 * Physical NFC access control types.
 *
 * These mirror the backend's `NfcCard`, `AccessPoint` and `AccessLog` models.
 * Everything here is organization-scoped: the routes take an `:orgId`, and the
 * backend filters every query by it.
 *
 * Two fields are deliberately absent because the backend never sends them, and
 * a type that claimed otherwise would invite a screen to try to render them:
 *
 * - `NfcCard.aesKey` — the card's diversified key. Reading it would let anyone
 *   with console access clone the badge.
 * - `AccessPoint.apiTokenHash` — marked `serializeAs: null` in the model. Only
 *   `apiTokenPrefix` is exposed, and the raw token exists in exactly one
 *   response: the one that created or regenerated it.
 */

export type NfcCardStatus = 'active' | 'revoked'

/** Which way a reader faces. `both` is a single reader used for entry and exit. */
export type AccessDirection = 'in' | 'out' | 'both'

/** A log entry's direction is always resolved — never `both`. */
export type AccessLogDirection = 'in' | 'out'

export type AccessPointStatus = 'active' | 'inactive'

export type AccessDecision = 'granted' | 'denied'

export interface AccessControlUserRef {
  id: number
  email?: string
  fullName?: string | null
  firstName?: string | null
  lastName?: string | null
}

export interface NfcCard {
  id: number
  organizationId: number
  userId: number
  /** Badge UID, normalised to upper case by the backend on registration. */
  uid: string
  label: string | null
  status: NfcCardStatus
  /** Increments on each accepted scan; a stalled counter can indicate a clone. */
  scanCounter: number
  issuedAt: string
  revokedAt: string | null
  createdAt: string
  updatedAt: string
  user?: AccessControlUserRef | null
}

export interface NfcCardPage {
  data: NfcCard[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }
}

export interface RegisterNfcCardPayload {
  uid: string
  userId?: number | string
  label?: string
}

export interface AccessPoint {
  id: number
  organizationId: number
  name: string
  direction: AccessDirection
  /** The readable stub of the reader's bearer token, e.g. `tk_abc123`. */
  apiTokenPrefix: string
  status: AccessPointStatus
  /** Null until the reader has called in at least once. */
  lastSeenAt: string | null
  createdAt: string
  updatedAt: string
}

/**
 * The response from creating or regenerating a reader token.
 *
 * `api_token` is snake_cased because that is what the backend sends, and it is
 * present in this one response only — the plaintext is never stored, so a
 * caller that does not surface it here has lost it permanently.
 */
export interface AccessPointWithToken extends AccessPoint {
  api_token: string
}

export interface CreateAccessPointPayload {
  name: string
  direction?: AccessDirection
}

export interface UpdateAccessPointPayload {
  name?: string
  direction?: AccessDirection
  status?: AccessPointStatus
}

export interface AccessLog {
  id: number
  organizationId: number
  /** Null when the scanned UID matched no card — an unknown badge. */
  userId: number | null
  accessPointId: number
  nfcUid: string
  direction: AccessLogDirection
  status: AccessDecision
  /** Why entry was denied: unknown UID, revoked card, inactive reader, … */
  reason: string | null
  scannedAt: string
  createdAt: string
  updatedAt: string
  user?: AccessControlUserRef | null
  accessPoint?: Pick<AccessPoint, 'id' | 'name' | 'direction'> | null
}

export interface AccessLogPage {
  data: AccessLog[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }
}

export interface AccessLogFilters {
  page?: number
  limit?: number
  status?: AccessDecision
  direction?: AccessLogDirection
  /** Backend reads this as `access_point_id`; the service does the renaming. */
  accessPointId?: number | string
  from?: string
  to?: string
}

/**
 * How long a reader may go unheard from before the list should call it offline.
 *
 * A reader has no heartbeat of its own — `lastSeenAt` only advances when
 * somebody scans a badge. Fifteen minutes is long enough that a quiet door at
 * night does not look broken, and short enough that a genuinely dead reader is
 * noticed within one shift.
 */
export const READER_STALE_AFTER_MS = 15 * 60 * 1000

export type ReaderPresence = 'online' | 'stale' | 'never-seen' | 'disabled'

/**
 * Derive a reader's presence.
 *
 * Deliberately distinguishes `never-seen` from `stale`: a reader that has never
 * called in was probably never given its token or never wired up, which is a
 * different problem from one that stopped. Collapsing them into "offline" hides
 * a failed installation behind what looks like a transient fault.
 */
export function readerPresence(
  point: Pick<AccessPoint, 'status' | 'lastSeenAt'>,
  now: number = Date.now(),
): ReaderPresence {
  if (point.status !== 'active') return 'disabled'
  if (!point.lastSeenAt) return 'never-seen'
  const seen = new Date(point.lastSeenAt).getTime()
  if (Number.isNaN(seen)) return 'never-seen'
  return now - seen <= READER_STALE_AFTER_MS ? 'online' : 'stale'
}

/**
 * Normalise a UID the way the backend does before it checks for duplicates.
 *
 * The backend trims and upper-cases on registration, so doing the same in the
 * form means the duplicate check the user sees matches the one the server will
 * apply — otherwise `04:a2:2f` and `04:A2:2F` look like different cards in the
 * UI right up until the server rejects the second one.
 */
export function normaliseCardUid(uid: string): string {
  return uid.trim().toUpperCase()
}
