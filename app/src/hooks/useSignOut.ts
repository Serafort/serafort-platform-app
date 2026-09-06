import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@cap/platform-core'
import { useSignout } from '@cap/module-auth'
import { Path } from '@/routes'

interface UseSignOutOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

interface UseSignOutReturn {
  signOut: () => Promise<void>
  isSigningOut: boolean
}

/**
 * Hook for signing out the current user. Calls the backend logout API,
 * delegates to the auth store's `signOut` (clears local auth state), and then
 * redirects to the sign-in route.
 */
export const useSignOut = (options?: UseSignOutOptions): UseSignOutReturn => {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const navigate = useNavigate()
  const { signOut: authSignOut } = useAuth()
  const { mutateAsync: logoutAsync } = useSignout()

  const signOut = useCallback(async () => {
    try {
      setIsSigningOut(true)

      // Call the backend logout API first
      try {
        await logoutAsync()
      } catch (error) {
        console.error('[useSignOut] Backend logout failed:', error)
        // Continue with local signout even if backend fails
      }

      // Call existing signOut method from store (clears local auth state)
      await authSignOut()

      // Navigate to login
      navigate(Path.auth.signin)

      // Call success callback
      options?.onSuccess?.()
    } catch (error) {
      console.error('[useSignOut] Sign out failed:', error)
      options?.onError?.(error as Error)
    } finally {
      setIsSigningOut(false)
    }
  }, [navigate, authSignOut, logoutAsync, options])

  return {
    signOut,
    isSigningOut,
  }
}
