import { useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box,
  Button,
  Alert,
  Stack,
  CircularProgress,
} from '@mui/material'
import Mail from '@mui/icons-material/Mail'
import Refresh from '@mui/icons-material/Refresh'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { useTranslation } from 'react-i18next'
import { Path } from '../../../../../routes/path'
import { useResendVerification } from '../../../hooks/useAuthQuery'
import {
  AuthPageLayout,
  AuthCard,
  AuthCardHeader,
  AuthBackLink,
  AuthActionButton,
} from '../../../components/shared/auth'

export default function CheckEmailConfirmation() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''

  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)

  const resendMutation = useResendVerification({
    onSuccess: () => setResendSuccess(true),
    onError: (error: any) => {
      setResendError(
        error.response?.data?.message ||
          t('email.resendError', 'Failed to resend email. Please try again.'),
      )
    },
  })

  const handleResendEmail = useCallback(() => {
    setResendError(null)
    if (!email) {
      setResendError(t('email.resendError', 'Failed to resend email. Please try again.'))
      return
    }
    resendMutation.mutate({ email })
  }, [email, resendMutation, t])

  return (
    <AuthPageLayout maxWidth={480}>
      <AuthCard padding='comfortable'>
        <AuthCardHeader
          icon={<Mail sx={{ fontSize: 32 }} />}
          title={t('email.checkHeading', 'Check your email')}
          subtitle={
            <>
              {t('email.checkDescription', "We've sent a verification link to")}{' '}
              <Box component='span' sx={{ fontWeight: 700, color: 'text.primary' }}>
                {email || t('email.yourEmail', 'your email address')}
              </Box>
              . {t('email.clickLink', 'Please click the link to verify your account.')}
            </>
          }
        />

        {resendSuccess && (
          <Alert
            severity='success'
            sx={{
              mb: 3,
              borderRadius: 'var(--sf-radius-md, 8px)',
              textAlign: 'left',
              '& .MuiAlert-message': { fontWeight: 600 },
            }}
          >
            {t('email.resendSuccess', 'Verification email resent successfully!')}
          </Alert>
        )}
        {resendError && (
          <Alert
            severity='error'
            sx={{
              mb: 3,
              borderRadius: 'var(--sf-radius-md, 8px)',
              textAlign: 'left',
              '& .MuiAlert-message': { fontWeight: 600 },
            }}
          >
            {resendError}
          </Alert>
        )}

        <Stack spacing={2}>
          <AuthActionButton
            fullWidth
            onClick={() => {
              window.open('https://mail.google.com', '_blank', 'noopener,noreferrer')
            }}
            endIcon={<ArrowForward />}
            label={t('email.openEmailApp', 'Open Gmail')}
          />

          <Button
            variant='outlined'
            size='large'
            fullWidth
            disabled={resendMutation.isPending}
            onClick={handleResendEmail}
            startIcon={resendMutation.isPending ? <CircularProgress size={18} /> : <Refresh />}
            sx={{
              minHeight: 48,
              borderRadius: 'var(--sf-radius-lg, 12px)',
              fontWeight: 700,
              textTransform: 'none',
              borderColor: 'divider',
              color: 'text.primary',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
          >
            {resendMutation.isPending
              ? t('email.resending', 'Resending...')
              : t('email.resendButton', 'Resend email')}
          </Button>
        </Stack>

        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <AuthBackLink
            label={t('common.backToLogin', 'Back to log in')}
            onClick={() => navigate(Path.auth.signin)}
          />
        </Box>
      </AuthCard>
    </AuthPageLayout>
  )
}
