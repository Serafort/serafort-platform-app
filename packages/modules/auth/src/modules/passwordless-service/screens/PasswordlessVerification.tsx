import { useEffect, useMemo, useState, type ReactElement } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box,
  Button,
  Typography,
  Chip,
  LinearProgress,
  Stack,
  alpha,
  useTheme,
} from '@mui/material'
import LockOutlined from '@mui/icons-material/LockOutlined'
import LinkOff from '@mui/icons-material/LinkOff'
import ArrowForward from '@mui/icons-material/ArrowForward'
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline'
import MarkEmailReadOutlined from '@mui/icons-material/MarkEmailReadOutlined'
import { useTranslation } from 'react-i18next'
import { usePasswordlessVerify, usePasswordlessSend } from '../hooks'
import Path from './path'
import { Path as AuthPath } from '../../../routes/path'
import { useAuthStore } from '../../authentication-core/store'
import { secureTokenManager, useAppStore, safeRedirectPath } from '@cap/platform-core'
import { resolveRedirectPathForUser } from '../../authentication-core/utils/resolveRedirect'
import { useResendCooldown } from '../../authentication-core/hooks'
import {
  AuthOutcomeScreen,
  AuthResendButton,
  type AuthTone,
} from '../../authentication-core/components/shared/auth'

type VerificationState = 'awaiting' | 'verifying' | 'success' | 'error'

const RESEND_COOLDOWN_SECONDS = 60

