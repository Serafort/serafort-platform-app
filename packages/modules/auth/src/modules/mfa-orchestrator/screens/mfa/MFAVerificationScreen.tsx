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
  Tabs,
  Tab,
  Link as MuiLink,
} from '@mui/material'
import Shield from '@mui/icons-material/Shield'
import Timer from '@mui/icons-material/Timer'
import VpnKey from '@mui/icons-material/VpnKey'
import PhoneAndroid from '@mui/icons-material/PhoneAndroid'
import Sms from '@mui/icons-material/Sms'
import Fingerprint from '@mui/icons-material/Fingerprint'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@cap/platform-store'
import { secureTokenManager } from '@cap/platform-core'
import { mfaService } from '../../services/mfa.service'
import { usePasskey } from '../../hooks'
import Path from '../path'

type MfaVerificationMethod = 'totp' | 'sms' | 'passkey' | 'recovery'

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

  const [activeMethod, setActiveMethod] = useState<MfaVerificationMethod>('totp')
  const [code, setCode] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [recoveryCode, setRecoveryCode] = useState('')
  const [timeLeft, setTimeLeft] = useState(600)
  const [smsCooldown, setSmsCooldown] = useState(0)
  const [smsSentMessage, setSmsSentMessage] = useState<string | null>(null)
  const [sendingSms, setSendingSms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const { loginWithPasskey, isLoading: isPasskeyLoading, error: passkeyError } = usePasskey()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((p) => (p > 0 ? p - 1 : 0)), 1000)
    return () => {
      clearInterval(timer)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (smsCooldown <= 0) return
    const cooldownTimer = setInterval(() => setSmsCooldown((p) => (p > 0 ? p - 1 : 0)), 1000)
    return () => clearInterval(cooldownTimer)
  }, [smsCooldown])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  const handleSendSms = async () => {
    try {
      setSendingSms(true)
      setError(null)
      const res = await mfaService.sms.sendCode()
      setSmsSentMessage(res.data?.message || 'Verification code sent to your registered phone.')
      setSmsCooldown(60)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to send SMS code.')
    } finally {
      setSendingSms(false)
    }
  }

  const handlePasskeyAuth = async () => {
    try {
      setError(null)
      const response = await loginWithPasskey(email || undefined)
      if (response?.data?.user) {
        setUser(response.data.user)
      }
      if (response?.data?.token) {
        if (setToken) setToken(response.data.token)
        secureTokenManager.setTokens({
          accessToken: response.data.token,
          expiresAt: Date.now() + (response.data.expires_in || 3600) * 1000,
        })
      }
      setSuccessMsg(t('mfa.verificationSuccess', 'Verification successful! Logging you in...'))
      timeoutRef.current = setTimeout(() => {
        navigate(stateData.redirectUrl || '/dashboard')
      }, 1000)
    } catch (err: any) {
      setError(
        passkeyError ||
          err.response?.data?.message ||
          err.message ||
          'Passkey verification failed.',
      )
    }
  }

  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let response: any

      if (activeMethod === 'recovery') {
        if (!recoveryCode.trim()) return
        response = await mfaService.recoveryVerify({
          mfaToken: mfaToken || undefined,
          userId: userId || undefined,
          email: email || undefined,
          code: recoveryCode.trim(),
        })
      } else if (activeMethod === 'sms') {
        if (smsCode.length !== 6) return
        response = await mfaService.sms.verifyLogin({
          userId: userId || undefined,
          code: smsCode,
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
      if (response.data?.token) {
        if (setToken) setToken(response.data.token)
        secureTokenManager.setTokens({
          accessToken: response.data.token,
          expiresAt: Date.now() + (response.data.expires_in || 3600) * 1000,
        })
      }

      setSuccessMsg(t('mfa.verificationSuccess', 'Verification successful! Logging you in...'))
      timeoutRef.current = setTimeout(() => {
        navigate(stateData.redirectUrl || '/dashboard')
      }, 1000)
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          t('mfa.verifyFailed', 'Verification failed. Please check your code and try again.'),
      )
    } finally {
      setLoading(false)
    }
  }, [
    activeMethod,
    code,
    smsCode,
    recoveryCode,
    mfaToken,
    userId,
    email,
    navigate,
    setUser,
    setToken,
    stateData.redirectUrl,
    t,
  ])

  return (
    <Box
      className='animate-scale-in'
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      sx={{ width: '100%', maxWidth: 480, mx: 'auto', p: { xs: 3, md: 5 }, textAlign: 'center' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Avatar
          variant='square'
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
          {activeMethod === 'recovery' ? (
            <VpnKey sx={{ fontSize: 32 }} />
          ) : activeMethod === 'sms' ? (
            <Sms sx={{ fontSize: 32 }} />
          ) : activeMethod === 'passkey' ? (
            <Fingerprint sx={{ fontSize: 32 }} />
          ) : (
            <Shield sx={{ fontSize: 32 }} />
          )}
        </Avatar>
      </Box>

      <Typography variant='h4' sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.027em' }}>
        {activeMethod === 'recovery'
          ? t('mfa.recoveryTitle', 'Enter Recovery Code')
          : activeMethod === 'sms'
            ? t('mfa.smsHeading', 'SMS Verification')
            : activeMethod === 'passkey'
              ? t('mfa.passkeyHeading', 'Passkey Sign-In')
              : t('mfa.verifyHeading', 'Two-Factor Authentication')}
      </Typography>
      <Typography
        variant='body1'
        color='text.secondary'
        sx={{ fontWeight: 500, mb: 3, lineHeight: 1.6 }}
      >
        {activeMethod === 'recovery'
          ? t(
              'mfa.recoveryDescription',
              'Enter one of your 10-character emergency backup recovery codes.',
            )
          : activeMethod === 'sms'
            ? t('mfa.smsDescription', 'Enter the 6-digit code sent to your mobile phone via SMS.')
            : activeMethod === 'passkey'
              ? t(
                  'mfa.passkeyDescription',
                  'Verify your device biometrics, security key, or Windows Hello.',
                )
              : t(
                  'mfa.verifyDescription',
                  'Enter the 6-digit verification code from your authenticator app.',
                )}
      </Typography>

      {successMsg && (
        <Alert
          severity='success'
          sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}
        >
          {successMsg}
        </Alert>
      )}
      {error && (
        <Alert
          severity='error'
          sx={{
            mb: 3,
            borderRadius: 2,
            textAlign: 'left',
            '& .MuiAlert-message': { fontWeight: 600 },
          }}
        >
          {error}
        </Alert>
      )}
      {smsSentMessage && activeMethod === 'sms' && (
        <Alert severity='info' sx={{ mb: 3, borderRadius: 2, textAlign: 'left' }}>
          {smsSentMessage}
        </Alert>
      )}

      {/* Method Selector Tabs */}
      <Tabs
        value={activeMethod}
        onChange={(_e, val) => {
          setError(null)
          setActiveMethod(val)
        }}
        variant='fullWidth'
        sx={{
          mb: 3,
          minHeight: 40,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': {
            minHeight: 40,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.8rem',
          },
        }}
      >
        <Tab
          icon={<PhoneAndroid fontSize='small' />}
          iconPosition='start'
          label='TOTP App'
          value='totp'
        />
        <Tab icon={<Sms fontSize='small' />} iconPosition='start' label='SMS OTP' value='sms' />
        <Tab
          icon={<Fingerprint fontSize='small' />}
          iconPosition='start'
          label='Passkey'
          value='passkey'
        />
        <Tab
          icon={<VpnKey fontSize='small' />}
          iconPosition='start'
          label='Backup Code'
          value='recovery'
        />
      </Tabs>

      <Stack spacing={3}>
        {activeMethod === 'recovery' && (
          <Box>
            <Typography
              variant='caption'
              sx={{
                fontWeight: 800,
                textTransform: 'uppercase',
                ml: 1,
                mb: 1,
                display: 'block',
                color: 'text.secondary',
                textAlign: 'left',
              }}
            >
              {t('mfa.recoveryCodeLabel', 'Backup Recovery Code')}
            </Typography>
            <TextField
              fullWidth
              variant='outlined'
              placeholder='XXXX-XXXX-XX'
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
              disabled={loading}
              inputProps={{
                style: {
                  textAlign: 'center',
                  fontSize: '1.25rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                },
              }}
              slotProps={{
                input: {
                  sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) },
                },
              }}
            />
          </Box>
        )}

        {activeMethod === 'totp' && (
          <Box>
            <Typography
              variant='caption'
              sx={{
                fontWeight: 800,
                textTransform: 'uppercase',
                ml: 1,
                mb: 1,
                display: 'block',
                color: 'text.secondary',
                textAlign: 'left',
              }}
            >
              {t('mfa.enterCode', '6-Digit Verification Code')}
            </Typography>
            <TextField
              fullWidth
              variant='outlined'
              placeholder='000 000'
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={loading}
              inputProps={{
                style: {
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  letterSpacing: '8px',
                  fontWeight: 700,
                },
              }}
              slotProps={{
                input: {
                  sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) },
                },
              }}
            />
          </Box>
        )}

        {activeMethod === 'sms' && (
          <Box>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'
              sx={{ mb: 1, px: 1 }}
            >
              <Typography
                variant='caption'
                sx={{
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: 'text.secondary',
                }}
              >
                {t('mfa.smsCodeLabel', '6-Digit SMS Code')}
              </Typography>
              <Button
                size='small'
                variant='text'
                disabled={sendingSms || smsCooldown > 0}
                onClick={handleSendSms}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', p: 0 }}
              >
                {smsCooldown > 0
                  ? `Resend in ${smsCooldown}s`
                  : sendingSms
                    ? 'Sending...'
                    : 'Send Code via SMS'}
              </Button>
            </Stack>
            <TextField
              fullWidth
              variant='outlined'
              placeholder='000 000'
              value={smsCode}
              onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              disabled={loading}
              inputProps={{
                style: {
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  letterSpacing: '8px',
                  fontWeight: 700,
                },
              }}
              slotProps={{
                input: {
                  sx: { borderRadius: 3, bgcolor: alpha(theme.palette.background.paper, 0.6) },
                },
              }}
            />
          </Box>
        )}

        {activeMethod === 'passkey' && (
          <Box sx={{ py: 2 }}>
            <Button
              fullWidth
              variant='contained'
              size='large'
              onClick={handlePasskeyAuth}
              disabled={isPasskeyLoading}
              startIcon={
                isPasskeyLoading ? <CircularProgress size={20} color='inherit' /> : <Fingerprint />
              }
              sx={{
                py: 1.8,
                borderRadius: 3,
                fontWeight: 800,
                fontSize: '1rem',
                textTransform: 'none',
                bgcolor: 'info.main',
                boxShadow: `0 4px 14px ${alpha(theme.palette.info.main, 0.4)}`,
                '&:hover': { bgcolor: 'info.dark' },
              }}
            >
              {isPasskeyLoading
                ? t('mfa.verifying', 'Checking Passkey...')
                : t('mfa.usePasskeyBtn', 'Sign in with Passkey')}
            </Button>
          </Box>
        )}

        {activeMethod !== 'passkey' && (
          <Button
            fullWidth
            variant='contained'
            size='large'
            disabled={
              (activeMethod === 'recovery'
                ? !recoveryCode.trim()
                : activeMethod === 'sms'
                  ? smsCode.length !== 6
                  : code.length !== 6) || loading
            }
            onClick={handleSubmit}
            endIcon={loading ? <CircularProgress size={20} color='inherit' /> : <ArrowForward />}
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
            {loading
              ? t('mfa.verifying', 'Verifying...')
              : t('mfa.verifyButton', 'Verify & Sign In')}
          </Button>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Timer sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant='caption' sx={{ fontWeight: 600, color: 'text.secondary' }}>
            {t('mfa.codeExpires', 'Challenge session expires in')}{' '}
            <Box component='span' sx={{ color: 'primary.main', fontWeight: 700 }}>
              {formatTime(timeLeft)}
            </Box>
          </Typography>
        </Box>
      </Stack>
    </Box>
  )
}
