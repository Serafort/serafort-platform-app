// ---------------------------------------------------------------------------
// Aggregated path registry for the auth module.
//
// This file contains NO URL literals. Every value below is projected from the
// Tier 0 registry (`AppPaths` in @cap/shared-types), which is the single place
// a path is written. Editing a path there changes it here, in every sub-module
// `path.ts`, in the router, and in every link -- which is the whole point.
//
// What this file adds on top of `AppPaths` is *shape*: the groupings the auth
// screens have always consumed (`Path.account.*`, `Path.admin.*`, the flat
// aliases). Adding a NEW path belongs in `AppPaths`; adding a new *grouping* of
// existing paths belongs here.
// ---------------------------------------------------------------------------
import { AppPaths } from '@cap/shared-types'

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
  // 1. Sub-module namespaces
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
  sso: AppPaths.sso,

  // 2. Cross-cutting views
  account: AppPaths.account,
  admin: AppPaths.admin,

  // 3. Flat aliases for the screens that navigate by bare name
  signin: authCorePath.signin,
  signup: authCorePath.signup,
  checkEmail: authCorePath.checkEmail,
  verifyEmail: authCorePath.verifyEmail,
  emailVerification: authCorePath.emailVerification,
  emailVerifiedSuccess: authCorePath.emailVerifiedSuccess,
  verificationLinkExpired: authCorePath.verificationLinkExpired,
  registrationSuccess: authCorePath.registrationSuccess,
  forgotPassword: authCorePath.forgotPassword,
  resetPassword: authCorePath.resetPassword,
  passwordResetSuccess: authCorePath.passwordResetSuccess,
  emailChangeStatus: authCorePath.emailChangeStatus,
  emailChangeVerification: authCorePath.emailChangeVerification,
  emailChangeSuccess: authCorePath.emailChangeSuccess,
  emailChangeFailed: authCorePath.emailChangeFailed,
  initiateEmailChange: userDirectoryPath.settings.initiate_email_change,
  requestEmailChange: userDirectoryPath.settings.initiate_email_change,
  validate: authCorePath.validate,
  deviceCode: authCorePath.deviceCode,
  joinOrganization: authCorePath.joinOrganization,
  profile: sessionManagerPath.overview,
  overview: sessionManagerPath.overview,
  security: sessionManagerPath.overview,
  setup: mfaOrchestratorPath.mfa.setup,
  mfaVerification: mfaOrchestratorPath.mfa.verification,
  samlWait: identityBrokerPath.samlWait,
  oidcWait: identityBrokerPath.oidcWait,
  providerSelection: identityBrokerPath.providerSelection,
  permissionConsent: identityBrokerPath.permissionConsent,
  oidcLoginPrompt: identityBrokerPath.oidcLoginPrompt,
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
