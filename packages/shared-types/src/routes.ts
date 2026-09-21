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
    signupSuccess: "/auth/sign-up/success",
    registrationSuccess: "/auth/registration-success",
    forgotPassword: "/auth/recovery/forgot-password",
    resetPassword: "/auth/reset-password/:email",
    setNewPassword: "/auth/recovery/set-new-password/:email",
    passwordResetSuccess: "/auth/recovery/password-reset-success",
    checkEmail: "/auth/verify-email-confirmation",
    verifyEmail: "/auth/verify-email/:email",
    verificationLinkExpired: "/auth/verification-link-expired",
    emailVerification: "/auth/verification/email-sent",
    emailVerifiedSuccess: "/auth/verify-email/success",
    initiateEmailChange: "/auth/email/initiate-change",
    emailChangeVerificationPending: "/auth/email/change-verification-pending",
    emailChangeVerification: "/auth/email/verify-change/:token",
    emailChangeSuccess: "/auth/email/change-success",
    emailChangeFailed: "/auth/email/change-failed",
    emailChangeStatus: "/auth/email/change-status",
    exportVerification: "/auth/export/verification",
    deviceCode: "/auth/device/code",
    joinOrganization: "/auth/join-organization",
    unauthorized401: "/auth/unauthorized",
    maintenance: "/auth/maintenance",
    tooManyRequests429: "/auth/too-many-requests",
    csrfError: "/auth/csrf-error",
    browserNotSupported: "/auth/browser-not-supported",
    forbidden403: "/auth/forbidden",
  },

  account: {
    overview: "/auth/account",
    profile: "/auth/account",
    security: "/auth/account",
    preferences: "/account/preferences",
    sessions: "/auth/account/active-sessions",
    activeSessions: "/auth/account/active-sessions",
    activityTimeline: "/auth/account/activity-timeline",
    changePassword: "/auth/account/password/change",
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
    userProfile: "/admin/user/:id",
    banManagement: "/admin/user/:id/ban",
    impersonationLogs: "/admin/user/:id/impersonation-logs",
    organizations: "/organizations",
    organizationProfile: "/organizations/:id",
    invitations: "/organizations/:id/invitations",
    roles: "/admin/roles",
    roleDetail: "/admin/roles/:id",
    permissions: "/admin/permissions",
    policies: "/admin/organizations/:id/policies",
    policyCanvas: "/admin/policies/canvas",
    domainVerification: "/admin/domain-verification",
    machineIdentities: "/admin/machine-identities",
    applications: "/admin/developer/application",
    appDetail: "/admin/developer/application-detail-view",
    scopes: "/admin/developer/scopes-registry",
    apiExplorer: "/admin/api-explorer",
    apiTokens: "/auth/api-tokens",
    webhooks: "/developer-console/webhooks",
    moduleManagement: "/admin/developer/module-management",
    provisioning: "/admin/provisioning",
    scim: "/admin/provisioning/scim",
    syncLogs: "/admin/provisioning/logs",
    connectorDetail: "/admin/provisioning/connectors/:id",
    samlMetadataDisplay: "/auth/sso/saml-metadata",
    samlMetadataBrowser: "/auth/sso/saml-browser",
    oidcConfigBrowser: "/auth/sso/oidc-config",
    oidcClientCreate: "/auth/sso/oidc-config/create",
    oidcClientEdit: "/auth/sso/oidc-config/:id/edit",
    samlConfigDashboard: "/auth/sso/saml-config",
    ssfConfiguration: "/auth/sso/ssf-config",
    jwksManagement: "/auth/sso/jwks",
    events: "/admin/monitoring/events",
    health: "/admin/monitoring/health",
    exportAudit: "/admin/monitoring/export-audit",
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
    health: "/admin/monitoring/health",
    metrics: "/auth/monitoring/metrics",
    audit: "/auth/monitoring/audit",
  },
} as const;

export type AppPathsType = typeof AppPaths;
export default AppPaths;
