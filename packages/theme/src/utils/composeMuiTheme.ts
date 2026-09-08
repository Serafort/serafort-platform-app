import {
  createTheme,
  darken,
  getContrastRatio,
  lighten,
} from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import type { Direction, Settings, SystemMode } from "@cap/shared-types";
import getComponentOverrides from "../overrides";
import type { TenantThemeConfig, ColorToken } from "../types";
import { DEFAULT_THEME_CONFIG } from "../types";
import darkTheme from "../assets/themes/dark";
import lightTheme from "../assets/themes/light";
import { createBaseMuiTheme } from "./createBaseMuiTheme";
import { elevationScale } from "./elevation";
import { LIGHT_SURFACE_THRESHOLD, lightnessOf } from "./colorLightness";

/**
 * The five numeric elevation indices that a tenant can retarget through a
 * `--shadow-*` custom property (emitted by `generateThemeVariables`). Every
 * other index takes the generated ramp value verbatim.
 */
const SHADOW_VAR_ANCHORS: Record<number, string> = {
  1: "xs",
  4: "sm",
  8: "md",
  16: "lg",
  24: "xl",
};

interface ComposeMuiThemeOptions {
  currentMode: SystemMode;
  direction?: Direction;
  settings: Settings;
  tenantTheme?: TenantThemeConfig | null;
}

