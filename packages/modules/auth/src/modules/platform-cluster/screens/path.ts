const Path = {
  developer: {
    dashboard: '/admin/developer',
    application: '/admin/developer/application',
    application_detail_view: '/admin/developer/application-detail-view',
    module_management: '/admin/developer/module-management',
    scopes_registry: '/admin/developer/scopes-registry',
    webhooks: '/admin/developer/webhooks',
  },
  monitor: {
    dashboard: '/admin/monitoring',
    events: '/admin/monitoring/events',
    emailTemplatePreview: '/admin/monitoring/email-preview/:id',
    emailTesting: '/admin/monitoring/email-testing',
    exportAudit: '/admin/monitoring/export-audit',
    mfa_analytics: '/admin/monitoring/mfa-analytics',
    real_time: '/admin/monitoring/real-time-events',
    real_time_v2: '/admin/monitoring/real-time-events-v2',
    health: '/admin/monitoring/health',
    security_health: '/admin/monitoring/security-health',
  },
  system: {
    browserNotSupported: '/system/browser-not-supported',
    csrfError: '/system/csrf-error',
    maintenance: '/system/maintenance',
    unauthorized401: '/system/unauthorized',
    forbidden403: '/system/forbidden',
    tooManyRequests429: '/system/too-many-requests',
  },
}
export default Path
