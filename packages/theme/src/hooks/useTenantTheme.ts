import { useMemo, useCallback } from 'react';
import type { TenantThemeConfig } from '../types';
import {
  useTenantThemeState,
  useTenantThemeStatus,
  useTenantThemeActions
} from '../context/TenantThemeContext';
import type { ThemePresetId } from '../types/presets';
import { applyPreset } from '../utils/mergeTheme';
import { DEFAULT_THEME_CONFIG } from '../types';



interface UseTenantThemeReturn {
  theme: TenantThemeConfig;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateTheme: (updates: Partial<TenantThemeConfig>) => void;
  applyPresetById: (presetId: ThemePresetId) => void;
  resetToDefault: () => void;
  saveTheme: () => Promise<void>;
}

export const useTenantTheme = (): UseTenantThemeReturn => {
  const { theme } = useTenantThemeState();
  const { isLoading, error } = useTenantThemeStatus();
  const { refetch, updateTheme, saveTheme: contextSaveTheme } = useTenantThemeActions();

  // For convenience, we map isLoading to isSaving when saveTheme is called
  const isSaving = isLoading;

  const applyPresetById = useCallback((presetId: ThemePresetId) => {
    const presetTheme = applyPreset(presetId);
    if (theme) {
      void updateTheme({
        ...presetTheme,
        organizationId: theme.organizationId,
      } as Partial<TenantThemeConfig>);
    }
  }, [theme, updateTheme]);

  const resetToDefault = useCallback(() => {
    if (theme) {
      void updateTheme({
        ...DEFAULT_THEME_CONFIG,
        organizationId: theme.organizationId,
      } as Partial<TenantThemeConfig>);
    }
  }, [theme, updateTheme]);

  const saveTheme = useCallback(async () => {
    if (theme) {
      await contextSaveTheme(theme);
    }
  }, [theme, contextSaveTheme]);

  const currentTheme = theme || DEFAULT_THEME_CONFIG;

  return useMemo(() => ({
    theme: currentTheme,
    isLoading,
    isSaving,
    error,
    refetch,
    updateTheme,
    applyPresetById,
    resetToDefault,
    saveTheme,
  }), [currentTheme, isLoading, isSaving, error, refetch, updateTheme, applyPresetById, resetToDefault, saveTheme]);
};

export default useTenantTheme;
