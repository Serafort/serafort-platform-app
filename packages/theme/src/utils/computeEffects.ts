import type { Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import type { NeumorphismConfig, ComputedNeumorphismShadow } from '../types';

// ==========================================
// 1. NEUMORPHISM ATOMICS & COMPOSITES
// ==========================================

export const computeNeumorphismShadows = (
  config: NeumorphismConfig
): ComputedNeumorphismShadow => {
  const { intensity = 0.15, distance = 5, altitude = 10 } = config;
  
  const angleRad = ((360 - altitude + 90) * Math.PI) / 180;
  
  const x = Math.round(Math.cos(angleRad) * distance);
  const y = Math.round(Math.sin(angleRad) * distance);
  const blur = distance * 2;
  const darkAlpha = Number((intensity * 0.4).toFixed(4));
  
  const lightShadow = `${x}px ${-y}px ${blur}px rgba(255, 255, 255, ${intensity})`;
  const darkShadow = `${-x}px ${y}px ${blur}px rgba(0, 0, 0, ${darkAlpha})`;
  
  return { lightShadow, darkShadow };
};

export const computeNeumorphismBoxShadow = (
  config: NeumorphismConfig,
  isPressed = false
): string => {
  if (!config.enabled) {
    return '0 2px 8px rgba(0, 0, 0, 0.1)';
  }
  
  const { lightShadow, darkShadow } = computeNeumorphismShadows(config);
  
  if (isPressed) {
    return `inset ${lightShadow}, inset ${darkShadow}`;
  }
  
  return `${lightShadow}, ${darkShadow}`;
};

export const computeNeumorphismBackground = (
  backgroundColor?: string,
  theme?: Theme
): string => {
  return backgroundColor || theme?.palette?.background?.paper || '#e0e0e0';
};

export const computeNeumorphismBorderRadius = (
  borderRadius?: string,
  theme?: Theme
): string => {
  return borderRadius || (theme?.shape?.borderRadius ? `${theme.shape.borderRadius}px` : '12px');
};

// ==========================================
// 2. GLASSMORPHISM ATOMICS & COMPOSITES
// ==========================================

export const computeGlassBackdropFilter = (blur = '16px'): string => {
  return `blur(${blur})`;
};

export const computeGlassBackground = (
  background?: string,
  opacity = 0.8,
  theme?: Theme
): string => {
  if (background) {
    if (background.startsWith('#')) {
      return alphaColor(background, opacity);
    }
    return background;
  }
  return theme
    ? alpha(theme.palette.background.paper, opacity)
    : `rgba(255, 255, 255, ${opacity === 0.8 ? 0.1 : opacity})`;
};

export const computeGlassBorder = (
  borderWidth = '1px',
  borderColor?: string,
  theme?: Theme
): string => {
  const resolvedColor = borderColor || (theme ? theme.palette.divider : 'rgba(255, 255, 255, 0.2)');
  return `${borderWidth} solid ${resolvedColor}`;
};

export const getGlassmorphismStyles = (config: {
  blur?: string;
  background?: string;
  borderColor?: string;
  borderWidth?: string;
  opacity?: number;
}, theme?: Theme) => {
  const {
    blur = '16px',
    background = theme ? alpha(theme.palette.background.paper, 0.4) : 'rgba(255, 255, 255, 0.1)',
    borderColor = theme ? theme.palette.divider : 'rgba(255, 255, 255, 0.2)',
    borderWidth = '1px',
    opacity = 0.8,
  } = config;
  
  const backdrop = computeGlassBackdropFilter(blur);
  const border = computeGlassBorder(borderWidth, borderColor, theme);

  return {
    background,
    backdropFilter: backdrop,
    WebkitBackdropFilter: backdrop,
    border,
    opacity,
  };
};

// ==========================================
// 3. LIQUID GLASS ATOMICS & COMPOSITES
// ==========================================

export const computeLiquidGlassBackdrop = (blur = '24px'): string => {
  return `blur(${blur}) saturate(180%)`;
};

export const computeLiquidGlassBackground = (
  background?: string,
  opacity?: number,
  isLight = true,
  theme?: Theme
): string => {
  const resolvedOpacity = opacity ?? (isLight ? 0.82 : 0.75);
  if (background) {
    if (background.startsWith('#')) {
      return alphaColor(background, resolvedOpacity);
    }
    return background;
  }
  if (theme) return alpha(theme.palette.background.paper, resolvedOpacity);
  return isLight
    ? `rgba(255, 255, 255, ${resolvedOpacity})`
    : `rgba(23, 23, 31, ${resolvedOpacity})`;
};

export const computeLiquidGlassBorder = (
  borderWidth = '1px',
  borderColor?: string,
  isLight = true
): string => {
  const resolvedColor = borderColor || (isLight ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.12)');
  return `${borderWidth} solid ${resolvedColor}`;
};

export const computeLiquidGlassInnerShadow = (
  innerShadow?: string,
  isLight = true
): string => {
  if (innerShadow) return innerShadow;
  return isLight
    ? 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.08)'
    : 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.35)';
};

