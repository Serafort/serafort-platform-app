import React from 'react'
import { Box, Button, Typography, alpha } from '@mui/material'
import LockPerson from '@mui/icons-material/LockPerson'
import Timer from '@mui/icons-material/Timer'
import {
  AuthCardHeader,
  AuthCodeInput,
  AuthActionButton,
  AuthBackLink,
} from '../../../components/shared/auth'
import { PendingMfaUser } from '../hooks/useSignInFlow'

interface MfaStepProps {
  t: any
  pendingMfaUser: PendingMfaUser | null
  mfaCode: string
  onMfaCodeChange?: (code: string) => void
  mfaInputRefs?: React.MutableRefObject<(HTMLInputElement | null)[]>
  handleMfaDigitChange?: (value: string, index: number) => void
  handleMfaKeyDown?: (e: React.KeyboardEvent, index: number) => void
  countdownDisplay: string
  isMfaPending: boolean
  timeLeft: number
  onMfaSubmit: () => void
  onResendCode: () => void
  onBackToLogin: () => void
}

export const MfaStep: React.FC<MfaStepProps> = ({
  t,
  pendingMfaUser,
  mfaCode,
  onMfaCodeChange,
  countdownDisplay,
  isMfaPending,
  timeLeft,
  onMfaSubmit,
  onResendCode,
  onBackToLogin,
}) => {
  const handleCodeChange = (val: string) => {
    if (onMfaCodeChange) {
      onMfaCodeChange(val)
    }
  }

  return (
    <Box
      sx={{
        px: { xs: 3, sm: 4 },
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <AuthCardHeader
        icon={<LockPerson sx={{ fontSize: 32 }} />}
        title={t('auth.twoFactor.title', 'Two-Factor Authentication')}
        subtitle={
          <>
            {t('auth.twoFactor.subtitle', 'Please enter the 6-digit authentication code sent to')}
            <br />
            <Box component='span' sx={{ fontWeight: 700, color: 'text.primary' }}>
              {pendingMfaUser?.email || 'your email'}
            </Box>
          </>
        }
      />

      <Box sx={{ my: 1 }}>
        <AuthCodeInput
          id='mfa-code-input'
          value={mfaCode}
          onChange={handleCodeChange}
          onComplete={onMfaSubmit}
          length={6}
          groups={[3, 3]}
          mode='numeric'
          disabled={isMfaPending}
          autoFocus
          label={t('auth.twoFactor.title', 'Two-Factor Authentication')}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          bgcolor: 'var(--sf-surface-sunken, rgba(0, 0, 0, 0.04))',
          py: 1,
          px: 2,
          borderRadius: 'var(--sf-radius-full, 9999px)',
          border: '1px solid',
          borderColor: 'divider',
          alignSelf: 'center',
        }}
      >
        <Timer sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.secondary' }}>
          {t('auth.twoFactor.expiresIn', 'Expires in')}{' '}
          <Box component='span' sx={{ color: 'primary.main', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
            {countdownDisplay}
          </Box>
        </Typography>
      </Box>

      <AuthActionButton
        label={
          isMfaPending
            ? t('auth.twoFactor.verifying', 'Verifying...')
            : t('auth.twoFactor.verifyButton', 'Verify & Continue')
        }
        disabled={mfaCode.length !== 6 || isMfaPending}
        isLoading={isMfaPending}
        onClick={onMfaSubmit}
      />

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 1.5 }}>
          {t('auth.twoFactor.noEmail', "Didn't receive a code?")}{' '}
          <Button
            variant='text'
            onClick={onResendCode}
            disabled={timeLeft > 0 || isMfaPending}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              p: 0,
              minWidth: 0,
              verticalAlign: 'baseline',
              '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
            }}
          >
            {t('auth.twoFactor.resendCode', 'Resend code')}
          </Button>
        </Typography>

        <Box sx={{ height: '1px', bgcolor: 'divider', my: 2 }} />

        <AuthBackLink
          label={t('auth.twoFactor.backToLogin', 'Back to sign in')}
          onClick={onBackToLogin}
        />
      </Box>
    </Box>
  )
}
