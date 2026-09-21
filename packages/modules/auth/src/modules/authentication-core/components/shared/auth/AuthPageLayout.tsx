import React from 'react'
import { Box } from '@mui/material'
import { motion } from 'framer-motion'
import { BlankLayout } from '@cap/layout'
import type { AuthBackdropIntensity } from './AuthBackdrop'

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
  /**
   * Serafort brand mark above the card. On by default so the whole
   * unauthenticated funnel opens on the brand; pass `false` for a screen that
   * renders its own lockup or is embedded inside another surface.
   */
  logo?: boolean
}

/**
 * Thin wrapper over `@cap/layout`'s centred `BlankLayout` shell.
 *
 * The centring, the ambient gradient (`AmbientBackdrop`) and the
 * `<AdaptiveLogo/>` all live at the layout tier now — this component only
 * picks the options the auth funnel wants and adds the card's entrance
 * animation. The animation stays here, outside the shell: it animates
 * `transform`, and a transformed ancestor would become the containing block
 * for the backdrop's `position: fixed`, clipping the wash to the card.
 */
const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({
  children,
  maxWidth = 480,
  backdrop = 'standard',
  align = 'center',
  logo = true,
}) => {
  return (
    <BlankLayout
      centered
      align={align}
      backdrop={backdrop === false ? 'none' : backdrop}
      logo={logo}
      maxWidth={maxWidth}
    >
      <Box
        className='animate-scale-in'
        component={motion.div}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        sx={{ width: '100%' }}
      >
        {children}
      </Box>
    </BlankLayout>
  )
}

export default AuthPageLayout
