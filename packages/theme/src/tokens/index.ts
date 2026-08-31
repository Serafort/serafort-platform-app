/**
 * @cap/theme Design Token System
 * Tier 1: Primitives (Fixed values: scales, raw palettes, durations)
 * Tier 2: Semantics (Context-aware: surfaces, typography, effect generators)
 * Tier 3: Component Overrides (State & element-bound contracts)
 */

export * from './primitives';
export * from './semantics';
export * from './components';

import { primitiveColors, spacingTokens, radiusTokens, motionTokens, zIndexTokens } from './primitives';
import { semanticSurfaces, fluidTypographyTokens, effectPresetTokens } from './semantics';
import { stateComponentTokens, formTokens } from './components';

export interface ThemeTokenDictionary {
  primitives: {
    colors: typeof primitiveColors;
    spacing: typeof spacingTokens;
    radius: typeof radiusTokens;
    motion: typeof motionTokens;
    zIndex: typeof zIndexTokens;
  };
  semantics: {
    surfaces: typeof semanticSurfaces;
    typography: typeof fluidTypographyTokens;
    effects: typeof effectPresetTokens;
  };
  components: {
    state: typeof stateComponentTokens;
    form: typeof formTokens;
  };
}

export const defaultThemeTokens: ThemeTokenDictionary = {
  primitives: {
    colors: primitiveColors,
    spacing: spacingTokens,
    radius: radiusTokens,
    motion: motionTokens,
    zIndex: zIndexTokens,
  },
  semantics: {
    surfaces: semanticSurfaces,
    typography: fluidTypographyTokens,
    effects: effectPresetTokens,
  },
  components: {
    state: stateComponentTokens,
    form: formTokens,
  },
};

/**
 * Compiles 3-Tier Design Tokens into a flat Record<string, string> of CSS Custom Properties
 */
