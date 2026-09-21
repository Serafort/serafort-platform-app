import type { Theme } from "@mui/material/styles";
import type { CSSObject } from "@emotion/styled";
import type { EffectConfig } from "../types/effects";
import { buildSurfaceEffect } from "./SurfaceEffectFactory";

/**
 * CSS for a surface that follows the app's active global effect.
 *
 * Every chrome surface in the shell - the navbar, the sidebar, the footer,
 * submenu popovers - used to paint `theme.palette.background.paper` directly,
 * so the only thing a style preset could change about them was *which* opaque
 * colour they were. Selecting Glassmorphism left the whole shell as solid as
 * before, which is what "the screens are not glass" describes: the effect was
 * reaching MuiPaper and MuiCard and nothing else.
 *
 * These helpers read the `--effect-*` custom properties that
 * `generateThemeVariables` writes for whichever effect is active, and fall
 * back to the passed-in value when none is (the `standard` effect emits no
 * `--effect-*` at all, and `applyVariableDiff` removes the ones a previous
 * effect left behind). Two properties of that arrangement matter:
 *
 * 1. It survives nesting. The chrome's styles live several levels deep inside
 *    class-chained selectors, so a flat `...overrideStyles` spread at the top
 *    of a styled() factory loses to them on specificity every time. A `var()`
 *    resolves wherever it is written, at whatever depth.
 * 2. It needs no re-render. The variables live on `:root`, so switching effect
 *    repaints the chrome without rebuilding emotion's style sheets.
 */

/** Background + backdrop for an effect-aware surface. */
export const effectSurfaceBackground = (fallbackBackground: string): CSSObject => ({
  backgroundColor: `var(--effect-bg, ${fallbackBackground})`,
  backdropFilter: "var(--effect-backdrop, none)",
  WebkitBackdropFilter: "var(--effect-backdrop, none)",
});

/** Shorthand `border` for an effect-aware surface. */
export const effectSurfaceBorder = (fallbackBorder: string): CSSObject => ({
  border: `var(--effect-border, ${fallbackBorder})`,
});

/** `box-shadow` for an effect-aware surface. */
export const effectSurfaceShadow = (fallbackShadow: string): CSSObject => ({
  boxShadow: `var(--effect-shadow, ${fallbackShadow})`,
});

/** `border-radius` for an effect-aware surface. */
export const effectSurfaceRadius = (fallbackRadius: string): CSSObject => ({
  borderRadius: `var(--effect-radius, ${fallbackRadius})`,
});

export interface EffectSurfaceOptions {
  /** Colour to paint when no effect is active. Defaults to the paper colour. */
  background?: string;
  /** Shorthand border to use when no effect is active. Omit for no border. */
  border?: string;
  /** Shadow to use when no effect is active. Omit to leave box-shadow alone. */
  shadow?: string;
  /** Radius to use when no effect is active. Omit to leave radius alone. */
  radius?: string;
}

/**
 * The full effect-aware surface: background, backdrop, and whichever of
 * border / shadow / radius the caller has a sensible default for.
 */
export const effectSurface = (
  theme: Theme,
  options: EffectSurfaceOptions = {},
): CSSObject => {
  const { background, border, shadow, radius } = options;

  return {
    ...effectSurfaceBackground(background ?? theme.palette.background.paper),
    ...(border ? effectSurfaceBorder(border) : {}),
    ...(shadow ? effectSurfaceShadow(shadow) : {}),
    ...(radius ? effectSurfaceRadius(radius) : {}),
  };
};

/**
 * The ambient wash that sits behind everything when a blur-based effect is
 * active, painted on `body` so that fixed chrome (the sidebar, a floating
 * navbar) blurs it too. `--effect-canvas-image` is only emitted for `glass`
 * and `liquid-glass`; every other effect resolves this to `none` and the page
 * keeps its flat background colour.
 */
export const effectCanvasCss: CSSObject = {
  backgroundImage: "var(--effect-canvas-image, none)",
  backgroundAttachment: "fixed",
  backgroundRepeat: "no-repeat",
};

/**
 * The `--effect-*` variables for one specific effect config, to be set on a
 * single element rather than on `:root`.
 *
 * This is how a per-component override reaches chrome. The Components tab lets
 * a navbar or sidebar opt out of the global effect, but the chrome reads
 * `--effect-*` from `:root`, so an override had nowhere to land - only the
 * horizontal header and the footer honoured one, and they did it by merging a
 * flat style object that lost on specificity to their own nested rules.
 *
 * Custom properties do not have that problem: set on the component's root
 * element they shadow the `:root` values for that element and everything
 * inside it, whatever selector eventually reads them.
 */
export const effectSurfaceVars = (
  config: EffectConfig,
  theme?: Theme,
): CSSObject => {
  if (!config?.globalType || config.globalType === "standard") {
    // An explicit "standard" override has to actively clear the global
    // effect's variables, not merely decline to set its own.
    return {
      "--effect-bg": theme?.palette.background.paper ?? "#ffffff",
      "--effect-backdrop": "none",
      "--effect-border": "none",
      "--effect-shadow": "none",
    } as CSSObject;
  }

  const surface = buildSurfaceEffect(config, theme) as Record<string, unknown>;
  const vars: Record<string, unknown> = {};

  if (surface.background) vars["--effect-bg"] = surface.background;
  vars["--effect-backdrop"] = surface.backdropFilter ?? "none";
  if (surface.border) {
    vars["--effect-border"] = surface.border;
  } else if (surface.borderWidth) {
    vars["--effect-border"] =
      `${surface.borderWidth} ${surface.borderStyle ?? "solid"} ${surface.borderColor ?? "transparent"}`;
  }
  if (surface.boxShadow) vars["--effect-shadow"] = surface.boxShadow;
  if (surface.borderRadius) vars["--effect-radius"] = surface.borderRadius;

  return vars as CSSObject;
};
