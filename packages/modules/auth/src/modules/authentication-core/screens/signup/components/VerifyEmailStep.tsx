import React from 'react'
import { Box, Button, Typography, Stack } from '@mui/material'
import MarkEmailRead from '@mui/icons-material/MarkEmailRead'
import ArrowForward from '@mui/icons-material/ArrowForward'
import Timer from '@mui/icons-material/Timer'
import ArrowBack from '@mui/icons-material/ArrowBack'
import {
  AuthCardHeader,
  AuthCodeInput,
  AuthActionButton,
} from '../../../components/shared/auth'

interface VerifyEmailStepProps {
  t: any
  pendingEmail: string
  otpCode: string
  onOtpCodeChange?: (code: string) => void
  otpInputRefs?: React.MutableRefObject<(HTMLInputElement | null)[]>
  handleOtpDigitChange?: (value: string, index: number) => void
  handleOtpKeyDown?: (e: React.KeyboardEvent, index: number) => void
  countdownDisplay: string
  isVerifyingOtp: boolean
  isResendPending: boolean
  timeLeft: number
  onVerifyOtp: () => void
  onResendCode: () => void
  onBackToRegister: () => void
}

export const VerifyEmailStep: React.FC<VerifyEmailStepProps> = ({
  t,
  pendingEmail,
  otpCode,
  onOtpCodeChange,
  countdownDisplay,
  isVerifyingOtp,
  isResendPending,
  timeLeft,
  onVerifyOtp,
  onResendCode,
  onBackToRegister,
}) => {
  const handleCodeChange = (val: string) => {
    if (onOtpCodeChange) {
      onOtpCodeChange(val)
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
      {/* Header Section */}
      <AuthCardHeader
        icon={<MarkEmailRead sx={{ fontSize: 32 }} />}
        title={t('signUp.verifyTitle', 'Verify your email')}
        subtitle={
          <>
            {t('signUp.verifySubtitle', "We've sent a 6-digit confirmation code to")}
            <br />
            <Box component='span' sx={{ fontWeight: 700, color: 'text.primary' }}>
              {pendingEmail || 'your email'}
            </Box>
          </>
        }
      />

      {/* 6-Digit OTP Code Input with Miller's Law chunking */}
      <Box sx={{ my: 1 }}>
        <AuthCodeInput
          id='signup-otp-input'
          value={otpCode}
          onChange={handleCodeChange}
          onComplete={onVerifyOtp}
          length={6}
          groups={[3, 3]}
          mode='numeric'
          disabled={isVerifyingOtp}
          autoFocus
          label={t('signUp.verifyTitle', 'Verify your email')}
        />
      </Box>

      {/* Action Buttons */}
      <Stack spacing={2}>
        <AuthActionButton
          fullWidth
          isLoading={isVerifyingOtp}
          disabled={otpCode.length < 6 || isVerifyingOtp}
          onClick={onVerifyOtp}
          label={
            isVerifyingOtp
              ? t('signUp.verifying', 'Verifying Code...')
              : t('signUp.verifyAction', 'Confirm & Activate')
          }
          endIcon={<ArrowForward />}
        />

        {/* Resend Code Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1,
            py: 0.5,
          }}
        >
          {timeLeft > 0 ? (
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem' }}
            >
              <Timer sx={{ fontSize: 16 }} />
              {t('signUp.resendCooldown', 'Resend code in')}{' '}
              <Box component='span' sx={{ fontWeight: 700, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
                {countdownDisplay}
              </Box>
            </Typography>
          ) : (
            <Button
              variant='text'
              onClick={onResendCode}
              disabled={isResendPending}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                color: 'primary.main',
                borderRadius: '8px',
                minHeight: 36,
              }}
            >
              {isResendPending
                ? t('signUp.sending', 'Sending...')
                : t('signUp.resendCode', 'Resend verification code')}
            </Button>
          )}
        </Box>

        {/* Back to registration link */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant='text'
            startIcon={<ArrowBack />}
            onClick={onBackToRegister}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: 'text.secondary',
              minHeight: 44,
              '&:hover': { color: 'text.primary' },
            }}
          >
            {t('signUp.backToRegister', 'Change email or edit details')}
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}
