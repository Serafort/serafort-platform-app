/**
 * @deprecated This service is deprecated and will be removed in a future release.
 *
 * Session tracking is handled exclusively by:
 * - `secureTokenManager` (in-memory access tokens)
 * - `authSlice` / Zustand store (persisted auth state via AES-GCM encrypted storage)
 * - `useSessionGuard` hook (session lifecycle in React components)
 *
 * This file previously maintained a parallel, plaintext session store in localStorage/sessionStorage
 * that bypassed the platform's encrypted storage layer (see Security Audit Finding 4.3, CWE-312).
 * All methods are now no-ops that return safe defaults.
 *
 * @see packages/platform-store/src/services/secureTokenManager.ts
 * @see packages/platform-store/src/store/slices/authSlice.ts
 * @see packages/modules/auth/src/modules/session-manager/middlewares/useSessionGuard.ts
 */

import type { IAuth, UserSessionDto as ISession } from '@cap/shared-types'

export interface SessionConfig {
  timeout: number
  absoluteTimeout: number
  refreshThreshold: number
  maxConcurrentSessions: number
  requireDeviceVerification: boolean
  rememberMe: boolean
  multiDevice: boolean
}

export interface SessionData {
  user: IAuth
  expiresAt: number
  absoluteExpiresAt: number
  lastActivity: number
  createdAt: number
  deviceFingerprint: string
  rememberMe: boolean
  ipAddress?: string
  userAgent: string
  sessionId: string
}

/**
 * @deprecated Use `secureTokenManager` + `authSlice` instead.
 *
 * This class is a no-op stub retained only for type compatibility.
 * All session lifecycle management is handled by the Zustand auth store
 * and the in-memory secureTokenManager.
 */
class SecureSessionManagementService {
  /** @deprecated No-op. Session lifecycle is managed by authSlice/secureTokenManager. */
  initialize(_config?: Partial<SessionConfig>): void {
    if (import.meta.env.DEV) {
      console.warn(
        '[SessionManagement] DEPRECATED: SecureSessionManagementService.initialize() is a no-op. ' +
        'Session management is handled by secureTokenManager and authSlice.',
      )
    }
  }

  /** @deprecated No-op. Returns a rejected-shape SessionData with no storage writes. */
  async createSession(_authData: IAuth, _rememberMe: boolean = false): Promise<SessionData | null> {
    if (import.meta.env.DEV) {
      console.warn('[SessionManagement] DEPRECATED: createSession() is a no-op.')
    }
    return null
  }

  /** @deprecated No-op. Always returns null. */
  getSession(): SessionData | null {
    return null
  }

  /** @deprecated No-op. */
  updateActivity(): void {}

  /** @deprecated No-op. Always returns false. */
  async refreshSession(): Promise<boolean> {
    return false
  }

  /** @deprecated No-op. Always returns false. */
  needsRefresh(): boolean {
    return false
  }

  /** @deprecated No-op. */
  destroySession(): void {}

  /** @deprecated No-op. Always returns 0. */
  getTimeUntilExpiry(): number {
    return 0
  }

  /** @deprecated No-op. Always returns false. */
  isUserActive(): boolean {
    return false
  }

  /** @deprecated No-op. Always returns null. */
  getSessionInfo(): {
    isActive: boolean
    expiresIn: string
    absoluteExpiresIn: string
    lastActivity: string
    deviceFingerprint: string
    sessionAge: string
  } | null {
    return null
  }

  /** @deprecated No-op. Always returns an empty array. */
  async getActiveSessions(_userId?: number | string): Promise<Array<ISession>> {
    return []
  }

  /** @deprecated No-op. Always returns false. */
  async terminateSession(_sessionId: string): Promise<boolean> {
    return false
  }

  /** @deprecated No-op. */
  cleanup(): void {}
}

/**
 * @deprecated Use `secureTokenManager` and `useAppStore` (authSlice) instead.
 * This singleton is retained for backwards compatibility but all methods are no-ops.
 */
export const sessionManagementService = new SecureSessionManagementService()

export default sessionManagementService
