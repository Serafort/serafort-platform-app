import { useEffect, useState, useRef } from 'react';
import { startAuthentication, browserSupportsWebAuthnAutofill } from '@simplewebauthn/browser';
import { mfaService } from '../services/mfa.service';
import { useAuthStore } from '@cap/module-auth/modules/authentication-core/store';
import { secureTokenManager, sessionStorageManager } from '@cap/platform-core';

/**
 * Hook to implement WebAuthn Conditional UI (Passkey Autofill)
 * @param onSuccess Callback for successful login
 */
export function usePasskeyAutofill(onSuccess?: () => void) {
  const [isAvailable, setIsAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)

  const initializedRef = useRef(false)
  const { setAuthenticated, setUser, setAuthStep, setSessionId } = useAuthStore()

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    let mounted = true

    const initAutofill = async () => {
      // 1. Check browser support for WebAuthn and Conditional UI
      const available = await browserSupportsWebAuthnAutofill()
      if (!mounted) return

      setIsAvailable(available)

      if (!available) return

      try {
        setIsLoading(true)

        // 2. Create abort controller for cleanup
        abortControllerRef.current = new AbortController()

        // 3. Get authentication options from backend
        const optionsResponse = await mfaService.passkeys.getLoginOptions()
        if (!mounted) return

        if (!optionsResponse.data) {
          throw new Error('Failed to get passkey login options')
        }

        // 4. Start authentication with explicit conditional mediation
        const authResponse = await startAuthentication({
          ...optionsResponse.data,
          mediation: 'conditional',
        })

        if (!mounted) return

        // 5. Verify authentication response
        const verifyResponse = await mfaService.passkeys.verifyLogin(authResponse)

        if (verifyResponse.data.token) {
          const expiresIn = verifyResponse.data.expires_in || 3600
          const expiresAt = Date.now() + expiresIn * 1000

          secureTokenManager.setTokens({
            accessToken: verifyResponse.data.token,
            expiresAt,
          })

          setUser(verifyResponse.data.user)
          setAuthenticated(true)
          setAuthStep('complete')

          if (verifyResponse.data.userId) {
            setSessionId(verifyResponse.data.userId.toString())
          }

          try {
            sessionStorageManager.set('user', verifyResponse.data.user)
          } catch (storageErr) {
            console.warn('[usePasskeyAutofill] Storage error:', storageErr)
          }

          onSuccess?.()
        }
      } catch (err: any) {
        // AbortError is expected if we call abort() or if browser cancels
        if (err.name === 'AbortError' || err.message?.includes('The user aborted a request')) {
          return
        }

        console.error('[usePasskeyAutofill] error:', err)
        setError(err.message || 'Passkey autofill failed')
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initAutofill()

    return () => {
      mounted = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort('Component unmounted')
        abortControllerRef.current = null
      }
    }
  }, [onSuccess, setAuthenticated, setUser, setAuthStep, setSessionId])

  return { isAvailable, isLoading, error }
}
