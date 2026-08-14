import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Button, Typography, TextField, Alert, Avatar, InputAdornment, IconButton,
  CircularProgress, Stack, alpha, useTheme,
} from '@mui/material'
import Security from '@mui/icons-material/Security';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ForwardToInbox from '@mui/icons-material/ForwardToInbox';
import Email from '@mui/icons-material/Email';
import Lock from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useChangeEmail } from "@auth"

export default function InitiateEmailChange() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()
  const [newEmail, setNewEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { mutate: changeEmail, isPending } = useChangeEmail({
    onSuccess: () => { setError(null); setIsSubmitted(true) },
    onError: (err: any) => setError(err.message || t('common.errorOccurred', 'An error occurred')),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail || !password) return
    changeEmail({ email: newEmail, password })
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
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <Box key="form" component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Avatar variant="square"
                  sx={{ width: 56, height: 56, bgcolor: 'transparent', color: 'primary.main', borderRadius: '24px', border: '2px solid', borderColor: alpha(theme.palette.primary.main, 0.2) }}>
                  <Email sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
                {t('email.initiateTitle', 'Update Email')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                {t('email.initiateSubtitle', 'Enter your new email and current password to proceed')}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}>{error}</Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', ml: 1, mb: 1, display: 'block', color: 'text.secondary' }}>
                    {t('email.newEmailLabel', 'New Email Address')}
                  </Typography>
                  <TextField fullWidth placeholder="name@company.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} disabled={isPending} required
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><Email sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>, sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) } } }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', ml: 1, mb: 1, display: 'block', color: 'text.secondary' }}>
                    {t('common.currentPassword', 'Current Password')}
                  </Typography>
                  <TextField fullWidth type={showPassword ? 'text' : 'password'} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isPending} required
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">{showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}</IconButton></InputAdornment>, sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) } } }} />
                </Box>
                <Button type="submit" fullWidth variant="contained" size="large" disabled={isPending || !newEmail || !password}
                  endIcon={isPending ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
                  sx={{ py: 1.5, mt: 1, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: 'info.main', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.info.main, 0.4)}`, '&:hover': { bgcolor: 'info.dark', transform: 'translateY(-1px)' } }}>
                  {isPending ? t('common.processing', 'Processing...') : t('email.updateButton', 'Update Email')}
                </Button>
                <Button variant="text" onClick={() => navigate(-1)} startIcon={<ArrowBack />}
                  sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}>
                  {t('common.back', 'Go back')}
                </Button>
              </Stack>
            </form>
          </Box>
        ) : (
          <Box key="success" component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Avatar variant="square"
                sx={{ width: 56, height: 56, bgcolor: 'transparent', color: 'warning.main', borderRadius: '24px', border: '2px solid', borderColor: alpha(theme.palette.warning.main, 0.2) }}>
                <Security sx={{ fontSize: 32 }} />
              </Avatar>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
              {t('email.confirmCurrentHeading', 'Authorization Required')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: 4, lineHeight: 1.6 }}>
              {t('email.confirmCurrentDescription', 'A verification link has been sent to your inbox. Please follow the instructions to complete your email change.')}
            </Typography>
            <Box sx={{ p: 3, bgcolor: 'action.hover', borderRadius: 3, mb: 4, textAlign: 'left', display: 'flex', gap: 2.5, alignItems: 'center', border: '1px solid', borderColor: 'divider' }}>
              <ForwardToInbox color="primary" sx={{ fontSize: 28, flexShrink: 0 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{t('email.checkInbox', 'Check your inbox')}</Typography>
                <Typography variant="body2" color="text.secondary">{t('email.authorizationRequiredV2', 'Click the confirmation link in your email.')}</Typography>
              </Box>
            </Box>
            <Button fullWidth variant="contained" size="large" onClick={() => navigate('/admin/dashboard')} endIcon={<ArrowForward />}
              sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: 'info.main', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.info.main, 0.4)}`, '&:hover': { bgcolor: 'info.dark', transform: 'translateY(-1px)' } }}>
              {t('common.backToDashboard', 'Back to Dashboard')}
            </Button>
          </Box>
        )}
      </AnimatePresence>
    </Box>
  )
}


