/**
 * Serafort `--sf-*` scale aliases
 * ------------------------------
 * The brand kit (`serafort_brand/brand-kit/tokens/tokens.css`) spells the
 * design scales with an `--sf-` prefix: `--sf-space-4`, `--sf-radius-lg`,
 * `--sf-shadow-md`, `--sf-error-text`. The platform's own tokens are emitted
 * unprefixed (`--space-4`, `--radius-lg`, …) plus a small `--sf-*` *role*
 * layer from `brand.ts`. This module bridges the two so markup lifted straight
 * out of the brand kit — collateral, email templates, the error/empty-state
 * reference pages — resolves the same scale values the rest of the app uses.
 *
 * Every alias points at the platform token it mirrors; there is no second
 * source of truth. The spacing and radius aliases are mode-independent; the
 * shadow and text aliases resolve per mode, exactly like their unprefixed
 * counterparts.
 */

import { spacingTokens, radiusTokens } from "./primitives";
import { semanticTextColors } from "./semantics";
import { elevationShadowCssVars } from "../utils/elevation";

/**
 * The full `--sf-*` scale-alias map for a mode:
 *  - `--sf-space-0` … `--sf-space-32` (4px grid, 0-128px)
 *  - `--sf-radius-none` … `--sf-radius-full`
 *  - `--sf-shadow-xs` … `--sf-shadow-xl` + `--sf-shadow-glow` (ink-tinted ramp)
 *  - `--sf-success-text` / `--sf-warning-text` / `--sf-error-text` /
 *    `--sf-info-text` (WCAG-AA feedback text colours)
 *  - `--sf-border-1` — the hairline border width the brand kit pairs with the
 *    `--sf-border` colour role already emitted by `brandCssVariables`.
 */
export const serafortAliasCssVars = (
  mode: "light" | "dark",
): Record<string, string> => {
  const vars: Record<string, string> = {};

  for (const [step, value] of Object.entries(spacingTokens)) {
    vars[`--sf-space-${step}`] = value;
  }

  for (const [name, value] of Object.entries(radiusTokens)) {
    vars[`--sf-radius-${name}`] = value;
  }

  const shadow = elevationShadowCssVars(mode);
  vars["--sf-shadow-xs"] = shadow["--shadow-xs"];
  vars["--sf-shadow-sm"] = shadow["--shadow-sm"];
  vars["--sf-shadow-md"] = shadow["--shadow-md"];
  vars["--sf-shadow-lg"] = shadow["--shadow-lg"];
  vars["--sf-shadow-xl"] = shadow["--shadow-xl"];
  vars["--sf-shadow-glow"] = shadow["--shadow-glow"];

  const text = semanticTextColors[mode];
  vars["--sf-success-text"] = text.successText;
  vars["--sf-warning-text"] = text.warningText;
  vars["--sf-error-text"] = text.errorText;
  vars["--sf-info-text"] = text.infoText;

  // Border widths from brand foundations
  vars["--sf-border-0"] = "0px";
  vars["--sf-border-1"] = "1px";
  vars["--sf-border-2"] = "2px";
  vars["--sf-border-4"] = "4px";

  // Semantic background and border tints
  if (mode === "dark") {
    vars["--sf-success-bg"] = "rgba(22, 163, 74, 0.14)";
    vars["--sf-success-border"] = "rgba(22, 163, 74, 0.4)";
    vars["--sf-warning-bg"] = "rgba(217, 119, 6, 0.14)";
    vars["--sf-warning-border"] = "rgba(217, 119, 6, 0.4)";
    vars["--sf-error-bg"] = "rgba(220, 38, 38, 0.14)";
    vars["--sf-error-border"] = "rgba(220, 38, 38, 0.4)";
    vars["--sf-info-bg"] = "rgba(4, 123, 250, 0.14)";
    vars["--sf-info-border"] = "rgba(4, 123, 250, 0.4)";

    vars["--sf-surface-sunken"] = "#0D2653";
    vars["--sf-text-tertiary"] = "#8CA0C6";
    vars["--sf-field-bg"] = "#0D2653";
    vars["--sf-swatch-border"] = "rgba(255, 255, 255, 0.12)";
    vars["--sf-link"] = "#06CBFD";
  } else {
    vars["--sf-success-bg"] = "#EAF8EE";
    vars["--sf-success-border"] = "#B7E4C4";
    vars["--sf-warning-bg"] = "#FEF6E7";
    vars["--sf-warning-border"] = "#F3D89B";
    vars["--sf-error-bg"] = "#FDECEC";
    vars["--sf-error-border"] = "#F3B8B8";
    vars["--sf-info-bg"] = "#EAF3FF";
    vars["--sf-info-border"] = "#B9D9FF";

    vars["--sf-surface-sunken"] = "#ECF0F7";
    vars["--sf-text-tertiary"] = "#64708A";
    vars["--sf-field-bg"] = "#FFFFFF";
    vars["--sf-swatch-border"] = "rgba(3, 20, 51, 0.08)";
    vars["--sf-link"] = "#0437A2";
  }

  // Sizing scale (keyed to 4px units)
  vars["--sf-size-3"] = "12px";
  vars["--sf-size-4"] = "16px";
  vars["--sf-size-5"] = "20px";
  vars["--sf-size-6"] = "24px";
  vars["--sf-size-8"] = "32px";
  vars["--sf-size-10"] = "40px";
  vars["--sf-size-12"] = "48px";
  vars["--sf-size-16"] = "64px";

  // Motion tokens
  vars["--sf-duration-fast"] = "120ms";
  vars["--sf-duration-base"] = "180ms";
  vars["--sf-duration-slow"] = "280ms";
  vars["--sf-ease-standard"] = "cubic-bezier(0.4, 0, 0.2, 1)";
  vars["--sf-ease-out"] = "cubic-bezier(0, 0, 0.2, 1)";
  vars["--sf-ease-in"] = "cubic-bezier(0.4, 0, 1, 1)";

  // Z-index layer hierarchy
  vars["--sf-z-base"] = "0";
  vars["--sf-z-dropdown"] = "100";
  vars["--sf-z-sticky"] = "200";
  vars["--sf-z-overlay"] = "300";
  vars["--sf-z-modal"] = "400";
  vars["--sf-z-toast"] = "500";
  vars["--sf-z-tooltip"] = "600";

  // Type scale (rem-based)
  vars["--sf-text-2xs"] = "0.6875rem";
  vars["--sf-text-xs"] = "0.75rem";
  vars["--sf-text-sm"] = "0.8125rem";
  vars["--sf-text-base"] = "0.875rem";
  vars["--sf-text-md"] = "0.9375rem";
  vars["--sf-text-lg"] = "1.0625rem";
  vars["--sf-text-xl"] = "1.4375rem";
  vars["--sf-text-2xl"] = "1.875rem";
  vars["--sf-text-3xl"] = "2.375rem";

  return vars;
};
