/**
 * Styled Component Prop Types
 *
 * Exported prop types for all styled components in theme/src/styled/.
 * Use these types when consuming styled components to get full type safety.
 */

import type {
  ReactNode,
  CSSProperties,
  MouseEventHandler,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
} from "react";
import type { EffectType, NeumorphismConfig } from "./effects";
import type { ComponentEffectStyle } from "./componentStyles";

// ============================================
// Card Component Props
// ============================================

/** Props for the base effect card components */
export interface BaseCardProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

/** Props for GlassCard component */
export interface GlassCardProps extends BaseCardProps {
  blur?: string;
  background?: string;
  borderColor?: string;
  borderWidth?: string;
  opacity?: number;
  borderRadius?: string;
  padding?: string;
}

/** Props for NeuCard (Neumorphism) component */
export interface NeuCardProps extends BaseCardProps {
  config?: NeumorphismConfig;
  backgroundColor?: string;
  borderRadius?: string;
  padding?: string;
}

/** Props for BrutalismCard component */
export interface BrutalismCardProps extends BaseCardProps {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  padding?: string;
  shadowColor?: string;
  shadowOffset?: string;
}

/** Props for BentoCard component */
export interface BentoCardProps extends BaseCardProps {
  borderRadius?: string;
  background?: string;
  borderWidth?: string;
  borderColor?: string;
  shadow?: string;
  padding?: string;
}

/** Props for OrganicCard component */
export interface OrganicCardProps extends BaseCardProps {
  background?: string;
  borderRadius?: string;
  padding?: string;
  borderColor?: string;
  borderWidth?: string;
}

/** Props for ImmersiveCard component */
export interface ImmersiveCardProps extends BaseCardProps {
  background?: string;
  borderRadius?: string;
  padding?: string;
  glowColor?: string;
  glowIntensity?: number;
}

// ============================================
// Adaptive Card Props
// ============================================

/** Props for AdaptiveCard - switches between effect styles */
export interface AdaptiveCardProps extends BaseCardProps {
  /** The effect style to use. Use 'global' to follow theme settings. */
  effectStyle?: ComponentEffectStyle;
  /** Override the global effect type for this specific component */
  globalEffectType?: EffectType;
  /** Configuration props passed when glass style is active */
  glassConfig?: Partial<GlassCardProps>;
  /** Configuration props passed when neumorphism style is active */
  neuConfig?: Partial<NeuCardProps>;
  /** Configuration props passed when brutalism style is active */
  brutalismConfig?: Partial<BrutalismCardProps>;
  /** Configuration props passed when bento style is active */
  bentoConfig?: Partial<BentoCardProps>;
  /** Configuration props passed when organic style is active */
  organicConfig?: Partial<OrganicCardProps>;
  /** Configuration props passed when immersive style is active */
  immersiveConfig?: Partial<ImmersiveCardProps>;
}

// ============================================
// Button Component Props
// ============================================

/** Button variant types */
export type ButtonVariant = "primary" | "secondary" | "outline" | "flat";

/** Base props for button components */
export interface BaseButtonProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  style?: CSSProperties;
  className?: string;
}

/** Props for GlassButton component */
export interface GlassButtonProps extends BaseButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  blur?: string;
  background?: string;
  borderColor?: string;
  borderRadius?: string;
  padding?: string;
}

/** Props for NeuButton (Neumorphism) component */
export interface NeuButtonProps extends BaseButtonProps {
  variant?: "primary" | "secondary" | "outline" | "flat";
  config?: NeumorphismConfig;
  backgroundColor?: string;
  borderRadius?: string;
  padding?: string;
}

/** Props for BrutalismButton component */
export interface BrutalismButtonProps extends BaseButtonProps {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  padding?: string;
}

/** Props for BentoButton component */
export interface BentoButtonProps extends BaseButtonProps {
  background?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  padding?: string;
  shadow?: string;
}

/** Props for OrganicButton component */
export interface OrganicButtonProps extends BaseButtonProps {
  background?: string;
  borderRadius?: string;
  padding?: string;
  borderColor?: string;
}

/** Props for ImmersiveButton component */
export interface ImmersiveButtonProps extends BaseButtonProps {
  background?: string;
  borderRadius?: string;
  padding?: string;
  glowColor?: string;
  glowIntensity?: number;
}

// ============================================
// Adaptive Button Props
// ============================================

/** Props for AdaptiveButton - switches between effect styles */
export interface AdaptiveButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onClick"
> {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** The effect style to use. Use 'global' to follow theme settings. */
  effectStyle?: ComponentEffectStyle;
  /** Override the global effect type for this specific component */
  globalEffectType?: EffectType;
  /** Button variant */
  variant?: ButtonVariant;
  /** Configuration props passed when glass style is active */
  glassConfig?: Partial<GlassButtonProps>;
  /** Configuration props passed when neumorphism style is active */
  neuConfig?: Partial<NeuButtonProps>;
  /** Configuration props passed when brutalism style is active */
  brutalismConfig?: Partial<BrutalismButtonProps>;
  /** Configuration props passed when bento style is active */
  bentoConfig?: Partial<BentoButtonProps>;
  /** Configuration props passed when organic style is active */
  organicConfig?: Partial<OrganicButtonProps>;
  /** Configuration props passed when immersive style is active */
  immersiveConfig?: Partial<ImmersiveButtonProps>;
}

// ============================================
// Input Component Props
// ============================================

/** Props for AdaptiveInput - switches between effect styles */
export interface AdaptiveInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "children"
> {
  /** The effect style to use. Use 'global' to follow theme settings. */
  effectStyle?: ComponentEffectStyle;
  /** Override the global effect type for this specific component */
  globalEffectType?: EffectType;
  /** Label text displayed above the input */
  label?: string;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Whether the input has an error state */
  error?: boolean;
}

// ============================================
// Component Type Map (for utility functions)
// ============================================

/** Map of component type to its props */
export interface ComponentPropsMap {
  card: BaseCardProps;
  button: BaseButtonProps;
  input: AdaptiveInputProps;
}

/** Map of effect-specific card props */
export interface EffectCardPropsMap {
  glass: GlassCardProps;
  neu: NeuCardProps;
  brutalism: BrutalismCardProps;
  bento: BentoCardProps;
  organic: OrganicCardProps;
  immersive: ImmersiveCardProps;
}

/** Map of effect-specific button props */
export interface EffectButtonPropsMap {
  glass: GlassButtonProps;
  neu: NeuButtonProps;
  brutalism: BrutalismButtonProps;
  bento: BentoButtonProps;
  organic: OrganicButtonProps;
  immersive: ImmersiveButtonProps;
}
