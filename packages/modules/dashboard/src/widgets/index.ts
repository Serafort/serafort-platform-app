import type { GridLayout } from '@cap/shared-types'

export { default as RecentOrders } from './RecentOrders'
export { default as RevenueChart } from './RevenueChart'
export { default as Weather } from './Weather'
export { default as SplitPaneWidget } from './SplitPaneWidget'
export { default as TabbedCanvasWidget } from './TabbedCanvasWidget'
export { default as AiChat } from './AiChat'
export { default as StatCard } from './StatCard'
export { WidgetFallback, WidgetSkeleton } from './WidgetFallback'

import { DASHBOARD_WIDGET_IDS } from './widgetIds'
export { DASHBOARD_WIDGET_IDS, type DashboardWidgetId } from './widgetIds'

export const DEFAULT_DASHBOARD_GRID_LAYOUT: GridLayout = {
  slots: [],
  slotWidgets: {},
  slotSizes: {},
  // slots: ['slot-1', 'slot-2', 'slot-3', 'slot-4', 'slot-5'],
  // slotWidgets: {
  //   'slot-1': DASHBOARD_WIDGET_IDS.revenueChart,
  //   'slot-2': DASHBOARD_WIDGET_IDS.recentOrders,
  //   'slot-3': DASHBOARD_WIDGET_IDS.weather,
  //   'slot-4': {
  //     id: 'node-split-pane',
  //     widgetId: DASHBOARD_WIDGET_IDS.splitPane,
  //     title: 'Split Pane Canvas Container',
  //     size: { span: 12, height: 340 },
  //     subLayout: {
  //       id: 'split-pane-sublayout',
  //       slots: ['split-left-slot-1', 'split-right-slot-1'],
  //       slotWidgets: {
  //         'split-left-slot-1': DASHBOARD_WIDGET_IDS.weather,
  //         'split-right-slot-1': DASHBOARD_WIDGET_IDS.revenueChart,
  //       },
  //       slotSizes: {
  //         'split-left-slot-1': { span: 12, height: 200 },
  //         'split-right-slot-1': { span: 12, height: 200 },
  //       },
  //     },
  //   },
  //   'slot-5': DASHBOARD_WIDGET_IDS.tabbedCanvas,
  // },
  // slotSizes: {
  //   'slot-1': { span: 4, height: 280 },
  //   'slot-2': { span: 4, height: 280 },
  //   'slot-3': { span: 4, height: 280 },
  //   'slot-4': { span: 12, height: 340 },
  //   'slot-5': { span: 12, height: 340 },
  // },
}

