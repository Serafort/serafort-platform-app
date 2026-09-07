import { alpha } from "@mui/material/styles";
import type { CSSObject, Theme } from "@mui/material/styles";

/**
 * One vocabulary for the app's side panels - the widget marketplace, the AI
 * Widget Studio, and anything else that opens as a drawer full of cards.
 *
 * Every value resolves through `theme.palette`, never a literal, so a panel
 * follows the tenant's theme and every style preset the theme editor can
 * apply. Both panels used to reach for gradients, coloured glows, accent
 * rings and lifted hover transforms, all hard-wired to primary and secondary:
 * one accent, hairline borders, a single elevation on hover, and controls
 * that meet the 44px target the rest of the app uses (see MuiButton's
 * minHeight override in this package).
 */

/** Minimum interactive height used across the app's controls. */
export const CONTROL_HEIGHT = 44;

/** Radii, matching the borderRadius tokens in @cap/theme (md / lg / full). */
export const RADIUS = {
  /** Small tag or badge sitting inside a row. */
  tag: "4px",
  control: "8px",
  card: "12px",
  pill: "999px",
} as const;

/**
 * `customShadows` is a module augmentation that is not reliably in scope from
 * every consumer - menuItemStyles.ts in @cap/layout reaches for it the same
 * guarded way - so this falls back to the MUI elevation of the same weight
 * rather than widening the type.
 */
type ThemeWithCustomShadows = Theme & {
  customShadows?: { sm?: string };
};

export const hoverElevation = (theme: Theme): string =>
  (theme as ThemeWithCustomShadows).customShadows?.sm ?? theme.shadows[2];

/**
 * Border colour for surfaces inside the panel. The full divider token is the
 * app's mist-300, which reads as a hard rule when it is repeated down a list
 * of a dozen cards; at 55% it separates without drawing the eye.
 */
export const hairline = (theme: Theme): string =>
  alpha(theme.palette.divider, 0.55);

/** Section heading: the small uppercase label above each group. */
export const sectionLabel: CSSObject = {
  display: "block",
  fontSize: "0.6875rem",
  fontWeight: 600,
  lineHeight: 1.45,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

/** A card in the panel body - a widget row, a draft, an agent step. */
export const panelCard = (theme: Theme): CSSObject => ({
  borderRadius: RADIUS.card,
  border: `1px solid ${hairline(theme)}`,
  backgroundColor: theme.palette.background.paper,
});

/** Hover affordance for a card that can be clicked. */
export const panelCardInteractive = (theme: Theme): CSSObject => ({
  ...panelCard(theme),
  cursor: "pointer",
  transition: theme.transitions.create(["border-color", "box-shadow"], {
    duration: 150,
  }),
  "&:hover": {
    borderColor: theme.palette.primary.main,
    boxShadow: hoverElevation(theme),
  },
});

/** The selected state of such a card: accent border, faint accent wash. */
export const panelCardSelected = (theme: Theme): CSSObject => ({
  borderColor: theme.palette.primary.main,
  backgroundColor: alpha(theme.palette.primary.main, 0.06),
});

/**
 * The primary action. Deliberately flat: the gradient-plus-glow treatment it
 * replaces made a single button the loudest thing on the panel and ignored
 * the tenant's palette, since both stops were hard-wired to primary and
 * secondary.
 */
export const primaryAction: CSSObject = {
  minHeight: CONTROL_HEIGHT,
  borderRadius: RADIUS.control,
  boxShadow: "none",
  textTransform: "none",
  fontWeight: 600,
  "&:hover": { boxShadow: "none" },
};

/** A quiet suggestion pill - example prompts, filters. */
export const suggestionPill = (theme: Theme): CSSObject => ({
  height: 30,
  borderRadius: RADIUS.pill,
  border: `1px solid ${hairline(theme)}`,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.secondary,
  fontSize: "0.75rem",
  fontWeight: 500,
  transition: theme.transitions.create(
    ["background-color", "border-color", "color"],
    { duration: 150 },
  ),
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    borderColor: alpha(theme.palette.primary.main, 0.4),
    color: theme.palette.primary.main,
  },
});

/** The tinted strip that introduces an input - a generator or prompt block. */
export const accentStrip = (theme: Theme): CSSObject => ({
  borderRadius: RADIUS.card,
  border: `1px solid ${hairline(theme)}`,
  backgroundColor: alpha(theme.palette.primary.main, 0.06),
});

/** A small square tile holding an icon, at the head of a row or a header. */
export const iconTile = (theme: Theme, size = 40): CSSObject => ({
  flexShrink: 0,
  width: size,
  height: size,
  borderRadius: RADIUS.control,
  backgroundColor: alpha(
    theme.palette.mode === "dark"
      ? theme.palette.common.white
      : theme.palette.text.primary,
    theme.palette.mode === "dark" ? 0.06 : 0.04,
  ),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

/** Monospace block for generated source - the DSL, streamed agent output. */
export const codeBlock = (theme: Theme): CSSObject => ({
  margin: 0,
  padding: theme.spacing(3),
  borderRadius: RADIUS.control,
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${hairline(theme)}`,
  fontFamily: "var(--font-mono, 'JetBrains Mono', Consolas, monospace)",
  fontSize: "0.6875rem",
  lineHeight: 1.6,
  color: theme.palette.text.secondary,
  overflow: "auto",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
});
