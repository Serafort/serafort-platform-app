import type { Theme } from '@mui/material/styles'
import { alpha } from '@mui/material/styles'
import { getPrimaryMainOpacity } from './mixins'

/**
 * Admin Vertical Navigation Menu Design Tokens & Helper Mixins
 * Centralizes popout menu offsets, button transitions, radii, margins,
 * active item shadows, label typography parameters, section margins,
 * scroll wrapper classnames, and expanded menu item icon classes.
 */

export interface AdminMenuTokens {
  popoutMenuMainAxisOffset: number
  scrollWrapperClassName: string
  expandedMenuItemIconClass: string
  button: {
    transition: string
    borderRadius: string
    margin: string
    paddingInline: string
    hoverTranslateX: string
    activeAlpha: number
  }
  label: {
    fontWeight: number
    letterSpacing: string
  }
  section: {
    rootMarginBlockStart: string
  }
}

export const adminMenuTokens: AdminMenuTokens = {
  popoutMenuMainAxisOffset: 23,
  scrollWrapperClassName: 'bs-full overflow-y-auto overflow-x-hidden',
  expandedMenuItemIconClass: 'tabler-circle text-xs',
  button: {
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: '10px !important',
    margin: '4px 12px !important',
    paddingInline: '12px !important',
    hoverTranslateX: 'translateX(4px)',
    activeAlpha: 0.2,
  },
  label: {
    fontWeight: 500,
    letterSpacing: '0.01rem',
  },
  section: {
    rootMarginBlockStart: '15px !important',
  },
}

/**
 * Returns mode-aware active button shadow for admin menu items
 */
export const getAdminMenuButtonActiveShadow = (theme: Theme): string => {
  return `0 4px 12px 0 ${alpha(theme.palette.primary.main, adminMenuTokens.button.activeAlpha)}`
}

/**
 * Returns active button background string using primary mainOpacity
 */
export const getAdminMenuButtonActiveBg = (theme: Theme): string => {
  return `${getPrimaryMainOpacity(theme)} !important`
}

/**
 * Returns mode-aware hover background string for admin menu buttons
 */
export const getAdminMenuButtonHoverBg = (theme: Theme, active?: boolean): string => {
  return active ? getPrimaryMainOpacity(theme) : theme.palette.action.hover
}

/**
 * Returns disabled section label text color
 */
export const getAdminMenuSectionLabelColor = (theme: Theme): string => {
  return `${theme.palette.text.disabled} !important`
}
