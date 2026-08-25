// ---------------------------------------------------------------------------
// Canonical path registry for the entire auth module.
// Each sub-module also keeps its own path.ts (scoped to that module's paths).
// This file is the single source of truth used by the central route aggregator
// and exported as `AuthPath` from the package root.
// ---------------------------------------------------------------------------
import authCorePath from '../modules/authentication-core/screens/path'
import authorizationPath from '../modules/authorization-engine/screens/path'
import developerConsolePath from '../modules/developer-console/screens/path'
import identityBrokerPath from '../modules/identity-broker/screens/path'
import mfaOrchestratorPath from '../modules/mfa-orchestrator/screens/path'
import passwordlessPath from '../modules/passwordless-service/screens/path'
import platformClusterPath from '../modules/platform-cluster/screens/path'
import sessionManagerPath from '../modules/session-manager/screens/path'
import userDirectoryPath from '../modules/user-directory/screens/path'

export const Path = {
  // Canonical sub-module namespace objects
  auth: authCorePath,
  authorization: authorizationPath,
  developerConsole: developerConsolePath,
  identity: identityBrokerPath,
  mfa: mfaOrchestratorPath,
  passwordless: passwordlessPath,
  platformCluster: platformClusterPath,
  session: sessionManagerPath,
  user: userDirectoryPath,

  // Compatibility / Shorthand Namespaces
  apiTokens: authorizationPath,
  account: {
    overview: sessionManagerPath.overview,
    profile: sessionManagerPath.overview,
    view: userDirectoryPath.profile.view,
    edit: userDirectoryPath.profile.edit,
    changeEmail: userDirectoryPath.settings.change_email,
    changePassword: sessionManagerPath.changePassword,
    delete: userDirectoryPath.settings.delete,
    deactivate: userDirectoryPath.settings.deactivate,
    linkedAccounts: userDirectoryPath.profile.linkedAccounts,
    activeSessions: sessionManagerPath.activeSessions,
    sessions: sessionManagerPath.activeSessions,
    emailChangeStatus: userDirectoryPath.settings.email_change_status,
    initiateEmailChange: userDirectoryPath.settings.initiate_email_change,
    activityTimeline: sessionManagerPath.activityTimeline,
    security: sessionManagerPath.overview,
    settings: userDirectoryPath.settings.change_email,
  },
  admin: {
    root: '/admin',
    dashboard: '/admin/dashboard',
    themeEditor: '/admin/theme-editor',
    themeBuilder: '/admin/theme-builder',
    overview: '/admin',
    users: userDirectoryPath.admin.users.list,
    userProfile: userDirectoryPath.admin.users.user_profile,
    banManagement: userDirectoryPath.admin.users.ban_management,
    impersonationLogs: userDirectoryPath.admin.users.impersonation_logs,
    organizations: userDirectoryPath.admin.organizations.list,
    organizationProfile: userDirectoryPath.admin.organizations.organizationProfile,
    invitations: userDirectoryPath.admin.organizations.invitations,
    roles: authorizationPath.roles,
    roleDetail: authorizationPath.roleDetail,
    permissions: '/admin/permissions',
    policies: '/admin/organizations/:id/policies',
    policyCanvas: authorizationPath.policyCanvas,
    domainVerification: authorizationPath.domainVerification,
    machineIdentities: authorizationPath.machineIdentities,
    applications: platformClusterPath.developer.application,
    appDetail: platformClusterPath.developer.application_detail_view,
    scopes: platformClusterPath.developer.scopes_registry,
    apiExplorer: '/admin/api-explorer',
    apiTokens: authorizationPath.dashboard,
    webhooks: developerConsolePath.webhooks,
    moduleManagement: platformClusterPath.developer.module_management,
    provisioning: identityBrokerPath.provisioning,
    scim: identityBrokerPath.scim,
    syncLogs: identityBrokerPath.syncLogs,
    connectorDetail: identityBrokerPath.connectorDetail,
    samlMetadataDisplay: identityBrokerPath.samlMetadataDisplay,
    samlMetadataBrowser: identityBrokerPath.samlMetadataBrowser,
    oidcConfigBrowser: identityBrokerPath.oidcConfigBrowser,
    oidcClientCreate: identityBrokerPath.oidcClientCreate,
    oidcClientEdit: identityBrokerPath.oidcClientEdit,
    samlConfigDashboard: identityBrokerPath.samlConfigDashboard,
    ssfConfiguration: identityBrokerPath.ssfConfiguration,
    jwksManagement: identityBrokerPath.jwksManagement,
    events: platformClusterPath.monitor.events,
    health: platformClusterPath.monitor.health,
    exportAudit: platformClusterPath.monitor.exportAudit,
  },
  monitoring: platformClusterPath.monitor,
  passkey: mfaOrchestratorPath.passkey,

  // Flat aliases for direct access / backwards compatibility
  profile: sessionManagerPath.overview,
  overview: sessionManagerPath.overview,
  signin: authCorePath.signin,
  signinV2: authCorePath.signupV2,
  login: authCorePath.signin,
  signup: authCorePath.signup,
  signupV2: authCorePath.signupV2,
  registration: authCorePath.registration,
  signupSuccess: authCorePath.signupSuccess,
  checkEmail: authCorePath.checkEmail,
  verifyEmail: authCorePath.verifyEmail,
  verificationLinkExpired: authCorePath.verificationLinkExpired,
  forgotPassword: authCorePath.forgotPassword,
  resetPassword: authCorePath.resetPassword,
  setNewPassword: authCorePath.setNewPassword,
  passwordResetSuccess: authCorePath.passwordResetSuccess,
  registrationSuccess: authCorePath.registrationSuccess,
  emailVerification: authCorePath.emailVerification,
  emailVerifiedSuccess: authCorePath.emailVerifiedSuccess,
  requestEmailChange: authCorePath.initiateEmailChange,
  initiateEmailChange: authCorePath.initiateEmailChange,
  emailChangeVerificationPending: authCorePath.emailChangeVerificationPending,
  emailChangeVerification: authCorePath.emailChangeVerification,
  emailChangeSuccess: authCorePath.emailChangeSuccess,
  emailChangeFailed: authCorePath.emailChangeFailed,
  emailChangeStatus: authCorePath.emailChangeStatus,
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
  developerConsolePath as DeveloperConsolePath,
  identityBrokerPath as IdentityBrokerPath,
  mfaOrchestratorPath as MfaOrchestratorPath,
  passwordlessPath as PasswordlessPath,
  platformClusterPath as PlatformClusterPath,
  sessionManagerPath as SessionManagerPath,
  userDirectoryPath as UserDirectoryPath,
}

export default Path
