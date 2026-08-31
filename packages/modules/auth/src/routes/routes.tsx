/**
 * Central route aggregator for the auth module.
 *
 * All screen lazy-loads, guard logic, and path constants live inside
 * the respective sub-module's routes/routes.tsx.
 */
import React from 'react'
import { Route, type RoutesProps } from 'react-router-dom'
import type { ModuleRouteConfig } from '@cap/shared-types'
import { LayoutRouteWrapper } from '@cap/layout'
import AuthLoadingScreen from '../modules/authentication-core/components/shared/AuthLoadingScreen'

import { authCoreRouteConfig } from '../modules/authentication-core/routes/routes'
import { authorizationEngineRouteConfig } from '../modules/authorization-engine/routes/routes'

import { developerConsoleRouteConfig } from '../modules/developer-console/routes/routes'
import { identityBrokerRouteConfig } from '../modules/identity-broker/routes/routes'
import { mfaOrchestratorRouteConfig } from '../modules/mfa-orchestrator/routes/routes'
import { passwordlessServiceRouteConfig } from '../modules/passwordless-service/routes/routes'
import { platformClusterRouteConfig } from '../modules/platform-cluster/routes/routes'
import { sessionManagerRouteConfig } from '../modules/session-manager/routes/routes'
import { userDirectoryRouteConfig } from '../modules/user-directory/routes/routes'

// ---------------------------------------------------------------------------
// Merged route config (consumed by AppAssembly / CAPModule)
// ---------------------------------------------------------------------------
export const authRouteConfig: Array<ModuleRouteConfig> = [
  ...authCoreRouteConfig,
  ...authorizationEngineRouteConfig,
  ...developerConsoleRouteConfig,
  ...identityBrokerRouteConfig,
  ...mfaOrchestratorRouteConfig,
  ...passwordlessServiceRouteConfig,
  ...platformClusterRouteConfig,
  ...sessionManagerRouteConfig,
  ...userDirectoryRouteConfig,
]

// ---------------------------------------------------------------------------
// Route component (consumed by assembleApp or sub-router)
// assembleApp wraps all module routes in a single <Routes> for proper matching
// ---------------------------------------------------------------------------
export const authRoutes: React.FC<RoutesProps> = () => (
  <React.Suspense fallback={<AuthLoadingScreen />}>
    <>
      {authRouteConfig.map(({ path, element, layout }) => (
        <Route
          key={path}
          path={path}
          element={
            <LayoutRouteWrapper layout={layout || 'noLayout'}>
              {element}
            </LayoutRouteWrapper>
          }
        />
      ))}
    </>
  </React.Suspense>
)

export const AuthRoutes = authRoutes
export default authRoutes
