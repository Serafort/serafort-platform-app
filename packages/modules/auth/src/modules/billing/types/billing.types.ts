// The wire shapes live in @cap/api-contracts (Tier 1) so the 402 handler in
// @cap/platform-store and this module agree on them. Re-exported here so the
// screens import one place.
export {
  BILLING_FEATURES,
  BILLING_LIMITS,
  BILLING_METRICS,
  BILLING_PLAN_KEYS,
  BILLING_PURCHASABLE_PLANS,
  parseFeatureNotEntitled,
} from '@cap/platform-core'
export type {
  BillingCheckoutRequest,
  BillingEntitlements,
  BillingErrorCode,
  BillingFeature,
  BillingFeatures,
  BillingLimit,
  BillingLimits,
  BillingMetric,
  BillingPlan,
  BillingPlanKey,
  BillingPlansResponse,
  BillingPurchasablePlan,
  BillingRedirect,
  BillingSubscriptionStatus,
  BillingUsage,
  BillingUsageMetric,
  FeatureNotEntitledPayload,
} from '@cap/platform-core'

/** How full a metered limit is, for choosing the meter's colour. */
export type UsageSeverity = 'ok' | 'warning' | 'error' | 'unlimited' | 'excluded'

export const USAGE_WARNING_PERCENT = 80
export const USAGE_EXHAUSTED_PERCENT = 100

/**
 * Severity of one usage metric.
 *
 * `limit === 0` means the plan does not include the metric at all, which is a
 * different message from "you are at 100%" -- there is nothing to top up, only
 * a plan to move to -- so it is reported separately rather than as an error.
 * The percentage is recomputed from `used`/`limit` when the server omitted it,
 * so a missing `percent` can never under-report an exhausted limit.
 */
export function usageSeverity(metric: {
  used: number
  limit: number | null
  percent: number | null
}): UsageSeverity {
  if (metric.limit === null) return 'unlimited'
  if (metric.limit <= 0) return 'excluded'
  const percent = metric.percent ?? (metric.used / metric.limit) * 100
  if (percent >= USAGE_EXHAUSTED_PERCENT) return 'error'
  if (percent >= USAGE_WARNING_PERCENT) return 'warning'
  return 'ok'
}
