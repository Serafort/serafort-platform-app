import type { Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import { getPrimaryMainOpacity } from './mixins'

/**
 * Horizontal & Vertical Layout Navigation Menu Design Tokens & Helper Mixins
 * Centralizes layout menu dimensions, popout offsets, button transitions,
 * hover scale/transform vectors, indicator underline parameters, and navbar content gap spacing.
 */

export interface LayoutMenuTokens {
  horizontalMenu: {
    expandedMenuItemIconClass: string
    expandIconClass: string
    button: {
      transition: string
      borderRadius: string
      margin: string
      paddingInline: string
      hoverIconTransform: string
      hoverIconTransition: string
      hoverBgAlpha: number
      activeIndicatorBottom: number
      activeIndicatorInset: string
      activeIndicatorHeight: string
      activeIndicatorRadius: string
      activeIndicatorAnimation: string
    }
    popoutOffsetLevel0: number
    popoutOffsetSublevel: number
    verticalFallback: {
      buttonBorderRadius: string
      buttonMargin: string
      buttonTransition: string
    }
  }
  verticalMenu: {
    popoutMainAxisOffset: number
    scrollWrapperClassName: string
    expandedMenuItemIconClass: string
    expandIconClass: string
    button: {
      transition: string
      borderRadius: string
      margin: string
      paddingInline: string
      hoverTranslateX: string
      hoverIconScale: string
      hoverIconTransition: string
      activeShadowAlpha: number
    }
    sectionLabel: {
      rootMarginBlockStart: string
      fontSize: string
      fontWeight: string
      textTransform: 'uppercase' | 'capitalize' | 'lowercase' | 'none'
      letterSpacing: string
    }
  }
  navbarContent: {
    gap: string
    actionsGap: number
    iconGroupGap: number
    iconButtonTransition: string
    iconButtonHoverTranslateY: string
    iconButtonHoverAlpha: number
  }
  verticalNavbar: {
    containerStyles: React.CSSProperties
    boxStyles: React.CSSProperties
  }
}

export const layoutMenuTokens: LayoutMenuTokens = {
  horizontalMenu: {
    expandedMenuItemIconClass: 'tabler-circle text-xs',
    expandIconClass: 'tabler-chevron-right',
    button: {
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      borderRadius: '8px !important',
      margin: '0 4px !important',
      paddingInline: '12px !important',
      hoverIconTransform: 'translateY(-2px)',
      hoverIconTransition: 'all 0.3s ease',
      hoverBgAlpha: 0.08,
      activeIndicatorBottom: 4,
      activeIndicatorInset: '20%',
      activeIndicatorHeight: '2px',
      activeIndicatorRadius: '99px',
      activeIndicatorAnimation: 'scaleIn 0.3s ease',
    },
    popoutOffsetLevel0: 12,
    popoutOffsetSublevel: 14,
    verticalFallback: {
      buttonBorderRadius: '8px !important',
      buttonMargin: '2px 8px !important',
      buttonTransition: 'all 0.2s ease',
    },
  },
  verticalMenu: {
    popoutMainAxisOffset: 23,
    scrollWrapperClassName: 'bs-full overflow-y-auto overflow-x-hidden',
    expandedMenuItemIconClass: 'tabler-circle text-xs',
    expandIconClass: 'tabler-chevron-right',
    button: {
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      borderRadius: '10px !important',
      margin: '4px 12px !important',
      paddingInline: '12px !important',
      hoverTranslateX: 'translateX(4px)',
      hoverIconScale: 'scale(1.15)',
      hoverIconTransition: 'all 0.3s ease',
      activeShadowAlpha: 0.2,
    },
    sectionLabel: {
      rootMarginBlockStart: '15px !important',
      fontSize: '0.75rem !important',
      fontWeight: '700 !important',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
  },
  navbarContent: {
    gap: '1rem',
    actionsGap: 1.5,
    iconGroupGap: 0.5,
    iconButtonTransition: 'all 0.2s ease',
    iconButtonHoverTranslateY: 'translateY(-2px)',
    iconButtonHoverAlpha: 0.08,
  },
  verticalNavbar: {
    containerStyles: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      inlineSize: '100%',
    },
    boxStyles: {
      display: 'flex',
      blockSize: '100%',
    },
  },
}

/**
 * Returns popout offset mainAxis for horizontal menu level
 */
export const getHorizontalMenuPopoutOffset = (level?: number): number => {
  return level && level > 0 ? layoutMenuTokens.horizontalMenu.popoutOffsetSublevel : layoutMenuTokens.horizontalMenu.popoutOffsetLevel0
}

/**
 * Returns mode-aware hover background string for horizontal menu items
 */
export const getHorizontalMenuButtonHoverBg = (theme: Theme, active?: boolean): string => {
  return active ? getPrimaryMainOpacity(theme) : `${alpha(theme.palette.text.primary, layoutMenuTokens.horizontalMenu.button.hoverBgAlpha)} !important`
}

/**
 * Returns active button background string using primary mainOpacity
 */
export const getLayoutMenuButtonActiveBg = (theme: Theme): string => {
  return `${getPrimaryMainOpacity(theme)} !important`
}

/**
 * Returns mode-aware active button shadow for vertical menu items
 */
export const getVerticalMenuButtonActiveShadow = (theme: Theme): string => {
  return `0 4px 12px 0 ${alpha(theme.palette.primary.main, layoutMenuTokens.verticalMenu.button.activeShadowAlpha)}`
}

/**
 * Returns mode-aware hover background color for navbar icon buttons
 */
export const getNavbarIconButtonHoverBg = (theme: Theme): string => {
  return alpha(theme.palette.text.primary, layoutMenuTokens.navbarContent.iconButtonHoverAlpha)
}
