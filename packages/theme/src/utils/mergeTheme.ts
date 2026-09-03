import { produce } from "immer";
import type { TenantThemeConfig } from "../types";
import { DEFAULT_THEME_CONFIG } from "../types";
import { THEME_PRESETS } from "../types/presets";
import type { ThemePresetId } from "../types/presets";

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

export const applyPreset = (presetId: ThemePresetId): TenantThemeConfig => {
  const preset = THEME_PRESETS[presetId];
  if (!preset) {
    return DEFAULT_THEME_CONFIG;
  }

  return produce(DEFAULT_THEME_CONFIG, (draft: TenantThemeConfig) => {
    draft.preset = presetId;
    draft.name = preset.name;

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

  return produce(currentTheme, (draft) => {
    draft.preset = presetId;

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
