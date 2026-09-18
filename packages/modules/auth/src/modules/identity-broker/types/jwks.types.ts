/**
 * `OidcKeysController.index` (`GET /api/admin/jwks`) is a hand-built
 * projection, not `OidcKey.serialize()` — no key material, short field names
 * (`alg` not `algorithm`), and ISO *date* strings under `created`/`expires`
 * (`'Never'` when unset), plus a currently-mocked `health` score.
 */
export interface JWKKey {
  kid: string
  status: 'active' | 'standby' | 'revoked' | string
  alg: string
  use: string
  created: string
  expires: string | 'Never'
  health: number
}

export interface CreateJWKSKeyRequest {
  kid?: string
  algorithm?: string
  use?: string
  status?: 'active' | 'standby' | string
  expiresAt?: string
  privateKey?: string
  publicKey?: string
}

/**
 * `OidcKeysController.show` (`GET /api/admin/jwks/:kid`) is flat — not
 * wrapped in `{ key }` — and ships the parsed public JWK object
 * (`publicJwk`), not a PEM string. There is no `fingerprint`,
 * `totalSignatures` or `lastUsedAt`.
 */
export interface JWKSKeyDetailResponse {
  kid: string
  status: JWKKey['status']
  alg: string
  use: string
  created: string
  updated: string
  expires: string | null
  health: number
  publicJwk: Record<string, any>
  metadata: Record<string, any> | null
}

/**
 * `OidcKeysController.rotate` and `.store` both `response.created(oidcKey)`
 * — the raw `OidcKey` Lucid model (no `serializeAs` overrides, so it
 * serializes camelCase), not wrapped in `{ message, activeKey, previousKey }`.
 * This includes the private key JWK material, since the record is otherwise
 * indistinguishable from any other model row on `.serialize()`.
 */
export interface JWKSKeyRecord {
  id: string
  kid: string
  privateKey: string
  publicKey: string
  algorithm: string
  use: string
  status: 'active' | 'standby' | 'revoked'
  metadata: Record<string, any> | null
  createdAt: string
  updatedAt: string
  expiresAt: string | null
}

export type RotateJWKSResponse = JWKSKeyRecord
export type CreateJWKSKeyResult = JWKSKeyRecord
