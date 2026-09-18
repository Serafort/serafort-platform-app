import { SessionStatus } from './SessionStatus'

export type DeviceType = 'desktop' | 'mobile' | 'laptop' | 'tablet' | 'unknown'

export interface DeviceMetadata {
  browser?: string
  os?: string
  deviceType?: DeviceType
  ipAddress?: string
  city?: string
  country?: string
  countryCode?: string
  location?: string
}

export interface UserSession {
  id: string | number
  userId?: string | number
  deviceName?: string
  device_name?: string
  deviceType?: DeviceType
  device_type?: 'mobile' | 'tablet' | 'desktop' | 'laptop' | string
  browser?: string
  os?: string
  ipAddress?: string
  ip_address?: string
  location?: string
  city?: string
  country?: string
  countryCode?: string
  lastActivity?: string
  last_activity?: string
  lastTouchedAt?: string
  current?: boolean
  isCurrentSession?: boolean
  status?: SessionStatus | string
  createdAt?: string
  created_at?: string
  expiresAt?: string
  expires_at?: string
}

export interface SessionsResponse {
  sessions: UserSession[]
  current_session_id?: string
  currentSessionId?: string
}

export interface SecurityStatusResponse {
  mfaEnabled: boolean
  emailVerified: boolean
  passwordLastChangedAt: string | null
  activeSessions: number
  passkeys: number
}

/**
 * Shape of a row from the `audit_logs` table as returned by
 * GET /api/user/activity-timeline (UsersController.activityTimeline), a raw
 * `db.from('audit_logs')` query builder call. `CamelCaseResponseMiddleware`
 * (app/middleware/camel_case_response_middleware.ts) exists in the
 * Authentication service but is NOT registered in start/kernel.ts, so it
 * never runs — raw query-builder rows like this one stay exactly as the
 * database returns them, i.e. snake_case (`target_type`, `ip_address`,
 * `created_at`, ...). The camelCase fields below are kept only in case that
 * middleware is registered later; snake_case is what actually arrives today.
 * The table has no `resource_type`, `resource_id`, `status`, or `updated_at`
 * columns at all (see
 * database/migrations/7_audit_monitoring/*_audit_logs_table.ts in the
 * Authentication service) — the closest equivalents are `target_type` /
 * `target_id`.
 */
export interface AuditLogItem {
  id: string | number
  userId?: string | number
  user_id?: string | number
  action: string
  targetType?: string
  target_type?: string
  targetId?: string | number
  target_id?: string | number
  ipAddress?: string
  ip_address?: string
  userAgent?: string
  user_agent?: string
  createdAt?: string
  created_at: string
}

export interface ChangePasswordRequest {
  currentPassword?: string
  oldPassword?: string
  password?: string
  newPassword?: string
  confirmPassword?: string
}

export interface ChangePasswordResponse {
  message: string
  success?: boolean
}

export interface DeactivateAccountRequest {
  password?: string
  reason?: string
  feedback?: string
}

export interface DeactivateAccountResponse {
  message: string
  success?: boolean
}
