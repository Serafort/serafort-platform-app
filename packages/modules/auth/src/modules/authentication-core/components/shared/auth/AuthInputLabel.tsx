import React from 'react'
import { Typography } from '@mui/material'

interface AuthInputLabelProps {
  children: React.ReactNode
  required?: boolean
  htmlFor?: string
}

const AuthInputLabel: React.FC<AuthInputLabelProps> = ({ children, required, htmlFor }) => {
  return (
    <Typography
      component='label'
      htmlFor={htmlFor}
      variant='caption'
      sx={{
        fontWeight: 800,
        textTransform: 'uppercase',
        ml: 1,
        mb: 1,
        display: 'block',
        color: 'text.secondary',
        letterSpacing: '0.05em',
      }}
    >
      {children}
      {required && (
        <Typography component='span' sx={{ color: 'error.main', ml: 0.5 }}>
          *
        </Typography>
      )}
    </Typography>
  )
}

export default AuthInputLabel
