import React from 'react'
import { AuthRouteConfig } from '@cap/platform-core'
import Path from './../screens/path'
import { createAuthRoute } from '../../../routes/routeHelpers'

// ---------------------------------------------------------------------------
// Session / account security screens
// ---------------------------------------------------------------------------
const AccountOverview = React.lazy(() =>
  import('../screens').then((m) => ({ default: m.AccountOverview })),
)
const ActiveSessionsManagement = React.lazy(() =>
  import('../screens').then((m) => ({ default: m.ActiveSessionsManagement })),
)
const UserActivityTimeline = React.lazy(() =>
  import('../screens').then((m) => ({ default: m.UserActivityTimeline })),
)
const ChangePassword = React.lazy(() =>
  import('../screens').then((m) => ({ default: m.ChangePassword })),
)

// ---------------------------------------------------------------------------
// Route config
// ---------------------------------------------------------------------------
export const sessionManagerRouteConfig: AuthRouteConfig[] = [
  createAuthRoute(Path.overview, <AccountOverview />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.activeSessions, <ActiveSessionsManagement />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.activityTimeline, <UserActivityTimeline />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.changePassword, <ChangePassword />, {
    requiresVerification: true,
    layout: 'admin',
  }),
]
