import type { ReactNode } from "react";

export enum LayoutModeEnum {
  VERTICAL = "vertical",
  HORIZONTAL = "horizontal",
  COLLAPSED = "collapsed",
}

export type Layout = LayoutModeEnum | `${LayoutModeEnum}`;

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
export type Skin = "default" | "bordered";

export enum ThemeModeEnum {
  SYSTEM = "system",
  LIGHT = "light",
  DARK = "dark",
}

export type Mode = ThemeModeEnum | `${ThemeModeEnum}`;
export type SystemMode = "light" | "dark";
export type Direction = "ltr" | "rtl";
export type LayoutComponentWidth = "compact" | "wide" | "full";
export type LayoutComponentPosition = "fixed" | "static";

export type UIEffect =
  | "standard"
  | "glass"
  | "neu"
  | "brutalism"
  | "bento"
  | "organic"
  | "immersive"
  | "liquid-glass";

export interface ChildrenType {
  children: ReactNode;
}

export type ThemeColor =
  | "primary"
  | "secondary"
  | "error"
  | "warning"
  | "info"
  | "success";

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

// ---------------------------------------------------------------------------
// Grid Layout Engine Types
// ---------------------------------------------------------------------------

export type SlotId = string;
export type WidgetId = string;

export type WidgetSpan = 4 | 8 | 12;
export type WidgetHeight = 200 | 280 | 340 | 400;

export interface SlotSizeConfig {
  span: WidgetSpan;
  height: WidgetHeight;
}

/**
 * A widget node that can simultaneously act as a widget (with widget properties)
 * and host a nested sub-layout canvas (GridLayout).
 */
export interface WidgetNode {
  /** Unique instance identifier for this widget. */
  id?: string;
  /** Reference identifier of the widget registered in globalWidgetRegistry. */
  widgetId: WidgetId;
  /** Display title or i18n title key for the widget. */
  title?: string;
  /** Span and height sizing configuration. */
  size?: SlotSizeConfig;
  /** Custom widget props or configuration payload. */
  config?: Record<string, any>;
  /** Embedded recursive GridLayout if this widget acts as a container canvas. */
  subLayout?: GridLayout;
}

/**
 * Slot value which can be either a simple WidgetId string or a rich WidgetNode (with Widget properties and nested sub-layout).
 */
export type SlotWidgetValue = WidgetId | WidgetNode;

export interface GridLayout {
  /** Optional unique identifier for this canvas layout instance. */
  id?: string;
  /** Ordered list of slot ids rendered on the canvas. */
  slots: SlotId[];
  /** Maps each slot id to either a WidgetId string or a rich WidgetNode with subLayout capabilities. */
  slotWidgets: Record<SlotId, SlotWidgetValue>;
  /** Maps each slot id to its size configuration (span and height). */
  slotSizes?: Record<SlotId, SlotSizeConfig>;
  /** Map of nested GridLayout child canvases keyed by slot or layout ID. */
  nestedLayouts?: Record<string, GridLayout>;
}

/** Type guard to check if a SlotWidgetValue is a rich WidgetNode object. */
export const isWidgetNode = (
  val: SlotWidgetValue | undefined,
): val is WidgetNode => {
  return typeof val === "object" && val !== null && "widgetId" in val;
};

/** Helper to extract WidgetId from a SlotWidgetValue */
export const getWidgetIdFromSlotValue = (
  val: SlotWidgetValue | undefined,
): WidgetId | undefined => {
  if (!val) return undefined;
  return isWidgetNode(val) ? val.widgetId : val;
};

/** Helper to extract subLayout from a SlotWidgetValue */
export const getSubLayoutFromSlotValue = (
  val: SlotWidgetValue | undefined,
): GridLayout | undefined => {
  return isWidgetNode(val) ? val.subLayout : undefined;
};

/** Factory helper to create a structured WidgetNode */
export const createWidgetNode = (
  widgetId: WidgetId,
  options?: Partial<Omit<WidgetNode, "widgetId">>,
): WidgetNode => ({
  widgetId,
  ...options,
});

/** A single `{ slot, item }` entry as reported by swapy's slotItemMap. */
export interface SlotItemEntry {
  slot: SlotId;
  item: SlotWidgetValue;
}
