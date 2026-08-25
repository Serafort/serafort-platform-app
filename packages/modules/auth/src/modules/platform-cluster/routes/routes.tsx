import React from 'react'
import { AuthRouteConfig } from '@cap/platform-core'
import Path from './../screens/path'
// --- Developer screens ---
const APIExplorerDashboard = React.lazy(() => import('../screens/developer/APIExplorerDashboard'))
const ApplicationDashboard = React.lazy(() => import('../screens/developer/ApplicationDashboard'))
const ApplicationDetailView = React.lazy(() => import('../screens/developer/ApplicationDetailView'))
const ModuleManagementDashboard = React.lazy(
  () => import('../screens/developer/ModuleManagementDashboard'),
)
const ScopesRegistry = React.lazy(() => import('../screens/developer/ScopesRegistry'))
const WebhookManagement = React.lazy(() => import('../screens/developer/WebhookManagement'))
// --- Montoring screens ---
const AdminOverviewDashboard = React.lazy(() => import('../screens/monitoring/AdminOverviewDashboard'))
const AuthEventsMonitor = React.lazy(() => import('../screens/monitoring/AuthEventsMonitor'))
const EmailTemplatePreview = React.lazy(() => import('../screens/monitoring/EmailTemplatePreview'))
const EmailTestingDashboard = React.lazy(() => import('../screens/monitoring/EmailTestingDashboard'))
const ExportAuditTrail = React.lazy(() => import('../screens/monitoring/ExportAuditTrail'))
const MFAUsageAnalytics = React.lazy(() => import('../screens/monitoring/MFAUsageAnalytics'))
const RealTimeAuthEventsMonitor = React.lazy(() => import('../screens/monitoring/RealTimeAuthEventsMonitor'))
const RealTimeAuthEventsMonitorV2 = React.lazy(() => import('../screens/monitoring/RealTimeAuthEventsMonitorV2'))
const SecurityHealthCheck = React.lazy(() => import('../screens/monitoring/SecurityHealthCheck'))
const SystemHealthDashboard = React.lazy(() => import('../screens/monitoring/SystemHealthDashboard'))



const BrowserNotSupported = React.lazy(() => import('../screens/system/BrowserNotSupported'))
const CsrfErrorScreen = React.lazy(() => import('../screens/system/CsrfErrorScreen'))
const MaintenanceScreen = React.lazy(() => import('../screens/system/MaintenanceScreen'))

const Page401Unauthorized = React.lazy(() => import('../screens/system/Page401Unauthorized'))
const Page403Forbidden = React.lazy(() => import('../screens/system/Page403Forbidden'))
const Page429TooManyRequests = React.lazy(() => import('../screens/system/Page429TooManyRequests'))


export const platformClusterRouteConfig: AuthRouteConfig[] = [
  // --- Developer routes ---
  {
    path: Path.developer.dashboard, element: <APIExplorerDashboard />,
    layout: 'admin',
  },
  {
    path: Path.developer.application, element: <ApplicationDashboard />,
    layout: 'admin',
  },
  {
    path: Path.developer.application_detail_view, element: <ApplicationDetailView />,
    layout: 'admin',
  },
  {
    path: Path.developer.module_management, element: <ModuleManagementDashboard />,
    layout: 'admin',
  },
  {
    path: Path.developer.scopes_registry, element: <ScopesRegistry />,
    layout: 'admin',
  },
  {
    path: Path.developer.webhooks, element: <WebhookManagement />,
    layout: 'admin',
  },
  // --- Montoring routes ---

  {
    path: Path.monitor.dashboard, element: <AdminOverviewDashboard />,
    layout: 'admin',
  },
  {
    path: Path.monitor.events, element: <AuthEventsMonitor />,
    layout: 'admin',
  }, {
    path: Path.monitor.emailTemplatePreview, element: <EmailTemplatePreview />,
    layout: 'admin',
  }, {
    path: Path.monitor.emailTesting, element: <EmailTestingDashboard />,
    layout: 'admin',
  }, {
    path: Path.monitor.exportAudit, element: <ExportAuditTrail />,
    layout: 'admin',
  }, {
    path: Path.monitor.mfa_analytics, element: <MFAUsageAnalytics />,
    layout: 'admin',
  }, {
    path: Path.monitor.real_time, element: <RealTimeAuthEventsMonitor />,
    layout: 'admin',
  }, {
    path: Path.monitor.real_time_v2, element: <RealTimeAuthEventsMonitorV2 />,
    layout: 'admin',
  }, {
    path: Path.monitor.health, element: <SecurityHealthCheck />,
    layout: 'admin',
  }, {
    path: Path.monitor.security_health, element: <SystemHealthDashboard />,
    layout: 'admin',
  },

  // --- System routes ---
  { path: Path.system.browserNotSupported, element: <BrowserNotSupported />, layout: 'noLayout' },
  { path: Path.system.csrfError, element: <CsrfErrorScreen />, layout: 'noLayout' },
  { path: Path.system.unauthorized401, element: <Page401Unauthorized />, layout: 'noLayout' },
  { path: Path.system.maintenance, element: <MaintenanceScreen />, layout: 'noLayout' },
  { path: Path.system.tooManyRequests429, element: <Page429TooManyRequests />, layout: 'noLayout' },
  { path: Path.system.forbidden403, element: <Page403Forbidden />, layout: 'noLayout' },

]
