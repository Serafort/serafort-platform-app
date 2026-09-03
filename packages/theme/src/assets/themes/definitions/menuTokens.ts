import type { Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import { getCustomShadow, getDirectionalActiveGradient } from './mixins'

/**
 * Menu & Navigation Design Tokens & Helper Mixins
 * Centralizes layout menu dimensions, spacing multipliers, active item gradients,
 * submenu elevation shadows, popout inline sizes, transitions, and direction-aware styling.
 */

export interface MenuTokens {
  horizontal: {
    root: {
      itemMarginInlineEndSpacing: number
    }
    button: {
      minBlockSize: string
      paddingInline: string
      openBg: string
    }
    item: {
      borderRadius: number
      paddingInlineSpacing: number
      paddingBlockDefaultSpacing: number
      paddingBlockChipSpacing: number
      iconMarginInlineEndSpacing: number
      prefixMarginInlineEndSpacing: number
      suffixMarginInlineStartSpacing: number
      expandIconMarginInlineStartSpacing: number
      submenuPaddingSpacing: number
      submenuItemMarginBlockEndSpacing: number
      iconSizePrimary: string
      iconSizeSecondary: string
      expandIconSize: string
      activeGradientAlpha: number
      activeSubmenuAlpha: number
      submenuZIndexOffset: number
      popoutSubmenuInlineSize: string
    }
    popoutTransition: {
      offsetY: string
      initialOpacity: number
      openOpacity: number
    }
  }
  vertical: {
    button: {
      minBlockSize: string
      paddingInlineEnd: string
      basePaddingInlineStart: number
    }
    header: {
      paddingBlockSpacing: number
      paddingInlineStartSpacing: number
      paddingInlineEndSpacing: number
      paddingDefault: string
      paddingInlineStart: string
    }
    root: {
      paddingBlockSpacing: number
      paddingInlineSpacing: number
    }
    section: {
      collapsedPaddingBlockSpacing: number
      expandedPaddingBlockSpacing: number
      paddingInline: string
      marginBlockStartSpacing: number
      indicatorInlineSize: string
      labelFontSize: string
      labelLineHeight: number
      labelLetterSpacing: string
      wrapperStyles: React.CSSProperties
      contentStyles: React.CSSProperties
    }
    item: {
      paddingBlock: string
      paddingInline: string
      marginBlockStartSpacing: number
      activeSubmenuAlpha: number
      activeGradientAlpha: number
      iconSizePrimary: string
      iconSizeSecondary: string
      expandIconSize: string
      iconMarginLevel0: number
      iconMarginLevel1: number
      iconMarginPopout: number
      prefixMarginEnd: number
      suffixMarginStart: number
      popoutSubmenuInlineSize: string
      popoutBorderRadius: string
    }
    submenu: {
      marginBlockStart: string
      placement: string
      openHoverBg: string
    }
  }
}

export const menuTokens: MenuTokens = {
  horizontal: {
    root: {
      itemMarginInlineEndSpacing: 1.5,
    },
    button: {
      minBlockSize: '30px',
      paddingInline: '20px',
      openBg: '#f3f3f3',
    },
    item: {
      borderRadius: 6,
      paddingInlineSpacing: 4,
      paddingBlockDefaultSpacing: 2,
      paddingBlockChipSpacing: 1.75,
      iconMarginInlineEndSpacing: 2,
      prefixMarginInlineEndSpacing: 2,
      suffixMarginInlineStartSpacing: 2,
      expandIconMarginInlineStartSpacing: 2,
      submenuPaddingSpacing: 2,
      submenuItemMarginBlockEndSpacing: 0.5,
      iconSizePrimary: '1.375rem',
      iconSizeSecondary: '0.75rem',
      expandIconSize: '1.25rem',
      activeGradientAlpha: 0.7,
      activeSubmenuAlpha: 0.16,
      submenuZIndexOffset: 1,
      popoutSubmenuInlineSize: '260px',
    },
    popoutTransition: {
      offsetY: '10px',
      initialOpacity: 0,
      openOpacity: 1,
    },
  },
  vertical: {
    button: {
      minBlockSize: '30px',
      paddingInlineEnd: '20px',
      basePaddingInlineStart: 20,
    },
    header: {
      paddingBlockSpacing: 5,
      paddingInlineStartSpacing: 5.5,
      paddingInlineEndSpacing: 4,
      paddingDefault: '15px',
      paddingInlineStart: '20px',
    },
    root: {
      paddingBlockSpacing: 1,
      paddingInlineSpacing: 3,
    },
    section: {
      collapsedPaddingBlockSpacing: 3.625,
      expandedPaddingBlockSpacing: 1.5,
      paddingInline: '12px !important',
      marginBlockStartSpacing: 1.5,
      indicatorInlineSize: '1.375rem',
      labelFontSize: '13px',
      labelLineHeight: 1.38462,
      labelLetterSpacing: '0.4px',
      wrapperStyles: {
        display: 'inline-block',
        inlineSize: '100%',
        position: 'relative',
        listStyle: 'none',
        padding: 0,
        overflow: 'hidden',
      },
      contentStyles: {
        display: 'flex',
        alignItems: 'center',
        inlineSize: '100%',
        position: 'relative',
        paddingBlock: '0.75rem',
        paddingInline: '1.25rem',
        overflow: 'hidden',
      },
    },
    item: {
      paddingBlock: '8px',
      paddingInline: '12px',
      marginBlockStartSpacing: 1.5,
      activeSubmenuAlpha: 0.16,
      activeGradientAlpha: 0.7,
      iconSizePrimary: '1.375rem',
      iconSizeSecondary: '0.75rem',
      expandIconSize: '1.25rem',
      iconMarginLevel0: 2,
      iconMarginLevel1: 3.5,
      iconMarginPopout: 2,
      prefixMarginEnd: 2,
      suffixMarginStart: 2,
      popoutSubmenuInlineSize: '260px',
      popoutBorderRadius: '4px',
    },
    submenu: {
      marginBlockStart: '4px',
      placement: 'right-start',
      openHoverBg: 'rgba(0, 0, 0, 0.04)',
    },
  },
}

/**
 * Returns margin-inline-end spacing string for horizontal menu root items
 */
export const getHorizontalMenuRootItemSpacing = (theme: Theme): string => {
  return theme.spacing(menuTokens.horizontal.root.itemMarginInlineEndSpacing)
}

/**
 * Returns direction-aware active gradient for top-level horizontal menu items
 */
export const getHorizontalMenuItemActiveGradient = (theme: Theme): string => {
  return `${getDirectionalActiveGradient(theme, menuTokens.horizontal.item.activeGradientAlpha)} !important`
}

/**
 * Returns direction-aware active gradient for top-level vertical menu items
 */
export const getVerticalMenuItemActiveGradient = (theme: Theme): string => {
  return `${getDirectionalActiveGradient(theme, menuTokens.vertical.item.activeGradientAlpha)} !important`
}

/**
 * Returns submenu elevation shadow or bordered skin box-shadow/border overrides
 */
export const getHorizontalSubmenuContentStyles = (theme: Theme, skin?: string) => {
  if (skin === 'bordered') {
    return {
      boxShadow: 'none',
      border: `1px solid ${theme.palette.divider}`,
    }
  }
  return {
    boxShadow: getCustomShadow(theme, 'lg', 8),
  }
}

/**
 * Helper for vertical nav backdrop overlay background color
 */
export const getVerticalNavBackdropColor = (theme: Theme): string => {
  return alpha(theme.palette.common.black, 0.5)
}

/**
 * Helper for vertical nav container shadow / border
 */
export const getVerticalNavContainerShadow = (theme: Theme, skin?: string) => {
  if (skin === 'bordered') {
    return {
      boxShadow: 'none',
      borderColor: theme.palette.divider,
    }
  }
  return {
    boxShadow: getCustomShadow(theme, 'sm', 2),
    borderColor: 'transparent',
  }
}

/**
 * Helper for vertical menu item active primary shadow
 */
export const getVerticalMenuItemActiveShadow = (theme: Theme): string => {
  return getCustomShadow(theme, 'primary.sm', 2)
}

/**
 * Helper for popout submenu shadow fallback
 */
export const getSubmenuPopoutShadow = (theme: any): string => {
  return theme?.customShadows?.lg || theme?.shadows?.[4] || '0 6px 16px rgba(0, 0, 0, 0.12)'
}

/**
 * Math helper for collapsed vertical nav header inline padding
 */
export const getNavHeaderCollapsedPaddingInline = (collapsedWidth: number = 80): string => {
  return `calc((${collapsedWidth}px - 1px - 22px) / 2)`
}

/**
 * Math helper for submenu max block size calculation
 */
export const getSubmenuMaxBlockSize = (top: number = 0): string => {
  return `calc(100dvh - ${top}px)`
}
