import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, alpha, useTheme, Avatar, Link as MuiLink, CircularProgress } from '@mui/material';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Lock from '@mui/icons-material/Lock';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Path } from "@cap/module-auth/routes/path"

export default function PasswordResetSuccess() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      navigate(Path.auth.signin)
    }
  }, [countdown, navigate])

  const handleContinue = useCallback(() => navigate(Path.auth.signin), [navigate])
  const handleContactSupport = useCallback(() => navigate('/support'), [navigate])

  return (
    <Box
      className="animate-scale-in"
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      sx={{
        width: '100%',
        maxWidth: 440,
        mx: 'auto',
        p: { xs: 3, md: 5 },
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Avatar
          variant="circular"
          sx={{
            width: 64,
            height: 64,
            bgcolor: alpha(theme.palette.success.main, 0.12),
            color: 'success.main',
            border: '2px solid',
            borderColor: alpha(theme.palette.success.main, 0.3),
            boxShadow: `0 0 24px ${alpha(theme.palette.success.main, 0.25)}`,
          }}
        >
          <CheckCircle sx={{ fontSize: 36 }} />
        </Avatar>
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
        {t('passwordReset.successHeading', 'Password Reset!')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: 2 }}>
        {t('passwordReset.successMessage', 'Your password has been successfully changed.')}
      </Typography>

      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 0.75,
          borderRadius: 999,
          bgcolor: alpha(theme.palette.action.selected, 0.5),
          border: '1px solid',
          borderColor: 'divider',
          mb: 4,
        }}
      >
        <CircularProgress size={14} thickness={5} />
        <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary' }}>
          {t('passwordReset.redirecting', 'Redirecting in')}{' '}
          <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
            {countdown}s
          </Box>
        </Typography>
      </Box>

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={handleContinue}
        endIcon={<ArrowForward />}
        sx={{
          py: 1.5,
          borderRadius: 3,
          fontWeight: 800,
          fontSize: '1rem',
          textTransform: 'none',
          bgcolor: 'primary.main',
          boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
          '&:hover': {
            bgcolor: 'primary.dark',
            transform: 'translateY(-1px)',
            boxShadow: (theme) => `0 6px 20px ${alpha(theme.palette.primary.main, 0.23)}`,
          },
        }}
      >
        {t('common.continue', 'Continue to Sign In')}
      </Button>

      <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {t('passwordReset.unauthorizedAction', 'Didn\'t request this?')}{' '}
          <MuiLink
            component="button"
            onClick={handleContactSupport}
            sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          >
            {t('common.contactSupport', 'Contact Support')}
          </MuiLink>
        </Typography>
      </Box>

      <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: 'text.disabled' }}>
        <Lock sx={{ fontSize: 13 }} />
        <Typography variant="caption">
          {t('common.secureConnection', 'Secured connection')}
        </Typography>
      </Box>
    </Box>
  )
}
