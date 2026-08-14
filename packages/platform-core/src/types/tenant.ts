/**
 * Tenant Types - Re-exported from @cap/shared-types
 * 
 * This file maintains backward compatibility while centralizing types in shared-types.
 * For new code, import directly from @cap/shared-types.
 */

// Re-export all types from shared-types
export type {
  // Core types
  TenantThemeBase,
  TenantTheme,
  TenantLayout,
  TenantNavbarConfig,
  TenantFooterConfig,
  TenantBranding,
  TenantFeatures,
  TenantConfigV1,
  TenantConfig,
  TenantContextValue,
  UserPreferences,
  TenantModule,
  TenantModuleStatus,
  
  // Type aliases
  LayoutType,
  ContentWidth,
  NavbarType,
  ToastPosition,
  
  // Constants
  CURRENT_TENANT_CONFIG_VERSION,
  
  // Type guards
  isTenantConfig,
  isTenantTheme,
  isTenantLayout,
} from '@cap/shared-types'

import type { TenantConfig, TenantLayout } from '@cap/shared-types'
import { CURRENT_TENANT_CONFIG_VERSION } from '@cap/shared-types'
import type { TenantThemeConfig } from '@cap/theme'
import { DEFAULT_THEME_CONFIG } from '@cap/theme'

/**
 * Re-export TenantThemeConfig from @cap/theme for convenience.
 * Use this when you need the full theme configuration.
 */
export type { TenantThemeConfig } from '@cap/theme'

/**
 * Extended tenant theme that combines TenantThemeBase with TenantThemeConfig.
 */
export type ExtendedTenantTheme = TenantThemeConfig

// Default values (require @cap/theme)
export const DEFAULT_TENANT_THEME: ExtendedTenantTheme = {
  ...DEFAULT_THEME_CONFIG,
} as ExtendedTenantTheme

export const DEFAULT_TENANT_LAYOUT: TenantLayout = {
  layout: 'vertical',
  layoutPadding: 0,
  compactContentWidth: 1440,
  navbar: {
    type: 'fixed',
    contentWidth: 'compact',
    floating: true,
    detached: true,
    blur: true,
  },
  footer: {
    type: 'static',
    contentWidth: 'compact',
    detached: true,
  },
  contentWidth: 'compact',
  disableRipple: false,
  toastPosition: 'top-right',
}

export const DEFAULT_TENANT_CONFIG: TenantConfig = {
  _version: 1,
  id: 'default',
  slug: 'default',
  domain: 'localhost',
  name: 'Default Tenant',
  theme: DEFAULT_TENANT_THEME as any,
  layout: DEFAULT_TENANT_LAYOUT,
  branding: {
    logo: null,
    favicon: null,
    appName: 'My App',
    companyName: 'My Company',
  },
  features: {
    darkMode: true,
    rtl: false,
    notifications: true,
    chat: true,
    enabledAuthPlugins: [],
  },
  version: CURRENT_TENANT_CONFIG_VERSION,
}

/**
 * Normalizes a raw tenant config object.
 */
export function normalizeTenantConfig(raw: unknown): TenantConfig {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_TENANT_CONFIG
  }
  
  const config = raw as any
  const version = (config._version ?? config.version ?? 1) as number
  
  if (version === 1) {
    const v1 = config as TenantConfig
    return {
      _version: 1,
      id: v1.id,
      slug: v1.slug,
      domain: v1.domain,
      name: v1.name,
      theme: v1.theme,
      layout: v1.layout,
      branding: v1.branding || {
        logo: null,
        favicon: null,
        appName: 'App',
        companyName: 'Company',
      },
      features: v1.features,
      version: CURRENT_TENANT_CONFIG_VERSION,
    }
  }
  
  return config as TenantConfig
}

/**
 * Validates a tenant config object.
 */
export function validateTenantConfig(config: unknown): config is TenantConfig {
  if (!config || typeof config !== 'object') return false
  const c = config as Record<string, unknown>
  return (
    typeof c.id === 'string' &&
    typeof c.slug === 'string' &&
    typeof c.domain === 'string' &&
    typeof c.name === 'string' &&
    typeof c.theme === 'object' &&
    typeof c.layout === 'object' &&
    typeof c.branding === 'object' &&
    typeof c.features === 'object'
  )
}
