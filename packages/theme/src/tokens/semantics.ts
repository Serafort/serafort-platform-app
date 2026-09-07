/**
 * Tier 2: Semantic & Multi-Tenant Preset Tokens
 * Context-aware: surface, text, feedback, effect generators, fluid typography, dark/light modes
 */

import { primitiveColors } from "./primitives";
import { brandNeutrals, brandRoles } from "./brand";

export interface SurfaceTokens {
  canvas: string;
  paper: string;
  subtle: string;
  border: string;
}

export const semanticSurfaces = {
  dark: {
    canvas: brandRoles.dark.bg, // Serafort ink
    paper: brandRoles.dark.surface, // Serafort navy
    subtle: brandRoles.dark.bgSubtle,
    border: brandRoles.dark.border,
  },
  light: {
    canvas: brandRoles.light.bg,
    paper: brandNeutrals.fog50,
    subtle: brandNeutrals.fog100,
    border: brandNeutrals.mist300,
  },
} as const;

export const fluidTypographyTokens = {
  // Primary fluid scales (h1..h6 & body)
  display: "clamp(2.25rem, 1.75rem + 3vw, 3.75rem)",
  h1: "clamp(2rem, 1.5rem + 2.5vw, 3.25rem)",
  h2: "clamp(1.75rem, 1.35rem + 2.0vw, 2.75rem)",
  h3: "clamp(1.5rem, 1.25rem + 1.5vw, 2.25rem)",
  h4: "clamp(1.25rem, 1.1rem + 1.0vw, 1.75rem)",
  h5: "clamp(1.125rem, 1.05rem + 0.5vw, 1.375rem)",
  h6: "clamp(1rem, 0.95rem + 0.3vw, 1.15rem)",
  heading: "clamp(1.25rem, 1.1rem + 0.8vw, 1.75rem)", // Widget headers
  subtitle1: "clamp(0.9375rem, 0.9rem + 0.2vw, 1.0625rem)",
  subtitle2: "clamp(0.875rem, 0.84rem + 0.15vw, 0.95rem)",
  body1: "clamp(0.875rem, 0.85rem + 0.15vw, 1rem)",
  body2: "clamp(0.8125rem, 0.8rem + 0.1vw, 0.875rem)",
  body: "clamp(0.875rem, 0.825rem + 0.2vw, 1rem)", // Default content
  caption: "clamp(0.75rem, 0.72rem + 0.1vw, 0.8125rem)", // Help text, badges
} as const;

/**
 * Fluid spacing scale
 * -------------------
 * The fixed `spacingTokens` (4px base grid) are right for component-internal
 * rhythm, but page-level gutters, the gap between major sections and card
 * padding should breathe with the viewport the way `fluidTypographyTokens`
 * already lets type do. Each value is a `clamp(min, preferred, max)` where
 * `preferred` mixes a rem floor with a `vw` term, so layouts tighten on a
 * phone and open up on a wide monitor without a media query.
 */
export const fluidSpacingTokens = {
  /** Inline (left/right) padding for page containers and content wells. */
  gutterInline: "clamp(1rem, 0.6rem + 2vw, 2.5rem)",
  /** Block (top/bottom) padding for page containers. */
  gutterBlock: "clamp(1.5rem, 1rem + 2.5vw, 3.5rem)",
  /** Vertical rhythm between major page sections. */
  sectionGap: "clamp(2.5rem, 1.5rem + 5vw, 6rem)",
  /** Gap between stacked cards / list blocks. */
  stackGap: "clamp(0.75rem, 0.6rem + 0.8vw, 1.25rem)",
  /** Internal padding of a content card or panel. */
  cardPadding: "clamp(1rem, 0.8rem + 1vw, 1.75rem)",
  /** Inline gap between items in a horizontal toolbar / action row. */
  clusterGap: "clamp(0.5rem, 0.4rem + 0.4vw, 0.875rem)",
} as const;

export const effectPresetTokens = {
  glass: {
    bg: "rgba(3, 36, 87, 0.65)", // navy @ 65%
    blur: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    shadow: "0 8px 32px 0 rgba(3, 20, 51, 0.45)",
  },
  liquidGlass: {
    bg: "rgba(255, 255, 255, 0.12)",
    blur: "blur(24px) saturate(180%)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    shadow:
      "inset 0 1px 1px 0 rgba(255, 255, 255, 0.4), 0 12px 36px 0 rgba(3, 20, 51, 0.35)",
  },
  neu: {
    flat: "6px 6px 12px #020E24, -6px -6px 12px #0A1B3D",
    pressed: "inset 4px 4px 8px #020E24, inset -4px -4px 8px #0A1B3D",
  },
  brutal: {
    borderWidth: "2px solid #031433", // brandColors.ink
    offsetShadow: "4px 4px 0px #031433",
  },
  bento: {
    gap: "16px",
    radius: "20px",
  },
} as const;

/**
 * 4 UI States Design Tokens (Loading, Success, Error, Empty)
 */
export const uiStateTokens = {
  loading: {
    skeletonBaseDark: "#0A1B3D",
    skeletonHighlightDark: "#12295A",
    skeletonBaseLight: "#DAE1EE",
    skeletonHighlightLight: "#ECF0F7",
    shimmerDuration: "1.5s",
  },
  success: {
    glowColor: "rgba(22, 163, 74, 0.4)",
    borderGlow: "1px solid rgba(22, 163, 74, 0.5)",
  },
  error: {
    inlineBackground: "rgba(220, 38, 38, 0.08)",
    inlineBorder: "1px solid rgba(220, 38, 38, 0.25)",
    modalGlow: "0 0 24px rgba(220, 38, 38, 0.25)",
  },
  empty: {
    dashedBorder: "1px dashed rgba(199, 209, 227, 0.24)",
    dashedBorderLight: "1px dashed rgba(3, 20, 51, 0.16)",
    padding: "32px 24px",
    borderRadius: "12px",
  },
} as const;

export interface SemanticColors {
  primary: string;
  accent: string;
  primaryHover: string;
  primaryActive: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
}

export const getSemanticColors = (mode: "light" | "dark"): SemanticColors => ({
  primary: primitiveColors.brand[500],
  accent: primitiveColors.accent[500],
  primaryHover: primitiveColors.brand[600],
  primaryActive: primitiveColors.brand[700],
  secondary: primitiveColors.slate[500],
  success: primitiveColors.success[500],
  warning: primitiveColors.warning[500],
  error: primitiveColors.error[500],
  info: primitiveColors.info[500],
  textPrimary:
    mode === "dark" ? primitiveColors.slate[50] : primitiveColors.slate[900],
  textSecondary:
    mode === "dark" ? primitiveColors.slate[400] : primitiveColors.slate[600],
  textTertiary:
    mode === "dark" ? primitiveColors.slate[500] : primitiveColors.slate[400],
});

export interface SemanticTokenDictionary {
  surfaces: typeof semanticSurfaces;
  typography: typeof fluidTypographyTokens;
  fluidSpacing: typeof fluidSpacingTokens;
  effects: typeof effectPresetTokens;
  states: typeof uiStateTokens;
}

export const semanticTokens: SemanticTokenDictionary = {
  surfaces: semanticSurfaces,
  typography: fluidTypographyTokens,
  fluidSpacing: fluidSpacingTokens,
  effects: effectPresetTokens,
  states: uiStateTokens,
};
