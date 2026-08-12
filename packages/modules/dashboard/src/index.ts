import type { CAPModule, NavItemConfig, SearchItemConfig } from '@cap/shared-types'
import { dashboardRouteConfig } from './routes/routes'
import { DashboardPath } from './routes/path'
import { dashboardDictionaries, registerDictionary } from './i18n/registry'
import { registerModuleWidgets } from '@cap/platform-core'
import { DASHBOARD_WIDGET_IDS } from './widgets'

export { dashboardRouteConfig }
export { default as DashboardScreen } from './screens/DashboardScreen'

// Dynamically register all widgets in ./widgets/*.tsx with titleKey `dashboard.widgets.<widgetKey>.title`
registerModuleWidgets(
  'dashboard',
  import.meta.glob('./widgets/*.tsx') as Record<string, () => Promise<any>>,
  {
    idMapping: {
      revenueChart: DASHBOARD_WIDGET_IDS.revenueChart,
      recentOrders: DASHBOARD_WIDGET_IDS.recentOrders,
      weather: DASHBOARD_WIDGET_IDS.weather,
      SplitPaneWidget: DASHBOARD_WIDGET_IDS.splitPane,
      TabbedCanvasWidget: DASHBOARD_WIDGET_IDS.tabbedCanvas,
    },
  },
)


// I18n Registry & Dictionaries
export {
  dashboardDictionaries,
  registerDictionary,
  getMergedDictionary,
  getAvailableLocales,
  i18n,
  type Locale,
} from './i18n/registry'

registerDictionary(dashboardDictionaries as any)

export const dashboardNavItems: Array<NavItemConfig> = [
  {
    id: 'dashboard',
    label: 'navigation.dashboard',
    icon: 'tabler-dashboard',
    path: DashboardPath.dashboard,
    variant: ['vertical', 'horizontal'],
    order: 10,
  },
]

export const dashboardSearchItems: Array<SearchItemConfig> = [
  {
    id: 'search-dashboard',
    name: 'Dashboard',
    url: DashboardPath.dashboard,
    icon: 'tabler-dashboard',
    section: 'Overview',
  },
]

export const DashboardModule: CAPModule = {
  id: 'dashboard-module',
  version: '1.0.0',
  name: 'Dashboard Module',
  description: 'Multi-tenant dashboard builder with Swapy drag-and-drop',
  routes: dashboardRouteConfig as any,
  i18n: dashboardDictionaries,
  plugins: [],
  navItems: dashboardNavItems,
  searchItems: dashboardSearchItems,
}

export default DashboardModule
