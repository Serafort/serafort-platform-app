import React from 'react'
import { Box, alpha, useTheme } from '@mui/material'

export type AuthBackdropIntensity = 'subtle' | 'standard' | 'vivid'

export interface AuthBackdropProps {
  /**
   * Controls how strongly the ambient wash reads against the page surface.
   * `subtle` is intended for dense forms, `vivid` for outcome/celebration screens.
   */
  intensity?: AuthBackdropIntensity
}

const INTENSITY_ALPHA: Record<AuthBackdropIntensity, { edge: number; core: number }> = {
  subtle: { edge: 0.22, core: 0.1 },
  standard: { edge: 0.35, core: 0.15 },
  vivid: { edge: 0.45, core: 0.22 },
}

/**
 * Ambient gradient wash shared by every unauthenticated (`noLayout`) auth screen.
 *
 * Previously each screen inlined its own `radial-gradient` stack with slightly
 * different alpha values, which is what made card elevation read inconsistently
 * from one screen to the next. Centralising it here keeps the whole onboarding
 * funnel on one visual ground, and keeps the colours on palette tokens so every
 * tenant preset and both light/dark modes stay correct.
 */
const AuthBackdrop: React.FC<AuthBackdropProps> = ({ intensity = 'standard' }) => {
  const theme = useTheme()
  const { edge, core } = INTENSITY_ALPHA[intensity]
  const accent = theme.palette.secondary?.main || theme.palette.primary.light

  return (
    <Box
      aria-hidden
      sx={{
        position: 'fixed',
        insetInlineStart: 0,
        insetBlockStart: 0,
        inlineSize: '100%',
        blockSize: '100%',
        // Not `-1`: a negative index puts the wash behind the page background,
        // which is why the gradient never actually rendered on these screens.
        // Sitting at 0 keeps it behind the card, which carries `zIndex: 1`.
        zIndex: 0,
        pointerEvents: 'none',
        background: [
          `radial-gradient(circle at 10% 20%, ${alpha(theme.palette.primary.main, edge)} 0%, transparent 40%)`,
          `radial-gradient(circle at 90% 80%, ${alpha(accent, edge)} 0%, transparent 40%)`,
          `radial-gradient(circle at 50% 50%, ${alpha(theme.palette.primary.dark, core)} 0%, transparent 60%)`,
        ].join(', '),
      }}
    />
  )
}

export default AuthBackdrop
