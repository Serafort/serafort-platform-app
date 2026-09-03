import { apiClient, ENDPOINTS } from '@cap/platform-store'
import type { TenantConfig, UserPreferences } from '../types/tenant'
import { DEFAULT_TENANT_CONFIG, DEFAULT_TENANT_THEME } from '../types/tenant'

const TENANT_CACHE_KEY = 'tenant-config-cache'
const TENANT_VERSION_KEY = 'tenant-version'
const USER_PREFERENCES_KEY = 'user-preferences'
const CACHE_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes

interface CachedTenant {
  config: TenantConfig
  timestamp: number
  domain: string
}

interface TenantCache {
  [domain: string]: CachedTenant
}

const mockTenants: Record<string, TenantConfig> = {
  localhost: {
    _version: 1,
    id: 'default',
    slug: 'default',
    domain: 'localhost',
    name: 'Default Tenant',
    theme: {
      ...DEFAULT_TENANT_THEME,
      mode: 'light',
      skin: 'default',
      semiDark: false,
      primaryColor: '#1976D2',
      secondaryColor: '#455A64',
    },
    layout: {
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
      footer: { type: 'static', contentWidth: 'compact', detached: true },
      contentWidth: 'compact',
      disableRipple: false,
      toastPosition: 'top-right',
    },
    branding: {
      appName: 'Acme Dashboard',
      companyName: 'Acme Corporation',
      welcomeText: 'Welcome to Acme Corp',
    },
    features: {
      darkMode: true,
      rtl: false,
      notifications: true,
      chat: true,
      enabledAuthPlugins: [],
    },
    version: 1,
  },
  '127.0.0.1': {
    _version: 1,
    id: 'default',
    slug: 'default',
    domain: '127.0.0.1',
    name: 'Default Tenant',
    theme: {
      ...DEFAULT_TENANT_THEME,
      mode: 'light',
      skin: 'default',
      semiDark: false,
      primaryColor: '#1976D2',
      secondaryColor: '#455A64',
    },
    layout: {
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
      footer: { type: 'static', contentWidth: 'compact', detached: true },
      contentWidth: 'compact',
      disableRipple: false,
      toastPosition: 'top-right',
    },
    branding: {
      appName: 'Acme Dashboard',
      companyName: 'Acme Corporation',
      welcomeText: 'Welcome to Acme Corp',
    },
    features: {
      darkMode: true,
      rtl: false,
      notifications: true,
      chat: true,
      enabledAuthPlugins: ['mfa-totp'],
    },
    version: 1,
  },
  'tenant1.localhost': {
    _version: 1,
    id: 'tenant1',
    slug: 'tenant1',
    domain: 'tenant1.localhost',
    name: 'Acme Corp',
    theme: {
      ...DEFAULT_TENANT_THEME,
      mode: 'light',
      skin: 'default',
      semiDark: false,
      primaryColor: '#1976D2',
      secondaryColor: '#455A64',
    },
    layout: {
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
      footer: { type: 'static', contentWidth: 'compact', detached: true },
      contentWidth: 'compact',
      disableRipple: false,
      toastPosition: 'top-right',
    },
    branding: {
      appName: 'Acme Dashboard',
      companyName: 'Acme Corporation',
      welcomeText: 'Welcome to Acme Corp',
    },
    features: {
      darkMode: true,
      rtl: false,
      notifications: true,
      chat: true,
      enabledAuthPlugins: ['mfa-totp'],
    },
    version: 1,
  },
  'tenant2.localhost': {
    _version: 1,
    id: 'tenant2',
    slug: 'tenant2',
    domain: 'tenant2.localhost',
    name: 'TechStart Inc',
    theme: {
      ...DEFAULT_TENANT_THEME,
      mode: 'dark',
      skin: 'bordered',
      semiDark: true,
      primaryColor: '#7C4DFF',
      secondaryColor: '#00BCD4',
    },
    layout: {
      layout: 'horizontal',
      layoutPadding: 0,
      compactContentWidth: 1200,
      navbar: {
        type: 'fixed',
        contentWidth: 'wide',
        floating: false,
        detached: false,
        blur: false,
      },
      footer: { type: 'fixed', contentWidth: 'wide', detached: false },
      contentWidth: 'wide',
      disableRipple: true,
      toastPosition: 'bottom-right',
    },
    branding: {
      appName: 'TechStart Portal',
      companyName: 'TechStart Inc',
      welcomeText: 'Innovate with TechStart',
    },
    features: {
      darkMode: true,
      rtl: false,
      notifications: true,
      chat: false,
      enabledAuthPlugins: [],
    },
    version: 1,
  },
  'tenant3.localhost': {
    _version: 1,
    id: 'tenant3',
    slug: 'tenant3',
    domain: 'tenant3.localhost',
    name: 'Green Eco',
    theme: {
      ...DEFAULT_TENANT_THEME,
      mode: 'light',
      skin: 'default',
      semiDark: false,
      primaryColor: '#2E7D32',
      secondaryColor: '#00897B',
    },
    layout: {
      layout: 'collapsed',
      layoutPadding: 0,
      compactContentWidth: 1366,
      navbar: {
        type: 'static',
        contentWidth: 'compact',
        floating: false,
        detached: true,
        blur: false,
      },
      footer: { type: 'static', contentWidth: 'compact', detached: true },
      contentWidth: 'compact',
      disableRipple: false,
      toastPosition: 'top-left',
    },
    branding: {
      appName: 'Green Eco Dashboard',
      companyName: 'Green Eco Solutions',
      welcomeText: 'Go Green with Us',
    },
    features: {
      darkMode: false,
      rtl: false,
      notifications: true,
      chat: true,
      enabledAuthPlugins: [],
    },
    version: 1,
  },
}

