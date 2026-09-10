import { useState } from 'react'
import {
  Box,
  Button,
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
  Stack,
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
import {
  AuthPageLayout,
  AuthCard,
  AuthCardHeader,
} from '../../../authentication-core/components/shared/auth'
import { usePasskey } from '../../hooks'
import { Path as AuthPath } from '@cap/module-auth/routes/path'

export default function PlatformAuthRegister() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const { registerPasskey, isLoading, error: passkeyError } = usePasskey()

  const BENEFITS = [
    { icon: <Shield />, text: t('passkey.benefit_phishing', 'Phishing-resistant authentication') },
    { icon: <Speed />, text: t('passkey.benefit_faster', 'Faster sign-in than passwords') },
    {
      icon: <PhoneIphone />,
      text: t('passkey.benefit_device', 'Works with your device biometrics'),
    },
    {
      icon: <Lock />,
      text: t('passkey.benefit_private', 'Your biometric data never leaves your device'),
    },
  ]

  const STEPS = [
    t('passkey.step_review', 'Review Benefits'),
    t('passkey.step_register', 'Register Authenticator'),
  ]

  const handleRegister = async () => {
    setLocalError(null)
    try {
      await registerPasskey()
      setIsComplete(true)
    } catch (err: any) {
      setLocalError(
        err?.message || t('passkey.register_failed', 'Failed to register biometric authenticator.'),
      )
    }
  }

  const displayError = localError || passkeyError

  return (
    <AuthPageLayout maxWidth={520}>
      <AuthCard padding='comfortable'>
        <AuthCardHeader
          icon={
            isComplete ? (
              <CheckCircle sx={{ fontSize: 36, color: 'success.main' }} />
            ) : (
              <Fingerprint sx={{ fontSize: 36 }} />
            )
          }
          iconSize={64}
          tone={isComplete ? 'success' : 'primary'}
          title={
            isComplete
              ? t('passkey.registration_complete', 'Passkey Registered!')
              : t('passkey.set_up_biometric', 'Set Up Biometric Sign-In')
          }
          subtitle={
            isComplete
              ? t(
                  'passkey.can_now_sign_in',
                  'You can now sign in using Touch ID, Face ID, or Windows Hello.',
                )
              : t(
                  'passkey.registration_subtitle',
                  'Enable instant, secure sign-in with your device biometrics.',
                )
          }
        />

        {/* Stepper */}
        {!isComplete && (
          <Stepper activeStep={activeStep} sx={{ mb: 3.5 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        {displayError && (
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
            {displayError}
          </Alert>
        )}

        {/* Step 0: Review Benefits */}
        {!isComplete && activeStep === 0 && (
          <Box>
            <List sx={{ mb: 3 }}>
              {BENEFITS.map((benefit, index) => (
                <ListItem
                  key={index}
                  sx={{
                    py: 1.5,
                    px: 2,
                    mb: 1,
                    borderRadius: 'var(--sf-radius-md, 8px)',
                    bgcolor: 'action.hover',
                  }}
                >
                  <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                    {benefit.icon}
                  </ListItemIcon>
                  <ListItemText primary={benefit.text} primaryTypographyProps={{ fontWeight: 600 }} />
                </ListItem>
              ))}
            </List>

            <Stack spacing={1.5}>
              <Button
                fullWidth
                variant='contained'
                size='large'
                onClick={() => setActiveStep(1)}
                endIcon={<ArrowForward />}
                sx={{
                  minHeight: 48,
                  borderRadius: 'var(--sf-radius-lg, 12px)',
                  fontWeight: 800,
                  textTransform: 'none',
                  fontSize: '1rem',
                  boxShadow: 'var(--sf-shadow-glow, none)',
                }}
              >
                {t('common.continue', 'Continue')}
              </Button>
              <Button
                fullWidth
                variant='text'
                onClick={() => navigate(-1)}
                sx={{
                  minHeight: 44,
                  textTransform: 'none',
                  color: 'text.secondary',
                  fontWeight: 600,
                  '&:hover': { color: 'text.primary' },
                }}
              >
                {t('common.skip_for_now', 'Skip for now')}
              </Button>
            </Stack>
          </Box>
        )}

        {/* Step 1: Register Authenticator */}
        {!isComplete && activeStep === 1 && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3.5, lineHeight: 1.6 }}>
              {t(
                'passkey.click_to_prompt',
                'Click below to register this device. Your browser will prompt you to authenticate using biometrics or a security key.',
              )}
            </Typography>

            <Stack spacing={1.5}>
              <Button
                fullWidth
                variant='contained'
                size='large'
                onClick={handleRegister}
                disabled={isLoading}
                startIcon={
                  isLoading ? <CircularProgress size={20} color='inherit' /> : <Fingerprint />
                }
                sx={{
                  minHeight: 48,
                  borderRadius: 'var(--sf-radius-lg, 12px)',
                  fontWeight: 800,
                  textTransform: 'none',
                  fontSize: '1rem',
                  boxShadow: 'var(--sf-shadow-glow, none)',
                }}
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
                sx={{
                  minHeight: 44,
                  textTransform: 'none',
                  color: 'text.secondary',
                  fontWeight: 600,
                  '&:hover': { color: 'text.primary' },
                }}
              >
                {t('common.back', 'Back')}
              </Button>
            </Stack>
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
              sx={{
                minHeight: 48,
                borderRadius: 'var(--sf-radius-lg, 12px)',
                fontWeight: 800,
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: 'var(--sf-shadow-glow, none)',
              }}
            >
              {t('passkey.go_to_account', 'Go to Account Overview')}
            </Button>
          </Box>
        )}
      </AuthCard>
    </AuthPageLayout>
  )
}
