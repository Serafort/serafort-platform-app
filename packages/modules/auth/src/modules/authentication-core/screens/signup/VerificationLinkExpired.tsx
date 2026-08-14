import { useCallback, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Box, Button, Typography, Alert, Avatar, Stack, Link as MuiLink, CircularProgress, alpha, useTheme } from '@mui/material';
import History from '@mui/icons-material/History';
import Send from '@mui/icons-material/Send';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Path } from '@cap/module-auth/routes/path';

export default function VerificationLinkExpired() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''

  const [sending, setSending] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRequestNewLink = useCallback(async () => {
    setSending(true)
    setError(null)
    setSuccessMsg(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setSuccessMsg(t('email.newLinkSent', 'A new verification link has been sent to your email.'))
      setTimeout(() => navigate(`${Path.checkEmail}?email=${encodeURIComponent(email)}`), 2000)
    } catch {
      setError(t('email.newLinkError', 'Failed to send new link. Please try again later.'))
    } finally {
      setSending(false)
    }
  }, [t, navigate, email])

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
          sx={{ width: 56, height: 56, bgcolor: 'transparent', color: 'warning.main', borderRadius: '24px', border: '2px solid', borderColor: alpha(theme.palette.warning.main, 0.2) }}>
          <History sx={{ fontSize: 32 }} />
        </Avatar>
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
        {t('email.expiredHeading', 'Verification link expired')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: 4, lineHeight: 1.6 }}>
        {t('email.expiredDescription', "For security reasons, verification links expire after a short period. Request a new one below.")}
      </Typography>

      {successMsg && (
        <Alert severity="success" sx={{ mb: 4, borderRadius: 2, textAlign: 'left', '& .MuiAlert-message': { fontWeight: 600 } }}>
          {successMsg}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2, textAlign: 'left', '& .MuiAlert-message': { fontWeight: 600 } }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        <Button variant="contained" size="large" fullWidth disabled={sending} onClick={handleRequestNewLink}
          startIcon={sending ? <CircularProgress size={18} color="inherit" /> : <Send />}
          sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: 'info.main', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.info.main, 0.4)}`, '&:hover': { bgcolor: 'info.dark', transform: 'translateY(-1px)' } }}>
          {sending ? t('email.sending', 'Sending...') : t('email.requestNewLink', 'Request a new link')}
        </Button>

        <Button component={Link} to={Path.auth.signin} variant="text" fullWidth
          sx={{ py: 1.2, borderRadius: 3, fontWeight: 600, color: 'text.secondary', textTransform: 'none', '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) } }}>
          {t('common.backToLogin', 'Back to log in')}
        </Button>
      </Stack>

      <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center', gap: 3 }}>
        {[{ label: t('common.terms', 'Terms'), href: '#' }, { label: t('common.privacy', 'Privacy'), href: '#' }, { label: t('common.contact', 'Contact'), href: '#' }].map(({ label, href }) => (
          <MuiLink key={label} href={href} sx={{ color: 'text.secondary', fontSize: '0.875rem', textDecoration: 'none', '&:hover': { color: 'text.primary' } }}>
            {label}
          </MuiLink>
        ))}
      </Box>
    </Box>
  )
}

