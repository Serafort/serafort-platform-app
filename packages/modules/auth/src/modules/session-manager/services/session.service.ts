import { apiClient, FetchResponse, ENDPOINTS } from '@cap/platform-core'
import { eventBus } from '../../../domain-kernel/src/events/event-bus'
import { createSessionRevokedEvent } from '../../../domain-kernel/src/events/event-factory'
import type {
  UserSession,
  SessionsResponse,
  SecurityStatusResponse,
  AuditLogItem,
  ChangePasswordRequest,
  ChangePasswordResponse,
  DeactivateAccountRequest,
  DeactivateAccountResponse,
} from '../types/session.types'

/**
 * Helper to normalize session object from various API structures (Lucid models, camelCase, snake_case)
 */
export function normalizeUserSession(raw: any): UserSession {
  const userAgent = raw.userAgent || raw.user_agent || ''
  let deviceType: 'desktop' | 'mobile' | 'tablet' | 'laptop' = 'desktop'
  if (raw.deviceType || raw.device_type) {
    deviceType = raw.deviceType || raw.device_type
  } else if (/mobile|iphone|android.*mobile/i.test(userAgent)) {
    deviceType = 'mobile'
  } else if (/tablet|ipad/i.test(userAgent)) {
    deviceType = 'tablet'
  } else if (/macbook|laptop/i.test(userAgent)) {
    deviceType = 'laptop'
  }

  let browser = raw.browser || ''
  if (!browser && userAgent) {
    if (/chrome|crios/i.test(userAgent) && !/edg|opr/i.test(userAgent)) browser = 'Chrome'
    else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Safari'
    else if (/firefox|fxios/i.test(userAgent)) browser = 'Firefox'
    else if (/edg/i.test(userAgent)) browser = 'Edge'
    else if (/opr|opera/i.test(userAgent)) browser = 'Opera'
    else browser = 'Browser'
  }

  const ipAddress = raw.ipAddress || raw.ip_address || '127.0.0.1'
  const location =
    raw.location ||
    (raw.city && raw.country ? `${raw.city}, ${raw.country}` : raw.city || raw.country || 'Unknown')

  const lastActivity =
    raw.lastActivity ||
    raw.last_activity ||
    raw.lastTouchedAt ||
    raw.last_touched_at ||
    raw.loginAt ||
    raw.login_at ||
    raw.createdAt ||
    raw.created_at ||
    new Date().toISOString()

  const isCurrent = Boolean(raw.current || raw.isCurrentSession || raw.is_current)

  return {
    id: raw.id ? String(raw.id) : String(raw.token || crypto.randomUUID()),
    userId: raw.userId || raw.user_id,
    deviceName:
      raw.deviceName || raw.device_name || raw.deviceInfo || `${browser} on ${deviceType}`,
    device_name:
      raw.device_name || raw.deviceName || raw.deviceInfo || `${browser} on ${deviceType}`,
    deviceType,
    device_type: deviceType,
    browser: browser || 'Unknown',
    ipAddress,
    ip_address: ipAddress,
    location,
    city: raw.city,
    country: raw.country,
    countryCode: raw.countryCode || raw.country_code,
    lastActivity,
    last_activity: lastActivity,
    lastTouchedAt: raw.lastTouchedAt || raw.last_touched_at,
    current: isCurrent,
    isCurrentSession: isCurrent,
    status: raw.status || (raw.forceLogout || raw.logoutAt ? 'terminated' : 'active'),
    createdAt: raw.createdAt || raw.created_at || raw.loginAt,
    created_at: raw.created_at || raw.createdAt || raw.loginAt,
  }
}

