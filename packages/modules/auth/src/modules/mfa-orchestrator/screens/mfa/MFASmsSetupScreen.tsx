import { useState, useEffect, useCallback, useRef } from 'react'
import { errorMessage, errorStatus, serverMessage } from '../../utils/errors'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Typography, Alert, CircularProgress, Stack } from '@mui/material'
import Sms from '@mui/icons-material/Sms'
import PhoneAndroid from '@mui/icons-material/PhoneAndroid'
import Block from '@mui/icons-material/Block'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { useTranslation } from 'react-i18next'
import {
  AuthPageLayout,
  AuthCard,
  AuthCardHeader,
  AuthInputLabel,
  AuthCodeInput,
  AuthOutcomeScreen,
} from '../../../authentication-core/components/shared/auth'
import { mfaService } from '../../services/mfa.service'
import Path from '../path'
import { Path as RootPath } from '../../../../routes/path'

const SMS_CODE_LENGTH = 6
const RESEND_COOLDOWN_SECONDS = 60

type Phase = 'sending' | 'code' | 'no-phone' | 'unavailable' | 'error'

/**
 * SMS is a distinct enrolment flow from TOTP — it sends a code to the phone
 * number already on the account (`mfaService.sms.sendCode`) and confirms it
 * (`mfaService.sms.confirm`), with no QR code or secret involved. It used to
 * share `MFASetupScreen` (the TOTP/QR screen) via the same route, so "Add a
 * phone" showed an authenticator QR code with no relation to a phone number.
 */
