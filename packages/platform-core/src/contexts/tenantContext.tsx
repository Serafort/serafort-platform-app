import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import TenantService from '../services/tenantService'
import { themeService } from '../services/theme/theme.service'
import { useSettings, setTenantId } from '@cap/platform-store'
import type { TenantConfig, UserPreferences, TenantContextValue, TenantThemeBase, TenantModule } from '../types/tenant'
import { DEFAULT_THEME_CONFIG } from '@cap/theme'
import type { TenantThemeConfig } from '@cap/theme'
import { normalizeTenantConfig } from '../types/tenant'

declare global {
  interface Window {
    __TENANT_CONFIG__?: TenantConfig | null
  }
}

export const DEFAULT_TENANT_CONTEXT_VALUE: TenantContextValue = {
  tenant: null,
  theme: DEFAULT_THEME_CONFIG as any,
  isLoading: false,
  error: null,
  isLoadingTheme: false,
  errorTheme: null,
  userPreferences: {},
  updateUserPreferences: async () => {},
  refetchTenant: async () => {},
  refetchTheme: async () => {},
  updateTheme: async () => {},
  saveTheme: async () => {},
  saveModules: async () => {},
  isModuleEnabled: () => true,
}

const TenantContext = createContext<TenantContextValue>(DEFAULT_TENANT_CONTEXT_VALUE)

interface TenantProviderProps {
  children: React.ReactNode
}

