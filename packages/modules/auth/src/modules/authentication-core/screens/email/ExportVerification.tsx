import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Button, Typography, TextField, Avatar, LinearProgress,
  alpha, useTheme, Stack,
} from '@mui/material'
import CloudDownload from '@mui/icons-material/CloudDownload';
import VerifiedUser from '@mui/icons-material/VerifiedUser';
import LockOutlined from '@mui/icons-material/LockOutlined';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export default function ExportVerification() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()
  const [step, setStep] = useState<'request' | 'verifying' | 'ready'>('request')
  const [code, setCode] = useState('')

  const handleVerify = useCallback(() => {
    if (code.length < 6) return
    setStep('ready')
  }, [code])

  const icons = { request: <CloudDownload sx={{ fontSize: 32 }} />, verifying: <LockOutlined sx={{ fontSize: 32 }} />, ready: <VerifiedUser sx={{ fontSize: 32 }} /> }
  const colors = { request: theme.palette.primary.main, verifying: theme.palette.primary.main, ready: theme.palette.success.main }

  return (
    <Box
      className="animate-scale-in"
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      sx={{ width: '100%', maxWidth: 480, mx: 'auto', p: { xs: 3, md: 5 }, textAlign: 'center' }}
    >
      {step === 'verifying' && <LinearProgress sx={{ height: 4, borderRadius: 2, mb: 4 }} />}

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Avatar variant="square"
          sx={{ width: 56, height: 56, bgcolor: 'transparent', borderRadius: '24px', border: '2px solid', color: colors[step], borderColor: alpha(colors[step], 0.2) }}>
          {icons[step]}
        </Avatar>
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
        {step === 'request' && t('export.requestHeading', 'Secure Export')}
        {step === 'verifying' && t('export.verifyingHeading', 'Verify Identity')}
        {step === 'ready' && t('export.readyHeading', 'Export Ready')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: 4, lineHeight: 1.6 }}>
        {step === 'request' && t('export.requestDesc', 'Your account data is ready for export. For your protection, we require one-time verification.')}
        {step === 'verifying' && t('export.verifyingDesc', "We've sent a 6-digit code to your registered email address.")}
        {step === 'ready' && t('export.readyDesc', 'Verification successful. Your secure download link is now active for 1 hour.')}
      </Typography>

      {step === 'verifying' && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', ml: 1, mb: 1, display: 'block', color: 'text.secondary', textAlign: 'left' }}>
            {t('export.codeLabel', 'Verification Code')}
          </Typography>
          <TextField fullWidth placeholder="000000" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputProps={{ style: { textAlign: 'center', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '0.3em' } }}
            slotProps={{ input: { sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) } } }} />
        </Box>
      )}

      <Stack spacing={2}>
        {step === 'request' && (
          <Button variant="contained" size="large" onClick={() => setStep('verifying')} endIcon={<ArrowForward />}
            sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: 'info.main', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.info.main, 0.4)}`, '&:hover': { bgcolor: 'info.dark', transform: 'translateY(-1px)' } }}>
            {t('export.sendCode', 'Send Verification Code')}
          </Button>
        )}
        {step === 'verifying' && (
          <Button variant="contained" size="large" onClick={handleVerify} disabled={code.length < 6} endIcon={<ArrowForward />}
            sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: 'info.main', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.info.main, 0.4)}`, '&:hover': { bgcolor: 'info.dark', transform: 'translateY(-1px)' } }}>
            {t('export.verifyButton', 'Verify & Unlock')}
          </Button>
        )}
        {step === 'ready' && (
          <Button variant="contained" color="success" size="large" startIcon={<CloudDownload />}
            sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.success.main, 0.4)}` }}>
            {t('export.downloadNow', 'Download Data (.zip)')}
          </Button>
        )}
        <Button variant="text" onClick={() => navigate(-1)}
          sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}>
          {t('common.cancel', 'Cancel')}
        </Button>
      </Stack>
    </Box>
  )
}
