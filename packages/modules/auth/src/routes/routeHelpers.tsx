import React from 'react'
import type { ModuleRouteConfig, RouteLayout } from '@cap/shared-types'
import { Roles } from '@cap/platform-core'
import AdminRoute from '../modules/authorization-engine/middlewares/AdminRoute'
import AuthRoute from '../modules/authentication-core/middlewares/AuthRoute'
import GuestRoute from '../modules/authentication-core/middlewares/GuestRoute'

// ---------------------------------------------------------------------------
// Route factory helpers
//
// Every route in this module is declared through one of these four factories,
// never as a bare `{ path, element, layout }` object. The factory name is what
// tells a reader who may reach the screen -- admin, signed-in, signed-out, or
// anyone -- so the guard can never be silently omitted from a new route.
// ---------------------------------------------------------------------------

export const createAdminRoute = (
  path: string,
  element: React.ReactNode,
  label?: string,
): ModuleRouteConfig => ({
  path,
  label,
  layout: 'admin',
  // Use a getter so Roles is resolved lazily at render time, not at module evaluation time.
  // This prevents circular import errors when resolving Roles enum.
  get element() {
    return <AdminRoute element={element} minimumRole={Roles.ADMIN} layout='admin' />
  },
})

export const createAuthRoute = (
  path: string,
  element: React.ReactNode,
  options: {
    requiresVerification?: boolean
    layout?: RouteLayout
    label?: string
  } = {},
): ModuleRouteConfig => ({
  path,
  label: options.label,
  layout: options.layout ?? 'admin',
  element: (
    <AuthRoute
      element={element}
      requiresVerification={options.requiresVerification}
      layout={options.layout}
    />
  ),
})

/**
 * A route only a signed-OUT visitor should reach. `GuestRoute` bounces an
 * already-authenticated user away, so sign-in and recovery screens do not
 * reappear to someone who is already logged in.
 */
export const createGuestRoute = (
  path: string,
  element: React.ReactNode,
  options: { layout?: RouteLayout; label?: string } = {},
): ModuleRouteConfig => ({
  path,
  label: options.label,
  layout: options.layout ?? 'noLayout',
  element: <GuestRoute element={element} />,
})

/**
 * A route anyone may reach, signed in or not -- link landings such as
 * "your email was verified" that are opened straight from an email client.
 */
export const createPublicRoute = (
  path: string,
  element: React.ReactNode,
  options: { layout?: RouteLayout; label?: string } = {},
): ModuleRouteConfig => ({
  path,
  label: options.label,
  layout: options.layout ?? 'noLayout',
  element,
})

// Re-export LayoutRouteWrapper from layout package
export { LayoutRouteWrapper } from '@cap/layout'
