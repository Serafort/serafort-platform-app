/**
 * Tier 0: Serafort Brand Tokens
 *
 * Verbatim transcription of the Serafort brand kit
 * (`serafort_brand/brand-kit/tokens/tokens.json` + `tokens.css`).
 *
 * This file is the single upstream source for every brand colour in the
 * platform. Tier 1 primitives (`primitives.ts`) derive their ramps from these
 * values — edit here, not there, when the brand kit changes.
 */

/** Brand blues, taken from the wing mark. */
export const brandColors = {
  ink: "#031433",
  navy: "#032457",
  deepBlue: "#0437A2",
  royalBlue: "#044BC4",
  blue: "#047BFA",
  sky: "#06A0FC",
  cyan: "#06CBFD",
} as const;

/** Blue-tinted neutrals, keyed to `brandColors.ink`. */
export const brandNeutrals = {
  white: "#FFFFFF",
  fog50: "#F6F8FC",
  fog100: "#ECF0F7",
  mist300: "#C7D1E3",
  slate500: "#64708A",
  slate600: "#454F68",
  slate800: "#1B2540",
} as const;

/** Semantic feedback colours from the brand kit. */
export const brandSemantics = {
  success: "#16A34A",
  warning: "#D97706",
  error: "#DC2626",
  info: brandColors.blue,
} as const;

/**
 * Role tokens — the brand kit's `--sf-*` role layer. Consumed by the MUI
 * themes and re-emitted as CSS custom properties by `brandCssVariables()`.
 */
export const brandRoles = {
  light: {
    bg: brandNeutrals.white,
    bgSubtle: brandNeutrals.fog50,
    surface: brandNeutrals.white,
    border: brandNeutrals.mist300,
    textPrimary: brandColors.ink,
    textSecondary: brandNeutrals.slate600,
    accent: brandColors.cyan,
    accentStrong: brandColors.blue,
    ctaBg: brandColors.ink,
    ctaText: brandNeutrals.white,
  },
  dark: {
    bg: brandColors.ink,
    bgSubtle: "#0A1B3D",
    surface: brandColors.navy,
    border: "#1B2F5C",
    textPrimary: brandNeutrals.white,
    textSecondary: brandNeutrals.mist300,
    accent: brandColors.cyan,
    accentStrong: brandColors.sky,
    ctaBg: brandColors.cyan,
    ctaText: brandColors.ink,
  },
} as const;

export type BrandRoleMode = keyof typeof brandRoles;

/**
 * Brand typography. `display` is used for headings and the wordmark, `body`
 * for everything else. Both faces are loaded in `app/index.html`; the fallback
 * stacks match the brand kit so an offline/blocked font still renders on-brand.
 */
export const brandTypography = {
  display: {
    family: "Space Grotesk",
    fallback: '"Segoe UI", system-ui, sans-serif',
    stack: '"Space Grotesk", "Segoe UI", system-ui, sans-serif',
    weights: [500, 700],
  },
  body: {
    family: "Inter",
    fallback: '"Segoe UI", system-ui, sans-serif',
    stack: '"Inter", "Segoe UI", system-ui, sans-serif',
    weights: [400, 500, 600],
  },
  mono: {
    stack: '"JetBrains Mono", Consolas, monospace',
  },
} as const;

/**
 * Emits the brand kit's `--sf-*` custom properties for the given mode, so
 * markup copied straight out of the brand kit (collateral, email templates,
 * the error/empty-state reference pages) renders correctly inside the app.
 */
export function brandCssVariables(
  mode: BrandRoleMode = "light",
): Record<string, string> {
  const roles = brandRoles[mode];

  return {
    "--sf-ink": brandColors.ink,
    "--sf-navy": brandColors.navy,
    "--sf-deep-blue": brandColors.deepBlue,
    "--sf-royal-blue": brandColors.royalBlue,
    "--sf-blue": brandColors.blue,
    "--sf-sky": brandColors.sky,
    "--sf-cyan": brandColors.cyan,

    "--sf-white": brandNeutrals.white,
    "--sf-fog-50": brandNeutrals.fog50,
    "--sf-fog-100": brandNeutrals.fog100,
    "--sf-mist-300": brandNeutrals.mist300,
    "--sf-slate-500": brandNeutrals.slate500,
    "--sf-slate-600": brandNeutrals.slate600,
    "--sf-slate-800": brandNeutrals.slate800,

    "--sf-success": brandSemantics.success,
    "--sf-warning": brandSemantics.warning,
    "--sf-error": brandSemantics.error,
    "--sf-info": brandSemantics.info,

    "--sf-bg": roles.bg,
    "--sf-bg-subtle": roles.bgSubtle,
    "--sf-surface": roles.surface,
    "--sf-border": roles.border,
    "--sf-text-primary": roles.textPrimary,
    "--sf-text-secondary": roles.textSecondary,
    "--sf-accent": roles.accent,
    "--sf-accent-strong": roles.accentStrong,
    "--sf-cta-bg": roles.ctaBg,
    "--sf-cta-text": roles.ctaText,

    "--sf-font-display": brandTypography.display.stack,
    "--sf-font-body": brandTypography.body.stack,
  };
}
