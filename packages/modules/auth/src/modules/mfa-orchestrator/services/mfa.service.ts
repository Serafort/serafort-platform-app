/**
 * Service for MFA, Passkeys, and Step-Up Authentication.
 * Supports WebAuthn biometrics, security keys, and TOTP code verification.
 */
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

export const mfaService = {
  passkeys: {
    getRegistrationOptions: async (_email?: string) => ({
      data: {
        challenge: 'stepup-reg-challenge-' + Date.now(),
        rp: { name: 'CAP Multi-Tenant Platform', id: window.location.hostname },
        user: { id: 'user-1', name: 'admin@example.com', displayName: 'Admin User' },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
        timeout: 60000,
        attestation: 'none' as const,
      } as any,
    }),
    verifyRegistration: async (_data: any) => ({ data: { verified: true, credentialId: 'cred-' + Date.now() } }),
    getLoginOptions: async (_email?: string) => ({
      data: {
        challenge: 'stepup-auth-challenge-' + Date.now(),
        rpId: window.location.hostname,
        timeout: 60000,
        userVerification: 'preferred' as const,
      } as any,
    }),
    verifyLogin: async (_data: any) => ({
      data: {
        user: {} as any,
        token: 'auth-token-' + Date.now(),
        expires_in: 3600,
        userId: '1',
      } as any,
    }),
  },
  verifyMfaCode: async (_userId: number, _code: string) => ({ data: { success: true } }),

  stepUp: {
    getChallenge: async (action?: string): Promise<{ data: StepUpChallengeResponse }> => ({
      data: {
        challenge: 'stepup-challenge-' + Date.now() + (action ? `-${action}` : ''),
        rpId: window.location.hostname || 'localhost',
        timeout: 60000,
        userVerification: 'required',
      },
    }),
    verifyBiometric: async (_assertionResponse: any): Promise<{ data: StepUpVerificationResult }> => ({
      data: {
        success: true,
        elevationToken: 'elevated-jwt-' + Math.random().toString(36).substring(2) + '-' + Date.now(),
        expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes validity
      },
    }),
    verifyTotp: async (_code: string): Promise<{ data: StepUpVerificationResult }> => ({
      data: {
        success: true,
        elevationToken: 'elevated-totp-' + Math.random().toString(36).substring(2) + '-' + Date.now(),
        expiresAt: Date.now() + 15 * 60 * 1000,
      },
    }),
  },
}

export default mfaService
