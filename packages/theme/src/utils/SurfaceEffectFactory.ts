import type { EffectConfig } from '../types'
import type { Theme } from '@mui/material/styles'
import type { CSSObject } from '@emotion/styled'
import { alpha } from '@mui/material/styles'
import {
  computeNeumorphismBoxShadow,
  getGlassmorphismStyles,
  getLiquidGlassStyles,
  getBrutalismStyles,
  getBentoStyles,
  getOrganicStyles,
  getImmersiveStyles,
} from './computeEffects'

export type SurfaceEffectBuilder = (config: EffectConfig, theme?: Theme) => CSSObject

// Strategy Builders
const buildGlassEffect: SurfaceEffectBuilder = (config, theme) => {
  const glass = config.glassmorphism
  if (!glass) return {}
  const glassStyles = getGlassmorphismStyles(glass, theme)
  const paperColor = theme?.palette?.background?.paper || '#ffffff'
  const borderWidthToken = (theme as any)?.tenantTheme?.tokens?.borderWidth?.thin || '1px'
  return {
    backdropFilter: glassStyles.backdropFilter || `blur(${glass.blur || '16px'})`,
    background: glass.background || (theme ? alpha(paperColor, glass.opacity ?? 0.88) : `rgba(255, 255, 255, ${glass.opacity ?? 0.88})`),
    borderColor: glass.borderColor || theme?.palette?.divider || 'rgba(0, 0, 0, 0.12)',
    borderStyle: 'solid',
    borderWidth: glass.borderWidth || borderWidthToken,
  }
}

const buildLiquidGlassEffect: SurfaceEffectBuilder = (config, theme) => {
  const liquid = config.liquidGlass
  if (!liquid) return {}
  const liquidStyles = getLiquidGlassStyles(liquid, theme)
  const borderWidthToken = (theme as any)?.tenantTheme?.tokens?.borderWidth?.thin || '1px'
  return {
    backdropFilter: liquidStyles.backdropFilter,
    WebkitBackdropFilter: liquidStyles.WebkitBackdropFilter,
    background: liquidStyles.background,
    border: liquidStyles.border || `${liquid.borderWidth || borderWidthToken} solid ${liquid.borderColor || 'rgba(255, 255, 255, 0.2)'}`,
    boxShadow: liquidStyles.boxShadow,
  }
}

const buildNeumorphismEffect: SurfaceEffectBuilder = (config, theme) => {
  const neu = config.neumorphism
  if (!neu) return {}
  return {
    background: neu.backgroundColor || theme?.palette?.background?.paper || '#e0e0e0',
    boxShadow: computeNeumorphismBoxShadow(neu),
    borderRadius: neu.borderRadius || (theme ? `${theme.shape.borderRadius}px` : '12px'),
  }
}

const buildBrutalismEffect: SurfaceEffectBuilder = (config, theme) => {
  const brutal = config.brutalism
  if (!brutal) return {}
  const brutalStyles = getBrutalismStyles(brutal, theme)
  const fallbackColor = theme?.palette?.text?.primary || '#000000'
  const borderWidthToken = (theme as any)?.tenantTheme?.tokens?.borderWidth?.medium || '2px'
  return {
    background: brutal.backgroundColor || theme?.palette?.background?.paper || '#ffffff',
    border: brutalStyles.border || `${brutal.borderWidth || borderWidthToken} solid ${brutal.borderColor || fallbackColor}`,
    boxShadow: brutalStyles.boxShadow || `${brutal.shadowOffset || '4px'} ${brutal.shadowOffset || '4px'} 0px ${brutal.shadowColor || fallbackColor}`,
  }
}

const buildBentoEffect: SurfaceEffectBuilder = (config, theme) => {
  const bento = config.bento
  if (!bento) return {}
  const bentoStyles = getBentoStyles(bento, theme)
  const fallbackBorder = theme?.palette?.divider || 'rgba(0, 0, 0, 0.12)'
  const fallbackShadow = (theme as any)?.customShadows?.md || theme?.shadows?.[4] || '0 4px 6px -1px rgba(0,0,0,0.1)'
  const borderWidthToken = (theme as any)?.tenantTheme?.tokens?.borderWidth?.thin || '1px'
  return {
    background: bento.background || theme?.palette?.background?.paper || '#ffffff',
    borderRadius: bento.borderRadius || (theme ? `${theme.shape.borderRadius * 2}px` : '24px'),
    border: bentoStyles.border || `${bento.borderWidth || borderWidthToken} solid ${bento.borderColor || fallbackBorder}`,
    boxShadow: bento.shadow || fallbackShadow,
  }
}

const buildOrganicEffect: SurfaceEffectBuilder = (config, theme) => {
  const organic = config.organic
  if (!organic) return {}
  const organicStyles = getOrganicStyles(organic, theme)
  return {
    background: organicStyles.background,
    borderRadius: organicStyles.borderRadius,
    border: organicStyles.border,
    transition: organicStyles.transition,
    filter: organicStyles.filter,
  }
}

const buildImmersiveEffect: SurfaceEffectBuilder = (config, theme) => {
  const immersive = config.immersive
  if (!immersive) return {}
  const immersiveStyles = getImmersiveStyles(immersive, theme)
  return {
    background: theme?.palette?.background?.paper || '#ffffff',
    perspective: immersiveStyles.perspective,
    transform: immersiveStyles.transform,
    boxShadow: immersiveStyles.boxShadow,
    transition: immersiveStyles.transition,
  }
}

import { LRUCache } from './LRUCache'

/**
 * Tier 1 Surface Effect Factory Registry
 * Manages visual surface effect strategy registration and generation.
 */
export class SurfaceEffectFactory {
  private static registry = new Map<string, SurfaceEffectBuilder>([
    ['glass', buildGlassEffect],
    ['liquid-glass', buildLiquidGlassEffect],
    ['neu', buildNeumorphismEffect],
    ['brutalism', buildBrutalismEffect],
    ['bento', buildBentoEffect],
    ['organic', buildOrganicEffect],
    ['immersive', buildImmersiveEffect],
  ])

  private static effectCache = new LRUCache<string, CSSObject>(100)

  /** Registers or overrides a surface effect builder strategy */
  public static register(type: string, builder: SurfaceEffectBuilder): void {
    this.registry.set(type, builder)
    this.effectCache.clear() // Clear cache if a builder changes
  }

  /** Generates surface effect CSS declarations for the given effect config and theme */
  public static create(config: EffectConfig, theme?: Theme): CSSObject {
    if (!config || !config.globalType) return {}
    
    // Hash key for flyweight memoization
    const mode = theme?.palette?.mode || 'light'
    const key = `${config.globalType}_${mode}_${JSON.stringify(config)}`
    
    const cached = this.effectCache.get(key)
    if (cached) {
      return cached
    }
    
    const builder = this.registry.get(config.globalType)
    const cssObject = builder ? builder(config, theme) : {}
    
    this.effectCache.set(key, cssObject)
    
    return cssObject
  }
}

/**
 * Generates CSS override objects for layout/UI surfaces using SurfaceEffectFactory.
 */
export const buildSurfaceEffect = (config: EffectConfig, theme?: Theme): CSSObject => {
  return SurfaceEffectFactory.create(config, theme)
}
