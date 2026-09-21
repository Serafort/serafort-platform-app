import React from 'react'
import { Button, ButtonProps, CircularProgress, alpha, useTheme } from '@mui/material'
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
  lockDurationMs = 150,
  ...props
}) => {
  const theme = useTheme()
  const isBusyLoading = loading || isLoading || isSubmitting || isValidating
  const hasHandler = !!(onExecute || onClick)

  const handleAction = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onExecute) {
      await onExecute()
    } else if (onClick) {
      await onClick(e)
    }
  }

  const [lockedClick, isInternalLocked] = useActionLock(handleAction, { lockDurationMs })
  const resolvedOnClick = hasHandler ? lockedClick : undefined
  const isDisabled = disabled || isBusyLoading || externalLocked || (hasHandler && isInternalLocked)

  const isError = props.color === 'error'
  const isSuccess = props.color === 'success'
  const baseColor = isError
    ? theme.palette.error.main
    : isSuccess
      ? theme.palette.success.main
      : theme.palette.primary.main

  return (
    <Button
      fullWidth
      variant='contained'
      size='large'
      disabled={isDisabled}
      onClick={resolvedOnClick}
      endIcon={
        isBusyLoading ? (
          <CircularProgress
            size={18}
            thickness={5}
            color='inherit'
            sx={{ display: 'inline-flex' }}
          />
        ) : (
          endIcon
        )
      }
      {...props}
      sx={{
        minHeight: 48,
        borderRadius: 'var(--sf-radius-md, 8px)',
        fontWeight: 600,
        fontSize: 'var(--sf-text-md, 0.9375rem)',
        textTransform: 'none',
        bgcolor: baseColor,
        color: theme.palette.getContrastText(baseColor),
        // Flat at rest; the brand kit lifts to shadow-sm on hover only.
        boxShadow: 'none',
        transition:
          'background-color var(--sf-duration-base, 180ms) var(--sf-ease-standard, ease), box-shadow var(--sf-duration-base, 180ms) var(--sf-ease-standard, ease), transform var(--sf-duration-base, 180ms) var(--sf-ease-standard, ease)',
        '&:focus-visible': {
          outline: '2px solid var(--sf-cyan, currentColor)',
          outlineOffset: 2,
        },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          '&:hover': { transform: 'none' },
        },
        '&:hover': {
          bgcolor: isError
            ? theme.palette.error.dark
            : isSuccess
              ? theme.palette.success.dark
              : theme.palette.primary.dark,
          transform: isDisabled ? 'none' : 'translateY(-1px)',
          boxShadow: 'var(--sf-shadow-sm, none)',
        },
        '&:active': {
          transform: isDisabled ? 'none' : 'translateY(0)',
        },
        '&.Mui-disabled': {
          bgcolor: alpha(baseColor, 0.6),
          color: alpha(theme.palette.getContrastText(baseColor), 0.8),
          boxShadow: 'none',
          cursor: 'not-allowed',
        },
        ...props.sx,
      }}
    >
      {label || children}
    </Button>
  )
}

export default AuthActionButton
