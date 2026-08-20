import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  primitiveColors,
  spacingTokens,
  radiusTokens,
  motionTokens,
  zIndexTokens,
  primitiveTokens,
} from './primitives';
import {
  semanticSurfaces,
  fluidTypographyTokens,
  effectPresetTokens,
  getSemanticColors,
} from './semantics';
import {
  stateComponentTokens,
  formTokens,
  getStateStyles,
} from './components';
import {
  tokensToCssVariables,
  defaultThemeTokens,
} from './index';
import { applyThemeVariablesSync } from '../utils/applyThemeVariables';

describe('Design Token Architecture Hierarchy', () => {
  describe('Tier 1: Primitive Tokens', () => {
    it('defines brand, slate, semantic color scales, and alpha values', () => {
      expect(primitiveColors.slate[50]).toBe('#F8FAFC');
      expect(primitiveColors.slate[900]).toBe('#0F172A');
      expect(primitiveColors.brand[500]).toBe('#6366F1');
      expect(primitiveColors.brand[600]).toBe('#4F46E5');
      expect(primitiveColors.success[500]).toBe('#10B981');
      expect(primitiveColors.warning[500]).toBe('#F59E0B');
      expect(primitiveColors.error[500]).toBe('#EF4444');
      expect(primitiveColors.info[500]).toBe('#3B82F6');
      expect(primitiveColors.alpha.white[16]).toBe('rgba(255,255,255,0.16)');
      expect(primitiveColors.alpha.black[60]).toBe('rgba(0,0,0,0.60)');
    });

    it('defines base-4 spacing scale from space.0 to space.16', () => {
      expect(spacingTokens[0]).toBe('0px');
      expect(spacingTokens[1]).toBe('4px');
      expect(spacingTokens[2]).toBe('8px');
      expect(spacingTokens[4]).toBe('16px');
      expect(spacingTokens[6]).toBe('24px');
      expect(spacingTokens[8]).toBe('32px');
      expect(spacingTokens[12]).toBe('48px');
      expect(spacingTokens[16]).toBe('64px');
    });

    it('defines radius scale from none to full', () => {
      expect(radiusTokens.none).toBe('0px');
      expect(radiusTokens.sm).toBe('4px');
      expect(radiusTokens.md).toBe('8px');
      expect(radiusTokens.lg).toBe('12px');
      expect(radiusTokens.xl).toBe('16px');
      expect(radiusTokens['2xl']).toBe('24px');
      expect(radiusTokens.full).toBe('9999px');
    });

    it('defines motion duration and easing scales', () => {
      expect(motionTokens.duration.quick).toBe('120ms');
      expect(motionTokens.duration.base).toBe('240ms');
      expect(motionTokens.duration.smooth).toBe('400ms');
      expect(motionTokens.easing.standard).toBe('cubic-bezier(0.4, 0.0, 0.2, 1)');
      expect(motionTokens.easing.spring).toBe('cubic-bezier(0.175, 0.885, 0.32, 1.275)');
    });

    it('defines z-index layer hierarchy', () => {
      expect(zIndexTokens.base).toBe(0);
      expect(zIndexTokens.header).toBe(100);
      expect(zIndexTokens.drawer).toBe(500);
      expect(zIndexTokens.modal).toBe(1000);
      expect(zIndexTokens.toast).toBe(2000);
    });

    it('exports complete primitiveTokens dictionary object', () => {
      expect(primitiveTokens.colors).toBe(primitiveColors);
      expect(primitiveTokens.spacing).toBe(spacingTokens);
      expect(primitiveTokens.radius).toBe(radiusTokens);
      expect(primitiveTokens.motion).toBe(motionTokens);
      expect(primitiveTokens.zIndex).toBe(zIndexTokens);
    });
  });

  describe('Tier 2: Semantic & Multi-Tenant Preset Tokens', () => {
    it('defines surface hierarchy for dark and light modes', () => {
      expect(semanticSurfaces.dark.canvas).toBe('#0D0D12');
      expect(semanticSurfaces.dark.paper).toBe('#17171F');
      expect(semanticSurfaces.light.canvas).toBe('#FFFFFF');
      expect(semanticSurfaces.light.paper).toBe('#F8FAFC');
    });

    it('defines fluid typography clamp scales', () => {
      expect(fluidTypographyTokens.display).toBe('clamp(2.25rem, 1.75rem + 3vw, 3.75rem)');
      expect(fluidTypographyTokens.h1).toBe('clamp(2rem, 1.5rem + 2.5vw, 3.25rem)');
      expect(fluidTypographyTokens.heading).toBe('clamp(1.25rem, 1.1rem + 0.8vw, 1.75rem)');
      expect(fluidTypographyTokens.body).toBe('clamp(0.875rem, 0.825rem + 0.2vw, 1rem)');
      expect(fluidTypographyTokens.caption).toBe('clamp(0.75rem, 0.72rem + 0.1vw, 0.8125rem)');
    });

    it('defines visual effect presets (Glassmorphism, Liquid Glass, Neumorphism, Brutalism, Bento)', () => {
      expect(effectPresetTokens.glass.bg).toBe('rgba(23, 23, 31, 0.65)');
      expect(effectPresetTokens.glass.blur).toBe('blur(16px)');
      expect(effectPresetTokens.liquidGlass.blur).toBe('blur(24px) saturate(180%)');
      expect(effectPresetTokens.neu.flat).toBe('6px 6px 12px #101016, -6px -6px 12px #1e1e28');
      expect(effectPresetTokens.brutal.borderWidth).toBe('2px solid #000000');
      expect(effectPresetTokens.bento.gap).toBe('16px');
      expect(effectPresetTokens.bento.radius).toBe('20px');
    });

    it('resolves semantic colors based on theme mode', () => {
      const darkColors = getSemanticColors('dark');
      const lightColors = getSemanticColors('light');
      expect(darkColors.textPrimary).toBe(primitiveColors.slate[50]);
      expect(lightColors.textPrimary).toBe(primitiveColors.slate[900]);
    });
  });

  describe('Tier 3: The 4 UI States & Component Token Contracts', () => {
    it('defines 4 UI state tokens: Idle/Empty, Loading/Shimmer, Error/Lockout, Success/Feedback', () => {
      expect(stateComponentTokens.empty.iconSize).toBe('48px');
      expect(stateComponentTokens.loading.actionLockDuration).toBe(120);
      expect(stateComponentTokens.loading.shimmerDuration).toBe('1.5s ease-in-out infinite');
      expect(stateComponentTokens.error.fieldFocusRing).toBe('0 0 0 3px rgba(239, 68, 68, 0.2)');
      expect(stateComponentTokens.success.iconCheckColor).toBe('var(--color-success-500, #10B981)');
    });

    it('defines form, button, and modal token contracts', () => {
      expect(formTokens.input.height).toBe('48px');
      expect(formTokens.input.paddingInline).toBe('16px');
      expect(formTokens.input.floatingLabelScale).toBe('0.75');
      expect(formTokens.button.heightPrimary).toBe('44px');
      expect(formTokens.button.heightLarge).toBe('52px');
      expect(formTokens.button.disabledOpacity).toBe('0.45');
      expect(formTokens.modal.backdropFilter).toBe('blur(8px)');
      expect(formTokens.modal.maxWidth).toBe('480px');
    });

    it('generates state helper styles for each state', () => {
      const emptyStyles = getStateStyles('empty');
      const loadingStyles = getStateStyles('loading');
      const errorStyles = getStateStyles('error');
      const successStyles = getStateStyles('success');

      expect(emptyStyles.display).toBe('flex');
      expect(loadingStyles.position).toBe('relative');
      expect(errorStyles.border).toBe(stateComponentTokens.error.fieldBorder);
      expect(successStyles.boxShadow).toBe(stateComponentTokens.success.glowHighlight);
    });
  });

  describe('Delivery Pipeline: tokensToCssVariables & applyThemeVariablesSync', () => {
    it('generates complete flat CSS variable map with fluid clamp typography and effect presets', () => {
      const cssVars = tokensToCssVariables('dark');

      expect(cssVars['--color-brand-500']).toBe('#6366F1');
      expect(cssVars['--space-4']).toBe('16px');
      expect(cssVars['--radius-md']).toBe('8px');
      expect(cssVars['--touch-target-min']).toBe('44px');
      expect(cssVars['--motion-duration-quick']).toBe('120ms');
      expect(cssVars['--z-index-modal']).toBe('1000');
      expect(cssVars['--surface-canvas']).toBe('#0D0D12');
      expect(cssVars['--font-display']).toBe('clamp(2.25rem, 1.75rem + 3vw, 3.75rem)');
      expect(cssVars['--font-h1']).toBe('clamp(2rem, 1.5rem + 2.5vw, 3.25rem)');
      expect(cssVars['--glass-blur']).toBe('blur(16px)');
      expect(cssVars['--liquid-glass-blur']).toBe('blur(24px) saturate(180%)');
      expect(cssVars['--form-input-height']).toBe('48px');
      expect(cssVars['--form-button-height-primary']).toBe('44px');
      expect(cssVars['--form-modal-backdrop-filter']).toBe('blur(8px)');
      expect(cssVars['--state-loading-action-lock-duration']).toBe('120ms');
    });

    it('batches CSS variable updates to document element in requestAnimationFrame', () => {
      let rAFCallback: FrameRequestCallback | null = null;
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        rAFCallback = cb;
        return 1;
      });

      const setPropertySpy = vi.spyOn(document.documentElement.style, 'setProperty');

      const testTokens = {
        '--color-brand-500': '#6366F1',
        '--form-input-height': '48px',
      };

      applyThemeVariablesSync(testTokens);

      expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);

      // Execute queued rAF batch
      if (rAFCallback) {
        (rAFCallback as FrameRequestCallback)(0);
      }

      expect(setPropertySpy).toHaveBeenCalledWith('--color-brand-500', '#6366F1');
      expect(setPropertySpy).toHaveBeenCalledWith('--form-input-height', '48px');
    });
  });
});
