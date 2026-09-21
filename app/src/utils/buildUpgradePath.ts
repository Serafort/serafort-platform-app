import type { FeatureNotEntitledPayload } from '@cap/platform-core'
import { AppPaths } from '@cap/shared-types'

/**
 * The in-app upgrade URL for a 402.
 *
 * Built from `AppPaths`, never from the `upgrade_url` the server sent: the
 * client only ever navigates to its own route, so a tampered response cannot
 * turn this into a redirect. The query carries two allow-listed keys (a feature
 * and a plan), which the api client has already validated -- no user, tenant or
 * token data goes into the URL.
 */
export function buildUpgradePath(payload: FeatureNotEntitledPayload): string {
  const query = new URLSearchParams({
    feature: payload.feature,
    required_plan: payload.required_plan,
  })
  return `${AppPaths.billing.upgrade}?${query.toString()}`
}
