import { useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import Fingerprint from '@mui/icons-material/Fingerprint'
import Security from '@mui/icons-material/Security'
import { useTranslation } from 'react-i18next'
import { usePasskey } from '../../hooks'

interface PasskeySetupProps {
  open?: boolean
  onClose?: () => void
  onSuccess?: () => void
  onError?: (error: string) => void
  friendlyName?: string
}

export default function PasskeySetup({
  open = true,
  onClose,
  onSuccess,
  onError,
  friendlyName,
}: PasskeySetupProps) {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false)
  const { registerPasskey, isLoading, error } = usePasskey()

  const handleSetupPasskey = async () => {
    setWaitingForConfirmation(true)
    try {
      await registerPasskey({ friendlyName })
      onSuccess?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : ''
      onError?.(
        message ||
          t('passkey.errorSetupFailed', 'Passkey registration was cancelled or did not complete.'),
      )
    } finally {
      setWaitingForConfirmation(false)
    }
  }

  const handleCancel = () => {
    if (!isLoading) onClose?.()
  }

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth='xs'
      fullWidth
      aria-labelledby='passkey-setup-title'
      // `PaperProps` is deprecated in MUI v7 in favour of slotProps.
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
            aria-hidden
            variant='square'
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
          id='passkey-setup-title'
          component='h2'
          variant='h5'
          sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.027em' }}
        >
          {t('passkey.setupTitle', 'Set up a passkey')}
        </Typography>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ mb: 4, lineHeight: 1.6, maxInlineSize: 340, mx: 'auto' }}
        >
          {t(
            'passkey.setupDesc',
            'Sign in with the fingerprint, face or security key you already use to unlock this device — no password to type or remember.',
          )}
        </Typography>

        {error && (
          // `textAlign: 'left'` pinned the message to the left even in Arabic.
          // The logical value follows the writing direction.
          <Alert severity='error' sx={{ mb: 3, borderRadius: 'var(--sf-radius-md, 8px)', textAlign: 'start' }}>
            {error}
          </Alert>
        )}

        {waitingForConfirmation && (
          <Stack spacing={1} sx={{ mb: 3 }}>
            <Stack
              direction='row'
              spacing={2}
              alignItems='center'
              justifyContent='center'
              role='status'
              sx={{ bgcolor: 'action.hover', borderRadius: 'var(--sf-radius-md, 8px)', py: 2, px: 3 }}
            >
              <CircularProgress size={20} thickness={4} />
              <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
                {t('passkey.waitingConfirmation', 'Waiting for confirmation…')}
              </Typography>
            </Stack>
            <Typography variant='caption' color='text.secondary'>
              {t('passkey.checkBrowser', 'Your browser or device should be asking you to confirm.')}
            </Typography>
          </Stack>
        )}

        <Button
          fullWidth
          variant='contained'
          // `color='info'` rather than a hand-set bgcolor: MUI then picks the
          // channel's own contrastText, which stays legible under a tenant
          // palette with a pale info colour.
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
            ? t('passkey.settingUp', 'Setting up…')
            : t('passkey.useSecurityKey', 'Use this device')}
        </Button>

        {/*
          Was a `<Link component='button' disabled>`. `disabled` is not a Link
          prop, so it reached the DOM without disabling anything: the cancel
          control stayed clickable during registration despite being styled as
          though it were not.
        */}
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

        <Stack
          direction='row'
          spacing={0.5}
          alignItems='center'
          justifyContent='center'
          sx={{ mt: 4 }}
        >
          <Security aria-hidden sx={{ fontSize: 14, color: 'text.disabled' }} />
          <Typography variant='caption' color='text.disabled' sx={{ fontWeight: 500 }}>
            {t('passkey.securedByWebauthn', 'Secured by WebAuthn')}
          </Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