export const computeLiquidGlassSpecularHighlight = (
  specularHighlight?: string,
  isLight = true
): string => {
  if (specularHighlight) return specularHighlight;
  return isLight
    ? '0 12px 36px 0 rgba(31, 38, 135, 0.14), 0 2px 6px 0 rgba(0, 0, 0, 0.04)'
    : '0 12px 36px 0 rgba(0, 0, 0, 0.6), 0 2px 8px 0 rgba(0, 0, 0, 0.4)';
};

export const computeLiquidGlassShadow = (
  innerShadow?: string,
  specularHighlight?: string,
  isLight = true
): string => {
  const resolvedInner = computeLiquidGlassInnerShadow(innerShadow, isLight);
  const resolvedSpecular = computeLiquidGlassSpecularHighlight(specularHighlight, isLight);
  return `${resolvedInner}, ${resolvedSpecular}`;
};

export const getLiquidGlassStyles = (config: {
  blur?: string;
  background?: string;
  borderColor?: string;
  borderWidth?: string;
  opacity?: number;
  innerShadow?: string;
  specularHighlight?: string;
  refraction?: number;
}, theme?: Theme) => {
  const isLight = theme?.palette?.mode !== 'dark';
  const {
    blur = '24px',
    opacity,
    borderWidth = '1px',
    borderColor,
    background,
    innerShadow,
    specularHighlight,
  } = config;

  const resolvedBg = computeLiquidGlassBackground(background, opacity, isLight, theme);
  const backdrop = computeLiquidGlassBackdrop(blur);
  const border = computeLiquidGlassBorder(borderWidth, borderColor, isLight);
  const combinedShadow = computeLiquidGlassShadow(innerShadow, specularHighlight, isLight);

  return {
    background: resolvedBg,
    backdropFilter: backdrop,
    WebkitBackdropFilter: backdrop,
    border,
    boxShadow: combinedShadow,
  };
};

// ==========================================
// 4. BRUTALISM ATOMICS & COMPOSITES
// ==========================================

export const computeBrutalismBorder = (
  borderWidth = '2px',
  borderColor?: string,
  theme?: Theme
): string => {
  const resolvedColor = borderColor || (theme ? theme.palette.text.primary : '#000000');
  return `${borderWidth} solid ${resolvedColor}`;
};

export const computeBrutalismShadow = (
  shadowOffset = '4px',
  shadowColor?: string,
  theme?: Theme
): string => {
  const resolvedColor = shadowColor || (theme ? theme.palette.text.primary : '#000000');
  return `${shadowOffset} ${shadowOffset} 0px 0px ${resolvedColor}`;
};

export const computeBrutalismBackground = (
  backgroundColor?: string,
  theme?: Theme
): string => {
  return backgroundColor || (theme ? theme.palette.background.paper : '#ffffff');
};

export const getBrutalismStyles = (config: {
  borderWidth?: string;
  borderColor?: string;
  shadowOffset?: string;
  shadowColor?: string;
  backgroundColor?: string;
}, theme?: Theme) => {
  const {
    borderWidth = '2px',
    borderColor,
    shadowOffset = '4px',
    shadowColor,
    backgroundColor,
  } = config;

  return {
    border: computeBrutalismBorder(borderWidth, borderColor, theme),
    boxShadow: computeBrutalismShadow(shadowOffset, shadowColor, theme),
    backgroundColor: computeBrutalismBackground(backgroundColor, theme),
  };
};

