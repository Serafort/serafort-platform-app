import React from 'react'
import { Navigate } from 'react-router-dom'
import { AuthRouteConfig } from '@cap/platform-core'
import GuestRoute from '../middlewares/GuestRoute'
import Path from '../screens/path'
import { createAuthRoute } from '../../../routes/routeHelpers'
import { AppPaths } from '@cap/shared-types'
// ---------------------------------------------------------------------------
// Device
// ---------------------------------------------------------------------------
const DeviceCodeDisplay = React.lazy(() => import('../screens/device/DeviceCodeDisplay'))

// ---------------------------------------------------------------------------
// Organisation
// ---------------------------------------------------------------------------
const JoinOrganization = React.lazy(() => import('../screens/organization/JoinOrganization'))

// ---------------------------------------------------------------------------
// Email flows
// ---------------------------------------------------------------------------
const InitiateEmailChange = React.lazy(() => import('../screens/email/InitiateEmailChange'))
const EmailChangeStatus = React.lazy(() => import('../screens/email/EmailChangeStatus'))
const EmailChangeVerificationPending = React.lazy(() => import('../screens/email/EmailChangeVerificationPending'))
const EmailChangeVerification = React.lazy(() => import('../screens/email/EmailChangeVerification'))
const EmailChangeSuccess = React.lazy(() => import('../screens/email/EmailChangeSuccess'))
const EmailChangeFailed = React.lazy(() => import('../screens/email/EmailChangeFailed'))
const ExportVerification = React.lazy(() => import('../screens/email/ExportVerification'))

// ---------------------------------------------------------------------------
// Recovery
// ---------------------------------------------------------------------------
const ForgotPassword = React.lazy(() => import('../screens/recovery/ForgotPassword'))
const ResetPassword = React.lazy(() => import('../screens/recovery/ResetPassword'))
const PasswordResetSuccess = React.lazy(() => import('../screens/recovery/PasswordResetSuccess'))

// ---------------------------------------------------------------------------
// Sign In
// ---------------------------------------------------------------------------
const SignIn = React.lazy(() => import('../screens/signin/SignIn'))

// ---------------------------------------------------------------------------
// Sign Up
// ---------------------------------------------------------------------------
const SignUp = React.lazy(() => import('../screens/signup/screens/SignUp'))
const CheckEmailConfirmation = React.lazy(() => import('../screens/signup/components/CheckEmailConfirmation'))
const EmailVerificationScreen = React.lazy(() => import('../screens/signup/components/EmailVerificationScreen'))
const VerificationLinkExpired = React.lazy(() => import('../screens/signup/components/VerificationLinkExpired'))
const RegistrationSuccess = React.lazy(() => import('../screens/signup/components/RegistrationSuccess'))
const EmailVerifiedSuccess = React.lazy(() => import('../screens/signup/components/EmailVerifiedSuccess'))




const Validate = React.lazy(() => import('../screens/shared/Validate'))

// ---------------------------------------------------------------------------
// Route config
// ---------------------------------------------------------------------------
export const authCoreRouteConfig: AuthRouteConfig[] = [
  // --- Device ---
  { path: Path.deviceCode, element: <DeviceCodeDisplay />, layout: 'noLayout' },

  // --- Email flows (auth-guarded) ---
  // createAuthRoute(Path.initiateEmailChange, <InitiateEmailChange />, {
  //   requiresVerification: true,
  //   layout: 'noLayout',
  // }),
  createAuthRoute(Path.emailChangeStatus, <EmailChangeStatus />, { requiresVerification: true }),
  createAuthRoute(Path.emailChangeVerificationPending, <EmailChangeVerificationPending />, {
    layout: 'noLayout',
  }),
  { path: Path.emailChangeSuccess, element: <EmailChangeSuccess /> },
  { path: Path.emailChangeFailed, element: <EmailChangeFailed /> },
  { path: Path.emailChangeVerification, element: <EmailChangeVerification /> },
  createAuthRoute(Path.exportVerification, <ExportVerification />, { layout: 'noLayout' }),
  { path: Path.resendEmailVerification, element: <CheckEmailConfirmation />, layout: 'noLayout' },
  { path: Path.VerificationEmail, element: <EmailVerificationScreen />, layout: 'noLayout' },

  // --- Organisation ---
  { path: Path.joinOrganization, element: <JoinOrganization />, layout: 'noLayout' },

  // --- Recovery ---
  { path: Path.forgotPassword, element: <GuestRoute element={<ForgotPassword />} />, layout: 'noLayout' },
  { path: Path.forgotPasswordAlias, element: <GuestRoute element={<ForgotPassword />} />, layout: 'noLayout' },
  { path: Path.forgotPasswordDirect, element: <GuestRoute element={<ForgotPassword />} />, layout: 'noLayout' },
  { path: Path.resetPassword, element: <GuestRoute element={<ResetPassword />} />, layout: 'noLayout' },
  { path: Path.resetPasswordRecovery, element: <GuestRoute element={<ResetPassword />} />, layout: 'noLayout' },
  { path: Path.resetPasswordDirect, element: <GuestRoute element={<ResetPassword />} />, layout: 'noLayout' },
  { path: Path.setNewPassword, element: <GuestRoute element={<ResetPassword />} />, layout: 'noLayout' },
  { path: Path.passwordResetSuccess, element: <PasswordResetSuccess />, layout: 'noLayout' },
  { path: Path.passwordResetSuccessAlias, element: <PasswordResetSuccess />, layout: 'noLayout' },

  // --- Sign In ---
  { path: Path.signin, element: <GuestRoute element={<SignIn />} />, layout: 'noLayout' },
  { path: Path.login, element: <GuestRoute element={<SignIn />} />, layout: 'noLayout' },

  // --- Sign Up & Verification ---
  { path: Path.signup, element: <GuestRoute element={<SignUp />} />, layout: 'noLayout' },
  { path: Path.signupV2, element: <Navigate to={Path.signup} replace />, layout: 'noLayout' },
  // Legacy /auth/register — redirect to the primary sign-up flow.
  { path: Path.registration, element: <Navigate to={Path.signup} replace />, layout: 'noLayout' },
  { path: Path.checkEmail, element: <CheckEmailConfirmation />, layout: 'noLayout' },
  { path: Path.emailVerification, element: <EmailVerificationScreen />, layout: 'noLayout' },
  { path: Path.verifyEmail, element: <EmailVerificationScreen />, layout: 'noLayout' },
  { path: Path.verifyEmailAlias, element: <EmailVerificationScreen />, layout: 'noLayout' },
  { path: Path.verifyEmailDirect, element: <EmailVerificationScreen />, layout: 'noLayout' },
  { path: Path.verificationLinkExpired, element: <VerificationLinkExpired />, layout: 'noLayout' },
  { path: Path.registrationSuccess, element: <RegistrationSuccess />, layout: 'noLayout' },
  { path: Path.emailVerifiedSuccess, element: <EmailVerifiedSuccess /> },
  { path: Path.validate, element: <Validate />, layout: 'noLayout' },
  { path: Path.validateDirect, element: <Validate />, layout: 'noLayout' },
]

