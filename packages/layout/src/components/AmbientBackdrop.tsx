import React from 'react'
import { Box, alpha, useTheme } from '@mui/material'

export type AmbientBackdropIntensity = 'subtle' | 'standard' | 'vivid'

const BACKDROP_ALPHA: Record<AmbientBackdropIntensity, { edge: number; core: number }> = {
  subtle: { edge: 0.22, core: 0.1 },
  standard: { edge: 0.35, core: 0.15 },
  vivid: { edge: 0.45, core: 0.22 },
}

export interface AmbientBackdropProps {
  /** How strongly the wash reads against the page surface. */
  intensity?: AmbientBackdropIntensity
}

/**
 * Ambient gradient wash shared by the centred `BlankLayout` shell and
 * `PublicLayout`. A palette-token radial stack so every tenant preset and both
 * light/dark modes stay correct; `insetInlineStart` keeps it correct under
 * RTL. It sits at `zIndex: 0` behind content that carries `zIndex: 1`.
 *
 * The auth module's `AuthBackdrop` was the original of this; it now delegates
 * here so the whole unauthenticated funnel shares one visual ground.
 */
export const AmbientBackdrop: React.FC<AmbientBackdropProps> = ({ intensity = 'standard' }) => {
  const theme = useTheme()
  const { edge, core } = BACKDROP_ALPHA[intensity]
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

export default AmbientBackdrop
