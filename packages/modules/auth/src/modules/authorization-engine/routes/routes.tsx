import React from 'react'
import { AuthRouteConfig } from '@cap/platform-core'
import Path from '../screens/path'
import { createAuthRoute } from '../../../routes/routeHelpers'

// ---------------------------------------------------------------------------
// API Tokens
// ---------------------------------------------------------------------------
const APITokensDashboard = React.lazy(() => import('../screens/api-tokens/APITokensDashboard'))
const CreateAPITokenWizard = React.lazy(() => import('../screens/api-tokens/CreateAPITokenWizard'))
const CreateAPITokenBasicInfo = React.lazy(
  () => import('../screens/api-tokens/CreateAPITokenBasicInfo'),
)
const CreateAPITokenIPRestrictions = React.lazy(
  () => import('../screens/api-tokens/CreateAPITokenIPRestrictions'),
)
const APITokenDetails = React.lazy(() => import('../screens/api-tokens/APITokenDetails'))
const APITokenDisplayUsage = React.lazy(() => import('../screens/api-tokens/APITokenDisplayUsage'))
const APITokenActions = React.lazy(() => import('../screens/api-tokens/APITokenActions'))
const APITokenSecurityWarning = React.lazy(
  () => import('../screens/api-tokens/APITokenSecurityWarning'),
)
const MachineIdentityManagement = React.lazy(
  () => import('../screens/api-tokens/MachineIdentityManagement'),
)
// ---------------------------------------------------------------------------
// Domain Verification
// ---------------------------------------------------------------------------
const DomainVerification = React.lazy(() => import('../screens/organizations/DomainVerification'))
// ---------------------------------------------------------------------------
// Policies
// ---------------------------------------------------------------------------
const VisualPolicyCanvas = React.lazy(() => import('../screens/policies/VisualPolicyCanvas'))
// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------
const PermissionRegistry = React.lazy(() => import('../screens/roles/PermissionRegistry'))
const RoleDetailView = React.lazy(() => import('../screens/roles/RoleDetailView'))
const RoleList = React.lazy(() => import('../screens/roles/RoleList'))

export const authorizationEngineRouteConfig: AuthRouteConfig[] = [
  // --- API Tokens (verified auth) ---
  createAuthRoute(Path.dashboard, <APITokensDashboard />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.createBasic, <CreateAPITokenWizard />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.createRestrictions, <CreateAPITokenIPRestrictions />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.details, <APITokenDetails />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.display, <APITokenDisplayUsage />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.actions, <APITokenActions />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.securityWarning, <APITokenSecurityWarning />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.machineIdentities, <MachineIdentityManagement />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  // --- Domain Verification (verified auth) ---
  createAuthRoute(Path.domainVerification, <DomainVerification />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  // --- Visual Policy & ABAC Canvas ---
  createAuthRoute(Path.policyCanvas, <VisualPolicyCanvas />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  // --- Roles & Permissions ---
  createAuthRoute(Path.roles, <RoleList />, { requiresVerification: true, layout: 'admin' }),
  createAuthRoute(Path.roleDetail, <RoleDetailView />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.permissions, <PermissionRegistry />, {
    requiresVerification: true,
    layout: 'admin',
  }),
]