const defaultUserPreferences: UserPreferences = {}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [tenant, setTenant] = useState<TenantConfig | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingTheme, setIsLoadingTheme] = useState<boolean>(false)
  const [errorTheme, setErrorTheme] = useState<string | null>(null)
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(defaultUserPreferences)

  const { updateSettings } = useSettings()

  const applyTenantConfig = useCallback((config: TenantConfig | null) => {
    if (!config) return
    
    const normalized = normalizeTenantConfig(config)
    setTenant(normalized)
    setTenantId(normalized.id)
    updateSettings({
      primaryColor: normalized.theme?.primaryColor,
      layout: normalized.layout?.layout as any,
      mode: normalized.theme?.mode,
      skin: normalized.theme?.skin,
      semiDark: normalized.theme?.semiDark
    })
  }, [updateSettings])

  const loadTenant = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const inlineConfig = (window as any).__TENANT_CONFIG__
      if (inlineConfig) {
        applyTenantConfig(inlineConfig)
        setIsLoading(false)
        return
      }
      
      const config = await TenantService.fetchTenant()
      applyTenantConfig(config)
    } catch (err) {
      console.error('[TenantProvider] Failed to load tenant:', err)
      setError(err instanceof Error ? err.message : 'Failed to load tenant configuration')
    } finally {
      setIsLoading(false)
    }
  }, [applyTenantConfig])

  useEffect(() => {
    const prefs = TenantService.getUserPreferences()
    setUserPreferences(prefs)
    loadTenant()
  }, [loadTenant])

  useEffect(() => {
    if (!tenant || isLoading) return

    const refreshTenant = async () => {
      if (document.visibilityState === 'visible') {
        const hasUpdate = await TenantService.checkForUpdates()
        if (hasUpdate) {
          await loadTenant()
        }
      }
    }

    document.addEventListener('visibilitychange', refreshTenant)
    return () => document.removeEventListener('visibilitychange', refreshTenant)
  }, [tenant, isLoading, loadTenant])

  const updateUserPreferences = useCallback((prefs: Partial<UserPreferences>) => {
    const updated = { ...userPreferences, ...prefs }
    TenantService.setUserPreferences(updated)
    setUserPreferences(updated)
  }, [userPreferences])

  const refetchTenant = useCallback(async () => {
    TenantService.clearCache()
    await loadTenant()
  }, [loadTenant])

  const updateTheme = useCallback(async (updates: Partial<TenantThemeBase>) => {
    if (!tenant) return

    setTenant(prev => {
      if (!prev) return null
      return {
        ...prev,
        theme: {
          ...prev.theme,
          ...updates
        }
      }
    })

    // Sync with settings store if relevant
    if (updates.mode || updates.primaryColor || updates.skin || updates.semiDark) {
      updateSettings({
        mode: updates.mode,
        primaryColor: updates.primaryColor,
        skin: updates.skin,
        semiDark: updates.semiDark
      })
    }
  }, [tenant, updateSettings])

  const saveTheme = useCallback(async (themeToSave: any) => {
    setIsLoadingTheme(true)
    setErrorTheme(null)
    try {
      const organizationId = tenant?.id || DEFAULT_THEME_CONFIG.organizationId
      let themePayload: TenantThemeConfig

      // If themeToSave is already a full TenantThemeConfig (from ThemeEditor or ThemeBridge)
      if (themeToSave?.tokens?.colors || themeToSave?.effects || themeToSave?.components) {
        themePayload = {
          ...DEFAULT_THEME_CONFIG,
          ...themeToSave,
          organizationId: themeToSave.organizationId || organizationId,
        }
      } else {
        themePayload = {
          ...DEFAULT_THEME_CONFIG,
          organizationId,
          name: tenant?.name ? `${tenant.name} Theme` : DEFAULT_THEME_CONFIG.name,
          metadata: {
            ...DEFAULT_THEME_CONFIG.metadata,
            mode: themeToSave?.mode || 'light',
          },
          tokens: {
            ...DEFAULT_THEME_CONFIG.tokens,
            colors: {
              ...DEFAULT_THEME_CONFIG.tokens.colors,
              primary: {
                ...DEFAULT_THEME_CONFIG.tokens.colors.primary,
                value: themeToSave?.primaryColor || DEFAULT_THEME_CONFIG.tokens.colors.primary.value,
              },
              secondary: {
                ...DEFAULT_THEME_CONFIG.tokens.colors.secondary,
                value: themeToSave?.secondaryColor || DEFAULT_THEME_CONFIG.tokens.colors.secondary.value,
              },
            },
          },
        }
      }

      await themeService.saveTheme(themePayload)
      // Update local state to reflect the saved theme
      setTenant(prev => {
        if (!prev) return null
        return {
          ...prev,
          theme: {
            mode: themePayload.metadata?.mode || 'light',
            primaryColor: themePayload.tokens?.colors?.primary?.value || '#2463EB',
            secondaryColor: themePayload.tokens?.colors?.secondary?.value || '#475569',
            skin: prev.theme?.skin || 'default',
            semiDark: prev.theme?.semiDark ?? false,
          },
        }
      })
    } catch (err) {
      console.error('[TenantProvider] Failed to save theme:', err)
      setErrorTheme(err instanceof Error ? err.message : 'Failed to save theme')
      throw err
    } finally {
      setIsLoadingTheme(false)
    }
  }, [tenant])

  const refetchTheme = useCallback(async () => {
    await refetchTenant()
  }, [refetchTenant])

  const saveModules = useCallback(async (modulesToSave: TenantModule[]) => {
    setTenant(prev => {
      if (!prev) return null
      const updated = { ...prev, modules: modulesToSave }
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
      TenantService.setCache(hostname, updated)
      return updated
    })
  }, [])

  const isModuleEnabled = useCallback((moduleId: string) => {
    if (!tenant?.modules) return true
    const mod = tenant.modules.find(m => m.id === moduleId)
    return mod ? mod.status === 'enabled' : true
  }, [tenant])

  const value = useMemo<TenantContextValue>(() => ({
    tenant,
    theme: tenant?.theme || null,
    isLoading,
    error,
    isLoadingTheme,
    errorTheme,
    userPreferences,
    updateUserPreferences,
    refetchTenant,
    refetchTheme,
    updateTheme,
    saveTheme,
    saveModules,
    isModuleEnabled,
  }), [tenant, isLoading, error, isLoadingTheme, errorTheme, userPreferences, updateUserPreferences, refetchTenant, refetchTheme, updateTheme, saveTheme, saveModules, isModuleEnabled])

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

export const useTenant = (): TenantContextValue => {
  const context = useContext(TenantContext)
  return context || DEFAULT_TENANT_CONTEXT_VALUE
}

export default TenantContext
