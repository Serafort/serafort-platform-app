import { useState } from 'react'
import { errorMessage } from '../../utils/errors'
import type { Theme } from '@mui/material/styles'
import { Box, Button, Typography, CircularProgress, alpha, Alert } from '@mui/material'
import Fingerprint from '@mui/icons-material/Fingerprint'
import Lock from '@mui/icons-material/Lock'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@cap/platform-store'
import { secureTokenManager } from '@cap/platform-core'
import {
  AuthPageLayout,
  AuthCard,
} from '../../../authentication-core/components/shared/auth'
import { usePasskey } from '../../hooks'
import { Path as AuthPath } from '@cap/module-auth/routes/path'
import { AppPaths } from '@cap/shared-types'

export default function PlatformAuthLogin() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const setUser = useAppStore((state) => state.setUser)
  const { loginWithPasskey, isLoading, error: passkeyError } = usePasskey()
  const [localError, setLocalError] = useState<string | null>(null)

  const handleStart = async () => {
    setLocalError(null)
    try {
      const response = await loginWithPasskey()
      if (response?.data?.user) {
        setUser(response.data.user)
      }
      if (response?.data?.token) {
        secureTokenManager.setTokens({
          accessToken: response.data.token,
          expiresAt: Date.now() + (response.data.expires_in || 3600) * 1000,
        })
      }
      navigate(AuthPath.account.overview)
    } catch (err: unknown) {
      setLocalError(
        errorMessage(err) ||
          t('passkey.biometric_cancelled', 'Biometric authentication was cancelled or failed.'),
      )
    }
  }

  const isScanning = isLoading
  const displayError = localError || passkeyError

  return (
    <AuthPageLayout maxWidth={480}>
      <AuthCard padding='comfortable'>
        <Box sx={{ textAlign: 'center' }}>
          {/* Animated Scanner */}
          <Box
            sx={{
              width: 110,
              height: 110,
              borderRadius: '50%',
              bgcolor: (theme) =>
                isScanning
                  ? alpha(theme.palette.primary.main, 0.12)
                  : alpha(theme.palette.primary.main, 0.06),
              border: (theme) => `2px solid ${alpha(theme.palette.primary.main, isScanning ? 0.6 : 0.2)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              position: 'relative',
              transition: 'all 0.3s ease',
              ...(isScanning && {
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%': {
                    boxShadow: (theme: Theme) => `0 0 0 0 ${alpha(theme.palette.primary.main, 0.3)}`,
                  },
                  '70%': {
                    boxShadow: (theme: Theme) => `0 0 0 18px ${alpha(theme.palette.primary.main, 0)}`,
                  },
                  '100%': {
                    boxShadow: (theme: Theme) => `0 0 0 0 ${alpha(theme.palette.primary.main, 0)}`,
                  },
                },
              }),
            }}
          >
            {isScanning ? (
              <CircularProgress size={44} thickness={3} />
            ) : (
              <Fingerprint sx={{ fontSize: 52, color: 'primary.main' }} />
            )}
          </Box>

          <Typography variant='h5' fontWeight={800} letterSpacing='-0.02em' sx={{ mb: 1 }}>
            {isScanning
              ? t('passkey.verifying', 'Verifying your identity...')
              : t('passkey.use_biometric', 'Use Biometric to Sign In')}
          </Typography>
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ mb: 3.5, maxWidth: 360, mx: 'auto', lineHeight: 1.6 }}
          >
            {isScanning
              ? t(
                  'passkey.follow_prompt',
                  'Follow the prompt on your device to complete authentication.',
                )
              : t(
                  'passkey.biometric_description',
                  "Use your device's built-in authenticator — Touch ID, Face ID, or Windows Hello — for a fast, secure sign-in.",
                )}
          </Typography>

          {displayError && (
            <Alert
              severity='error'
              role='alert'
              aria-live='polite'
              sx={{
                mb: 3,
                textAlign: 'start',
                borderRadius: 'var(--sf-radius-md, 8px)',
                '& .MuiAlert-message': { fontWeight: 600 },
              }}
            >
              {displayError}
            </Alert>
          )}

          <Button
            fullWidth
            variant='contained'
            size='large'
            onClick={handleStart}
            disabled={isScanning}
            startIcon={!isScanning && <Fingerprint />}
            endIcon={!isScanning && <ArrowForward />}
            sx={{
              minHeight: 48,
              borderRadius: 'var(--sf-radius-lg, 12px)',
              fontWeight: 800,
              textTransform: 'none',
              fontSize: '1rem',
              mb: 1.5,
              boxShadow: 'var(--sf-shadow-glow, none)',
            }}
          >
            {isScanning
              ? t('passkey.authenticating', 'Authenticating...')
              : t('passkey.sign_in_biometric', 'Sign In with Biometrics')}
          </Button>

          <Button
            fullWidth
            variant='text'
            onClick={() => navigate(AppPaths.auth.signin)}
            sx={{
              minHeight: 44,
              textTransform: 'none',
              color: 'text.secondary',
              fontWeight: 600,
              '&:hover': { color: 'text.primary' },
            }}
          >
            {t('passkey.use_password_instead', 'Use password instead')}
          </Button>

          <Box
            sx={{
              mt: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
            }}
          >
            <Lock sx={{ fontSize: 13, color: 'text.disabled' }} />
            <Typography variant='caption' color='text.disabled'>
              {t('passkey.fido2_secure', 'FIDO2 / WebAuthn Certified')}
            </Typography>
          </Box>
        </Box>
      </AuthCard>
    </AuthPageLayout>
  )
}
