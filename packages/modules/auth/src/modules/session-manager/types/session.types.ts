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

export interface AuditLogItem {
  id: string | number
  user_id?: string | number
  action: string
  resource_type?: string
  resource_id?: string | number
  ip_address?: string
  user_agent?: string
  status?: string
  created_at: string
  updated_at?: string
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
