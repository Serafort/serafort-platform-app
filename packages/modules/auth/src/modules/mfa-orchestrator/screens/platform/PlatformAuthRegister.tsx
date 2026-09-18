import { useState } from 'react'
import {
  Box,
  Button,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  alpha,
  Alert,
} from '@mui/material'
import Fingerprint from '@mui/icons-material/Fingerprint'
import Lock from '@mui/icons-material/Lock'
import CheckCircle from '@mui/icons-material/CheckCircle'
import PhoneIphone from '@mui/icons-material/PhoneIphone'
import Shield from '@mui/icons-material/Shield'
import Speed from '@mui/icons-material/Speed'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { usePasskey } from '../../hooks'
import { Path as AuthPath } from '@cap/module-auth/routes/path'

const BENEFITS = [
  { icon: <Shield />, text: 'Phishing-resistant authentication' },
  { icon: <Speed />, text: 'Faster sign-in than passwords' },
  { icon: <PhoneIphone />, text: 'Works with your device biometrics' },
  { icon: <Lock />, text: 'Your biometric data never leaves your device' },
]

const STEPS = ['Review Benefits', 'Register Authenticator']

export default function PlatformAuthRegister() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const { registerPasskey, isLoading, error: passkeyError } = usePasskey()

  const handleRegister = async () => {
    setLocalError(null)
    try {
      await registerPasskey()
      setIsComplete(true)
    } catch (err: any) {
      setLocalError(err?.message || 'Failed to register biometric authenticator.')
    }
  }

  const displayError = localError || passkeyError

  return (
    <Container maxWidth='sm' sx={{ py: 6 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: (theme) =>
              isComplete
                ? alpha(theme.palette.success.main, 0.1)
                : alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            transition: 'all 0.3s ease',
          }}
        >
          {isComplete ? (
            <CheckCircle sx={{ fontSize: 36, color: 'success.main' }} />
          ) : (
            <Fingerprint sx={{ fontSize: 36, color: 'primary.main' }} />
          )}
        </Box>
        <Typography variant='h5' fontWeight={700} letterSpacing='-0.02em' sx={{ mb: 0.5 }}>
          {isComplete
            ? t('passkey.registration_complete', 'Passkey Registered!')
            : t('passkey.set_up_biometric', 'Set Up Biometric Sign-In')}
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          {isComplete
            ? t(
                'passkey.can_now_sign_in',
                'You can now sign in using Touch ID, Face ID, or Windows Hello.',
              )
            : t(
                'passkey.registration_subtitle',
                'Enable instant, secure sign-in with your device biometrics.',
              )}
        </Typography>
      </Box>

      {/* Stepper */}
      {!isComplete && (
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}

      {displayError && (
        <Alert severity='error' sx={{ mb: 3, borderRadius: 2 }}>
          {displayError}
        </Alert>
      )}

      {/* Step 0: Review Benefits */}
      {!isComplete && activeStep === 0 && (
        <Box>
          <List sx={{ mb: 4 }}>
            {BENEFITS.map((benefit, index) => (
              <ListItem
                key={index}
                sx={{
                  py: 1.5,
                  px: 2,
                  mb: 1,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                }}
              >
                <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                  {benefit.icon}
                </ListItemIcon>
                <ListItemText primary={benefit.text} primaryTypographyProps={{ fontWeight: 500 }} />
              </ListItem>
            ))}
          </List>

          <Button
            fullWidth
            variant='contained'
            size='large'
            onClick={() => setActiveStep(1)}
            endIcon={<ArrowForward />}
            sx={{ py: 1.5, borderRadius: 2.5, fontWeight: 700, textTransform: 'none', mb: 2 }}
          >
            {t('common.continue', 'Continue')}
          </Button>
          <Button
            fullWidth
            variant='text'
            onClick={() => navigate(-1)}
            sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}
          >
            {t('common.skip_for_now', 'Skip for now')}
          </Button>
        </Box>
      )}

      {/* Step 1: Register Authenticator */}
      {!isComplete && activeStep === 1 && (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
            {t(
              'passkey.click_to_prompt',
              'Click below to register this device. Your browser will prompt you to authenticate using biometrics or a security key.',
            )}
          </Typography>

          <Button
            fullWidth
            variant='contained'
            size='large'
            onClick={handleRegister}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color='inherit' /> : <Fingerprint />}
            sx={{ py: 1.5, borderRadius: 2.5, fontWeight: 700, textTransform: 'none', mb: 2 }}
          >
            {isLoading
              ? t('passkey.prompting_device', 'Prompting device...')
              : t('passkey.register_this_device', 'Register This Device')}
          </Button>

          <Button
            fullWidth
            variant='text'
            onClick={() => setActiveStep(0)}
            disabled={isLoading}
            sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}
          >
            {t('common.back', 'Back')}
          </Button>
        </Box>
      )}

      {/* Complete State */}
      {isComplete && (
        <Box sx={{ textAlign: 'center' }}>
          <Button
            fullWidth
            variant='contained'
            size='large'
            onClick={() => navigate(AuthPath.account.overview || '/dashboard')}
            endIcon={<ArrowForward />}
            sx={{ py: 1.5, borderRadius: 2.5, fontWeight: 700, textTransform: 'none' }}
          >
            {t('passkey.go_to_account', 'Go to Account Overview')}
          </Button>
        </Box>
      )}
    </Container>
  )
}
