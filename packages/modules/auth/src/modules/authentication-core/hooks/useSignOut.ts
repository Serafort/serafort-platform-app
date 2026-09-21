import { useNavigate } from 'react-router-dom'
import { useSignout } from './useAuthQuery'
import { useAuth, StorageManager } from '@cap/platform-core'
import { useAuthStore } from '../store'
import { AppPaths } from '@cap/shared-types'

interface UseSignOutOptions {
  redirectTo?: string
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

/**
 * Custom hook for handling user sign out
 *
 * Provides a unified signout function that:
 * - Calls the backend logout API
 * - Clears all authentication data
 * - Resets application state
 * - Redirects to specified page
 *
 * @example
 * ```tsx
 * const { signOut, isSigningOut } = useSignOut({
 *   redirectTo: AppPaths.auth.signin,
 *   onSuccess: () => console.log('Signed out successfully')
 * })
 *
 * <Button onClick={signOut}>Sign Out</Button>
 * ```
 */
export const useSignOut = (options: UseSignOutOptions = {}) => {
  const {
    redirectTo = AppPaths.auth.signin,
    onSuccess: customOnSuccess,
    onError: customOnError,
  } = options

  const navigate = useNavigate()
  const { signOut: zustandSignOut } = useAuth()
  const { clearAuth } = useAuthStore()
  const { setAuthStep } = useAuthStore()

  const { mutate: logout, isPending: isSigningOut } = useSignout({
    onSuccess: () => {
      // Clear platform-core store
      zustandSignOut()

      // Clear auth module store
      clearAuth()
      setAuthStep('credentials')

      // Clear all app data from storage (tokens, user data, etc.)
      StorageManager.clearAllUserData()

      // Call custom success callback
      customOnSuccess?.()

      // Redirect to specified page
      navigate(redirectTo, { replace: true })
    },
    onError: (error: unknown) => {
      // Even if API fails, clear local data
      zustandSignOut()
      clearAuth()
      setAuthStep('credentials')
      StorageManager.clearAllUserData()

      // Call custom error callback
      customOnError?.(error)

      // Still redirect to login
      navigate(redirectTo, { replace: true })
    },
  })

  const signOut = () => {
    logout()
  }

  return {
    signOut,
    isSigningOut,
  }
}

export default useSignOut
