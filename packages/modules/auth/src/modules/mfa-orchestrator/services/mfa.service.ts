import { apiClient, ENDPOINTS, FetchResponse } from '@cap/platform-core'
import type { IAuth } from '@cap/shared-types'
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/browser'

export interface StepUpChallengeResponse {
  challenge: string
  rpId?: string
  allowCredentials?: Array<{
    id: string
    type: 'public-key'
    transports?: string[]
  }>
  timeout?: number
  userVerification?: 'required' | 'preferred' | 'discouraged'
}

export interface StepUpVerificationResult {
  success: boolean
  elevationToken: string
  expiresAt: number
  userId?: number | string
}

export interface TOTPSetupResponse {
  qrDataUrl: string
  manualEntry: string
}

export interface TOTPConfirmResponse {
  enrolled: boolean
  recoveryCodes: string[]
  message: string
}

const ELEVATION_TTL_MS = 15 * 60 * 1000 // 15 minutes

/**
 * Produces an opaque client-side reference for an elevated (step-up) session.
 *
 * A server-issued elevation token is always preferred; this fallback only exists
 * so the client state machine keeps working when the backend response omits one.
 * It MUST be unpredictable — never derive it from `Date.now()` or `Math.random()`,
 * both of which are guessable and would let an attacker forge an elevated session
 * reference (see security review finding on step-up token generation). We fail
 * closed if no CSPRNG is available rather than emit a weak token.
 */
function synthesizeElevationToken(method: 'passkey' | 'totp'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `elevated-${method}-${crypto.randomUUID()}`
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = crypto.getRandomValues(new Uint8Array(32))
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
    return `elevated-${method}-${hex}`
  }
  throw new Error('Secure random source unavailable; cannot create elevation token')
}

/**
 * Normalizes a step-up verification response into `StepUpVerificationResult`.
 *
 * `apiClient` throws on any non-2xx, so reaching here means the request
 * succeeded; we still honour an explicit negative verdict in the body if the
 * backend sends one. The elevation token and expiry are synthesized only when
 * the backend omits them.
 */
function toStepUpResult(
  res: FetchResponse<any>,
  method: 'passkey' | 'totp',
): FetchResponse<StepUpVerificationResult> {
  const success = res.data?.verified !== false && res.data?.success !== false
  const serverToken: string | undefined = res.data?.elevationToken || res.data?.token
  const expiresAt =
    typeof res.data?.expiresAt === 'number' ? res.data.expiresAt : Date.now() + ELEVATION_TTL_MS
  return {
    ...res,
    data: {
      success,
      elevationToken: serverToken || synthesizeElevationToken(method),
      expiresAt,
    },
  }
}

export interface MfaMethodSummary {
  type: 'totp' | 'sms' | 'passkey'
  enabled: boolean
  phone?: string
  count?: number
  lastUsedAt?: string | null
}

export interface PasskeyItem {
  id: string
  name: string
  createdAt?: string
  lastUsedAt?: string | null
  deviceType?: 'laptop' | 'smartphone' | 'security_key' | string
  aaguid?: string
}

export interface MfaLoginCompletionResponse {
  token?: string
  access_token?: string
  refresh_token?: string | null
  expires_in?: number
  user?: IAuth
  userId?: number | string
  verified?: boolean
  success?: boolean
  message?: string
  requiresMfa?: boolean
  mfaToken?: string
  sessionId?: string
}

