import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Box, Button, Typography, Avatar, CircularProgress, Link as MuiLink, alpha, useTheme } from '@mui/material';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FetchResponse, HttpError } from '@cap/platform-core';
import { AdaptiveLogo } from '@cap/theme';
import authService from '@idaas/authentication-core/services/auth.service';

const SUPPORT_EMAIL = 'support@example.com'

export default function VerificationEmail() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()
  const { email } = useParams()
  const [searchParams] = useSearchParams()
  const signature = searchParams.get('signature')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<HttpError | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (!email || !signature) return
      try {
        setLoading(true)
        const response: FetchResponse = await authService.verifyEmail(email, signature)
        if (response.status === 200) {
          setSuccess(true)
          setTimeout(() => navigate('/auth/login'), 5000)
        }
      } catch (err) {
        setError(err as HttpError)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [email, navigate, signature])

  if (loading) {
    return (
      <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <CircularProgress size={48} thickness={4} />
        <Typography variant="h6" color="text.secondary">{t('verification.verifying', 'Verifying...')}</Typography>
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
      sx={{ width: '100%', maxWidth: 440, mx: 'auto', p: { xs: 3, md: 5 }, textAlign: 'center' }}
    >
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <AdaptiveLogo />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Avatar variant="square"
          sx={{ width: 56, height: 56, bgcolor: 'transparent', borderRadius: '24px', border: '2px solid',
            color: success ? 'success.main' : 'error.main',
            borderColor: alpha(success ? theme.palette.success.main : theme.palette.error.main, 0.2) }}>
          {success ? <CheckCircle sx={{ fontSize: 32 }} /> : <ErrorOutline sx={{ fontSize: 32 }} />}
        </Avatar>
      </Box>

      {success && (
        <>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
            {t('verification.successTitle', 'Email Verified!')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: 5, lineHeight: 1.6 }}>
            {t('verification.successDesc', 'Your email has been verified. Redirecting you to login...')}
          </Typography>
          <Button component={Link} to="/auth/sign-in" fullWidth variant="contained" size="large"
            endIcon={<ArrowForward />}
            sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: 'info.main', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.info.main, 0.4)}`, '&:hover': { bgcolor: 'info.dark', transform: 'translateY(-1px)' } }}>
            {t('verification.buttonBackToLogin', 'Continue to Login')}
          </Button>
        </>
      )}

      {!loading && error && (
        <>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em', color: 'error.main' }}>
            {t('verification.invalidLinkTitle', 'Verification Failed')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: 2, lineHeight: 1.6 }}>
            {error?.code === 'ERR_NETWORK' ? error.message : t('verification.invalidLinkDesc1', 'This link may be invalid or expired.')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {t('verification.supportText', 'Need help?')}{' '}
            <MuiLink component={Link} to={`mailto:${SUPPORT_EMAIL}`} sx={{ fontWeight: 600, color: 'primary.main' }}>
              {SUPPORT_EMAIL}
            </MuiLink>
          </Typography>
          <Button component={Link} to="/auth/forgot-password" fullWidth variant="outlined" size="large"
            sx={{ py: 1.2, borderRadius: 3, fontWeight: 700, textTransform: 'none', mb: 2, color: 'text.primary', borderColor: alpha(theme.palette.divider, 0.8), '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) } }}>
            {t('verification.requestNewLink', 'Request New Link')}
          </Button>
          <Button component={Link} to="/auth/sign-in" sx={{ textTransform: 'none', color: 'text.secondary' }}>
            {t('verification.buttonBackToLogin', 'Back to Login')}
          </Button>
        </>
      )}
    </Box>
  )
}

