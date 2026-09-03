import React, { createContext, useContext, useMemo } from 'react'
import type { Settings } from '@cap/shared-types'
import { DEFAULT_THEME_CONFIG } from '../types'

const DEFAULT_THEME_SETTINGS: Required<Settings> = {
  mode: 'light',
  skin: 'default',
  effect: 'standard',
  semiDark: false,
  layout: 'vertical',
  navbarContentWidth: 'compact',
  contentWidth: 'compact',
  footerContentWidth: 'compact',
  primaryColor: DEFAULT_THEME_CONFIG.tokens.colors.primary.value,
}

const ThemeSettingsContext = createContext<Required<Settings>>(DEFAULT_THEME_SETTINGS)

export const ThemeSettingsProvider = ({
  children,
  settings,
}: {
  children: React.ReactNode
  settings?: Settings
}) => {
  const value = useMemo(
    () => ({
      ...DEFAULT_THEME_SETTINGS,
      ...settings,
    }),
    [settings],
  )

  return <ThemeSettingsContext.Provider value={value}>{children}</ThemeSettingsContext.Provider>
}

export const useThemeSettings = () => useContext(ThemeSettingsContext)

export { DEFAULT_THEME_SETTINGS }
