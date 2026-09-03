
import { apiClient, FetchResponse, IForgetPassword, ILogin, IResetPassword, ISignup } from '@cap/platform-core';

import { SecurityLogParams } from '../types/api.types';
import { ENDPOINTS } from '@cap/platform-core';
import { TenantService } from '@cap/platform-core';

import { eventBus } from '../../../domain-kernel/src/events/event-bus';
import { UserAuthenticated } from '../../../domain-kernel/src/events/auth-events';
import { secureTokenManager } from '@cap/platform-store';
import { createUserAuthenticatedEvent, createAuthenticationFailedEvent, createSessionCreatedEvent, createSessionRevokedEvent, createTokenIssuedEvent, createTokenRefreshedEvent } from '../../../domain-kernel/src/events/event-factory';

export const handleLoginSuccess = async (userPayload: any) => {
  if (userPayload?.accessToken) {
    // Refresh tokens are exclusively handled via HttpOnly cookies set by the backend —
    // never read from or stored in client-side memory/payloads.
    await secureTokenManager.setTokens(userPayload.accessToken)
  }

  await eventBus.publish(
    new UserAuthenticated({
      userId: userPayload?.user?.id || userPayload?.userId || 'unknown',
      role: userPayload?.user?.role || userPayload?.role,
      tenantId: userPayload?.tenantId,
      timestamp: new Date().toISOString(),
      correlationId: crypto.randomUUID(),
    })
  )
}

