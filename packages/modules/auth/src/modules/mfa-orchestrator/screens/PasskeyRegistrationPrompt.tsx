import { useState } from 'react'
import {
  Box, Button, Typography, Avatar, List, ListItem, ListItemIcon, ListItemText,
  Alert, Stack, Link, alpha, useTheme,
} from '@mui/material'
import Fingerprint from '@mui/icons-material/Fingerprint';
import Bolt from '@mui/icons-material/Bolt';
import VerifiedUser from '@mui/icons-material/VerifiedUser';
import Devices from '@mui/icons-material/Devices';
import CheckCircle from '@mui/icons-material/CheckCircle';
import OpenInNew from '@mui/icons-material/OpenInNew';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { startRegistration } from '@simplewebauthn/browser'
import { mfaService } from '../services/mfa.service'

export default function PasskeyRegistrationPrompt() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreatePasskey = async () => {
    setLoading(true)
    setError(null)
    try {
      const optionsRes = await mfaService.passkeys.getRegistrationOptions()
      const regResp = await startRegistration(optionsRes.data)
      await mfaService.passkeys.verifyRegistration(regResp)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || t('passkey.registrationFailed', 'Passkey registration cancelled or failed'))
    } finally {
      setLoading(false)
    }
  }

  const benefits = [
    { icon: <Bolt />, title: t('passkey.benefitInstantTitle', 'Instant sign-in'), description: t('passkey.benefitInstantDesc', 'No passwords to remember or type.') },
    { icon: <VerifiedUser />, title: t('passkey.benefitSafetyTitle', 'Phishing-resistant'), description: t('passkey.benefitSafetyDesc', 'Tied to your device, not a password.') },
    { icon: <Devices />, title: t('passkey.benefitSyncTitle', 'Syncs across devices'), description: t('passkey.benefitSyncDesc', 'Works on all your trusted devices.') },
  ]

  return (
    <Box
      className="animate-scale-in"
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      sx={{ width: '100%', maxWidth: 480, mx: 'auto', p: { xs: 3, md: 5 } }}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Avatar variant="square"
            sx={{ width: 56, height: 56, bgcolor: 'transparent', color: 'primary.main', borderRadius: '24px', border: '2px solid', borderColor: alpha(theme.palette.primary.main, 0.2) }}>
            <Fingerprint sx={{ fontSize: 32 }} />
          </Avatar>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
          {t('passkey.registrationTitle', 'Add a passkey')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, maxWidth: 360, mx: 'auto' }}>
          {t('passkey.registrationDesc', 'Passkeys replace passwords with your device biometrics for a faster, safer sign-in.')}
        </Typography>
      </Box>

      <List disablePadding sx={{ mb: 4 }}>
        {benefits.map((benefit, index) => (
          <ListItem key={index} sx={{ px: 1.5, py: 1.5, borderRadius: 2, mb: 1, '&:hover': { bgcolor: 'action.hover' } }}>
            <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>{benefit.icon}</ListItemIcon>
            <ListItemText
              primary={benefit.title} secondary={benefit.description}
              primaryTypographyProps={{ fontWeight: 700, fontSize: 15 }}
              secondaryTypographyProps={{ fontSize: 13 }}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3 }}>
        <CheckCircle color="primary" sx={{ fontSize: 16 }} />
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          {t('passkey.supportedOn', 'Supported on Touch ID, Face ID, Windows Hello, and hardware keys')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        <Button fullWidth variant="contained" size="large" onClick={handleCreatePasskey} disabled={loading}
          endIcon={<ArrowForward />}
          sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: 'info.main', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.info.main, 0.4)}`, '&:hover': { bgcolor: 'info.dark', transform: 'translateY(-1px)', boxShadow: (t) => `0 6px 20px ${alpha(t.palette.info.main, 0.23)}` } }}>
          {t('passkey.createButton', 'Create a passkey')}
        </Button>
        <Button fullWidth variant="text" onClick={() => navigate(-1)} disabled={loading}
          sx={{ py: 1.2, fontWeight: 500, color: 'text.secondary', textTransform: 'none', '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) } }}>
          {t('mfa.skipNow', 'Skip for now')}
        </Button>
      </Stack>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Link href="https://webauthn.guide" target="_blank" rel="noopener noreferrer"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: 12, fontWeight: 500 }}>
          {t('passkey.whatIsPasskey', 'What is a passkey?')}
          <OpenInNew sx={{ fontSize: 12 }} />
        </Link>
      </Box>
    </Box>
  )
}
