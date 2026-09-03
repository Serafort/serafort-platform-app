export interface GlassmorphismConfig {
  enabled: boolean;
  blur?: string;
  background?: string;
  borderColor?: string;
  borderWidth?: string;
  opacity?: number;
}

export interface NeumorphismConfig {
  enabled: boolean;
  backgroundColor?: string;
  intensity?: number;
  distance?: number;
  altitude?: number;
  borderRadius?: string;
}

export interface BrutalismConfig {
  enabled: boolean;
  borderWidth?: string;
  borderColor?: string;
  shadowOffset?: string;
  shadowColor?: string;
  backgroundColor?: string;
}

export interface BentoConfig {
  enabled: boolean;
  borderRadius?: string;
  spacing?: string;
  background?: string;
  borderWidth?: string;
  borderColor?: string;
  shadow?: string;
}

export interface ComputedNeumorphismShadow {
  lightShadow: string;
  darkShadow: string;
}

export interface OrganicConfig {
  enabled: boolean;
  curvature?: number; // 0-100
  fluidity?: number; // 0-100
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
}

export interface ImmersiveConfig {
  enabled: boolean;
  layers?: number;
  depth?: number;
  shadowColor?: string;
  perspective?: string;
  rotationX?: string;
  rotationY?: string;
}

import type { UIEffect } from '@cap/shared-types';

export type EffectType = UIEffect;

export interface EffectConfig {
  globalType: UIEffect;
  glassmorphism: GlassmorphismConfig;
  neumorphism: NeumorphismConfig;
  brutalism?: BrutalismConfig;
  bento?: BentoConfig;
  organic?: OrganicConfig;
  immersive?: ImmersiveConfig;
}

export const DEFAULT_GLASSMORPHISM: GlassmorphismConfig = {
  enabled: false,
  blur: '16px',
  borderWidth: '1px',
  opacity: 0.8,
};

export const DEFAULT_NEUMORPHISM: NeumorphismConfig = {
  enabled: false,
  intensity: 0.15,
  distance: 5,
  altitude: 10,
  borderRadius: '12px',
};

export const DEFAULT_BRUTALISM: BrutalismConfig = {
  enabled: false,
  borderWidth: '2px',
  shadowOffset: '4px',
};

export const DEFAULT_BENTO: BentoConfig = {
  enabled: false,
  borderRadius: '24px',
  spacing: '1.5rem',
  borderWidth: '1px',
};

export const DEFAULT_ORGANIC: OrganicConfig = {
  enabled: false,
  curvature: 80,
  fluidity: 50,
  borderWidth: '0px',
};

export const DEFAULT_IMMERSIVE: ImmersiveConfig = {
  enabled: false,
  layers: 3,
  depth: 20,
  perspective: '1000px',
  rotationX: '0deg',
  rotationY: '0deg',
};

export const DEFAULT_EFFECT_CONFIG: EffectConfig = {
  globalType: 'standard',
  glassmorphism: DEFAULT_GLASSMORPHISM,
  neumorphism: DEFAULT_NEUMORPHISM,
  brutalism: DEFAULT_BRUTALISM,
  bento: DEFAULT_BENTO,
  organic: DEFAULT_ORGANIC,
  immersive: DEFAULT_IMMERSIVE,
};
