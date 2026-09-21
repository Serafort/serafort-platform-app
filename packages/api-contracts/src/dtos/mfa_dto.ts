/**
 * Auto-generated / synchronized from Authentication backend.
 * Source: Authentication/app/contracts/dtos/mfa_dto.ts
 * DO NOT EDIT DIRECTLY - Use scripts/sync-contracts.mjs
 */

/**
 * Multi-Factor Authentication (MFA) DTOs
 * Aligned with @cap/shared-types and @cap/auth-contracts.
 */

export interface TotpSetupResponseDTO {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

export interface TotpVerifyDTO {
  code: string
  userId?: number
}

export interface TotpVerifyResponseDTO {
  verified: boolean
  accessToken?: string
  user?: unknown
}

export interface RecoveryCodeVerifyDTO {
  code: string
  userId?: number
}

export interface MfaStatsDTO {
  total_enabled: number
  totp_count: number
  passkey_count: number
  adoption_rate: number
  daily_challenges: Array<{ date: string; count: number }>
}
