import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Typography, Avatar, Stack, Divider, alpha, useTheme } from '@mui/material'
import CheckCircle from '@mui/icons-material/CheckCircle';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Settings from '@mui/icons-material/Settings';
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface RegistrationSuccessProps {
  userName?: string
  redirectPath?: string
}

export default function RegistrationSuccess({ userName, redirectPath = '/dashboard' }: RegistrationSuccessProps) {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()

  const handleGoToDashboard = useCallback(() => navigate(redirectPath), [navigate, redirectPath])
  const handleCompleteLater = useCallback(() => navigate('/profile/settings'), [navigate])

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
          sx={{ width: 56, height: 56, bgcolor: 'transparent', color: 'success.main', borderRadius: '24px', border: '2px solid', borderColor: alpha(theme.palette.success.main, 0.2) }}>
          <CheckCircle sx={{ fontSize: 32 }} />
        </Avatar>
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
        {t('success.registrationHeading', 'Welcome aboard!')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: 5, lineHeight: 1.6 }}>
        {userName
          ? t('success.welcomeMessage', { name: userName, defaultValue: `Welcome, ${userName}! Your account is ready.` })
          : t('success.genericSuccessMessage', 'Your account has been created successfully.')}
      </Typography>

      <Divider sx={{ mb: 4, opacity: 0.5 }} />

      <Stack spacing={2}>
        <Button fullWidth variant="contained" onClick={handleGoToDashboard}
          endIcon={<ArrowForward />}
          sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: 'info.main', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.info.main, 0.4)}`, '&:hover': { bgcolor: 'info.dark', transform: 'translateY(-1px)', boxShadow: (t) => `0 6px 20px ${alpha(t.palette.info.main, 0.23)}` } }}>
          {t('success.goToDashboard', 'Go to Dashboard')}
        </Button>
        <Button fullWidth variant="outlined" onClick={handleCompleteLater}
          startIcon={<Settings sx={{ fontSize: 18 }} />}
          sx={{ py: 1.2, borderRadius: 3, fontWeight: 700, textTransform: 'none', color: 'text.primary', borderColor: alpha(theme.palette.divider, 0.8), '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) } }}>
          {t('success.completeProfileLater', 'Complete Profile Later')}
        </Button>
      </Stack>

      <Typography variant="caption" sx={{ mt: 4, display: 'block', color: 'text.disabled', textAlign: 'center' }}>
        {t('success.footerNote', 'You can always update your profile in settings.')}
      </Typography>
    </Box>
  )
}
