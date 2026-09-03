import type { Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'

/**
 * Main Shell Navbar Design Tokens & Helper Mixins
 * Centralizes search bar dimensions, opacities, input padding calculations,
 * app bar z-indices, and mode-aware primary text/icon colors.
 */

export interface NavbarTokens {
  search: {
    marginRight: string
    bgAlpha: number
    hoverBgAlpha: number
    smMarginLeft: number
    iconPaddingY: number
    iconPaddingX: number
    inputPaddingLeftSpacing: number
    inputWidthSm: string
    inputWidthFocus: string
  }
  layout: {
    appBarMaxWidth: string
    zIndexOffset: number
    containerPt: number
    menuMarginLeft: string
    selectedBorderWidth: string
  }
}

export const navbarTokens: NavbarTokens = {
  search: {
    marginRight: '20px',
    bgAlpha: 0.15,
    hoverBgAlpha: 0.25,
    smMarginLeft: 1,
    iconPaddingY: 0,
    iconPaddingX: 2,
    inputPaddingLeftSpacing: 4,
    inputWidthSm: '12ch',
    inputWidthFocus: '20ch',
  },
  layout: {
    appBarMaxWidth: '100%',
    zIndexOffset: 1,
    containerPt: 2,
    menuMarginLeft: '20px',
    selectedBorderWidth: '8px',
  },
}

/**
 * Returns search box background color using primary.main and alpha
 */
export const getSearchBgColor = (theme: Theme): string => {
  return alpha(theme.palette.primary.main, navbarTokens.search.bgAlpha)
}

/**
 * Returns search box hover background color using primary.main and alpha
 */
export const getSearchHoverBgColor = (theme: Theme): string => {
  return alpha(theme.palette.primary.main, navbarTokens.search.hoverBgAlpha)
}

/**
 * Returns mode-aware search icon and input text color
 */
export const getSearchIconColor = (theme: Theme): string => {
  return theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark
}

/**
 * Calculates left padding for search input base based on icon width
 */
export const getSearchInputLeftPadding = (theme: Theme): string => {
  return `calc(1em + ${theme.spacing(navbarTokens.search.inputPaddingLeftSpacing)})`
}

/**
 * Returns mode-aware mobile menu icon color
 */
export const getMenuIconColor = (theme: Theme): string => {
  return theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark
}
