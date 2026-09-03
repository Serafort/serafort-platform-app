import { createTheme, darken, lighten } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import type { Direction, Settings, SystemMode } from "@cap/shared-types";
import getComponentOverrides from "../overrides";
import type { TenantThemeConfig } from "../types";
import { DEFAULT_THEME_CONFIG } from "../types";
import darkTheme from "../assets/themes/dark";
import lightTheme from "../assets/themes/light";
import { createBaseMuiTheme } from "./createBaseMuiTheme";

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

const derivePaletteColorGroup = (mainColor: string, contrastText = "#FFF") => ({
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
  const backgroundDefault =
    tokens.colors.background?.value ||
    baseStaticTheme.palette.background.default;
  const surfaceColor =
    tokens.colors.surface?.value || baseStaticTheme.palette.background.paper;
  const borderColor =
    tokens.colors.border?.value || baseStaticTheme.palette.divider;
  const textPrimary =
    tokens.colors.text?.value || baseStaticTheme.palette.text.primary;
  const textSecondary =
    tokens.colors.textMuted?.value || baseStaticTheme.palette.text.secondary;
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
    createBaseMuiTheme(updatedSettings, currentMode, direction),
    {
      direction,
      spacing: (factor: number | string) => {
        if (typeof factor === "string") return `var(--spacing-${factor})`;
        return `var(--spacing-${factor}, calc(0.25rem * ${factor}))`;
      },
      shadows: [
        "none",
        `var(--shadow-xs, ${baseStaticTheme.shadows[1]})`,
        baseStaticTheme.shadows[2],
        baseStaticTheme.shadows[3],
        `var(--shadow-sm, ${baseStaticTheme.shadows[4]})`,
        baseStaticTheme.shadows[5],
        baseStaticTheme.shadows[6],
        baseStaticTheme.shadows[7],
        `var(--shadow-md, ${baseStaticTheme.shadows[8]})`,
        baseStaticTheme.shadows[9],
        baseStaticTheme.shadows[10],
        baseStaticTheme.shadows[11],
        baseStaticTheme.shadows[12],
        baseStaticTheme.shadows[13],
        baseStaticTheme.shadows[14],
        baseStaticTheme.shadows[15],
        `var(--shadow-lg, ${baseStaticTheme.shadows[16]})`,
        baseStaticTheme.shadows[17],
        baseStaticTheme.shadows[18],
        baseStaticTheme.shadows[19],
        baseStaticTheme.shadows[20],
        baseStaticTheme.shadows[21],
        baseStaticTheme.shadows[22],
        baseStaticTheme.shadows[23],
        `var(--shadow-xl, ${baseStaticTheme.shadows[24]})`,
      ] as Theme["shadows"],
      palette: {
        mode: currentMode,
        primary: derivePaletteColorGroup(primaryMain, "#FFF"),
        secondary: derivePaletteColorGroup(secondaryMain, "#FFF"),
        error: derivePaletteColorGroup(errorMain, "#FFF"),
        success: derivePaletteColorGroup(successMain, "#FFF"),
        warning: derivePaletteColorGroup(warningMain, "#FFF"),
        info: derivePaletteColorGroup(infoMain, "#FFF"),
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

  const key = `${tenantTheme?.id || "default"}_${currentMode}_${direction}_${settings.skin}_${settings.effect || "none"}_${primaryVal}_${secondaryVal}_${bgVal}_${surfaceVal}_${fontVal}`;

  const cached = themeCache.get(key);
  if (cached) {
    return cached;
  }

  const compiledTheme = composeMuiTheme(options);
  themeCache.set(key, compiledTheme);
  return compiledTheme;
};
