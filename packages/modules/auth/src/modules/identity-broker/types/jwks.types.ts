export interface JWKKey {
  kid: string
  kty: string
  use?: string
  alg?: string
  n?: string
  e?: string
  crv?: string
  x?: string
  y?: string
  status?: 'active' | 'standby' | 'revoked' | string
  createdAt?: string
  expiresAt?: string | null
  revokedAt?: string | null
}

export interface JWKSKeySetResponse {
  keys: JWKKey[]
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

export interface JWKSKeyDetailResponse {
  key: JWKKey
  publicKeyPem?: string
  fingerprint?: string
  totalSignatures?: number
  lastUsedAt?: string | null
}

export interface RotateJWKSResponse {
  message: string
  activeKey: JWKKey
  previousKey?: JWKKey
}
