import React from 'react'
import { Avatar, Box, Typography } from '@mui/material'
import { useAuth } from '@cap/platform-core'

/**
 * Shared component for displaying authenticated user profile
 */
export const AuthProfile: React.FC = () => {
  const { user } = useAuth()

  if (!user) return null

  const userData = (user as any).user || user // Handle both nested and flat user models

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Avatar
        alt={userData.firstName || ''}
        src={userData.avatar || ''}
        sx={{ width: 32, height: 32 }}
      />
      <Typography variant='body2' noWrap>
        {userData.firstName || userData.email}
      </Typography>
    </Box>
  )
}

export default AuthProfile
