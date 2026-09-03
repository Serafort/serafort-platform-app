import type { Theme } from '@mui/material/styles'

/**
 * Guest Public Navbar Design Tokens & Helper Mixins
 * Centralizes layout dimensions, button sizes, drawer widths,
 * transition timings, and mode-aware public navbar color tokens.
 */

export interface GuestNavbarTokens {
  layout: {
    appBarPosition: 'static' | 'fixed' | 'absolute' | 'sticky' | 'relative'
    appBarElevation: number
    py: number
    containerMaxWidth: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    brandGap: number
    brandVariant: 'h6' | 'h5' | 'h4' | 'subtitle1'
    brandTitleFontWeight: number
    desktopNavGap: number
    actionStackSpacing: number
    actionButtonMinWidth: number
    actionButtonHeight: number
    actionButtonPx: number
    actionButtonFontWeight: number
    actionButtonFontSize: string
    actionButtonLetterSpacing: string
    navLinkFontSize: string
    navLinkFontWeight: number
    mobileMenuButtonSize: number
    mobileDrawerWidth: number
    mobileDrawerAnchor: 'left' | 'right' | 'top' | 'bottom'
    mobileDrawerPt: number
    mobileDrawerPb: number
    mobileListItemPy: number
    mobileListItemPx: number
    mobileListItemFontSize: string
    mobileListItemFontWeight: number
    mobileListItemMt: number
    mobileListItemButtonPx: number
  }
  transitions: {
    color: string
    backgroundColor: string
  }
}

export const guestNavbarTokens: GuestNavbarTokens = {
  layout: {
    appBarPosition: 'static',
    appBarElevation: 0,
    py: 3,
    containerMaxWidth: 'xl',
    brandGap: 1.5,
    brandVariant: 'h6',
    brandTitleFontWeight: 700,
    desktopNavGap: 4,
    actionStackSpacing: 2,
    actionButtonMinWidth: 84,
    actionButtonHeight: 40,
    actionButtonPx: 2,
    actionButtonFontWeight: 700,
    actionButtonFontSize: '0.875rem',
    actionButtonLetterSpacing: '0.02em',
    navLinkFontSize: '0.875rem',
    navLinkFontWeight: 500,
    mobileMenuButtonSize: 40,
    mobileDrawerWidth: 280,
    mobileDrawerAnchor: 'right',
    mobileDrawerPt: 2,
    mobileDrawerPb: 2,
    mobileListItemPy: 1.5,
    mobileListItemPx: 3,
    mobileListItemFontSize: '0.875rem',
    mobileListItemFontWeight: 500,
    mobileListItemMt: 2,
    mobileListItemButtonPx: 2,
  },
  transitions: {
    color: 'color 0.2s',
    backgroundColor: 'background-color 0.2s',
  },
}

/**
 * Returns mode-aware color for guest navbar brand title
 */
export const getGuestNavbarBrandTitleColor = (theme: Theme): string => {
  return theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary
}

/**
 * Returns mode-aware color for guest navbar desktop nav links
 */
export const getGuestNavbarNavLinkColor = (theme: Theme): string => {
  return theme.palette.mode === 'dark' ? theme.palette.grey[400] : theme.palette.text.secondary
}

/**
 * Returns mode-aware hover color for guest navbar desktop nav links
 */
export const getGuestNavbarNavLinkHoverColor = (theme: Theme): string => {
  return theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary
}

/**
 * Returns mode-aware hover text color for guest navbar outlined button
 */
export const getGuestNavbarOutlinedButtonHoverColor = (theme: Theme): string => {
  return theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.primary.contrastText
}

/**
 * Returns mode-aware background color for guest navbar contained button
 */
export const getGuestNavbarContainedButtonBg = (theme: Theme): string => {
  return theme.palette.mode === 'dark'
    ? `${theme.palette.primary.main}33`
    : theme.palette.primary.light
}

/**
 * Returns mode-aware hover background color for guest navbar contained button
 */
export const getGuestNavbarContainedButtonHoverBg = (theme: Theme): string => {
  return theme.palette.mode === 'dark'
    ? `${theme.palette.primary.main}4D`
    : theme.palette.primary.main
}

/**
 * Returns mode-aware hover text color for guest navbar contained button
 */
export const getGuestNavbarContainedButtonHoverColor = (theme: Theme): string => {
  return theme.palette.mode === 'dark'
    ? theme.palette.primary.main
    : theme.palette.primary.contrastText
}

/**
 * Returns mode-aware background color for guest navbar mobile menu icon button
 */
export const getGuestNavbarMobileIconButtonBg = (theme: Theme): string => {
  return theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
}

/**
 * Returns mode-aware text color for guest navbar mobile menu icon button
 */
export const getGuestNavbarMobileIconButtonColor = (theme: Theme): string => {
  return theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary
}

/**
 * Returns mode-aware hover background color for guest navbar mobile menu icon button
 */
export const getGuestNavbarMobileIconButtonHoverBg = (theme: Theme): string => {
  return theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'
}

/**
 * Returns mode-aware hover background color for guest navbar mobile list item
 */
export const getGuestNavbarMobileListItemHoverBg = (theme: Theme): string => {
  return theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
}
