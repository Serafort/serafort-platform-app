/**
 * Tier 1: Primitive Tokens
 * Fixed values: scales, raw palettes, durations, easings, z-index scales
 */

export const primitiveColors = {
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },
  brand: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
    950: '#1E1B4B',
  },
  success: {
    500: '#10B981',
    600: '#059669',
    700: '#047857',
  },
  warning: {
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },
  error: {
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },
  info: {
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
  },
  alpha: {
    white: {
      4: 'rgba(255,255,255,0.04)',
      8: 'rgba(255,255,255,0.08)',
      16: 'rgba(255,255,255,0.16)',
      60: 'rgba(255,255,255,0.60)',
    },
    black: {
      4: 'rgba(0,0,0,0.04)',
      8: 'rgba(0,0,0,0.08)',
      12: 'rgba(0,0,0,0.12)',
      60: 'rgba(0,0,0,0.60)',
    },
  },
} as const;

export type PrimitiveColors = typeof primitiveColors;

/**
 * Spacing Scale (Base-4 scale: space.0 -> space.16)
 */
export const spacingTokens = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  6: '24px',
  8: '32px',
  12: '48px',
  16: '64px',
} as const;

export type SpacingTokens = typeof spacingTokens;

/**
 * Radius Scale (radius.none -> radius.full)
 */
export const radiusTokens = {
  none: '0px',
  xs: '4px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
} as const;

export type RadiusTokens = typeof radiusTokens;

/**
 * Motion Tokens (durations & easings)
 */
export const motionTokens = {
  duration: {
    actionLock: '100ms', // Double-click & rapid submission lock
    quick: '120ms',      // Action Locks / Hovers
    base: '240ms',       // Modals / Drawers
    smooth: '400ms',     // Layout shell collapse
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const;

export type MotionTokens = typeof motionTokens;

/**
 * Touch Target Tokens (Mobile & Accessibility Standards - min 44px)
 */
export const touchTargetTokens = {
  min: '44px',
  comfortable: '48px',
  large: '56px',
} as const;

export type TouchTargetTokens = typeof touchTargetTokens;

/**
 * Z-Index Hierarchy Scale
 */
export const zIndexTokens = {
  base: 0,
  header: 100,
  drawer: 500,
  modal: 1000,
  toast: 2000,
} as const;

export type ZIndexTokens = typeof zIndexTokens;

export interface PrimitiveTokenDictionary {
  colors: PrimitiveColors;
  spacing: SpacingTokens;
  radius: RadiusTokens;
  motion: MotionTokens;
  touch: TouchTargetTokens;
  zIndex: ZIndexTokens;
}

export const primitiveTokens: PrimitiveTokenDictionary = {
  colors: primitiveColors,
  spacing: spacingTokens,
  radius: radiusTokens,
  motion: motionTokens,
  touch: touchTargetTokens,
  zIndex: zIndexTokens,
};
