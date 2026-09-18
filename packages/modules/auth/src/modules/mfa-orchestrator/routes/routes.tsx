import React from 'react'
import { AuthRouteConfig } from '@cap/platform-core'
import Path from '../screens/path'
import { createAdminRoute, createAuthRoute } from '../../../routes/routeHelpers'
import GuestRoute from '../../authentication-core/middlewares/GuestRoute'

// ---------------------------------------------------------------------------
// MFA
// ---------------------------------------------------------------------------
const MFASetupScreen = React.lazy(() => import('../screens/mfa/MFASetupScreen'))
const MFAVerificationScreen = React.lazy(() => import('../screens/mfa/MFAVerificationScreen'))
const MFAManagement = React.lazy(() => import('../screens/mfa/MFAManagement'))

// ---------------------------------------------------------------------------
// Passkeys – internal screens
// ---------------------------------------------------------------------------
const PasskeyCreationOptions = React.lazy(() => import('../screens/passkey/PasskeyCreationOptions'))
const PasskeyLoginOption = React.lazy(() => import('../screens/passkey/PasskeyLoginOption'))
const PasskeyManagement = React.lazy(() => import('../screens/passkey/PasskeyManagement'))
const PasskeyNamingConfig = React.lazy(() => import('../screens/passkey/PasskeyNamingConfig'))
const PasskeyRecoveryOptions = React.lazy(() => import('../screens/passkey/PasskeyRecoveryOptions'))
const PasskeyRegistrationPrompt = React.lazy(
  () => import('../screens/passkey/PasskeyRegistrationPrompt'),
)
const PasskeySetup = React.lazy(() => import('../screens/passkey/PasskeySetup'))
const PasskeySetupAuto = React.lazy(() => import('../screens/passkey/PasskeySetupAuto'))
const PasskeyUsageStats = React.lazy(() => import('../screens/passkey/PasskeyUsageStats'))
const PasskeySetupAutoExample = React.lazy(() => import('../screens/passkey/PasskeySetupExample'))

// ---------------------------------------------------------------------------
// Platform Auth
// ---------------------------------------------------------------------------
const PlatformAuthLogin = React.lazy(() => import('../screens/platform/PlatformAuthLogin'))
const PlatformAuthRegister = React.lazy(() => import('../screens/platform/PlatformAuthRegister'))

export const mfaOrchestratorRouteConfig: AuthRouteConfig[] = [
  // --- MFA flows ---
  createAuthRoute(Path.mfa.setup, <MFASetupScreen />, { layout: 'noLayout' }),
  { path: Path.mfa.verification, element: <MFAVerificationScreen />, layout: 'noLayout' },
  createAuthRoute(Path.mfa.management, <MFAManagement />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.mfa.dashboard, <MFAManagement />, {
    requiresVerification: true,
    layout: 'admin',
  }),

  // --- Passkey flows ---
  createAuthRoute(Path.passkey.creation_options, <PasskeyCreationOptions />, {
    layout: 'noLayout',
  }),
  {
    path: Path.passkey.login,
    element: <GuestRoute element={<PasskeyLoginOption />} />,
    layout: 'noLayout',
  },
  createAuthRoute(Path.passkey.management, <PasskeyManagement />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.passkey.naming_config, <PasskeyNamingConfig />, { layout: 'noLayout' }),
  createAuthRoute(Path.passkey.recovery, <PasskeyRecoveryOptions />, { layout: 'noLayout' }),
  createAuthRoute(Path.passkey.prompt, <PasskeyRegistrationPrompt />, { layout: 'noLayout' }),
  createAdminRoute(Path.passkey.setup, <PasskeySetup />),
  createAdminRoute(Path.passkey.setup_auto, <PasskeySetupAuto />),
  createAdminRoute(Path.passkey.usage_stats, <PasskeyUsageStats />),
  createAdminRoute(Path.passkey.example, <PasskeySetupAutoExample />),

  { path: Path.platform.login, element: <PlatformAuthLogin />, layout: 'noLayout' },
  createAuthRoute(Path.platform.register, <PlatformAuthRegister />, { layout: 'noLayout' }),
]
