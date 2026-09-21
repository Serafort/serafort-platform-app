import React from 'react'
import type { ModuleRouteConfig } from '@cap/shared-types'
import Path from '../screens/path'
import { createAdminRoute, createAuthRoute } from '../../../routes/routeHelpers'

// ---------------------------------------------------------------------------
// Provisioning & Directory Sync (Admin)
// ---------------------------------------------------------------------------
const ConnectorDetailView = React.lazy(() => import('../screens/provisioning/ConnectorDetailView'))
const DirectorySyncDashboard = React.lazy(
  () => import('../screens/provisioning/DirectorySyncDashboard'),
)
const SCIMConfiguration = React.lazy(() => import('../screens/provisioning/SCIMConfiguration'))
const SyncLogsView = React.lazy(() => import('../screens/provisioning/SyncLogsView'))

// ---------------------------------------------------------------------------
// SSO Admin Configuration
// ---------------------------------------------------------------------------
const JWKSManagement = React.lazy(() => import('../screens/sso/JWKSManagement'))
const OIDCClientCreate = React.lazy(() => import('../screens/sso/OIDCClientCreate'))
const OIDCClientEdit = React.lazy(() => import('../screens/sso/OIDCClientEdit'))
const OIDCConfigBrowser = React.lazy(() => import('../screens/sso/OIDCConfigBrowser'))
const SAMLConfigDashboard = React.lazy(() => import('../screens/sso/SAMLConfigDashboard'))
const SAMLMetadataBrowser = React.lazy(() => import('../screens/sso/SAMLMetadataBrowser'))
const SAMLMetadataDisplay = React.lazy(() => import('../screens/sso/SAMLMetadataDisplay'))
const SSFConfiguration = React.lazy(() => import('../screens/sso/SSFConfiguration'))
const CaepEventConsole = React.lazy(() => import('../screens/sso/CaepEventConsole'))

// ---------------------------------------------------------------------------
// SSO Interactive & Waiting Flows (Public / Flow)
// ---------------------------------------------------------------------------
const AuthWaitScreen = React.lazy(() => import('../screens/sso/AuthWaitScreen'))
const OIDCLoginPrompt = React.lazy(() => import('../screens/sso/OIDCLoginPrompt'))
const OidcWaitScreen = React.lazy(() => import('../screens/sso/OidcWaitScreen'))
const PermissionConsentScreen = React.lazy(() => import('../screens/sso/PermissionConsentScreen'))
const SAMLSSOInitiation = React.lazy(() => import('../screens/sso/SAMLSSOInitiation'))
const SamlWaitScreen = React.lazy(() => import('../screens/sso/SamlWaitScreen'))
const SSOProviderSelection = React.lazy(() => import('../screens/sso/SSOProviderSelection'))

export const identityBrokerRouteConfig: ModuleRouteConfig[] = [
  // --- Admin Provisioning & Directory Sync ---
  createAdminRoute(Path.connectorDetail, <ConnectorDetailView />, 'Connector Detail'),
  createAdminRoute(Path.syncLogs, <SyncLogsView />, 'Sync Logs'),
  createAdminRoute(Path.provisioning, <DirectorySyncDashboard />, 'Directory Provisioning'),
  createAdminRoute(Path.scim, <SCIMConfiguration />, 'SCIM Configuration'),

  // --- Admin OIDC & SAML Configuration ---
  createAdminRoute(Path.jwksManagement, <JWKSManagement />, 'JWKS Key Management'),
  createAdminRoute(Path.oidcClientCreate, <OIDCClientCreate />, 'Create OIDC Client'),
  createAdminRoute(Path.oidcClientEdit, <OIDCClientEdit />, 'Edit OIDC Client'),
  createAdminRoute(Path.oidcConfigBrowser, <OIDCConfigBrowser />, 'OIDC Clients'),
  createAdminRoute(Path.samlConfigDashboard, <SAMLConfigDashboard />, 'SAML Configuration'),
  createAdminRoute(Path.samlMetadataBrowser, <SAMLMetadataBrowser />, 'SAML Metadata Browser'),
  createAdminRoute(Path.samlMetadataDisplay, <SAMLMetadataDisplay />, 'SAML Metadata Display'),
  createAdminRoute(Path.ssfConfiguration, <SSFConfiguration />, 'Shared Signals (SSF)'),
  // The configuration screen sets the stream up; this one operates it.
  createAdminRoute(Path.caepEventConsole, <CaepEventConsole />, 'Shared Signals console'),

  // --- SSO Interactive & Waiting Flows ---
  createAuthRoute(Path.authWait, <AuthWaitScreen />, {
    layout: 'noLayout',
    label: 'SSO Auth Wait',
  }),
  createAuthRoute(Path.oidcLoginPrompt, <OIDCLoginPrompt />, {
    layout: 'noLayout',
    label: 'OIDC Login Prompt',
  }),
  createAuthRoute(Path.oidcWait, <OidcWaitScreen />, {
    layout: 'noLayout',
    label: 'OIDC Authorization Wait',
  }),
  createAuthRoute(Path.permissionConsent, <PermissionConsentScreen />, {
    layout: 'noLayout',
    label: 'OIDC Scope Consent',
  }),
  createAuthRoute(Path.samlWait, <SamlWaitScreen />, {
    layout: 'noLayout',
    label: 'SAML Redirect Wait',
  }),
  createAuthRoute(Path.samlSSOInitiation, <SAMLSSOInitiation />, {
    layout: 'noLayout',
    label: 'SAML SSO Login',
  }),
  createAuthRoute(Path.providerSelection, <SSOProviderSelection />, {
    layout: 'noLayout',
    label: 'Select SSO Provider',
  }),
]

export default identityBrokerRouteConfig
