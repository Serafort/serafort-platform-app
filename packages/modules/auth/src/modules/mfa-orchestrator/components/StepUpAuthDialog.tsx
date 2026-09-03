import React, { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  TextField,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  IconButton,
  alpha,
  useTheme,
  Stack,
  Divider,
} from '@mui/material'
import Fingerprint from '@mui/icons-material/Fingerprint'
import VpnKey from '@mui/icons-material/VpnKey'
import Shield from '@mui/icons-material/Shield'
import Close from '@mui/icons-material/Close'
import Lock from '@mui/icons-material/Lock'
import ArrowForward from '@mui/icons-material/ArrowForward'
import Security from '@mui/icons-material/Security'
import DeleteForever from '@mui/icons-material/DeleteForever'
import Key from '@mui/icons-material/Key'
import { useTranslation } from 'react-i18next'
import { StepUpActionMetadata } from '../hooks/useStepUpAuth'

export interface StepUpAuthDialogProps {
  open: boolean
  onClose: () => void
  onVerifyBiometric: () => Promise<any>
  onVerifyTotp: (code: string) => Promise<any>
  isVerifying?: boolean
  error?: string | null
  metadata?: StepUpActionMetadata | null
}

export const StepUpAuthDialog: React.FC<StepUpAuthDialogProps> = ({
  open,
  onClose,
  onVerifyBiometric,
  onVerifyTotp,
  isVerifying = false,
  error = null,
  metadata,
}) => {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const [tab, setTab] = useState<'biometric' | 'totp'>('biometric')
  const [totpCode, setTotpCode] = useState('')
  const [isBiometricPromptActive, setIsBiometricPromptActive] = useState(false)

  const handleBiometricClick = async () => {
    setIsBiometricPromptActive(true)
    try {
      await onVerifyBiometric()
    } catch {
      // Handled via error prop
    } finally {
      setIsBiometricPromptActive(false)
    }
  }

  const handleTotpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (totpCode.length !== 6) return
    try {
      await onVerifyTotp(totpCode)
    } catch {
      // Handled via error prop
    }
  }

  const getActionIcon = () => {
    switch (metadata?.icon) {
      case 'delete':
        return <DeleteForever sx={{ fontSize: 32, color: 'error.main' }} />
      case 'key':
        return <Key sx={{ fontSize: 32, color: 'primary.main' }} />
      case 'security':
        return <Security sx={{ fontSize: 32, color: 'info.main' }} />
      case 'lock':
        return <Lock sx={{ fontSize: 32, color: 'warning.main' }} />
      case 'shield':
      default:
        return <Shield sx={{ fontSize: 32, color: 'primary.main' }} />
    }
  }

  return (
    <Dialog
      open={open}
      onClose={isVerifying ? undefined : onClose}
      maxWidth='xs'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
          border: '1px solid ' + theme.palette.divider,
          boxShadow: '0 24px 48px -12px rgba(0,0,0,0.25)',
          bgcolor: 'background.paper',
        },
      }}
    >
      <DialogTitle
        sx={{ p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '16px',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {getActionIcon()}
          </Box>
          <Box>
            <Typography variant='subtitle1' sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              {t('mfa.stepUpHeading', 'Elevated Access Required')}
            </Typography>
            <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
              {metadata?.actionName || t('mfa.sensitiveAction', 'Protected Action')}
            </Typography>
          </Box>
        </Box>
        <IconButton
          size='small'
          onClick={onClose}
          disabled={isVerifying}
          aria-label='close'
          sx={{ color: 'text.secondary' }}
        >
          <Close fontSize='small' />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 1, textAlign: 'center' }}>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2.5, lineHeight: 1.5 }}>
          {metadata?.actionDescription ||
            t(
              'mfa.stepUpDesc',
              'To protect your tenant data, please verify your identity using WebAuthn biometrics, a security key, or your authenticator app.',
            )}
        </Typography>

        {error && (
          <Alert
            severity='error'
            sx={{ mb: 2.5, borderRadius: 2, textAlign: 'left', fontWeight: 600 }}
          >
            {error}
          </Alert>
        )}

        <Tabs
          value={tab}
          onChange={(_e, v) => setTab(v)}
          variant='fullWidth'
          sx={{
            mb: 3,
            minHeight: 40,
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 40,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.875rem',
            },
          }}
        >
          <Tab
            icon={<Fingerprint fontSize='small' />}
            iconPosition='start'
            label={t('mfa.biometricPasskey', 'Passkey / Biometric')}
            value='biometric'
          />
          <Tab
            icon={<VpnKey fontSize='small' />}
            iconPosition='start'
            label={t('mfa.totpCode', 'Authenticator Code')}
            value='totp'
          />
        </Tabs>

        {tab === 'biometric' ? (
          <Box sx={{ py: 1 }}>
            {/* Animated Biometric Scanner */}
            <Box
              onClick={!isVerifying ? handleBiometricClick : undefined}
              sx={{
                width: 104,
                height: 104,
                borderRadius: '50%',
                bgcolor: isBiometricPromptActive
                  ? alpha(theme.palette.primary.main, 0.15)
                  : alpha(theme.palette.primary.main, 0.06),
                border: '2px solid',
                borderColor: isBiometricPromptActive
                  ? 'primary.main'
                  : alpha(theme.palette.primary.main, 0.2),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                cursor: isVerifying ? 'default' : 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  transform: 'scale(1.04)',
                },
                ...(isBiometricPromptActive && {
                  animation: 'scannerPulse 1.5s infinite ease-in-out',
                  '@keyframes scannerPulse': {
                    '0%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.4)}` },
                    '70%': { boxShadow: `0 0 0 16px ${alpha(theme.palette.primary.main, 0)}` },
                    '100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0)}` },
                  },
                }),
              }}
            >
              {isBiometricPromptActive ? (
                <CircularProgress size={44} thickness={3} />
              ) : (
                <Fingerprint sx={{ fontSize: 52, color: 'primary.main' }} />
              )}
            </Box>

            <Typography variant='subtitle1' sx={{ fontWeight: 800, mb: 0.5 }}>
              {isBiometricPromptActive
                ? t('mfa.waitingPrompt', 'Checking device authenticator...')
                : t('mfa.touchBiometric', 'Use Touch ID, Face ID, or Windows Hello')}
            </Typography>
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 3 }}>
              {t(
                'mfa.biometricHint',
                'Touch your fingerprint sensor or security key when prompted.',
              )}
            </Typography>

            <Button
              fullWidth
              variant='contained'
              size='large'
              startIcon={<Fingerprint />}
              onClick={handleBiometricClick}
              disabled={isVerifying}
              sx={{
                py: 1.3,
                borderRadius: 2.5,
                fontWeight: 800,
                textTransform: 'none',
                bgcolor: 'info.main',
                boxShadow: `0 4px 14px ${alpha(theme.palette.info.main, 0.4)}`,
                '&:hover': { bgcolor: 'info.dark' },
              }}
            >
              {isVerifying
                ? t('mfa.verifying', 'Verifying...')
                : t('mfa.authenticateNow', 'Authenticate with Biometrics')}
            </Button>
          </Box>
        ) : (
          <Box component='form' onSubmit={handleTotpSubmit} sx={{ py: 1 }}>
            <Typography
              variant='caption'
              sx={{
                fontWeight: 800,
                textTransform: 'uppercase',
                ml: 0.5,
                mb: 1,
                display: 'block',
                color: 'text.secondary',
                textAlign: 'left',
              }}
            >
              {t('mfa.enterTotp', '6-Digit Authenticator Code')}
            </Typography>
            <TextField
              fullWidth
              autoFocus
              variant='outlined'
              placeholder='000 000'
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={isVerifying}
              inputProps={{
                style: {
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  letterSpacing: '8px',
                  fontWeight: 800,
                },
                maxLength: 6,
              }}
              slotProps={{
                input: {
                  sx: {
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.background.paper, 0.6),
                    mb: 3,
                  },
                },
              }}
            />

            <Button
              fullWidth
              type='submit'
              variant='contained'
              size='large'
              endIcon={<ArrowForward />}
              disabled={totpCode.length !== 6 || isVerifying}
              sx={{
                py: 1.3,
                borderRadius: 2.5,
                fontWeight: 800,
                textTransform: 'none',
                bgcolor: 'info.main',
                boxShadow: `0 4px 14px ${alpha(theme.palette.info.main, 0.4)}`,
                '&:hover': { bgcolor: 'info.dark' },
              }}
            >
              {isVerifying
                ? t('mfa.verifying', 'Verifying...')
                : t('mfa.verifyCodeButton', 'Verify & Elevate Session')}
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 3, opacity: 0.5 }} />

        <Stack direction='row' spacing={0.5} justifyContent='center' alignItems='center'>
          <Lock sx={{ fontSize: 13, color: 'text.disabled' }} />
          <Typography variant='caption' color='text.disabled' sx={{ fontWeight: 600 }}>
            {t('mfa.elevationWindowNote', 'Grants a 15-minute elevated session context')}
          </Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}

export default StepUpAuthDialog
