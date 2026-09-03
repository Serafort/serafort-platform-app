import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, CircularProgress, Button, Avatar, alpha, useTheme,
} from '@mui/material'
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import authService from "@idaas/authentication-core/services/auth.service"
import { Path } from "@cap/module-auth/routes/path"

export default function EmailChangeVerification() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await authService.verifyEmailChange(token as string)
        if (response.status === 200 || response.status === 202) {
          setStatus('success')
          setTimeout(() => navigate(Path.auth.emailChangeSuccess), 2000)
        } else {
          setStatus('error')
        }
      } catch {
        setStatus('error')
      }
    }
    if (token) verifyToken()
    else setTimeout(() => setStatus('error'), 0)
  }, [token, navigate])

  if (status === 'verifying') {
    return (
      <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
        <CircularProgress size={64} thickness={5} />
        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
          {t('email.verifyingHeading', 'Verifying your new email')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('email.verifyingDescription', 'Please wait while we securely update your account.')}
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      className="animate-scale-in"
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      sx={{ width: '100%', maxWidth: 400, mx: 'auto', p: { xs: 3, md: 5 }, textAlign: 'center' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Avatar variant="square"
          sx={{ width: 56, height: 56, bgcolor: 'transparent', borderRadius: '24px', border: '2px solid',
            color: status === 'success' ? 'success.main' : 'error.main',
            borderColor: alpha(status === 'success' ? theme.palette.success.main : theme.palette.error.main, 0.2) }}>
          {status === 'success' ? <CheckCircleOutline sx={{ fontSize: 32 }} /> : <ErrorOutline sx={{ fontSize: 32 }} />}
        </Avatar>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
        {status === 'success' ? t('email.verifiedHeading2', 'Email Verified!') : t('email.verificationFailedHeading', 'Verification Failed')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: 4, lineHeight: 1.6 }}>
        {status === 'success'
          ? t('email.verifiedDescription', 'Your email has been successfully updated. Redirecting you now...')
          : t('email.verificationFailedDescription', 'The verification link is invalid or has expired.')}
      </Typography>
      {status === 'error' && (
        <Button variant="contained" onClick={() => navigate(Path.auth.requestEmailChange)} endIcon={<ArrowForward />}
          sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', px: 4, bgcolor: 'info.main', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.info.main, 0.4)}`, '&:hover': { bgcolor: 'info.dark', transform: 'translateY(-1px)' } }}>
          {t('email.tryAgain', 'Try Again')}
        </Button>
      )}
    </Box>
  )
}