// ==========================================
// 5. BENTO ATOMICS & COMPOSITES
// ==========================================

export const computeBentoRadius = (
  borderRadius?: string,
  theme?: Theme
): string => {
  return borderRadius || (theme?.shape?.borderRadius ? `${(theme.shape.borderRadius as number) * 2}px` : '24px');
};

export const computeBentoBackground = (
  background?: string,
  theme?: Theme
): string => {
  return background || (theme ? theme.palette.background.paper : 'rgba(255, 255, 255, 0.8)');
};

export const computeBentoBorder = (
  borderWidth = '1px',
  borderColor?: string,
  theme?: Theme
): string => {
  const resolvedColor = borderColor || (theme ? theme.palette.divider : 'rgba(0, 0, 0, 0.05)');
  return `${borderWidth} solid ${resolvedColor}`;
};

export const computeBentoShadow = (
  shadow?: string,
  theme?: Theme
): string => {
  return shadow || (theme ? theme.shadows[4] : '0 4px 12px rgba(0, 0, 0, 0.05)');
};

export const getBentoStyles = (config: {
  borderRadius?: string;
  background?: string;
  borderWidth?: string;
  borderColor?: string;
  shadow?: string;
}, theme?: Theme) => {
  const {
    borderRadius = '24px',
    background,
    borderWidth = '1px',
    borderColor,
    shadow,
  } = config;

  return {
    borderRadius: computeBentoRadius(borderRadius, theme),
    background: computeBentoBackground(background, theme),
    border: computeBentoBorder(borderWidth, borderColor, theme),
    boxShadow: computeBentoShadow(shadow, theme),
  };
};

// ==========================================
// 6. ORGANIC ATOMICS & COMPOSITES
// ==========================================

export const computeOrganicRadius = (curvature = 80): string => {
  return curvature > 50 ? `${curvature}% ${100 - curvature}%` : `${curvature}px`;
};

export const computeOrganicFilter = (fluidity = 50): string => {
  return fluidity > 0 ? `blur(${fluidity / 50}px)` : 'none';
};

export const computeOrganicBorder = (
  borderWidth = '0px',
  borderColor = 'transparent'
): string => {
  return `${borderWidth} solid ${borderColor}`;
};

export const computeOrganicBackground = (
  backgroundColor?: string,
  theme?: Theme
): string => {
  return backgroundColor || (theme ? theme.palette.background.paper : '#ffffff');
};

export const getOrganicStyles = (config: {
  curvature?: number;
  fluidity?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
}, theme?: Theme) => {
  const {
    curvature = 80,
    fluidity = 50,
    backgroundColor,
    borderColor = 'transparent',
    borderWidth = '0px',
  } = config;

  return {
    borderRadius: computeOrganicRadius(curvature),
    background: computeOrganicBackground(backgroundColor, theme),
    border: computeOrganicBorder(borderWidth, borderColor),
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    filter: computeOrganicFilter(fluidity),
  };
};

// ==========================================
// 7. IMMERSIVE ATOMICS & COMPOSITES
// ==========================================

export const computeImmersivePerspective = (perspective = '1000px'): string => {
  return perspective;
};

export const computeImmersiveTransform = (
  rotationX = '0deg',
  rotationY = '0deg'
): string => {
  return `rotateX(${rotationX}) rotateY(${rotationY})`;
};

export const computeImmersiveShadow = (
  depth = 20,
  shadowColor?: string,
  theme?: Theme
): string => {
  let resolvedColor = shadowColor;
  if (!resolvedColor) {
    resolvedColor = theme ? alpha(theme.palette.common.black, 0.2) : 'rgba(0,0,0,0.2)';
  } else if (resolvedColor.startsWith('#')) {
    resolvedColor = alphaColor(resolvedColor, 0.2);
  }
  return `0 ${depth / 4}px ${depth / 2}px ${resolvedColor}, 0 ${depth}px ${depth * 1.5}px ${resolvedColor}`;
};

export const computeImmersiveBackground = (
  backgroundColor?: string,
  theme?: Theme
): string => {
  return backgroundColor || (theme ? theme.palette.background.paper : '#ffffff');
};

