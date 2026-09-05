import { produce } from "immer";
import type { TenantThemeConfig } from "../types";
import { DEFAULT_THEME_CONFIG } from "../types";
import { THEME_PRESETS } from "../types/presets";
import type { ThemePresetId } from "../types/presets";
import { LIGHT_SURFACE_THRESHOLD, lightnessOf } from "./colorLightness";

export const mergeDeep = <T extends Record<string, unknown>>(
  target: T,
  ...sources: Partial<T>[]
): T => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(
          target[key] as Record<string, unknown>,
          source[key] as Record<string, unknown>,
        );
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
};

const isObject = (item: unknown): item is Record<string, unknown> => {
  return item !== null && typeof item === "object" && !Array.isArray(item);
};

/**
 * The light/dark mode a preset was authored for, read from the background it
 * shows on its own card.
 *
 * composeMuiTheme's `resolveChromeColor` only accepts a background, surface,
 * text or border colour whose lightness suits the *current* mode - a guard
 * that stops a light-authored tenant palette from wrecking dark mode. The same
 * guard silently drops every chrome colour of a dark preset applied while the
 * app is in light mode, leaving only the brand colours changed: from the
 * user's seat, the preset did nothing. Rather than force both modes onto the
 * tokens (which would strand a partially-specified preset with, say, a near
 * black background and the default near black text), callers move the app to
 * the mode the preset expects. Anything the preset leaves unspecified then
 * falls back to that mode's own readable default.
 */
export const getPresetMode = (presetId: ThemePresetId): "light" | "dark" => {
  const lightness = lightnessOf(
    THEME_PRESETS[presetId]?.preview?.backgroundColor || "",
  );
  if (lightness === null) return "light";
  return lightness > LIGHT_SURFACE_THRESHOLD ? "light" : "dark";
};

export const applyPreset = (presetId: ThemePresetId): TenantThemeConfig => {
  const preset = THEME_PRESETS[presetId];
  if (!preset) {
    return DEFAULT_THEME_CONFIG;
  }

  return produce(DEFAULT_THEME_CONFIG, (draft: TenantThemeConfig) => {
    draft.preset = presetId;
    draft.name = preset.name;
    draft.metadata = { ...draft.metadata, mode: getPresetMode(presetId) };

    if (preset.tokens) {
      if (preset.tokens.colors) {
        Object.assign(draft.tokens.colors, preset.tokens.colors);
      }
      if (preset.tokens.spacing) {
        Object.assign(draft.tokens.spacing, preset.tokens.spacing);
      }
      if (preset.tokens.borderRadius) {
        Object.assign(draft.tokens.borderRadius, preset.tokens.borderRadius);
      }
      if (preset.tokens.typography) {
        // Deep merge typography sub-records
        if (preset.tokens.typography.fontFamily) {
          Object.assign(
            draft.tokens.typography.fontFamily,
            preset.tokens.typography.fontFamily,
          );
        }
        if (preset.tokens.typography.fontSize) {
          Object.assign(
            draft.tokens.typography.fontSize,
            preset.tokens.typography.fontSize,
          );
        }
        if (preset.tokens.typography.fontWeight) {
          Object.assign(
            draft.tokens.typography.fontWeight,
            preset.tokens.typography.fontWeight,
          );
        }
        if (preset.tokens.typography.lineHeight) {
          Object.assign(
            draft.tokens.typography.lineHeight,
            preset.tokens.typography.lineHeight,
          );
        }
      }
    }

    if (preset.effects) {
      if (preset.effects.globalType) {
        draft.effects.globalType = preset.effects.globalType;
      }
      if (preset.effects.glassmorphism) {
        draft.effects.glassmorphism = {
          ...draft.effects.glassmorphism,
          ...preset.effects.glassmorphism,
        };
      }
      if (preset.effects.neumorphism) {
        draft.effects.neumorphism = {
          ...draft.effects.neumorphism,
          ...preset.effects.neumorphism,
        };
      }
    }

    if (preset.components) {
      draft.components = {
        ...draft.components,
        ...preset.components,
      };
    }
  });
};