export const mfaService = {
  // --- TOTP MFA ---
  setupTotp: async (): Promise<FetchResponse<TOTPSetupResponse>> => {
    return apiClient.post<TOTPSetupResponse>(ENDPOINTS.auth.mfa.setup)
  },

  confirmTotp: async (code: string): Promise<FetchResponse<TOTPConfirmResponse>> => {
    return apiClient.post<TOTPConfirmResponse>(ENDPOINTS.auth.mfa.verify, { code })
  },

  verifyLogin: async (payload: {
    mfaToken?: string
    mfa_token?: string
    userId?: string | number
    user_id?: string | number
    code: string
  }): Promise<FetchResponse<MfaLoginCompletionResponse>> => {
    const formattedPayload = {
      mfa_token: payload.mfa_token || payload.mfaToken,
      userId: payload.userId || payload.user_id,
      code: payload.code,
    }
    return apiClient.post<MfaLoginCompletionResponse>(
      ENDPOINTS.auth.mfa.verifyLogin,
      formattedPayload,
    )
  },

  /**
   * Spend a recovery code to clear the login challenge, before a session
   * exists.
   *
   * `mfa_token` is required. The backend resolves the account strictly from
   * that signed challenge token, issued once the password step passed; it used
   * to accept a bare `userId` or `email`, which made the recovery code the only
   * factor needed to sign in (backend finding F-01). The identifiers are still
   * sent for older backends but no longer stand on their own.
   */
  recoveryVerify: async (payload: {
    mfaToken?: string
    mfa_token?: string
    userId?: string | number
    user_id?: string | number
    email?: string
    code: string
  }): Promise<FetchResponse<MfaLoginCompletionResponse>> => {
    const formattedPayload = {
      mfa_token: payload.mfa_token || payload.mfaToken,
      userId: payload.userId || payload.user_id,
      email: payload.email,
      code: payload.code,
    }
    return apiClient.post<MfaLoginCompletionResponse>(
      ENDPOINTS.auth.mfa.recoveryVerify,
      formattedPayload,
    )
  },

  disableMfa: async (): Promise<FetchResponse<{ message: string }>> => {
    return apiClient.post<{ message: string }>(ENDPOINTS.auth.mfa.disable)
  },

  getRecoveryCodes: async (): Promise<FetchResponse<{ recoveryCodes: string[] }>> => {
    return apiClient.post<{ recoveryCodes: string[] }>(ENDPOINTS.auth.mfa.recoveryCodes)
  },

  regenerateBackupCodes: async (): Promise<
    FetchResponse<{ message: string; recoveryCodes: string[] }>
  > => {
    return apiClient.post<{ message: string; recoveryCodes: string[] }>(
      ENDPOINTS.auth.mfa.regenerateBackupCodes,
    )
  },

  getMethods: async (): Promise<FetchResponse<MfaMethodSummary[]>> => {
    return apiClient.get<MfaMethodSummary[]>(ENDPOINTS.user.mfa.methods)
  },

  // --- SMS MFA ---
  sms: {
    // `ENDPOINTS.auth.mfa.sms` is a real, fully-typed entry (see
    // @cap/api-contracts) — the `as any` cast and hardcoded string fallback
    // this used to have were defensive against a registry entry that
    // already existed, so both are dropped here.
    sendCode: async (): Promise<FetchResponse<{ message: string }>> => {
      return apiClient.post<{ message: string }>(ENDPOINTS.auth.mfa.sms.sendCode)
    },

    confirm: async (
      code: string,
    ): Promise<FetchResponse<{ message: string; mfaSmsEnabled: boolean }>> => {
      return apiClient.post<{ message: string; mfaSmsEnabled: boolean }>(
        ENDPOINTS.auth.mfa.sms.verify,
        { code },
      )
    },

    disable: async (): Promise<FetchResponse<{ message: string }>> => {
      return apiClient.post<{ message: string }>(ENDPOINTS.auth.mfa.sms.disable)
    },

    /**
     * `SmsMfaController.verifyLogin` resolves the account strictly from the
     * signed `mfa_token` issued after the password step (same F-01 guard as
     * `verifyLogin`/`recoveryVerify` above) — it does not accept a bare
     * `userId`. The call previously sent only `{userId, code}` with no
     * token at all, so every SMS step of the login-MFA flow 400'd with
     * "MFA challenge token and verification code are required".
     */
    verifyLogin: async (payload: {
      mfaToken?: string
      mfa_token?: string
      userId?: string | number
      user_id?: string | number
      code: string
    }): Promise<FetchResponse<MfaLoginCompletionResponse>> => {
      const formattedPayload = {
        mfa_token: payload.mfa_token || payload.mfaToken,
        userId: payload.userId || payload.user_id,
        code: payload.code,
      }
      return apiClient.post<MfaLoginCompletionResponse>(
        ENDPOINTS.auth.mfa.sms.verifyLogin,
        formattedPayload,
      )
    },
  },

  // --- Passkeys (WebAuthn) ---
  passkeys: {
    getRegistrationOptions: async (
      email?: string,
    ): Promise<FetchResponse<PublicKeyCredentialCreationOptionsJSON>> => {
      return apiClient.post<PublicKeyCredentialCreationOptionsJSON>(
        ENDPOINTS.auth.passkey.registerStart,
        email ? { email } : {},
      )
    },

    verifyRegistration: async (
      data: RegistrationResponseJSON & { friendlyName?: string },
    ): Promise<FetchResponse<{ verified: boolean; message?: string }>> => {
      return apiClient.post<{ verified: boolean; message?: string }>(
        ENDPOINTS.auth.passkey.registerFinish,
        data,
      )
    },

    getLoginOptions: async (
      email?: string,
    ): Promise<FetchResponse<PublicKeyCredentialRequestOptionsJSON>> => {
      return apiClient.post<PublicKeyCredentialRequestOptionsJSON>(
        ENDPOINTS.auth.passkey.loginStart,
        email ? { email } : {},
      )
    },

    verifyLogin: async (
      data: AuthenticationResponseJSON,
    ): Promise<FetchResponse<MfaLoginCompletionResponse>> => {
      return apiClient.post<MfaLoginCompletionResponse>(ENDPOINTS.auth.passkey.loginFinish, data)
    },

    list: async (): Promise<FetchResponse<PasskeyItem[]>> => {
      return apiClient.get<PasskeyItem[]>(ENDPOINTS.user.passkeys.index)
    },

    update: async (
      id: string | number,
      name: string,
    ): Promise<FetchResponse<{ message: string }>> => {
      return apiClient.put<{ message: string }>(ENDPOINTS.user.passkeys.update(id), { name })
    },

    delete: async (id: string | number): Promise<FetchResponse<{ message: string }>> => {
      return apiClient.delete<{ message: string }>(ENDPOINTS.user.passkeys.destroy(id))
    },
  },

  verifyMfaCode: async (
    userId: number | string,
    code: string,
  ): Promise<FetchResponse<MfaLoginCompletionResponse>> => {
    return apiClient.post<MfaLoginCompletionResponse>(ENDPOINTS.auth.mfa.verifyLogin, {
      userId,
      code,
    })
  },

  // --- Step-Up Authentication ---
  stepUp: {
    getChallenge: async (action?: string): Promise<FetchResponse<StepUpChallengeResponse>> => {
      const res = await apiClient.post<any>(ENDPOINTS.auth.passkey.loginStart, {})
      return {
        ...res,
        data: {
          ...res.data,
          action,
        },
      }
    },

    /**
     * KNOWN GAP (not fixed here — see report): this hits the same
     * `passkeys_controller.verifyAuthentication` used for a fresh,
     * unauthenticated passkey *login*. That handler always calls
     * `auth.use('web').login(user)` and returns a new access token, but
     * never writes `session.put('mfa_verified', true)` /
     * `sessionService.setAuthState(...)` — the state `middleware.mfa()`
     * actually checks. `stepUp.verifyTotp` avoids this by hitting a
     * distinct, purpose-built route (`/api/mfa/totp/verify`); no such
     * distinct route exists for passkey step-up. Concretely: an
     * already-signed-in user who steps up via passkey gets `success: true`
     * here (a synthesized `elevationToken` if the server doesn't have one),
     * but the *server-side* step-up gate is never actually satisfied, so a
     * subsequent `middleware.mfa()`-protected request still 403s. Fixing
     * this needs a new, auth-required backend route/controller branch
     * mirroring `TotpController.verify`'s session promotion — a real
     * feature addition, not a wiring fix, so it is reported rather than
     * patched here.
     */
    verifyBiometric: async (
      assertionResponse: AuthenticationResponseJSON,
    ): Promise<FetchResponse<StepUpVerificationResult>> => {
      const res = await apiClient.post<any>(ENDPOINTS.auth.passkey.loginFinish, assertionResponse)
      const serverToken: string | undefined = res.data?.token
      const success = Boolean(res.data?.verified || serverToken)
      const token = serverToken || synthesizeElevationToken('passkey')
      const expiresAt =
        typeof res.data?.expiresAt === 'number' ? res.data.expiresAt : Date.now() + ELEVATION_TTL_MS
      return {
        ...res,
        data: {
          success,
          elevationToken: token,
          expiresAt,
          userId: res.data?.user?.id || res.data?.userId,
        },
      }
    },

    verifyTotp: async (code: string): Promise<FetchResponse<StepUpVerificationResult>> => {
      // Step-up verification using OTP code. `apiClient` throws on any non-2xx
      // response, so reaching this point means the request succeeded; we still
      // honour an explicit negative verdict in the body if the backend sends one.
      //
      // This used to post to `auth.mfa.verify`, which confirms *enrollment*: it
      // looks for a pending secret in Redis and answers 422 once the user is
      // enrolled, so step-up could never succeed for the only users who can
      // reach it. `stepUp.totp` is the route that promotes the session.
      const res = await apiClient.post<any>(ENDPOINTS.auth.mfa.stepUp.totp, { code })
      return toStepUpResult(res, 'totp')
    },

    /**
     * Step up with a recovery code, for someone who has lost their
     * authenticator but is already signed in. Spends the code — each one works
     * once.
     */
    verifyRecovery: async (code: string): Promise<FetchResponse<StepUpVerificationResult>> => {
      const res = await apiClient.post<any>(ENDPOINTS.auth.mfa.stepUp.recovery, { code })
      return toStepUpResult(res, 'totp')
    },
  },
}

export default mfaService
