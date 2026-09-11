import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogContent,
  CircularProgress,
  Link,
  Avatar,
  alpha,
  useTheme,
  Alert,
} from '@mui/material'
import Fingerprint from '@mui/icons-material/Fingerprint'
import Security from '@mui/icons-material/Security'
import { useTranslation } from 'react-i18next'
import { usePasskey } from '../../hooks'

interface PasskeySetupAutoProps {
  open?: boolean
  onClose?: () => void
  onSuccess?: () => void
  onError?: (error: string) => void
  autoStart?: boolean
  friendlyName?: string
}

export default function PasskeySetupAuto({
  open = true,
  onClose,
  onSuccess,
  onError,
  autoStart = true,
  friendlyName,
}: PasskeySetupAutoProps) {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false)
  const { registerPasskey, isLoading, error } = usePasskey()

  const handleSetupPasskey = useCallback(async () => {
    setWaitingForConfirmation(true)
    try {
      await registerPasskey({ friendlyName })
      onSuccess?.()
    } catch (err: any) {
      onError?.(
        err.message || t('passkey.errorSetupFailed', 'Passkey registration cancelled or failed'),
      )
    } finally {
      setWaitingForConfirmation(false)
    }
  }, [registerPasskey, friendlyName, onSuccess, onError, t])

  useEffect(() => {
    if (open && autoStart && !isLoading) {
      const timer = setTimeout(() => handleSetupPasskey(), 300)
      return () => clearTimeout(timer)
    }
  }, [open, autoStart, handleSetupPasskey, isLoading])

  const handleCancel = () => {
    if (!isLoading) onClose?.()
  }

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth='xs'
      fullWidth
      aria-labelledby='passkey-setup-auto-title'
      slotProps={{
        paper: {
          sx: {
            borderRadius: 'var(--sf-radius-lg, 12px)',
            p: 2,
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            border: '1px solid',
            borderColor: 'divider',
          },
        },
      }}
    >
      <DialogContent sx={{ px: 4, py: 5, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Avatar
            variant='square'
            aria-hidden
            sx={{
              width: 56,
              height: 56,
              bgcolor: 'transparent',
              color: 'primary.main',
              borderRadius: 'var(--sf-radius-lg, 12px)',
              border: '2px solid',
              borderColor: alpha(theme.palette.primary.main, 0.2),
            }}
          >
            <Fingerprint sx={{ fontSize: 32 }} />
          </Avatar>
        </Box>

        <Typography
          id='passkey-setup-auto-title'
          component='h2'
          variant='h5'
          sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}
        >
          {t('passkey.setupTitle', 'Set up a passkey')}
        </Typography>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ mb: 4, lineHeight: 1.6, maxWidth: 340, mx: 'auto' }}
        >
          {t(
            'passkey.setupDesc',
            'Use your device biometrics or security key to sign in without a password.',
          )}
        </Typography>

        {error && (
          <Alert severity='error' sx={{ mb: 3, borderRadius: 'var(--sf-radius-md, 8px)', textAlign: 'start' }}>
            {error}
          </Alert>
        )}

        {(waitingForConfirmation || (autoStart && !isLoading && open)) && (
          <Box
            role='status'
            sx={{
              bgcolor: 'action.hover',
              borderRadius: 'var(--sf-radius-md, 8px)',
              py: 2,
              px: 3,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <CircularProgress size={20} thickness={4} />
            <Typography variant='body2' color='text.secondary' fontWeight={500}>
              {t('passkey.waitingConfirmation', 'Waiting for confirmation...')}
            </Typography>
          </Box>
        )}
        {(waitingForConfirmation || autoStart) && (
          <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 3 }}>
            {t('passkey.checkBrowser', 'Check your browser or device for the prompt.')}
          </Typography>
        )}

        {!waitingForConfirmation && (
          <Button
            fullWidth
            variant='contained'
            color='info'
            startIcon={<Security />}
            onClick={handleSetupPasskey}
            disabled={isLoading}
            sx={{
              minHeight: 48,
              mb: 2,
              borderRadius: 'var(--sf-radius-lg, 12px)',
              fontWeight: 800,
              textTransform: 'none',
              boxShadow: 'var(--sf-shadow-glow, none)',
            }}
          >
            {isLoading
              ? t('passkey.settingUp', 'Setting up...')
              : t('passkey.useSecurityKey', 'Use Security Key')}
          </Button>
        )}

        <Button
          fullWidth
          variant='text'
          onClick={handleCancel}
          disabled={isLoading}
          sx={{
            minHeight: 44,
            fontWeight: 600,
            textTransform: 'none',
            color: 'text.secondary',
            '&:hover': { color: 'text.primary' },
          }}
        >
          {t('common.cancel', 'Cancel')}
        </Button>

        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 4 }}
        >
          <Security sx={{ fontSize: 14, color: 'text.disabled' }} />
          <Typography variant='caption' color='text.disabled' fontWeight={500}>
            {t('passkey.securedByWebauthn', 'Secured by WebAuthn')}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
