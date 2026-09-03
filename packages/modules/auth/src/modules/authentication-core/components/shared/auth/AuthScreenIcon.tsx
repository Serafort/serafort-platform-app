import React from 'react'
import { Avatar, alpha } from '@mui/material'

interface AuthScreenIconProps {
  icon: React.ReactNode
  color?: string
}

const AuthScreenIcon: React.FC<AuthScreenIconProps> = ({ icon, color = 'primary.main' }) => {

  return (
    <Avatar
      variant="square"
      sx={{
        width: 56,
        height: 56,
        bgcolor: 'transparent',
        color: color,
        borderRadius: '24px', // Standard 24px radius
        border: '2px solid',
        borderColor: (t) => alpha(color.includes('.') ? t.palette.primary.main : color, 0.2), // Simple fallback for color logic
      }}
    >
      {icon}
    </Avatar>
  )
}

export default AuthScreenIcon