export const mergeThemeWithPreset = (
  currentTheme: TenantThemeConfig,
  presetId: ThemePresetId,
): TenantThemeConfig => {
  const presetTheme = applyPreset(presetId);

  // The caller may hand us a partial config - the theme editor opens with an
  // empty draft and only fills it in on the first edit, so selecting a preset
  // as the very first action used to arrive here as `{}` and throw on
  // `draft.tokens.colors`, which surfaced as the preset click doing nothing at
  // all. Backfill every branch this merge writes into before entering produce.
  const base = mergeDeep(
    structuredClone(DEFAULT_THEME_CONFIG) as unknown as Record<string, unknown>,
    (currentTheme || {}) as unknown as Record<string, unknown>,
  ) as unknown as TenantThemeConfig;

  return produce(base, (draft) => {
    draft.preset = presetId;
    draft.metadata = { ...draft.metadata, mode: presetTheme.metadata?.mode };

    // Merge all tokens from the preset-derived theme
    Object.assign(draft.tokens.colors, presetTheme.tokens.colors);
    Object.assign(draft.tokens.spacing, presetTheme.tokens.spacing);
    Object.assign(draft.tokens.borderRadius, presetTheme.tokens.borderRadius);

    // Deep merge typography
    if (presetTheme.tokens.typography) {
      Object.assign(
        draft.tokens.typography.fontFamily,
        presetTheme.tokens.typography.fontFamily,
      );
      Object.assign(
        draft.tokens.typography.fontSize,
        presetTheme.tokens.typography.fontSize,
      );
      Object.assign(
        draft.tokens.typography.fontWeight,
        presetTheme.tokens.typography.fontWeight,
      );
      Object.assign(
        draft.tokens.typography.lineHeight,
        presetTheme.tokens.typography.lineHeight,
      );
    }

    draft.effects = {
      ...presetTheme.effects,
    };

    if (presetTheme.components) {
      draft.components = {
        ...draft.components,
        ...presetTheme.components,
      };
    }
  });
};

export const createThemeFromPartial = (
  partial: Partial<TenantThemeConfig>,
  organizationId: string,
): TenantThemeConfig => {
  return produce(DEFAULT_THEME_CONFIG, (draft: TenantThemeConfig) => {
    draft.organizationId = organizationId;

    if (partial.name) draft.name = partial.name;
    if (partial.preset) draft.preset = partial.preset;

    if (partial.tokens) {
      if (partial.tokens.colors) {
        for (const [key, token] of Object.entries(partial.tokens.colors)) {
          if (token && key in draft.tokens.colors) {
            (draft.tokens.colors as Record<string, unknown>)[key] = token;
          }
        }
      }
      if (partial.tokens.spacing) {
        draft.tokens.spacing = {
          ...draft.tokens.spacing,
          ...partial.tokens.spacing,
        };
      }
      if (partial.tokens.borderRadius) {
        draft.tokens.borderRadius = {
          ...draft.tokens.borderRadius,
          ...partial.tokens.borderRadius,
        };
      }
    }

    if (partial.effects) {
      if (partial.effects.globalType) {
        draft.effects.globalType = partial.effects.globalType;
      }
      if (partial.effects.glassmorphism) {
        draft.effects.glassmorphism = {
          ...draft.effects.glassmorphism,
          ...partial.effects.glassmorphism,
        };
      }
      if (partial.effects.neumorphism) {
        draft.effects.neumorphism = {
          ...draft.effects.neumorphism,
          ...partial.effects.neumorphism,
        };
      }
    }

    if (partial.components) {
      draft.components = { ...draft.components, ...partial.components };
    }
  });
};

export const validateTheme = (theme: Partial<TenantThemeConfig>): string[] => {
  const errors: string[] = [];

  if (!theme.organizationId) {
    errors.push("Organization ID is required");
  }

  if (theme.tokens?.colors) {
    for (const [key, token] of Object.entries(theme.tokens.colors)) {
      if (token && typeof token === "object" && "value" in token) {
        if (
          !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(token.value) &&
          !/^rgba?\(/.test(token.value)
        ) {
          errors.push(`Invalid color value for ${key}: ${token.value}`);
        }
      }
    }
  }

  if (theme.effects?.neumorphism) {
    const { intensity, distance, altitude } = theme.effects.neumorphism;
    if (intensity !== undefined && (intensity < 0 || intensity > 1)) {
      errors.push("Neumorphism intensity must be between 0 and 1");
    }
    if (distance !== undefined && (distance < 0 || distance > 20)) {
      errors.push("Neumorphism distance must be between 0 and 20");
    }
    if (altitude !== undefined && (altitude < 0 || altitude > 45)) {
      errors.push("Neumorphism altitude must be between 0 and 45");
    }
  }

  return errors;
};
