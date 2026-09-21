/**
 * Auto-generated / synchronized from Authentication backend.
 * Source: Authentication/app/contracts/dtos/session_dto.ts
 * DO NOT EDIT DIRECTLY - Use scripts/sync-contracts.mjs
 */

/**
 * Session & Device Management DTOs
 * Aligned with @cap/shared-types and @cap/auth-contracts.
 */

export interface SessionDTO {
  id: string
  userId: string
  ipAddress?: string | null
  userAgent?: string | null
  browser?: string
  device?: string
  location?: string
  isActive: boolean
  loginAt?: string | null
  lastTouchedAt?: string | null
}

export interface ImpersonationSessionDTO {
  id: string
  admin_user_id: string
  target_user_id: string
  token: string
  created_at: string
  expires_at: string
  ip_address?: string
  user_agent?: string
}
