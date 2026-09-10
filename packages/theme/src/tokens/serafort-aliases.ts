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

  vars["--sf-border-1"] = "1px";

  return vars;
};
