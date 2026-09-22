/**
 * Dynamic Route Registry Contracts & Central Route Registry (Tier 0 Foundation)
 * Single Source of Truth (SSOT) for all application routes.
 *
 * ---------------------------------------------------------------------------
 * THE ONE RULE
 * ---------------------------------------------------------------------------
 * Every URL literal in this application is written exactly once, here. Feature
 * modules, layouts, navigation items and router links all derive from this
 * file, so editing a path here changes it everywhere in the codebase.
 *
 * Do NOT write a URL string anywhere else -- not in a module's `path.ts`, not
 * in a `routes.tsx`, not in a `navigate()` call. A module's `path.ts` is a thin
 * projection of a namespace below (`export default AppPaths.session`), never a
 * second copy of the literals.
 *
 * This rule is not stylistic. When `AppPaths` and the auth sub-module path
 * files both held literals, they drifted until 52 entries here pointed at URLs
 * no router served -- so navigating via the "single source of truth" produced
 * blank screens. `appPathsParity.test.ts` now compares these values against the
 * paths the router actually registers and fails on any such drift.
 *
 * ---------------------------------------------------------------------------
 * BEFORE CHANGING OR DELETING A PATH
 * ---------------------------------------------------------------------------
 * Route paths are a contract with the backend too. The Adonis service at
 * `Authentication/` builds frontend URLs from `BASE_URL` in account listeners,
 * SCIM onboarding and the OAuth/OIDC controllers -- a path that looks unused in
 * this repo can be the exact link inside every verification email. Grep the
 * backend before touching anything under `auth.*`.
 */

export interface DynamicRouteDescriptor {
  id: string;
  path: string;
  moduleId?: string;
  label?: string;
  icon?: string;
}

export type DynamicRouteRegistry = Record<string, DynamicRouteDescriptor>;

/**
 * Fallback route resolver that looks up registered module paths dynamically,
 * falling back to default convention paths if a module has not registered a custom path.
 *
 * The `defaultPath` must be a real registered route: when no module claims
 * `targetId`, that default is what the user actually navigates to.
 */
export const resolveDynamicPath = (
  registeredItems: Array<{ id?: string; path?: string }>,
  targetId: string,
  defaultPath: string,
): string => {
  const match = registeredItems.find(
    (item) => item.id === targetId || item.path === defaultPath,
  );
  return match?.path || defaultPath;
};

/**
 * Type-safe URL parameter compiler.
 * Replaces `:param` tokens in route templates with concrete string or numeric values.
 *
 * Example:
 * ```ts
 * compilePath(AppPaths.admin.userProfile, { id: 'usr_123' }) // -> '/admin/user/usr_123'
 * ```
 */
export const compilePath = (
  pathTemplate: string,
  params: Record<string, string | number> = {},
): string => {
  return Object.entries(params).reduce((acc, [key, val]) => {
    return acc.replace(new RegExp(`:${key}\\b`, "g"), String(val));
  }, pathTemplate);
};

// ===========================================================================
// SECTION 1 -- Module-owned namespaces.
// These hold the URL literals. Each maps 1:1 onto the module that registers
// the corresponding routes, so a module's `path.ts` is a one-line projection.
// ===========================================================================

/** @cap/module-landing */
const landing = {
  home: "/",
  about: "/about",
  features: "/features",
  pricing: "/pricing",
  contact: "/contact",
  privacyPolicy: "/privacy-policy",
  termsOfService: "/terms-of-service",
} as const;

/** @cap/module-dashboard */
const dashboard = {
  dashboard: "/dashboard",
} as const;

/** @cap/module-theme */
const theme = {
  theme: "/theme",
} as const;

/**
 * @cap/module-widget-studio
 * The studio is a panel on the dashboard, so `root` is its registry identity
 * rather than a routed page.
 */
const widgetStudio = {
  root: "/widget-studio",
} as const;

/**
 * auth :: authentication-core -- sign in/up, recovery, verification, email change.
 *
 * `/auth/verify-email/:email` and `/auth/recovery/forgot-password` are the URLs
 * the Authentication service emails to users. Changing either requires the
 * matching change in `Authentication/app/listeners/account_listener.ts` and
 * `Authentication/app/controllers/scim/users_controller.ts`.
 */
