import type { StateCreator } from "zustand";
import type { AppStore } from "../../types";

import type {
  Mode,
  Skin,
  Layout,
  LayoutComponentWidth,
} from "@cap/shared-types";
import { readSettingsCookie, writeSettingsCookie } from "./settingsCookie";

export interface Settings {
  mode: Mode;
  skin: Skin;
  semiDark: boolean;
  layout: Layout;
  navbarContentWidth: LayoutComponentWidth;
  contentWidth: LayoutComponentWidth;
  footerContentWidth: LayoutComponentWidth;
  primaryColor: string;
}

export type LayoutOverride =
  | "public"
  | "admin"
  | "vertical"
  | "horizontal"
  | "noLayout"
  | "none";

export interface SettingsSlice {
  mode: Mode;
  settings: Settings;
  isSettingsChanged: boolean;
  layoutOverride: LayoutOverride;
  updateSettings: (settings: Partial<Settings>) => void;
  resetSettings: () => void;
  updatePageSettings: (settings: Partial<Settings>) => () => void;
  updateLayoutOverride: (layout: LayoutOverride) => void;
  toggleColorMode: () => void;
  setMode: (mode: Mode) => void;
}

// Mirrors the defaults in @cap/theme's `themeConfig` (config/themeConfig.ts), inlined
// here so this Tier-1 store slice does not import @cap/theme (another Tier-1 package) —
// that cross-import formed a real require cycle (theme -> platform-store -> theme).
// Keep these in sync with themeConfig if its defaults change.
const defaultSettings: Settings = {
  mode: "light",
  skin: "default",
  semiDark: false,
  layout: "vertical",
  navbarContentWidth: "compact",
  contentWidth: "compact",
  footerContentWidth: "compact",
  primaryColor: "#047BFA", // Serafort brand blue
};

/**
 * The persisted store is the source of truth, but it hydrates asynchronously
 * from encrypted storage. Seeding from the cookie means the very first render
 * already matches what the anti-flash script painted, instead of rendering
 * light and then snapping to dark once hydration lands.
 */
const initialSettings = (): Settings => {
  const fromCookie = readSettingsCookie<Settings>();
  return { ...defaultSettings, ...fromCookie };
};

export const createSettingsSlice: StateCreator<
  AppStore,
  [
    ["zustand/immer", never],
    ["zustand/devtools", never],
    ["zustand/persist", unknown],
  ],
  [],
  SettingsSlice
> = (set, get) => ({
  mode: initialSettings().mode,
  settings: initialSettings(),
  isSettingsChanged: false,
  layoutOverride: "none",

  updateSettings: (newSettings: Partial<Settings>) => {
    // Drop keys whose value is `undefined`. Callers legitimately build partial
    // updates by optional chaining - `{ mode: config.theme?.mode }` in
    // tenantContext's applyTenantConfig, for one - and spreading an explicit
    // `undefined` overwrites a real setting instead of leaving it alone. That
    // is how a tenant config with no `mode` used to silently wipe the user's
    // colour mode, forcing the whole shell back to light.
    const patch = Object.fromEntries(
      Object.entries(newSettings).filter(([, value]) => value !== undefined),
    ) as Partial<Settings>;

    if (Object.keys(patch).length === 0) return;

    set((state) => {
      // Sync root mode if it's being updated in settings
      if (patch.mode) {
        state.mode = patch.mode;
      }

      // Update settings
      state.settings = { ...state.settings, ...patch };

      // Update change detection
      const keys = Object.keys(defaultSettings) as (keyof Settings)[];
      state.isSettingsChanged = keys.some(
        (k) => defaultSettings[k] !== state.settings[k],
      );

      // Mirror to the cookie so the next load's anti-flash script and the
      // synchronous getMode()/getSkin() helpers see the same values.
      writeSettingsCookie(state.settings);
    });
  },

  resetSettings: () => {
    set({
      settings: defaultSettings,
      isSettingsChanged: false,
    });
    writeSettingsCookie(defaultSettings);
  },

  updatePageSettings: (newSettings: Partial<Settings>) => {
    const currentSettings = get().settings;
    get().updateSettings(newSettings);

    return () => {
      set({ settings: currentSettings });
    };
  },

  updateLayoutOverride: (layout: LayoutOverride) => {
    set((state) => {
      state.layoutOverride = layout;
    });
  },

  toggleColorMode: () => {
    const currentMode = get().settings.mode;
    const newMode = currentMode === "light" ? "dark" : "light";
    get().updateSettings({ mode: newMode });
  },

  setMode: (mode: Mode) => {
    get().updateSettings({ mode });
  },
});
