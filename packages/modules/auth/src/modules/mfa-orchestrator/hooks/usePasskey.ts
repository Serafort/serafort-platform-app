import { useState } from 'react'
import { startAuthentication } from '@simplewebauthn/browser'
import { mfaService } from '../services/mfa.service'

export const usePasskey = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loginWithPasskey = async (email?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      // 1. Get login options from backend
      const optionsResponse = await mfaService.passkeys.getLoginOptions(email)

      if (!optionsResponse.data) {
        throw new Error('Failed to get passkey login options')
      }

      // 2. Start browser-native WebAuthn authentication
      const authResponse = await startAuthentication(optionsResponse.data)

      // 3. Verify the authentication response on the backend
      const verifyResponse = await mfaService.passkeys.verifyLogin(authResponse)

      return verifyResponse
    } catch (err: any) {
      console.error('[usePasskey] error:', err)
      const errorMessage =
        err.response?.data?.error || err.message || 'Passkey authentication failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    loginWithPasskey,
    isLoading,
    error,
  }
}
