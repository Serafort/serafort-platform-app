import React from 'react'
import { Box, useTheme } from '@mui/material'
import type { AuthTone } from './authTone'
import { toneVars } from './authTone'

export type AuthStatus = 'pending' | 'verified' | 'expired' | 'failed' | 'revoked'

const STATUS_TONE: Record<AuthStatus, AuthTone> = {
  pending: 'warning',
  verified: 'success',
  expired: 'error',
  failed: 'error',
  revoked: 'info',
}

export interface AuthStatusBadgeProps {
  status: AuthStatus
  /** Already-translated label. */
  label: React.ReactNode
  size?: 'small' | 'medium'
}

/**
 * Status pill for lifecycle screens (email change, verification, …), matching
 * the brand-kit `.badge` anatomy (`uikit.html#badges`): full-radius pill, a
 * hairline semantic border, a mono label in the AA-safe text colour, and a
 * solid dot. State is carried by colour + label + dot, never colour alone, so
 * "Pending" / "Verified" / "Expired" read the same everywhere.
 */
const AuthStatusBadge: React.FC<AuthStatusBadgeProps> = ({ status, label, size = 'medium' }) => {
  const theme = useTheme()
  const vars = toneVars(theme, STATUS_TONE[status])

  return (
    <Box
      component='span'
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--sf-space-2, 8px)',
        fontFamily: 'var(--sf-font-mono, ui-monospace, monospace)',
        fontSize: size === 'small' ? 'var(--sf-text-2xs, 0.6875rem)' : 'var(--sf-text-xs, 0.75rem)',
        fontWeight: 500,
        lineHeight: 1,
        padding: size === 'small' ? '3px 8px' : '5px 12px',
        borderRadius: 'var(--sf-radius-full, 9999px)',
        border: '1px solid',
        borderColor: vars.border,
        backgroundColor: vars.bg,
        color: vars.text,
      }}
    >
      <Box
        component='span'
        aria-hidden
        sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: vars.dot, flex: 'none' }}
      />
      {label}
    </Box>
  )
}

export default AuthStatusBadge
