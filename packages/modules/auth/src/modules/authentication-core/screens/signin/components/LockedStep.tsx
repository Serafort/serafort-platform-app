import React from 'react'
import { Box, Button, Alert as MAlert } from '@mui/material'

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
      <MAlert severity='error' sx={{ textAlign: 'left' }}>
        Account temporarily locked. Try again in {Math.ceil(timeLeft / 60)} minutes.
        <br />
        <Box component='span' sx={{ fontWeight: 600 }}>
          Countdown: {countdownDisplay}
        </Box>
      </MAlert>
      <Button variant='text' onClick={onBackToLogin}>
        Back to Login
      </Button>
    </Box>
  )
}