const authenticationCore = {
  // --- sign in ---
  signin: "/auth/sign-in",

  // --- sign up & verification ---
  signup: "/auth/sign-up",
  checkEmail: "/auth/verify-email-confirmation",
  emailVerification: "/auth/verification/email-sent",
  verifyEmail: "/auth/verify-email/:email",
  verificationLinkExpired: "/auth/verification-link-expired",
  registrationSuccess: "/auth/registration-success",
  emailVerifiedSuccess: "/auth/verify-email/success",
  validate: "/auth/validate/:id?/:token?",

  // --- password recovery ---
  forgotPassword: "/auth/recovery/forgot-password",
  resetPassword: "/auth/reset-password/:email",
  passwordResetSuccess: "/auth/recovery/password-reset-success",

  // --- email change link landings (initiation lives in user-directory) ---
  emailChangeStatus: "/auth/email/change-status",
  emailChangeVerification: "/auth/email/verify-change/:token",
  emailChangeSuccess: "/auth/email/change-success",
  emailChangeFailed: "/auth/email/change-failed",

  // --- device & organisation ---
  deviceCode: "/auth/device/code",
  joinOrganization: "/auth/join-organization",

  /**
   * Social-login landing. The Authentication service finishes the OAuth dance
   * server-side and redirects here with a one-time `?code=` handle
   * (`social_auth_controller.ts`), which the screen trades for a session via
   * POST /api/auth/social/exchange.
   */
  callback: "/auth/callback",
} as const;

/** auth :: authorization-engine -- API tokens, roles, policies. */
const authorizationEngine = {
  // --- API tokens ---
  dashboard: "/auth/api-tokens",
  createBasic: "/auth/api-tokens/create/basic",
  createRestrictions: "/auth/api-tokens/create/restrictions",
  details: "/auth/api-tokens/:tokenId",
  display: "/auth/api-tokens/:tokenId/display",
  actions: "/auth/api-tokens/:tokenId/actions",
  securityWarning: "/auth/api-tokens/security-warning",
  machineIdentities: "/admin/machine-identities",

  // --- roles, policies & domains ---
  roles: "/admin/roles",
  roleDetail: "/admin/roles/:id",
  permissions: "/admin/permissions",
  policyCanvas: "/admin/policies/canvas",
  domainVerification: "/admin/domain-verification",
} as const;

/** auth :: access-control -- physical NFC access, organization-scoped. */
const accessControl = {
  cards: "/admin/access-control/cards",
  points: "/admin/access-control/points",
  logs: "/admin/access-control/logs",
} as const;

/** auth :: billing -- plan, usage and upgrade screens. */
const billing = {
  overview: "/dashboard/billing",
  upgrade: "/dashboard/billing/upgrade",
} as const;

/** auth :: developer-console */
const developerConsole = {
  developerConsole: "/developer-console",
  webhooks: "/developer-console/webhooks",
} as const;

/** auth :: identity-broker -- SSO (SAML/OIDC), provisioning, SCIM. */
const identityBroker = {
  // --- provisioning ---
  provisioning: "/admin/provisioning",
  scim: "/admin/provisioning/scim",
  syncLogs: "/admin/provisioning/logs",
  connectorDetail: "/admin/provisioning/connectors/:id",

  // --- OIDC ---
  oidcConfigBrowser: "/auth/sso/oidc-config",
  oidcClientCreate: "/auth/sso/oidc-config/create",
  oidcClientEdit: "/auth/sso/oidc-config/:id/edit",
  oidcLoginPrompt: "/auth/sso/oidc-prompt",
  oidcWait: "/auth/sso/oidc/wait",

  // --- SAML ---
  samlConfigDashboard: "/auth/sso/saml-config",
  samlMetadataBrowser: "/auth/sso/saml-browser",
  samlMetadataDisplay: "/auth/sso/saml-metadata",
  samlWait: "/auth/sso/saml/wait",
  samlSSOInitiation: "/auth/sso/login",

  // --- shared SSO surface ---
  authWait: "/auth/sso/wait",
  permissionConsent: "/auth/sso/consent",
  providerSelection: "/auth/sso/select-provider",
  jwksManagement: "/auth/sso/jwks",
  ssfConfiguration: "/auth/sso/ssf-config",
  caepEventConsole: "/admin/identity/shared-signals",
} as const;

/** auth :: mfa-orchestrator -- MFA, passkeys, platform authenticators. */
const mfaOrchestrator = {
  mfa: {
    setup: "/auth/mfa/setup",
    setup_sms: "/auth/mfa/setup/sms",
    verification: "/auth/mfa/verify",
    /** The one MFA management screen. `/auth/mfa/dashboard` used to mount the
     *  same screen a second time and has been removed. */
    management: "/auth/mfa/manage",
  },
  passkey: {
    login: "/auth/passkey/login",
    management: "/auth/passkey/management",
    recovery: "/auth/passkey/recovery",
    prompt: "/auth/passkey/prompt",
    setup: "/auth/passkey/setup",
    usage_stats: "/auth/passkey/usage-stats",
  },
  platform: {
    login: "/auth/platform/login",
    register: "/auth/platform/register",
  },
} as const;

/** auth :: passwordless-service */
const passwordlessService = {
  setup: "/auth/passwordless/init",
  verification: "/auth/passwordless/verify",
} as const;

