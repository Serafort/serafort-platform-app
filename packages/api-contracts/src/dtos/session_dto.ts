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
  id: number;
  userId: number;
  ipAddress?: string | null;
  userAgent?: string | null;
  browser?: string;
  device?: string;
  location?: string;
  isActive: boolean;
  loginAt?: string | null;
  lastTouchedAt?: string | null;
}

export interface ImpersonationSessionDTO {
  id: number;
  admin_user_id: number;
  target_user_id: number;
  token: string;
  created_at: string;
  expires_at: string;
  ip_address?: string;
  user_agent?: string;
}
