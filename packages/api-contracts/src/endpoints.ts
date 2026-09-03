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
    register: "/api/v1/auth/register",
    signup: "/api/v1/auth/register",
    login: "/api/v1/auth/login",
    logout: "/api/v1/auth/logout",
    forgotPassword: "/api/auth/forgot-password",
    resetPassword: "/api/auth/reset-password",
    refresh: "/api/v1/auth/refresh",
    /**
     * Current session, not the current user. Stays on the legacy tree: the
     * nearest v1 route, `/api/v1/auth/me`, returns the user and is served by a
     * different controller, so it is not a twin of this — see `me` below.
     */
    session: "/api/auth/session",
    /**
     * The authenticated user, with role, permissions, org memberships and
     * profile eagerly loaded. The companion to `session`, not a replacement:
     * `session` describes the session, this describes who owns it.
     *
     * The handler emits its payload twice — once inside the `successResponse`
     * envelope and once spread across the top level — so callers may read
     * either `data.data` or `data`. Prefer `data.data`: the flat copy exists
     * for older clients and is the half that will be dropped.
     */
    me: "/api/v1/auth/me",
    checkPermission: "/api/v1/auth/check-permission",
    csrfToken: "/api/auth/csrf-token",
    /**
     * Verify an email address. POST — the old `GET /verification/email/:email`
     * was removed because it put the address in the URL path, where it leaks
     * into logs and referrers (backend finding H-9).
     *
     * Takes the query string from the mailed link and forwards it unchanged.
     * The backend signs that query — the address included — and validates the
     * signature against the request URL, so it identifies the address being
     * verified and cannot be rebuilt from parts or moved into the body without
     * breaking the signature.
     */
    verifyEmail: (search?: string) =>
      `/api/auth/verification/email/verify${search ?? ""}`,
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
    /**
     * Validate a user via a mailed activation token. POST, with `id` and `token`
     * in the body — the old `GET /validate/:id/:token` was removed for the same
     * reason as the email verification route above (backend finding H-9).
     */
    validateUser: "/api/auth/validate",
    appealBan: "/api/auth/appeal-ban",
    device: "/api/auth/device",
    verifyResetToken: "/api/auth/reset-password/verify-token",
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
      authorize: "/api/auth/device",
      verifyAction: "/api/auth/device/verify",
    },
    oidcInteraction: {
      get: (uid: string) => `/api/auth/oidc/interaction/${uid}`,
      login: (uid: string) => `/api/auth/oidc/interaction/${uid}/login`,
      mfa: (uid: string) => `/api/auth/oidc/interaction/${uid}/mfa`,
      consent: (uid: string) => `/api/auth/oidc/interaction/${uid}/consent`,
      confirm: (uid: string) => `/api/auth/oidc/interaction/${uid}/confirm`,
      abort: (uid: string) => `/api/auth/oidc/interaction/${uid}/abort`,
    },
    social: {
      redirect: (provider: string) => `/api/auth/social/${provider}/redirect`,
      callback: (provider: string) => `/api/auth/social/${provider}/callback`,
      exchange: "/api/auth/social/exchange",
    },
    oidc: {
      auth: "/api/auth/oidc/auth",
      token: "/api/auth/oidc/token",
      jwks: "/api/auth/oidc/jwks",
      userinfo: "/api/auth/oidc/userinfo",
      introspect: "/api/auth/oidc/introspect",
      revoke: "/api/auth/oidc/revoke",
      endSession: "/api/auth/oidc/end-session",
      par: "/api/auth/oidc/par",
      register: "/api/auth/oidc/register",
      backchannelLogout: "/api/auth/oidc/backchannel-logout",
    },
    saml: {
      sso: "/api/auth/saml/sso",
    },
    passkey: {
      list: "/api/auth/passkey",
      update: (id: string | number) => `/api/auth/passkey/${id}`,
      delete: (id: string | number) => `/api/auth/passkey/${id}`,
      // The v1 routes delegate to the same controller methods the legacy ones
      // call, so these are true aliases rather than a reimplementation.
      registerStart: "/api/v1/auth/passkey/register/options",
      registerFinish: "/api/v1/auth/passkey/register/verify",
      loginStart: "/api/v1/auth/passkey/authenticate/options",
      loginFinish: "/api/v1/auth/passkey/authenticate/verify",
    },
    mfa: {
      /**
       * Enrollment stays on the legacy tree. `/api/v1/auth/mfa/totp/setup`
       * looks like a twin but is a separate implementation: it answers
       * `{ secret, qrCodeUrl, backupCodes }` where this answers
       * `{ qrDataUrl, manualEntry }`, and it hands the raw TOTP seed to the
       * browser, which this route deliberately keeps server-side in Redis.
       */
      setup: "/api/auth/mfa/setup",
      verify: "/api/auth/mfa/verify",
      disable: "/api/auth/mfa/disable",
      recoveryCodes: "/api/auth/mfa/recovery-codes",
      /** Spend a recovery code to satisfy the login challenge, unauthenticated:
       *  the account comes from the signed MFA challenge token. */
      recoveryVerify: "/api/auth/mfa/recovery-verify",
      verifyLogin: "/api/auth/mfa/verify-login",
      regenerateBackupCodes: "/api/auth/mfa/regenerate-backup-codes",
      /**
       * Step-up for a session that is *already* signed in: both routes promote
       * the current session to MFA-verified, which is what `middleware.mfa()`
       * gates the sensitive admin actions on.
       *
       * Not to be confused with `verifyLogin` / `recoveryVerify` above. Those
       * clear the login challenge for a caller who has no session yet and must
       * present the signed MFA challenge token; these take the account from the
       * session and need only the code.
       */
      stepUp: {
        /** `totp_controller.verify` — the enrollment routes will not do: they
         *  need a pending secret in Redis and fail once enrollment is done. */
        totp: "/api/mfa/totp/verify",
        /** `totp_controller.useRecoveryCode`. */
        recovery: "/api/auth/mfa/totp/recovery",
      },
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
    deactivateSelf: "/api/user/deactivate",
    deactivate: (id?: string | number) =>
      id ? `/api/user/deactivate/${id}` : "/api/user/deactivate",
    suspend: (id: string | number) => `/api/user/suspend/${id}`,
    unsuspend: (id: string | number) => `/api/user/unsuspend/${id}`,
    linkedAccounts: "/api/user/linked-accounts",
    linkAccount: "/api/user/link-account",
    unlinkAccount: (id: string | number) => `/api/user/linked-accounts/${id}`,
    /**
     * GET reads the preferences, PUT replaces them. On the v1 tree per the
     * usual rule — the admin exception does not apply, this is a user route and
     * both mounts reach the same controller behind `auth()` alone. The legacy
     * mount also answered PATCH; v1 does not, so partial updates have to send
     * the whole object.
     */
    emailPreferences: "/api/v1/user/email-preferences",
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
      methods: "/api/user/mfa/methods",
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
      suspend: (id: number) => `/api/admin/users/${id}/suspend`,
      /** PATCH — set the account status directly, where `ban`/`unsuspend`
       *  above are the two named transitions. */
      updateStatus: (id: number) => `/api/admin/users/${id}/status`,
      // Only ever mounted on v1 — the legacy paths these used to name were
      // never served, so both calls 404'd. An exception to keeping admin on the
      // legacy tree, and a safe one: the v1 routes carry `admin()`.
      dataExports: (id: number) => `/api/v1/admin/users/${id}/data-exports`,
      requestDataExport: (id: number) =>
        `/api/v1/admin/users/${id}/data-exports`,
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
      /** Tenant branding: GET reads the saved styles, POST replaces them. */
      styles: (id: number) => `/api/admin/organizations/${id}/styles`,
      // Organization-scoped domain routes were removed: the backend serves
      // domain verification only at the tenant level, as `admin.domains.verify`
      // and `admin.domains.check`. Nothing ever answered
      // `/api/admin/organizations/:id/domains`.
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
      /** The same security events as `security` above, served from under the
       *  audit-log controller rather than the top-level alias. */
      securityLogs: "/api/admin/audit-logs/security-logs",
      impersonation: "/api/admin/impersonation-logs",
      /** Aggregates over the audit log itself. Distinct from `statistics`,
       *  which is the platform statistics controller's audit summary. */
      auditStatistics: "/api/admin/audit/statistics",
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
      recentJobs: "/api/admin/statistics/recent-jobs",
    },
    impersonationLogs: "/api/admin/impersonation-logs",
    /**
     * The security dashboard's own summary views. These stay on `/api/v1` — the
     * v1 security block, unlike `alert-rules` and `threat-intel` below, does
     * apply `admin()`, and `resolveAnomaly` / `dismissAlert` have no legacy
     * equivalent at all.
     */
    security: {
      health: "/api/v1/admin/security/health",
      stats: "/api/v1/admin/security/stats",
      anomalies: "/api/v1/admin/security/anomalies",
      resolveAnomaly: (id: string | number) =>
        `/api/v1/admin/security/anomalies/${id}/resolve`,
      alerts: "/api/v1/admin/security/alerts",
      dismissAlert: (id: string | number) =>
        `/api/v1/admin/security/alerts/${id}/dismiss`,
      /** Diagnostic: reports which security headers the backend is sending. */
      headersTest: "/api/admin/security/headers-test",
    },

    /**
     * The full alert queue, behind the summary in `security.alerts`. Every
     * route is admin-gated under `/api/admin`.
     */
    alerts: {
      index: "/api/admin/alerts",
      byId: (id: string | number) => `/api/admin/alerts/${id}`,
      update: (id: string | number) => `/api/admin/alerts/${id}`,
      destroy: (id: string | number) => `/api/admin/alerts/${id}`,
      acknowledge: (id: string | number) => `/api/admin/alerts/${id}/acknowledge`,
      resolve: (id: string | number) => `/api/admin/alerts/${id}/resolve`,
      bulkResolve: "/api/admin/alerts/bulk-resolve",
      countBySeverity: "/api/admin/alerts/count-by-severity",
    },

    /** Anomaly detection: the queue, the detector, and its baseline. */
    anomalies: {
      index: "/api/admin/anomalies",
      byId: (id: string | number) => `/api/admin/anomalies/${id}`,
      update: (id: string | number) => `/api/admin/anomalies/${id}`,
      updateStatus: (id: string | number) => `/api/admin/anomalies/${id}/status`,
      falsePositive: (id: string | number) =>
        `/api/admin/anomalies/${id}/false-positive`,
      baseline: "/api/admin/anomalies/baseline",
      refreshBaseline: "/api/admin/anomalies/baseline/refresh",
      detect: "/api/admin/anomalies/detect",
      score: "/api/admin/anomalies/score",
      stats: "/api/admin/anomalies/stats",
    },
    /**
     * SIEM alert rules and threat intelligence stay on `/api/admin/*` — the one
     * place this registry does not prefer the `/api/v1` twin.
     *
     * Both v1 groups are mounted with `middleware.auth()` and no
     * `middleware.admin()`, so any signed-in user can read and mutate them
     * there; the legacy groups sit inside the `/api/admin` group that does
     * apply `admin()`. The v1 handlers are one-line delegations to the legacy
     * ones, so the responses are identical and only the gate differs.
     *
     * Move these back to v1 once the backend routes carry `admin()`.
     */
    alertRules: {
      index: "/api/admin/alert-rules",
      store: "/api/admin/alert-rules",
      update: (id: string | number) => `/api/admin/alert-rules/${id}`,
      destroy: (id: string | number) => `/api/admin/alert-rules/${id}`,
    },
    threatIntel: {
      metrics: "/api/admin/threat-intel/metrics",
      score: "/api/admin/threat-intel/score",
      heatmap: "/api/admin/threat-intel/heatmap",
      indicators: "/api/admin/threat-intel/indicators",
      lookupIp: (ip: string) => `/api/admin/threat-intel/ip/${ip}`,
      lookupDomain: (domain: string) =>
        `/api/admin/threat-intel/domain/${domain}`,
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
    /**
     * The policy engine behind the access-policy canvas: turn a policy graph
     * into a rule set and back, try it against a scenario, and read the
     * defaults.
     *
     * These stay on `/api/admin` rather than the `/api/v1/admin` twins for a
     * sharper reason than the rest of the admin tree: the legacy mount gates
     * them with `mfa()` step-up plus `requirePermission('org:manage')`, and the
     * v1 mount reaches the identical controller with `admin()` alone. Calling
     * v1 here would route policy mutation around the step-up prompt.
     */
    policies: {
      simulate: "/api/admin/rbac/policies/simulate",
      compile: "/api/admin/rbac/policies/compile",
      decompile: "/api/admin/rbac/policies/decompile",
      evaluate: "/api/admin/rbac/policies/evaluate",
      default: "/api/admin/rbac/policies/default",
    },
  },

  /**
   * Tenant-scoped organization settings, mounted outside the admin tree on
   * purpose: `middleware.admin()` is deliberately absent so an organization's
   * own admins can manage their session policy without platform admin rights.
   */
  organizations: {
    sessionPolicy: (id: string | number) =>
      `/api/organizations/${id}/session-policy`,
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
      accessPointById: (orgId: string | number, pointId: string | number) =>
        `/api/admin/organizations/${orgId}/nfc/access-points/${pointId}`,
      /**
       * POST. Issues a new reader bearer token and invalidates the old one
       * immediately — a reader in the field stops authenticating the moment
       * this returns. The raw token is in the response exactly once; only its
       * prefix is readable afterwards.
       */
      regenerateAccessPointToken: (
        orgId: string | number,
        pointId: string | number,
      ) =>
        `/api/admin/organizations/${orgId}/nfc/access-points/${pointId}/regenerate-token`,
      logs: (orgId: string | number) =>
        `/api/admin/organizations/${orgId}/nfc/logs`,
      /**
       * Called by the reader hardware, not the browser: it authenticates with
       * the reader's bearer token in the body and carries no user session.
       * Present here for completeness of the contract, never called by the SPA.
       */
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
    accessControl: {
      all: ["admin", "access-control"] as const,
      cards: (orgId: string | number, params?: unknown) =>
        ["admin", "access-control", orgId, "cards", params] as const,
      accessPoints: (orgId: string | number) =>
        ["admin", "access-control", orgId, "access-points"] as const,
      logs: (orgId: string | number, params?: unknown) =>
        ["admin", "access-control", orgId, "logs", params] as const,
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
