import { useState } from 'react'
import {
  Box, Button, TextField, Typography, Avatar, Divider,
  CircularProgress, Stack, alpha, useTheme,
} from '@mui/material'
import Fingerprint from '@mui/icons-material/Fingerprint';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Lock from '@mui/icons-material/Lock';
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export default function PasskeyLoginOption() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [email, setEmail] = useState('')

  const handlePasskeyLogin = () => {
    setIsAuthenticating(true)
    setTimeout(() => setIsAuthenticating(false), 2000)
  }

  return (
    <Box
      className="animate-scale-in"
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      sx={{ width: '100%', maxWidth: 440, mx: 'auto', p: { xs: 3, md: 5 } }}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Avatar variant="square"
            sx={{ width: 56, height: 56, bgcolor: 'transparent', color: 'primary.main', borderRadius: '24px', border: '2px solid', borderColor: alpha(theme.palette.primary.main, 0.2) }}>
            <Fingerprint sx={{ fontSize: 32 }} />
          </Avatar>
        </Box>
        <Typography variant="h4" fontWeight={900} letterSpacing="-0.027em" sx={{ mb: 1 }}>
          {t('passkey.welcomeBack', 'Welcome back')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          {t('passkey.loginSubtitle', 'Sign in with your passkey for quick, secure access.')}
        </Typography>
      </Box>

      <Stack spacing={3}>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', ml: 1, mb: 1, display: 'block', color: 'text.secondary' }}>
            {t('passkey.emailLabel', 'Email Address')}
          </Typography>
          <TextField fullWidth type="email" placeholder="you@example.com" value={email}
            onChange={(e) => setEmail(e.target.value)}
            slotProps={{ input: { sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) } } }} />
        </Box>

        <Button fullWidth variant="contained" size="large" onClick={handlePasskeyLogin}
          disabled={isAuthenticating || !email}
          startIcon={isAuthenticating ? <CircularProgress size={20} color="inherit" /> : <Fingerprint />}
          sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: 'info.main', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.info.main, 0.4)}`, '&:hover': { bgcolor: 'info.dark', transform: 'translateY(-1px)', boxShadow: (t) => `0 6px 20px ${alpha(t.palette.info.main, 0.23)}` } }}>
          {isAuthenticating ? t('passkey.authenticating', 'Authenticating...') : t('passkey.loginPasskey', 'Sign in with Passkey')}
        </Button>

        <Divider sx={{ opacity: 0.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {t('common.or', 'OR')}
          </Typography>
        </Divider>

        <Button fullWidth variant="outlined" size="large" endIcon={<ArrowForward />}
          sx={{ py: 1.2, borderRadius: 3, fontWeight: 700, textTransform: 'none', color: 'text.primary', borderColor: alpha(theme.palette.divider, 0.8), '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) } }}>
          {t('passkey.usePassword', 'Sign in with password')}
        </Button>
      </Stack>

      <Box sx={{ mt: 5, textAlign: 'center' }}>
        <Typography variant="caption" color="text.disabled"
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
          <Lock sx={{ fontSize: 12 }} />
          {t('passkey.phishingResistant', 'Passkeys are phishing-resistant and encrypted end-to-end.')}
        </Typography>
      </Box>
    </Box>
  )
}
