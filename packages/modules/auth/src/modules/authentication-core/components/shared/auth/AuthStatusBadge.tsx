import React from 'react'
import { Chip, alpha, useTheme } from '@mui/material'
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline'
import HourglassEmpty from '@mui/icons-material/HourglassEmpty'
import ErrorOutline from '@mui/icons-material/ErrorOutline'
import TimerOffOutlined from '@mui/icons-material/TimerOffOutlined'
import BlockOutlined from '@mui/icons-material/BlockOutlined'
import type { AuthTone } from './authTone'

export type AuthStatus = 'pending' | 'verified' | 'expired' | 'failed' | 'revoked'

const STATUS_TONE: Record<AuthStatus, AuthTone> = {
  pending: 'warning',
  verified: 'success',
  expired: 'error',
  failed: 'error',
  revoked: 'info',
}

const STATUS_ICON: Record<AuthStatus, React.ReactElement> = {
  pending: <HourglassEmpty />,
  verified: <CheckCircleOutline />,
  expired: <TimerOffOutlined />,
  failed: <ErrorOutline />,
  revoked: <BlockOutlined />,
}

export interface AuthStatusBadgeProps {
  status: AuthStatus
  /** Already-translated label. */
  label: React.ReactNode
  size?: 'small' | 'medium'
}

/**
 * Status chip matrix for lifecycle screens (email change, verification, …),
 * so "Pending"/"Verified"/"Expired" read the same everywhere instead of being
 * rendered as ad-hoc coloured text on each screen.
 */
const AuthStatusBadge: React.FC<AuthStatusBadgeProps> = ({ status, label, size = 'medium' }) => {
  const theme = useTheme()
  const tone = STATUS_TONE[status]
  const color = theme.palette[tone].main

  return (
    <Chip
      size={size}
      icon={STATUS_ICON[status]}
      label={label}
      sx={{
        fontWeight: 700,
        borderRadius: 2,
        color,
        bgcolor: alpha(color, 0.1),
        border: '1px solid',
        borderColor: alpha(color, 0.28),
        '& .MuiChip-icon': { color, fontSize: 18 },
      }}
    />
  )
}

export default AuthStatusBadge