export const sessionService = {
  /**
   * List active sessions for the current authenticated user
   */
  getSessions: async (): Promise<FetchResponse<SessionsResponse>> => {
    const response = await apiClient.get<any>(ENDPOINTS.auth.sessions)
    const rawData = response.data

    let sessionsList: UserSession[] = []
    let currentSessionId: string | undefined = undefined

    if (Array.isArray(rawData)) {
      sessionsList = rawData.map(normalizeUserSession)
      const current = sessionsList.find((s) => s.current || s.isCurrentSession)
      if (current) {
        currentSessionId = String(current.id)
      } else if (sessionsList.length > 0) {
        sessionsList[0].current = true
        sessionsList[0].isCurrentSession = true
        currentSessionId = String(sessionsList[0].id)
      }
    } else if (rawData && typeof rawData === 'object') {
      const rawSessions = Array.isArray(rawData.sessions) ? rawData.sessions : []
      sessionsList = rawSessions.map(normalizeUserSession)
      currentSessionId = rawData.current_session_id || rawData.currentSessionId
      if (!currentSessionId) {
        const current = sessionsList.find((s) => s.current || s.isCurrentSession)
        if (current) {
          currentSessionId = String(current.id)
        } else if (sessionsList.length > 0) {
          sessionsList[0].current = true
          sessionsList[0].isCurrentSession = true
          currentSessionId = String(sessionsList[0].id)
        }
      }
    }

    return {
      ...response,
      data: {
        sessions: sessionsList,
        current_session_id: currentSessionId,
        currentSessionId,
      },
    }
  },

  /**
   * Terminate a single active session by ID
   */
  revokeSession: async (
    sessionId: string | number,
  ): Promise<FetchResponse<{ message: string }>> => {
    const idStr = String(sessionId)
    const response = await apiClient.delete<{ message: string }>(
      ENDPOINTS.auth.revokeSession(idStr),
    )

    await eventBus.publish(
      createSessionRevokedEvent({
        sessionId: idStr,
        userId: 'current-user',
        reason: 'admin_revoked',
        revokedAt: new Date().toISOString(),
      }),
    )

    return response
  },

  /**
   * Revoke all other active sessions except the current one
   */
  revokeAllSessions: async (): Promise<FetchResponse<{ message: string }>> => {
    const response = await apiClient.post<{ message: string }>(ENDPOINTS.auth.revokeAllSessions)

    await eventBus.publish(
      createSessionRevokedEvent({
        sessionId: 'all-sessions',
        userId: 'current-user',
        reason: 'admin_revoked',
        revokedAt: new Date().toISOString(),
      }),
    )

    return response
  },

  /**
   * Get user activity audit trail / timeline
   */
  getActivityTimeline: async (): Promise<FetchResponse<AuditLogItem[]>> => {
    return apiClient.get<AuditLogItem[]>(ENDPOINTS.user.activityTimeline)
  },

  /**
   * Get security summary status (MFA, password age, active sessions count, passkeys count)
   */
  getSecurityStatus: async (): Promise<FetchResponse<SecurityStatusResponse>> => {
    return apiClient.get<SecurityStatusResponse>(ENDPOINTS.user.securityStatus)
  },

  /**
   * Update account password
   */
  changePassword: async (
    payload: ChangePasswordRequest,
  ): Promise<FetchResponse<ChangePasswordResponse>> => {
    return apiClient.post<ChangePasswordResponse>(ENDPOINTS.user.changePassword, {
      currentPassword: payload.currentPassword || payload.oldPassword,
      password: payload.password || payload.newPassword,
    })
  },

  /**
   * Deactivate current user account
   */
  deactivateAccount: async (
    payload?: DeactivateAccountRequest,
  ): Promise<FetchResponse<DeactivateAccountResponse>> => {
    let response: FetchResponse<DeactivateAccountResponse>
    try {
      response = await apiClient.post<DeactivateAccountResponse>(
        '/api/user/deactivate',
        payload || {},
      )
    } catch {
      response = await apiClient.patch<DeactivateAccountResponse>(
        '/api/user/deactivate',
        payload || {},
      )
    }

    await eventBus.publish(
      createSessionRevokedEvent({
        sessionId: 'current-session',
        userId: 'current-user',
        reason: 'user_logout',
        revokedAt: new Date().toISOString(),
      }),
    )

    return response
  },
}

export default sessionService
