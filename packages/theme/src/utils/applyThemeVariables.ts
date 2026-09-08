import type {
  TenantThemeConfig,
  CSSVariableMap,
  AppliedThemeVariables,
} from "../types";
import type { UIEffect } from "@cap/shared-types";
import {
  computeNeumorphismBoxShadow,
  computeOrganicRadius,
  getGlassmorphismStyles,
  getLiquidGlassStyles,
  getBrutalismStyles,
  getBentoStyles,
  getOrganicStyles,
  getImmersiveStyles,
  hexToRgba,
  rgbaToHex,
} from "./computeEffects";
import { brandMeshGradient } from "./gradients";

export { hexToRgba, rgbaToHex };

export const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

export const flattenVariables = (
  obj: Record<string, unknown>,
  prefix = "",
): CSSVariableMap => {
  const result: CSSVariableMap = {};

  for (const [key, value] of Object.entries(obj)) {
    const varName = prefix ? `${prefix}-${key}` : `--${key}`;

    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(
        result,
        flattenVariables(value as Record<string, unknown>, varName),
      );
    } else if (value !== undefined && value !== null) {
      result[varName] = String(value);
    }
  }

  return result;
};

export const toKebabCase = (str: string): string =>
  str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

export const generateThemeVariables = (
  theme: TenantThemeConfig,
): AppliedThemeVariables => {
  const colors: CSSVariableMap = {};
  const spacing: CSSVariableMap = {};
  const borderRadius: CSSVariableMap = {};
  const typography: CSSVariableMap = {};
  const shadows: CSSVariableMap = {};
  const effects: CSSVariableMap = {};

  for (const [key, token] of Object.entries(theme.tokens.colors)) {
    if (token && typeof token === "object" && "value" in token) {
      colors[`--color-${key}`] = token.value;

      const hsl = token.hsl || hexToHsl(token.value);
      colors[`--color-${key}-h`] = hsl.h;
      colors[`--color-${key}-s`] = `${hsl.s}%`;
      colors[`--color-${key}-l`] = `${hsl.l}%`;
      colors[`--color-${key}-hsl`] = `${hsl.h} ${hsl.s}% ${hsl.l}%`;
    }
  }

  for (const [key, value] of Object.entries(theme.tokens.spacing)) {
    spacing[`--spacing-${key}`] = value;
  }

  // Viewport-responsive spacing (clamp() strings). Keys are camelCase in the
  // token config; the custom properties are kebab-cased to match the static
  // `--space-fluid-*` set emitted by tokensToCssVariables.
  if (theme.tokens.fluidSpacing) {
    for (const [key, value] of Object.entries(theme.tokens.fluidSpacing)) {
      spacing[`--space-fluid-${toKebabCase(key)}`] = value;
    }
  }

  for (const [key, value] of Object.entries(theme.tokens.borderRadius)) {
    borderRadius[`--radius-${key}`] = value;
  }

  if (theme.tokens.shadows) {
    for (const [key, value] of Object.entries(theme.tokens.shadows)) {
      shadows[`--shadow-${key}`] = value;
    }
  }

  if (theme.tokens.typography) {
    for (const [key, value] of Object.entries(
      theme.tokens.typography.fontFamily || {},
    )) {
      typography[`--font-family-${key}`] = value;
    }
    for (const [key, value] of Object.entries(
      theme.tokens.typography.fontSize || {},
    )) {
      typography[`--font-size-${key}`] = value;
    }
    for (const [key, value] of Object.entries(
      theme.tokens.typography.fontWeight || {},
    )) {
      typography[`--font-weight-${key}`] = String(value);
    }
    for (const [key, value] of Object.entries(
      theme.tokens.typography.lineHeight || {},
    )) {
      typography[`--line-height-${key}`] = value;
    }
  }

  // ==========================================================================
  // EFFECTS
  // ==========================================================================
  //
  // Two families of variables come out of here.
  //
  // `--glass-*`, `--neu-*`, `--brutal-*`, ... are per-effect namespaces. They
  // back opt-in usage - a component explicitly styled as glass regardless of
  // what the rest of the app is doing - so they are emitted for whichever
  // effect the tenant has configured.
  //
  // `--effect-*` is the *active* surface treatment: what every Paper, Card,
  // Dialog, navbar, sidebar and footer paints itself with by default. Exactly
  // one effect may own it, so it is selected from `globalType` alone. It used
  // to be written by six near-identical hand-copied blocks, each gated on both
  // `enabled` and `globalType`, and `liquid-glass` was never given one at all
  // - so choosing it changed nothing. Both families now come from the same
  // per-effect builders, which is why adding an effect to the registry is
  // enough to make it apply.
  const effectConfig = theme.effects;
  const globalType: UIEffect = effectConfig?.globalType || "standard";

  /** What the active surface treatment resolves to, per effect. */
  const activeEffectBuilders: Record<
    Exclude<UIEffect, "standard">,
    () => CSSVariableMap
  > = {
    glass: (): CSSVariableMap => {
      const config = effectConfig?.glassmorphism;
      if (!config) return {};
      const styles = getGlassmorphismStyles(config);
      return {
        "--effect-bg": styles.background,
        "--effect-backdrop": styles.backdropFilter,
        "--effect-border": styles.border,
      };
    },
    "liquid-glass": (): CSSVariableMap => {
      const config = effectConfig?.liquidGlass;
      if (!config) return {};
      const styles = getLiquidGlassStyles(config);
      return {
        "--effect-bg": styles.background,
        "--effect-backdrop": styles.backdropFilter,
        "--effect-border": styles.border,
        "--effect-shadow": styles.boxShadow,
      };
    },
    neu: (): CSSVariableMap => {
      const config = effectConfig?.neumorphism;
      if (!config) return {};
      const vars: CSSVariableMap = {
        "--effect-shadow": computeNeumorphismBoxShadow(config),
        // Relief only. The whole illusion is that the surface is the same
        // material as the ground, pushed up out of it; an outline around it
        // reads as a separate object sitting on top and cancels the effect.
        "--effect-border": "none",
      };
      // Neumorphism only reads as extruded when the surface and the ground
      // behind it are the same colour - the relief is made entirely of the two
      // shadows, so a panel that contrasts with its canvas just looks like a
      // panel with strange shadows. The Neumorphism preset sets its page
      // background and its surface to the same value for exactly this reason,
      // but selecting `neu` as the global effect on some other palette does
      // not, so the effect publishes its ground as well as its surface and the
      // content canvas follows it (see StyledMain).
      if (config.backgroundColor) {
        vars["--effect-bg"] = config.backgroundColor;
        vars["--effect-canvas-bg"] = config.backgroundColor;
      }
      if (config.borderRadius) vars["--effect-radius"] = config.borderRadius;
      return vars;
    },
    brutalism: (): CSSVariableMap => {
      const config = effectConfig?.brutalism;
      if (!config) return {};
      const styles = getBrutalismStyles(config);
      return {
        ...(config.backgroundColor
          ? { "--effect-bg": config.backgroundColor }
          : {}),
        "--effect-border": styles.border,
        "--effect-shadow": styles.boxShadow,
        "--effect-radius": "0px",
      };
    },
    bento: (): CSSVariableMap => {
      const config = effectConfig?.bento;
      if (!config) return {};
      const styles = getBentoStyles(config);
      return {
        ...(config.background ? { "--effect-bg": config.background } : {}),
        "--effect-border": styles.border,
        "--effect-shadow": config.shadow || "none",
        "--effect-radius": config.borderRadius || "24px",
      };
    },
    organic: (): CSSVariableMap => {
      const config = effectConfig?.organic;
      if (!config) return {};
      const styles = getOrganicStyles(config);
      return {
        ...(config.backgroundColor
          ? { "--effect-bg": config.backgroundColor }
          : {}),
        "--effect-radius": styles.borderRadius,
        "--effect-border": styles.border,
      };
    },
    immersive: (): CSSVariableMap => {
      const config = effectConfig?.immersive;
      if (!config) return {};
      const styles = getImmersiveStyles(config);
      return {
        "--effect-perspective": styles.perspective as string,
        "--effect-shadow": styles.boxShadow as string,
      };
    },
  };

  // -- Per-effect namespaces (opt-in usage) ---------------------------------
  const glassConfig = effectConfig?.glassmorphism;
  if (glassConfig?.enabled) {
    effects["--glass-enabled"] = "1";
    effects["--glass-blur"] = glassConfig.blur || "0px";
    effects["--glass-bg"] = glassConfig.background || "transparent";
    effects["--glass-border"] = glassConfig.borderColor || "transparent";
    effects["--glass-border-width"] = glassConfig.borderWidth || "0px";
    effects["--glass-opacity"] = glassConfig.opacity ?? 0;
  } else {
    effects["--glass-enabled"] = "0";
  }

  const liquidConfig = effectConfig?.liquidGlass;
  if (liquidConfig?.enabled) {
    const liquidStyles = getLiquidGlassStyles(liquidConfig);
    effects["--liquid-glass-enabled"] = "1";
    effects["--liquid-glass-blur"] = liquidConfig.blur || "0px";
    effects["--liquid-glass-bg"] = liquidStyles.background;
    effects["--liquid-glass-border"] = liquidStyles.border;
    effects["--liquid-glass-shadow"] = liquidStyles.boxShadow;
    effects["--liquid-glass-refraction"] = `${liquidConfig.refraction ?? 40}`;
  } else {
    effects["--liquid-glass-enabled"] = "0";
  }

  const neuConfig = effectConfig?.neumorphism;
  if (neuConfig?.enabled) {
    effects["--neu-enabled"] = "1";
    effects["--neu-bg"] = neuConfig.backgroundColor || "transparent";
    effects["--neu-intensity"] = neuConfig.intensity ?? 0;
    effects["--neu-distance"] = neuConfig.distance ?? 0;
    effects["--neu-altitude"] = neuConfig.altitude ?? 0;
    effects["--neu-radius"] = neuConfig.borderRadius || "0px";
    effects["--neu-shadow"] = computeNeumorphismBoxShadow(neuConfig);
  } else {
    effects["--neu-enabled"] = "0";
  }

  const brutalConfig = effectConfig?.brutalism;
  if (brutalConfig?.enabled) {
    const brutalStyles = getBrutalismStyles(brutalConfig);
    effects["--brutal-enabled"] = "1";
    effects["--brutal-border-width"] = brutalConfig.borderWidth || "0px";
    effects["--brutal-border-color"] = brutalConfig.borderColor || "transparent";
    effects["--brutal-shadow-offset"] = brutalConfig.shadowOffset || "0px";
    effects["--brutal-shadow-color"] = brutalConfig.shadowColor || "transparent";
    effects["--brutal-bg"] = brutalConfig.backgroundColor || "transparent";
    effects["--brutal-shadow"] = brutalStyles.boxShadow;
    effects["--brutal-border"] = brutalStyles.border;
  } else {
    effects["--brutal-enabled"] = "0";
  }

  const bentoConfig = effectConfig?.bento;
  if (bentoConfig?.enabled) {
    const bentoStyles = getBentoStyles(bentoConfig);
    effects["--bento-enabled"] = "1";
    effects["--bento-radius"] = bentoConfig.borderRadius || "0px";
    effects["--bento-spacing"] = bentoConfig.spacing || "0px";
    effects["--bento-bg"] = bentoConfig.background || "transparent";
    effects["--bento-border-width"] = bentoConfig.borderWidth || "0px";
    effects["--bento-border-color"] = bentoConfig.borderColor || "transparent";
    effects["--bento-shadow"] = bentoConfig.shadow || "none";
    effects["--bento-border"] = bentoStyles.border;
  } else {
    effects["--bento-enabled"] = "0";
  }

  const organicConfig = effectConfig?.organic;
  if (organicConfig?.enabled) {
    effects["--organic-enabled"] = "1";
    effects["--organic-curvature"] = `${organicConfig.curvature ?? 80}`;
    effects["--organic-fluidity"] = `${organicConfig.fluidity ?? 50}`;
    effects["--organic-bg"] = organicConfig.backgroundColor || "transparent";
    effects["--organic-border-color"] =
      organicConfig.borderColor || "transparent";
    effects["--organic-border-width"] = organicConfig.borderWidth || "0px";
    effects["--organic-radius"] = computeOrganicRadius(
      organicConfig.curvature ?? 80,
      organicConfig.fluidity ?? 50,
    );
  } else {
    effects["--organic-enabled"] = "0";
  }

  const immersiveConfig = effectConfig?.immersive;
  if (immersiveConfig?.enabled) {
    effects["--immersive-enabled"] = "1";
    effects["--immersive-perspective"] =
      immersiveConfig.perspective || "1000px";
    effects["--immersive-rotate-x"] = immersiveConfig.rotationX || "0deg";
    effects["--immersive-rotate-y"] = immersiveConfig.rotationY || "0deg";
    effects["--immersive-depth"] = `${immersiveConfig.depth ?? 20}`;
    effects["--immersive-shadow-color"] =
      immersiveConfig.shadowColor || "rgba(0,0,0,0.2)";
  } else {
    effects["--immersive-enabled"] = "0";
  }

  // -- The one active surface treatment -------------------------------------
  effects["--effect-type"] = globalType;
  if (globalType !== "standard") {
    // Surfaces read `var(--effect-backdrop, <their own default>)`, and several
    // pieces of chrome default to a blur of their own (the navbar's 8px
    // frosting, for one). Only the two blur-based effects set this variable,
    // so without an explicit `none` every other effect inherited that leftover
    // frosting - brutalism, whose entire point is a hard flat edge, rendered
    // blurred. Builders that do blur overwrite this immediately below.
    effects["--effect-backdrop"] = "none";
    Object.assign(effects, activeEffectBuilders[globalType]?.() || {});

    // Chrome built from stacked containers - the sidebar is a fixed outer
    // container wrapping an inner scroll surface - has to nominate exactly one
    // layer to carry the effect. The inner one wins, because a backdrop-filter
    // can only blur what is actually behind its own element, and an opaque
    // outer container sitting directly behind it is all it would ever see.
    // The outer layers read this to drop out of the way while an effect owns
    // the surface; with no effect active it is unset and they paint as before.
    effects["--effect-underlay"] = "transparent";
  }

  // -- Ambient canvas -------------------------------------------------------
  //
  // `backdrop-filter: blur()` over a flat single-colour page is a no-op you
  // can stare straight at: there is nothing behind the panel for the blur to
  // smear, so a correctly applied glass preset still reads as "not glass".
  // A soft wash built from the tenant's own brand tokens gives the blur
  // something to reveal, and the layout paints it behind the content area
  // (see StyledMain). Only the two blur-based effects ask for it; for every
  // other effect the variable stays unset and the canvas is a flat colour.
  if (globalType === "glass" || globalType === "liquid-glass") {
    const primary = theme.tokens?.colors?.primary?.value || "#047BFA";
    const secondary =
      theme.tokens?.colors?.secondary?.value ||
      theme.tokens?.colors?.info?.value ||
      primary;
    effects["--effect-canvas-image"] = brandMeshGradient(primary, secondary);
  }
  const components: CSSVariableMap = {};
  if (theme.components) {
    for (const [compName, config] of Object.entries(theme.components)) {
      if (config.style) {
        components[`--comp-${compName}-style`] = config.style;
      }
      if (config.customProperties) {
        for (const [prop, value] of Object.entries(config.customProperties)) {
          const kebabProp = toKebabCase(prop);
          components[`--comp-${compName}-${kebabProp}`] = String(value);
        }
      }
    }
  }

  return {
    colors,
    spacing,
    borderRadius,
    typography,
    shadows,
    effects,
    components,
  };
};

