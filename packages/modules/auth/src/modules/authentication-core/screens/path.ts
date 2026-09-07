import { AppPaths } from '@cap/shared-types'

const Path = {
  //device paths
  deviceCode: '/auth/device/code',

  // email change paths
  initiateEmailChange: '/auth/email/initiate-change',
  emailChangeStatus: '/auth/email/change-status',
  emailChangeVerificationPending: '/auth/email/change-verification-pending',
  emailChangeVerification: '/auth/email/verify-change/:token',
  emailChangeSuccess: '/auth/email/change-success',
  emailChangeFailed: '/auth/email/change-failed',
  exportVerification: '/auth/export/verification',
  resendEmailVerification: '/auth/email/resend-verification',
  VerificationEmail: '/auth/email/verification',

  //organization paths
  joinOrganization: '/auth/join-organization',

  // recovery paths
  forgotPassword: '/auth/recovery/forgot-password',
  forgotPasswordAlias: '/auth/forgot-password',
  forgotPasswordDirect: '/forgot-password',
  resetPassword: '/auth/reset-password/:email',
  resetPasswordRecovery: '/auth/recovery/reset-password/:email',
  resetPasswordDirect: '/reset-password/:email',
  setNewPassword: '/auth/recovery/set-new-password/:email',
  passwordResetSuccess: '/auth/recovery/password-reset-success',
  passwordResetSuccessAlias: '/auth/password-reset-success',

  // sign in
  // Public guest-entry routes: sourced from the Tier 0 registry (`@cap/shared-types`)
  // so the layout engine can link to them without importing this module.
  signin: AppPaths.auth.signin,
  login: AppPaths.auth.login,

  // sign up
  signup: AppPaths.auth.signup,
  signupV2: AppPaths.auth.signupV2,
  registration: '/auth/register',
  checkEmail: '/auth/verify-email-confirmation',
  emailVerification: '/auth/verification/email-sent',
  verifyEmail: '/auth/verify-email/:email',
  verifyEmailAlias: '/auth/verify/:email',
  verifyEmailDirect: '/verify/:email',
  verificationLinkExpired: '/auth/verification-link-expired',
  registrationSuccess: '/auth/registration-success',
  signupSuccess: '/auth/sign-up/success',
  emailVerifiedSuccess: '/auth/verify-email/success',
  validate: '/auth/validate/:id?/:token?',
  validateDirect: '/validate',

  requestEmailChange: '/auth/email/initiate-change',
}
export default Path
