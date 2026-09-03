import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

interface AuthPageLayoutProps {
  children: React.ReactNode
  maxWidth?: number | string
}

const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({ children, maxWidth = 440 }) => {

  return (
    <Box
      className="animate-scale-in"
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      sx={{
        width: '100%',
        maxWidth: maxWidth,
        mx: 'auto',
        p: { xs: 3, md: 5 },
        position: 'relative',
        bgcolor: 'transparent', // Naked box standard
      }}
    >
      {children}
    </Box>
  )
}

export default AuthPageLayout
