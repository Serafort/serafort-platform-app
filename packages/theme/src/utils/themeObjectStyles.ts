import type { CSSProperties } from 'react';
import type { Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import type { ComponentStyles, EffectConfig, TenantThemeConfig } from '../types';
import { DEFAULT_COMPONENT_STYLES } from '../types/componentStyles';
import { DEFAULT_EFFECT_CONFIG } from '../types/effects';
import { DEFAULT_THEME_CONFIG } from '../types';
import {
  getBentoStyles,
  getBrutalismStyles,
  getGlassmorphismStyles,
  getImmersiveStyles,
  getOrganicStyles,
} from './computeEffects';

export const getTenantThemeConfig = (theme: Theme): TenantThemeConfig =>
  theme.tenantTheme || DEFAULT_THEME_CONFIG;

export const getTenantThemeEffects = (theme: Theme): EffectConfig =>
  getTenantThemeConfig(theme).effects || DEFAULT_EFFECT_CONFIG;

export const getTenantComponentConfig = (
  theme: Theme,
  componentName: keyof ComponentStyles,
) => getTenantThemeConfig(theme).components?.[componentName] || DEFAULT_COMPONENT_STYLES[componentName];

export const resolveComponentCustomProperties = (
  theme: Theme,
  componentName: keyof ComponentStyles,
): CSSProperties => {
  const customProperties = getTenantComponentConfig(theme, componentName).customProperties;

  if (!customProperties) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(customProperties)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => {
        if (key === 'shadow') return ['boxShadow', value];
        return [key, value];
      }),
  ) as CSSProperties;
};

export const getComponentCustomValue = (
  theme: Theme,
  componentName: keyof ComponentStyles,
  key: string,
) => getTenantComponentConfig(theme, componentName).customProperties?.[key];

export const resolveGlassThemeStyles = (theme: Theme) =>
  getGlassmorphismStyles(getTenantThemeEffects(theme).glassmorphism, theme);

export const resolveBrutalismThemeStyles = (theme: Theme) =>
  getBrutalismStyles(getTenantThemeEffects(theme).brutalism || DEFAULT_EFFECT_CONFIG.brutalism!, theme);

export const resolveBentoThemeStyles = (theme: Theme) =>
  getBentoStyles(getTenantThemeEffects(theme).bento || DEFAULT_EFFECT_CONFIG.bento!, theme);

export const resolveOrganicThemeStyles = (theme: Theme) =>
  getOrganicStyles(getTenantThemeEffects(theme).organic || DEFAULT_EFFECT_CONFIG.organic!, theme);

export const resolveImmersiveThemeStyles = (theme: Theme) =>
  getImmersiveStyles(getTenantThemeEffects(theme).immersive || DEFAULT_EFFECT_CONFIG.immersive!, theme);

export const getThemeFocusRing = (theme: Theme, color = theme.palette.primary.main) =>
  `0 0 0 3px ${alpha(color, 0.16)}`;

export const getThemeBorderRadius = (theme: Theme, fallback = theme.shape.borderRadius) => {
  const borderRadius = theme.shape.borderRadius;
  return typeof borderRadius === 'number' ? `${borderRadius}px` : `${fallback}px`;
};

export const getThemeTextMuted = (theme: Theme) =>
  theme.palette.text.secondary || alpha(theme.palette.text.primary, 0.72);
