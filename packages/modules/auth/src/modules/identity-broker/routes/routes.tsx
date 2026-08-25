import React from 'react'
import { AuthRouteConfig } from '@cap/platform-core'
import Path from '../screens/path'
import { createAuthRoute } from '@cap/module-auth/routes'

// ---------------------------------------------------------------------------
// provisioning
// ---------------------------------------------------------------------------
const ConnectorDetailView = React.lazy(() => import('../screens/provisioning/ConnectorDetailView'))
const DirectorySyncDashboard = React.lazy(() => import('../screens/provisioning/DirectorySyncDashboard'))
const SCIMConfiguration = React.lazy(() => import('../screens/provisioning/SCIMConfiguration'))
const SyncLogsView = React.lazy(() => import('../screens/provisioning/SyncLogsView'))

// ---------------------------------------------------------------------------
// SSO – public / wait screens
// ---------------------------------------------------------------------------
const AuthWaitScreen = React.lazy(() => import('../screens/sso/AuthWaitScreen'))
const JWKSManagement = React.lazy(() => import('../screens/sso/JWKSManagement'))
const OIDCClientCreate = React.lazy(() => import('../screens/sso/OIDCClientCreate'))
const OIDCClientEdit = React.lazy(() => import('../screens/sso/OIDCClientEdit'))
const OIDCConfigBrowser = React.lazy(() => import('../screens/sso/OIDCConfigBrowser'))
const OIDCLoginPrompt = React.lazy(() => import('../screens/sso/OIDCLoginPrompt'))
const OidcWaitScreen = React.lazy(() => import('../screens/sso/OidcWaitScreen'))
const PermissionConsentScreen = React.lazy(() => import('../screens/sso/PermissionConsentScreen'))
const SAMLConfigDashboard = React.lazy(() => import('../screens/sso/SAMLConfigDashboard'))
const SAMLMetadataBrowser = React.lazy(() => import('../screens/sso/SAMLMetadataBrowser'))
const SAMLMetadataDisplay = React.lazy(() => import('../screens/sso/SAMLMetadataDisplay'))
const SAMLSSOInitiation = React.lazy(() => import('../screens/sso/SAMLSSOInitiation'))
const SamlWaitScreen = React.lazy(() => import('../screens/sso/SamlWaitScreen'))
const SSFConfiguration = React.lazy(() => import('../screens/sso/SSFConfiguration'))
const SSOProviderSelection = React.lazy(() => import('../screens/sso/SSOProviderSelection'))

export const identityBrokerRouteConfig: AuthRouteConfig[] = [
  // --- Admin Provisioning & Directory Sync ---
  createAuthRoute(Path.connectorDetail, <ConnectorDetailView />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.syncLogs, <SyncLogsView />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.provisioning, <DirectorySyncDashboard />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.scim, <SCIMConfiguration />, {
    requiresVerification: true,
    layout: 'admin',
  }),

  // --- Admin OIDC & SAML Configuration ---
  createAuthRoute(Path.jwksManagement, <JWKSManagement />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.oidcClientCreate, <OIDCClientCreate />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.oidcClientEdit, <OIDCClientEdit />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.oidcConfigBrowser, <OIDCConfigBrowser />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.samlConfigDashboard, <SAMLConfigDashboard />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.samlMetadataBrowser, <SAMLMetadataBrowser />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.samlMetadataDisplay, <SAMLMetadataDisplay />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.ssfConfiguration, <SSFConfiguration />, {
    requiresVerification: true,
    layout: 'admin',
  }),

  // --- SSO Interactive & Waiting Flows ---
  createAuthRoute(Path.authWait, <AuthWaitScreen />, {
    layout: 'noLayout',
  }),
  createAuthRoute(Path.oidcLoginPrompt, <OIDCLoginPrompt />, {
    layout: 'noLayout',
  }),
  createAuthRoute(Path.oidcWait, <OidcWaitScreen />, {
    layout: 'noLayout',
  }),
  createAuthRoute(Path.permissionConsent, <PermissionConsentScreen />, {
    layout: 'noLayout',
  }),
  createAuthRoute(Path.samlWait, <SamlWaitScreen />, {
    layout: 'noLayout',
  }),
  createAuthRoute(Path.samlSSOInitiation, <SAMLSSOInitiation />, {
    layout: 'noLayout',
  }),
  createAuthRoute(Path.providerSelection, <SSOProviderSelection />, {
    layout: 'noLayout',
  }),
]

