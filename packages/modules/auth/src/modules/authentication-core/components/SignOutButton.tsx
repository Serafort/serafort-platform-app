import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, IconButton, Tooltip, CircularProgress } from '@mui/material'
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import { useSignout } from '@idaas/authentication-core/hooks/useAuthQuery'
import { useTranslation } from 'react-i18next'
import { useAuth, StorageManager } from '@cap/platform-core'
import { Path } from '../../../routes/path';
import logger from '@idaas/authentication-core/utils/logger'

interface SignOutButtonProps {
  variant?: 'button' | 'icon'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
  showText?: boolean
  onSignOutComplete?: () => void
}

/**
 * SignOut Button Component
 *
 * Handles user logout with proper cleanup:
 * - Calls backend logout endpoint
 * - Clears authentication tokens
 * - Clears user data from storage
 * - Resets Zustand store
 * - Clears React Query cache
 * - Redirects to login page
 */
export const SignOutButton: React.FC<SignOutButtonProps> = ({
  variant = 'button',
  size = 'medium',
  fullWidth = false,
  showText = true,
  onSignOutComplete,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { signOut: zustandSignOut } = useAuth()

  const { mutate: logout, isPending } = useSignout({
    onSuccess: () => {
      // Clear Zustand store
      zustandSignOut()

      // Clear all app data from storage
      StorageManager.clearAllUserData()

      // Call custom callback if provided
      onSignOutComplete?.()

      // Redirect to login page
      navigate(Path.auth.signin, { replace: true })
    },
    onError: (error: unknown) => {
      logger.error('Logout request failed; clearing local session anyway', { error })

      // Even if API call fails, clear local data and redirect
      zustandSignOut()
      StorageManager.clearAllUserData()
      onSignOutComplete?.()
      navigate(Path.auth.signin, { replace: true })
    },
  })

  const handleSignOut = () => {
    logout()
  }

  if (variant === 'icon') {
    return (
      <Tooltip title={t('auth.profile.logout')}>
        <IconButton
          onClick={handleSignOut}
          disabled={isPending}
          size={size}
          color='inherit'
          aria-label={t('auth.profile.logout')}
        >
          {isPending ? <CircularProgress size={20} color='inherit' /> : <LogoutOutlined />}
        </IconButton>
      </Tooltip>
    )
  }

  return (
    <Button
      onClick={handleSignOut}
      disabled={isPending}
      size={size}
      fullWidth={fullWidth}
      variant='outlined'
      color='error'
      startIcon={isPending ? <CircularProgress size={16} /> : <LogoutOutlined />}
      aria-label={t('auth.profile.logout')}
    >
      {showText && (isPending ? t('auth.profile.signing_out') : t('auth.profile.logout'))}
    </Button>
  )
}

export default SignOutButton

