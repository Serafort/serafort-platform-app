import type { Theme } from "@mui/material/styles";
import type { SystemMode } from "@cap/shared-types";

/**
 * Elevation engine
 * ----------------
 * A single algorithmic source for the 25-level MUI shadow ramp
 * (`theme.shadows[0..24]`), plus the dark-mode ambient-depth treatment that
 * keeps a raised surface legible when it sits on a canvas almost its own
 * colour.
 *
 * Why generate rather than hand-write:
 *  - MUI's stock ramp is pure `rgba(0, 0, 0, x)`. On the dark canvas
 *    (`#031433` / OLED `#09090b`) a black drop shadow has near-zero contrast,
 *    so every Card, Menu and Popover reads as flat unless a glass/neu effect
 *    is active. The generated ramp tints every level with the mode's own
 *    ground colour and lifts the alphas in dark mode.
 *  - Only five indices (1, 4, 8, 16, 24) were ever wired to tenant
 *    `--shadow-*` custom properties; the other twenty fell back to the stock
 *    values and drifted out of character. One formula keeps all 25 coherent.
 */

/** Umbra/ground colour per mode - the historical shadow tint of each canvas. */
const GROUND: Record<SystemMode, string> = {
  light: "47, 43, 61",
  dark: "19, 17, 32",
};

/**
 * Dark surfaces need more than a shadow to separate from a same-coloured
 * ground. A 1px top highlight reads as light catching the raised edge; a
 * hairline containment ring gives the whole surface a crisp border where a
 * soft shadow alone would dissolve. Both are deliberately faint - enough to
 * register, not enough to look like a stroke.
 */
const DARK_EDGE_HIGHLIGHT = "inset 0px 1px 0px 0px rgba(255, 255, 255, 0.05)";
const DARK_CONTAINMENT_RING = "0px 0px 0px 1px rgba(255, 255, 255, 0.04)";

export interface ElevationScaleOptions {
  /**
   * Fold the dark-mode edge highlight + containment ring into every non-zero
   * level. Defaults to `true` in dark mode and `false` in light mode; pass it
   * explicitly to force either way (e.g. a preset that paints its own depth).
   */
  ambientDepth?: boolean;
}

/** One elevation level (i in 1..24) as a comma-joined box-shadow list. */
const buildLevel = (
  i: number,
  ground: string,
  alphas: readonly [number, number, number],
  ambientDepth: boolean,
): string => {
  const [aUmbra, aPenumbra, aAmbient] = alphas;

  // Three physically-motivated layers whose offset, blur and spread all grow
  // monotonically with i: a tight key shadow, a softer penumbra, and a wide
  // ambient occlusion.
  const umbra = `0px ${Math.round(i * 0.5 + 1)}px ${Math.round(
    i * 0.6 + 1,
  )}px ${-Math.round(i * 0.3 + 1)}px rgba(${ground}, ${aUmbra})`;

  const penumbra = `0px ${Math.round(i + 1)}px ${Math.round(
    i * 1.6 + 2,
  )}px ${Math.round(i * 0.12)}px rgba(${ground}, ${aPenumbra})`;

  const ambient = `0px ${Math.round(i * 0.4 + 1)}px ${Math.round(
    i * 2 + 3,
  )}px ${Math.round(i * 0.25 + 1)}px rgba(${ground}, ${aAmbient})`;

  const layers = [umbra, penumbra, ambient];

  if (ambientDepth) {
    // Highlight paints on top (listed first); the ring sits under the drops.
    layers.unshift(DARK_EDGE_HIGHLIGHT);
    layers.push(DARK_CONTAINMENT_RING);
  }

  return layers.join(", ");
};

/**
 * Build the full 25-entry elevation ramp for a mode. Index 0 is `"none"`;
 * 1..24 climb monotonically. Every level shares the mode's ground colour and,
 * in dark mode, the ambient-depth treatment - so a surface at level 1 and a
 * surface at level 24 read as the same material lit the same way.
 */
export const elevationScale = (
  mode: SystemMode,
  { ambientDepth = mode === "dark" }: ElevationScaleOptions = {},
): Theme["shadows"] => {
  const ground = GROUND[mode];
  // A dark shadow on a dark ground needs more opacity to register at all.
  const alphas =
    mode === "light"
      ? ([0.2, 0.14, 0.12] as const)
      : ([0.34, 0.26, 0.22] as const);

  return [
    "none",
    ...Array.from({ length: 24 }, (_, idx) =>
      buildLevel(idx + 1, ground, alphas, ambientDepth),
    ),
  ] as Theme["shadows"];
};

/**
 * Wrap a single ready-made box-shadow with the dark-mode edge highlight and
 * containment ring. For surfaces that set their own `boxShadow` from a token
 * (`theme.customShadows.md`, an effect's `--effect-shadow`) rather than from
 * the numeric ramp. A no-op outside dark mode.
 */
export const withAmbientDepth = (
  boxShadow: string,
  mode: SystemMode,
): string => {
  if (mode !== "dark" || !boxShadow || boxShadow === "none") return boxShadow;
  return `${DARK_EDGE_HIGHLIGHT}, ${boxShadow}, ${DARK_CONTAINMENT_RING}`;
};
