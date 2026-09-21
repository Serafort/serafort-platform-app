export const DASHBOARD_WIDGET_IDS = {
  revenueChart: "dashboard-widget-revenueChart",
  recentOrders: "dashboard-widget-recentOrders",
  weather: "dashboard-widget-weather",
  splitPane: "dashboard-widget-splitPane",
  tabbedCanvas: "dashboard-widget-tabbedCanvas",
  statCard: "dashboard-widget-statCard",
  aiChat: "dashboard-widget-aiChat",
  welcome: "dashboard-widget-welcome",
  mySecurity: "dashboard-widget-mySecurity",
  myActivity: "dashboard-widget-myActivity",
  tenantOverview: "dashboard-widget-tenantOverview",
  platformKpis: "dashboard-widget-platformKpis",
  tenantGrowth: "dashboard-widget-tenantGrowth",
  tenantGeography: "dashboard-widget-tenantGeography",
  topTenants: "dashboard-widget-topTenants",
} as const;

export type DashboardWidgetId =
  (typeof DASHBOARD_WIDGET_IDS)[keyof typeof DASHBOARD_WIDGET_IDS];
