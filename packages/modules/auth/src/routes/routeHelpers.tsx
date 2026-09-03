import React from 'react'
import type { ModuleRouteConfig, RouteLayout } from '@cap/shared-types'
import { Roles, type LayoutOverride } from '@cap/platform-core'
import AdminRoute from '../modules/authorization-engine/middlewares/AdminRoute'
import AuthRoute from '../modules/authentication-core/middlewares/AuthRoute'

// ---------------------------------------------------------------------------
// Route factory helpers
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
  options: { requiresVerification?: boolean; layout?: LayoutOverride | RouteLayout; label?: string } = {},
): ModuleRouteConfig => ({
  path,
  label: options.label,
  layout: (options.layout as RouteLayout) || 'admin',
  element: (
    <AuthRoute
      element={element}
      requiresVerification={options.requiresVerification}
      layout={options.layout as LayoutOverride}
    />
  ),
})

// Re-export LayoutRouteWrapper from layout package
export { LayoutRouteWrapper } from '@cap/layout'
