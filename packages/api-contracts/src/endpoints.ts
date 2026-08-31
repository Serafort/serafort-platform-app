/**
 * API Endpoint Registry
 *
 * `API_ENDPOINTS` is the single source of truth for every backend URL, and
 * `API_QUERY_KEYS` holds the matching React Query key factories for cache
 * invalidation. Endpoint contracts (`API_CONTRACTS`) reference these paths
 * through their `resolve` builders so the URL strings never live in two places.
 *
 * No React dependencies - pure TypeScript only.
 */

export const API_ENDPOINTS = {
  health: {
    root: "/",
    basic: "/api/health",
    live: "/api/health/live",
    ready: "/api/health/ready",
    detailed: "/api/health/detailed",
    startup: "/api/health/startup",
  },
  metrics: {
    basic: "/api/metrics",
    prometheus: "/api/metrics/prometheus",
  },

  auth: {
    register: "/api/auth/register",
    signup: "/api/auth/register",
    login: "/api/auth/login",
    logout: "/api/v1/auth/logout",
    forgotPassword: "/api/auth/forgot-password",
    resetPassword: "/api/auth/reset-password",
    refresh: "/api/auth/refresh",
    session: "/api/auth/session",
    trackFailedLogin: "/api/auth/track-failed-login",
    csrfToken: "/api/auth/csrf-token",
    verifyEmail: (email: string, signature: string) =>
      `/api/auth/verification/email/${email}?signature=${signature}`,
    verifyResetPassword: (email: string | number, signature: string | number) => {
      const sigStr = String(signature ?? "");
      const query = sigStr.startsWith("?")
        ? sigStr.slice(1)
        : sigStr.includes("=")
          ? sigStr
          : `signature=${sigStr}`;
      return `/api/auth/reset-password/${email}?${query}`;
    },
    resendVerification: "/api/auth/verification/email/resend",
    verifyEmailToken: (email: string, signature: string) =>
      `/api/auth/verification/email/${email}?signature=${signature}`,
    validateUser: (id: string | number, token: string) =>
      `/api/auth/validate/${id}/${token}`,
    invitationDetails: "/api/auth/invitation-details",
    acceptInvitation: "/api/auth/accept-invitation",
    declineInvitation: "/api/auth/decline-invitation",
    sso: {
      discover: "/api/auth/sso/discover",
      samlRedirect: (organizationId: string | number) =>
        `/api/auth/sso/saml/redirect?organizationId=${organizationId}`,
      oidcRedirect: (clientId: string | number) =>
        `/api/auth/sso/oidc/redirect?clientId=${clientId}`,
    },
    passwordless: {
      send: "/api/auth/passwordless/send",
      verify: "/api/auth/passwordless/verify",
    },
    oidcDevice: {
      authorize: "/api/auth/oidc/device",
      verifyAction: "/api/auth/device/verify",
    },
    oidcInteraction: {
      get: (uid: string) => `/api/auth/oidc/interaction/${uid}`,
      login: (uid: string) => `/api/auth/oidc/interaction/${uid}/login`,
      consent: (uid: string) => `/api/auth/oidc/interaction/${uid}/consent`,
      confirm: (uid: string) => `/api/auth/oidc/interaction/${uid}/confirm`,
      abort: (uid: string) => `/api/auth/oidc/interaction/${uid}/abort`,
    },
    social: {
      redirect: (provider: string) => `/api/auth/social/${provider}/redirect`,
      callback: (provider: string) => `/api/auth/social/${provider}/callback`,
    },
    oidc: {
      auth: "/api/auth/oidc/auth",
      userinfo: "/api/auth/oidc/userinfo",
      introspect: "/api/auth/oidc/introspect",
      revoke: "/api/auth/oidc/revoke",
      endSession: "/api/auth/oidc/end-session",
    },
    saml: {
      sso: "/api/auth/saml/sso",
    },
    passkey: {
      list: "/api/auth/passkey",
      update: (id: string | number) => `/api/auth/passkey/${id}`,
      delete: (id: string | number) => `/api/auth/passkey/${id}`,
      registerStart: "/api/auth/passkey/register/start",
      registerFinish: "/api/auth/passkey/register/finish",
      loginStart: "/api/auth/passkey/login/start",
      loginFinish: "/api/auth/passkey/login/finish",
    },
    mfa: {
      setup: "/api/auth/mfa/setup",
      verify: "/api/auth/mfa/verify",
      disable: "/api/auth/mfa/disable",
      recoveryCodes: "/api/auth/mfa/recovery-codes",
      recoveryVerify: "/api/auth/mfa/recovery-verify",
      verifyLogin: "/api/auth/mfa/verify-login",
      regenerateBackupCodes: "/api/auth/mfa/regenerate-backup-codes",
      sms: {
        sendCode: "/api/auth/mfa/sms/send-code",
        verify: "/api/auth/mfa/sms/verify",
        disable: "/api/auth/mfa/sms/disable",
        verifyLogin: "/api/auth/mfa/sms/verify-login",
      },
    },
    sessions: "/api/auth/sessions",
    revokeSession: (sessionId: string) => `/api/auth/sessions/${sessionId}`,
    revokeAllSessions: "/api/auth/sessions/revoke-all",
    loginHistory: "/api/auth/login-history",
    securityLogs: "/api/auth/security-logs",
  },

  user: {
    me: "/api/user/me",
    update: "/api/user/update",
    avatar: "/api/user/avatar",
    changeEmail: "/api/user/change-email",
    emailChanges: "/api/user/change-email",
    changePhone: "/api/user/change-phone",
    changePassword: "/api/user/change-password",
    activityTimeline: "/api/user/activity-timeline",
    securityStatus: "/api/user/security-status",
    destroy: "/api/user",
    preferences: "/api/user/preferences",
    verifyEmailChange: "/api/user/change-email/verify",
    activate: (id: string | number) => `/api/user/activate/${id}`,
    deactivate: (id: string | number) => `/api/user/deactivate/${id}`,
    suspend: (id: string | number) => `/api/user/suspend/${id}`,
    unsuspend: (id: string | number) => `/api/user/unsuspend/${id}`,
    linkedAccounts: "/api/user/linked-accounts",
    linkAccount: "/api/user/link-account",
    unlinkAccount: (id: string | number) => `/api/user/linked-accounts/${id}`,
    emailPreferences: "/api/user/email-preferences",
    tokens: {
      index: "/api/user/tokens",
      store: "/api/user/tokens",
      destroy: (id: string | number) => `/api/user/tokens/${id}`,
    },
    passkeys: {
      index: "/api/user/passkeys",
      update: (id: string | number) => `/api/user/passkeys/${id}`,
      destroy: (id: string | number) => `/api/user/passkeys/${id}`,
    },
    mfa: {
      methods: "/api/user/mfa-methods",
    },
    compliance: {
      export: "/api/user/compliance/export",
    },
  },

  profiles: {
    list: "/api/profiles",
    upload: "/api/profiles/upload",
    byId: (id: number) => `/api/profiles/${id}`,
    setActive: (id: number) => `/api/profiles/${id}/set-active`,
    update: (id: number) => `/api/profiles/${id}`,
    delete: (id: number) => `/api/profiles/${id}`,
    activeStatus: (id: number) => `/api/profiles/${id}/active-status`,
  },

  logs: "/logs",
  event: "/event",

  translation: (code: string) => `/translate/${code}.json`,

  guest: {
    analyzeAnonymous: "/api/guest/analyze-anonymous",
    matchAnonymous: "/api/guest/match-anonymous",
    getSession: (sessionId: string) => `/api/guest/session/${sessionId}`,
    deleteSession: (sessionId: string) => `/api/guest/session/${sessionId}`,
    tenantConfig: "/api/auth/tenant",
  },

  dashboard: {
    stats: "/api/dashboard/stats",
  },

  themes: {
    generate: "/api/themes/generate",
    tenant: "/api/themes/tenant",
    saveTenant: "/api/themes/tenant",
    presets: "/api/themes/presets",
  },

  dashboards: {
    layouts: (pageId: string) => `/api/dashboards/layouts/${pageId}`,
    updateLayout: (pageId: string) => `/api/dashboards/layouts/${pageId}`,
    resetLayout: (pageId: string) => `/api/dashboards/layouts/${pageId}/reset`,
  },

  developer: {
    apiKeys: "/api/admin/developer-api-keys",
    apiKeyById: (id: string | number) => `/api/admin/developer-api-keys/${id}`,
    webhooks: "/api/admin/webhooks",
    webhookById: (id: string | number) => `/api/admin/webhooks/${id}`,
    testWebhook: (id: string | number) => `/api/admin/webhooks/${id}/test`,
  },

  contact: {
    submit: "/api/contact",
    messages: "/api/admin/contact-messages",
    updateMessageStatus: (id: string | number) =>
      `/api/admin/contact-messages/${id}`,
  },

  automation: {
    config: "/api/automation/config",
    updateConfig: "/api/automation/config",
    start: "/api/automation/start",
    stop: "/api/automation/stop",
    status: "/api/automation/status",
    history: "/api/automation/history",
    stats: "/api/automation/stats",
    runNow: "/api/automation/run-now",
  },

  notifications: {
    list: "/api/notifications",
    markAsRead: (id: number) => `/api/notifications/${id}/read`,
    markAllAsRead: "/api/notifications/read-all",
    delete: (id: number) => `/api/notifications/${id}`,
    clearAll: "/api/notifications/clear-all",
    preferences: "/api/notifications/preferences",
    updatePreferences: "/api/notifications/preferences",
    unreadCount: "/api/notifications/unread-count",
    sse: "/api/sse/notifications",
  },

  sse: {
    scrapingProgress: (sessionId: number | string) =>
      `/api/sse/scraping/${sessionId}`,
    analysisProgress: (analysisId: number | string) =>
      `/api/sse/analysis/${analysisId}`,
  },

  security: {
    cspReport: "/api/security/csp-report",
    cspReportAlt: "/api/security/report/csp",
    headersTest: "/api/security/security-headers-test",
  },

  audit: {
    logs: "/api/audit/logs",
    export: "/api/audit/logs/export",
    statistics: "/api/audit/statistics",
    compliance: "/api/audit/compliance",
  },

  backup: {
    create: "/api/backup/create",
    list: "/api/backup/list",
    byId: (id: number | string) => `/api/backup/${id}`,
    verify: (id: number | string) => `/api/backup/${id}/verify`,
    restore: "/api/backup/restore",
    pitr: "/api/backup/pitr",
    testRestore: (id: number | string) => `/api/backup/${id}/test`,
    rpoStatus: "/api/backup/rpo-status",
  },

  gdpr: {
    dataExport: "/api/gdpr/data-export",
    erasure: "/api/gdpr/erasure",
    downloadExport: (exportId: number | string) =>
      `/api/gdpr/export/${exportId}/download`,
    dataDeletion: "/api/gdpr/data-deletion",
    verifyDeletion: (requestId: number | string) =>
      `/api/gdpr/deletion/${requestId}/verify`,
    consent: "/api/gdpr/consent",
    updateConsent: (consentId: number) => `/api/gdpr/consent/${consentId}`,
    consentStatus: "/api/gdpr/consent/status",
    retentionReport: "/api/gdpr/retention-report",
    processingActivities: "/api/gdpr/processing-activities",
  },

  admin: {
    dashboard: "/api/admin/dashboard",
    users: {
      index: "/api/admin/users",
      store: "/api/admin/users",
      byId: (id: number) => `/api/admin/users/${id}`,
      activate: (id: number) => `/api/admin/users/${id}/activate`,
      deactivate: (id: number) => `/api/admin/users/${id}/deactivate`,
      ban: (id: number) => `/api/admin/users/${id}/ban`,
      unban: (id: number) => `/api/admin/users/${id}/unsuspend`,
      unsuspend: (id: number) => `/api/admin/users/${id}/unsuspend`,
      resetPassword: (id: number) => `/api/admin/users/${id}/reset-password`,
      resetMfa: (id: number) => `/api/admin/users/${id}/mfa-reset`,
      bulkAction: "/api/admin/users/bulk",
      assignRole: (id: number) => `/api/admin/users/${id}/assign-role`,
      impersonate: (id: number) => `/api/admin/users/${id}/impersonate`,
      unlock: (id: number) => `/api/admin/users/${id}/unlock`,
      sessions: (id: number) => `/api/admin/users/${id}/sessions`,
      dataExports: (id: number) => `/api/admin/users/${id}/data-exports`,
      requestDataExport: (id: number) => `/api/admin/users/${id}/data-exports`,
    },
    appeals: {
      index: "/api/admin/appeals",
      resolve: (id: number) => `/api/admin/appeals/${id}/resolve`,
    },
    scim: {
      tokens: {
        index: "/api/admin/scim/tokens",
        store: "/api/admin/scim/tokens",
        destroy: (id: string | number) => `/api/admin/scim/tokens/${id}`,
      },
      config: "/api/admin/scim/config",
      test: "/api/admin/scim/test",
    },
    clients: {
      index: "/api/admin/clients",
      store: "/api/admin/clients",
      byId: (id: string) => `/api/admin/clients/${id}`,
      update: (id: string) => `/api/admin/clients/${id}`,
      destroy: (id: string) => `/api/admin/clients/${id}`,
      rotateSecret: (id: string) => `/api/admin/clients/${id}/rotate-secret`,
      branding: (id: string) => `/api/admin/clients/${id}/branding`,
    },
    saml: {
      config: "/api/admin/saml/config",
      metadata: "/api/admin/saml/metadata",
      uploadMetadata: "/api/admin/saml/metadata/upload",
      fetchRemoteMetadata: "/api/admin/saml/metadata/remote",
      recentEntities: "/api/admin/saml/entities/recent",
    },
    ssf: {
      config: "/api/admin/ssf/config",
      updateConfig: "/api/admin/ssf/config",
      test: "/api/admin/ssf/test",
      broadcast: "/api/admin/ssf/broadcast",
      history: "/api/admin/ssf/history",
    },
    jwks: {
      index: "/api/admin/jwks",
      show: (kid: string) => `/api/admin/jwks/${kid}`,
      store: "/api/admin/jwks",
      rotate: "/api/admin/jwks/rotate",
      destroy: (kid: string) => `/api/admin/jwks/${kid}`,
    },
    scopes: {
      list: "/api/admin/scopes",
      store: "/api/admin/scopes",
      byId: (id: number) => `/api/admin/scopes/${id}`,
      update: (id: number) => `/api/admin/scopes/${id}`,
      destroy: (id: number) => `/api/admin/scopes/${id}`,
    },
    domains: {
      verify: "/api/admin/domains/verify",
      check: "/api/admin/domains/check",
    },
    webhooks: {
      index: "/api/admin/webhooks",
      store: "/api/admin/webhooks",
      byId: (id: number) => `/api/admin/webhooks/${id}`,
      update: (id: number) => `/api/admin/webhooks/${id}`,
      destroy: (id: number) => `/api/admin/webhooks/${id}`,
      test: (id: number) => `/api/admin/webhooks/${id}/test`,
    },
    organizations: {
      index: "/api/admin/organizations",
      store: "/api/admin/organizations",
      byId: (id: number) => `/api/admin/organizations/${id}`,
      destroy: (id: number) => `/api/admin/organizations/${id}`,
      addMember: (id: number) => `/api/admin/organizations/${id}/members`,
      removeMember: (id: number, userId: number) =>
        `/api/admin/organizations/${id}/members/${userId}`,
      logo: (id: number) => `/api/admin/organizations/${id}/logo`,
      invite: (id: number) => `/api/admin/organizations/${id}/invite`,
      invitations: (id: number) => `/api/admin/organizations/${id}/invitations`,
      revokeInvitation: (orgId: number, invitationId: number | string) =>
        `/api/admin/organizations/${orgId}/invitations/${invitationId}/revoke`,
      policies: (id: number) => `/api/admin/organizations/${id}/policies`,
      impersonate: (id: number) => `/api/admin/organizations/${id}/impersonate`,
      domains: (id: number) => `/api/admin/organizations/${id}/domains`,
      domainsCheck: (id: number, domainId: number) =>
        `/api/admin/organizations/${id}/domains/${domainId}/check`,
    },
    provisioning: {
      index: "/api/admin/provisioning",
      store: "/api/admin/provisioning",
      connectors: "/api/admin/provisioning",
      byId: (id: number) => `/api/admin/provisioning/${id}`,
      update: (id: number) => `/api/admin/provisioning/${id}`,
      destroy: (id: number) => `/api/admin/provisioning/${id}`,
      sync: (id: number) => `/api/admin/provisioning/${id}/sync`,
      logs: (id: number) => `/api/admin/provisioning/${id}/logs`,
      syncConnector: (id: number) => `/api/admin/provisioning/${id}/sync`,
      connectorLogs: (id: number) => `/api/admin/provisioning/${id}/logs`,
    },
    auditLogs: {
      index: "/api/admin/audit-logs",
      export: "/api/admin/audit-logs/export",
      security: "/api/admin/security-logs",
      impersonation: "/api/admin/impersonation-logs",
      statistics: "/api/admin/statistics/audit",
    },
    email: {
      templates: "/api/admin/email/templates",
      templateById: (id: string) => `/api/admin/email/templates/${id}`,
      preview: "/api/admin/email/preview",
      test: "/api/admin/email/test",
    },
    statistics: {
      overview: "/api/admin/statistics/summary",
      users: "/api/admin/statistics/users",
      mfa: "/api/admin/statistics/mfa",
      sessionStatistics: "/api/admin/statistics/session-statistics",
      trends: "/api/admin/statistics/trends",
    },
    impersonationLogs: "/api/admin/impersonation-logs",
    security: {
      health: "/api/v1/admin/security/health",
      stats: "/api/v1/admin/security/stats",
      anomalies: "/api/v1/admin/security/anomalies",
      resolveAnomaly: (id: string | number) =>
        `/api/v1/admin/security/anomalies/${id}/resolve`,
      alerts: "/api/v1/admin/security/alerts",
      dismissAlert: (id: string | number) =>
        `/api/v1/admin/security/alerts/${id}/dismiss`,
    },
    alertRules: {
      index: "/api/v1/admin/alert-rules",
      store: "/api/v1/admin/alert-rules",
      update: (id: string | number) => `/api/v1/admin/alert-rules/${id}`,
      destroy: (id: string | number) => `/api/v1/admin/alert-rules/${id}`,
    },
    threatIntel: {
      metrics: "/api/v1/admin/threat-intel/metrics",
      score: "/api/v1/admin/threat-intel/score",
      heatmap: "/api/v1/admin/threat-intel/heatmap",
      indicators: "/api/v1/admin/threat-intel/indicators",
      lookupIp: (ip: string) => `/api/v1/admin/threat-intel/ip/${ip}`,
      lookupDomain: (domain: string) =>
        `/api/v1/admin/threat-intel/domain/${domain}`,
    },
    docs: "/api/admin/docs",
    sandboxExecute: "/api/admin/sandbox/execute",
  },

  rbac: {
    roles: {
      list: "/api/admin/rbac/roles",
      stats: "/api/admin/rbac/roles/stats",
      store: "/api/admin/rbac/roles",
      byId: (id: number) => `/api/admin/rbac/roles/${id}`,
      update: (id: number) => `/api/admin/rbac/roles/${id}`,
      destroy: (id: number) => `/api/admin/rbac/roles/${id}`,
      permissions: (role: string) =>
        `/api/admin/rbac/roles/${role}/permissions`,
      assignPermission: "/api/admin/rbac/roles/assign-permission",
      syncPermissions: (id: number) =>
        `/api/admin/rbac/roles/${id}/permissions`,
      syncParents: (id: number) => `/api/admin/rbac/roles/${id}/parents`,
    },
    permissions: {
      list: "/api/admin/rbac/permissions",
      byId: (id: number) => `/api/admin/rbac/permissions/${id}`,
      store: "/api/admin/rbac/permissions",
      grant: "/api/admin/rbac/permissions/grant",
      revoke: "/api/admin/rbac/permissions/revoke",
    },
    users: {
      assignRole: "/api/admin/rbac/users/assign-role",
    },
    members: {
      overrides: (id: number) => `/api/admin/rbac/members/${id}/overrides`,
      addOverride: (id: number) => `/api/admin/rbac/members/${id}/overrides`,
      removeOverride: (id: number, pid: number) =>
        `/api/admin/rbac/members/${id}/overrides/${pid}`,
    },
    accessPolicies: "/api/admin/rbac/access-policies",
  },

  adminMembers: {
    overrides: (id: number) => `/api/admin/rbac/members/${id}/overrides`,
    addOverride: (id: number) => `/api/admin/rbac/members/${id}/overrides`,
    removeOverride: (id: number, pid: number) =>
      `/api/admin/rbac/members/${id}/overrides/${pid}`,
  },

  developerApiKeys: {
    index: "/api/v1/admin/developer/api-keys",
    store: "/api/v1/admin/developer/api-keys",
    destroy: (id: number | string) => `/api/v1/admin/developer/api-keys/${id}`,
  },

  accessControl: {
    nfc: {
      cards: (orgId: string | number) =>
        `/api/admin/organizations/${orgId}/nfc/cards`,
      cardStatus: (orgId: string | number, cardId: string | number) =>
        `/api/admin/organizations/${orgId}/nfc/cards/${cardId}/status`,
      cardById: (orgId: string | number, cardId: string | number) =>
        `/api/admin/organizations/${orgId}/nfc/cards/${cardId}`,
      accessPoints: (orgId: string | number) =>
        `/api/admin/organizations/${orgId}/nfc/access-points`,
      logs: (orgId: string | number) =>
        `/api/admin/organizations/${orgId}/nfc/logs`,
      scan: "/api/v1/access-control/scan",
    },
  },

  civilRegistry: {
    certificates: (orgId: string | number) =>
      `/api/v1/organizations/${orgId}/civil-registry/certificates`,
    search: "/api/admin/civil-registry/search",
  },

  blockchain: {
    generateDid: "/api/v1/blockchain/did/generate",
    resolveDid: (did: string) => `/api/v1/blockchain/did/${did}`,
    issueCredential: "/api/v1/blockchain/vc/issue",
    credentials: "/api/v1/blockchain/vc",
    auditLogs: "/api/v1/blockchain/audit-logs",
  },
} as const;

