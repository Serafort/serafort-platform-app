import React from 'react'
import { AuthRouteConfig } from '@cap/platform-core'
import Path from '@cap/module-auth/routes/path'
import { createAdminRoute, createAuthRoute } from '../../../routes/routeHelpers'

// ---------------------------------------------------------------------------
// MFA – external package (@cap/module-mfa)
// ---------------------------------------------------------------------------
// const MFASetupInitiation     = React.lazy(() => import('@cap/module-mfa').then((m) => ({ default: m.MFASetupInitiation })))
// const MFAVerificationTest    = React.lazy(() => import('@cap/module-mfa').then((m) => ({ default: m.MFAVerificationTest })))
// const MFABackupCodes         = React.lazy(() => import('@cap/module-mfa').then((m) => ({ default: m.MFABackupCodes })))
// const MFAVerificationSuccess = React.lazy(() => import('@cap/module-mfa').then((m) => ({ default: m.MFAVerificationSuccess })))
// const MFAManagement          = React.lazy(() => import('@cap/module-mfa').then((m) => ({ default: m.MFAManagement })))
// const MFABackupCodeEntry     = React.lazy(() => import('@cap/module-mfa').then((m) => ({ default: m.MFABackupCodeEntry })))
// const AddMFAMethod           = React.lazy(() => import('@cap/module-mfa').then((m) => ({ default: m.AddMFAMethod })))
// const SecurityKeyManagement  = React.lazy(() => import('@cap/module-mfa').then((m) => ({ default: m.SecurityKeyManagement })))

// ---------------------------------------------------------------------------
// MFA – internal screens
// ---------------------------------------------------------------------------
const MFAVerificationScreen = React.lazy(() => import('../screens/MFAVerificationScreen'))

// ---------------------------------------------------------------------------
// Passkeys – internal screens
// ---------------------------------------------------------------------------
const PasskeyRegistrationPrompt = React.lazy(() => import('../screens/PasskeyRegistrationPrompt'))
const PasskeyManagement         = React.lazy(() => import('../screens/PasskeyManagement'))
const PasskeyRecoveryOptions    = React.lazy(() => import('../screens/PasskeyRecoveryOptions'))
const PasskeyUsageStats         = React.lazy(() => import('../screens/PasskeyUsageStats'))
const PasskeyCreationOptions    = React.lazy(() => import('../screens/PasskeyCreationOptions'))
const PasskeyLoginOption        = React.lazy(() => import('../screens/PasskeyLoginOption'))
const PasskeyNamingConfig       = React.lazy(() => import('../screens/PasskeyNamingConfig'))
const PlatformAuthLogin         = React.lazy(() => import('../screens/PlatformAuthLogin'))
const PlatformAuthRegister      = React.lazy(() => import('../screens/PlatformAuthRegister'))

// ---------------------------------------------------------------------------
// Route config
// ---------------------------------------------------------------------------
export const mfaOrchestratorRouteConfig: AuthRouteConfig[] = [
  // --- MFA flows ---
  // createAuthRoute(Path.mfa.setup,                <MFASetupInitiation />,    { layout: 'noLayout' }),
  // createAuthRoute(Path.mfa.backup_codes,         <MFABackupCodes />),
  // createAuthRoute(Path.mfa.verification_success, <MFAVerificationSuccess />),
  // createAuthRoute(Path.mfa.management,           <MFAManagement />),
  // createAuthRoute(Path.mfa.dashboard,            <MFAManagement />),
  // createAuthRoute(Path.mfa.add_method,           <AddMFAMethod />),
  // createAuthRoute(Path.mfa.security_keys,        <SecurityKeyManagement />),
  createAuthRoute(Path.mfa.dashboard,            <PasskeyManagement />,        { requiresVerification: true, layout: 'admin' }),
  createAuthRoute(Path.mfa.verification,         <MFAVerificationScreen />, { layout: 'noLayout' }),
  // { path: Path.mfa.verification, element: <MFAVerificationTest /> },
  // { path: Path.mfa.backup_entry, element: <MFABackupCodeEntry />, layout: 'noLayout' },

  // --- Passkey flows ---
  createAuthRoute(Path.passkey.setup,             <PasskeyRegistrationPrompt />),
  createAuthRoute(Path.passkey.management,        <PasskeyManagement />),
  createAuthRoute(Path.passkey.recovery,          <PasskeyRecoveryOptions />),
  createAuthRoute(Path.passkey.creation_options,  <PasskeyCreationOptions />),
  createAuthRoute(Path.passkey.naming_config,     <PasskeyNamingConfig />),
  createAuthRoute(Path.passkey.platform_register, <PlatformAuthRegister />),
  createAdminRoute(Path.passkey.usage_stats,      <PasskeyUsageStats />),
  { path: Path.passkey.login,          element: <PasskeyLoginOption />, layout: 'noLayout' },
  { path: Path.passkey.platform_login, element: <PlatformAuthLogin />,  layout: 'noLayout' },
]
