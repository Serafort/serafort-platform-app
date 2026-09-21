import { useSyncExternalStore } from "react";
import type { TenantThemeConfig } from "../types";

/**
 * The theme the user has saved, kept where the whole app can read it.
 *
 * Saving used to be a single PUT to `/api/v1/themes/tenant`. That endpoint is
 * the right long-term home, but it left the editor with nothing to fall back
 * on: the draft was discarded on save, `useTenant().theme` carries only the
 * tenant's branding fields (primaryColor, mode, skin - never `tokens`), and so
 * `ThemeBridge` dropped straight back to `DEFAULT_THEME_CONFIG`. Pressing Save
 * therefore *undid* whatever had just been previewed, and a reload never had a
 * theme to restore.
 *
 * This store is that fall-back. It holds one full `TenantThemeConfig` in
 * localStorage, applies before first paint because `ThemeBridge` reads it
 * synchronously, and survives a reload and a new tab. The server save still
 * runs; this is what the app renders from either way.
 */

const STORAGE_KEY = "serafort-theme-config";

/** Bumped when the stored shape changes, so an old entry is dropped, not merged. */
const STORAGE_VERSION = 1;

interface StoredTheme {
  version: number;
  savedAt: string;
  config: TenantThemeConfig;
}

let state: TenantThemeConfig | null = null;
let hydrated = false;

const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const readStorage = (): TenantThemeConfig | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredTheme;
    if (parsed?.version !== STORAGE_VERSION) return null;
    // A config with no tokens is not a config - see the same guard in
    // themeEditorStore.startEditing. Handing one on would make every consumer
    // that reasonably expects `tokens` deal with a half-object.
    if (!parsed?.config?.tokens) return null;
    return parsed.config;
  } catch {
    // Private-mode storage, a quota-cleared entry, or hand-edited JSON. A
    // broken saved theme must never stop the app from rendering.
    return null;
  }
};

const hydrate = () => {
  if (hydrated) return;
  hydrated = true;
  state = readStorage();
};

if (typeof window !== "undefined") {
  hydrate();
  // Another tab saving a theme should re-theme this one too, rather than
  // leaving two windows of the same app disagreeing until one reloads.
  window.addEventListener("storage", (event) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return;
    state = readStorage();
    notify();
  });
}

export const savedThemeStore = {
  /** The saved theme, or null when nothing has been saved on this device. */
  get(): TenantThemeConfig | null {
    hydrate();
    return state;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /**
   * Persist a theme and make it the app's active theme immediately.
   * Returns false when the write failed (private browsing, quota); the theme
   * is still applied for this session so a storage failure never looks like a
   * save that silently did nothing.
   */
  save(config: TenantThemeConfig): boolean {
    hydrate();
    state = config;
    notify();
    if (typeof window === "undefined") return false;
    try {
      const payload: StoredTheme = {
        version: STORAGE_VERSION,
        savedAt: new Date().toISOString(),
        config,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  },

  /** Forget the saved theme; the app falls back to the tenant/default theme. */
  clear(): void {
    hydrate();
    state = null;
    notify();
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to do - the in-memory state is already cleared.
    }
  },
};

const getServerSnapshot = (): TenantThemeConfig | null => null;

/** Subscribe to the saved theme. Null until something has been saved. */
export function useSavedTheme(): TenantThemeConfig | null {
  return useSyncExternalStore(
    savedThemeStore.subscribe,
    savedThemeStore.get,
    getServerSnapshot,
  );
}
