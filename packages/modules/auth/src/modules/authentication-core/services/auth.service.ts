import {
  apiClient,
  FetchResponse,
  IForgetPassword,
  ILogin,
  IResetPassword,
  ISignup,
} from '@cap/platform-core'

import { SecurityLogParams } from '../types/api.types'
import { ENDPOINTS } from '@cap/platform-core'
import { TenantService } from '@cap/platform-core'

import { eventBus } from '../../../domain-kernel/src/events/event-bus'
import { UserAuthenticated } from '../../../domain-kernel/src/events/auth-events'
import { secureTokenManager } from '@cap/platform-store'
import {
  createUserAuthenticatedEvent,
  createAuthenticationFailedEvent,
  createSessionCreatedEvent,
  createSessionRevokedEvent,
  createTokenIssuedEvent,
  createTokenRefreshedEvent,
} from '../../../domain-kernel/src/events/event-factory'

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
    }),
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
        `[TenantAuthGating] Authentication plugin "${pluginId}" is not enabled for this tenant.`,
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
        }),
      )
      await eventBus.publish(
        createSessionCreatedEvent({
          sessionId,
          userId,
          createdAt: new Date().toISOString(),
          expiresAt: data?.session?.expiresAt || new Date(Date.now() + 86400000).toISOString(),
        }),
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
          }),
        )

        await eventBus.publish(
          createSessionCreatedEvent({
            sessionId,
            userId,
            createdAt: new Date().toISOString(),
            expiresAt: data?.session?.expiresAt || new Date(Date.now() + 86400000).toISOString(),
          }),
        )

        if (data?.token || data?.tokens?.accessToken) {
          await eventBus.publish(
            createTokenIssuedEvent({
              tokenId: data?.tokenId || data?.tokens?.accessToken?.id || 'access-token',
              userId,
              tokenType: 'access',
              expiresAt: data?.expiresAt || new Date(Date.now() + 3600000).toISOString(),
              scopes: data?.scopes || ['read', 'write'],
            }),
          )
        }
      }
      return response
    } catch (error) {
      await eventBus.publish(
        createAuthenticationFailedEvent({
          email: body.email,
          reason: 'invalid_credentials',
        }),
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
      }),
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
        }),
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

  /**
   * Verify an email address from a mailed link.
   *
   * Takes the link's query string verbatim — `location.search`, signature and
   * all. The backend signs that query including the address and validates it
   * against the request URL, so it is what says which address is being verified;
   * passing the address separately in the body would not be covered by the
   * signature and is ignored.
   */
  verifyEmail: (search: string): Promise<FetchResponse<any>> => {
    return apiClient.post(ENDPOINTS.auth.verifyEmail(search))
  },

  /**
   * Verify an email address with a code the user typed in, rather than by
   * following a signed link.
   *
   * Deliberately fails closed instead of calling the API, because no
   * code-verification path exists on the backend. The endpoint requires a valid
   * signature over the whole request URL, which only a mailed link carries, and
   * although its validator accepts a `token` field the handler never reads it.
   * A typed code therefore cannot verify anything: posting one would simply be
   * rejected as an invalid link.
   *
   * Restore the call once the backend validates a code; until then this path
   * rejects, and the sign-up screen shows its existing invalid-code message.
   */
  verifyEmailCode: (_email: string, _token: string): Promise<FetchResponse<any>> => {
    return Promise.reject(
      new Error('Email verification by typed code is not supported by the API yet.'),
    )
  },

  resendVerification: (email: string): Promise<FetchResponse<any>> => {
    return apiClient.post(ENDPOINTS.auth.resendVerification, { email })
  },

  verifyEmailChange: (token: string): Promise<FetchResponse<any>> => {
    return apiClient.post(ENDPOINTS.user.verifyEmailChange, { token })
  },

  validateUser: (id: string | number, token: string): Promise<FetchResponse<any>> => {
    return apiClient.post(ENDPOINTS.auth.validateUser, { id, token })
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
      }),
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
      }),
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
    send: (
      payload: string | { email: string; redirectUrl?: string },
    ): Promise<FetchResponse<any>> => {
      const body = typeof payload === 'string' ? { email: payload } : payload
      return apiClient.post(ENDPOINTS.auth.passwordless.send, body)
    },

    /** Verify a magic link token and hydrate session */
    verify: async (
      tokenOrParams: string | { token: string; email?: string },
    ): Promise<FetchResponse<any>> => {
      const params = typeof tokenOrParams === 'string' ? { token: tokenOrParams } : tokenOrParams
      const response = await apiClient.get(ENDPOINTS.auth.passwordless.verify, { params })
      const data: any = response?.data
      if (data) {
        if (data.token) {
          try {
            await secureTokenManager.setTokens(data.token)
          } catch {
            // Token manager storage fallback
          }
        }
        if (data.user) {
          const userId = String(data.user.id || data.user.userId || 'unknown')
          const sessionId = String(
            data.session?.id || data.sessionId || `session-${crypto.randomUUID().slice(0, 8)}`,
          )
          const email = data.user.email || (typeof params === 'object' ? params.email : '') || ''

          await eventBus.publish(
            createUserAuthenticatedEvent({
              userId,
              email,
              factors: ['magic_link'],
              method: 'magic_link',
              sessionId,
            }),
          )

          await eventBus.publish(
            createSessionCreatedEvent({
              sessionId,
              userId,
              createdAt: new Date().toISOString(),
              expiresAt:
                data.expiresAt ||
                new Date(Date.now() + (data.expiresIn || 3600) * 1000).toISOString(),
            }),
          )

          if (data.token) {
            await eventBus.publish(
              createTokenIssuedEvent({
                tokenId: data.tokenId || 'magic-link-token',
                userId,
                tokenType: 'access',
                expiresAt:
                  data.expiresAt ||
                  new Date(Date.now() + (data.expiresIn || 3600) * 1000).toISOString(),
                scopes: data.scopes || ['read', 'write'],
              }),
            )
          }
        }
      }
      return response
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
    verify: (
      userCode: string,
    ): Promise<FetchResponse<{ success: boolean; redirectUrl: string }>> => {
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
