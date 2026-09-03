import React from 'react'
import { Route, type RoutesProps } from 'react-router-dom'
import type { ModuleRouteConfig } from '@cap/shared-types'
import { LayoutRouteWrapper } from '@cap/layout'
import { ThemePath } from './path'
import { createAuthRoute } from '@cap/module-auth'
const ThemeEditor = React.lazy(() => import('../screens/ThemeEditor'))

export const themeRouteConfig: Array<ModuleRouteConfig> = [
  createAuthRoute(ThemePath.theme, <ThemeEditor />, { requiresVerification: false, layout: 'admin' }),
]

/**
 * Route component for standalone or sub-router rendering of Landing module routes.
 * Wrapped with LayoutRouteWrapper to respect route layout intent.
 */
export const themeRoutes: React.FC<RoutesProps> = () => (
  <>
    {themeRouteConfig.map((route) => (
      <Route
        key={route.path}
        path={route.path}
        element={
          <LayoutRouteWrapper layout={route.layout || 'public'}>
            {route.element}
          </LayoutRouteWrapper>
        }
      />
    ))}
  </>
)

export const ThemeRoutes = themeRoutes
export default themeRoutes

