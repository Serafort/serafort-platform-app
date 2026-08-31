import React from 'react'
import { Box, Button, TextField, Typography, Link as MuiLink, Stack, alpha } from '@mui/material'
import MarkEmailRead from '@mui/icons-material/MarkEmailRead'
import ArrowForward from '@mui/icons-material/ArrowForward'
import Timer from '@mui/icons-material/Timer'
import ArrowBack from '@mui/icons-material/ArrowBack'
import { AuthScreenIcon, AuthActionButton } from '../../../components/shared/auth'

interface VerifyEmailStepProps {
  t: any
  pendingEmail: string
  otpCode: string
  otpInputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>
  handleOtpDigitChange: (value: string, index: number) => void
  handleOtpKeyDown: (e: React.KeyboardEvent, index: number) => void
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
  otpInputRefs,
  handleOtpDigitChange,
  handleOtpKeyDown,
  countdownDisplay,
  isVerifyingOtp,
  isResendPending,
  timeLeft,
  onVerifyOtp,
  onResendCode,
  onBackToRegister,
}) => {
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <AuthScreenIcon icon={<MarkEmailRead sx={{ fontSize: 32 }} />} />
        </Box>
        <Box>
          <Typography
            variant='h5'
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.02em',
              mb: 1,
              fontFamily: 'var(--font-h5, inherit)',
            }}
          >
            {t('signUp.verifyTitle', 'Verify your email')}
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
            {t('signUp.verifySubtitle', "We've sent a 6-digit confirmation code to")}
            <br />
            <Box component='span' sx={{ fontWeight: 700, color: 'text.primary' }}>
              {pendingEmail || 'your email'}
            </Box>
          </Typography>
        </Box>
      </Box>

      {/* 6-Digit OTP Inputs */}
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: { xs: 1, sm: 1.5 },
            mb: 2,
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <TextField
              key={index}
              inputRef={(el) => (otpInputRefs.current[index] = el)}
              id={`signup-otp-digit-${index}`}
              value={otpCode[index] || ''}
              onChange={(e) => handleOtpDigitChange(e.target.value, index)}
              onKeyDown={(e) => handleOtpKeyDown(e, index)}
              placeholder='-'
              inputProps={{
                maxLength: 1,
                inputMode: 'numeric',
                style: {
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  padding: '12px 0',
                },
              }}
              sx={{
                width: { xs: 44, sm: 54 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: 'background.paper',
                  '& fieldset': {
                    borderColor: otpCode[index] ? 'primary.main' : 'divider',
                    borderWidth: otpCode[index] ? '2px' : '1px',
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: '2px',
                  },
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Action Buttons */}
      <Stack spacing={2}>
        <AuthActionButton
          fullWidth
          loading={isVerifyingOtp}
          disabled={otpCode.length < 6}
          onClick={onVerifyOtp}
          endIcon={<ArrowForward />}
        >
          {isVerifyingOtp
            ? t('signUp.verifying', 'Verifying Code...')
            : t('signUp.verifyAction', 'Confirm & Activate')}
        </AuthActionButton>

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
              <Box component='span' sx={{ fontWeight: 700, color: 'text.primary' }}>
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
