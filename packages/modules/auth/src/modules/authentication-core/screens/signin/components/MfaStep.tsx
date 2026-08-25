import React from 'react'
import { Box, Button, TextField, Typography, Link as MuiLink, alpha } from '@mui/material'
import LockPerson from '@mui/icons-material/LockPerson';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Timer from '@mui/icons-material/Timer';
import { AuthScreenIcon, AuthActionButton } from '../../../components/shared/auth'
import { PendingMfaUser } from '../hooks/useSignInFlow'

interface MfaStepProps {
  t: any
  pendingMfaUser: PendingMfaUser | null
  mfaCode: string
  mfaInputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>
  handleMfaDigitChange: (value: string, index: number) => void
  handleMfaKeyDown: (e: React.KeyboardEvent, index: number) => void
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
  mfaInputRefs,
  handleMfaDigitChange,
  handleMfaKeyDown,
  countdownDisplay,
  isMfaPending,
  timeLeft,
  onMfaSubmit,
  onResendCode,
  onBackToLogin,
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <AuthScreenIcon icon={<LockPerson sx={{ fontSize: 32 }} />} />
        </Box>
        <Box>
          <Typography
            variant='h5'
            sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 1, fontFamily: 'var(--font-h5, inherit)' }}
          >
            {t('auth.twoFactor.title')}
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
            {t('auth.twoFactor.subtitle')}
            <br />
            <Box component='span' sx={{ fontWeight: 600, color: 'text.primary' }}>
              {pendingMfaUser?.email || 'your email'}
            </Box>
          </Typography>
        </Box>
      </Box>

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
              inputRef={(el) => (mfaInputRefs.current[index] = el)}
              id={`mfa-digit-${index}`}
              value={mfaCode[index] || ''}
              onChange={(e) => handleMfaDigitChange(e.target.value, index)}
              onKeyDown={(e) => handleMfaKeyDown(e, index)}
              placeholder='-'
              inputProps={{
                maxLength: 1,
                inputMode: 'numeric',
                style: {
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  padding: '12px 0',
                },
              }}
              sx={{
                width: { xs: 48, sm: 56 },
                '& .MuiOutlinedInput-root': {
                  height: { xs: 56, sm: 64 },
                  borderRadius: '12px',
                  bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05),
                  '& fieldset': {
                    borderColor: 'divider',
                    borderWidth: '2px',
                    transition: 'all 0.2s ease-in-out',
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: '2px',
                  },
                  '&.Mui-focused': {
                    boxShadow: (theme) => `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                  }
                },
              }}
            />
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05),
          py: 1,
          px: 2,
          borderRadius: '20px',
          border: '1px solid',
          borderColor: 'divider',
          alignSelf: 'center',
        }}
      >
        <Timer sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.secondary' }}>
          {t('auth.twoFactor.expiresIn')}{' '}
          <Box
            component='span'
            sx={{ color: 'primary.main', fontVariantNumeric: 'tabular-nums' }}
          >
            {countdownDisplay}
          </Box>
        </Typography>
      </Box>

      <AuthActionButton
        label={
          isMfaPending
            ? t('auth.twoFactor.verifying')
            : t('auth.twoFactor.verifyButton')
        }
        disabled={mfaCode.length !== 6 || isMfaPending}
        onClick={onMfaSubmit}
      />

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 1.5 }}>
          {t('auth.twoFactor.noEmail')}{' '}
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
            {t('auth.twoFactor.resendCode')}
          </Button>
        </Typography>
        <Box sx={{ height: '1px', bgcolor: 'divider', my: 2 }} />
        <MuiLink
          component='button'
          type='button'
          onClick={onBackToLogin}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            color: 'text.secondary',
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: '0.875rem',
            mx: 'auto',
            '&:hover': { color: 'text.primary' },
          }}
        >
          <Box
            component='span'
            sx={{ transform: 'rotate(180deg)', display: 'inline-flex' }}
          >
            <ArrowForward sx={{ fontSize: 16 }} />
          </Box>
          {t('auth.twoFactor.backToLogin')}
        </MuiLink>
      </Box>
    </Box>
  )
}
