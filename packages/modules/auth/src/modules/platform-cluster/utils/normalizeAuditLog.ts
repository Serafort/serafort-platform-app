import type { AuditLogItem } from '../services/admin-monitoring.service'

/**
 * An audit row exactly as `AdminAuditLogsController.index` serialises it.
 *
 * `AuditLog` extends AppBaseModel's CamelCaseNamingStrategy, so rows arrive as
 * `createdAt` / `actorLabel` / `actorUserId`. `AuditLogItem` describes a
 * friendlier shape with `timestamp`, `actor` and a `status` — fields the
 * endpoint has never sent. Consumers reading `AuditLogItem` straight off the
 * response got `undefined` for the actor and an empty timestamp, which is how
 * the MFA analytics event list came to show every row as unattributed and
 * undated.
 *
 * This lives outside the service module on purpose: it is pure, and tests that
 * mock the service (an I/O boundary) would otherwise mock this away too.
 */
export interface AuditLogRaw {
  id: string | number
  action: string
  actorLabel?: string | null
  actorUserId?: string | null
  userId?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  createdAt?: string | null
  metadata?: Record<string, unknown> | null
  city?: string | null
  country?: string | null
  countryCode?: string | null
  latitude?: number | null
  longitude?: number | null
}

/** Actions that describe something being refused, locked or revoked. */
const FAILURE_ACTION_PATTERN = /FAILED|DENIED|LOCKED|SUSPENDED|REVOKED|DISABLED/

/** A row as it may arrive: the raw column names, optionally already friendlier. */
export type AuditLogRow = AuditLogRaw & Partial<AuditLogItem>

export const normalizeAuditLogRow = (
  raw: AuditLogRow,
): AuditLogItem => {
  const action = String(raw.action ?? '')
  return {
    id: raw.id,
    action,
    // An unattributed row is a real outcome — a failed login against an
    // address matching no account — so it stays empty rather than inventing
    // an actor.
    actor: raw.actor ?? raw.actorLabel ?? '',
    ipAddress: raw.ipAddress ?? undefined,
    userAgent: raw.userAgent ?? undefined,
    status:
      raw.status ?? (FAILURE_ACTION_PATTERN.test(action.toUpperCase()) ? 'failure' : 'success'),
    severity: raw.severity,
    timestamp: raw.timestamp ?? raw.createdAt ?? '',
    metadata: (raw.metadata as Record<string, unknown> | undefined) ?? undefined,
    city: raw.city ?? undefined,
    country: raw.country ?? undefined,
    // Geo fields the events map places a pin from. Dropping `countryCode` here
    // left every backfilled row unlocatable even when the server had resolved
    // its country, so the map showed "location not resolved" for rows that
    // plainly carried one.
    countryCode: raw.countryCode ?? undefined,
    latitude: raw.latitude ?? undefined,
    longitude: raw.longitude ?? undefined,
  }
}
