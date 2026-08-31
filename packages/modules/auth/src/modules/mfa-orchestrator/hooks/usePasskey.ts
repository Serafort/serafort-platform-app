import { useState } from 'react'
import { startAuthentication, startRegistration } from '@simplewebauthn/browser'
import { useQueryClient } from '@tanstack/react-query'
import { mfaService } from '../services/mfa.service'
import { MFA_QUERY_KEYS } from './useMfaQuery'

function detectDeviceFriendlyName(): string {
  if (typeof navigator === 'undefined') return 'Security Key'
  const ua = navigator.userAgent
  let os = 'Device'
  if (/Macintosh|Mac OS X/i.test(ua)) os = 'MacBook / Mac Passkey'
  else if (/Windows NT/i.test(ua)) os = 'Windows Hello'
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'Apple Device Passkey'
  else if (/Android/i.test(ua)) os = 'Android Passkey'
  else if (/Linux/i.test(ua)) os = 'Linux Security Key'

  return os
}

export function formatWebAuthnError(err: any): string {
  if (!err) return 'Passkey operation failed'
  if (err.name === 'NotAllowedError') {
    return 'Passkey prompt was cancelled or timed out.'
  }
  if (err.name === 'InvalidStateError') {
    return 'This passkey is already registered on this device.'
  }
  if (err.name === 'ConstraintError') {
    return 'Device authenticator constraint not satisfied.'
  }
  if (err.name === 'NotSupportedError') {
    return 'Passkeys / WebAuthn are not supported on this browser or platform.'
  }
  return err.response?.data?.message || err.response?.data?.error || err.message || 'Passkey operation failed'
}

export interface RegisterPasskeyOptions {
  email?: string
  friendlyName?: string
}

export const usePasskey = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

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
      const authResponse = await startAuthentication({ optionsJSON: optionsResponse.data })

      // 3. Verify the authentication response on the backend
      const verifyResponse = await mfaService.passkeys.verifyLogin(authResponse)

      return verifyResponse
    } catch (err: any) {
      const errorMessage = formatWebAuthnError(err)
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const registerPasskey = async (options?: RegisterPasskeyOptions) => {
    setIsLoading(true)
    setError(null)
    try {
      const friendlyName = options?.friendlyName || detectDeviceFriendlyName()

      // 1. Get registration options from backend
      const optionsResponse = await mfaService.passkeys.getRegistrationOptions(options?.email)

      if (!optionsResponse.data) {
        throw new Error('Failed to get passkey registration options')
      }

      // 2. Start browser-native WebAuthn registration
      const regResponse = await startRegistration({ optionsJSON: optionsResponse.data })

      // 3. Verify registration on backend with friendlyName
      const verifyResponse = await mfaService.passkeys.verifyRegistration({
        ...regResponse,
        friendlyName,
      })

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: MFA_QUERY_KEYS.passkeys })
      queryClient.invalidateQueries({ queryKey: MFA_QUERY_KEYS.methods })
      queryClient.invalidateQueries({ queryKey: MFA_QUERY_KEYS.securityStatus })

      return verifyResponse
    } catch (err: any) {
      const errorMessage = formatWebAuthnError(err)
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    loginWithPasskey,
    registerPasskey,
    isLoading,
    error,
    clearError: () => setError(null),
  }
}

export default usePasskey