const authService = {
  handleLoginSuccess,
  /**
   * Backend tenant feature verification guard.
   * Independently verifies that a tenant has a specific auth feature/plugin enabled.
   */
  verifyTenantAuthFeature: (pluginId: string, domain?: string): boolean => {
    return TenantService.verifyTenantAuthFeature(domain, pluginId)
  },

  assertTenantAuthFeatureEnabled: (pluginId: string, domain?: string): void => {
    if (!TenantService.verifyTenantAuthFeature(domain, pluginId)) {
      throw new Error(
        `[TenantAuthGating] Authentication plugin "${pluginId}" is not enabled for this tenant.`
      )
    }
  },
  signup: async (body: ISignup): Promise<FetchResponse<any>> => {
    const response = await apiClient.post(ENDPOINTS.auth.signup, body)
    const data: any = response?.data
    if (data?.user || data?.userId) {
      const userId = String(data?.user?.id || data?.userId || 'unknown')
      const sessionId = String(data?.session?.id || data?.sessionId || 'default-session')
      await eventBus.publish(
        createUserAuthenticatedEvent({
          userId,
          email: body.email || data?.user?.email || '',
          factors: ['password'],
          method: 'password',
          sessionId,
        })
      )
      await eventBus.publish(
        createSessionCreatedEvent({
          sessionId,
          userId,
          createdAt: new Date().toISOString(),
          expiresAt: data?.session?.expiresAt || new Date(Date.now() + 86400000).toISOString(),
        })
      )
    }
    return response
  },

  signin: async (body: ILogin): Promise<FetchResponse<any>> => {
    try {
      const response = await apiClient.post(ENDPOINTS.auth.login, body)
      const data: any = response?.data
      if (data) {
        const userId = String(data?.user?.id || data?.user?.userId || data?.userId || 'unknown')
        const sessionId = String(data?.session?.id || data?.sessionId || 'default-session')
        const email = body.email || data?.user?.email || ''

        await eventBus.publish(
          createUserAuthenticatedEvent({
            userId,
            email,
            factors: ['password'],
            method: 'password',
            sessionId,
          })
        )

        await eventBus.publish(
          createSessionCreatedEvent({
            sessionId,
            userId,
            createdAt: new Date().toISOString(),
            expiresAt: data?.session?.expiresAt || new Date(Date.now() + 86400000).toISOString(),
          })
        )

        if (data?.token || data?.tokens?.accessToken) {
          await eventBus.publish(
            createTokenIssuedEvent({
              tokenId: data?.tokenId || data?.tokens?.accessToken?.id || 'access-token',
              userId,
              tokenType: 'access',
              expiresAt: data?.expiresAt || new Date(Date.now() + 3600000).toISOString(),
              scopes: data?.scopes || ['read', 'write'],
            })
          )
        }
      }
      return response
    } catch (error) {
      await eventBus.publish(
        createAuthenticationFailedEvent({
          email: body.email,
          reason: 'invalid_credentials',
        })
      )
      throw error
    }
  },

  signout: async (): Promise<FetchResponse<any>> => {
    const response = await apiClient.post(ENDPOINTS.auth.logout)
    await eventBus.publish(
      createSessionRevokedEvent({
        sessionId: 'current-session',
        userId: 'current-user',
        reason: 'user_logout',
        revokedAt: new Date().toISOString(),
      })
    )
    return response
  },

  refreshToken: async (): Promise<FetchResponse<any>> => {
    const response = await apiClient.post(ENDPOINTS.auth.refresh)
    const data: any = response?.data
    if (data) {
      await eventBus.publish(
        createTokenRefreshedEvent({
          oldTokenId: data?.oldTokenId || 'old-token',
          newTokenId: data?.token || data?.newTokenId || 'new-token',
          userId: String(data?.user?.id || data?.userId || 'current-user'),
          refreshedAt: new Date().toISOString(),
        })
      )
    }
    return response
  },

  forgotPassword: (body: IForgetPassword): Promise<FetchResponse<any>> => {
    return apiClient.post(ENDPOINTS.auth.forgotPassword, body)
  },

  resetPassword: (body: IResetPassword): Promise<FetchResponse<any>> => {
    return apiClient.post(ENDPOINTS.auth.resetPassword, body)
  },

  discoverSso: (identifier: string): Promise<FetchResponse<any>> => {
    const isEmail = identifier.includes('@')
    const params = isEmail ? { email: identifier } : { domain: identifier }
    return apiClient.get(ENDPOINTS.auth.sso.discover, { params })
  },

  verifyResetPassword: (email: string, signature: string): Promise<FetchResponse<any>> => {
    return apiClient.get(ENDPOINTS.auth.verifyResetPassword(email, signature))
  },

  verifyEmail: (email: string, signature: string): Promise<FetchResponse<any>> => {
    return apiClient.get(ENDPOINTS.auth.verifyEmail(email, signature))
  },

  resendVerification: (email: string): Promise<FetchResponse<any>> => {
    return apiClient.post(ENDPOINTS.auth.resendVerification, { email })
  },

  verifyEmailToken: (email: string, signature: string): Promise<FetchResponse<any>> => {
    return apiClient.get(ENDPOINTS.auth.verifyEmailToken(email, signature))
  },

  verifyEmailChange: (token: string): Promise<FetchResponse<any>> => {
    return apiClient.post(ENDPOINTS.user.verifyEmailChange, { token })
  },

  validateUser: (id: string | number, token: string): Promise<FetchResponse<any>> => {
    return apiClient.get(ENDPOINTS.auth.validateUser(id, token))
  },

  // ========================================================================
  // Session Management
  // ========================================================================
  getSession: (): Promise<FetchResponse<any>> => {
    return apiClient.get(ENDPOINTS.auth.session)
  },

  getSessions: (): Promise<FetchResponse<any>> => {
    return apiClient.get(ENDPOINTS.auth.sessions)
  },

  revokeSession: async (sessionId: string): Promise<FetchResponse<any>> => {
    const response = await apiClient.delete(ENDPOINTS.auth.revokeSession(sessionId))
    await eventBus.publish(
      createSessionRevokedEvent({
        sessionId,
        userId: 'current-user',
        reason: 'admin_revoked',
        revokedAt: new Date().toISOString(),
      })
    )
    return response
  },

  revokeAllSessions: async (): Promise<FetchResponse<any>> => {
    const response = await apiClient.post(ENDPOINTS.auth.revokeAllSessions)
    await eventBus.publish(
      createSessionRevokedEvent({
        sessionId: 'all-sessions',
        userId: 'current-user',
        reason: 'user_logout',
        revokedAt: new Date().toISOString(),
      })
    )
    return response
  },

  trackFailedLogin: async (body: { email: string }): Promise<FetchResponse<any>> => {
    const response = await apiClient.post(ENDPOINTS.auth.trackFailedLogin, body)
    await eventBus.publish(
      createAuthenticationFailedEvent({
        email: body.email,
        reason: 'invalid_credentials',
      })
    )
    return response
  },

  // ========================================================================
  // Login History & Security Logs
  // ========================================================================

  getLoginHistory: (limit: number = 50): Promise<FetchResponse<any>> => {
    return apiClient.get(ENDPOINTS.auth.loginHistory, {
      params: { limit },
    })
  },

  getSecurityLogs: (params?: SecurityLogParams): Promise<FetchResponse<any>> => {
    return apiClient.get(ENDPOINTS.auth.securityLogs, { params })
  },

  // MFA and Passkey logic is handled by plugins in packages/modules/auth/src/plugins/

  // ========================================================================
  // Passwordless (Magic Link)
  // ========================================================================
  passwordless: {
    /** Send a magic link to the user's email */
    send: (email: string): Promise<FetchResponse<any>> => {
      return apiClient.post(ENDPOINTS.auth.passwordless.send, { email })
    },

    /** Verify a magic link token */
    verify: (token: string): Promise<FetchResponse<any>> => {
      return apiClient.get(ENDPOINTS.auth.passwordless.verify, { params: { token } })
    },
  },

  // ========================================================================
  // OIDC Device Code
  // ========================================================================
  deviceCode: {
    /** Request a device code */
    authorize: (clientId: string): Promise<FetchResponse<any>> => {
      return apiClient.post(ENDPOINTS.auth.oidcDevice.authorize, { client_id: clientId })
    },
    /** Verify a device code entered by the user */
    verify: (userCode: string): Promise<FetchResponse<{ success: boolean; redirectUrl: string }>> => {
      return apiClient.post(ENDPOINTS.auth.oidcDevice.verifyAction, { userCode })
    },
  },

  // ========================================================================
  // OIDC Compliance & SAML SSO
  // ========================================================================
  oidc: {
    userinfo: (): Promise<FetchResponse<any>> => {
      return apiClient.get(ENDPOINTS.auth.oidc.userinfo)
    },
    introspect: (token: string): Promise<FetchResponse<any>> => {
      return apiClient.post(ENDPOINTS.auth.oidc.introspect, { token })
    },
    revoke: (token: string): Promise<FetchResponse<any>> => {
      return apiClient.post(ENDPOINTS.auth.oidc.revoke, { token })
    },
    endSession: (): Promise<FetchResponse<any>> => {
      return apiClient.get(ENDPOINTS.auth.oidc.endSession)
    },
  },

  saml: {
    sso: (data: any): Promise<FetchResponse<any>> => {
      return apiClient.post(ENDPOINTS.auth.saml.sso, data)
    },
  },

  oidcInteraction: {
    get: (uid: string): Promise<FetchResponse<any>> => {
      return apiClient.get(ENDPOINTS.auth.oidcInteraction.get(uid))
    },
    confirm: (uid: string): Promise<FetchResponse<any>> => {
      return apiClient.post(ENDPOINTS.auth.oidcInteraction.confirm(uid))
    },
    abort: (uid: string): Promise<FetchResponse<any>> => {
      return apiClient.get(ENDPOINTS.auth.oidcInteraction.abort(uid))
    },
  },
}

export default authService
