import { keyframes } from "@mui/material/styles";

/**
 * Animation keyframe library
 * --------------------------
 * `motionTokens` covers durations and easings, but the actual `@keyframes`
 * were re-declared ad hoc (GlobalStyles has its own `shimmer`, `pulseGlow`,
 * `scaleIn`, ...). These are the reusable ones, as emotion `keyframes` so a
 * `styled()` component or an `sx` prop can drop them straight into an
 * `animation` shorthand:
 *
 *   sx={{ animation: `${shimmer} 1.5s linear infinite` }}
 *
 * `KEYFRAME_CSS` carries the same definitions as raw `@keyframes` strings for
 * the places that inject global stylesheets rather than compose emotion.
 */

/** Left-to-right sweep for skeleton loaders (translate a 100%-wide overlay). */
export const shimmer = keyframes`
  from { transform: translateX(-100%); }
  to   { transform: translateX(100%); }
`;

/** Opacity breathing for "working" / pending affordances. */
export const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.5; }
`;

/** Expanding ring for a tap/click ripple. */
export const ripple = keyframes`
  from { transform: scale(0); opacity: 0.4; }
  to   { transform: scale(2.4); opacity: 0; }
`;

/** Glow breathing for success confirmation borders. */
export const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 12px rgba(22, 163, 74, 0.35); }
  50%      { box-shadow: 0 0 24px rgba(22, 163, 74, 0.65); }
`;

/** Enter: rise and fade in (menus, toasts, popovers). */
export const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/** Enter: scale up from 95% with a fade (dialogs, cards). */
export const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
`;

/** Vertical reveal for accordion / collapsible content. */
export const expandVertical = keyframes`
  from { grid-template-rows: 0fr; opacity: 0; }
  to   { grid-template-rows: 1fr; opacity: 1; }
`;

/** Vertical collapse - the reverse of expandVertical. */
export const collapseVertical = keyframes`
  from { grid-template-rows: 1fr; opacity: 1; }
  to   { grid-template-rows: 0fr; opacity: 0; }
`;

/** Continuous rotation for spinners. */
export const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const keyframeTokens = {
  shimmer,
  pulse,
  ripple,
  pulseGlow,
  fadeInUp,
  scaleIn,
  expandVertical,
  collapseVertical,
  spin,
} as const;

export type KeyframeName = keyof typeof keyframeTokens;

/**
 * The same keyframes as plain CSS text, keyed by a stable public name. For
 * `GlobalStyles` / `<style>` injection where an emotion object is not usable
 * and the animation must be referenced by a fixed name.
 */
export const KEYFRAME_CSS: Record<KeyframeName, string> = {
  shimmer:
    "@keyframes shimmer { from { transform: translateX(-100%); } to { transform: translateX(100%); } }",
  pulse:
    "@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }",
  ripple:
    "@keyframes ripple { from { transform: scale(0); opacity: 0.4; } to { transform: scale(2.4); opacity: 0; } }",
  pulseGlow:
    "@keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 12px rgba(22, 163, 74, 0.35); } 50% { box-shadow: 0 0 24px rgba(22, 163, 74, 0.65); } }",
  fadeInUp:
    "@keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }",
  scaleIn:
    "@keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }",
  expandVertical:
    "@keyframes expandVertical { from { grid-template-rows: 0fr; opacity: 0; } to { grid-template-rows: 1fr; opacity: 1; } }",
  collapseVertical:
    "@keyframes collapseVertical { from { grid-template-rows: 1fr; opacity: 1; } to { grid-template-rows: 0fr; opacity: 0; } }",
  spin: "@keyframes spin { to { transform: rotate(360deg); } }",
};
