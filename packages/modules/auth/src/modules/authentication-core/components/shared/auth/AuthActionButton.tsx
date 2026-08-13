import React from 'react'
import { Button, ButtonProps, CircularProgress, alpha } from '@mui/material'
import ArrowForward from '@mui/icons-material/ArrowForward';

interface AuthActionButtonProps extends ButtonProps {
  isLoading?: boolean
  label: string
}

const AuthActionButton: React.FC<AuthActionButtonProps> = ({
  isLoading,
  label,
  endIcon = <ArrowForward />,
  ...props
}) => {
  return (
    <Button
      fullWidth
      variant="contained"
      size="large"
      disabled={isLoading || props.disabled}
      endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : endIcon}
      {...props}
      sx={{
        py: 1.5,
        borderRadius: 3,
        fontWeight: 800,
        fontSize: '1rem',
        textTransform: 'none',
        bgcolor: props.color === 'error' ? 'error.main' : 'info.main', // Standard Info Blue
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
      {label}
    </Button>
  )
}

export default AuthActionButton
