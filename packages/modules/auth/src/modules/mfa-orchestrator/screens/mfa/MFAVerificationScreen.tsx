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
import { useTranslation } from 'react-i18next'
import {
  AuthPageLayout,
  AuthCard,
  AuthCardHeader,
  AuthInputLabel,
  AuthCodeInput,
  AuthTextField,
} from '../../../authentication-core/components/shared/auth'
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

  const methodIcon =
    activeMethod === 'recovery' ? (
      <VpnKey sx={{ fontSize: 32 }} />
    ) : activeMethod === 'sms' ? (
      <Sms sx={{ fontSize: 32 }} />
    ) : activeMethod === 'passkey' ? (
      <Fingerprint sx={{ fontSize: 32 }} />
    ) : (
      <Shield sx={{ fontSize: 32 }} />
    )

  return (
    <AuthPageLayout maxWidth={520}>
      <AuthCard padding='standard'>
        <Box sx={{ textAlign: 'center' }}>
          <AuthCardHeader
            icon={methodIcon}
            iconSize={64}
            title={
              activeMethod === 'recovery'
                ? t('mfa.recoveryTitle', 'Enter Recovery Code')
                : activeMethod === 'sms'
                  ? t('mfa.smsHeading', 'SMS Verification')
                  : activeMethod === 'passkey'
                    ? t('mfa.passkeyHeading', 'Passkey Sign-In')
                    : t('mfa.verifyHeading', 'Two-Factor Authentication')
            }
            subtitle={
              activeMethod === 'recovery'
                ? t(
                    'mfa.recoveryDescription',
                    'Enter one of the single-use backup codes you saved when you set up two-factor authentication.',
                  )
                : activeMethod === 'sms'
                  ? t(
                      'mfa.smsDescription',
                      'Enter the 6-digit code sent to your mobile phone via SMS.',
                    )
                  : activeMethod === 'passkey'
                    ? t(
                        'mfa.passkeyDescription',
                        'Use the passkey stored on this device to finish signing in.',
                      )
                    : t(
                        'mfa.verifyDescription',
                        'Enter the 6-digit verification code from your authenticator app.',
                      )
            }
          />
        </Box>

        {error && (
          <Alert
            severity='error'
            role='alert'
            aria-live='polite'
            sx={{
              mb: 3,
              borderRadius: 'var(--sf-radius-md, 8px)',
              '& .MuiAlert-message': { fontWeight: 600 },
            }}
          >
            {error}
          </Alert>
        )}
        {successMsg && (
          <Alert
            severity='success'
            role='status'
            aria-live='polite'
            sx={{
              mb: 3,
              borderRadius: 'var(--sf-radius-md, 8px)',
              '& .MuiAlert-message': { fontWeight: 600 },
            }}
          >
            {successMsg}
          </Alert>
        )}
        {smsSentMessage && activeMethod === 'sms' && (
          <Alert
            severity='info'
            role='status'
            sx={{ mb: 3, borderRadius: 'var(--sf-radius-md, 8px)' }}
          >
            {smsSentMessage}
          </Alert>
        )}

        <Tabs
          value={activeMethod}
          onChange={(_e, val) => {
            setError(null)
            setActiveMethod(val)
          }}
          variant='fullWidth'
          sx={{
            mb: 3,
            minHeight: 44,
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 44,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.8125rem',
            },
          }}
        >
          <Tab
            icon={<PhoneAndroid fontSize='small' />}
            iconPosition='start'
            label={t('mfa.tabTotp', 'TOTP App')}
            value='totp'
          />
          <Tab
            icon={<Sms fontSize='small' />}
            iconPosition='start'
            label={t('mfa.tabSms', 'SMS OTP')}
            value='sms'
          />
          <Tab
            icon={<Fingerprint fontSize='small' />}
            iconPosition='start'
            label={t('mfa.tabPasskey', 'Passkey')}
            value='passkey'
          />
          <Tab
            icon={<VpnKey fontSize='small' />}
            iconPosition='start'
            label={t('mfa.tabRecovery', 'Backup Code')}
            value='recovery'
          />
        </Tabs>

        <Stack spacing={3}>
          {activeMethod === 'recovery' && (
            <Box>
              <AuthInputLabel htmlFor='mfa-recovery-code'>
                {t('mfa.recoveryCodeLabel', 'Backup Recovery Code')}
              </AuthInputLabel>
              <AuthTextField
                id='mfa-recovery-code'
                placeholder='XXXX-XXXX-XX'
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                disabled={loading}
                autoComplete='one-time-code'
                slotProps={{
                  htmlInput: {
                    dir: 'ltr',
                    style: {
                      textAlign: 'center',
                      fontSize: '1.25rem',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                    },
                  },
                }}
              />
            </Box>
          )}

          {activeMethod === 'totp' && (
            <Box>
              <Box sx={{ textAlign: 'center' }}>
                <AuthInputLabel>{t('mfa.enterCode', '6-Digit Verification Code')}</AuthInputLabel>
              </Box>
              <AuthCodeInput
                id='mfa-totp-code'
                value={code}
                onChange={setCode}
                onComplete={handleSubmit}
                length={6}
                groups={[3, 3]}
                separator=''
                mode='numeric'
                disabled={loading}
                error={Boolean(error)}
                autoFocus
                label={t('mfa.enterCode', '6-Digit Verification Code')}
                boxLabel={(position, total) =>
                  t('mfa.codeBoxLabel', {
                    position,
                    total,
                    defaultValue: 'Verification code digit {{position}} of {{total}}',
                  })
                }
              />
            </Box>
          )}

          {activeMethod === 'sms' && (
            <Box>
              <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'
                sx={{ mb: 1 }}
              >
                <AuthInputLabel>{t('mfa.smsCodeLabel', '6-Digit SMS Code')}</AuthInputLabel>
                <Button
                  size='small'
                  variant='text'
                  disabled={sendingSms || smsCooldown > 0}
                  onClick={handleSendSms}
                  sx={{
                    minHeight: 44,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}
                >
                  {smsCooldown > 0
                    ? t('mfa.resendIn', {
                        count: smsCooldown,
                        defaultValue: 'Resend in {{count}}s',
                      })
                    : sendingSms
                      ? t('mfa.sendingSms', 'Sending...')
                      : t('mfa.sendSms', 'Send Code via SMS')}
                </Button>
              </Stack>
              <AuthCodeInput
                id='mfa-sms-code'
                value={smsCode}
                onChange={setSmsCode}
                onComplete={handleSubmit}
                length={6}
                groups={[3, 3]}
                separator=''
                mode='numeric'
                disabled={loading}
                error={Boolean(error)}
                label={t('mfa.smsCodeLabel', '6-Digit SMS Code')}
                boxLabel={(position, total) =>
                  t('mfa.codeBoxLabel', {
                    position,
                    total,
                    defaultValue: 'Verification code digit {{position}} of {{total}}',
                  })
                }
              />
            </Box>
          )}

          {activeMethod === 'passkey' && (
            <Box sx={{ py: 1 }}>
              <Button
                fullWidth
                variant='contained'
                size='large'
                onClick={handlePasskeyAuth}
                disabled={isPasskeyLoading}
                startIcon={
                  isPasskeyLoading ? (
                    <CircularProgress size={20} color='inherit' />
                  ) : (
                    <Fingerprint />
                  )
                }
                sx={{
                  minHeight: 48,
                  borderRadius: 'var(--sf-radius-lg, 12px)',
                  fontWeight: 800,
                  fontSize: '1rem',
                  textTransform: 'none',
                  bgcolor: 'info.main',
                  color: 'info.contrastText',
                  boxShadow: 'var(--sf-shadow-glow, none)',
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
                minHeight: 48,
                borderRadius: 'var(--sf-radius-lg, 12px)',
                fontWeight: 800,
                fontSize: '1rem',
                textTransform: 'none',
                bgcolor: 'primary.main',
                boxShadow: 'var(--sf-shadow-glow, none)',
                '&:hover': { bgcolor: 'primary.dark' },
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
              <Box component='span' sx={{ color: 'primary.main', fontWeight: 700, fontFamily: 'monospace' }}>
                {formatTime(timeLeft)}
              </Box>
            </Typography>
          </Box>
        </Stack>
      </AuthCard>
    </AuthPageLayout>
  )
}
