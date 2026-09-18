import React from 'react'
import { Box, type SxProps, type Theme } from '@mui/material'
import { AdaptiveCard, LiquidGlassCard, useComponentEffectConfig } from '@cap/theme'

export interface AuthCardProps {
  children: React.ReactNode
  /**
   * `auto` (default) follows the tenant's global surface effect whenever the
   * tenant has chosen one, and falls back to the liquid-glass onboarding
   * surface when the tenant is still on the `standard` effect. `adaptive`
   * always defers to the tenant, `glass` always uses liquid glass.
   */
  surface?: 'auto' | 'adaptive' | 'glass'
  /** Inner padding. Responsive by default; pass `none` when the child owns its padding. */
  padding?: 'none' | 'standard' | 'comfortable'
  /** Applied to the wrapper around the surface, not to the surface itself. */
  sx?: SxProps<Theme>
  className?: string
}

const PADDING_MAP = {
  none: 0,
  standard: { xs: 3, sm: 4 },
  comfortable: { xs: 3, sm: 4.5, md: 5 },
} as const

/**
 * The single card surface for auth screens.
 *
 * Every screen used to hand-roll its own `<Card>` with a literal
 * `backdropFilter: blur(20px)` and a black-alpha box shadow, or reach directly
 * for `LiquidGlassCard`. Both bypass the tenant's chosen surface effect, so a
 * tenant on Bento or Brutalism still got a glass auth screen. Routing all of
 * them through `AdaptiveCard` means the six effect generators in `@cap/theme`
 * drive the onboarding funnel too, while `auto` keeps the designed glass look
 * for tenants that never picked an effect.
 */
const AuthCard: React.FC<AuthCardProps> = ({
  children,
  surface = 'auto',
  padding = 'standard',
  sx,
  className,
}) => {
  const effectConfig = useComponentEffectConfig('card')
  const tenantHasEffect = effectConfig.globalType && effectConfig.globalType !== 'standard'
  const useGlass = surface === 'glass' || (surface === 'auto' && !tenantHasEffect)

  const content = <Box sx={{ p: PADDING_MAP[padding] }}>{children}</Box>

  return (
    <Box sx={{ width: '100%', ...sx }} className={className}>
      {useGlass ? (
        <LiquidGlassCard blur='24px' opacity={0.85} padding='0px' borderRadius='24px'>
          {content}
        </LiquidGlassCard>
      ) : (
        <AdaptiveCard padding='0px'>{content}</AdaptiveCard>
      )}
    </Box>
  )
}

export default AuthCard
