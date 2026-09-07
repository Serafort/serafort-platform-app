/**
 * Dynamic Route Registry Contracts & Central Route Registry (Tier 0 Foundation)
 * Single Source of Truth (SSOT) for all application routes.
 *
 * When changing a path here, all feature modules, layouts, navigation items,
 * and router links inherit the change seamlessly with full TypeScript type safety.
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
 * compilePath(AppPaths.admin.userProfile, { id: 'usr_123' }) // -> '/admin/users/usr_123'
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

/**
 * Canonical Application Route Paths Registry (SSOT)
 */
export const AppPaths = {
  landing: {
    home: "/",
    about: "/about",
    features: "/features",
    pricing: "/pricing",
    contact: "/contact",
    privacyPolicy: "/privacy-policy",
    termsOfService: "/terms-of-service",
    chronosMycelium: "/chronos-mycelium",
  },

  auth: {
    login: "/auth/sign-in",
    signin: "/auth/sign-in",
    signinV2: "/auth/sign-in-v2",
    signup: "/auth/sign-up",
    signupV2: "/auth/sign-up-v2",
    registration: "/auth/register",
    signupSuccess: "/auth/register/success",
    registrationSuccess: "/auth/register/success",
    forgotPassword: "/auth/password/forgot",
    resetPassword: "/auth/password/reset",
    setNewPassword: "/auth/password/set-new",
    passwordResetSuccess: "/auth/password/success",
    checkEmail: "/auth/verification/check-email",
    verifyEmail: "/auth/verification/email",
    verificationLinkExpired: "/auth/verification/expired",
    emailVerification: "/auth/verification/email",
    emailVerifiedSuccess: "/auth/verification/success",
    initiateEmailChange: "/auth/email/change-init",
    emailChangeVerificationPending: "/auth/email/change-pending",
    emailChangeVerification: "/auth/email/change-verify",
    emailChangeSuccess: "/auth/email/change-success",
    emailChangeFailed: "/auth/email/change-failed",
    emailChangeStatus: "/auth/email/change-status",
    exportVerification: "/auth/export/verify",
    deviceCode: "/auth/device",
    joinOrganization: "/auth/org/join",
    unauthorized401: "/auth/unauthorized",
    maintenance: "/auth/maintenance",
    tooManyRequests429: "/auth/too-many-requests",
    csrfError: "/auth/csrf-error",
    browserNotSupported: "/auth/browser-not-supported",
    forbidden403: "/auth/forbidden",
  },

  account: {
    overview: "/account/overview",
    profile: "/account/overview",
    security: "/account/security",
    preferences: "/account/preferences",
    sessions: "/account/sessions",
    activeSessions: "/account/sessions",
    activityTimeline: "/account/activity",
    changePassword: "/account/change-password",
    edit: "/user/settings",
    billing: "/account/billing",
  },

  user: {
    overview: "/user/overview",
    view: "/user/:id",
    edit: "/user/:id/edit",
    changeEmail: "/user/change-email",
    changePassword: "/user/change-password",
    delete: "/user/delete",
    deactivate: "/user/deactivate",
    linkedAccounts: "/user/linked-accounts",
    activeSessions: "/user/sessions",
    sessions: "/user/sessions",
    security: "/user/security",
    settings: "/user/settings",
    emailChangeStatus: "/user/email-change-status",
    initiateEmailChange: "/user/initiate-email-change",
    activityTimeline: "/user/activity",
  },

  admin: {
    root: "/admin",
    dashboard: "/admin/dashboard",
    themeEditor: "/admin/theme-editor",
    themeBuilder: "/admin/theme-builder",
    overview: "/admin",
    users: "/admin/users",
    userProfile: "/admin/users/:id",
    banManagement: "/admin/bans",
    impersonationLogs: "/admin/impersonation-logs",
    organizations: "/admin/organizations",
    organizationProfile: "/admin/organizations/:id",
    invitations: "/admin/organizations/:id/invitations",
    roles: "/admin/roles",
    roleDetail: "/admin/roles/:id",
    permissions: "/admin/permissions",
    policies: "/admin/organizations/:id/policies",
    policyCanvas: "/admin/policy-canvas",
    domainVerification: "/admin/domain-verification",
    machineIdentities: "/admin/machine-identities",
    applications: "/admin/applications",
    appDetail: "/admin/applications/:id",
    scopes: "/admin/scopes",
    apiExplorer: "/admin/api-explorer",
    apiTokens: "/admin/api-tokens",
    webhooks: "/admin/webhooks",
    moduleManagement: "/admin/modules",
    provisioning: "/admin/provisioning",
    scim: "/admin/provisioning/scim",
    syncLogs: "/admin/provisioning/logs",
    connectorDetail: "/admin/provisioning/connectors/:id",
    samlMetadataDisplay: "/admin/sso/saml-metadata/:id",
    samlMetadataBrowser: "/admin/sso/saml-metadata",
    oidcConfigBrowser: "/admin/sso/oidc-config",
    oidcClientCreate: "/admin/sso/oidc-config/create",
    oidcClientEdit: "/admin/sso/oidc-config/:id",
    samlConfigDashboard: "/admin/sso/saml-config",
    ssfConfiguration: "/admin/sso/ssf-config",
    jwksManagement: "/admin/sso/jwks",
    events: "/admin/events",
    health: "/admin/health",
    exportAudit: "/admin/export-audit",
  },

  apiTokens: {
    dashboard: "/auth/api-tokens",
    createBasic: "/auth/api-tokens/create/basic",
    createRestrictions: "/auth/api-tokens/create/restrictions",
    details: "/auth/api-tokens/:tokenId",
    display: "/auth/api-tokens/:tokenId/display",
    actions: "/auth/api-tokens/:tokenId/actions",
    securityWarning: "/auth/api-tokens/security-warning",
  },

  identity: {
    permissionConsent: "/auth/sso/consent",
    oidcLoginPrompt: "/auth/sso/oidc-prompt",
    providerSelection: "/auth/sso/select-provider",
    authWait: "/auth/sso/wait",
    samlMetadataDisplay: "/auth/sso/saml-metadata",
    samlMetadataBrowser: "/auth/sso/saml-browser",
    oidcConfigBrowser: "/auth/sso/oidc-config",
    oidcClientCreate: "/auth/sso/oidc-config/create",
    oidcClientEdit: "/auth/sso/oidc-config/:id/edit",
    samlConfigDashboard: "/auth/sso/saml-config",
    ssfConfiguration: "/auth/sso/ssf-config",
    jwksManagement: "/auth/sso/jwks",
    oidcWait: "/auth/sso/oidc/wait",
    samlWait: "/auth/sso/saml/wait",
    samlSSOInitiation: "/auth/sso/login",
    oidcSSOInitiation: "/auth/sso/oidc/login",
    oidcSSORegistration: "/auth/sso/oidc/register",
  },

  session: {
    sessions: "/auth/sessions",
    view: "/auth/sessions/:id",
    revoke: "/auth/sessions/:id/revoke",
    revokeAll: "/auth/sessions/revoke-all",
    mfa: "/auth/sessions/mfa",
    trustedDevices: "/auth/sessions/trusted-devices",
    deviceManagement: "/auth/sessions/devices",
    deviceRevoke: "/auth/sessions/devices/:id/revoke",
  },

  mfa: {
    root: "/auth/mfa",
    setup: "/auth/mfa/setup",
    verify: "/auth/mfa/verify",
    backupCodes: "/auth/mfa/backup-codes",
    selectMethod: "/auth/mfa/select-method",
    authenticator: "/auth/mfa/authenticator",
    email: "/auth/mfa/email",
    sms: "/auth/mfa/sms",
    totp: "/auth/mfa/totp",
    passkey: "/auth/mfa/passkey",
    recovery: "/auth/mfa/recovery",
  },

  passkey: {
    setup: "/auth/passkey/setup",
    management: "/auth/passkey/management",
    recovery: "/auth/passkey/recovery",
    usage_stats: "/auth/passkey/usage-stats",
    creation_options: "/auth/passkey/create",
    login: "/auth/passkey/login",
    naming_config: "/auth/passkey/configure",
    platform_login: "/auth/passkey/platform-login",
    platform_register: "/auth/passkey/platform-register",
  },

  passwordless: {
    setup: "/auth/passwordless/init",
    verification: "/auth/passwordless/verify",
  },

  theme: {
    theme: "/theme",
  },

  dashboard: {
    dashboard: "/dashboard",
  },

  widgetStudio: {
    root: "/widget-studio",
    canvas: "/widget-studio/canvas",
    editor: "/widget-studio/editor/:id",
  },

  monitoring: {
    root: "/auth/monitoring",
    health: "/auth/monitoring/health",
    metrics: "/auth/monitoring/metrics",
    audit: "/auth/monitoring/audit",
  },
} as const;

export type AppPathsType = typeof AppPaths;
export default AppPaths;
