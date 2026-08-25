import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Button,
  Typography,
  Alert,
  TextField,
  Avatar,
  CircularProgress,
  alpha,
  useTheme,
  Stack,
  Link as MuiLink,
} from '@mui/material'
import Shield from '@mui/icons-material/Shield'
import Timer from '@mui/icons-material/Timer'
import VpnKey from '@mui/icons-material/VpnKey'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@cap/platform-store'
import { mfaService } from '../services/mfa.service'
import Path from './path'

export default function MFAVerificationScreen() {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const setUser = useAppStore((state) => state.setUser)
  const setToken = useAppStore((state) => (state as any).setToken)

  const stateData = (location.state as any) || {}
  const mfaToken = stateData.mfaToken || stateData.mfa_token || ''
  const userId = stateData.userId || stateData.user_id || ''
  const email = stateData.email || ''

  const [code, setCode] = useState('')
  const [recoveryCode, setRecoveryCode] = useState('')
  const [useRecovery, setUseRecovery] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let response: any

      if (useRecovery) {
        if (!recoveryCode.trim()) return
        response = await mfaService.recoveryVerify({
          userId: userId || undefined,
          email: email || undefined,
          code: recoveryCode.trim(),
        })
      } else {
        if (code.length !== 6) return
        response = await mfaService.verifyLogin({
          mfaToken: mfaToken || undefined,
          userId: userId || undefined,
          code,
        })
      }

      if (response.data?.user) {
        setUser(response.data.user)
      }
      if (response.data?.token && setToken) {
        setToken(response.data.token)
      }

      setSuccessMsg(t('mfa.verificationSuccess', 'Verification successful! Logging you in...'))
      timeoutRef.current = setTimeout(() => {
        navigate(stateData.redirectUrl || '/dashboard')
      }, 1000)
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        t('mfa.verifyFailed', 'Verification failed. Please check your code and try again.')
      )
    } finally {
      setLoading(false)
    }
  }, [code, recoveryCode, useRecovery, mfaToken, userId, email, navigate, setUser, setToken, stateData.redirectUrl, t])

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
        <Avatar
          variant="square"
          sx={{
            width: 56,
            height: 56,
            bgcolor: 'transparent',
            color: 'primary.main',
            borderRadius: '24px',
            border: '2px solid',
            borderColor: alpha(theme.palette.primary.main, 0.2),
          }}
        >
          {useRecovery ? <VpnKey sx={{ fontSize: 32 }} /> : <Shield sx={{ fontSize: 32 }} />}
        </Avatar>
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
        {useRecovery ? t('mfa.recoveryTitle', 'Enter Recovery Code') : t('mfa.verifyHeading', 'Two-Factor Authentication')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, mb: 4, lineHeight: 1.6 }}>
        {useRecovery
          ? t('mfa.recoveryDescription', 'Enter one of your 10-character emergency backup recovery codes.')
          : t('mfa.verifyDescription', 'Enter the 6-digit verification code from your authenticator app.')}
      </Typography>

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}>
          {successMsg}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, textAlign: 'left', '& .MuiAlert-message': { fontWeight: 600 } }}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {useRecovery ? (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', ml: 1, mb: 1, display: 'block', color: 'text.secondary', textAlign: 'left' }}>
              {t('mfa.recoveryCodeLabel', 'Backup Recovery Code')}
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="XXXX-XXXX-XX"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
              disabled={loading}
              inputProps={{ style: { textAlign: 'center', fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 700 } }}
              slotProps={{ input: { sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) } } }}
            />
          </Box>
        ) : (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', ml: 1, mb: 1, display: 'block', color: 'text.secondary', textAlign: 'left' }}>
              {t('mfa.enterCode', '6-Digit Verification Code')}
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="000 000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={loading}
              inputProps={{ style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', fontWeight: 700 } }}
              slotProps={{ input: { sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) } } }}
            />
          </Box>
        )}

        {!useRecovery && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Timer sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              {t('mfa.codeExpires', 'Challenge expires in')}{' '}
              <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
                {formatTime(timeLeft)}
              </Box>
            </Typography>
          </Box>
        )}

        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={(useRecovery ? !recoveryCode.trim() : code.length !== 6) || loading}
          onClick={handleSubmit}
          endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
          sx={{
            py: 1.5,
            borderRadius: 3,
            fontWeight: 800,
            fontSize: '1rem',
            textTransform: 'none',
            bgcolor: 'primary.main',
            boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
            '&:hover': { bgcolor: 'primary.dark', transform: 'translateY(-1px)' },
          }}
        >
          {loading ? t('mfa.verifying', 'Verifying...') : t('mfa.verifyButton', 'Verify & Sign In')}
        </Button>

        <MuiLink
          component="button"
          type="button"
          onClick={() => {
            setError(null)
            setUseRecovery(!useRecovery)
          }}
          sx={{
            color: 'text.secondary',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': { color: 'primary.main', textDecoration: 'underline' },
          }}
        >
          {useRecovery
            ? t('mfa.useAuthenticatorApp', 'Use authenticator code instead')
            : t('mfa.useRecoveryCode', 'Lost your device? Use a backup recovery code')}
        </MuiLink>
      </Stack>
    </Box>
  )
}
