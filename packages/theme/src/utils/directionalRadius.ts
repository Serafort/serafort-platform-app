import type { CSSObject } from "@mui/material/styles";
import { radiusTokens } from "../tokens/primitives";

/**
 * Directional border-radius
 * -------------------------
 * `radiusTokens` only carries uniform values, so grouped controls - segmented
 * buttons, button groups, the first/last row of a list, tab strips, the outer
 * shell of an accordion - had no token-level way to round some corners and
 * square the rest. `directionalRadius` fills that gap.
 *
 * It emits the CSS *logical* radius properties (`borderStartStartRadius` &c.),
 * which flip automatically between LTR and RTL - so "round the start edge"
 * stays the leading edge in Arabic without a second code path.
 */

/** A single logical corner. `start`/`end` are writing-direction relative. */
export type RadiusCorner =
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end";

/** A corner, or an edge that expands to the two corners along it. */
export type RadiusEdge = "top" | "bottom" | "start" | "end" | RadiusCorner;

/** Radius scale keys that resolve to a tenant-overridable `--radius-*` var. */
export type RadiusTokenName = keyof typeof radiusTokens;

const EDGE_TO_CORNERS: Record<RadiusEdge, RadiusCorner[]> = {
  top: ["top-start", "top-end"],
  bottom: ["bottom-start", "bottom-end"],
  start: ["top-start", "bottom-start"],
  end: ["top-end", "bottom-end"],
  "top-start": ["top-start"],
  "top-end": ["top-end"],
  "bottom-start": ["bottom-start"],
  "bottom-end": ["bottom-end"],
};

const CORNER_TO_PROPERTY: Record<RadiusCorner, keyof CSSObject> = {
  "top-start": "borderStartStartRadius",
  "top-end": "borderStartEndRadius",
  "bottom-start": "borderEndStartRadius",
  "bottom-end": "borderEndEndRadius",
};

const ALL_CORNERS = Object.keys(CORNER_TO_PROPERTY) as RadiusCorner[];

const isTokenName = (value: unknown): value is RadiusTokenName =>
  typeof value === "string" && value in radiusTokens;

/**
 * Resolve a radius value for use in a style object:
 *  - a scale key (`"md"`) -> `var(--radius-md, 8px)` so a tenant's radius
 *    scale still wins at runtime,
 *  - a number -> `"<n>px"`,
 *  - any other string (`"1rem"`, `"50%"`, a `var(...)`) -> passed through.
 */
export const resolveRadiusValue = (
  value: RadiusTokenName | number | string,
): string => {
  if (isTokenName(value)) {
    return `var(--radius-${value}, ${radiusTokens[value]})`;
  }
  return typeof value === "number" ? `${value}px` : value;
};

export interface DirectionalRadiusOptions {
  /**
   * Also pin every corner *not* named to `0`. This is what a segmented
   * control wants ("round the start, flatten the seam"); set it `false` to
   * leave the other corners to inherit.
   * @default true
   */
  resetUnset?: boolean;
}

/**
 * Build a style object that applies `value` to the corners covered by
 * `edges` (a corner, an edge, or a list of them).
 *
 * @example
 * // First button in a horizontal segmented group
 * sx={{ ...directionalRadius("md", "start") }}
 * @example
 * // Only the two bottom corners, leave the top alone
 * sx={{ ...directionalRadius(12, "bottom", { resetUnset: false }) }}
 */
export const directionalRadius = (
  value: RadiusTokenName | number | string,
  edges: RadiusEdge | RadiusEdge[],
  { resetUnset = true }: DirectionalRadiusOptions = {},
): CSSObject => {
  const list = Array.isArray(edges) ? edges : [edges];
  const targeted = new Set<RadiusCorner>();
  for (const edge of list) {
    for (const corner of EDGE_TO_CORNERS[edge] ?? []) targeted.add(corner);
  }

  const resolved = resolveRadiusValue(value);
  const style: CSSObject = {};

  for (const corner of ALL_CORNERS) {
    const property = CORNER_TO_PROPERTY[corner];
    if (targeted.has(corner)) {
      style[property] = resolved;
    } else if (resetUnset) {
      style[property] = 0;
    }
  }

  return style;
};
