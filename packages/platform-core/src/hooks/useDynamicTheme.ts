import { useMemo } from 'react'
import { useTenant } from '../contexts/tenantContext'
import type { TenantThemeConfig } from '@cap/theme'
import type { TenantLayout } from '../types/tenant'

export interface DynamicThemeConfig {
  theme: TenantThemeConfig
  layout: TenantLayout
  userTheme?: 'light' | 'dark' | 'system'
}

export const useDynamicTheme = (): DynamicThemeConfig | null => {
  const { tenant, userPreferences } = useTenant()

  return useMemo(() => {
    if (!tenant) return null

    return {
      theme: tenant.theme as unknown as TenantThemeConfig,
      layout: tenant.layout,
      userTheme: userPreferences.theme,
    }
  }, [tenant, userPreferences.theme])
}

export const getThemeColors = (theme: TenantThemeConfig) => {
  const colors = theme.tokens?.colors
  if (!colors) return {}
  return {
    primary: colors.primary?.value,
    secondary: colors.secondary?.value,
    error: colors.error?.value,
    success: colors.success?.value,
    warning: colors.warning?.value,
    info: colors.info?.value,
    // Add legacy fallbacks for apps still expecting specific brand colors
    brandGold: colors.primary?.value,
    brandBrown: colors.secondary?.value,
    brandSlate: colors.textMuted?.value,
    brandCream: colors.background?.value,
  }
}

export const getLayoutConfig = (layout: TenantLayout) => {
  return {
    layout: layout.layout,
    layoutPadding: layout.layoutPadding,
    compactContentWidth: layout.compactContentWidth,
    navbar: layout.navbar,
    footer: layout.footer,
    contentWidth: layout.contentWidth,
    disableRipple: layout.disableRipple,
    toastPosition: layout.toastPosition,
  }
}

export const getTypographyConfig = (theme: TenantThemeConfig) => {
  return theme.tokens?.typography
}

export const getShapeConfig = (theme: TenantThemeConfig) => {
  return theme.tokens?.borderRadius
}
