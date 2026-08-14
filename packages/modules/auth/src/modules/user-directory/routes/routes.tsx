import React from 'react'
import { AuthRouteConfig } from '@cap/platform-core'
import Path from '@cap/module-auth/routes/path'
import { createAuthRoute } from '../../../routes/routeHelpers'

// ---------------------------------------------------------------------------
// User profile screens
// ---------------------------------------------------------------------------
const ProfileView = React.lazy(() =>
  import('../screens').then((m) => ({ default: m.ProfileView })),
)
const EditProfile = React.lazy(() =>
  import('../screens').then((m) => ({ default: m.EditProfile })),
)
const LinkedAccountsDashboard = React.lazy(() =>
  import('../screens').then((m) => ({ default: m.LinkedAccountsDashboard })),
)
const ChangeEmail = React.lazy(() =>
  import('../screens').then((m) => ({ default: m.ChangeEmail })),
)
const DeleteAccount = React.lazy(() =>
  import('../screens').then((m) => ({ default: m.DeleteAccount })),
)
const DeactivateAccount = React.lazy(() =>
  import('../screens').then((m) => ({ default: m.DeactivateAccount })),
)

export const userDirectoryRouteConfig: Array<AuthRouteConfig> = [
  // --- User profile (verified auth) ---
  createAuthRoute(Path.user.view, <ProfileView />, { requiresVerification: true, layout: 'admin' }),
  createAuthRoute(Path.user.edit, <EditProfile />, { requiresVerification: true, layout: 'admin' }),
  createAuthRoute(Path.user.changeEmail, <ChangeEmail />, { requiresVerification: true, layout: 'admin' }),
  createAuthRoute(Path.user.linkedAccounts, <LinkedAccountsDashboard />, { requiresVerification: true, layout: 'admin' }),
  createAuthRoute(Path.user.delete, <DeleteAccount />, { requiresVerification: true, layout: 'admin' }),
  createAuthRoute(Path.user.deactivate, <DeactivateAccount />, { requiresVerification: true, layout: 'admin' }),
  createAuthRoute(Path.user.emailChangeStatus, <ChangeEmail />, { requiresVerification: true, layout: 'admin' }),
  createAuthRoute(Path.user.initiateEmailChange, <ChangeEmail />, { requiresVerification: true, layout: 'noLayout' }),
]

