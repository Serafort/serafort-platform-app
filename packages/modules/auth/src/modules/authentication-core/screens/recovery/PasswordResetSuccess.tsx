import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Typography, Link as MuiLink } from '@mui/material'
import CheckCircle from '@mui/icons-material/CheckCircle'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { useTranslation } from 'react-i18next'
import { Path } from '@cap/module-auth/routes/path'
import { AuthOutcomeScreen, AuthRedirectChip } from '../../components/shared/auth'

const REDIRECT_SECONDS = 5

export default function PasswordResetSuccess() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS)

  useEffect(() => {
    if (countdown <= 0) {
      navigate(Path.auth.signin)
      return
    }
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, navigate])

  const handleContinue = useCallback(() => navigate(Path.auth.signin), [navigate])
  const handleContactSupport = useCallback(() => navigate('/support'), [navigate])

  return (
    <AuthOutcomeScreen
      icon={<CheckCircle sx={{ fontSize: 36 }} />}
      title={t('passwordReset.successHeading', 'Password Reset!')}
      description={t(
        'passwordReset.successMessage',
        'Your password has been successfully changed.',
      )}
      tone='success'
      securityNote={t('common.secureConnection', 'Secured connection')}
      actions={
        <>
          <Button
            fullWidth
            variant='contained'
            size='large'
            onClick={handleContinue}
            endIcon={<ArrowForward />}
            sx={{
              minHeight: 48,
              borderRadius: 'var(--sf-radius-lg, 12px)',
              fontWeight: 800,
              fontSize: '1rem',
              textTransform: 'none',
            }}
          >
            {t('common.continue', 'Continue to Sign In')}
          </Button>

          <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
              {t('passwordReset.unauthorizedAction', "Didn't request this?")}{' '}
              <MuiLink
                component='button'
                type='button'
                onClick={handleContactSupport}
                sx={{
                  color: 'primary.main',
                  fontWeight: 700,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {t('common.contactSupport', 'Contact Support')}
              </MuiLink>
            </Typography>
          </Box>
        </>
      }
    >
      <AuthRedirectChip
        secondsRemaining={countdown}
        label={t('passwordReset.redirecting', 'Redirecting in')}
      />
    </AuthOutcomeScreen>
  )
}
