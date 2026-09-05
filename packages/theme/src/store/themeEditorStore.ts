import { useSyncExternalStore } from "react";
import type { TenantThemeConfig } from "../types";

export interface ThemeEditorState {
  isEditing: boolean;
  draftConfig: TenantThemeConfig | null;
}

let state: ThemeEditorState = {
  isEditing: false,
  draftConfig: null,
};

const listeners = new Set<() => void>();

function syncDOMVariables(draftConfig: TenantThemeConfig | null) {
  if (typeof document === "undefined" || !draftConfig?.tokens?.colors) return;
  const colors = draftConfig.tokens.colors;
  const root = document.documentElement;
  if (colors.primary?.value)
    root.style.setProperty("--mui-palette-primary-main", colors.primary.value);
  if (colors.secondary?.value)
    root.style.setProperty(
      "--mui-palette-secondary-main",
      colors.secondary.value,
    );
  if (colors.background?.value)
    root.style.setProperty(
      "--mui-palette-background-default",
      colors.background.value,
    );
  if (colors.surface?.value)
    root.style.setProperty(
      "--mui-palette-background-paper",
      colors.surface.value,
    );
  if (colors.border?.value)
    root.style.setProperty("--border-color", colors.border.value);
  if (draftConfig.tokens.borderRadius?.md) {
    root.style.setProperty(
      "--border-radius",
      `${draftConfig.tokens.borderRadius.md}px`,
    );
  }
}

function notify() {
  listeners.forEach((listener) => listener());
}

export const themeEditorStore = {
  getState(): ThemeEditorState {
    return state;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  startEditing(initialConfig: TenantThemeConfig) {
    // Callers that just want the editor open - the customize FAB, the widget
    // marketplace - have no config in hand and pass `{} as TenantThemeConfig`.
    // Stored as-is, that empty object is truthy everywhere a draft is tested
    // for, so the editor treated it as a real draft and handed it to code that
    // reasonably expects `tokens` to exist. A draft that carries no tokens is
    // not a draft; keep it null so the tenant's own config stays in play until
    // the first genuine edit.
    const hasConfig = Boolean(initialConfig?.tokens);
    state = {
      isEditing: true,
      draftConfig: hasConfig ? structuredClone(initialConfig) : null,
    };
    syncDOMVariables(state.draftConfig);
    notify();
  },

  setDraftConfig(
    updater:
      | TenantThemeConfig
      | ((prev: TenantThemeConfig | null) => TenantThemeConfig | null),
  ) {
    const nextConfig =
      typeof updater === "function" ? updater(state.draftConfig) : updater;
    state = {
      ...state,
      draftConfig: nextConfig,
    };
    syncDOMVariables(nextConfig);
    notify();
  },

  discardDraft() {
    state = {
      isEditing: false,
      draftConfig: null,
    };
    notify();
  },
};

export function useThemeEditorStore(): ThemeEditorState;
export function useThemeEditorStore<T>(
  selector: (state: ThemeEditorState) => T,
): T;
export function useThemeEditorStore<T>(
  selector?: (state: ThemeEditorState) => T,
): T | ThemeEditorState {
  const current = useSyncExternalStore(
    themeEditorStore.subscribe,
    themeEditorStore.getState,
    themeEditorStore.getState,
  );

  return selector ? selector(current) : current;
}
