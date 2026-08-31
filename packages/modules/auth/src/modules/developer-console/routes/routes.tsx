import React from 'react'
import { AuthRouteConfig } from '@cap/platform-core'
import Path from '../screens/path'
import { createAuthRoute } from '../../../routes/routeHelpers'

const DeveloperApiKeysScreen = React.lazy(() => import('../screens/DeveloperApiKeysScreen'))
const WebhooksScreen = React.lazy(() => import('../screens/WebhooksScreen'))

export const developerConsoleRouteConfig: AuthRouteConfig[] = [
  // --- API Tokens (verified auth) ---
  createAuthRoute(Path.developerConsole, <DeveloperApiKeysScreen />, {
    requiresVerification: true,
    layout: 'admin',
  }),
  createAuthRoute(Path.webhooks, <WebhooksScreen />, {
    requiresVerification: true,
    layout: 'admin',
  }),
]
