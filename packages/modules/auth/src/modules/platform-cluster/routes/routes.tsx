import React from 'react'
import { AuthRouteConfig } from '@cap/platform-core'
import Path from './../screens/path'
import { createAdminRoute } from '../../../routes/routeHelpers'
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
const AdminOverviewDashboard = React.lazy(
  () => import('../screens/monitoring/AdminOverviewDashboard'),
)
const AuthEventsMonitor = React.lazy(() => import('../screens/monitoring/AuthEventsMonitor'))
const EmailTemplatePreview = React.lazy(() => import('../screens/monitoring/EmailTemplatePreview'))
const EmailTestingDashboard = React.lazy(
  () => import('../screens/monitoring/EmailTestingDashboard'),
)
const ExportAuditTrail = React.lazy(() => import('../screens/monitoring/ExportAuditTrail'))
const MFAUsageAnalytics = React.lazy(() => import('../screens/monitoring/MFAUsageAnalytics'))
const RealTimeAuthEventsMonitor = React.lazy(
  () => import('../screens/monitoring/RealTimeAuthEventsMonitor'),
)
const RealTimeAuthEventsMonitorV2 = React.lazy(
  () => import('../screens/monitoring/RealTimeAuthEventsMonitorV2'),
)
const SecurityHealthCheck = React.lazy(() => import('../screens/monitoring/SecurityHealthCheck'))
const SystemHealthDashboard = React.lazy(
  () => import('../screens/monitoring/SystemHealthDashboard'),
)

const BrowserNotSupported = React.lazy(() => import('../screens/system/BrowserNotSupported'))
const CsrfErrorScreen = React.lazy(() => import('../screens/system/CsrfErrorScreen'))
const MaintenanceScreen = React.lazy(() => import('../screens/system/MaintenanceScreen'))

const Page401Unauthorized = React.lazy(() => import('../screens/system/Page401Unauthorized'))
const Page403Forbidden = React.lazy(() => import('../screens/system/Page403Forbidden'))
const Page429TooManyRequests = React.lazy(() => import('../screens/system/Page429TooManyRequests'))

export const platformClusterRouteConfig: AuthRouteConfig[] = [
  // --- Developer routes (admin-gated: session + admin policy + minimum role) ---
  createAdminRoute(Path.developer.dashboard, <APIExplorerDashboard />),
  createAdminRoute(Path.developer.application, <ApplicationDashboard />),
  createAdminRoute(Path.developer.application_detail_view, <ApplicationDetailView />),
  createAdminRoute(Path.developer.module_management, <ModuleManagementDashboard />),
  createAdminRoute(Path.developer.scopes_registry, <ScopesRegistry />),
  createAdminRoute(Path.developer.webhooks, <WebhookManagement />),

  // --- Monitoring routes (admin-gated) ---
  createAdminRoute(Path.monitor.dashboard, <AdminOverviewDashboard />),
  createAdminRoute(Path.monitor.events, <AuthEventsMonitor />),
  createAdminRoute(Path.monitor.emailTemplatePreview, <EmailTemplatePreview />),
  createAdminRoute(Path.monitor.emailTesting, <EmailTestingDashboard />),
  createAdminRoute(Path.monitor.exportAudit, <ExportAuditTrail />),
  createAdminRoute(Path.monitor.mfa_analytics, <MFAUsageAnalytics />),
  createAdminRoute(Path.monitor.real_time, <RealTimeAuthEventsMonitor />),
  createAdminRoute(Path.monitor.real_time_v2, <RealTimeAuthEventsMonitorV2 />),
  createAdminRoute(Path.monitor.health, <SecurityHealthCheck />),
  createAdminRoute(Path.monitor.security_health, <SystemHealthDashboard />),

  // --- System routes (public by design: pre-auth error / status screens) ---
  { path: Path.system.browserNotSupported, element: <BrowserNotSupported />, layout: 'noLayout' },
  { path: Path.system.csrfError, element: <CsrfErrorScreen />, layout: 'noLayout' },
  { path: Path.system.unauthorized401, element: <Page401Unauthorized />, layout: 'noLayout' },
  { path: Path.system.maintenance, element: <MaintenanceScreen />, layout: 'noLayout' },
  { path: Path.system.tooManyRequests429, element: <Page429TooManyRequests />, layout: 'noLayout' },
  { path: Path.system.forbidden403, element: <Page403Forbidden />, layout: 'noLayout' },
]
