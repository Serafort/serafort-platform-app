import { hexToRgba } from "./computeEffects";

/**
 * Gradient engine
 * ---------------
 * Presets and feature modules used to hand-write raw `linear-gradient(...)` /
 * `radial-gradient(...)` strings inline (see the old ambient-canvas block in
 * applyThemeVariables, GlassCard, stepperTokens, ...). This module gives them
 * typed builders and a small dictionary of named recipes so a gradient is
 * declared once and stays consistent.
 *
 * The builders are thin and CSS-faithful - they format arguments, they do not
 * invent behaviour - so anything the CSS spec allows (keywords, `calc()`,
 * custom properties as colours) passes straight through.
 */

export interface GradientStop {
  /** Any CSS <color>: hex, `rgb()/rgba()`, `hsl()`, a keyword, or `var(--x)`. */
  color: string;
  /** Stop position: `"0%"`, `"50%"`, `"12px"`. Omit to let the browser space it. */
  at?: string;
}

const renderStops = (stops: GradientStop[]): string => {
  if (stops.length < 2) {
    throw new Error("A gradient needs at least two colour stops.");
  }
  return stops
    .map((stop) => (stop.at ? `${stop.color} ${stop.at}` : stop.color))
    .join(", ");
};

const withRepeat = (repeating: boolean | undefined, kind: string): string =>
  `${repeating ? "repeating-" : ""}${kind}`;

export interface LinearGradientOptions {
  /**
   * Direction: a number of degrees (CSS convention - `0` points up, `90`
   * points right) or a keyword string like `"to bottom right"`.
   * @default 180
   */
  angle?: number | string;
  stops: GradientStop[];
  repeating?: boolean;
}

export const linearGradient = ({
  angle = 180,
  stops,
  repeating,
}: LinearGradientOptions): string => {
  const direction = typeof angle === "number" ? `${angle}deg` : angle;
  return `${withRepeat(repeating, "linear-gradient")}(${direction}, ${renderStops(
    stops,
  )})`;
};

export interface RadialGradientOptions {
  /** `"circle"` or `"ellipse"`. Omitted lets the browser decide (ellipse). */
  shape?: "circle" | "ellipse";
  /** Extent keyword (`"farthest-corner"`) or explicit size (`"60% 40%"`). */
  size?: string;
  /** Centre point: `"center"`, `"18% 12%"`. A leading `at` is optional. */
  position?: string;
  stops: GradientStop[];
  repeating?: boolean;
}

export const radialGradient = ({
  shape,
  size,
  position = "center",
  stops,
  repeating,
}: RadialGradientOptions): string => {
  const geometry = [shape, size].filter(Boolean).join(" ");
  const at = position ? `at ${position.replace(/^at\s+/, "")}` : "";
  const prelude = [geometry, at].filter(Boolean).join(" ");
  return `${withRepeat(repeating, "radial-gradient")}(${
    prelude ? `${prelude}, ` : ""
  }${renderStops(stops)})`;
};

export interface ConicGradientOptions {
  /** Start angle: degrees or a string like `"45deg"`. */
  from?: number | string;
  /** Centre point: `"center"`, `"50% 50%"`. */
  position?: string;
  stops: GradientStop[];
  repeating?: boolean;
}

export const conicGradient = ({
  from,
  position = "center",
  stops,
  repeating,
}: ConicGradientOptions): string => {
  const fromPart =
    from === undefined
      ? ""
      : `from ${typeof from === "number" ? `${from}deg` : from}`;
  const atPart = position ? `at ${position.replace(/^at\s+/, "")}` : "";
  const prelude = [fromPart, atPart].filter(Boolean).join(" ");
  return `${withRepeat(repeating, "conic-gradient")}(${
    prelude ? `${prelude}, ` : ""
  }${renderStops(stops)})`;
};

/**
 * The four-lobe specular mesh wash that gives a `backdrop-filter` something to
 * reveal behind a glass surface. Generalised from the block that used to live
 * inline in `generateThemeVariables`; `intensity` scales every lobe's alpha
 * for a stronger or subtler wash.
 */
export const brandMeshGradient = (
  primary: string,
  secondary: string = primary,
  { intensity = 1 }: { intensity?: number } = {},
): string =>
  [
    radialGradient({
      position: "18% 12%",
      stops: [
        { color: hexToRgba(primary, 0.28 * intensity), at: "0px" },
        { color: "transparent", at: "55%" },
      ],
    }),
    radialGradient({
      position: "82% 8%",
      stops: [
        { color: hexToRgba(secondary, 0.22 * intensity), at: "0px" },
        { color: "transparent", at: "50%" },
      ],
    }),
    radialGradient({
      position: "70% 88%",
      stops: [
        { color: hexToRgba(primary, 0.18 * intensity), at: "0px" },
        { color: "transparent", at: "55%" },
      ],
    }),
    radialGradient({
      position: "8% 78%",
      stops: [
        { color: hexToRgba(secondary, 0.16 * intensity), at: "0px" },
        { color: "transparent", at: "50%" },
      ],
    }),
  ].join(", ");

/**
 * Named gradient recipes. String-valued entries are ready to use; function
 * entries take the colours they need so a tenant's brand still drives them.
 */
export const gradientTokens = {
  /** 135deg brand sheen for hero panels and primary CTAs. */
  brandSheen: (from: string, to: string): string =>
    linearGradient({ angle: 135, stops: [{ color: from }, { color: to }] }),
  /** Top-down white sheen laid over a glass surface. */
  glassSheen: linearGradient({
    angle: 180,
    stops: [
      { color: "rgba(255, 255, 255, 0.15)", at: "0%" },
      { color: "rgba(255, 255, 255, 0)", at: "100%" },
    ],
  }),
  /** Horizontal sweep for skeleton shimmer overlays. */
  shimmerSweep: (highlight: string): string =>
    linearGradient({
      angle: 90,
      stops: [
        { color: "transparent" },
        { color: highlight },
        { color: "transparent" },
      ],
    }),
  /** Ambient four-lobe mesh wash from the tenant's brand colours. */
  brandMesh: brandMeshGradient,
} as const;
