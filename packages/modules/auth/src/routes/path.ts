// ---------------------------------------------------------------------------
// Canonical path registry for the entire auth module.
// Each sub-module also keeps its own path.ts (scoped to that module's paths).
// This file is the single source of truth used by the central route aggregator
// and exported as `AuthPath` from the package root.
// ---------------------------------------------------------------------------
import authCorePath from '../modules/authentication-core/screens/path'
import authorizationPath from '../modules/authorization-engine/screens/path'
import accessControlPath from '../modules/access-control/screens/path'
import developerConsolePath from '../modules/developer-console/screens/path'
import identityBrokerPath from '../modules/identity-broker/screens/path'
import mfaOrchestratorPath from '../modules/mfa-orchestrator/screens/path'
import passwordlessPath from '../modules/passwordless-service/screens/path'
import platformClusterPath from '../modules/platform-cluster/screens/path'
import sessionManagerPath from '../modules/session-manager/screens/path'
import userDirectoryPath from '../modules/user-directory/screens/path'

export const Path = {
  // 1. Canonical sub-module namespace objects
  auth: authCorePath,
  authorization: authorizationPath,
  accessControl: accessControlPath,
  developerConsole: developerConsolePath,
  identity: identityBrokerPath,
  mfa: mfaOrchestratorPath,
  passkey: mfaOrchestratorPath.passkey,
  passwordless: passwordlessPath,
  platformCluster: platformClusterPath,
  developer: platformClusterPath.developer,
  monitoring: platformClusterPath.monitor,
  system: platformClusterPath.system,
  session: sessionManagerPath,
  user: userDirectoryPath,
  apiTokens: authorizationPath,
  sso: {
    authWait: identityBrokerPath.authWait,
    jwksManagement: identityBrokerPath.jwksManagement,
    oidcClientCreate: identityBrokerPath.oidcClientCreate,
    oidcClientEdit: identityBrokerPath.oidcClientEdit,
    oidcConfigBrowser: identityBrokerPath.oidcConfigBrowser,
    oidcLoginPrompt: identityBrokerPath.oidcLoginPrompt,
    oidcWait: identityBrokerPath.oidcWait,
    permissionConsent: identityBrokerPath.permissionConsent,
    samlConfigDashboard: identityBrokerPath.samlConfigDashboard,
    samlMetadataBrowser: identityBrokerPath.samlMetadataBrowser,
    samlMetadataDisplay: identityBrokerPath.samlMetadataDisplay,
    samlWait: identityBrokerPath.samlWait,
    samlSSOInitiation: identityBrokerPath.samlSSOInitiation,
    providerSelection: identityBrokerPath.providerSelection,
    ssfConfiguration: identityBrokerPath.ssfConfiguration,
  },

  // 2. Account & Settings Namespaces (Session & User Directory)
  account: {
    overview: sessionManagerPath.overview,
    profile: sessionManagerPath.overview,
    view: userDirectoryPath.profile.view,
    changeEmail: userDirectoryPath.settings.change_email,
    changePassword: sessionManagerPath.changePassword,
    delete: userDirectoryPath.settings.delete,
    deactivate: userDirectoryPath.settings.deactivate,
    dataExport: userDirectoryPath.settings.data_export,
    linkedAccounts: userDirectoryPath.profile.linkedAccounts,
    activeSessions: sessionManagerPath.activeSessions,
    sessions: sessionManagerPath.activeSessions,
    emailChangeStatus: userDirectoryPath.settings.email_change_status,
    initiateEmailChange: userDirectoryPath.settings.initiate_email_change,
    activityTimeline: sessionManagerPath.activityTimeline,
    security: sessionManagerPath.overview,
    settings: userDirectoryPath.settings.change_email,
  },

  // 3. Admin Namespace (Organization, Users, Roles, Cluster & SSO)
  admin: {
    root: '/admin',
    dashboard: '/admin/dashboard',
    themeEditor: '/admin/theme-editor',
    themeBuilder: '/admin/theme-builder',
    overview: '/admin',

    // User Directory Admin
    users: userDirectoryPath.admin.users.list,
    userProfile: userDirectoryPath.admin.users.user_profile,
    userCreate: userDirectoryPath.admin.users.user_create,
    userDataExport: userDirectoryPath.admin.users.data_export,
    banManagement: userDirectoryPath.admin.users.ban_management,
    impersonationLogs: userDirectoryPath.admin.users.impersonation_logs,
    issuesBanDialog: userDirectoryPath.admin.users.issues_ban_dialog,
    resetPasswordDialog: userDirectoryPath.admin.users.reset_password_dialog,

    // Organizations Admin
    organizations: userDirectoryPath.admin.organizations.list,
    organizationProfile: userDirectoryPath.admin.organizations.organizationProfile,
    invitations: userDirectoryPath.admin.organizations.invitations,
    orgDomainVerification: userDirectoryPath.admin.organizations.domain_verification,

    // Authorization & Policies
    roles: authorizationPath.roles,
    roleDetail: authorizationPath.roleDetail,
    permissions: '/admin/permissions',
    policies: '/admin/organizations/:id/policies',
    policyCanvas: authorizationPath.policyCanvas,
    domainVerification: authorizationPath.domainVerification,
    machineIdentities: authorizationPath.machineIdentities,
    apiTokens: authorizationPath.dashboard,

    // Developer & Applications
    developerDashboard: platformClusterPath.developer.dashboard,
    applications: platformClusterPath.developer.application,
    appDetail: platformClusterPath.developer.application_detail_view,
    scopes: platformClusterPath.developer.scopes_registry,
    moduleManagement: platformClusterPath.developer.module_management,
    developerWebhooks: platformClusterPath.developer.webhooks,
    developerConsole: developerConsolePath.developerConsole,
    webhooks: developerConsolePath.webhooks,
    apiExplorer: '/admin/api-explorer',

    // Provisioning & SCIM
    provisioning: identityBrokerPath.provisioning,
    scim: identityBrokerPath.scim,
    syncLogs: identityBrokerPath.syncLogs,
    connectorDetail: identityBrokerPath.connectorDetail,

    // SSO & SAML/OIDC Admin
    samlMetadataDisplay: identityBrokerPath.samlMetadataDisplay,
    samlMetadataBrowser: identityBrokerPath.samlMetadataBrowser,
    oidcConfigBrowser: identityBrokerPath.oidcConfigBrowser,
    oidcClientCreate: identityBrokerPath.oidcClientCreate,
    oidcClientEdit: identityBrokerPath.oidcClientEdit,
    samlConfigDashboard: identityBrokerPath.samlConfigDashboard,
    ssfConfiguration: identityBrokerPath.ssfConfiguration,
    jwksManagement: identityBrokerPath.jwksManagement,

    // Monitoring & Cluster Health
    monitoringDashboard: platformClusterPath.monitor.dashboard,
    events: platformClusterPath.monitor.events,
    emailTemplatePreview: platformClusterPath.monitor.emailTemplatePreview,
    emailTesting: platformClusterPath.monitor.emailTesting,
    exportAudit: platformClusterPath.monitor.exportAudit,
    mfaAnalytics: platformClusterPath.monitor.mfa_analytics,
    realTimeEvents: platformClusterPath.monitor.real_time,
    realTimeEventsV2: platformClusterPath.monitor.real_time_v2,
    health: platformClusterPath.monitor.health,
    securityHealth: platformClusterPath.monitor.security_health,
  },

  // 4. Flat aliases for direct access / backwards compatibility
  profile: sessionManagerPath.overview,
  overview: sessionManagerPath.overview,
  signin: authCorePath.signin,
  signinV2: authCorePath.signin,
  login: authCorePath.signin,
  signup: authCorePath.signup,
  signupV2: authCorePath.signupV2,
  registration: authCorePath.registration,
  signupSuccess: authCorePath.signupSuccess,
  checkEmail: authCorePath.checkEmail,
  verifyEmail: authCorePath.verifyEmail,
  verifyEmailAlias: authCorePath.verifyEmailAlias,
  verifyEmailDirect: authCorePath.verifyEmailDirect,
  verificationLinkExpired: authCorePath.verificationLinkExpired,
  forgotPassword: authCorePath.forgotPassword,
  forgotPasswordAlias: authCorePath.forgotPasswordAlias,
  forgotPasswordDirect: authCorePath.forgotPasswordDirect,
  resetPassword: authCorePath.resetPassword,
  resetPasswordRecovery: authCorePath.resetPasswordRecovery,
  resetPasswordDirect: authCorePath.resetPasswordDirect,
  setNewPassword: authCorePath.setNewPassword,
  passwordResetSuccess: authCorePath.passwordResetSuccess,
  passwordResetSuccessAlias: authCorePath.passwordResetSuccessAlias,
  registrationSuccess: authCorePath.registrationSuccess,
  emailVerification: authCorePath.emailVerification,
  emailVerifiedSuccess: authCorePath.emailVerifiedSuccess,
  resendEmailVerification: authCorePath.resendEmailVerification,
  VerificationEmail: authCorePath.VerificationEmail,
  requestEmailChange: authCorePath.initiateEmailChange,
  initiateEmailChange: authCorePath.initiateEmailChange,
  emailChangeVerificationPending: authCorePath.emailChangeVerificationPending,
  emailChangeVerification: authCorePath.emailChangeVerification,
  emailChangeSuccess: authCorePath.emailChangeSuccess,
  emailChangeFailed: authCorePath.emailChangeFailed,
  emailChangeStatus: authCorePath.emailChangeStatus,
  validate: authCorePath.validate,
  validateDirect: authCorePath.validateDirect,
  mfaVerification: mfaOrchestratorPath.mfa.verification,
  exportVerification: authCorePath.exportVerification,
  deviceCode: authCorePath.deviceCode,
  joinOrganization: authCorePath.joinOrganization,
  setup: mfaOrchestratorPath.mfa.setup,
  security: sessionManagerPath.overview,
  samlWait: identityBrokerPath.samlWait,
  oidcWait: identityBrokerPath.oidcWait,
  providerSelection: identityBrokerPath.providerSelection,
  permissionConsent: identityBrokerPath.permissionConsent,
  oidcLoginPrompt: identityBrokerPath.oidcLoginPrompt,
}

// Flat aliases for direct access
export const FlatPath = {
  ...Path,
  profile: Path.account.overview,
  signin: Path.auth.signin,
  signup: Path.auth.signup,
  forgotPassword: Path.auth.forgotPassword,
  resetPassword: Path.auth.resetPassword,
  checkEmail: Path.auth.checkEmail,
  verifyEmail: Path.auth.verifyEmail,
  verificationLinkExpired: Path.auth.verificationLinkExpired,
  registration: Path.auth.registration,
}

export {
  authCorePath as AuthCorePath,
  authorizationPath as AuthorizationEnginePath,
  accessControlPath as AccessControlPath,
  developerConsolePath as DeveloperConsolePath,
  identityBrokerPath as IdentityBrokerPath,
  mfaOrchestratorPath as MfaOrchestratorPath,
  passwordlessPath as PasswordlessPath,
  platformClusterPath as PlatformClusterPath,
  sessionManagerPath as SessionManagerPath,
  userDirectoryPath as UserDirectoryPath,
}

export default Path
