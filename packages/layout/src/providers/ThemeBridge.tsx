import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import GlobalStyles from '@mui/material/GlobalStyles'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider as MuiThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import { useSettings } from '@cap/platform-store'
import { useTenant } from '@cap/platform-core'
import {
  composeMuiThemeMemoized,
  TenantThemeProvider,
  ThemeSettingsProvider,
  applyThemeVariablesSync,
  useThemeEditorStore,
  headerTokens,
  footerTokens,
  DEFAULT_THEME_CONFIG,
} from '@cap/theme'
import type { TenantThemeConfig } from '@cap/theme'
import type { Settings, Mode, SystemMode } from '@cap/shared-types'

/**
 * Hook to resolve mode including system prefers-color-scheme
 */
const useResolvedSystemMode = (mode: Mode = 'light'): SystemMode => {
  const [systemPref, setSystemPref] = useState<SystemMode>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => setSystemPref(e.matches ? 'dark' : 'light')
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  if (mode === 'system') return systemPref
  return mode as SystemMode
}

/**
 * Generator function that compiles the MUI theme based on tenant overrides
 */
export const generateTheme = (
  tenantConfig: TenantThemeConfig | null,
  settings: Settings,
  isDark: boolean,
) => {
  return composeMuiThemeMemoized({
    currentMode: isDark ? 'dark' : 'light',
    settings,
    tenantTheme: tenantConfig,
  })
}

/**
 * ThemeBridge injects CSS custom properties and provides the dynamic MUI Theme
 * based on the current tenant's context.
 */
export const ThemeBridge = ({ children }: { children: React.ReactNode }) => {
  const {
    theme: tenantConfig,
    isLoadingTheme,
    errorTheme,
    refetchTheme,
    updateTheme,
    saveTheme,
  } = useTenant()

  const isEditing = useThemeEditorStore((s) => s.isEditing)
  const draftConfig = useThemeEditorStore((s) => s.draftConfig)
  const deferredDraft = React.useDeferredValue(draftConfig)

  const activeConfig = isEditing && deferredDraft ? deferredDraft : tenantConfig

  const { settings } = useSettings()

  const resolvedMode = useResolvedSystemMode(settings.mode)
  const isDark = resolvedMode === 'dark'

  // CSS custom property application is coalesced through requestAnimationFrame
  // so rapid config changes (e.g. slider drags in the ThemeEditor) produce a
  // single DOM write pass per animation frame instead of one synchronous flush
  // per keystroke/tick. Only the latest config is applied on flush.
  const latestConfigRef = useRef<TenantThemeConfig | null>(null)
  const themeVarsRafRef = useRef<number | null>(null)

  const applyThemeVarsBatched = useCallback((config: TenantThemeConfig) => {
    latestConfigRef.current = config
    if (themeVarsRafRef.current !== null) return
    themeVarsRafRef.current = window.requestAnimationFrame(() => {
      themeVarsRafRef.current = null
      const cfg = latestConfigRef.current
      if (cfg) {
        try {
          applyThemeVariablesSync(cfg)
        } catch {
          // Fallback gracefully if DOM is not ready
        }
      }
    })
  }, [])

  useEffect(() => {
    return () => {
      if (themeVarsRafRef.current !== null) {
        window.cancelAnimationFrame(themeVarsRafRef.current)
        themeVarsRafRef.current = null
      }
    }
  }, [])

  // `useTenant()`'s `theme` field is the tenant's lightweight branding
  // override ({ primaryColor, logoUrl } - see TenantConfig['theme'] in
  // platform-core), not a full TenantThemeConfig (tokens/effects/components).
  // It's still truthy whenever a tenant loaded, so `tenantTheme || DEFAULT`
  // never actually reaches the default: composeMuiThemeMemoized tolerates
  // this by falling back field-by-field (tokens, effects, ... each default
  // independently when missing), which is why the JS palette still renders
  // correctly. applyThemeVariablesSync has no such per-field fallback - fed
  // this shape, it doesn't recognise `.tokens`, silently no-ops, and every
  // --color-*/--effect-* custom property stays unset for the entire session.
  // Resolve once, up front, so both consumers see the same real config.
  const resolvedThemeConfig: TenantThemeConfig =
    activeConfig && 'tokens' in activeConfig
      ? (activeConfig as TenantThemeConfig)
      : DEFAULT_THEME_CONFIG

  const theme = useMemo(() => {
    const compiled = generateTheme(resolvedThemeConfig, settings, isDark)
    if (typeof window !== 'undefined') {
      applyThemeVarsBatched(resolvedThemeConfig)
    }
    return compiled
  }, [resolvedThemeConfig, settings, isDark, applyThemeVarsBatched])

  const handleUpdateTheme = useCallback(
    async (updates: any) => {
      if (tenantConfig) {
        await updateTheme({ ...(tenantConfig as any), ...updates })
      } else {
        await updateTheme(updates as any)
      }
    },
    [tenantConfig, updateTheme],
  )

  const handleSaveTheme = useCallback(
    async (updatedConfig: any) => {
      if (tenantConfig) {
        await saveTheme({ ...(tenantConfig as any), ...updatedConfig })
      } else {
        await saveTheme(updatedConfig as any)
      }
    },
    [tenantConfig, saveTheme],
  )

  return (
    <StyledEngineProvider injectFirst>
      <ThemeSettingsProvider settings={settings}>
        <TenantThemeProvider
          theme={activeConfig as any}
          isLoading={isLoadingTheme}
          error={errorTheme}
          refetch={refetchTheme}
          updateTheme={handleUpdateTheme}
          saveTheme={handleSaveTheme}
        >
          <MuiThemeProvider theme={theme}>
            <CssBaseline />
            <GlobalStyles
              styles={(theme) => ({
                ':root': {
                  // Core Layout Variables derived from MUI theme
                  '--border-color': theme.palette.divider,
                  '--border-radius': `${theme.shape.borderRadius}px`,

                  // Derived Background Variables
                  '--background-color-rgb':
                    'var(--color-background-h) var(--color-background-s) var(--color-background-l)',
                  '--backdrop-color':
                    'hsl(var(--color-background-h) var(--color-background-s) var(--color-background-l) / 0.6)',

                  // Z-Index Layers (Source of Truth)
                  '--header-z-index': String(theme.zIndex.appBar),
                  '--drawer-z-index': String(theme.zIndex.drawer),
                  '--footer-z-index': String(footerTokens.positioning.defaultZIndex),
                  '--z-behind': '-1',

                  // Layout Constants
                  '--header-height': headerTokens.layout.minBlockSize,
                },
              })}
            />
            {children}
          </MuiThemeProvider>
        </TenantThemeProvider>
      </ThemeSettingsProvider>
    </StyledEngineProvider>
  )
}

export default ThemeBridge
