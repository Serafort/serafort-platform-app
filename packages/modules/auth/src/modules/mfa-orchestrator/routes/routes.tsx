import React from 'react'
import { AuthRouteConfig } from '@cap/platform-core'
import Path from '../screens/path'
import { createAdminRoute, createAuthRoute } from '../../../routes/routeHelpers'

// ---------------------------------------------------------------------------
// MFA
// ---------------------------------------------------------------------------
const MFASetupScreen = React.lazy(() => import('../screens/MFASetupScreen'))
const MFAVerificationScreen = React.lazy(() => import('../screens/MFAVerificationScreen'))
const MFAManagement = React.lazy(() => import('../screens/MFAManagement'))

// ---------------------------------------------------------------------------
// Passkeys – internal screens
// ---------------------------------------------------------------------------
const PasskeyCreationOptions = React.lazy(() => import('../screens/PasskeyCreationOptions'))
const PasskeyLoginOption = React.lazy(() => import('../screens/PasskeyLoginOption'))
const PasskeyManagement = React.lazy(() => import('../screens/PasskeyManagement'))
const PasskeyNamingConfig = React.lazy(() => import('../screens/PasskeyNamingConfig'))
const PasskeyRecoveryOptions = React.lazy(() => import('../screens/PasskeyRecoveryOptions'))
const PasskeyRegistrationPrompt = React.lazy(() => import('../screens/PasskeyRegistrationPrompt'))
const PasskeySetup = React.lazy(() => import('../screens/PasskeySetup'))
const PasskeySetupAuto = React.lazy(() => import('../screens/PasskeySetupAuto'))
const PasskeyUsageStats = React.lazy(() => import('../screens/PasskeyUsageStats'))
const PasskeySetupAutoExample = React.lazy(() => import('../screens/PasskeySetupExample'))

// ---------------------------------------------------------------------------
// Platform Auth 
// ---------------------------------------------------------------------------
const PlatformAuthLogin = React.lazy(() => import('../screens/PlatformAuthLogin'))
const PlatformAuthRegister = React.lazy(() => import('../screens/PlatformAuthRegister'))

export const mfaOrchestratorRouteConfig: AuthRouteConfig[] = [
  // --- MFA flows ---
  createAuthRoute(Path.mfa.setup, <MFASetupScreen />, { layout: 'noLayout' }),
  { path: Path.mfa.verification, element: <MFAVerificationScreen />, layout: 'noLayout' },
  createAuthRoute(Path.mfa.management, <MFAManagement />, { requiresVerification: true, layout: 'admin' }),
  createAuthRoute(Path.mfa.dashboard, <MFAManagement />, { requiresVerification: true, layout: 'admin' }),

  // --- Passkey flows ---
  createAuthRoute(Path.passkey.creation_options, <PasskeyCreationOptions />, { layout: 'noLayout' }),
  { path: Path.passkey.login, element: <PasskeyLoginOption />, layout: 'noLayout' },
  createAuthRoute(Path.passkey.management, <PasskeyManagement />, { requiresVerification: true, layout: 'admin' }),
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