let lastAppliedVariables: Record<string, string | number> = {};

const flattenAppliedVariables = (
  vars: AppliedThemeVariables,
): Record<string, string | number> => ({
  ...vars.colors,
  ...vars.spacing,
  ...vars.borderRadius,
  ...vars.typography,
  ...vars.shadows,
  ...vars.effects,
  ...vars.components,
});

const applyVariableDiff = (
  root: HTMLElement,
  flattenedNew: Record<string, string | number>,
) => {
  // Remove previously applied variables that are no longer produced (e.g. the
  // glass-only --effect-* variables after switching to the standard preset).
  for (const key of Object.keys(lastAppliedVariables)) {
    if (!(key in flattenedNew)) {
      root.style.removeProperty(key);
      delete lastAppliedVariables[key];
    }
  }

  for (const [key, value] of Object.entries(flattenedNew)) {
    if (lastAppliedVariables[key] !== value) {
      root.style.setProperty(key, String(value));
      lastAppliedVariables[key] = value;
    }
  }
};

export const applyThemeVariables = (
  theme: TenantThemeConfig,
): AppliedThemeVariables => {
  const vars = generateThemeVariables(theme);
  const root = document.documentElement;

  const flattenedNew = flattenAppliedVariables(vars);

  requestAnimationFrame(() => {
    applyVariableDiff(root, flattenedNew);
  });

  return vars;
};

