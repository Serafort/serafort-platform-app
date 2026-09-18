import React from 'react'
import { Box, Typography } from '@mui/material'
import ShieldOutlined from '@mui/icons-material/ShieldOutlined'

export interface AuthSecurityNoteProps {
  children: React.ReactNode
  icon?: React.ReactNode
}

/** Reassurance footnote rendered under an auth card ("Encrypted & single-use", …). */
const AuthSecurityNote: React.FC<AuthSecurityNoteProps> = ({
  children,
  icon = <ShieldOutlined sx={{ fontSize: 16 }} />,
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1,
      mt: 3,
      color: 'text.disabled',
    }}
  >
    {icon}
    <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
      {children}
    </Typography>
  </Box>
)

export default AuthSecurityNote
