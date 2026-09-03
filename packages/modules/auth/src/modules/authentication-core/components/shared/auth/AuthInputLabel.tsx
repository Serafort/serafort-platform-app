import React from 'react'
import { Typography } from '@mui/material'

interface AuthInputLabelProps {
  children: React.ReactNode
  required?: boolean
}

const AuthInputLabel: React.FC<AuthInputLabelProps> = ({ children, required }) => {
  return (
    <Typography
      variant="caption"
      sx={{
        fontWeight: 800,
        textTransform: 'uppercase', // Standard UPPERCASE
        ml: 1,
        mb: 1,
        display: 'block',
        color: 'text.secondary',
        letterSpacing: '0.05em',
      }}
    >
      {children}
      {required && (
        <Typography component="span" sx={{ color: 'error.main', ml: 0.5 }}>
          *
        </Typography>
      )}
    </Typography>
  )
}

export default AuthInputLabel
