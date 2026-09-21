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

export interface LiquidGlassConfig {
  enabled: boolean;
  blur?: string;
  opacity?: number;
  background?: string;
  borderColor?: string;
  borderWidth?: string;
  innerShadow?: string;
  specularHighlight?: string;
  refraction?: number; // 0-100
}

import type { UIEffect } from "@cap/shared-types";

export type EffectType = UIEffect;

export interface EffectConfig {
  globalType: UIEffect;
  glassmorphism: GlassmorphismConfig;
  neumorphism: NeumorphismConfig;
  brutalism?: BrutalismConfig;
  bento?: BentoConfig;
  organic?: OrganicConfig;
  immersive?: ImmersiveConfig;
  liquidGlass?: LiquidGlassConfig;
}

export const DEFAULT_GLASSMORPHISM: GlassmorphismConfig = {
  enabled: false,
  blur: "16px",
  borderWidth: "1px",
  opacity: 0.8,
};

export const DEFAULT_NEUMORPHISM: NeumorphismConfig = {
  enabled: false,
  intensity: 0.15,
  distance: 5,
  // 45 degrees is the light elevation that gives neumorphism its defining
  // equal-offset diagonal. The previous default of 10 put the light almost
  // directly overhead, which rounds to a 1px horizontal offset and reads as an
  // ordinary drop shadow rather than an extrusion.
  altitude: 45,
  borderRadius: "12px",
};

export const DEFAULT_BRUTALISM: BrutalismConfig = {
  enabled: false,
  borderWidth: "2px",
  shadowOffset: "4px",
};

export const DEFAULT_BENTO: BentoConfig = {
  enabled: false,
  borderRadius: "24px",
  spacing: "1.5rem",
  borderWidth: "1px",
};

export const DEFAULT_ORGANIC: OrganicConfig = {
  enabled: false,
  curvature: 80,
  fluidity: 50,
  borderWidth: "0px",
};

export const DEFAULT_IMMERSIVE: ImmersiveConfig = {
  enabled: false,
  layers: 3,
  depth: 20,
  perspective: "1000px",
  rotationX: "0deg",
  rotationY: "0deg",
};

export const DEFAULT_LIQUID_GLASS: LiquidGlassConfig = {
  enabled: false,
  blur: "24px",
  opacity: 0.85,
  borderWidth: "1px",
  refraction: 40,
};

export const DEFAULT_EFFECT_CONFIG: EffectConfig = {
  globalType: "standard",
  glassmorphism: DEFAULT_GLASSMORPHISM,
  neumorphism: DEFAULT_NEUMORPHISM,
  brutalism: DEFAULT_BRUTALISM,
  bento: DEFAULT_BENTO,
  organic: DEFAULT_ORGANIC,
  immersive: DEFAULT_IMMERSIVE,
  liquidGlass: DEFAULT_LIQUID_GLASS,
};

// ===========================================================================
// EFFECT REGISTRY
// ===========================================================================
//
// Every list of effects in the app - the preset merge, the CSS-variable
// emitter, the surface factory, the two pickers in the theme editor - used to
// be its own hand-written subset, and each one had drifted: presets merged
// only `glassmorphism` and `neumorphism`, so a brutalism or organic preset
// arrived with its config silently dropped; the editor offered three of the
// eight effects; `liquid-glass` had no CSS-variable path at all. The registry
// below is the single source of truth those consumers now derive from, so a
// new effect cannot be half-wired.

/**
 * Which `EffectConfig` sub-record backs each `UIEffect`. `standard` is the
 * absence of a surface effect and deliberately has no config.
 */
export const EFFECT_CONFIG_KEY = {
  glass: "glassmorphism",
  neu: "neumorphism",
  brutalism: "brutalism",
  bento: "bento",
  organic: "organic",
  immersive: "immersive",
  "liquid-glass": "liquidGlass",
} as const satisfies Record<
  Exclude<UIEffect, "standard">,
  Exclude<keyof EffectConfig, "globalType">
>;

export type EffectConfigKey = (typeof EFFECT_CONFIG_KEY)[keyof typeof EFFECT_CONFIG_KEY];

/** Every `EffectConfig` sub-record key, in registry order. */
export const EFFECT_CONFIG_KEYS = Object.values(
  EFFECT_CONFIG_KEY,
) as EffectConfigKey[];

export interface EffectTypeMeta {
  value: UIEffect;
  /** Config record this effect reads; `null` for `standard`. */
  configKey: EffectConfigKey | null;
  label: string;
  description: string;
}

/**
 * Display metadata for the whole effect set, in the order the pickers show
 * them. `standard` leads because it is the "no surface effect" baseline.
 */
export const EFFECT_TYPES: EffectTypeMeta[] = [
  {
    value: "standard",
    configKey: null,
    label: "Standard",
    description: "Solid surfaces with ordinary elevation shadows.",
  },
  {
    value: "glass",
    configKey: "glassmorphism",
    label: "Glassmorphism",
    description: "Frosted translucent panels that blur whatever sits behind.",
  },
  {
    value: "liquid-glass",
    configKey: "liquidGlass",
    label: "Liquid Glass",
    description: "Frosted glass with saturation, a specular edge and inner light.",
  },
  {
    value: "neu",
    configKey: "neumorphism",
    label: "Neumorphism",
    description: "Soft extruded relief, lit from one corner.",
  },
  {
    value: "brutalism",
    configKey: "brutalism",
    label: "Brutalism",
    description: "Hard borders and a flat offset drop shadow.",
  },
  {
    value: "bento",
    configKey: "bento",
    label: "Bento",
    description: "Generously rounded tiles with a hairline edge.",
  },
  {
    value: "organic",
    configKey: "organic",
    label: "Organic",
    description: "Fluid asymmetric curvature with soft edges.",
  },
  {
    value: "immersive",
    configKey: "immersive",
    label: "3D Immersive",
    description: "Layered depth with perspective and a long shadow.",
  },
];

export const EFFECT_TYPE_VALUES = EFFECT_TYPES.map((e) => e.value);

/** The `EffectConfig` record backing an effect, or `null` for `standard`. */
export const getEffectConfigKey = (
  type: UIEffect,
): EffectConfigKey | null =>
  type === "standard"
    ? null
    : (EFFECT_CONFIG_KEY[type as keyof typeof EFFECT_CONFIG_KEY] ?? null);

/**
 * Reconcile `enabled` flags with `globalType`.
 *
 * `generateThemeVariables` only emits an effect's variables when that effect's
 * `enabled` flag is set, while every other consumer keys off `globalType`.
 * Nothing kept the two in step: switching from the Glassmorphism preset to the
 * Brutalism one left `glassmorphism.enabled` true and `brutalism.enabled`
 * false, so the app announced brutalism and painted nothing at all. Run this
 * whenever `globalType` changes and exactly one config is ever live.
 */
export const normalizeEffectConfig = <T extends Partial<EffectConfig>>(
  effects: T,
): T => {
  const activeKey = getEffectConfigKey(effects.globalType || "standard");

  for (const key of EFFECT_CONFIG_KEYS) {
    const config = effects[key as keyof T] as
      | { enabled?: boolean }
      | undefined;
    if (!config) continue;
    (effects[key as keyof T] as { enabled: boolean }) = {
      ...config,
      enabled: key === activeKey,
    } as never;
  }

  return effects;
};
