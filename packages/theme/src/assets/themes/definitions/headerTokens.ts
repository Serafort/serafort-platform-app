import type { Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import { getCustomShadow } from './mixins'

/**
 * Header & Navbar Design Tokens & Surface Mixins
 * Centralizes layout header dimensions, glassmorphism blur parameters,
 * gradient masks, skin overrides, elevation shadows, layout sizing math,
 * and pointer-event passthrough behavior.
 */

export interface HeaderTokens {
  layout: {
    minBlockSize: string
    paddingInline: string
    paddingBlock: string
    floatingPaddingBlockStart: string
    compactMarginInline: string
    fullInlineSize: string
  }
  positioning: {
    sticky: 'sticky'
    insetBlockStart: number
    navbarPosition: 'relative'
  }
  interaction: {
    containerPointerEvents: 'none'
    navbarPointerEvents: 'auto'
  }
  glassmorphism: {
    backdropFilter: string
    paperOpacity: number
  }
  borderedSkin: {
    boxShadow: string
    borderWidth: string
  }
  floatingOverlay: {
    content: string
    position: 'absolute'
    zIndex: number
    insetBlockStart: number
    insetInline: number
    blockSize: string
    backdropFilter: string
    gradientAngle: string
    stops: {
      topAlpha: number
      topPosition: string
      midAlpha: number
      midPosition: string
      bottomAlpha: number
    }
    mask: {
      solidPosition: string
      endColor: string
      endPosition: string
    }
  }
}

export const headerTokens: HeaderTokens = {
  layout: {
    minBlockSize: '64px',
    paddingInline: '16px',
    paddingBlock: '8px',
    floatingPaddingBlockStart: '16px',
    compactMarginInline: 'auto',
    fullInlineSize: '100%',
  },
  positioning: {
    sticky: 'sticky',
    insetBlockStart: 0,
    navbarPosition: 'relative',
  },
  interaction: {
    containerPointerEvents: 'none',
    navbarPointerEvents: 'auto',
  },
  glassmorphism: {
    backdropFilter: 'blur(6px)',
    paperOpacity: 0.88,
  },
  borderedSkin: {
    boxShadow: 'none',
    borderWidth: '1px',
  },
  floatingOverlay: {
    content: "''",
    position: 'absolute',
    zIndex: -1,
    insetBlockStart: 0,
    insetInline: 0,
    blockSize: '100%',
    backdropFilter: 'blur(10px)',
    gradientAngle: '180deg',
    stops: {
      topAlpha: 0.7,
      topPosition: '44%',
      midAlpha: 0.43,
      midPosition: '73%',
      bottomAlpha: 0,
    },
    mask: {
      solidPosition: '18%',
      endColor: 'transparent',
      endPosition: '100%',
    },
  },
}

/**
 * Mixin for default elevation drop shadow of detached / floating headers
 */
export const getHeaderElevationShadow = (theme: Theme): string => {
  return getCustomShadow(theme, 'sm', 1)
}

/**
 * Helper for border-inline in bordered skin header state
 */
export const getHeaderBorderInline = (theme: Theme): string => {
  return `${headerTokens.borderedSkin.borderWidth} solid ${theme.palette.divider}`
}

/**
 * Helper for border-block-end in bordered skin header state
 */
export const getHeaderBorderBlockEnd = (theme: Theme): string => {
  return `${headerTokens.borderedSkin.borderWidth} solid ${theme.palette.divider}`
}

/**
 * Helper for full 4-side border in bordered skin floating header state
 */
export const getHeaderBorderFull = (theme: Theme): string => {
  return `${headerTokens.borderedSkin.borderWidth} solid ${theme.palette.divider}`
}

/**
 * Math helper for detached/floating navbar inline width calculation
 */
export const getFloatingNavbarInlineSize = (layoutPadding: string | number): string => {
  const paddingVal = typeof layoutPadding === 'number' ? `${layoutPadding}px` : layoutPadding
  return `calc(100% - calc(${paddingVal} * 2))`
}

/**
 * Math helper for compact content layout floating header max width calculation
 */
export const getCompactFloatingMaxInlineSize = (
  compactContentWidth: number,
  layoutPadding: string | number
): string => {
  const paddingVal = typeof layoutPadding === 'number' ? `${layoutPadding}px` : layoutPadding
  return `calc(${compactContentWidth}px - calc(${paddingVal} * 2))`
}

/**
 * Mixin for header glassmorphic blur state
 */
export const getHeaderBlurStyles = (theme: Theme) => ({
  backdropFilter: headerTokens.glassmorphism.backdropFilter,
  backgroundColor: alpha(theme.palette.background.paper, headerTokens.glassmorphism.paperOpacity),
})

/**
 * Helper for floating overlay linear gradient mask
 */
export const getHeaderFloatingMask = (theme: Theme): string => {
  return `linear-gradient(
    ${theme.palette.background.default},
    ${theme.palette.background.default} ${headerTokens.floatingOverlay.mask.solidPosition},
    ${headerTokens.floatingOverlay.mask.endColor} ${headerTokens.floatingOverlay.mask.endPosition}
  )`
}

/**
 * Mixin for floating header pseudo-element overlay gradient mask
 */
export const getHeaderFloatingOverlayStyles = (theme: Theme) => ({
  content: headerTokens.floatingOverlay.content,
  position: headerTokens.floatingOverlay.position,
  zIndex: headerTokens.floatingOverlay.zIndex,
  insetBlockStart: headerTokens.floatingOverlay.insetBlockStart,
  insetInline: headerTokens.floatingOverlay.insetInline,
  blockSize: headerTokens.floatingOverlay.blockSize,
  background: `linear-gradient(
    ${headerTokens.floatingOverlay.gradientAngle},
    ${alpha(theme.palette.background.default, headerTokens.floatingOverlay.stops.topAlpha)} ${headerTokens.floatingOverlay.stops.topPosition},
    ${alpha(theme.palette.background.default, headerTokens.floatingOverlay.stops.midAlpha)} ${headerTokens.floatingOverlay.stops.midPosition},
    ${alpha(theme.palette.background.default, headerTokens.floatingOverlay.stops.bottomAlpha)}
  )`,
  backdropFilter: headerTokens.floatingOverlay.backdropFilter,
  mask: getHeaderFloatingMask(theme),
})

/**
 * Mixin for bordered skin header overrides
 */
export const getHeaderBorderedSkinStyles = (theme: Theme) => ({
  boxShadow: headerTokens.borderedSkin.boxShadow,
  borderInline: getHeaderBorderInline(theme),
  borderBlockEnd: getHeaderBorderBlockEnd(theme),
})

/**
 * Mixin for pass-through pointer events on detached/floating header layout shells
 */
export const getHeaderPassThroughStyles = () => ({
  pointerEvents: headerTokens.interaction.containerPointerEvents,
  '& .navbar': {
    pointerEvents: headerTokens.interaction.navbarPointerEvents,
  },
})
