import React from 'react'
import { AuthRouteConfig } from '@cap/platform-core'
import Path from '../screens/path'

// ---------------------------------------------------------------------------
// SSO – public / wait screens
// ---------------------------------------------------------------------------
const OidcWaitScreen          = React.lazy(() => import('../screens/sso/OidcWaitScreen'))
const SamlWaitScreen          = React.lazy(() => import('../screens/sso/SamlWaitScreen'))
const AuthWaitScreen          = React.lazy(() => import('../screens/sso/AuthWaitScreen'))
const PermissionConsentScreen = React.lazy(() => import('../screens/sso/PermissionConsentScreen'))
const OIDCLoginPrompt         = React.lazy(() => import('../screens/sso/OIDCLoginPrompt'))
const SSOProviderSelection    = React.lazy(() => import('../screens/sso/SSOProviderSelection'))
const SAMLSSOInitiation       = React.lazy(() => import('../screens/sso/SAMLSSOInitiation'))

export const identityBrokerRouteConfig: AuthRouteConfig[] = [
  // --- SSO public flows ---
  { path: Path.permissionConsent, element: <PermissionConsentScreen />, layout: 'noLayout' },
  { path: Path.oidcLoginPrompt,   element: <OIDCLoginPrompt />,         layout: 'noLayout' },
  { path: Path.providerSelection, element: <SSOProviderSelection />,    layout: 'noLayout' },
  { path: Path.authWait,          element: <AuthWaitScreen />,          layout: 'noLayout' },
  { path: Path.oidcWait,          element: <OidcWaitScreen />,          layout: 'noLayout' },
  { path: Path.samlWait,          element: <SamlWaitScreen />,          layout: 'noLayout' },
  { path: Path.samlSSOInitiation, element: <SAMLSSOInitiation />,       layout: 'noLayout' },
]

