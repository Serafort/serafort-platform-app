import React from 'react'
import { AuthRouteConfig } from '@cap/platform-core'
import Path from './../screens/path'
import '../i18n/registry' // side effect: registers the billing en/fr/ar dictionaries
import { createAuthRoute } from '../../../routes/routeHelpers'

const BillingOverview = React.lazy(() => import('../screens/BillingOverview'))
const BillingUpgrade = React.lazy(() => import('../screens/BillingUpgrade'))

/**
 * Billing is signed-in, not admin-gated, on purpose. The backend lets any member
 * read plan, plan catalogue and usage, and only checkout/portal are admin-only.
 * A non-admin sent here by a 402 therefore sees what they are missing and who
 * can buy it, and the purchase controls disable themselves rather than the whole
 * page answering 403. The backend enforces the admin check either way.
 */
export const billingRouteConfig: AuthRouteConfig[] = [
  createAuthRoute(Path.overview, <BillingOverview />, { layout: 'admin' }),
  createAuthRoute(Path.upgrade, <BillingUpgrade />, { layout: 'admin' }),
]

export default billingRouteConfig
