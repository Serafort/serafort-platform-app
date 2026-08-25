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
import Fingerprint from '@mui/icons-material/Fingerprint';
import Lock from '@mui/icons-material/Lock';
import CheckCircle from '@mui/icons-material/CheckCircle';
import PhoneIphone from '@mui/icons-material/PhoneIphone';
import Shield from '@mui/icons-material/Shield';
import Speed from '@mui/icons-material/Speed';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { startRegistration } from '@simplewebauthn/browser'
import { mfaService } from '../services/mfa.service'
import { Path as AuthPath } from '@cap/module-auth/routes/path'

const BENEFITS = [
  { icon: <Shield />, text: 'Phishing-resistant authentication' },
  { icon: <Speed />, text: 'Faster sign-in than passwords' },
  { icon: <PhoneIphone />, text: 'Works with your device biometrics' },
  { icon: <Lock />, text: 'Your biometric data never leaves your device' },
]

const STEPS = ['Review Benefits', 'Register Authenticator']

export default function PlatformAuthRegister() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [isRegistering, setIsRegistering] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async () => {
    setIsRegistering(true)
    setError(null)
    try {
      // 1. Get registration options from server
      const optionsRes = await mfaService.passkeys.getRegistrationOptions()
      if (!optionsRes.data) {
        throw new Error('Failed to retrieve passkey registration options')
      }

      // 2. Start native WebAuthn registration
      const regResponse = await startRegistration({ optionsJSON: optionsRes.data })

      // 3. Verify on server
      await mfaService.passkeys.verifyRegistration(regResponse)

      setIsComplete(true)
    } catch (err: any) {
      console.error('[PlatformAuthRegister] Registration error:', err)
      setError(err?.message || 'Failed to register biometric authenticator.')
    } finally {
      setIsRegistering(false)
    }
  }

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
            ? t('auth.passkey.registered', 'Authenticator Registered!')
            : t('auth.passkey.register_authenticator', 'Register Platform Authenticator')}
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          {isComplete
            ? t(
                'auth.passkey.register_success_msg',
                'You can now use biometric authentication to sign in.',
              )
            : t(
                'auth.passkey.register_subtitle',
                "Set up your device's built-in authenticator to enable passwordless sign-in.",
              )}
        </Typography>
      </Box>

      {/* Stepper */}
      {!isComplete && (
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}

      {/* Step 1: Benefits */}
      {activeStep === 0 && !isComplete && (
        <Box>
          <List sx={{ mb: 3 }}>
            {BENEFITS.map((benefit, index) => (
              <ListItem
                key={index}
                sx={{
                  bgcolor: 'action.hover',
                  borderRadius: 2,
                  mb: 1,
                  '&:last-child': { mb: 0 },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    '& .MuiSvgIcon-root': { fontSize: 22, color: 'primary.main' },
                  }}
                >
                  {benefit.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant='body2' fontWeight={500}>
                      {benefit.text}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
          <Button
            fullWidth
            variant='contained'
            size='large'
            onClick={() => setActiveStep(1)}
            endIcon={<ArrowForward />}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              py: 1.5,
            }}
          >
            {t('common.continue', 'Continue')}
          </Button>
        </Box>
      )}

      {/* Step 2: Register */}
      {activeStep === 1 && !isComplete && (
        <Box sx={{ textAlign: 'center' }}>
          {error && (
            <Alert severity='error' sx={{ mb: 3, textAlign: 'left', borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          {isRegistering ? (
            <Box sx={{ py: 4 }}>
              <CircularProgress size={56} thickness={3} sx={{ mb: 3 }} />
              <Typography variant='subtitle1' fontWeight={600} sx={{ mb: 0.5 }}>
                {t('auth.passkey.waiting_device', 'Waiting for your device...')}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {t(
                  'auth.passkey.follow_device_prompt',
                  'Follow the prompt on your screen to register your biometric.',
                )}
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
                {t(
                  'auth.passkey.register_ready',
                  "When you click the button below, your browser will prompt you to register your device's biometric authenticator.",
                )}
              </Typography>
              <Button
                fullWidth
                variant='contained'
                size='large'
                onClick={handleRegister}
                startIcon={<Fingerprint />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  borderRadius: 2,
                  py: 1.5,
                }}
              >
                {t('auth.passkey.register_now', 'Register Authenticator')}
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* Complete */}
      {isComplete && (
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant='contained'
            size='large'
            onClick={() => navigate(AuthPath.account.overview || '/')}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              py: 1.5,
              px: 5,
            }}
          >
            {t('common.done', 'Done')}
          </Button>
        </Box>
      )}

      {/* Footer */}
      <Box sx={{ mt: 5, textAlign: 'center' }}>
        <Typography
          variant='caption'
          color='text.disabled'
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
        >
          <Lock sx={{ fontSize: 12 }} />
          {t('auth.passkey.biometric_local', 'Your biometric data never leaves this device.')}
        </Typography>
      </Box>
    </Container>
  )
}