export default function MFASmsSetupScreen() {
  const { t } = useTranslation('auth')
  const navigate = useNavigate()

  const [phase, setPhase] = useState<Phase>('sending')
  const [sentMessage, setSentMessage] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [resending, setResending] = useState(false)
  const isMountedRef = useRef(true)

  const sendCode = useCallback(async () => {
    try {
      setError(null)
      const response = await mfaService.sms.sendCode()
      if (!isMountedRef.current) return
      setSentMessage(
        response.data?.message ||
          t('mfa.smsDescription', 'Enter the 6-digit code sent to your mobile phone via SMS.'),
      )
      setPhase('code')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err: unknown) {
      if (!isMountedRef.current) return
      // `phoneNumber` missing and the feature being off are both terminal,
      // non-retryable states with their own copy — not something a generic
      // error Alert + retry button should swallow (see sms_mfa_controller:
      // 400 = no phone on file, 503 = SMS_MFA_ENABLED is off / no provider).
      const status = errorStatus(err)
      if (status === 400) {
        setPhase('no-phone')
      } else if (status === 503) {
        setPhase('unavailable')
      } else {
        setPhase('error')
        setError(
          errorMessage(err) ||
            t('mfa.setupError', 'Failed to initialize MFA setup.'),
        )
      }
    }
  }, [t])

  useEffect(() => {
    isMountedRef.current = true
    sendCode()
    return () => {
      isMountedRef.current = false
    }
    // Intentionally run once: `sendCode` sends a live SMS as a side effect,
    // so it must not re-run just because its `t`-derived identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((p) => (p > 0 ? p - 1 : 0)), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleResend = useCallback(async () => {
    setResending(true)
    await sendCode()
    setResending(false)
  }, [sendCode])

  const handleVerify = useCallback(async () => {
    if (code.length !== SMS_CODE_LENGTH) return
    try {
      setVerifying(true)
      setError(null)
      await mfaService.sms.confirm(code)
      navigate(Path.mfa.management)
    } catch (err: unknown) {
      setError(
        serverMessage(err) ||
          t('mfa.invalidCode', 'Invalid verification code. Please try again.'),
      )
    } finally {
      setVerifying(false)
    }
  }, [code, navigate, t])

  if (phase === 'sending') {
    return (
      <AuthPageLayout maxWidth={520} backdrop='subtle'>
        <AuthCard padding='comfortable'>
          <Box
            role='status'
            aria-live='polite'
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 6 }}
          >
            <CircularProgress size={44} thickness={4} />
            <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
              {t('mfa.sendingSms', 'Sending...')}
            </Typography>
          </Box>
        </AuthCard>
      </AuthPageLayout>
    )
  }

  if (phase === 'no-phone') {
    return (
      <AuthOutcomeScreen
        icon={<PhoneAndroid sx={{ fontSize: 32 }} />}
        title={t('mfa.smsNoPhoneTitle', 'Add a phone number first')}
        description={t(
          'mfa.smsNoPhoneDesc',
          'SMS codes need a phone number on your account. Add one to your profile, then come back here.',
        )}
        tone='warning'
        actions={
          <>
            <Button
              fullWidth
              variant='contained'
              size='large'
              onClick={() => navigate(RootPath.user.profile.view)}
              endIcon={<ArrowForward />}
              sx={{
                minHeight: 48,
                borderRadius: 'var(--sf-radius-lg, 12px)',
                fontWeight: 800,
                textTransform: 'none',
              }}
            >
              {t('mfa.smsGoToProfile', 'Add a phone number')}
            </Button>
            <Button
              fullWidth
              variant='text'
              onClick={() => navigate(Path.mfa.management)}
              sx={{ minHeight: 44, fontWeight: 700, textTransform: 'none' }}
            >
              {t('auth.common.back', 'Back')}
            </Button>
          </>
        }
      />
    )
  }

  if (phase === 'unavailable') {
    return (
      <AuthOutcomeScreen
        icon={<Block sx={{ fontSize: 32 }} />}
        title={t('mfa.smsUnavailableTitle', 'SMS verification is unavailable')}
        description={t(
          'mfa.smsUnavailableDesc',
          'SMS sign-in codes are not enabled for this account yet. Use an authenticator app or a passkey instead.',
        )}
        tone='error'
        actions={
          <Button
            fullWidth
            variant='contained'
            size='large'
            onClick={() => navigate(Path.mfa.management)}
            sx={{
              minHeight: 48,
              borderRadius: 'var(--sf-radius-lg, 12px)',
              fontWeight: 800,
              textTransform: 'none',
            }}
          >
            {t('mfa.smsBackToSecurity', 'Back to Two-step verification')}
          </Button>
        }
      />
    )
  }

  if (phase === 'error') {
    return (
      <AuthOutcomeScreen
        icon={<Sms sx={{ fontSize: 32 }} />}
        title={t('mfa.smsSetupHeading', 'Set Up SMS Verification')}
        description={error || t('mfa.setupError', 'Failed to initialize MFA setup.')}
        tone='error'
        actions={
          <Button
            fullWidth
            variant='contained'
            size='large'
            onClick={sendCode}
            sx={{
              minHeight: 48,
              borderRadius: 'var(--sf-radius-lg, 12px)',
              fontWeight: 800,
              textTransform: 'none',
            }}
          >
            {t('common.retry', 'Retry')}
          </Button>
        }
      />
    )
  }

  // phase === 'code'
  return (
    <AuthPageLayout maxWidth={520}>
      <AuthCard padding='standard'>
        <Box sx={{ textAlign: 'center' }}>
          <AuthCardHeader
            icon={<Sms sx={{ fontSize: 32 }} />}
            title={t('mfa.smsSetupHeading', 'Set Up SMS Verification')}
            subtitle={sentMessage}
            iconSize={64}
          />
        </Box>

        {error && (
          <Alert
            severity='error'
            role='alert'
            aria-live='polite'
            sx={{ mb: 3, borderRadius: 'var(--sf-radius-md, 8px)', '& .MuiAlert-message': { fontWeight: 600 } }}
          >
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          <Box>
            <Box sx={{ textAlign: 'center' }}>
              <AuthInputLabel>{t('mfa.smsCodeLabel', '6-Digit SMS Code')}</AuthInputLabel>
            </Box>
            <AuthCodeInput
              id='mfa-sms-code'
              value={code}
              onChange={setCode}
              onComplete={handleVerify}
              length={SMS_CODE_LENGTH}
              groups={[3, 3]}
              separator=''
              mode='numeric'
              disabled={verifying}
              error={Boolean(error)}
              autoFocus
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

          <Button
            fullWidth
            variant='contained'
            size='large'
            disabled={code.length !== SMS_CODE_LENGTH || verifying}
            onClick={handleVerify}
            endIcon={verifying ? <CircularProgress size={20} color='inherit' /> : <ArrowForward />}
            sx={{
              minHeight: 48,
              borderRadius: 'var(--sf-radius-lg, 12px)',
              fontWeight: 800,
              fontSize: '1rem',
              textTransform: 'none',
              boxShadow: 'var(--sf-shadow-glow, none)',
            }}
          >
            {verifying
              ? t('mfa.verifying', 'Verifying...')
              : t('mfa.verifySetupButton', 'Verify & Activate MFA')}
          </Button>

          <Button
            fullWidth
            variant='text'
            disabled={cooldown > 0 || resending}
            onClick={handleResend}
            sx={{ minHeight: 40, fontWeight: 700, textTransform: 'none' }}
          >
            {cooldown > 0
              ? t('mfa.resendIn', { count: cooldown, defaultValue: 'Resend in {{count}}s' })
              : resending
                ? t('mfa.sendingSms', 'Sending...')
                : t('mfa.sendSms', 'Send Code via SMS')}
          </Button>
        </Stack>
      </AuthCard>
    </AuthPageLayout>
  )
}
