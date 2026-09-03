import React from 'react'
import { AuthRouteConfig } from '@cap/platform-core'
import GuestRoute from '../middlewares/GuestRoute'
import Path from '../screens/path'
import { createAuthRoute } from '../../../routes/routeHelpers'

// ---------------------------------------------------------------------------
// Sign In
// ---------------------------------------------------------------------------
const SignInV2         = React.lazy(() => import('../screens/signin/SignInV2'))
const LoginScreen      = React.lazy(() => import('../screens/signin/LoginScreen'))
const AdminLoginScreen = React.lazy(() => import('../screens/signin/AdminLoginScreen'))

// ---------------------------------------------------------------------------
// Sign Up
// ---------------------------------------------------------------------------
const SignUp                  = React.lazy(() => import('../screens/signup/SignUp'))
const SignUpV2                = React.lazy(() => import('../screens/signup/SignUpV2'))
const RegistrationScreen      = React.lazy(() => import('../screens/signup/RegistrationScreen'))
const CheckEmailConfirmation  = React.lazy(() => import('../screens/signup/CheckEmailConfirmation'))
const EmailVerificationScreen = React.lazy(() => import('../screens/signup/EmailVerificationScreen'))
const VerificationLinkExpired = React.lazy(() => import('../screens/signup/VerificationLinkExpired'))
const RegistrationSuccess     = React.lazy(() => import('../screens/signup/RegistrationSuccess'))
const EmailVerifiedSuccess    = React.lazy(() => import('../screens/signup/EmailVerifiedSuccess'))

// ---------------------------------------------------------------------------
// Recovery
// ---------------------------------------------------------------------------
const ForgotPassword      = React.lazy(() => import('../screens/recovery/ForgotPassword'))
const ResetPassword       = React.lazy(() => import('../screens/recovery/ResetPassword'))
const SetNewPasswordScreen = React.lazy(() => import('../screens/recovery/SetNewPasswordScreen'))
const PasswordResetSuccess = React.lazy(() => import('../screens/recovery/PasswordResetSuccess'))

// ---------------------------------------------------------------------------
// Email flows
// ---------------------------------------------------------------------------
const InitiateEmailChange            = React.lazy(() => import('../screens/email/InitiateEmailChange'))
const EmailChangeStatus              = React.lazy(() => import('../screens/email/EmailChangeStatus'))
const EmailChangeVerificationPending = React.lazy(() => import('../screens/email/EmailChangeVerificationPending'))
const EmailChangeVerification        = React.lazy(() => import('../screens/email/EmailChangeVerification'))
const EmailChangeSuccess             = React.lazy(() => import('../screens/email/EmailChangeSuccess'))
const EmailChangeFailed              = React.lazy(() => import('../screens/email/EmailChangeFailed'))
const ExportVerification             = React.lazy(() => import('../screens/email/ExportVerification'))

// ---------------------------------------------------------------------------
// Device & Organisation
// ---------------------------------------------------------------------------
const DeviceCodeDisplay = React.lazy(() => import('../screens/device/DeviceCodeDisplay'))
const JoinOrganization  = React.lazy(() => import('../screens/organization/JoinOrganization'))

// ---------------------------------------------------------------------------
// Route config
// ---------------------------------------------------------------------------
export const authCoreRouteConfig: AuthRouteConfig[] = [
  // --- Sign In ---
  { path: Path.signin,     element: <SignInV2 />,                             layout: 'noLayout' },
  { path: Path.signinV2,   element: <GuestRoute element={<SignInV2 />} />,    layout: 'noLayout' },
  { path: Path.login,      element: <GuestRoute element={<LoginScreen />} />, layout: 'noLayout' },
  { path: Path.adminLogin, element: <AdminLoginScreen />,                     layout: 'noLayout' },

  // --- Sign Up ---
  { path: Path.signup,       element: <GuestRoute element={<SignUp />} />,              layout: 'noLayout' },
  { path: Path.signupV2,     element: <GuestRoute element={<SignUpV2 />} />,            layout: 'noLayout' },
  { path: Path.registration, element: <GuestRoute element={<RegistrationScreen />} />, layout: 'noLayout' },
  { path: Path.checkEmail,              element: <CheckEmailConfirmation />,  layout: 'noLayout' },
  { path: Path.emailVerification,       element: <EmailVerificationScreen />, layout: 'noLayout' },
  { path: Path.verifyEmail,             element: <EmailVerificationScreen />, layout: 'noLayout' },
  { path: Path.verificationLinkExpired, element: <VerificationLinkExpired />, layout: 'noLayout' },
  { path: Path.registrationSuccess,     element: <RegistrationSuccess />,     layout: 'noLayout' },
  { path: Path.emailVerifiedSuccess,    element: <EmailVerifiedSuccess /> },

  // --- Recovery ---
  { path: Path.forgotPassword,       element: <GuestRoute element={<ForgotPassword />} />, layout: 'noLayout' },
  { path: Path.resetPassword,        element: <GuestRoute element={<ResetPassword />} /> },
  { path: Path.setNewPassword,       element: <SetNewPasswordScreen />,                    layout: 'noLayout' },
  { path: Path.passwordResetSuccess, element: <PasswordResetSuccess /> },

  // --- Email flows (auth-guarded) ---
  createAuthRoute(Path.emailChangeVerificationPending, <EmailChangeVerificationPending />, {
    layout: 'noLayout',
  }),
  createAuthRoute(Path.exportVerification, <ExportVerification />, { layout: 'noLayout' }),
  createAuthRoute(Path.initiateEmailChange, <InitiateEmailChange />, {
    requiresVerification: true,
    layout: 'noLayout',
  }),
  createAuthRoute(Path.emailChangeStatus, <EmailChangeStatus />, { requiresVerification: true }),
  { path: Path.emailChangeVerification, element: <EmailChangeVerification /> },
  { path: Path.emailChangeSuccess,      element: <EmailChangeSuccess /> },
  { path: Path.emailChangeFailed,       element: <EmailChangeFailed /> },

  // --- Device & Organisation ---
  { path: Path.deviceCode,       element: <DeviceCodeDisplay />, layout: 'noLayout' },
  { path: Path.joinOrganization, element: <JoinOrganization />,  layout: 'noLayout' },
]
