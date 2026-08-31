import React from 'react'
import { Box, Button, Alert as MAlert, Typography, alpha } from '@mui/material'

interface LockedStepProps {
  t: any
  timeLeft: number
  countdownDisplay: string
  onBackToRegister: () => void
}

export const LockedStep: React.FC<LockedStepProps> = ({
  t,
  timeLeft,
  countdownDisplay,
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
        textAlign: 'center',
      }}
    >
      <MAlert
        severity='error'
        sx={{
          textAlign: 'left',
          borderRadius: '12px',
          bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
          color: 'error.main',
        }}
      >
        {t(
          'signUp.lockedMessage',
          'Registration temporarily rate-limited. Please wait {{minutes}} minutes before trying again.',
          { minutes: Math.ceil(timeLeft / 60) },
        )}
        <br />
        <Box component='span' sx={{ fontWeight: 700 }}>
          {t('signUp.countdown', 'Countdown')}: {countdownDisplay}
        </Box>
      </MAlert>
      <Button
        variant='text'
        onClick={onBackToRegister}
        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
      >
        {t('signUp.backToRegister', 'Back to Sign Up')}
      </Button>
    </Box>
  )
}
