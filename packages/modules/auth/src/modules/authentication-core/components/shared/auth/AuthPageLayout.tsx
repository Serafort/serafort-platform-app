import React from 'react'
import { Box } from '@mui/material'
import { motion } from 'framer-motion'
import AuthBackdrop, { type AuthBackdropIntensity } from './AuthBackdrop'

interface AuthPageLayoutProps {
  children: React.ReactNode
  maxWidth?: number | string
  /**
   * Ambient gradient wash behind the card. Pass `false` for screens that
   * supply their own background.
   */
  backdrop?: AuthBackdropIntensity | false
}

const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({
  children,
  maxWidth = 480,
  backdrop = 'standard',
}) => {
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
      {/*
        Rendered here rather than by each screen, and deliberately outside the
        animated wrapper below. That wrapper animates `transform`, and a
        transformed ancestor becomes the containing block for `position: fixed`
        descendants — which is why the wash used to be clipped to the card
        instead of covering the viewport.
      */}
      {backdrop !== false && <AuthBackdrop intensity={backdrop} />}

      <Box
        className='animate-scale-in'
        component={motion.div}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        sx={{
          width: '100%',
          maxWidth: maxWidth,
          mx: 'auto',
          position: 'relative',
          // Above AuthBackdrop's full-viewport wash.
          zIndex: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default AuthPageLayout
