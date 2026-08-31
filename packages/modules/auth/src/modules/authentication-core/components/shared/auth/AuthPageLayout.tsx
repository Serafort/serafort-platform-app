import React from 'react'
import { Box } from '@mui/material'
import { motion } from 'framer-motion'

interface AuthPageLayoutProps {
  children: React.ReactNode
  maxWidth?: number | string
}

const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({ children, maxWidth = 480 }) => {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3, md: 4 },
        boxSizing: 'border-box',
        position: 'relative',
        bgcolor: 'transparent',
      }}
    >
      <Box
        className="animate-scale-in"
        component={motion.div}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        sx={{
          width: '100%',
          maxWidth: maxWidth,
          mx: 'auto',
          position: 'relative',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default AuthPageLayout
