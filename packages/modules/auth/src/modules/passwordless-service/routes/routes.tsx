import React from 'react'
import { AuthRouteConfig } from '@cap/platform-core'
import Path from '../screens/path'
import GuestRoute from '@idaas/authentication-core/middlewares/GuestRoute'

// ---------------------------------------------------------------------------
// Passwordless screens
// ---------------------------------------------------------------------------
const PasswordlessInitiation   = React.lazy(() => import('../screens/PasswordlessInitiation'))
const PasswordlessVerification = React.lazy(() => import('../screens/PasswordlessVerification'))

// ---------------------------------------------------------------------------
// Route config
// ---------------------------------------------------------------------------
export const passwordlessServiceRouteConfig: AuthRouteConfig[] = [
  { path: Path.setup, element: <GuestRoute element={<PasswordlessInitiation />} />, layout: 'noLayout' },
  { path: Path.verification, element: <PasswordlessVerification />, layout: 'noLayout' },
]
