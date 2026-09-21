import React from 'react'
import { AuthRouteConfig } from '@cap/platform-core'
import Path from '../screens/path'
import {
  createAdminRoute,
  createAuthRoute,
  createGuestRoute,
  createPublicRoute,
} from '../../../routes/routeHelpers'

// ---------------------------------------------------------------------------
// MFA
// ---------------------------------------------------------------------------
const MFASetupScreen = React.lazy(() => import('../screens/mfa/MFASetupScreen'))
const MFASmsSetupScreen = React.lazy(() => import('../screens/mfa/MFASmsSetupScreen'))
const MFAVerificationScreen = React.lazy(() => import('../screens/mfa/MFAVerificationScreen'))
const MFAManagement = React.lazy(() => import('../screens/mfa/MFAManagement'))

// ---------------------------------------------------------------------------
// Passkeys – internal screens
// ---------------------------------------------------------------------------
const PasskeyLoginOption = React.lazy(() => import('../screens/passkey/PasskeyLoginOption'))
const PasskeyManagement = React.lazy(() => import('../screens/passkey/PasskeyManagement'))
const PasskeyRecoveryOptions = React.lazy(() => import('../screens/passkey/PasskeyRecoveryOptions'))
const PasskeyRegistrationPrompt = React.lazy(
  () => import('../screens/passkey/PasskeyRegistrationPrompt'),
)
const PasskeySetup = React.lazy(() => import('../screens/passkey/PasskeySetup'))
const PasskeyUsageStats = React.lazy(() => import('../screens/passkey/PasskeyUsageStats'))

// ---------------------------------------------------------------------------
// Platform Auth
// ---------------------------------------------------------------------------
const PlatformAuthLogin = React.lazy(() => import('../screens/platform/PlatformAuthLogin'))
const PlatformAuthRegister = React.lazy(() => import('../screens/platform/PlatformAuthRegister'))

export const mfaOrchestratorRouteConfig: AuthRouteConfig[] = [
  // --- MFA flows ---
  createAuthRoute(Path.mfa.setup, <MFASetupScreen />, { layout: 'noLayout' }),
  createAuthRoute(Path.mfa.setup_sms, <MFASmsSetupScreen />, { layout: 'noLayout' }),
  createPublicRoute(Path.mfa.verification, <MFAVerificationScreen />),
  createAuthRoute(Path.mfa.management, <MFAManagement />, {
    requiresVerification: true,
    layout: 'admin',
  }),

  // --- Passkey flows ---
  createGuestRoute(Path.passkey.login, <PasskeyLoginOption />),
  createAuthRoute(Path.passkey.management, <PasskeyManagement />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.passkey.recovery, <PasskeyRecoveryOptions />, { layout: 'noLayout' }),
  createAuthRoute(Path.passkey.prompt, <PasskeyRegistrationPrompt />, { layout: 'noLayout' }),
  createAdminRoute(Path.passkey.setup, <PasskeySetup />),
  createAdminRoute(Path.passkey.usage_stats, <PasskeyUsageStats />),

  createPublicRoute(Path.platform.login, <PlatformAuthLogin />),
  createAuthRoute(Path.platform.register, <PlatformAuthRegister />, { layout: 'noLayout' }),
]
