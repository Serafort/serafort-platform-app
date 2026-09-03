import { useState, useCallback, useMemo, useEffect } from 'react';
import type { TenantThemeConfig, ThemePresetId } from '../types';
import { useTenantThemeState, useTenantThemeActions } from '../context/TenantThemeContext';
import { mergeDeep, applyPreset } from '../utils/mergeTheme';
import { DEFAULT_THEME_CONFIG } from '../types';

interface UseThemeCustomizerReturn {
  localDraft: TenantThemeConfig;
  isDirty: boolean;
  isSaving: boolean;
  applyDraftUpdate: (updates: Partial<TenantThemeConfig>) => void;
  applyDraftPreset: (presetId: ThemePresetId) => void;
  resetDraft: () => void;
  commitDraft: () => Promise<void>;
}

export const useThemeCustomizer = (): UseThemeCustomizerReturn => {
  const { theme } = useTenantThemeState();
  const { updateTheme, saveTheme: contextSaveTheme } = useTenantThemeActions();

  const currentTheme = theme ?? DEFAULT_THEME_CONFIG;

  const [localDraft, setLocalDraft] = useState<TenantThemeConfig>(currentTheme);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalDraft(currentTheme);
  }, [currentTheme]);

  const isDirty = useMemo(() => {
    return JSON.stringify(localDraft) !== JSON.stringify(currentTheme);
  }, [localDraft, currentTheme]);

  const applyDraftUpdate = useCallback((updates: Partial<TenantThemeConfig>) => {
    setLocalDraft((prev) => mergeDeep({ ...prev }, updates));
  }, []);

  const applyDraftPreset = useCallback((presetId: ThemePresetId) => {
    const presetTheme = applyPreset(presetId);
    setLocalDraft((prev) =>
      mergeDeep({ ...prev }, {
        ...presetTheme,
        organizationId: prev.organizationId,
        id: prev.id,
        metadata: prev.metadata,
      })
    );
  }, []);

  const resetDraft = useCallback(() => {
    setLocalDraft(currentTheme);
  }, [currentTheme]);

  const commitDraft = useCallback(async () => {
    if (!isDirty) return;

    setIsSaving(true);
    try {
      await updateTheme(localDraft);
      await contextSaveTheme(localDraft);
    } finally {
      setIsSaving(false);
    }
  }, [isDirty, localDraft, updateTheme, contextSaveTheme]);

  return {
    localDraft,
    isDirty,
    isSaving,
    applyDraftUpdate,
    applyDraftPreset,
    resetDraft,
    commitDraft,
  };
};

export default useThemeCustomizer;