/** auth :: platform-cluster -- developer tooling, monitoring, system error pages. */
const platformCluster = {
  developer: {
    dashboard: "/admin/developer",
    application: "/admin/developer/application",
    application_detail_view: "/admin/developer/application-detail-view",
    module_management: "/admin/developer/module-management",
    scopes_registry: "/admin/developer/scopes-registry",
    webhooks: "/admin/developer/webhooks",
  },
  monitor: {
    dashboard: "/admin/monitoring",
    events: "/admin/monitoring/events",
    emailTemplatePreview: "/admin/monitoring/email-preview/:id",
    emailTesting: "/admin/monitoring/email-testing",
    exportAudit: "/admin/monitoring/export-audit",
    mfa_analytics: "/admin/monitoring/mfa-analytics",
    real_time: "/admin/monitoring/real-time-events",
    health: "/admin/monitoring/health",
    security_health: "/admin/monitoring/security-health",
    // Audit-log *integrity*, as distinct from `exportAudit` which reads the
    // entries themselves.
    auditChain: "/admin/monitoring/audit-chain",
    anchors: "/admin/monitoring/anchors",
    queues: "/admin/monitoring/queues",
    anomalies: "/admin/monitoring/anomalies",
    alerts: "/admin/monitoring/alerts",
  },
  system: {
    browserNotSupported: "/system/browser-not-supported",
    csrfError: "/system/csrf-error",
    maintenance: "/system/maintenance",
    unauthorized401: "/system/unauthorized",
    forbidden403: "/system/forbidden",
    tooManyRequests429: "/system/too-many-requests",
  },
} as const;

/** auth :: session-manager -- the signed-in user's own account & security. */
const sessionManager = {
  overview: "/auth/account",
  activeSessions: "/auth/account/active-sessions",
  changePassword: "/auth/account/password/change",
  activityTimeline: "/auth/account/activity-timeline",
} as const;

/** auth :: user-directory -- admin user/org management plus self-service settings. */
const userDirectory = {
  admin: {
    organizations: {
      list: "/organizations",
      organizationProfile: "/organizations/:id",
      invitations: "/organizations/:id/invitations",
      domain_verification: "/organizations/domain-verification",
    },
    users: {
      list: "/admin/users",
      user_profile: "/admin/user/:id",
      ban_management: "/admin/user/:id/ban",
      data_export: "/admin/user/data-export",
      impersonation_logs: "/admin/user/:id/impersonation-logs",
    },
    compliance: {
      reports: "/admin/compliance/reports",
    },
  },
  profile: {
    view: "/profile",
    linkedAccounts: "/profile/linked-accounts",
  },
  settings: {
    change_email: "/user/change-email",
    data_export: "/user/data-export",
    deactivate: "/user/deactivate",
    delete: "/user/delete",
    email_change_status: "/user/email-change-status",
    initiate_email_change: "/user/initiate-email-change",
    privacy: "/account/privacy",
    erasure: "/account/privacy/erasure",
  },
} as const;

// ===========================================================================
// SECTION 2 -- Cross-cutting views.
// Convenience groupings for consumers that think in terms of "the account
// area" or "the admin area" rather than in terms of owning modules. These add
// NO new literals: every value references Section 1.
// ===========================================================================

/** The signed-in user's own account surface, spanning session-manager + user-directory. */
const account = {
  overview: sessionManager.overview,
  profile: sessionManager.overview,
  security: sessionManager.overview,
  view: userDirectory.profile.view,
  /** Where "edit my account" lands. `/profile` accepts `?edit=true`. */
  edit: userDirectory.profile.view,
  settings: userDirectory.settings.change_email,
  changeEmail: userDirectory.settings.change_email,
  changePassword: sessionManager.changePassword,
  delete: userDirectory.settings.delete,
  deactivate: userDirectory.settings.deactivate,
  dataExport: userDirectory.settings.data_export,
  linkedAccounts: userDirectory.profile.linkedAccounts,
  activeSessions: sessionManager.activeSessions,
  sessions: sessionManager.activeSessions,
  activityTimeline: sessionManager.activityTimeline,
  emailChangeStatus: userDirectory.settings.email_change_status,
  initiateEmailChange: userDirectory.settings.initiate_email_change,
  privacy: userDirectory.settings.privacy,
  erasure: userDirectory.settings.erasure,
} as const;