export class TenantService {
  private static getCurrentHostname(): string {
    if (typeof window === 'undefined') return 'localhost'
    return window.location.hostname
  }

  static isDevelopment(): boolean {
    const isTest = Boolean(
      (import.meta as any).env?.MODE === 'test' ||
      (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test'),
    )
    if (isTest) return true
    return Boolean(
      (import.meta as any).env?.DEV &&
      (import.meta as any).env?.VITE_ENABLE_MOCK_TENANTS !== 'false',
    )
  }

  static getTenantFromHostname(): string {
    const hostname = this.getCurrentHostname()

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'default'
    }

    const parts = hostname.split('.')
    if (parts.length >= 2 && parts[0] !== 'www') {
      return parts[0]
    }

    return 'default'
  }

  static getCache(): TenantCache {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return {}
      const cached = localStorage.getItem(TENANT_CACHE_KEY)
      return cached ? JSON.parse(cached) : {}
    } catch {
      return {}
    }
  }

  static setCache(domain: string, config: TenantConfig): void {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return
      const cache = this.getCache()
      cache[domain] = {
        config,
        timestamp: Date.now(),
        domain,
      }
      localStorage.setItem(TENANT_CACHE_KEY, JSON.stringify(cache))
    } catch (error) {
      console.error('[TenantService] Failed to cache tenant config:', error)
    }
  }

  static getCachedTenant(domain: string): TenantConfig | null {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null
      const cache = this.getCache()
      const cached = cache[domain]

      if (!cached) return null

      if (Date.now() - cached.timestamp > CACHE_EXPIRY_MS) {
        delete cache[domain]
        localStorage.setItem(TENANT_CACHE_KEY, JSON.stringify(cache))
        return null
      }

      return cached.config
    } catch {
      return null
    }
  }

  /**
   * Independently verifies whether an authentication plugin/feature (e.g. 'mfa-totp')
   * is enabled for the specified tenant configuration.
   */
  static isAuthPluginEnabledForTenant(
    config: TenantConfig | null | undefined,
    pluginId: string,
  ): boolean {
    if (!config || !config.features || !Array.isArray(config.features.enabledAuthPlugins)) {
      return false
    }
    return config.features.enabledAuthPlugins.includes(pluginId)
  }

  /**
   * Backend tenant feature verification check.
   * Independently checks if a specific auth feature/plugin is enabled for a given domain/tenant.
   */
  static verifyTenantAuthFeature(domainOrHostname?: string, pluginId?: string): boolean {
    if (!pluginId) return false
    const domain = domainOrHostname || this.getCurrentHostname()
    const cachedConfig = this.getCachedTenant(domain)

    if (cachedConfig) {
      return this.isAuthPluginEnabledForTenant(cachedConfig, pluginId)
    }

    if (this.isDevelopment() && mockTenants[domain]) {
      return this.isAuthPluginEnabledForTenant(mockTenants[domain], pluginId)
    }

    return this.isAuthPluginEnabledForTenant(DEFAULT_TENANT_CONFIG, pluginId)
  }

  static async fetchTenant(_tenantSlug?: string): Promise<TenantConfig> {
    const domain = this.getCurrentHostname()

    // 1. Try Cache
    const cached = this.getCachedTenant(domain)
    if (cached) {
      console.log('[TenantService] Using cached tenant config for:', domain)
      return cached
    }

    // 2. Try Backend API (Primary Source of truth for per-tenant branding)
    try {
      const response = await apiClient.get<TenantConfig>(ENDPOINTS.guest.tenantConfig, {
        params: { domain },
      })

      if (response.data) {
        const config = response.data
        console.log('[TenantService] Successfully fetched tenant config from backend:', domain)
        this.setCache(domain, config)
        return config
      }

      console.warn(`[TenantService] Backend returned null data for ${domain}, checking mocks...`)
    } catch (error) {
      console.error('[TenantService] Network error fetching tenant config:', error)
    }

    // 3. Fallback to Mocks (Development only)
    if (this.isDevelopment() && mockTenants[domain]) {
      console.log('[TenantService] Using mock tenant config for:', domain)
      const mockConfig = mockTenants[domain]
      this.setCache(domain, mockConfig)
      return mockConfig
    }

    // 4. Ultimate Fallback
    console.warn('[TenantService] No backend or mock config available, using default')
    return DEFAULT_TENANT_CONFIG
  }

  static async checkForUpdates(): Promise<boolean> {
    const domain = this.getCurrentHostname()
    const cache = this.getCache()
    const cached = cache[domain]

    if (!cached) return false

    try {
      const slug = this.getTenantFromHostname()
      const response = await apiClient.get<any>(`/tenants/${slug}/version`)

      if (response.data) {
        const { version } = response.data
        if (version !== cached.config.version) {
          console.log('[TenantService] New tenant version available:', version)
          return true
        }
      }
    } catch {
      // Silently fail - will use cached version
    }

    return false
  }

  static clearCache(): void {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem(TENANT_CACHE_KEY)
        localStorage.removeItem(TENANT_VERSION_KEY)
      }
    } catch {
      // Ignore storage cleanup failures in headless/SSR environments
    }
  }

  static getUserPreferences(): UserPreferences {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return {}
      const stored = localStorage.getItem(USER_PREFERENCES_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  static setUserPreferences(prefs: UserPreferences): void {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return
      const current = this.getUserPreferences()
      localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify({ ...current, ...prefs }))
    } catch (error) {
      console.error('[TenantService] Failed to save user preferences:', error)
    }
  }
}

export default TenantService
