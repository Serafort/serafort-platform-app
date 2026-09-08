import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import ErrorOutline from '@mui/icons-material/ErrorOutline'
import ArrowForward from '@mui/icons-material/ArrowForward'
import MarkEmailReadOutlined from '@mui/icons-material/MarkEmailReadOutlined'
import { useTranslation } from 'react-i18next'
import authService from '@idaas/authentication-core/services/auth.service'
import { Path } from '@cap/module-auth/routes/path'
import {
  AuthPageLayout,
  AuthCard,
  AuthOutcomeScreen,
  AuthStatusBadge,
} from '../../components/shared/auth'

export default function EmailChangeVerification() {
  const { t } = useTranslation('auth')
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    const verifyToken = async () => {
      try {
        const response = await authService.verifyEmailChange(token as string)
        if (response.status === 200 || response.status === 202) {
          setStatus('success')
          timer = setTimeout(() => navigate(Path.auth.emailChangeSuccess), 2000)
        } else {
          setStatus('error')
        }
      } catch {
        setStatus('error')
      }
    }
    if (token) {
      verifyToken()
    } else {
      timer = setTimeout(() => setStatus('error'), 0)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [token, navigate])

  // --- In flight -----------------------------------------------------------
  if (status === 'verifying') {
    return (
      <AuthPageLayout maxWidth={460} backdrop='subtle'>
        <AuthCard padding='comfortable'>
          <Box
            role='status'
            aria-live='polite'
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 2,
              py: 4,
            }}
          >
            <CircularProgress size={56} thickness={4} />
            <Typography variant='h5' sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              {t('email.verifyingHeading', 'Verifying your new email')}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {t(
                'email.verifyingDescription',
                'Please wait while we securely update your account.',
              )}
            </Typography>
            <AuthStatusBadge
              status='pending'
              label={t('email.statusPending', 'Pending Auth')}
              size='small'
            />
          </Box>
        </AuthCard>
      </AuthPageLayout>
    )
  }

  const isSuccess = status === 'success'

  return (
    <AuthOutcomeScreen
      tone={isSuccess ? 'success' : 'error'}
      icon={
        isSuccess ? (
          <MarkEmailReadOutlined sx={{ fontSize: 36 }} />
        ) : (
          <ErrorOutline sx={{ fontSize: 36 }} />
        )
      }
      title={
        isSuccess
          ? t('email.verifiedHeading2', 'Email Verified!')
          : t('email.verificationFailedHeading', 'Verification Failed')
      }
      description={
        isSuccess
          ? t(
              'email.verifiedDescription',
              'Your email has been successfully updated. Redirecting you now...',
            )
          : t(
              'email.verificationFailedDescription',
              'The verification link is invalid or has expired.',
            )
      }
      actions={
        isSuccess ? undefined : (
          <Button
            variant='contained'
            onClick={() => navigate(Path.auth.requestEmailChange)}
            endIcon={<ArrowForward />}
            sx={{
              minHeight: 48,
              borderRadius: 3,
              fontWeight: 800,
              fontSize: '1rem',
              textTransform: 'none',
            }}
          >
            {t('email.tryAgain', 'Try Again')}
          </Button>
        )
      }
    >
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <AuthStatusBadge
          status={isSuccess ? 'verified' : 'expired'}
          label={
            isSuccess
              ? t('email.statusCompleted', 'Completed')
              : t('email.statusExpired', 'Expired')
          }
        />
      </Box>
    </AuthOutcomeScreen>
  )
}
