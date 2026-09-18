import { useRef, useState } from 'react'
import {
  Box,
  Button,
  Typography,
  Divider,
  CircularProgress,
  Stack,
  Alert,
} from '@mui/material'
import Fingerprint from '@mui/icons-material/Fingerprint'
import ArrowForward from '@mui/icons-material/ArrowForward'
import Lock from '@mui/icons-material/Lock'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@cap/platform-store'
import { secureTokenManager } from '@cap/platform-core'
import {
  AuthPageLayout,
  AuthCard,
  AuthCardHeader,
  AuthInputLabel,
  AuthTextField,
} from '../../../authentication-core/components/shared/auth'
import { usePasskey } from '../../hooks'
import { Path } from '../../../../routes/path'
import { resolveRedirectPathForUser } from '../../../authentication-core/utils/resolveRedirect'

export default function PasskeyLoginOption() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  const {
    loginWithPasskey,
    isLoading: isAuthenticating,
    error: passkeyError,
    clearError,
  } = usePasskey()
  const setUser = useAppStore((state) => state.setUser)
  const setToken = useAppStore(
    (state) => (state as unknown as { setToken?: (token: string) => void }).setToken,
  )

  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handlePasskeyLogin = async () => {
    clearError()
    try {
      const response = await loginWithPasskey(email.trim() || undefined)
      const payload = response?.data

      if (!payload?.verified) {
        return
      }

      if (payload.user) {
        setUser(payload.user)
      }
      if (payload.token) {
        setToken?.(payload.token)
        secureTokenManager.setTokens({
          accessToken: payload.token,
          expiresAt: Date.now() + (payload.expires_in || 3600) * 1000,
        })
      }

      setSuccessMessage(t('passkey.loginSuccess', 'Passkey verified! Redirecting...'))

      const userObj = payload.user as Record<string, unknown> | undefined
      const role =
        (userObj?.role as string) ??
        (userObj?.roleId as number | undefined) ??
        ((userObj?.user as Record<string, unknown>)?.role as string | undefined)
      successTimer.current = setTimeout(() => {
        navigate(resolveRedirectPathForUser(role), { replace: true })
      }, 800)
    } catch {
      // Failure message is surfaced via `passkeyError` from usePasskey.
    }
  }

  return (
    <AuthPageLayout maxWidth={480}>
      <AuthCard padding='comfortable'>
        <AuthCardHeader
          icon={<Fingerprint sx={{ fontSize: 32 }} />}
          iconSize={64}
          title={t('passkey.welcomeBack', 'Welcome back')}
          subtitle={t('passkey.loginSubtitle', 'Sign in with your passkey for quick, secure access.')}
        />

        {passkeyError && (
          <Alert
            severity='error'
            role='alert'
            aria-live='polite'
            sx={{
              mb: 3,
              borderRadius: 'var(--sf-radius-md, 8px)',
              '& .MuiAlert-message': { fontWeight: 600 },
            }}
          >
            {passkeyError}
          </Alert>
        )}
        {successMessage && (
          <Alert
            severity='success'
            role='status'
            aria-live='polite'
            sx={{
              mb: 3,
              borderRadius: 'var(--sf-radius-md, 8px)',
              '& .MuiAlert-message': { fontWeight: 600 },
            }}
          >
            {successMessage}
          </Alert>
        )}

        <Stack spacing={3}>
          <Box>
            <AuthInputLabel htmlFor='passkey-email'>
              {t('passkey.emailLabel', 'Email Address')}
            </AuthInputLabel>
            <AuthTextField
              id='passkey-email'
              type='email'
              placeholder='you@example.com'
              value={email}
              autoComplete='username webauthn'
              onChange={(e) => setEmail(e.target.value)}
              disabled={isAuthenticating || Boolean(successMessage)}
            />
          </Box>

          <Button
            fullWidth
            variant='contained'
            size='large'
            onClick={handlePasskeyLogin}
            disabled={isAuthenticating || Boolean(successMessage)}
            startIcon={
              isAuthenticating ? <CircularProgress size={20} color='inherit' /> : <Fingerprint />
            }
            sx={{
              minHeight: 48,
              borderRadius: 'var(--sf-radius-lg, 12px)',
              fontWeight: 800,
              fontSize: '1rem',
              textTransform: 'none',
              bgcolor: 'info.main',
              color: 'info.contrastText',
              boxShadow: 'var(--sf-shadow-glow, none)',
              '&:hover': {
                bgcolor: 'info.dark',
              },
            }}
          >
            {isAuthenticating
              ? t('passkey.authenticating', 'Authenticating...')
              : t('passkey.loginPasskey', 'Sign in with Passkey')}
          </Button>

          <Divider sx={{ opacity: 0.6 }}>
            <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {t('common.or', 'OR')}
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant='outlined'
            size='large'
            endIcon={<ArrowForward />}
            onClick={() => navigate(Path.auth.signin)}
            disabled={isAuthenticating}
            sx={{
              minHeight: 48,
              borderRadius: 'var(--sf-radius-lg, 12px)',
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            {t('passkey.usePassword', 'Sign in with password')}
          </Button>
        </Stack>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography
            variant='caption'
            color='text.disabled'
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
          >
            <Lock sx={{ fontSize: 13 }} />
            {t(
              'passkey.phishingResistant',
              'Passkeys are phishing-resistant and encrypted end-to-end.',
            )}
          </Typography>
        </Box>
      </AuthCard>
    </AuthPageLayout>
  )
}
