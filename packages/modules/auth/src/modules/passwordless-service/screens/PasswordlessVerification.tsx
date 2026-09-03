import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Typography, Avatar, Stack, CircularProgress, alpha, useTheme } from '@mui/material';
import Lock from '@mui/icons-material/Lock';
import LinkOff from '@mui/icons-material/LinkOff';
import ArrowForward from '@mui/icons-material/ArrowForward';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import MailOutline from '@mui/icons-material/MailOutline';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePasswordlessVerify, usePasswordlessSend } from '../hooks';
import Path from './path';
import { Path as AuthPath } from '@cap/module-auth/routes/path';

type VerificationState = 'awaiting' | 'verifying' | 'success' | 'error'

const PasswordlessVerification = () => {
  const { t } = useTranslation('common')
  const theme = useTheme()
  const [resent, setResent] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const verifyQuery = usePasswordlessVerify(token)

  const resendMutation = usePasswordlessSend({
    onSuccess: () => {
      setResent(true)
    },
    onError: () => {
      setResent(false)
    },
  })

  const state: VerificationState = useMemo(() => {
    if (!token) return 'awaiting'
    if (verifyQuery.isError && !resent) return 'error'
    if (verifyQuery.isSuccess) return 'success'
    if (verifyQuery.isPending) return 'verifying'
    return 'awaiting'
  }, [token, verifyQuery.isPending, verifyQuery.isSuccess, verifyQuery.isError, resent])

  useEffect(() => {
    if (!verifyQuery.isSuccess) return
    const timer = setTimeout(() => navigate(AuthPath.account.overview), 2000)
    return () => clearTimeout(timer)
  }, [verifyQuery.isSuccess, navigate])

  const handleResend = () => {
    if (email) {
      resendMutation.mutate(email)
    } else {
      navigate(Path.setup)
    }
  }

  const getIcon = () => {
    switch (state) {
      case 'success':
        return <CheckCircleOutline sx={{ fontSize: 32 }} />
      case 'error':
        return <LinkOff sx={{ fontSize: 32 }} />
      case 'awaiting':
        return <MailOutline sx={{ fontSize: 32 }} />
      default:
        return <Lock sx={{ fontSize: 32 }} />
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      sx={{ width: '100%', maxWidth: 440, mx: 'auto', p: { xs: 3, md: 5 }, textAlign: 'center' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Avatar variant="square"
          sx={{ width: 56, height: 56, bgcolor: 'transparent', borderRadius: '24px', border: '2px solid',
            color: getColor(), borderColor: alpha(getColor(), 0.2) }}>
          {getIcon()}
        </Avatar>
      </Box>

      {(state === 'awaiting' || state === 'verifying') && (
        <>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
            {state === 'awaiting'
              ? t('auth.passwordless.magic_link_sent', 'Check your email')
              : t('auth.passwordless.verifying_title', 'Verifying your connection...')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: 4, lineHeight: 1.6 }}>
            {state === 'awaiting'
              ? t('auth.passwordless.awaiting_desc', "We've sent a magic link to {email}. Click the link to sign in instantly.", { email: email || t('auth.passwordless.your_email', 'your email') })
              : t('auth.passwordless.verifying_desc', 'Please wait while we secure your session. This should only take a moment.')}
          </Typography>
          {state === 'verifying' && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <CircularProgress size={48} thickness={4} sx={{ color: 'primary.main' }} />
            </Box>
          )}
          <Stack spacing={2}>
            <Button fullWidth variant="contained" disabled={resendMutation.isPending}
              onClick={handleResend} endIcon={resendMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
              sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: 'info.main', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.info.main, 0.4)}`, '&:hover': { bgcolor: 'info.dark', transform: 'translateY(-1px)' } }}>
              {t('auth.passwordless.resend_link', 'Resend magic link')}
            </Button>
            <Button fullWidth variant="text" onClick={() => navigate(AuthPath.auth.signin)}
              sx={{ py: 1.2, fontWeight: 600, color: 'text.secondary', textTransform: 'none', '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) } }}>
              {t('auth.passwordless.use_password_instead', 'Use password instead')}
            </Button>
          </Stack>
        </>
      )}

      {state === 'success' && (
        <>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
            {t('auth.passwordless.success_title', 'Successfully logged in')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: 4, lineHeight: 1.6 }}>
            {t('auth.passwordless.success_desc', 'Your identity has been confirmed. Welcome back!')}
          </Typography>
        </>
      )}

      {state === 'error' && (
        <>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
            {t('auth.passwordless.link_expired', 'Link Expired')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: 4, lineHeight: 1.6 }}>
            {t('auth.passwordless.link_expired_desc', 'This magic link has expired or has already been used. For security reasons, magic links can only be used once.')}
          </Typography>
          <Stack spacing={2}>
            <Button fullWidth variant="contained" disabled={resendMutation.isPending} endIcon={<ArrowForward />}
              onClick={handleResend}
              sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: 'info.main', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.info.main, 0.4)}`, '&:hover': { bgcolor: 'info.dark', transform: 'translateY(-1px)' } }}>
              {t('auth.passwordless.resend_link', 'Resend magic link')}
            </Button>
            <Button fullWidth variant="text" onClick={() => navigate(AuthPath.auth.signin)}
              sx={{ py: 1.2, fontWeight: 600, color: 'text.secondary', textTransform: 'none', '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) } }}>
              {t('common.backToLogin', 'Back to Login')}
            </Button>
          </Stack>
        </>
      )}
    </Box>
  )
}

export default PasswordlessVerification
