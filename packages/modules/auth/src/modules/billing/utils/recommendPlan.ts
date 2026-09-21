import type { BillingFeature, BillingPlan, BillingPlanKey } from '../types/billing.types'

/**
 * The plan to highlight: the one named by `?required_plan=`, or failing that
 * the cheapest plan above the current one that switches `?feature=` on.
 */
export function pickRecommendedPlan(
  plans: BillingPlan[],
  currentKey: BillingPlanKey | undefined,
  feature: BillingFeature | null,
  requiredPlan: BillingPlanKey | null,
): BillingPlanKey | null {
  if (requiredPlan && plans.some((plan) => plan.key === requiredPlan)) return requiredPlan
  if (!feature) return null
  const currentOrder = plans.find((plan) => plan.key === currentKey)?.sort_order ?? -1
  return plans.find((plan) => plan.sort_order > currentOrder && plan.features[feature])?.key ?? null
}
