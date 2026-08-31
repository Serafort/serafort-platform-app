import { useState } from 'react'
import { Box, Button, Container, Typography, CircularProgress, alpha, Alert } from '@mui/material'
import Fingerprint from '@mui/icons-material/Fingerprint'
import Lock from '@mui/icons-material/Lock'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@cap/platform-store'
import { secureTokenManager } from '@cap/platform-core'
import { usePasskey } from '../../hooks'
import { Path as AuthPath } from '@cap/module-auth/routes/path'

export default function PlatformAuthLogin() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const setUser = useAppStore((state) => state.setUser)
  const setToken = useAppStore((state) => (state as any).setToken)
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
        if (setToken) setToken(response.data.token)
        secureTokenManager.setTokens({
          accessToken: response.data.token,
          expiresAt: Date.now() + (response.data.expires_in || 3600) * 1000,
        })
      }
      navigate(AuthPath.account.overview || '/dashboard')
    } catch (err: any) {
      setLocalError(err?.message || 'Biometric authentication was cancelled or failed.')
    }
  }

  const isScanning = isLoading
  const displayError = localError || passkeyError

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        {/* Animated Scanner */}
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            bgcolor: (theme) =>
              isScanning
                ? alpha(theme.palette.primary.main, 0.08)
                : alpha(theme.palette.primary.main, 0.05),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 4,
            position: 'relative',
            transition: 'all 0.3s ease',
            ...(isScanning && {
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%': {
                  boxShadow: (theme: any) => `0 0 0 0 ${alpha(theme.palette.primary.main, 0.2)}`,
                },
                '70%': {
                  boxShadow: (theme: any) => `0 0 0 20px ${alpha(theme.palette.primary.main, 0)}`,
                },
                '100%': {
                  boxShadow: (theme: any) => `0 0 0 0 ${alpha(theme.palette.primary.main, 0)}`,
                },
              },
            }),
          }}
        >
          {isScanning ? (
            <CircularProgress size={48} thickness={3} />
          ) : (
            <Fingerprint sx={{ fontSize: 56, color: 'primary.main' }} />
          )}
        </Box>

        <Typography variant="h5" fontWeight={700} letterSpacing="-0.02em" sx={{ mb: 1 }}>
          {isScanning
            ? t('passkey.verifying', 'Verifying your identity...')
            : t('passkey.use_biometric', 'Use Biometric to Sign In')}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 360, mx: 'auto' }}
        >
          {isScanning
            ? t(
                'passkey.follow_prompt',
                'Follow the prompt on your device to complete authentication.'
              )
            : t(
                'passkey.biometric_description',
                "Use your device's built-in authenticator — Touch ID, Face ID, or Windows Hello — for a fast, secure sign-in."
              )}
        </Typography>

        {displayError && (
          <Alert severity="error" sx={{ mb: 3, textAlign: 'left', borderRadius: 2 }}>
            {displayError}
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleStart}
          disabled={isScanning}
          startIcon={!isScanning && <Fingerprint />}
          endIcon={!isScanning && <ArrowForward />}
          sx={{
            py: 1.5,
            borderRadius: 2.5,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '1rem',
            mb: 2,
          }}
        >
          {isScanning
            ? t('passkey.authenticating', 'Authenticating...')
            : t('passkey.sign_in_biometric', 'Sign In with Biometrics')}
        </Button>

        <Button
          fullWidth
          variant="text"
          onClick={() => navigate('/auth/login')}
          sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}
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
          <Lock sx={{ fontSize: 14, color: 'text.disabled' }} />
          <Typography variant="caption" color="text.disabled">
            {t('passkey.fido2_secure', 'FIDO2 / WebAuthn Certified')}
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}
