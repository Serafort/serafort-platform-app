import React from 'react'
import { Avatar, alpha, useTheme } from '@mui/material'

interface AuthScreenIconProps {
  icon: React.ReactNode
  color?: string
}

const AuthScreenIcon: React.FC<AuthScreenIconProps> = ({ icon, color = 'primary.main' }) => {
  const theme = useTheme()

  return (
    <Avatar
      variant="square"
      sx={{
        width: 56,
        height: 56,
        bgcolor: 'transparent',
        color: color,
        borderRadius: '24px',
        border: '2px solid',
        borderColor: alpha(color.includes('.') ? theme.palette.primary.main : color, 0.2),
      }}
    >
      {icon}
    </Avatar>
  )
}

export default AuthScreenIcon
