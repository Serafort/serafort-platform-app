import type { Theme } from '@mui/material/styles'
import { getCustomShadow } from './mixins'

/**
 * Footer Design Tokens & Surface Mixins
 * Centralizes layout footer dimensions, elevation shadows, skin overrides,
 * sticky positioning parameters, and pass-through interaction rules.
 */

export interface FooterTokens {
  layout: {
    paddingBlock: string
    compactMarginInline: string
    fullInlineSize: string
  }
  positioning: {
    sticky: 'sticky'
    insetBlockEnd: number
    zIndexOffset: number
    defaultZIndex: number
  }
  interaction: {
    containerPointerEvents: 'none'
    contentPointerEvents: 'auto'
  }
  borderedSkin: {
    boxShadow: string
    borderWidth: string
  }
}

export const footerTokens: FooterTokens = {
  layout: {
    paddingBlock: '16px',
    compactMarginInline: 'auto',
    fullInlineSize: '100%',
  },
  positioning: {
    sticky: 'sticky',
    insetBlockEnd: 0,
    zIndexOffset: -100,
    defaultZIndex: 1050,
  },
  interaction: {
    containerPointerEvents: 'none',
    contentPointerEvents: 'auto',
  },
  borderedSkin: {
    boxShadow: 'none',
    borderWidth: '1px',
  },
}

/**
 * Helper for footer elevation drop shadow
 */
export const getFooterElevationShadow = (theme: Theme): string => {
  return getCustomShadow(theme, 'sm', 2)
}

/**
 * Helper for footer border-block-start in bordered skin state
 */
export const getFooterBorderBlockStart = (theme: Theme): string => {
  return `${footerTokens.borderedSkin.borderWidth} solid ${theme.palette.divider}`
}

/**
 * Mixin for detached footer bordered skin styles
 */
export const getFooterDetachedBorderedStyles = (theme: Theme) => ({
  boxShadow: footerTokens.borderedSkin.boxShadow,
  borderInline: `${footerTokens.borderedSkin.borderWidth} solid ${theme.palette.divider}`,
  borderBlockStart: getFooterBorderBlockStart(theme),
})

/**
 * Helper to resolve zIndex for fixed footer
 */
export const getFooterZIndex = (theme: Theme): number => {
  return (theme.zIndex.drawer + footerTokens.positioning.zIndexOffset) || footerTokens.positioning.defaultZIndex
}
