import React from 'react'
import { useAuth, useHasHydrated } from '@cap/platform-core'

export const useSessionGuard = () => {
  const hasHydrated = useHasHydrated()
  const { user, isAuthenticated, refreshAuth } = useAuth()
  const [isLoading, setIsLoading] = React.useState(true)
  const [sessionError, setSessionError] = React.useState<string | null>(null)

  // Use ref to track if component is mounted to prevent state updates on unmount
  const isMountedRef = React.useRef(false)
  const hasCheckedRef = React.useRef(false)

  React.useEffect(() => {
    isMountedRef.current = true

    const checkSession = async () => {
      // Wait for hydration to complete first
      if (!hasHydrated) {
        console.log('[SessionGuard] Waiting for hydration...')
        return
      }

      // Prevent duplicate checks
      if (hasCheckedRef.current) {
        return
      }
      hasCheckedRef.current = true

      console.log(
        '[SessionGuard] Hydration complete. isAuthenticated:',
        isAuthenticated,
        'user:',
        !!user,
      )

      try {
        // If user is already authenticated from persisted state, skip refreshAuth
        // This prevents unnecessary API calls and potential logouts
        if (isAuthenticated && user) {
          console.log('[SessionGuard] User already authenticated from persisted state')
          if (isMountedRef.current) setIsLoading(false)
          return
        }

        // Only call refreshAuth if we're not authenticated
        console.log('[SessionGuard] Not authenticated, calling refreshAuth...')
        if (typeof refreshAuth === 'function') {
          await refreshAuth()
        }
      } catch (error) {
        console.error('[SessionGuard] Check failed:', error)
        if (isMountedRef.current) setSessionError('Your session has expired. Please log in again.')
      } finally {
        if (isMountedRef.current) setIsLoading(false)
      }
    }

    checkSession()

    return () => {
      isMountedRef.current = false
    }
  }, [hasHydrated, isAuthenticated, user, refreshAuth])

  // If not hydrated yet, show loading
  if (!hasHydrated) {
    return {
      isLoading: true,
      sessionError: null,
      isAuthenticated: false,
      user: null,
    }
  }

  return {
    isLoading,
    sessionError,
    isAuthenticated,
    user,
  }
}