/** The admin console surface, spanning several auth sub-modules. */
const admin = {
  // user directory
  users: userDirectory.admin.users.list,
  userProfile: userDirectory.admin.users.user_profile,
  userDataExport: userDirectory.admin.users.data_export,
  banManagement: userDirectory.admin.users.ban_management,
  impersonationLogs: userDirectory.admin.users.impersonation_logs,

  // organizations
  organizations: userDirectory.admin.organizations.list,
  organizationProfile: userDirectory.admin.organizations.organizationProfile,
  invitations: userDirectory.admin.organizations.invitations,
  orgDomainVerification: userDirectory.admin.organizations.domain_verification,

  // authorization
  roles: authorizationEngine.roles,
  roleDetail: authorizationEngine.roleDetail,
  permissions: authorizationEngine.permissions,
  policyCanvas: authorizationEngine.policyCanvas,
  domainVerification: authorizationEngine.domainVerification,
  machineIdentities: authorizationEngine.machineIdentities,
  apiTokens: authorizationEngine.dashboard,

  // developer & applications
  developerDashboard: platformCluster.developer.dashboard,
  applications: platformCluster.developer.application,
  appDetail: platformCluster.developer.application_detail_view,
  scopes: platformCluster.developer.scopes_registry,
  moduleManagement: platformCluster.developer.module_management,
  developerWebhooks: platformCluster.developer.webhooks,
  developerConsole: developerConsole.developerConsole,
  webhooks: developerConsole.webhooks,

  // provisioning & SCIM
  provisioning: identityBroker.provisioning,
  scim: identityBroker.scim,
  syncLogs: identityBroker.syncLogs,
  connectorDetail: identityBroker.connectorDetail,

  // SSO administration
  samlMetadataDisplay: identityBroker.samlMetadataDisplay,
  samlMetadataBrowser: identityBroker.samlMetadataBrowser,
  samlConfigDashboard: identityBroker.samlConfigDashboard,
  oidcConfigBrowser: identityBroker.oidcConfigBrowser,
  oidcClientCreate: identityBroker.oidcClientCreate,
  oidcClientEdit: identityBroker.oidcClientEdit,
  ssfConfiguration: identityBroker.ssfConfiguration,
  jwksManagement: identityBroker.jwksManagement,

  // monitoring
  monitoringDashboard: platformCluster.monitor.dashboard,
  events: platformCluster.monitor.events,
  emailTemplatePreview: platformCluster.monitor.emailTemplatePreview,
  emailTesting: platformCluster.monitor.emailTesting,
  exportAudit: platformCluster.monitor.exportAudit,
  mfaAnalytics: platformCluster.monitor.mfa_analytics,
  realTimeEvents: platformCluster.monitor.real_time,
  health: platformCluster.monitor.health,
  securityHealth: platformCluster.monitor.security_health,
} as const;

/** The SSO surface as end users meet it, a subset of identity-broker. */
const sso = {
  authWait: identityBroker.authWait,
  oidcWait: identityBroker.oidcWait,
  samlWait: identityBroker.samlWait,
  oidcLoginPrompt: identityBroker.oidcLoginPrompt,
  permissionConsent: identityBroker.permissionConsent,
  providerSelection: identityBroker.providerSelection,
  samlSSOInitiation: identityBroker.samlSSOInitiation,
  oidcConfigBrowser: identityBroker.oidcConfigBrowser,
  oidcClientCreate: identityBroker.oidcClientCreate,
  oidcClientEdit: identityBroker.oidcClientEdit,
  samlConfigDashboard: identityBroker.samlConfigDashboard,
  samlMetadataBrowser: identityBroker.samlMetadataBrowser,
  samlMetadataDisplay: identityBroker.samlMetadataDisplay,
  jwksManagement: identityBroker.jwksManagement,
  ssfConfiguration: identityBroker.ssfConfiguration,
} as const;

/**
 * Canonical Application Route Paths Registry (SSOT)
 */
export const AppPaths = {
  // module-owned namespaces
  landing,
  dashboard,
  theme,
  widgetStudio,
  auth: authenticationCore,
  authorization: authorizationEngine,
  accessControl,
  billing,
  developerConsole,
  identity: identityBroker,
  mfa: mfaOrchestrator,
  passkey: mfaOrchestrator.passkey,
  passwordless: passwordlessService,
  platformCluster,
  developer: platformCluster.developer,
  monitoring: platformCluster.monitor,
  system: platformCluster.system,
  session: sessionManager,
  user: userDirectory,

  // cross-cutting views
  account,
  admin,
  sso,
  apiTokens: authorizationEngine,
} as const;

/**
 * Paths that are deliberately present above but have no route registered yet.
 *
 * Every entry here is a known gap, not an oversight: `appPathsParity.test.ts`
 * treats this as the exhaustive allowlist, so adding a path to `AppPaths`
 * without a route fails the suite unless it is listed here with a reason.
 * Removing the gap means routing a screen and deleting the entry.
 */
export const UNIMPLEMENTED_PATHS: Readonly<Record<string, string>> = {
  // Empty, and worth keeping that way: every path in AppPaths currently
  // resolves to a screen the router serves.
} as const;

export type AppPathsType = typeof AppPaths;
export default AppPaths;