export function applyThemeVariablesSync(tokens: Record<string, string>): void;
export function applyThemeVariablesSync(
  theme: TenantThemeConfig,
): AppliedThemeVariables;
export function applyThemeVariablesSync(
  tokensOrTheme: Record<string, string> | TenantThemeConfig,
): AppliedThemeVariables | void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Check if direct token dictionary was provided
  if (
    typeof tokensOrTheme === "object" &&
    tokensOrTheme !== null &&
    !("tokens" in tokensOrTheme) &&
    !("id" in tokensOrTheme) &&
    !("name" in tokensOrTheme)
  ) {
    requestAnimationFrame(() => {
      Object.entries(tokensOrTheme as Record<string, string>).forEach(
        ([key, value]) => {
          root.style.setProperty(key, value);
        },
      );
    });
    return;
  }

  const vars = generateThemeVariables(tokensOrTheme as TenantThemeConfig);
  const flattenedNew = flattenAppliedVariables(vars);

  applyVariableDiff(root, flattenedNew);

  return vars;
}

export const removeThemeVariables = (...prefixes: string[]) => {
  const root = document.documentElement;

  for (const prefix of prefixes) {
    const keysToRemove = Object.keys(lastAppliedVariables).filter(
      (k) =>
        k.startsWith(`--${prefix}-`) ||
        k.startsWith(`--color-${prefix}`) ||
        k.startsWith(`--radius-${prefix}`) ||
        k.startsWith(`--spacing-${prefix}`) ||
        k.startsWith(`--font-${prefix}`) ||
        k.startsWith(`--shadow-${prefix}`),
    );
    for (const key of keysToRemove) {
      root.style.removeProperty(key);
      delete lastAppliedVariables[key];
    }
  }
};

export const resetAllThemeVariables = () => {
  const root = document.documentElement;
  for (const key of Object.keys(lastAppliedVariables)) {
    root.style.removeProperty(key);
  }
  lastAppliedVariables = {};
};

export const getContrastColor = (hexColor: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
  if (!result) return "#000000";

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? "#000000" : "#ffffff";
};
