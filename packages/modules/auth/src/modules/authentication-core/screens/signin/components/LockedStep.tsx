import React from 'react'
import { Box, Button, Alert as MAlert, alpha } from '@mui/material'
import { useTranslation } from 'react-i18next'

interface LockedStepProps {
  timeLeft: number
  countdownDisplay: string
  onBackToLogin: () => void
}

export const LockedStep: React.FC<LockedStepProps> = ({
  timeLeft,
  countdownDisplay,
  onBackToLogin,
}) => {
  const { t } = useTranslation()
  const minutes = Math.ceil(timeLeft / 60)

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
        severity="error"
        sx={{
          textAlign: 'left',
          borderRadius: '12px',
          bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
          color: 'error.main',
        }}
      >
        {t('auth.lockout.message', 'Account temporarily locked. Try again in {{minutes}} minutes.', {
          minutes,
        })}
        <br />
        <Box component="span" sx={{ fontWeight: 600 }}>
          {t('auth.lockout.countdown', 'Countdown')}: {countdownDisplay}
        </Box>
      </MAlert>
      <Button
        variant="text"
        onClick={onBackToLogin}
        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700 }}
      >
        {t('auth.common.backToLogin', 'Back to sign in')}
      </Button>
    </Box>
  )
}