export const API_QUERY_KEYS = {
  health: {
    all: ["health"] as const,
    basic: ["health", "basic"] as const,
    detailed: ["health", "detailed"] as const,
  },
  metrics: {
    all: ["metrics"] as const,
    basic: ["metrics", "basic"] as const,
    prometheus: ["metrics", "prometheus"] as const,
  },
  auth: {
    all: ["auth"] as const,
    session: ["auth", "session"] as const,
    profileSettings: ["auth", "profile-settings"] as const,
    validateUser: (id: string | number, token: string) =>
      ["auth", "validate", id, token] as const,
    mfa: {
      status: ["auth", "mfa", "status"] as const,
    },
    sessions: ["auth", "sessions"] as const,
    loginHistory: (limit: number) => ["auth", "login-history", limit] as const,
    securityLogs: (params: unknown) =>
      ["auth", "security-logs", params] as const,
    linkedAccounts: ["auth", "linked-accounts"] as const,
    emailPreferences: ["auth", "email-preferences"] as const,
    passwordless: {
      all: ["auth", "passwordless"] as const,
      verify: (token: string) =>
        ["auth", "passwordless", "verify", token] as const,
    },
  },
  translation: (code: string) => ["translation", code] as const,
  settings: ["settings"] as const,
  validateUser: (id: string | number, token: string) =>
    ["validateUser", id, token] as const,
  users: {
    all: ["users"] as const,
    byId: (id: number) => ["users", id] as const,
    byUserType: (userTypeId: number) => ["users", userTypeId] as const,
    passkeys: ["users", "passkeys"] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    stats: ["dashboard", "stats"] as const,
  },
  themes: {
    all: ["themes"] as const,
    tenant: ["themes", "tenant"] as const,
    presets: ["themes", "presets"] as const,
  },
  dashboards: {
    all: ["dashboards"] as const,
    layouts: (pageId: string) => ["dashboards", "layouts", pageId] as const,
  },
  developer: {
    all: ["developer"] as const,
    apiKeys: ["developer", "api-keys"] as const,
    webhooks: ["developer", "webhooks"] as const,
  },
  contact: {
    all: ["contact"] as const,
    messages: ["contact", "messages"] as const,
  },
  automation: {
    all: ["automation"] as const,
    config: ["automation", "config"] as const,
    status: ["automation", "status"] as const,
    history: (params?: string) =>
      params
        ? (["automation", "history", params] as const)
        : (["automation", "history"] as const),
    stats: ["automation", "stats"] as const,
    logs: (params: string) => ["automation", "logs", params] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: ["notifications", "list"] as const,
    unreadCount: ["notifications", "unread-count"] as const,
  },
  admin: {
    all: ["admin"] as const,
    dashboard: ["admin", "dashboard"] as const,
    users: {
      all: ["admin", "users"] as const,
      index: ["admin", "users"] as const,
      byId: (id: number) => ["admin", "users", id] as const,
      list: (params: string) => ["admin", "users", "list", params] as const,
    },
    organizations: {
      all: ["admin", "organizations"] as const,
      index: ["admin", "organizations"] as const,
      byId: (id: number) => ["admin", "organizations", id] as const,
    },
    clients: {
      all: ["admin", "clients"] as const,
      index: ["admin", "clients"] as const,
      byId: (id: string) => ["admin", "clients", id] as const,
    },
    scopes: {
      all: ["admin", "scopes"] as const,
      index: ["admin", "scopes"] as const,
    },
    saml: {
      all: ["admin", "saml"] as const,
      config: ["admin", "saml", "config"] as const,
    },
    scim: {
      all: ["admin", "scim"] as const,
      config: ["admin", "scim", "config"] as const,
    },
    jwks: {
      all: ["admin", "jwks"] as const,
      index: ["admin", "jwks"] as const,
    },
    provisioning: {
      all: ["admin", "provisioning"] as const,
      connectors: ["admin", "provisioning", "connectors"] as const,
    },
    ssf: {
      all: ["admin", "ssf"] as const,
      config: ["admin", "ssf", "config"] as const,
    },
    auditLogs: {
      all: ["admin", "audit-logs"] as const,
      index: ["admin", "audit-logs"] as const,
    },
    impersonationLogs: ["admin", "impersonation-logs"] as const,
    appeals: {
      all: ["admin", "appeals"] as const,
      index: ["admin", "appeals"] as const,
    },
    securityLogs: (params: string) =>
      ["admin", "security-logs", params] as const,
    statistics: ["admin", "statistics"] as const,
  },
  backup: {
    all: ["backup"] as const,
    list: ["backup", "list"] as const,
    byId: (id: number | string) => ["backup", id] as const,
  },
  gdpr: {
    all: ["gdpr"] as const,
    dataExport: ["gdpr", "data-export"] as const,
    erasure: ["gdpr", "erasure"] as const,
  },
  rbac: {
    all: ["rbac"] as const,
    permissions: {
      all: ["rbac", "permissions"] as const,
      index: ["rbac", "permissions"] as const,
      byId: (id: number) => ["rbac", "permissions", id] as const,
    },
    roles: {
      all: ["rbac", "roles"] as const,
      index: ["rbac", "roles"] as const,
      byId: (id: number) => ["rbac", "roles", id] as const,
      permissions: (role: string) =>
        ["rbac", "roles", role, "permissions"] as const,
    },
    accessPolicies: ["rbac", "access-policies"] as const,
  },
} as const;

export type API_ENDPOINTS = typeof API_ENDPOINTS;
export type API_QUERY_KEYS = typeof API_QUERY_KEYS;

export { API_ENDPOINTS as ENDPOINTS, API_QUERY_KEYS as QUERY_KEYS };
