import React from 'react'
import { AuthRouteConfig } from '@cap/platform-core'
import Path from '../screens/path'
import { createAuthRoute } from '../../../routes/routeHelpers'

// ---------------------------------------------------------------------------
// API Tokens
// ---------------------------------------------------------------------------
const APITokensDashboard           = React.lazy(() => import('../screens/api-tokens/APITokensDashboard'))
const CreateAPITokenBasicInfo      = React.lazy(() => import('../screens/api-tokens/CreateAPITokenBasicInfo'))
const CreateAPITokenIPRestrictions = React.lazy(() => import('../screens/api-tokens/CreateAPITokenIPRestrictions'))
const APITokenDetails              = React.lazy(() => import('../screens/api-tokens/APITokenDetails'))
const APITokenDisplayUsage         = React.lazy(() => import('../screens/api-tokens/APITokenDisplayUsage'))
const APITokenActions              = React.lazy(() => import('../screens/api-tokens/APITokenActions'))
const APITokenSecurityWarning      = React.lazy(() => import('../screens/api-tokens/APITokenSecurityWarning'))
const VisualPolicyCanvas           = React.lazy(() => import('../screens/policies/VisualPolicyCanvas'))


export const authorizationEngineRouteConfig: AuthRouteConfig[] = [
  // --- Visual Policy & ABAC Canvas ---
  createAuthRoute(Path.policyCanvas,       <VisualPolicyCanvas />,           { requiresVerification: true, layout: 'admin' }),
  // --- API Tokens (verified auth) ---
  createAuthRoute(Path.dashboard,          <APITokensDashboard />,           { requiresVerification: true, layout: 'admin' }),
  createAuthRoute(Path.createBasic,        <CreateAPITokenBasicInfo />,      { requiresVerification: true, layout: 'admin' }),
  createAuthRoute(Path.createRestrictions, <CreateAPITokenIPRestrictions />, { requiresVerification: true, layout: 'admin' }),
  createAuthRoute(Path.details,            <APITokenDetails />,              { requiresVerification: true, layout: 'admin' }),
  createAuthRoute(Path.display,            <APITokenDisplayUsage />,         { requiresVerification: true, layout: 'admin' }),
  createAuthRoute(Path.actions,            <APITokenActions />,              { requiresVerification: true, layout: 'admin' }),
  createAuthRoute(Path.securityWarning,    <APITokenSecurityWarning />,      { requiresVerification: true, layout: 'admin' }),
]
