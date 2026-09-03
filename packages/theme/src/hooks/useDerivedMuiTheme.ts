import { useMemo, useEffect, useState } from 'react';
import type { Theme } from '@mui/material/styles';
import { useTenantThemeState } from '../context/TenantThemeContext';
import { composeMuiTheme } from '../utils/composeMuiTheme';
import { useThemeSettings } from '../context/ThemeSettingsContext';

import { DEFAULT_THEME_CONFIG } from '../types';

export const useDerivedMuiTheme = (): Theme => {
  const { theme: tenantTheme } = useTenantThemeState();
  const settings = useThemeSettings();
  const [systemIsDark, setSystemIsDark] = useState(false);

  // Sync with system preference if needed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setSystemIsDark(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  const isDark = settings.mode === 'dark' || (settings.mode === 'system' && systemIsDark);

  // Create a stable key for memoization based on core design tokens.
  // This prevents re-creating the MUI theme object if only metadata or non-visual props changed.
  const themeTokensKey = useMemo(() => {
    // If tenant theme is entirely missing, use a minimal default key
    if (!tenantTheme) return `default-${isDark}-${settings.primaryColor}`;

    // Defensive access to tokens and inner properties to prevent crashes during hydration/sync
    const rootTokens = tenantTheme.tokens || DEFAULT_THEME_CONFIG.tokens;
    const { colors, typography, borderRadius } = rootTokens;
    const effects = tenantTheme.effects || DEFAULT_THEME_CONFIG.effects;
    const components = tenantTheme.components || DEFAULT_THEME_CONFIG.components;

    return JSON.stringify({
      colors,
      typography,
      borderRadius,
      effects,
      components,
      isDark,
      primaryColor: settings.primaryColor
    });
  }, [tenantTheme, isDark, settings.primaryColor]);

  return useMemo(() => {
    return composeMuiTheme({
      currentMode: isDark ? 'dark' : 'light',
      settings,
      tenantTheme,
    });
  }, [themeTokensKey, settings, tenantTheme, isDark]); // Use the stable key for memoization
};