export function tokensToCssVariables(
  mode: 'light' | 'dark' = 'dark',
  customTokens?: Partial<ThemeTokenDictionary>
): Record<string, string> {
  const surfaces = customTokens?.semantics?.surfaces?.[mode] || semanticSurfaces[mode];
  const effects = customTokens?.semantics?.effects || effectPresetTokens;
  const typo = customTokens?.semantics?.typography || fluidTypographyTokens;
  const form = customTokens?.components?.form || formTokens;
  const state = customTokens?.components?.state || stateComponentTokens;

  const vars: Record<string, string> = {
    // Tier 1: Primitive Palette
    '--color-slate-50': primitiveColors.slate[50],
    '--color-slate-100': primitiveColors.slate[100],
    '--color-slate-200': primitiveColors.slate[200],
    '--color-slate-300': primitiveColors.slate[300],
    '--color-slate-400': primitiveColors.slate[400],
    '--color-slate-500': primitiveColors.slate[500],
    '--color-slate-600': primitiveColors.slate[600],
    '--color-slate-700': primitiveColors.slate[700],
    '--color-slate-800': primitiveColors.slate[800],
    '--color-slate-900': primitiveColors.slate[900],
    '--color-slate-950': primitiveColors.slate[950],

    '--color-brand-50': primitiveColors.brand[50],
    '--color-brand-100': primitiveColors.brand[100],
    '--color-brand-200': primitiveColors.brand[200],
    '--color-brand-300': primitiveColors.brand[300],
    '--color-brand-400': primitiveColors.brand[400],
    '--color-brand-500': primitiveColors.brand[500],
    '--color-brand-600': primitiveColors.brand[600],
    '--color-brand-700': primitiveColors.brand[700],
    '--color-brand-800': primitiveColors.brand[800],
    '--color-brand-900': primitiveColors.brand[900],
    '--color-brand-950': primitiveColors.brand[950],

    '--color-success-500': primitiveColors.success[500],
    '--color-success-600': primitiveColors.success[600],
    '--color-success-700': primitiveColors.success[700],

    '--color-warning-500': primitiveColors.warning[500],
    '--color-warning-600': primitiveColors.warning[600],
    '--color-warning-700': primitiveColors.warning[700],

    '--color-error-500': primitiveColors.error[500],
    '--color-error-600': primitiveColors.error[600],
    '--color-error-700': primitiveColors.error[700],

    '--color-info-500': primitiveColors.info[500],
    '--color-info-600': primitiveColors.info[600],
    '--color-info-700': primitiveColors.info[700],

    '--alpha-white-4': primitiveColors.alpha.white[4],
    '--alpha-white-8': primitiveColors.alpha.white[8],
    '--alpha-white-16': primitiveColors.alpha.white[16],
    '--alpha-white-60': primitiveColors.alpha.white[60],

    '--alpha-black-4': primitiveColors.alpha.black[4],
    '--alpha-black-8': primitiveColors.alpha.black[8],
    '--alpha-black-12': primitiveColors.alpha.black[12],
    '--alpha-black-60': primitiveColors.alpha.black[60],

    // Tier 1: Spacing
    '--space-0': spacingTokens[0],
    '--space-1': spacingTokens[1],
    '--space-2': spacingTokens[2],
    '--space-3': spacingTokens[3],
    '--space-4': spacingTokens[4],
    '--space-6': spacingTokens[6],
    '--space-8': spacingTokens[8],
    '--space-12': spacingTokens[12],
    '--space-16': spacingTokens[16],

    // Tier 1: Radii
    '--radius-none': radiusTokens.none,
    '--radius-xs': radiusTokens.xs,
    '--radius-sm': radiusTokens.sm,
    '--radius-md': radiusTokens.md,
    '--radius-lg': radiusTokens.lg,
    '--radius-xl': radiusTokens.xl,
    '--radius-2xl': radiusTokens['2xl'],
    '--radius-full': radiusTokens.full,

    // Tier 1: Motion
    '--motion-duration-quick': motionTokens.duration.quick,
    '--motion-duration-base': motionTokens.duration.base,
    '--motion-duration-smooth': motionTokens.duration.smooth,
    '--motion-easing-standard': motionTokens.easing.standard,
    '--motion-easing-spring': motionTokens.easing.spring,

    // Tier 1: Touch Target Scale (Min 44px)
    '--touch-target-min': '44px',
    '--touch-target-comfortable': '48px',
    '--touch-target-large': '56px',

    // Tier 1: Z-Index
    '--z-index-base': String(zIndexTokens.base),
    '--z-index-header': String(zIndexTokens.header),
    '--z-index-drawer': String(zIndexTokens.drawer),
    '--z-index-modal': String(zIndexTokens.modal),
    '--z-index-toast': String(zIndexTokens.toast),

    // Tier 2: Surfaces
    '--surface-canvas': surfaces.canvas,
    '--surface-paper': surfaces.paper,
    '--surface-subtle': surfaces.subtle,
    '--surface-border': surfaces.border,

    // Tier 2: Fluid Typography
    '--font-display': typo.display,
    '--font-h1': typo.h1,
    '--font-h2': typo.h2,
    '--font-h3': typo.h3,
    '--font-h4': typo.h4,
    '--font-h5': typo.h5,
    '--font-h6': typo.h6,
    '--font-heading': typo.heading,
    '--font-subtitle1': typo.subtitle1,
    '--font-subtitle2': typo.subtitle2,
    '--font-body1': typo.body1,
    '--font-body2': typo.body2,
    '--font-body': typo.body,
    '--font-caption': typo.caption,

    // Tier 2: Effect Presets
    '--glass-bg': effects.glass.bg,
    '--glass-blur': effects.glass.blur,
    '--glass-border': effects.glass.border,
    '--glass-shadow': effects.glass.shadow,

    '--liquid-glass-bg': effects.liquidGlass?.bg || 'rgba(255, 255, 255, 0.12)',
    '--liquid-glass-blur': effects.liquidGlass?.blur || 'blur(24px) saturate(180%)',
    '--liquid-glass-border': effects.liquidGlass?.border || '1px solid rgba(255, 255, 255, 0.2)',
    '--liquid-glass-shadow': effects.liquidGlass?.shadow || 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.4), 0 12px 36px 0 rgba(0, 0, 0, 0.35)',

    '--neu-flat': effects.neu.flat,
    '--neu-pressed': effects.neu.pressed,

    '--brutal-border-width': effects.brutal.borderWidth,
    '--brutal-offset-shadow': effects.brutal.offsetShadow,

    '--bento-gap': effects.bento.gap,
    '--bento-radius': effects.bento.radius,

    // Tier 3: Form Contracts
    '--form-input-height': form.input.height,
    '--form-input-radius': form.input.radius,
    '--form-input-padding-inline': form.input.paddingInline,
    '--form-input-bg': form.input.background,
    '--form-input-border': form.input.border,
    '--form-input-focus-border': form.input.focusBorder,
    '--form-input-focus-ring': form.input.focusRing,
    '--form-input-label-scale': form.input.floatingLabelScale,
    '--form-input-label-translate': form.input.floatingLabelTranslate,

    '--form-button-height-primary': form.button.heightPrimary,
    '--form-button-height-large': form.button.heightLarge,
    '--form-button-radius': form.button.radius,
    '--form-button-primary-bg': form.button.primaryBg,
    '--form-button-primary-hover-bg': form.button.primaryHoverBg,
    '--form-button-primary-active-bg': form.button.primaryActiveBg,
    '--form-button-disabled-opacity': String(form.button.disabledOpacity),

    '--form-modal-backdrop-filter': form.modal.backdropFilter,
    '--form-modal-backdrop-bg': form.modal.backdropBg,
    '--form-modal-radius': form.modal.radius,
    '--form-modal-max-width': form.modal.maxWidth,

    // Tier 3: State Contracts
    '--state-empty-icon-size': state.empty.iconSize,
    '--state-empty-icon-color': state.empty.iconColor,
    '--state-empty-title-font': state.empty.titleTypography,
    '--state-empty-dashed-border': state.empty.canvasDashedBorder,

    '--state-loading-skeleton-base': state.loading.skeletonBase,
    '--state-loading-skeleton-highlight': state.loading.skeletonHighlight,
    '--state-loading-shimmer-duration': state.loading.shimmerDuration,
    '--state-loading-action-lock-duration': `${state.loading.actionLockDuration}ms`,
    '--state-loading-spinner-track': state.loading.spinnerTrack,

    '--state-error-border': state.error.fieldBorder,
    '--state-error-focus-ring': state.error.fieldFocusRing,
    '--state-error-badge-bg': state.error.badgeBackground,
    '--state-error-message-color': state.error.messageColor,

    '--state-success-icon-color': state.success.iconCheckColor,
    '--state-success-glow-highlight': state.success.glowHighlight,
    '--state-success-banner-bg': state.success.bannerBackground,
  };

  return vars;
}
