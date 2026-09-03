import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@cap/platform-core'

interface UseSignOutOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

interface UseSignOutReturn {
  signOut: () => Promise<void>
  isSigningOut: boolean
}

/**
 * Hook for signing out the current user
 * TODO: Implement full sign-out logic when Auth service is ready
 */
export const useSignOut = (options?: UseSignOutOptions): UseSignOutReturn => {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const navigate = useNavigate()
  const { signOut: authSignOut } = useAuth()

  const signOut = useCallback(async () => {
    try {
      setIsSigningOut(true)

      // Call existing signOut method from store
      await authSignOut()

      // Navigate to login
      navigate('/auth/signin')

      // Call success callback
      options?.onSuccess?.()
    } catch (error) {
      console.error('[useSignOut] Sign out failed:', error)
      options?.onError?.(error as Error)
    } finally {
      setIsSigningOut(false)
    }
  }, [navigate, authSignOut, options])

  return {
    signOut,
    isSigningOut,
  }
}
