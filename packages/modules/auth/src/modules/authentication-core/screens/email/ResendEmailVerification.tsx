import React, { useState, useCallback } from 'react';
import { Box, Button, Typography, TextField, Link as MuiLink, Alert, CircularProgress, Avatar, InputAdornment, Stack, alpha, useTheme } from '@mui/material';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import MailOutline from '@mui/icons-material/MailOutline';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AdaptiveLogo } from '@cap/theme';
import authService from '@idaas/authentication-core/services/auth.service';

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

const EmailVerification: React.FC = () => {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage(null)
    setErrorMessage(null)
    if (!email || !EMAIL_PATTERN.test(email)) {
      setErrorMessage(t('login.invalidEmail', 'Please enter a valid email address.'))
      return
    }
    setLoading(true)
    try {
      const response = await authService.resendVerification(email)
      if (response.status === 200) {
        setSuccessMessage(response.data.message || t('verification.resendSuccess', 'Verification email sent.'))
      } else {
        setErrorMessage(response.data.message || t('verification.resendError', 'Failed to resend verification email.'))
      }
    } catch (error: any) {
      setErrorMessage(error.message || t('verification.resendError', 'Failed to resend verification email.'))
    } finally {
      setLoading(false)
    }
  }, [email, t])

  return (
    <Box
      className="animate-scale-in"
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      sx={{ width: '100%', maxWidth: 440, mx: 'auto', p: { xs: 3, md: 5 } }}
    >
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <AdaptiveLogo />
      </Box>

      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Avatar variant="square"
            sx={{ width: 56, height: 56, bgcolor: 'transparent', color: 'primary.main', borderRadius: '24px', border: '2px solid', borderColor: alpha(theme.palette.primary.main, 0.2) }}>
            <MailOutline sx={{ fontSize: 32 }} />
          </Avatar>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
          {t('verification.title', 'Verify Email')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, maxWidth: 340, mx: 'auto', lineHeight: 1.6 }}>
          {t('verification.desc', 'Please verify your email address to continue accessing your account.')}
        </Typography>
      </Box>

      {successMessage && <Alert severity="success" sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}>{successMessage}</Alert>}
      {errorMessage && <Alert severity="error" sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}>{errorMessage}</Alert>}

      <form onSubmit={handleSubmit} noValidate>
        <Stack spacing={3}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', ml: 1, mb: 1, display: 'block', color: 'text.secondary' }}>
              {t('verification.emailLabel', 'Email Address')}
            </Typography>
            <TextField fullWidth type="email" id="email" autoComplete="email"
              placeholder={t('login.emailPlaceholder', 'name@example.com')}
              value={email} onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ fontSize: 20, color: 'text.secondary' }} /></InputAdornment>, sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) } } }}
            />
          </Box>

          <Button type="submit" variant="contained" color="info" fullWidth disabled={loading}
            endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
            sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: 'info.main', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.info.main, 0.4)}`, '&:hover': { bgcolor: 'info.dark', transform: 'translateY(-1px)' } }}>
            {t('verification.buttonResend', 'Resend Email')}
          </Button>
        </Stack>
      </form>

      <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
          {t('verification.resendHelp', "Didn't receive the email?")}{' '}
          <MuiLink component={RouterLink} to="#"
            sx={{ fontWeight: 700, textDecoration: 'none', color: 'info.main', '&:hover': { textDecoration: 'underline' } }}>
            {t('verification.contactSupport', 'Contact Support')}
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  )
}

export default EmailVerification
