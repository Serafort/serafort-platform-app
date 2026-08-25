import { apiClient, ENDPOINTS, FetchResponse } from '@cap/platform-core'

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

export const mfaService = {
  // --- TOTP MFA ---
  setupTotp: async (): Promise<FetchResponse<TOTPSetupResponse>> => {
    return apiClient.post(ENDPOINTS.auth.mfa.setup)
  },

  confirmTotp: async (code: string): Promise<FetchResponse<TOTPConfirmResponse>> => {
    return apiClient.post(ENDPOINTS.auth.mfa.verify, { code })
  },

  verifyLogin: async (payload: {
    mfaToken?: string
    mfa_token?: string
    userId?: string | number
    user_id?: string | number
    code: string
  }): Promise<FetchResponse<any>> => {
    return apiClient.post(ENDPOINTS.auth.mfa.verifyLogin, payload)
  },

  recoveryVerify: async (payload: {
    userId?: string | number
    email?: string
    code: string
  }): Promise<FetchResponse<any>> => {
    return apiClient.post(ENDPOINTS.auth.mfa.recoveryVerify, payload)
  },

  disableMfa: async (): Promise<FetchResponse<{ message: string }>> => {
    return apiClient.post(ENDPOINTS.auth.mfa.disable)
  },

  getRecoveryCodes: async (): Promise<FetchResponse<{ recoveryCodes: string[] }>> => {
    return apiClient.post(ENDPOINTS.auth.mfa.recoveryCodes)
  },

  regenerateBackupCodes: async (): Promise<FetchResponse<{ message: string; recoveryCodes: string[] }>> => {
    return apiClient.post(ENDPOINTS.auth.mfa.regenerateBackupCodes)
  },

  // --- Passkeys (WebAuthn) ---
  passkeys: {
    getRegistrationOptions: async (email?: string) => {
      try {
        const response = await apiClient.post(ENDPOINTS.auth.passkey.registerStart, { email })
        if (response.data) return { data: response.data }
      } catch (err) {
        if (!import.meta.env.DEV) throw err
        console.warn('[mfaService] Fallback to local options on error (DEV only)', err)
      }
      return {
        data: {
          challenge: 'stepup-reg-challenge-' + Date.now(),
          rp: { name: 'CAP Multi-Tenant Platform', id: typeof window !== 'undefined' ? window.location.hostname : 'localhost' },
          user: { id: 'user-1', name: email || 'admin@example.com', displayName: 'Admin User' },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
          timeout: 60000,
          attestation: 'none' as const,
        } as any,
      }
    },
    verifyRegistration: async (data: any) => {
      try {
        const response = await apiClient.post(ENDPOINTS.auth.passkey.registerFinish, data)
        if (response.data) return { data: response.data }
      } catch (err) {
        if (!import.meta.env.DEV) throw err
        console.warn('[mfaService] Passkey register verify fallback (DEV only)', err)
      }
      return { data: { verified: true, credentialId: 'cred-' + Date.now() } }
    },
    getLoginOptions: async (email?: string) => {
      try {
        const response = await apiClient.post(ENDPOINTS.auth.passkey.loginStart, { email })
        if (response.data) return { data: response.data }
      } catch (err) {
        if (!import.meta.env.DEV) throw err
        console.warn('[mfaService] Fallback to local auth options on error (DEV only)', err)
      }
      return {
        data: {
          challenge: 'stepup-auth-challenge-' + Date.now(),
          rpId: typeof window !== 'undefined' ? window.location.hostname : 'localhost',
          timeout: 60000,
          userVerification: 'preferred' as const,
        } as any,
      }
    },
    verifyLogin: async (data: any) => {
      try {
        const response = await apiClient.post(ENDPOINTS.auth.passkey.loginFinish, data)
        if (response.data) return { data: response.data }
      } catch (err) {
        if (!import.meta.env.DEV) throw err
        console.warn('[mfaService] Passkey login verify fallback (DEV only)', err)
      }
      return {
        data: {
          user: {} as any,
          token: 'auth-token-' + Date.now(),
          expires_in: 3600,
          userId: '1',
        } as any,
      }
    },
  },

  verifyMfaCode: async (userId: number, code: string) => {
    return apiClient.post(ENDPOINTS.auth.mfa.verifyLogin, { userId, code })
  },

  // --- Step-Up Authentication ---
  stepUp: {
    getChallenge: async (action?: string): Promise<{ data: StepUpChallengeResponse }> => {
      return {
        data: {
          challenge: 'stepup-challenge-' + Date.now() + (action ? `-${action}` : ''),
          rpId: (typeof window !== 'undefined' && window.location.hostname) || 'localhost',
          timeout: 60000,
          userVerification: 'required',
        },
      }
    },
    verifyBiometric: async (_assertionResponse: any): Promise<{ data: StepUpVerificationResult }> => {
      if (!import.meta.env.DEV) {
        throw new Error('Biometric step-up verification requires configured backend endpoint in production')
      }
      return {
        data: {
          success: true,
          elevationToken: 'elevated-jwt-' + Math.random().toString(36).substring(2) + '-' + Date.now(),
          expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes validity
        },
      }
    },
    verifyTotp: async (_code: string): Promise<{ data: StepUpVerificationResult }> => {
      if (!import.meta.env.DEV) {
        throw new Error('TOTP step-up verification requires configured backend endpoint in production')
      }
      return {
        data: {
          success: true,
          elevationToken: 'elevated-totp-' + Math.random().toString(36).substring(2) + '-' + Date.now(),
          expiresAt: Date.now() + 15 * 60 * 1000,
        },
      }
    },
  },
}

export default mfaService