const PasswordlessVerification = () => {
  // See PasswordlessInitiation: keys live at `passwordless.*`, not
  // `auth.passwordless.*`.
  const { t } = useTranslation('common')
  const theme = useTheme()
  const [resendSuccess, setResendSuccess] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''
  const redirectUrl =
    safeRedirectPath(searchParams.get('redirectUrl') || searchParams.get('returnTo')) || ''
  const { setAuthenticated, setUser, setAuthStep } = useAuthStore()

  const verifyQuery = usePasswordlessVerify(token)
  const { secondsRemaining, start: startCooldown } = useResendCooldown(RESEND_COOLDOWN_SECONDS)

  const resendMutation = usePasswordlessSend({
    onSuccess: () => {
      setResendSuccess(true)
      startCooldown()
    },
    onError: () => {
      setResendSuccess(false)
    },
  })

  const state: VerificationState = useMemo(() => {
    if (!token) return 'awaiting'
    if (verifyQuery.isPending) return 'verifying'
    if (verifyQuery.isSuccess) return 'success'
    if (verifyQuery.isError) return 'error'
    return 'awaiting'
  }, [token, verifyQuery.isPending, verifyQuery.isSuccess, verifyQuery.isError])

  useEffect(() => {
    if (!verifyQuery.isSuccess || !verifyQuery.data?.data) return

    const payload: any = verifyQuery.data.data
    if (payload.token) {
      try {
        secureTokenManager.setTokens(payload.token)
      } catch {
        // Fallback for secure token persistence
      }
    }
    if (payload.user) {
      setUser(payload.user)
      setAuthenticated(true)
      setAuthStep('complete')
      try {
        useAppStore.getState().setUser(payload.user)
      } catch {
        // Safe fallback for global app store
      }
    }

    const userRole = payload.user?.role || payload.user?.roleId || payload.user?.user?.role
    const defaultRedirect = resolveRedirectPathForUser(userRole)
    const targetPath =
      redirectUrl && redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')
        ? redirectUrl
        : defaultRedirect

    const timer = setTimeout(() => {
      navigate(targetPath, { replace: true })
    }, 1200)

    return () => clearTimeout(timer)
  }, [
    verifyQuery.isSuccess,
    verifyQuery.data,
    navigate,
    setUser,
    setAuthenticated,
    setAuthStep,
    redirectUrl,
  ])

  const handleResend = () => {
    if (email && secondsRemaining === 0) {
      resendMutation.mutate({
        email,
        ...(redirectUrl ? { redirectUrl } : {}),
      })
    } else if (!email) {
      const params = new URLSearchParams()
      if (redirectUrl) params.set('redirectUrl', redirectUrl)
      navigate(`${Path.setup}${params.toString() ? `?${params.toString()}` : ''}`)
    }
  }

  const cooldownLabel = t('passwordless.resend_in', {
    count: secondsRemaining,
    defaultValue: 'Resend in {{count}}s',
  })

  const signInWithPassword = (
    <Button
      fullWidth
      variant='text'
      onClick={() => navigate(AuthPath.auth.signin)}
      sx={{
        minHeight: 48,
        fontWeight: 700,
        color: 'text.secondary',
        textTransform: 'none',
      }}
    >
      {t('passwordless.use_password_instead', 'Sign in with password')}
    </Button>
  )

  const TONE: Record<VerificationState, AuthTone> = {
    awaiting: 'primary',
    verifying: 'primary',
    success: 'success',
    error: 'error',
  }

  const ICON: Record<VerificationState, ReactElement> = {
    awaiting: <MarkEmailReadOutlined sx={{ fontSize: 36 }} />,
    verifying: <LockOutlined sx={{ fontSize: 36 }} />,
    success: <CheckCircleOutline sx={{ fontSize: 36 }} />,
    error: <LinkOff sx={{ fontSize: 36 }} />,
  }

  // --- Awaiting: the link is in the user's inbox --------------------------
  if (state === 'awaiting') {
    return (
      <AuthOutcomeScreen
        tone={TONE.awaiting}
        icon={ICON.awaiting}
        title={t('passwordless.magic_link_sent_title', 'Check Your Email')}
        description={t(
          'passwordless.awaiting_desc',
          'We sent a secure sign-in link to your email. Click the link in your inbox to sign in instantly.',
        )}
        securityNote={t('passwordless.encrypted_notice', 'Encrypted & Single-Use Authentication')}
        actions={
          <>
            <AuthResendButton
              onResend={handleResend}
              isPending={resendMutation.isPending}
              secondsRemaining={secondsRemaining}
              idleLabel={t('passwordless.resend_link', 'Resend Magic Link')}
              pendingLabel={t('passwordless.sending', 'Sending...')}
              cooldownLabel={cooldownLabel}
            />
            {signInWithPassword}
          </>
        }
      >
        <Stack spacing={1.5} alignItems='center'>
          {email && (
            <Chip
              label={email}
              variant='outlined'
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                borderColor: alpha(theme.palette.primary.main, 0.3),
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              }}
            />
          )}
          {resendSuccess && (
            <Typography
              role='status'
              aria-live='polite'
              variant='caption'
              color='success.main'
              sx={{ fontWeight: 700 }}
            >
              {t('passwordless.magic_link_resent', 'A new magic link has been sent!')}
            </Typography>
          )}
        </Stack>
      </AuthOutcomeScreen>
    )
  }

  // --- Verifying ----------------------------------------------------------
  if (state === 'verifying') {
    return (
      <AuthOutcomeScreen
        tone={TONE.verifying}
        icon={ICON.verifying}
        title={t('passwordless.verifying_title', 'Verifying Connection...')}
        description={t(
          'passwordless.verifying_desc',
          'Please wait while we authenticate your session. This will only take a moment.',
        )}
        securityNote={t('passwordless.encrypted_notice', 'Encrypted & Single-Use Authentication')}
      >
        <Box role='status' aria-live='polite' sx={{ width: '80%', mx: 'auto' }}>
          <LinearProgress sx={{ borderRadius: 2, height: 6 }} />
        </Box>
      </AuthOutcomeScreen>
    )
  }

  // --- Success ------------------------------------------------------------
  if (state === 'success') {
    return (
      <AuthOutcomeScreen
        tone={TONE.success}
        icon={ICON.success}
        title={t('passwordless.success_title', 'Authenticated Successfully')}
        description={t(
          'passwordless.success_desc',
          'Your identity has been confirmed. Redirecting to your dashboard...',
        )}
        securityNote={t('passwordless.encrypted_notice', 'Encrypted & Single-Use Authentication')}
      >
        <Box role='status' aria-live='polite' sx={{ width: '60%', mx: 'auto' }}>
          <LinearProgress color='success' sx={{ borderRadius: 2, height: 6 }} />
        </Box>
      </AuthOutcomeScreen>
    )
  }

  // --- Error: expired or already-used link --------------------------------
  return (
    <AuthOutcomeScreen
      tone={TONE.error}
      icon={ICON.error}
      title={t('passwordless.link_expired', 'Link Expired or Invalid')}
      description={t(
        'passwordless.link_expired_desc',
        'This magic link has expired or has already been used. For your security, links can only be used once.',
      )}
      securityNote={t('passwordless.encrypted_notice', 'Encrypted & Single-Use Authentication')}
      actions={
        <>
          <AuthResendButton
            onResend={handleResend}
            isPending={resendMutation.isPending}
            secondsRemaining={secondsRemaining}
            idleLabel={t('passwordless.request_new_link', 'Request New Magic Link')}
            pendingLabel={t('passwordless.sending', 'Sending...')}
            cooldownLabel={cooldownLabel}
            startIcon={null}
            endIcon={<ArrowForward />}
          />
          <Button
            fullWidth
            variant='text'
            onClick={() => navigate(AuthPath.auth.signin)}
            sx={{
              minHeight: 48,
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'none',
            }}
          >
            {t('common.backToLogin', 'Back to Sign In')}
          </Button>
        </>
      }
    />
  )
}

export default PasswordlessVerification
