import { DomainEvent } from './event-bus'

export const EventVersions = {
  V1: 'v1',
  V2: 'v2',
} as const

export const AuthEventTypes = {
  USER_AUTHENTICATED: 'UserAuthenticated',
  AUTHENTICATION_FAILED: 'AuthenticationFailed',
  MFA_CHALLENGE_ISSUED: 'MfaChallengeIssued',
  MFA_VERIFIED: 'MfaVerified',
  ACCOUNT_LOCKED: 'AccountLocked',
} as const

export const SessionEventTypes = {
  SESSION_CREATED: 'SessionCreated',
  SESSION_EXPIRED: 'SessionExpired',
  SESSION_REVOKED: 'SessionRevoked',
} as const

export const TokenEventTypes = {
  TOKEN_ISSUED: 'TokenIssued',
  TOKEN_REVOKED: 'TokenRevoked',
  TOKEN_REFRESHED: 'TokenRefreshed',
} as const

export interface UserAuthenticatedPayload {
  userId: string
  email: string
  factors: string[]
  method: 'password' | 'mfa' | 'passkey' | 'sso'
  sessionId: string
  ipAddress?: string
  userAgent?: string
  tenantId?: string
}

export interface AuthenticationFailedPayload {
  userId?: string
  email?: string
  reason: 'invalid_credentials' | 'account_locked' | 'mfa_failed' | 'rate_limited' | 'suspended'
  ipAddress?: string
  userAgent?: string
  tenantId?: string
}

export interface MfaChallengeIssuedPayload {
  userId: string
  challengeId: string
  method: 'totp' | 'sms' | 'email' | 'push' | 'backup_code'
  sessionId: string
  expiresAt: string
}

export interface MfaVerifiedPayload {
  userId: string
  challengeId: string
  method: 'totp' | 'sms' | 'email' | 'push' | 'backup_code'
}

export interface AccountLockedPayload {
  userId: string
  reason: 'failed_attempts' | 'admin_action'
  lockedUntil?: string
  attempts?: number
}

export interface SessionCreatedPayload {
  sessionId: string
  userId: string
  createdAt: string
  expiresAt: string
  ipAddress?: string
  userAgent?: string
  deviceInfo?: {
    os?: string
    browser?: string
    deviceType?: 'desktop' | 'mobile' | 'tablet'
  }
}

export interface SessionExpiredPayload {
  sessionId: string
  userId: string
  expiredAt: string
}

export interface SessionRevokedPayload {
  sessionId: string
  userId: string
  reason:
    | 'user_logout'
    | 'admin_revoked'
    | 'password_changed'
    | 'session_expired'
    | 'concurrent_login'
  revokedAt: string
}

export interface TokenIssuedPayload {
  tokenId: string
  userId: string
  tokenType: 'access' | 'refresh'
  expiresAt: string
  scopes: string[]
  tenantId?: string
}

export interface TokenRevokedPayload {
  tokenId: string
  userId: string
  reason: 'user_revoked' | 'password_changed' | 'session_ended' | 'admin_revoked' | 'expired'
  revokedAt: string
}

export interface TokenRefreshedPayload {
  oldTokenId: string
  newTokenId: string
  userId: string
  refreshedAt: string
}

export type AuthEvent = DomainEvent<
  | UserAuthenticatedPayload
  | AuthenticationFailedPayload
  | MfaChallengeIssuedPayload
  | MfaVerifiedPayload
  | AccountLockedPayload
>

export type SessionEvent = DomainEvent<
  SessionCreatedPayload | SessionExpiredPayload | SessionRevokedPayload
>

export type TokenEvent = DomainEvent<
  TokenIssuedPayload | TokenRevokedPayload | TokenRefreshedPayload
>

export type AuthDomainEvent = AuthEvent | SessionEvent | TokenEvent

export interface UserAuthenticatedInit {
  userId: string
  role?: string
  tenantId?: string
  timestamp?: string
  correlationId?: string
  causationId?: string
  email?: string
  factors?: string[]
  method?: 'password' | 'mfa' | 'passkey' | 'sso'
  sessionId?: string
  ipAddress?: string
  userAgent?: string
}

export class UserAuthenticated implements DomainEvent<UserAuthenticatedPayload & { role?: string }> {
  id: string
  type: string = AuthEventTypes.USER_AUTHENTICATED
  version: string = EventVersions.V1
  timestamp: string
  correlationId?: string
  causationId?: string
  payload: UserAuthenticatedPayload & { role?: string }

  constructor(init: UserAuthenticatedInit) {
    this.id = crypto.randomUUID()
    this.timestamp = init.timestamp || new Date().toISOString()
    this.correlationId = init.correlationId || crypto.randomUUID()
    this.causationId = init.causationId
    this.payload = {
      userId: init.userId,
      email: init.email || '',
      factors: init.factors || ['password'],
      method: init.method || 'password',
      sessionId: init.sessionId || 'default-session',
      tenantId: init.tenantId,
      ipAddress: init.ipAddress,
      userAgent: init.userAgent,
      ...(init.role ? { role: init.role } : {}),
    }
  }
}