export const getImmersiveStyles = (config: {
  perspective?: string;
  rotationX?: string;
  rotationY?: string;
  depth?: number;
  shadowColor?: string;
}, theme?: Theme) => {
  const {
    perspective = '1000px',
    rotationX = '0deg',
    rotationY = '0deg',
    depth = 20,
    shadowColor,
  } = config;

  return {
    perspective: computeImmersivePerspective(perspective),
    transform: computeImmersiveTransform(rotationX, rotationY),
    boxShadow: computeImmersiveShadow(depth, shadowColor, theme),
    transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
  };
};

// ==========================================
// 8. COLOR & RGBA UTILITIES
// ==========================================

export interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export const clampAlpha = (alphaVal: number): number => {
  if (Number.isNaN(alphaVal)) return 1;
  return Math.min(1, Math.max(0, Number(alphaVal.toFixed(4))));
};

export const toRgbaString = (r: number, g: number, b: number, a = 1): string => {
  const clampedR = Math.min(255, Math.max(0, Math.round(r)));
  const clampedG = Math.min(255, Math.max(0, Math.round(g)));
  const clampedB = Math.min(255, Math.max(0, Math.round(b)));
  const clampedA = clampAlpha(a);
  return `rgba(${clampedR}, ${clampedG}, ${clampedB}, ${clampedA})`;
};

export const parseColor = (color: string): RGBAColor | null => {
  if (!color || typeof color !== 'string') return null;
  const trimmed = color.trim().toLowerCase();

  // 1. Hex parsing (#rgb, #rgba, #rrggbb, #rrggbbaa)
  if (trimmed.startsWith('#')) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return { r, g, b, a: 1 };
    }
    if (hex.length === 4) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      const a = Number((parseInt(hex[3] + hex[3], 16) / 255).toFixed(4));
      return { r, g, b, a };
    }
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return { r, g, b, a: 1 };
    }
    if (hex.length === 8) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const a = Number((parseInt(hex.substring(6, 8), 16) / 255).toFixed(4));
      return { r, g, b, a };
    }
    return null;
  }

  // 2. rgb / rgba parsing
  const rgbMatch = trimmed.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([\d.]+)\s*)?\)$/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    const a = rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1;
    return { r, g, b, a: clampAlpha(a) };
  }

  return null;
};

export const hexToRgba = (hex: string, alphaVal?: number): string => {
  const parsed = parseColor(hex);
  if (!parsed) {
    const fallbackAlpha = alphaVal !== undefined ? clampAlpha(alphaVal) : 1;
    return `rgba(0, 0, 0, ${fallbackAlpha})`;
  }
  const resolvedAlpha = alphaVal !== undefined ? clampAlpha(alphaVal) : parsed.a;
  return toRgbaString(parsed.r, parsed.g, parsed.b, resolvedAlpha);
};

export const rgbaToHex = (rgba: string, includeAlpha = false): string => {
  const parsed = parseColor(rgba);
  if (!parsed) return '#000000';

  const rHex = parsed.r.toString(16).padStart(2, '0');
  const gHex = parsed.g.toString(16).padStart(2, '0');
  const bHex = parsed.b.toString(16).padStart(2, '0');

  if (includeAlpha) {
    const aHex = Math.round(parsed.a * 255).toString(16).padStart(2, '0');
    return `#${rHex}${gHex}${bHex}${aHex}`;
  }

  return `#${rHex}${gHex}${bHex}`;
};

export const alphaColor = (color: string, alphaVal: number): string => {
  const parsed = parseColor(color);
  if (!parsed) {
    return `rgba(0, 0, 0, ${clampAlpha(alphaVal)})`;
  }
  return toRgbaString(parsed.r, parsed.g, parsed.b, alphaVal);
};

export const interpolateColor = (color1: string, color2: string, factor: number): string => {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);
  
  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);
  
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const lightenColor = (hex: string, percent: number): string => {
  const factor = percent / 100;
  const white = '#ffffff';
  return interpolateColor(hex, white, factor);
};

export const darkenColor = (hex: string, percent: number): string => {
  const factor = percent / 100;
  const black = '#000000';
  return interpolateColor(hex, black, factor);
};