const toNumber = (value: string | number | undefined, fallback: number) => {
  if (typeof value === "number") return value;

  const parsed = Number.parseInt(value || "", 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};


/**
 * Resolve a "chrome" colour - background, surface, text, border - for the
 * active mode.
 *
 * `ColorToken` carries optional `light`/`dark` fields precisely so a tenant
 * (or DEFAULT_THEME_CONFIG) can author a real per-mode value; when one is set
 * for the active mode, it wins outright - no inference, the author said so.
 *
 * Most tenant configs still only set `.value` though (that's all today's
 * `ColorPaletteEditor` chrome swatches write, and it's the whole shape of any
 * config authored before per-mode tokens existed). For those, a token is
 * honoured only when its lightness suits the active mode; otherwise the
 * mode's own static theme value wins. Applying `.value` verbatim in both
 * modes regardless of fit is what used to leave dark mode half-applied -
 * `palette.mode` flipped to `dark` and every component keying off it
 * switched over, while the surfaces stayed light, so the shell rendered white
 * text on a white sidebar. The heuristic prevents that for single-value
 * configs; deliberately dark presets (glassmorphism, godlio-premium) keep
 * their surfaces in dark mode, and a light-mode brand background keeps its
 * own in light mode - but neither can strand the shell in an unreadable
 * half-state.
 */
const resolveChromeColor = (
  token: ColorToken | undefined,
  fallback: string,
  mode: SystemMode,
  /** Text sits opposite its surface, so its expected lightness is inverted. */
  inverted = false,
): string => {
  const explicit = mode === "dark" ? token?.dark : token?.light;
  if (explicit) return explicit;

  const tokenValue = token?.value;
  if (!tokenValue) return fallback;

  const lightness = lightnessOf(tokenValue);
  if (lightness === null) return tokenValue; // unparseable: trust the author

  const wantsLight = inverted ? mode === "dark" : mode === "light";
  const isLight = lightness > LIGHT_SURFACE_THRESHOLD;

  return isLight === wantsLight ? tokenValue : fallback;
};

/**
 * Text colour to place on top of a palette colour.
 *
 * Every group used to be built with a hard-coded `"#FFF"`, which is only ever
 * right for a mid-to-dark brand colour. Presets are free to pick bright ones,
 * and five of them did: white on Cyberpunk HUD's cyan is a contrast ratio of
 * 1.25, on Neo-Brutalism's canary yellow 1.33, on Dark UI's cyan 1.81 - button
 * labels that are, in practice, not there. The threshold is MUI's own default
 * of 3, so a colour that already reads acceptably against white keeps white
 * and brand-standard buttons are left exactly as they were.
 */
const CONTRAST_THRESHOLD = 3;

const contrastTextFor = (background: string): string => {
  try {
    return getContrastRatio(background, "#FFFFFF") >= CONTRAST_THRESHOLD
      ? "#FFFFFF"
      : "#0A0A0A";
  } catch {
    // Unparseable colour: keep the previous behaviour rather than guess.
    return "#FFFFFF";
  }
};

const derivePaletteColorGroup = (
  mainColor: string,
  contrastText = contrastTextFor(mainColor),
) => ({
  light: lighten(mainColor, 0.2),
  main: mainColor,
  dark: darken(mainColor, 0.12),
  contrastText,
  lighterOpacity: `${mainColor}14`,
  lightOpacity: `${mainColor}29`,
  mainOpacity: `${mainColor}3D`,
  darkOpacity: `${mainColor}52`,
  darkerOpacity: `${mainColor}61`,
});

export const composeMuiTheme = ({
  currentMode,
  direction = "ltr",
  settings,
  tenantTheme,
}: ComposeMuiThemeOptions) => {
  const baseTenantTheme = tenantTheme || DEFAULT_THEME_CONFIG;
  const resolvedTenantTheme = {
    ...baseTenantTheme,
    effects: {
      ...(baseTenantTheme.effects || DEFAULT_THEME_CONFIG.effects),
      ...(settings.effect ? { globalType: settings.effect } : {}),
    },
  } as TenantThemeConfig;

  const tokens = resolvedTenantTheme.tokens || DEFAULT_THEME_CONFIG.tokens;
  const baseStaticTheme = currentMode === "dark" ? darkTheme : lightTheme;
  const primaryMain =
    tenantTheme?.tokens?.colors?.primary?.value ||
    settings.primaryColor ||
    tokens.colors.primary?.value ||
    baseStaticTheme.palette.primary.main;
  const secondaryMain =
    tokens.colors.secondary?.value || baseStaticTheme.palette.secondary.main;
  // Chrome colours must suit the active mode - see resolveChromeColor.
  const backgroundDefault = resolveChromeColor(
    tokens.colors.background,
    baseStaticTheme.palette.background.default,
    currentMode,
  );
  const surfaceColor = resolveChromeColor(
    tokens.colors.surface,
    baseStaticTheme.palette.background.paper,
    currentMode,
  );
  const borderColor = resolveChromeColor(
    tokens.colors.border,
    baseStaticTheme.palette.divider,
    currentMode,
  );
  const textPrimary = resolveChromeColor(
    tokens.colors.text,
    baseStaticTheme.palette.text.primary,
    currentMode,
    true,
  );
  const textSecondary = resolveChromeColor(
    tokens.colors.textMuted,
    baseStaticTheme.palette.text.secondary,
    currentMode,
    true,
  );
  const errorMain =
    tokens.colors.error?.value || baseStaticTheme.palette.error.main;
  const successMain =
    tokens.colors.success?.value || baseStaticTheme.palette.success.main;
  const warningMain =
    tokens.colors.warning?.value || baseStaticTheme.palette.warning.main;
  const infoMain =
    tokens.colors.info?.value || baseStaticTheme.palette.info.main;
  const updatedSettings = {
    ...settings,
    primaryColor: primaryMain,
  };

  const theme = createTheme(
    baseStaticTheme,
    createBaseMuiTheme(updatedSettings, currentMode, direction, {
      primary: primaryMain,
      secondary: secondaryMain,
      error: errorMain,
      warning: warningMain,
      info: infoMain,
      success: successMain,
    }),
    {
      direction,
      spacing: (factor: number | string) => {
        if (typeof factor === "string") return `var(--spacing-${factor})`;
        // A CSS custom property name cannot contain a dot, so
        // `var(--spacing-2.5, calc(0.25rem * 2.5))` is not an invalid *value*
        // that falls back - it is an invalid reference, which makes the whole
        // declaration invalid at computed-value time. Every fractional sx
        // spacing in the app (`p: 2.5`, `gap: 1.5`, `mt: 0.5`) therefore
        // computed to 0 rather than to 10px, 6px, 2px. Fractions skip the
        // variable and go straight to the calc; whole numbers keep the
        // variable so a tenant's spacing scale can still override them.
        if (!Number.isInteger(factor)) return `calc(0.25rem * ${factor})`;
        return `var(--spacing-${factor}, calc(0.25rem * ${factor}))`;
      },
      // A single generated ramp - mode-tinted, monotonic, and (in dark mode)
      // carrying the ambient edge highlight + containment ring that stops a
      // raised surface dissolving into a same-coloured canvas. The five
      // tenant-retargetable indices keep their `--shadow-*` override, falling
      // back to the generated value; MUI's stock black-alpha shadows are no
      // longer referenced.
      shadows: elevationScale(currentMode).map((generated, index) => {
        const anchor = SHADOW_VAR_ANCHORS[index];
        return anchor ? `var(--shadow-${anchor}, ${generated})` : generated;
      }) as Theme["shadows"],
      palette: {
        mode: currentMode,
        primary: derivePaletteColorGroup(primaryMain),
        secondary: derivePaletteColorGroup(secondaryMain),
        error: derivePaletteColorGroup(errorMain),
        success: derivePaletteColorGroup(successMain),
        warning: derivePaletteColorGroup(warningMain),
        info: derivePaletteColorGroup(infoMain),
        background: {
          default: backgroundDefault,
          paper: surfaceColor,
        },
        text: {
          primary: textPrimary,
          secondary: textSecondary,
        },
        divider: borderColor,
        customColors: {
          bodyBg: backgroundDefault,
          chatBg: backgroundDefault,
          greyLightBg: backgroundDefault,
          inputBorder: borderColor,
          tableHeaderBg: surfaceColor,
          tooltipText: currentMode === "dark" ? "#2F3349" : "#FFFFFF",
          trackBg: borderColor,
          brandGold: primaryMain,
          brandBrown: secondaryMain,
          brandSlate: textSecondary,
          brandCream: backgroundDefault,
        },
      },
      typography: {
        fontFamily:
          tokens.typography?.fontFamily?.sans ||
          baseStaticTheme.typography.fontFamily,
        h1: {
          fontSize: tokens.typography?.fontSize?.["4xl"] || "2.25rem",
          fontWeight: tokens.typography?.fontWeight?.bold || 700,
          lineHeight: tokens.typography?.lineHeight?.tight || "1.25",
        },
        h2: {
          fontSize: tokens.typography?.fontSize?.["3xl"] || "1.875rem",
          fontWeight: tokens.typography?.fontWeight?.bold || 700,
          lineHeight: tokens.typography?.lineHeight?.tight || "1.25",
        },
        h3: {
          fontSize: tokens.typography?.fontSize?.["2xl"] || "1.5rem",
          fontWeight: tokens.typography?.fontWeight?.semibold || 600,
          lineHeight: tokens.typography?.lineHeight?.tight || "1.25",
        },
        h4: {
          fontSize: tokens.typography?.fontSize?.xl || "1.25rem",
          fontWeight: tokens.typography?.fontWeight?.semibold || 600,
          lineHeight: tokens.typography?.lineHeight?.tight || "1.25",
        },
        h5: {
          fontSize: tokens.typography?.fontSize?.lg || "1.125rem",
          fontWeight: tokens.typography?.fontWeight?.semibold || 600,
          lineHeight: tokens.typography?.lineHeight?.tight || "1.25",
        },
        h6: {
          fontSize: tokens.typography?.fontSize?.base || "1rem",
          fontWeight: tokens.typography?.fontWeight?.semibold || 600,
          lineHeight: tokens.typography?.lineHeight?.tight || "1.25",
        },
        subtitle1: {
          fontSize: tokens.typography?.fontSize?.lg || "1.125rem",
          fontWeight: tokens.typography?.fontWeight?.medium || 500,
          lineHeight: tokens.typography?.lineHeight?.normal || "1.5",
        },
        subtitle2: {
          fontSize: tokens.typography?.fontSize?.base || "1rem",
          fontWeight: tokens.typography?.fontWeight?.medium || 500,
          lineHeight: tokens.typography?.lineHeight?.normal || "1.5",
        },
        body1: {
          fontSize: tokens.typography?.fontSize?.base || "1rem",
          fontWeight: tokens.typography?.fontWeight?.normal || 400,
          lineHeight: tokens.typography?.lineHeight?.normal || "1.5",
        },
        body2: {
          fontSize: tokens.typography?.fontSize?.sm || "0.875rem",
          fontWeight: tokens.typography?.fontWeight?.normal || 400,
          lineHeight: tokens.typography?.lineHeight?.normal || "1.5",
        },
        caption: {
          fontSize: tokens.typography?.fontSize?.xs || "0.75rem",
          fontWeight: tokens.typography?.fontWeight?.normal || 400,
          lineHeight: tokens.typography?.lineHeight?.normal || "1.5",
        },
        overline: {
          fontSize: tokens.typography?.fontSize?.xs || "0.75rem",
          fontWeight: tokens.typography?.fontWeight?.semibold || 600,
          lineHeight: tokens.typography?.lineHeight?.normal || "1.5",
          textTransform: "uppercase",
        },
        button: {
          textTransform: "none",
          fontWeight: tokens.typography?.fontWeight?.medium || 500,
        },
      },
      shape: {
        borderRadius: toNumber(
          tokens.borderRadius?.md,
          toNumber(baseStaticTheme.shape.borderRadius, 8),
        ),
        customBorderRadius: {
          xs: toNumber(tokens.borderRadius?.none, 2),
          sm: toNumber(tokens.borderRadius?.sm, 4),
          md: toNumber(tokens.borderRadius?.md, 8),
          lg: toNumber(tokens.borderRadius?.lg, 12),
          xl: toNumber(tokens.borderRadius?.xl, 16),
        },
      },
      tenantTheme: resolvedTenantTheme,
    },
  );

  theme.components = {
    ...theme.components,
    ...(getComponentOverrides(
      theme,
      settings.skin as any,
    ) as typeof theme.components),
  };

  return theme;
};

import { LRUCache } from "./LRUCache";

const themeCache = new LRUCache<string, Theme>(20);

export const composeMuiThemeMemoized = (
  options: ComposeMuiThemeOptions,
): Theme => {
  const { currentMode, direction = "ltr", settings, tenantTheme } = options;
  const colors = tenantTheme?.tokens?.colors;
  const primaryVal = colors?.primary?.value || settings.primaryColor || "";
  const secondaryVal = colors?.secondary?.value || "";
  const bgVal = colors?.background?.value || "";
  const surfaceVal = colors?.surface?.value || "";
  const fontVal = tenantTheme?.tokens?.typography?.fontFamily?.sans || "";
  // Status colours feed the coloured elevation rings (theme.customShadows.*),
  // so a tenant that overrides only, say, their error colour must not be
  // served a theme built for the previous one.
  const statusVal = [
    colors?.error?.value,
    colors?.warning?.value,
    colors?.info?.value,
    colors?.success?.value,
  ].join("|");
  // The whole effect config, not just its name: the theme object carries it
  // through as `theme.tenantTheme` for SurfaceEffectFactory, so tuning a
  // preset's blur or shadow has to miss the cache. Keyed on the name alone,
  // every adjustment in the theme editor's Effects tab returned the first
  // theme built for that effect and appeared to do nothing.
  const effectVal = JSON.stringify(tenantTheme?.effects || {});

  const key = `${tenantTheme?.id || "default"}_${currentMode}_${direction}_${settings.skin}_${settings.effect || "none"}_${effectVal}_${primaryVal}_${secondaryVal}_${bgVal}_${surfaceVal}_${fontVal}_${statusVal}`;

  const cached = themeCache.get(key);
  if (cached) {
    return cached;
  }

  const compiledTheme = composeMuiTheme(options);
  themeCache.set(key, compiledTheme);
  return compiledTheme;
};
