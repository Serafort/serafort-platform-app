import React from 'react'
import { Box, Stack, Typography, alpha, useTheme } from '@mui/material'
import type { AuthTone } from '../auth/authTone'

export interface AdminEmptyStateProps {
  icon?: React.ReactNode
  /** Already-translated headline, e.g. "No roles yet". */
  title: React.ReactNode
  /** Already-translated explanation of what would appear here, and why. */
  description?: React.ReactNode
  /** Onboarding call to action. */
  action?: React.ReactNode
  tone?: AuthTone
  /** Renders the error tone and an assertive live region. */
  variant?: 'empty' | 'error'
  id?: string
}

/**
 * The idle/empty and error panels for an admin collection.
 *
 * An empty table previously rendered as one line of grey text in a cell, which
 * gives the user nothing to do next. This pairs the explanation with the action
 * that would populate the screen.
 */
const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  tone,
  variant = 'empty',
  id,
}) => {
  const theme = useTheme()
  const resolvedTone: AuthTone = tone ?? (variant === 'error' ? 'error' : 'primary')
  const color = theme.palette[resolvedTone].main

  return (
    <Stack
      id={id}
      spacing={2}
      alignItems='center'
      // An error replaces content the user asked for, so it is announced;
      // an ordinary empty result is not interrupting anything.
      role={variant === 'error' ? 'alert' : undefined}
      sx={{ py: 8, px: 3, textAlign: 'center' }}
    >
      {icon && (
        <Box
          aria-hidden
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: 'var(--sf-radius-lg, 12px)',
            bgcolor: alpha(color, 0.1),
            color,
          }}
        >
          {icon}
        </Box>
      )}
      <Box>
        <Typography variant='h6' sx={{ fontWeight: 800 }}>
          {title}
        </Typography>
        {description && (
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ mt: 0.5, fontWeight: 500, maxInlineSize: 420, mx: 'auto', lineHeight: 1.6 }}
          >
            {description}
          </Typography>
        )}
      </Box>
      {action}
    </Stack>
  )
}

export default AdminEmptyState
