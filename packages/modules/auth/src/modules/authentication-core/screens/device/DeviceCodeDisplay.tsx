import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Alert, Stack, CircularProgress, IconButton, Avatar, alpha, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Devices from '@mui/icons-material/Devices';
import ArrowBack from '@mui/icons-material/ArrowBack';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';
import { useDeviceAuth } from '@idaas/authentication-core/hooks';
import { motion } from 'framer-motion';

const DeviceCodeDisplay = () => {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { mutate: verifyCode, isPending } = useDeviceAuth()

  // Auto-format: XXXX-XXXX
  useEffect(() => {
    if (code) {
      const cleaned = code.replace(/[^A-Z0-9]/gi, '').toUpperCase()
      let formatted = cleaned
      if (cleaned.length > 4) formatted = `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`
      if (formatted !== code) setCode(formatted)
    }
  }, [code])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    const cleanedCode = code.replace(/-/g, '')
    if (cleanedCode.length !== 8) return

    verifyCode(cleanedCode, {
      onSuccess: (response: any) => {
        if (response.data.success && response.data.redirectUrl) {
          window.location.href = response.data.redirectUrl
        } else {
          setErrorMessage(t('device.errorGeneric', 'Verification failed. Please check the code.'))
        }
      },
      onError: (err: any) => {
        setErrorMessage(
          err.response?.data?.error === 'invalid_user_code'
            ? t('device.invalidCode', 'Invalid or expired code. Please try again.')
            : t('device.errorGeneric', 'Verification failed.')
        )
      },
    })
  }

  return (
    <Box
      className="animate-scale-in"
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      sx={{ width: '100%', maxWidth: 480, mx: 'auto', p: { xs: 3, md: 5 } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: 'text.secondary', mr: 1 }}>
          <ArrowBack />
        </IconButton>
      </Box>

      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Avatar variant="square"
            sx={{ width: 56, height: 56, bgcolor: 'transparent', color: 'primary.main', borderRadius: '24px', border: '2px solid', borderColor: alpha(theme.palette.primary.main, 0.2) }}>
            <Devices sx={{ fontSize: 32 }} />
          </Avatar>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
          {t('device.activateTitle', 'Activate Device')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          {t('device.enterCodeHelp', 'Enter the code displayed on your other device to securely link it to your account.')}
        </Typography>
      </Box>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}>
          {errorMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <Stack spacing={3}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', ml: 1, mb: 1, display: 'block', color: 'text.secondary' }}>
              {t('device.codeLabel', 'Device Code')}
            </Typography>
            <TextField fullWidth placeholder="0000-0000" value={code}
              onChange={(e) => setCode(e.target.value)} variant="outlined" autoFocus autoComplete="off"
              inputProps={{ maxLength: 9, style: { textAlign: 'center', fontSize: '1.75rem', fontWeight: 700, letterSpacing: '0.15em' } }}
              slotProps={{ input: { sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) } } }} />
          </Box>

          <Button type="submit" fullWidth variant="contained" size="large" disabled={isPending || code.replace(/-/g, '').length !== 8}
            endIcon={isPending ? <CircularProgress size={20} color="inherit" /> : <CheckCircleOutline />}
            sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: 'info.main', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.info.main, 0.4)}`, '&:hover': { bgcolor: 'info.dark', transform: 'translateY(-1px)' } }}>
            {t('device.continue', 'Continue')}
          </Button>
        </Stack>
      </form>

      <Typography variant="caption" color="text.disabled" sx={{ mt: 4, display: 'block', textAlign: 'center' }}>
        {t('device.securityWarning', 'Never share your activation code with anyone.')}
      </Typography>
    </Box>
  )
}

export default DeviceCodeDisplay

