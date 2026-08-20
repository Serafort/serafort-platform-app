import React from 'react'
import { Button, ButtonProps, CircularProgress, alpha } from '@mui/material'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { useActionLock } from '@cap/platform-core'

export interface AuthActionButtonProps extends Omit<ButtonProps, 'onClick'> {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void> | void
  onExecute?: () => Promise<void> | void
  loading?: boolean
  isLoading?: boolean
  isSubmitting?: boolean
  isValidating?: boolean
  isLocked?: boolean
  label?: string
  lockDurationMs?: number
}

export const AuthActionButton: React.FC<AuthActionButtonProps> = ({
  onClick,
  onExecute,
  loading = false,
  isLoading = false,
  isSubmitting = false,
  isValidating = false,
  isLocked: externalLocked = false,
  disabled = false,
  label,
  children,
  endIcon = <ArrowForward />,
  lockDurationMs = 120,
  ...props
}) => {
  const isBusyLoading = loading || isLoading || isSubmitting || isValidating

  const handleAction = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onExecute) {
      await onExecute()
    } else if (onClick) {
      await onClick(e)
    }
  }

  const [lockedClick, isInternalLocked] = useActionLock(handleAction, { lockDurationMs })
  const isDisabled = disabled || isBusyLoading || externalLocked || isInternalLocked

  return (
    <Button
      fullWidth
      variant="contained"
      size="large"
      disabled={isDisabled}
      onClick={lockedClick}
      endIcon={isBusyLoading ? <CircularProgress size={20} color="inherit" /> : endIcon}
      {...props}
      sx={{
        py: 1.5,
        borderRadius: 3,
        fontWeight: 800,
        fontSize: '1rem',
        textTransform: 'none',
        bgcolor: props.color === 'error' ? 'error.main' : 'info.main',
        boxShadow: (theme) =>
          `0 10px 20px ${alpha(props.color === 'error' ? theme.palette.error.main : theme.palette.info.main, 0.2)}`,
        '&:hover': {
          bgcolor: props.color === 'error' ? 'error.dark' : 'info.dark',
          transform: 'translateY(-1px)',
          boxShadow: (theme) =>
            `0 12px 24px ${alpha(props.color === 'error' ? theme.palette.error.main : theme.palette.info.main, 0.3)}`,
        },
        ...props.sx,
      }}
    >
      {label || children}
    </Button>
  )
}

export default AuthActionButton
