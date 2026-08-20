import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Button, Typography, Alert, TextField, Avatar,
  alpha, useTheme, Stack,
} from '@mui/material'
import Shield from '@mui/icons-material/Shield';
import Timer from '@mui/icons-material/Timer';
import LockReset from '@mui/icons-material/LockReset';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Path } from "@auth/routes/path"

export default function MFAVerificationScreen() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [timeLeft, setTimeLeft] = useState(600)
  const [error, _setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((p) => (p > 0 ? p - 1 : 0)), 1000)
    return () => {
      clearInterval(timer)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  const handleSubmit = useCallback(() => {
    if (code.length !== 6) return
    setSuccessMsg(t('mfa.setupVerified', 'MFA method successfully verified!'))
    timeoutRef.current = setTimeout(() => navigate(Path.user.security), 2000)
  }, [code, navigate, t])

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
          sx={{ width: 56, height: 56, bgcolor: 'transparent', color: 'primary.main', borderRadius: '24px', border: '2px solid', borderColor: alpha(theme.palette.primary.main, 0.2) }}>
          <Shield sx={{ fontSize: 32 }} />
        </Avatar>
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
        {t('mfa.verifySetupHeading', 'Verify MFA Setup')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: 4, lineHeight: 1.6 }}>
        {t('mfa.verifySetupDescription', "We've sent a code to your email. Enter it below to complete setup.")}
      </Typography>

      {successMsg && <Alert severity="success" sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}>{successMsg}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}>{error}</Alert>}

      <Stack spacing={3}>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', ml: 1, mb: 1, display: 'block', color: 'text.secondary', textAlign: 'left' }}>
            {t('mfa.enterCode', 'Verification Code')}
          </Typography>
          <TextField fullWidth variant="outlined" placeholder="000 000" value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputProps={{ style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', fontWeight: 700 } }}
            slotProps={{ input: { sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) } } }} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Timer sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            {t('mfa.codeExpires', 'Code expires in')}{' '}
            <Box component="span" sx={{ color: 'primary.main' }}>{formatTime(timeLeft)}</Box>
          </Typography>
        </Box>

        <Button fullWidth variant="contained" size="large" disabled={code.length !== 6} onClick={handleSubmit}
          endIcon={<ArrowForward />}
          sx={{ py: 1.5, borderRadius: 3, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: 'info.main', boxShadow: (t) => `0 4px 14px ${alpha(t.palette.info.main, 0.4)}`, '&:hover': { bgcolor: 'info.dark', transform: 'translateY(-1px)' } }}>
          {t('mfa.verifySetupButton', 'Verify & Finish Setup')}
        </Button>

        <Button variant="text" startIcon={<LockReset />}
          sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}>
          {t('mfa.resendCode', 'Resend Code')}
        </Button>
      </Stack>
    </Box>
  )
}
