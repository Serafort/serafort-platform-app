const Path = {
  unauthorized401: '/auth/system/unauthorized',
  maintenance: '/auth/system/maintenance',
  tooManyRequests429: '/auth/system/too-many-requests',
  csrfError: '/auth/system/csrf-error',
  forbidden403: '/auth/system/forbidden',
  browserNotSupported: '/auth/system/browser-not-supported',
  events: '/admin/events',
  events_v2: '/admin/events-v2',
  health: '/admin/health',
  security_health: '/admin/security-health',
  mfa_analytics: '/admin/mfa-analytics',
  emailTesting: '/admin/email-testing',
  emailTemplatePreview: '/admin/email-preview/:id',
  exportAudit: '/admin/export-audit',
}
export default Path
