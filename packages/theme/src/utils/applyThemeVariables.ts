import type { TenantThemeConfig, CSSVariableMap, AppliedThemeVariables } from '../types';
import { computeNeumorphismBoxShadow, getGlassmorphismStyles, getBrutalismStyles, getBentoStyles } from './computeEffects';

/**
 * @deprecated Internal package styling now reads from the shared MUI theme.
 * These helpers remain exported only for compatibility with external consumers
 * that still mirror tenant tokens onto CSS custom properties.
 */
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0, 0, 0, ${alpha})`;

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const rgbaToHex = (rgba: string): string => {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return '#000000';

  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');

  return `#${r}${g}${b}`;
};

export const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

export const flattenVariables = (
  obj: Record<string, unknown>,
  prefix = ''
): CSSVariableMap => {
  const result: CSSVariableMap = {};

  for (const [key, value] of Object.entries(obj)) {
    const varName = prefix ? `${prefix}-${key}` : `--${key}`;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenVariables(value as Record<string, unknown>, varName));
    } else if (value !== undefined && value !== null) {
      result[varName] = String(value);
    }
  }

  return result;
};

export const toKebabCase = (str: string): string =>
  str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

export const generateThemeVariables = (theme: TenantThemeConfig): AppliedThemeVariables => {
  const colors: CSSVariableMap = {};
  const spacing: CSSVariableMap = {};
  const borderRadius: CSSVariableMap = {};
  const typography: CSSVariableMap = {};
  const effects: CSSVariableMap = {};

  for (const [key, token] of Object.entries(theme.tokens.colors)) {
    if (token && typeof token === 'object' && 'value' in token) {
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

  for (const [key, value] of Object.entries(theme.tokens.borderRadius)) {
    borderRadius[`--radius-${key}`] = value;
  }

  if (theme.tokens.typography) {
    for (const [key, value] of Object.entries(theme.tokens.typography.fontFamily || {})) {
      typography[`--font-family-${key}`] = value;
    }
    for (const [key, value] of Object.entries(theme.tokens.typography.fontSize || {})) {
      typography[`--font-size-${key}`] = value;
    }
    for (const [key, value] of Object.entries(theme.tokens.typography.fontWeight || {})) {
      typography[`--font-weight-${key}`] = String(value);
    }
    for (const [key, value] of Object.entries(theme.tokens.typography.lineHeight || {})) {
      typography[`--line-height-${key}`] = value;
    }
  }

  if (theme.effects?.glassmorphism?.enabled) {
    const glass = theme.effects.glassmorphism;
    const glassStyles = getGlassmorphismStyles(glass);

    effects['--glass-enabled'] = '1';
    effects['--glass-blur'] = glass.blur || '0px';
    effects['--glass-bg'] = glass.background || 'transparent';
    effects['--glass-border'] = glass.borderColor || 'transparent';
    effects['--glass-border-width'] = glass.borderWidth || '0px';
    effects['--glass-opacity'] = glass.opacity ?? 0;

    // Computed glass variables
    effects['--effect-bg'] = glassStyles.background;
    effects['--effect-backdrop'] = glassStyles.backdropFilter;
    effects['--effect-border'] = glassStyles.border;
  } else {
    effects['--glass-enabled'] = '0';
  }

  if (theme.effects?.neumorphism?.enabled) {
    const neu = theme.effects.neumorphism;
    effects['--neu-enabled'] = '1';
    effects['--neu-bg'] = neu.backgroundColor || 'transparent';
    effects['--neu-intensity'] = neu.intensity ?? 0;
    effects['--neu-distance'] = neu.distance ?? 0;
    effects['--neu-altitude'] = neu.altitude ?? 0;
    effects['--neu-radius'] = neu.borderRadius || '0px';

    // Computed neumorphism variables
    const neuShadow = computeNeumorphismBoxShadow(neu);
    effects['--neu-shadow'] = neuShadow;
    effects['--effect-shadow'] = neuShadow;
  } else {
    effects['--neu-enabled'] = '0';
    // Fallback for effect shadow if neumorphism is disabled
    effects['--effect-shadow'] = '0 2px 8px rgba(0, 0, 0, 0.1)';
  }

  if (theme.effects?.brutalism?.enabled) {
    const brutal = theme.effects.brutalism;
    const brutalStyles = getBrutalismStyles(brutal);

    effects['--brutal-enabled'] = '1';
    effects['--brutal-border-width'] = brutal.borderWidth || '0px';
    effects['--brutal-border-color'] = brutal.borderColor || 'transparent';
    effects['--brutal-shadow-offset'] = brutal.shadowOffset || '0px';
    effects['--brutal-shadow-color'] = brutal.shadowColor || 'transparent';
    effects['--brutal-bg'] = brutal.backgroundColor || 'transparent';

    // Computed brutalism variables
    effects['--brutal-shadow'] = brutalStyles.boxShadow;
    effects['--brutal-border'] = brutalStyles.border;

    if (theme.effects.globalType === 'brutalism') {
      effects['--effect-bg'] = brutal.backgroundColor || 'transparent';
      effects['--effect-border'] = brutalStyles.border;
      effects['--effect-shadow'] = brutalStyles.boxShadow;
    }
  } else {
    effects['--brutal-enabled'] = '0';
  }

  if (theme.effects?.bento?.enabled) {
    const bento = theme.effects.bento;
    const bentoStyles = getBentoStyles(bento);

    effects['--bento-enabled'] = '1';
    effects['--bento-radius'] = bento.borderRadius || '0px';
    effects['--bento-spacing'] = bento.spacing || '0px';
    effects['--bento-bg'] = bento.background || 'transparent';
    effects['--bento-border-width'] = bento.borderWidth || '0px';
    effects['--bento-border-color'] = bento.borderColor || 'transparent';
    effects['--bento-shadow'] = bento.shadow || 'none';

    // Computed bento variables
    effects['--bento-border'] = bentoStyles.border;

    if (theme.effects.globalType === 'bento') {
      effects['--effect-bg'] = bento.background || 'transparent';
      effects['--effect-border'] = bentoStyles.border;
      effects['--effect-shadow'] = bento.shadow || 'none';
      effects['--effect-radius'] = bento.borderRadius || '0px';
    }
  } else {
    effects['--bento-enabled'] = '0';
  }

  if (theme.effects?.organic?.enabled) {
    const organic = theme.effects.organic;
    effects['--organic-enabled'] = '1';
    effects['--organic-curvature'] = `${organic.curvature ?? 80}`;
    effects['--organic-fluidity'] = `${organic.fluidity ?? 50}`;
    effects['--organic-bg'] = organic.backgroundColor || 'transparent';
    effects['--organic-border-color'] = organic.borderColor || 'transparent';
    effects['--organic-border-width'] = organic.borderWidth || '0px';

    if (theme.effects.globalType === 'organic') {
      const radius = (organic.curvature ?? 80) > 50
        ? `${organic.curvature ?? 80}% ${100 - (organic.curvature ?? 80)}%`
        : `${organic.curvature ?? 80}px`;
      effects['--effect-bg'] = organic.backgroundColor || 'transparent';
      effects['--effect-radius'] = radius;
      effects['--effect-border'] = `${organic.borderWidth || '0px'} solid ${organic.borderColor || 'transparent'}`;
    }
  } else {
    effects['--organic-enabled'] = '0';
  }

  if (theme.effects?.immersive?.enabled) {
    const immersive = theme.effects.immersive;
    effects['--immersive-enabled'] = '1';
    effects['--immersive-perspective'] = immersive.perspective || '1000px';
    effects['--immersive-rotate-x'] = immersive.rotationX || '0deg';
    effects['--immersive-rotate-y'] = immersive.rotationY || '0deg';
    effects['--immersive-depth'] = `${immersive.depth ?? 20}`;
    effects['--immersive-shadow-color'] = immersive.shadowColor || 'rgba(0,0,0,0.2)';

    if (theme.effects.globalType === 'immersive') {
      const depth = immersive.depth ?? 20;
      const shadowColor = immersive.shadowColor || 'rgba(0,0,0,0.2)';
      effects['--effect-perspective'] = immersive.perspective || '1000px';
      effects['--effect-shadow'] = `0 ${depth / 4}px ${depth / 2}px ${shadowColor}`;
    }
  } else {
    effects['--immersive-enabled'] = '0';
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

  return { colors, spacing, borderRadius, typography, effects, components };
};

let lastAppliedVariables: Record<string, string | number> = {};

const flattenAppliedVariables = (vars: AppliedThemeVariables): Record<string, string | number> => ({
  ...vars.colors,
  ...vars.spacing,
  ...vars.borderRadius,
  ...vars.typography,
  ...vars.effects,
  ...vars.components,
});

const applyVariableDiff = (root: HTMLElement, flattenedNew: Record<string, string | number>) => {
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

export const applyThemeVariables = (theme: TenantThemeConfig): AppliedThemeVariables => {
  const vars = generateThemeVariables(theme);
  const root = document.documentElement;

  const flattenedNew = flattenAppliedVariables(vars);

  requestAnimationFrame(() => {
    applyVariableDiff(root, flattenedNew);
  });

  return vars;
};

export const applyThemeVariablesSync = (theme: TenantThemeConfig): AppliedThemeVariables => {
  const vars = generateThemeVariables(theme);
  const root = document.documentElement;

  const flattenedNew = flattenAppliedVariables(vars);

  applyVariableDiff(root, flattenedNew);

  return vars;
};

export const removeThemeVariables = (...prefixes: string[]) => {
  const root = document.documentElement;

  for (const prefix of prefixes) {
    const keysToRemove = Object.keys(lastAppliedVariables).filter(k =>
      k.startsWith(`--${prefix}-`) ||
      k.startsWith(`--color-${prefix}`) ||
      k.startsWith(`--radius-${prefix}`) ||
      k.startsWith(`--spacing-${prefix}`) ||
      k.startsWith(`--font-${prefix}`)
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
  if (!result) return '#000000';

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#ffffff';
};
