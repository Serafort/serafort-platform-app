import React from 'react'
import { Button, CircularProgress } from '@mui/material'
import Refresh from '@mui/icons-material/Refresh'

export interface AuthResendButtonProps {
  onResend: () => void
  isPending?: boolean
  secondsRemaining?: number
  /** Already-translated labels for each of the three states. */
  idleLabel: React.ReactNode
  pendingLabel: React.ReactNode
  cooldownLabel: React.ReactNode
  variant?: 'contained' | 'outlined' | 'text'
  fullWidth?: boolean
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  id?: string
}

/**
 * Resend affordance with its three states (idle / in-flight / cooling down).
 *
 * The caller supplies already-translated labels, because the cooldown label
 * needs an interpolated count and only the caller knows the i18n key to use.
 */
const AuthResendButton: React.FC<AuthResendButtonProps> = ({
  onResend,
  isPending = false,
  secondsRemaining = 0,
  idleLabel,
  pendingLabel,
  cooldownLabel,
  variant = 'contained',
  fullWidth = true,
  startIcon,
  endIcon,
  id,
}) => {
  const isCoolingDown = secondsRemaining > 0
  const disabled = isPending || isCoolingDown

  return (
    <Button
      id={id}
      fullWidth={fullWidth}
      variant={variant}
      disabled={disabled}
      onClick={onResend}
      startIcon={
        isPending ? (
          <CircularProgress size={18} color='inherit' />
        ) : (
          (startIcon ?? (endIcon ? undefined : <Refresh />))
        )
      }
      endIcon={endIcon}
      sx={{
        minHeight: 48,
        borderRadius: 'var(--sf-radius-lg, 12px)',
        fontWeight: 800,
        fontSize: '0.9375rem',
        textTransform: 'none',
      }}
    >
      {isPending ? pendingLabel : isCoolingDown ? cooldownLabel : idleLabel}
    </Button>
  )
}

export default AuthResendButton
