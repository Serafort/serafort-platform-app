/**
 * `ScimTokensController.getConfig` (`GET /api/admin/scim/config`) reads
 * `organization.scimConfig` — a free-form JSON column with no schema of its
 * own — and defaults to `{ enabled: false, baseUrl: '', attributeMapping: {} }`
 * when unset. It does not have `scim_base_url`, `authentication_scheme`,
 * `max_results_per_page` or `bulk_max_operations`; those never round-trip.
 */
export interface SCIMConfig {
  enabled: boolean
  baseUrl?: string
  attributeMapping?: Record<string, string>
  tokenExpiry?: number
}

/** `updateConfig` merges exactly `request.only(['enabled', 'baseUrl', 'attributeMapping', 'tokenExpiry'])`. */
export interface UpdateSCIMConfigDTO {
  enabled?: boolean
  baseUrl?: string
  attributeMapping?: Record<string, string>
  tokenExpiry?: number
}

/**
 * `ScimTokensController.index` hand-builds this row shape (not a Lucid
 * `.serialize()`) — `label`, not `name`; no `token_preview` at all; and
 * `revokedAt`/`isActive` instead of a `revoked` boolean.
 */
export interface SCIMToken {
  id: string | number
  label: string
  lastUsedAt?: string | null
  expiresAt?: string | null
  revokedAt?: string | null
  createdAt: string
  isActive: boolean
}

/** `store` reads `request.only(['label', 'expiresAt'])` — not `name`/`expires_in_days`. */
export interface CreateSCIMTokenDTO {
  label: string
  expiresAt?: string
}

export interface CreateSCIMTokenResponse {
  id: string | number
  label: string
  /** The raw bearer token — returned once, on creation only. */
  token: string
  createdAt?: string
  expiresAt?: string | null
}

/**
 * `ScimTokensController.test` returns `{ status: 'success' | 'warning',
 * message, diagnostics }` — never a `success` boolean, `latency_ms`,
 * `endpoint_status` or `schema_compliant`. A caller checking `.success` reads
 * `undefined` forever and always falls into the "warning" branch even on a
 * genuine pass.
 */
export interface SCIMConnectionTestResponse {
  status: 'success' | 'warning' | string
  message: string
  diagnostics: {
    scimEnabled: boolean
    hasActiveToken: boolean
    baseUrl: string
  }
}
