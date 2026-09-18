import React from 'react'
import { Box, CircularProgress, Typography, alpha, useTheme } from '@mui/material'

export interface AuthRedirectChipProps {
  /** Seconds left before the automatic redirect fires. */
  secondsRemaining: number
  /** Already-translated leading text, e.g. "Redirecting in". */
  label: React.ReactNode
}

/**
 * "Redirecting in Ns" pill used by the outcome screens that navigate on their
 * own. Announces politely so a screen-reader user is told the page is about to
 * move rather than being moved without warning.
 */
const AuthRedirectChip: React.FC<AuthRedirectChipProps> = ({ secondsRemaining, label }) => {
  const theme = useTheme()

  return (
    <Box
      role='status'
      aria-live='polite'
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 0.75,
        borderRadius: 999,
        bgcolor: alpha(theme.palette.action.selected, 0.5),
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CircularProgress size={14} thickness={5} />
      <Typography variant='caption' sx={{ fontWeight: 500, color: 'text.secondary' }}>
        {label}{' '}
        <Box component='span' sx={{ color: 'primary.main', fontWeight: 700 }}>
          {secondsRemaining}s
        </Box>
      </Typography>
    </Box>
  )
}

export default AuthRedirectChip
