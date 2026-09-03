import type { CSSProperties } from 'react';
import type { EffectType } from './effects';

export type ComponentEffectStyle = 'global' | EffectType;

export interface ComponentStyleOverrides extends Partial<CSSProperties>, Record<string, string | number | undefined> {}

export interface ComponentStyleConfig {
  style: ComponentEffectStyle;
  customProperties?: ComponentStyleOverrides;
}

export interface ComponentStyles {
  button: ComponentStyleConfig;
  card: ComponentStyleConfig;
  input: ComponentStyleConfig;
  navbar: ComponentStyleConfig;
  footer: ComponentStyleConfig;
  modal: ComponentStyleConfig;
  drawer: ComponentStyleConfig;
  stepper: ComponentStyleConfig;
  table: ComponentStyleConfig;
  tabs: ComponentStyleConfig;
  nav: ComponentStyleConfig;
}

export const DEFAULT_COMPONENT_STYLES: ComponentStyles = {
  button: { style: 'global' },
  card: { style: 'global' },
  input: { style: 'global' },
  navbar: { style: 'global' },
  footer: { style: 'global' },
  modal: { style: 'global' },
  drawer: { style: 'global' },
  stepper: { style: 'global' },
  table: { style: 'global' },
  tabs: { style: 'global' },
  nav: { style: 'global' },
};
