import type { ReactNode } from 'react';

export enum LayoutModeEnum {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
  COLLAPSED = 'collapsed',
}

export type Layout = LayoutModeEnum | `${LayoutModeEnum}`

export interface VerticalNavState {
  width?: number;
  collapsedWidth?: number;
  isCollapsed?: boolean;
  isHovered?: boolean;
  isToggled?: boolean;
  isScrollWithContent?: boolean;
  isBreakpointReached?: boolean;
  isPopoutWhenCollapsed?: boolean;
  collapsing?: boolean;
  expanding?: boolean;
  transitionDuration?: number;
}

export interface HorizontalNavState {
  isBreakpointReached?: boolean;
}
export type Skin = 'default' | 'bordered';

export enum ThemeModeEnum {
  SYSTEM = 'system',
  LIGHT = 'light',
  DARK = 'dark',
}

export type Mode = ThemeModeEnum | `${ThemeModeEnum}`;
export type SystemMode = 'light' | 'dark';
export type Direction = 'ltr' | 'rtl';
export type LayoutComponentWidth = 'compact' | 'wide' | 'full';
export type LayoutComponentPosition = 'fixed' | 'static';

export type UIEffect = 'standard' | 'glass' | 'neu' | 'brutalism' | 'bento' | 'organic' | 'immersive';

export interface ChildrenType {
  children: ReactNode;
}

export type ThemeColor = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';

export type Dictionary = Record<string, any>;

export interface Settings {
  mode?: Mode;
  skin?: Skin;
  effect?: UIEffect;
  semiDark?: boolean;
  layout?: Layout;
  navbarContentWidth?: LayoutComponentWidth;
  contentWidth?: LayoutComponentWidth;
  footerContentWidth?: LayoutComponentWidth;
  primaryColor?: string;
}
