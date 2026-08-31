import type { Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";

/**
 * Shared Theme Mixins & Utilities
 * Centralizes common logic for opacity, shadows, and gradients across tokens.
 */

/**
 * Returns the primary main color with a specified opacity.
 * Attempts to use a custom mainOpacity if defined on the theme, otherwise falls back to alpha().
 * @param theme - MUI Theme
 * @param defaultAlpha - The default alpha value to apply (default: 0.16)
 * @returns string (CSS color value)
 */
export const getPrimaryMainOpacity = (
  theme: Theme,
  defaultAlpha: number = 0.16,
): string => {
  return (
    (theme.palette.primary as any).mainOpacity ||
    alpha(theme.palette.primary.main, defaultAlpha)
  );
};

/**
 * Retrieves a custom shadow from the theme, falling back to standard MUI shadows.
 * @param theme - MUI Theme
 * @param customShadowKey - The key to look for inside `theme.customShadows` (e.g., 'sm', 'lg', 'primary.sm')
 * @param fallbackShadowIndex - The index for `theme.shadows` array if custom shadow is not found
 * @returns string (CSS box-shadow value)
 */
export const getCustomShadow = (
  theme: Theme,
  customShadowKey: string,
  fallbackShadowIndex: number,
): string => {
  // Support nested keys like 'primary.sm'
  const keys = customShadowKey.split(".");
  let customShadow = (theme as any).customShadows;
  for (const key of keys) {
    customShadow = customShadow?.[key];
  }

  return customShadow || theme.shadows[fallbackShadowIndex] || "none";
};

/**
 * Generates a direction-aware linear gradient using the primary color.
 * LTR: alpha -> main (270deg)
 * RTL: main -> alpha (270deg)
 * @param theme - MUI Theme
 * @param activeAlpha - Alpha value for the faded part of the gradient
 * @returns string (CSS background gradient value)
 */
export const getDirectionalActiveGradient = (
  theme: Theme,
  activeAlpha: number,
): string => {
  const mainColor = theme.palette.primary.main;
  const alphaColor = alpha(mainColor, activeAlpha);

  return theme.direction === "ltr"
    ? `linear-gradient(270deg, ${alphaColor} 0%, ${mainColor} 100%)`
    : `linear-gradient(270deg, ${mainColor} 100%, ${alphaColor} 100%)`;
};
