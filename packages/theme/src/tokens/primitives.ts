/**
 * Tier 1: Primitive Tokens
 * Fixed values: scales, raw palettes, durations, easings, z-index scales
 *
 * The colour ramps below are derived from the Serafort brand kit — see
 * `brand.ts` for the upstream values. Ramp stops that map 1:1 onto a brand
 * token reference it directly; the in-between stops are interpolated so the
 * scale stays monotonic for MUI's light/dark/contrast calculations.
 */

import { brandColors, brandNeutrals, brandSemantics } from "./brand";

export const primitiveColors = {
  // Blue-tinted neutrals keyed to `brandColors.ink`.
  slate: {
    50: brandNeutrals.fog50,
    100: brandNeutrals.fog100,
    200: "#DAE1EE",
    300: brandNeutrals.mist300,
    400: "#96A2B9",
    500: brandNeutrals.slate500,
    600: brandNeutrals.slate600,
    700: "#303A52",
    800: brandNeutrals.slate800,
    900: "#0F1A33",
    950: brandColors.ink,
  },
  // Serafort blues. 500 is the primary action colour, 950 the ink ground.
  brand: {
    50: "#E6F2FE",
    100: "#CDE5FE",
    200: "#9BCAFC",
    300: "#69B0FC",
    400: brandColors.sky,
    500: brandColors.blue,
    600: brandColors.royalBlue,
    700: brandColors.deepBlue,
    800: "#032E7B",
    900: brandColors.navy,
    950: brandColors.ink,
  },
  // Cyan accent from the wing mark — used for highlights and dark-mode CTAs.
  accent: {
    400: "#4FDCFD",
    500: brandColors.cyan,
    600: brandColors.sky,
  },
  success: {
    500: brandSemantics.success,
    600: "#15803D",
    700: "#166534",
  },
  warning: {
    500: brandSemantics.warning,
    600: "#B45309",
    700: "#92400E",
  },
  error: {
    500: brandSemantics.error,
    600: "#B91C1C",
    700: "#991B1B",
  },
  info: {
    500: brandSemantics.info,
    600: brandColors.royalBlue,
    700: brandColors.deepBlue,
  },
  alpha: {
    white: {
      4: "rgba(255,255,255,0.04)",
      8: "rgba(255,255,255,0.08)",
      16: "rgba(255,255,255,0.16)",
      60: "rgba(255,255,255,0.60)",
    },
    black: {
      4: "rgba(0,0,0,0.04)",
      8: "rgba(0,0,0,0.08)",
      12: "rgba(0,0,0,0.12)",
      60: "rgba(0,0,0,0.60)",
    },
  },
} as const;

export type PrimitiveColors = typeof primitiveColors;

/**
 * Opacity Scale
 *
 * `primitiveColors.alpha` only offered four arbitrary stops per channel. This
 * is the full percentage scale (0-100) as unitless numbers, so any value can
 * be composed - `opacity`, `rgb(... / var(--opacity-40))`, an `alpha()` call -
 * without ad-hoc decimals scattered through the code.
 */
export const OPACITY_STEPS = [
  0, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100,
] as const;

export type OpacityStep = (typeof OPACITY_STEPS)[number];

export const opacityTokens = Object.fromEntries(
  OPACITY_STEPS.map((step) => [
    step,
    step === 0 ? "0" : step === 100 ? "1" : String(step / 100),
  ]),
) as Record<OpacityStep, string>;

/** Steps carried by the white/black alpha ramps (superset of the legacy 4). */
const ALPHA_RAMP_STEPS = [
  4, 8, 12, 16, 24, 32, 40, 48, 60, 72, 88,
] as const;

const buildAlphaRamp = (
  channel: "255, 255, 255" | "0, 0, 0",
): Record<(typeof ALPHA_RAMP_STEPS)[number], string> =>
  Object.fromEntries(
    ALPHA_RAMP_STEPS.map((step) => [step, `rgba(${channel}, ${step / 100})`]),
  ) as Record<(typeof ALPHA_RAMP_STEPS)[number], string>;

/** Full white-tint ramp, 4%-88%. Widens the 4 stops in `primitiveColors.alpha.white`. */
export const alphaWhiteTokens = buildAlphaRamp("255, 255, 255");
/** Full black-tint ramp, 4%-88%. */
export const alphaBlackTokens = buildAlphaRamp("0, 0, 0");

/**
 * Spacing Scale (contiguous base-4 scale: space.0 -> space.16, step = n * 4px).
 *
 * The scale is deliberately dense: every integer step from 0 to 16 is present
 * so `sx={{ p: 5 }}`, `gap: 7`, `mt: 9` etc. resolve against a real
 * `--spacing-<n>` custom property instead of falling through to ad-hoc
 * `calc(0.25rem * n)` maths (see the `spacing()` resolver in composeMuiTheme).
 */
export const spacingTokens = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  7: "28px",
  8: "32px",
  9: "36px",
  10: "40px",
  11: "44px",
  12: "48px",
  13: "52px",
  14: "56px",
  15: "60px",
  16: "64px",
} as const;

export type SpacingTokens = typeof spacingTokens;

/**
 * Radius Scale (radius.none -> radius.full)
 */
export const radiusTokens = {
  none: "0px",
  xs: "4px",
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "24px",
  full: "9999px",
} as const;

export type RadiusTokens = typeof radiusTokens;

/**
 * Border Width Scale
 *
 * `hairline` is the everyday 1px rule. `thin` (1.5px) reads as a deliberate
 * outline without the weight of `medium`; `thick`/`heavy` are for emphasis
 * frames and brutalist edges.
 */
export const borderWidthTokens = {
  none: "0",
  hairline: "1px",
  thin: "1.5px",
  medium: "2px",
  thick: "3px",
  heavy: "4px",
} as const;

export type BorderWidthTokens = typeof borderWidthTokens;

/**
 * Border Style Scale — the CSS line styles the design language uses, named so
 * a component can say `borderStyle: "var(--border-style-dashed)"` rather than
 * hardcoding the keyword (and so an empty-state dashed frame and a divider
 * dotted rule stay consistent wherever they appear).
 */
export const borderStyleTokens = {
  none: "none",
  solid: "solid",
  dashed: "dashed",
  dotted: "dotted",
  double: "double",
} as const;

export type BorderStyleTokens = typeof borderStyleTokens;

/**
 * Motion Tokens (durations & easings)
 */
export const motionTokens = {
  duration: {
    actionLock: "100ms", // Double-click & rapid submission lock
    quick: "120ms", // Action Locks / Hovers
    base: "240ms", // Modals / Drawers
    smooth: "400ms", // Layout shell collapse
  },
  easing: {
    standard: "cubic-bezier(0.4, 0.0, 0.2, 1)",
    spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  },
} as const;

export type MotionTokens = typeof motionTokens;

/**
 * Touch Target Tokens (Mobile & Accessibility Standards - min 44px)
 */
export const touchTargetTokens = {
  min: "44px",
  comfortable: "48px",
  large: "56px",
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
  borderWidth: BorderWidthTokens;
  borderStyle: BorderStyleTokens;
  opacity: Record<OpacityStep, string>;
  motion: MotionTokens;
  touch: TouchTargetTokens;
  zIndex: ZIndexTokens;
}

export const primitiveTokens: PrimitiveTokenDictionary = {
  colors: primitiveColors,
  spacing: spacingTokens,
  radius: radiusTokens,
  borderWidth: borderWidthTokens,
  borderStyle: borderStyleTokens,
  opacity: opacityTokens,
  motion: motionTokens,
  touch: touchTargetTokens,
  zIndex: zIndexTokens,
};
