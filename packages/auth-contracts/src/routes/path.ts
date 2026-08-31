import { AppPaths } from '@cap/shared-types'

export const AuthPath = {
  account: AppPaths.account,
  user: AppPaths.user,
  apiTokens: AppPaths.apiTokens,
  identity: AppPaths.identity,
  session: AppPaths.session,
  mfa: AppPaths.mfa,
  passkey: AppPaths.passkey,
  passwordless: AppPaths.passwordless,
  auth: AppPaths.auth,
  password: {
    forgot: AppPaths.auth.forgotPassword,
    reset: AppPaths.auth.resetPassword,
    update: AppPaths.auth.setNewPassword,
    expired: AppPaths.auth.verificationLinkExpired,
  },
  login: {
    root: AppPaths.auth.login,
    callback: '/auth/login/callback',
    sso: '/auth/login/sso',
    magic: '/auth/login/magic',
  },
  register: {
    root: AppPaths.auth.signup,
    verify: AppPaths.auth.verifyEmail,
    complete: AppPaths.auth.registrationSuccess,
  },
  verification: {
    email: AppPaths.auth.verifyEmail,
    phone: '/auth/verification/phone',
  },
  admin: AppPaths.admin,
  monitoring: AppPaths.monitoring,
}

export const FlatPath = {
  ...AuthPath.user,
  ...AuthPath.apiTokens,
  ...AuthPath.identity,
  ...AuthPath.session,
  ...AuthPath.mfa,
  ...AuthPath.password,
  ...AuthPath.login,
  ...AuthPath.register,
  ...AuthPath.verification,
  ...AuthPath.admin,
  ...AuthPath.monitoring,
}

export default AuthPath
