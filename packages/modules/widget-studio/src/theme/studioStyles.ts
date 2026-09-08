/**
 * The panel vocabulary lives in @cap/theme, where the widget marketplace
 * drawer reads it too - one definition of what a side panel looks like, so
 * the two cannot drift. Re-exported here so this module's imports stay local.
 */
export {
  CONTROL_HEIGHT,
  RADIUS,
  hoverElevation,
  hairline,
  sectionLabel,
  panelCard,
  panelCardInteractive,
  panelCardSelected,
  primaryAction,
  suggestionPill,
  accentStrip,
  iconTile,
  codeBlock,
} from "@cap/theme";

/**
 * Shared animation keyframes, also from @cap/theme. The pipeline tracker used
 * to declare its own `@keyframes widget-studio-spin` / `-blink` inline; these
 * are the library versions so the studio's motion matches the rest of the app
 * and a spinner is defined once.
 */
export { spin, pulse } from "@cap/theme";
