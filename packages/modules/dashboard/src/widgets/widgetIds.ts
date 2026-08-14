export const DASHBOARD_WIDGET_IDS = {
  revenueChart: 'dashboard-widget-revenueChart',
  recentOrders: 'dashboard-widget-recentOrders',
  weather: 'dashboard-widget-weather',
  splitPane: 'dashboard-widget-splitPane',
  tabbedCanvas: 'dashboard-widget-tabbedCanvas',
  statCard: 'dashboard-widget-statCard',
  aiChat: 'dashboard-widget-aiChat',
} as const

export type DashboardWidgetId = typeof DASHBOARD_WIDGET_IDS[keyof typeof DASHBOARD_WIDGET_IDS]
