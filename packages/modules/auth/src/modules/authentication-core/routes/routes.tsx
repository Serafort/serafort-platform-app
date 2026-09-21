import React from 'react'
import { AuthRouteConfig } from '@cap/platform-core'
import Path from '../screens/path'
import { createAuthRoute, createGuestRoute, createPublicRoute } from '../../../routes/routeHelpers'

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
const EmailChangeStatus = React.lazy(() => import('../screens/email/EmailChangeStatus'))
const EmailChangeVerification = React.lazy(() => import('../screens/email/EmailChangeVerification'))
const EmailChangeSuccess = React.lazy(() => import('../screens/email/EmailChangeSuccess'))
const EmailChangeFailed = React.lazy(() => import('../screens/email/EmailChangeFailed'))

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
const CheckEmailConfirmation = React.lazy(
  () => import('../screens/signup/components/CheckEmailConfirmation'),
)
const EmailVerificationScreen = React.lazy(
  () => import('../screens/signup/components/EmailVerificationScreen'),
)
const VerificationLinkExpired = React.lazy(
  () => import('../screens/signup/components/VerificationLinkExpired'),
)
const RegistrationSuccess = React.lazy(
  () => import('../screens/signup/components/RegistrationSuccess'),
)
const EmailVerifiedSuccess = React.lazy(
  () => import('../screens/signup/components/EmailVerifiedSuccess'),
)

const Validate = React.lazy(() => import('../screens/shared/Validate'))

// ---------------------------------------------------------------------------
// Social sign-in landing
// ---------------------------------------------------------------------------
const OAuthCallback = React.lazy(() => import('../screens/social/OAuthCallback'))

// ---------------------------------------------------------------------------
// Route config
//
// Each screen is registered at exactly ONE URL. This module previously mounted
// several screens at two or three URLs each (`/forgot-password`,
// `/auth/forgot-password` and `/auth/recovery/forgot-password` all rendered
// ForgotPassword), which split analytics, gave password-reset emails a second
// address to drift to, and let /auth/sign-in be registered twice.
//
// `Path.verifyEmail` and `Path.forgotPassword` are the URLs the Authentication
// service puts in outbound mail -- see the note in @cap/shared-types/routes.
// ---------------------------------------------------------------------------
export const authCoreRouteConfig: AuthRouteConfig[] = [
  // --- Device ---
  createPublicRoute(Path.deviceCode, <DeviceCodeDisplay />),

  // --- Sign in ---
  createGuestRoute(Path.signin, <SignIn />),

  // --- Sign up & verification ---
  createGuestRoute(Path.signup, <SignUp />),
  createPublicRoute(Path.checkEmail, <CheckEmailConfirmation />),
  createPublicRoute(Path.emailVerification, <EmailVerificationScreen />),
  createPublicRoute(Path.verifyEmail, <EmailVerificationScreen />),
  createPublicRoute(Path.verificationLinkExpired, <VerificationLinkExpired />),
  createPublicRoute(Path.registrationSuccess, <RegistrationSuccess />),
  createPublicRoute(Path.emailVerifiedSuccess, <EmailVerifiedSuccess />),
  createPublicRoute(Path.validate, <Validate />),

  // --- Recovery ---
  createGuestRoute(Path.forgotPassword, <ForgotPassword />),
  createGuestRoute(Path.resetPassword, <ResetPassword />),
  createPublicRoute(Path.passwordResetSuccess, <PasswordResetSuccess />),

  // --- Email change link landings ---
  createAuthRoute(Path.emailChangeStatus, <EmailChangeStatus />, {
    requiresVerification: true,
    layout: 'noLayout',
  }),
  createPublicRoute(Path.emailChangeVerification, <EmailChangeVerification />),
  createPublicRoute(Path.emailChangeSuccess, <EmailChangeSuccess />),
  createPublicRoute(Path.emailChangeFailed, <EmailChangeFailed />),

  // --- Organisation ---
  createPublicRoute(Path.joinOrganization, <JoinOrganization />),

  // --- Social sign-in landing ---
  // Public on purpose: the visitor is not yet authenticated when they arrive,
  // and this screen is what establishes the session. A guest guard would be
  // wrong too -- the exchange logs the user in, and GuestRoute would bounce
  // them mid-flight.
  createPublicRoute(Path.callback, <OAuthCallback />),
]
