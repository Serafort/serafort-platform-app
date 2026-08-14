import { useState } from 'react'
import { Box, Button, Container, Typography, CircularProgress, alpha } from '@mui/material'
import Fingerprint from '@mui/icons-material/Fingerprint';
import Lock from '@mui/icons-material/Lock';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { useTranslation } from 'react-i18next'

export default function PlatformAuthLogin() {
  const { t } = useTranslation()
  const [isScanning, setIsScanning] = useState(false)

  const handleStart = () => {
    setIsScanning(true)
    setTimeout(() => setIsScanning(false), 5173)
  }

  return (
    <Container maxWidth='xs' sx={{ py: 8 }}>
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

        <Typography variant='h5' fontWeight={700} letterSpacing='-0.02em' sx={{ mb: 1 }}>
          {isScanning
            ? t('auth.passkey.verifying', 'Verifying your identity...')
            : t('auth.passkey.use_biometric', 'Use Biometric to Sign In')}
        </Typography>
        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ mb: 4, maxWidth: 360, mx: 'auto' }}
        >
          {isScanning
            ? t(
                'auth.passkey.follow_prompt',
                'Follow the prompt on your device to complete authentication.',
              )
            : t(
                'auth.passkey.biometric_description',
                "Use your device's built-in authenticator — Touch ID, Face ID, or Windows Hello — for a fast, secure sign-in.",
              )}
        </Typography>

        {!isScanning && (
          <Button
            variant='contained'
            size='large'
            onClick={handleStart}
            startIcon={<Fingerprint />}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              borderRadius: 2,
              py: 1.5,
              px: 5,
              mb: 2,
            }}
          >
            {t('auth.passkey.start_scan', 'Start Authentication')}
          </Button>
        )}

        {!isScanning && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant='text'
              endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
              sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
            >
              {t('auth.passkey.try_another', 'Try another method')}
            </Button>
          </Box>
        )}

        {/* Footer */}
        <Box sx={{ mt: 6 }}>
          <Typography
            variant='caption'
            color='text.disabled'
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
          >
            <Lock sx={{ fontSize: 12 }} />
            {t('auth.passkey.biometric_local', 'Your biometric data never leaves this device.')}
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}
