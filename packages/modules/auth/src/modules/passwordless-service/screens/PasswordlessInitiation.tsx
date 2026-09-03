import React, { useState } from 'react'
import {
  Box, Typography, TextField, Button, Divider, alpha, useTheme,
  InputAdornment, CircularProgress, Stack, Alert, Avatar,
} from '@mui/material'
import Email from '@mui/icons-material/Email';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Fingerprint from '@mui/icons-material/Fingerprint';
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePasswordlessSend } from '../hooks'
import Path from './path'
import { Path as AuthPath } from '@cap/module-auth/routes/path'

export default function PasswordlessInitiation() {
  const { t } = useTranslation('common')
  const theme = useTheme()
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [error, setError] = useState<string | null>(null)

  const sendMutation = usePasswordlessSend({
    onSuccess: () => {
      navigate(`${Path.verification}?email=${encodeURIComponent(identifier)}`)
    },
    onError: (error: any) => {
      setError(
        error.response?.data?.message ||
          t('auth.passwordless.send_failed', 'Failed to send the magic link. Please try again.'),
      )
    },
  })

  const isLoading = sendMutation.isPending

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!identifier) {
      setError(t('auth.passwordless.error_incomplete', 'Please enter your email address.'))
      return
    }
    sendMutation.mutate(identifier)
  }

  return (
    <Box
      className="animate-scale-in"
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      sx={{ width: '100%', maxWidth: 440, mx: 'auto', p: { xs: 3, md: 5 }, position: 'relative' }}
    >
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Avatar variant="square"
            sx={{ width: 56, height: 56, bgcolor: 'transparent', color: 'primary.main', borderRadius: '24px', border: '2px solid', borderColor: alpha(theme.palette.primary.main, 0.2) }}>
            <Fingerprint sx={{ fontSize: 32 }} />
          </Avatar>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
          {t('auth.passwordless.heading')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          {t('auth.passwordless.subheading')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleInitiate}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', ml: 1, mb: 1, display: 'block', color: 'text.secondary' }}>
              {t('auth.passwordless.email_address')}
            </Typography>
            <TextField fullWidth placeholder="name@company.com" value={identifier}
              onChange={(e) => setIdentifier(e.target.value)} disabled={isLoading} autoComplete="email" autoFocus
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Email sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>, sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) } } }} />
          </Box>
          <Button type="submit" fullWidth variant="contained" disabled={isLoading || !identifier}
            endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
            sx={{ py: 1.5, mt: 2, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: 'info.main', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.info.main, 0.4)}`, '&:hover': { bgcolor: 'info.dark', transform: 'translateY(-1px)', boxShadow: (t) => `0 6px 20px ${alpha(t.palette.info.main, 0.23)}` } }}>
            {isLoading ? t('auth.passwordless.sending') : t('auth.passwordless.send_magic_link')}
          </Button>
        </Stack>
      </form>

      <Divider sx={{ my: 4, opacity: 0.5 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {t('common.or')}
        </Typography>
      </Divider>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" onClick={() => navigate(AuthPath.auth.signin)}
          sx={{ fontWeight: 800, color: 'text.secondary', cursor: 'pointer', '&:hover': { color: 'text.primary', textDecoration: 'underline' } }}>
          {t('auth.passwordless.use_password_instead')}
        </Typography>
      </Box>
    </Box>
  )
}
