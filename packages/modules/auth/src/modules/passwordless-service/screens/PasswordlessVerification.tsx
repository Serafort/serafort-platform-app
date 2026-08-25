import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box,
  Button,
  Typography,
  Avatar,
  Stack,
  CircularProgress,
  alpha,
  useTheme,
  Card,
  CardContent,
  Chip,
  LinearProgress,
} from '@mui/material'
import LockOutlined from '@mui/icons-material/LockOutlined'
import LinkOff from '@mui/icons-material/LinkOff'
import ArrowForward from '@mui/icons-material/ArrowForward'
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline'
import MarkEmailReadOutlined from '@mui/icons-material/MarkEmailReadOutlined'
import ShieldOutlined from '@mui/icons-material/ShieldOutlined'
import Refresh from '@mui/icons-material/Refresh'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { usePasswordlessVerify, usePasswordlessSend } from '../hooks'
import Path from './path'
import { Path as AuthPath } from '@cap/module-auth/routes/path'
import { useAuthStore } from '@cap/module-auth/modules/authentication-core/store'
import { secureTokenManager, useAppStore } from '@cap/platform-core'

type VerificationState = 'awaiting' | 'verifying' | 'success' | 'error'

const PasswordlessVerification = () => {
  const { t } = useTranslation('common')
  const theme = useTheme()
  const [resent, setResent] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''
  const { setAuthenticated, setUser, setAuthStep } = useAuthStore()

  const verifyQuery = usePasswordlessVerify(token)

  const resendMutation = usePasswordlessSend({
    onSuccess: () => {
      setResent(true)
      setResendCooldown(60)
    },
    onError: () => {
      setResent(false)
    },
  })

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const state: VerificationState = useMemo(() => {
    if (!token) return 'awaiting'
    if (verifyQuery.isError && !resent) return 'error'
    if (verifyQuery.isSuccess) return 'success'
    if (verifyQuery.isPending) return 'verifying'
    return 'awaiting'
  }, [token, verifyQuery.isPending, verifyQuery.isSuccess, verifyQuery.isError, resent])

  useEffect(() => {
    if (!verifyQuery.isSuccess || !verifyQuery.data?.data) return

    const payload: any = verifyQuery.data.data
    if (payload.token) {
      try {
        const expiresIn = payload.expires_in || 3600
        secureTokenManager.setTokens({
          accessToken: payload.token,
          expiresAt: Date.now() + expiresIn * 1000,
        })
      } catch {}
    }
    if (payload.user) {
      setUser(payload.user)
      setAuthenticated(true)
      setAuthStep('complete')
      try {
        useAppStore.getState().setUser(payload.user)
      } catch {}
    }

    const timer = setTimeout(() => navigate(AuthPath.account.overview), 1500)
    return () => clearTimeout(timer)
  }, [verifyQuery.isSuccess, verifyQuery.data, navigate, setUser, setAuthenticated, setAuthStep])

  const handleResend = () => {
    if (email && resendCooldown === 0) {
      resendMutation.mutate(email)
    } else if (!email) {
      navigate(Path.setup)
    }
  }

  const getIcon = () => {
    switch (state) {
      case 'success':
        return <CheckCircleOutline sx={{ fontSize: 36 }} />
      case 'error':
        return <LinkOff sx={{ fontSize: 36 }} />
      case 'awaiting':
        return <MarkEmailReadOutlined sx={{ fontSize: 36 }} />
      default:
        return <LockOutlined sx={{ fontSize: 36 }} />
    }
  }

  const getColor = () => {
    switch (state) {
      case 'success':
        return theme.palette.success.main
      case 'error':
        return theme.palette.error.main
      default:
        return theme.palette.primary.main
    }
  }

  return (
    <Box
      className="animate-scale-in"
      component={motion.div}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      sx={{
        width: '100%',
        maxWidth: 460,
        mx: 'auto',
        p: { xs: 2, sm: 3 },
      }}
    >
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.6),
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(20px)',
          boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.06)}`,
          overflow: 'visible',
          textAlign: 'center',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4.5 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 68,
                height: 68,
                bgcolor: alpha(getColor(), 0.1),
                color: getColor(),
                borderRadius: 3.5,
                border: '2px solid',
                borderColor: alpha(getColor(), 0.25),
              }}
            >
              {getIcon()}
            </Avatar>
          </Box>

          {(state === 'awaiting' || state === 'verifying') && (
            <>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em' }}>
                {state === 'awaiting'
                  ? t('auth.passwordless.magic_link_sent', 'Check Your Email')
                  : t('auth.passwordless.verifying_title', 'Verifying Connection...')}
              </Typography>

              {email && state === 'awaiting' && (
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={email}
                    variant="outlined"
                    sx={{
                      fontWeight: 600,
                      borderRadius: 2,
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    }}
                  />
                </Box>
              )}

              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 3.5, lineHeight: 1.6 }}>
                {state === 'awaiting'
                  ? t(
                      'auth.passwordless.awaiting_desc',
                      'We sent a secure sign-in link to your email. Click the link in your inbox to sign in instantly.',
                    )
                  : t(
                      'auth.passwordless.verifying_desc',
                      'Please wait while we authenticate your session. This will only take a moment.',
                    )}
              </Typography>

              {state === 'verifying' && (
                <Box sx={{ mb: 3, width: '80%', mx: 'auto' }}>
                  <LinearProgress sx={{ borderRadius: 2, height: 6 }} />
                </Box>
              )}

              <Stack spacing={1.5}>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={resendMutation.isPending || resendCooldown > 0}
                  onClick={handleResend}
                  startIcon={resendMutation.isPending ? <CircularProgress size={18} color="inherit" /> : <Refresh />}
                  sx={{
                    py: 1.4,
                    borderRadius: 3,
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    textTransform: 'none',
                    bgcolor: 'primary.main',
                    boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  {resendMutation.isPending
                    ? t('auth.passwordless.sending', 'Sending...')
                    : resendCooldown > 0
                      ? t('auth.passwordless.resend_in', `Resend in ${resendCooldown}s`)
                      : t('auth.passwordless.resend_link', 'Resend Magic Link')}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  onClick={() => navigate(AuthPath.auth.signin)}
                  sx={{
                    py: 1.2,
                    fontWeight: 700,
                    color: 'text.secondary',
                    textTransform: 'none',
                    '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) },
                  }}
                >
                  {t('auth.passwordless.use_password_instead', 'Sign in with password')}
                </Button>
              </Stack>
            </>
          )}

          {state === 'success' && (
            <>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em', color: 'success.main' }}>
                {t('auth.passwordless.success_title', 'Authenticated Successfully')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 3, lineHeight: 1.6 }}>
                {t('auth.passwordless.success_desc', 'Your identity has been confirmed. Redirecting to your dashboard...')}
              </Typography>
              <Box sx={{ width: '60%', mx: 'auto', mb: 1 }}>
                <LinearProgress color="success" sx={{ borderRadius: 2, height: 6 }} />
              </Box>
            </>
          )}

          {state === 'error' && (
            <>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em', color: 'error.main' }}>
                {t('auth.passwordless.link_expired', 'Link Expired or Invalid')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 3.5, lineHeight: 1.6 }}>
                {t(
                  'auth.passwordless.link_expired_desc',
                  'This magic link has expired or has already been used. For your security, links can only be used once.',
                )}
              </Typography>

              <Stack spacing={1.5}>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={resendMutation.isPending}
                  onClick={handleResend}
                  endIcon={<ArrowForward />}
                  sx={{
                    py: 1.4,
                    borderRadius: 3,
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    textTransform: 'none',
                    bgcolor: 'primary.main',
                    boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                >
                  {t('auth.passwordless.request_new_link', 'Request New Magic Link')}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  onClick={() => navigate(AuthPath.auth.signin)}
                  sx={{
                    py: 1.2,
                    fontWeight: 700,
                    color: 'text.secondary',
                    textTransform: 'none',
                  }}
                >
                  {t('common.backToLogin', 'Back to Sign In')}
                </Button>
              </Stack>
            </>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 3 }}>
        <ShieldOutlined sx={{ fontSize: 16, color: 'text.disabled' }} />
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          {t('auth.passwordless.encrypted_notice', 'Encrypted & Single-Use Authentication')}
        </Typography>
      </Box>
    </Box>
  )
}

export default PasswordlessVerification

