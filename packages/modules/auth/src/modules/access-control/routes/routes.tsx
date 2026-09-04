import React from 'react'
import { AuthRouteConfig } from '@cap/platform-core'
import Path from './../screens/path'
import { createAdminRoute } from '../../../routes/routeHelpers'

const NfcCardInventory = React.lazy(() => import('../screens/cards/NfcCardInventory'))
const AccessPointManagement = React.lazy(() => import('../screens/points/AccessPointManagement'))
const PhysicalEntryLogs = React.lazy(() => import('../screens/logs/PhysicalEntryLogs'))

/**
 * Physical access control is admin-gated and organization-scoped. The screens
 * resolve the organization from the session rather than the URL, so there is no
 * `:orgId` segment here for anyone to edit.
 */
export const accessControlRouteConfig: AuthRouteConfig[] = [
  createAdminRoute(Path.cards, <NfcCardInventory />),
  createAdminRoute(Path.points, <AccessPointManagement />),
  createAdminRoute(Path.logs, <PhysicalEntryLogs />),
]

export default accessControlRouteConfig
