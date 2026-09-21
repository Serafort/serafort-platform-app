import React from 'react'
import { AuthRouteConfig } from '@cap/platform-core'
import Path from '../screens/path'
import { createGuestRoute } from '../../../routes/routeHelpers'

// ---------------------------------------------------------------------------
// Passwordless screens
// ---------------------------------------------------------------------------
const PasswordlessInitiation = React.lazy(() => import('../screens/PasswordlessInitiation'))
const PasswordlessVerification = React.lazy(() => import('../screens/PasswordlessVerification'))

// ---------------------------------------------------------------------------
// Route config
// ---------------------------------------------------------------------------
export const passwordlessServiceRouteConfig: AuthRouteConfig[] = [
  createGuestRoute(Path.setup, <PasswordlessInitiation />),
  createGuestRoute(Path.verification, <PasswordlessVerification />),
]
