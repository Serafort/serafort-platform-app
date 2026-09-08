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
  /**
   * `center` suits a single short card. `top` suits a standalone workspace
   * whose content can outgrow the viewport — a centred tall table would push
   * its own heading off-screen.
   */
  align?: 'center' | 'top'
}

const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({
  children,
  maxWidth = 480,
  backdrop = 'standard',
  align = 'center',
}) => {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        p: { xs: 2, sm: 3, md: 4 },
        ...(align === 'top' ? { pt: { xs: 3, sm: 5, md: 6 } } : {}),
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
