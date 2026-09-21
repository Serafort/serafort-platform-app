/**
 * Billing & entitlements wire types.
 *
 * Mirrors the flat snake_case JSON of `/api/v1/billing/*`
 * (`Authentication/app/controllers/billing/entitlements_controller.ts`). There
 * is no `successResponse` envelope here, and `apiClient` does not unwrap.
 *
 * Hand-written rather than under `dtos/`: that folder is mirrored from
 * `Authentication/app/contracts/dtos` by `scripts/sync-contracts.mjs`, and the
 * backend has no billing DTO to mirror. This package is dependency-free, so the
 * runtime Zod schemas that validate these shapes live with the billing module.
 *
 * No React dependencies - pure TypeScript only.
 */

export const BILLING_PLAN_KEYS = ["free", "pro", "enterprise"] as const;
export type BillingPlanKey = (typeof BILLING_PLAN_KEYS)[number];

/** Plans Stripe Checkout can sell. `free` is the floor, never purchased. */
export const BILLING_PURCHASABLE_PLANS = ["pro", "enterprise"] as const;
export type BillingPurchasablePlan = (typeof BILLING_PURCHASABLE_PLANS)[number];

export const BILLING_FEATURES = [
  "allow_scim",
  "allow_saml_sso",
  "allow_jit",
  "allow_audit_anchoring",
] as const;
export type BillingFeature = (typeof BILLING_FEATURES)[number];

export const BILLING_LIMITS = ["max_mau", "max_m2m_tokens", "max_sms"] as const;
export type BillingLimit = (typeof BILLING_LIMITS)[number];

export type BillingSubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "trialing"
  | "none";

/** `null` means unlimited. */
export type BillingLimits = Record<BillingLimit, number | null>;
export type BillingFeatures = Record<BillingFeature, boolean>;

/** `GET /api/v1/billing/entitlements` */
export interface BillingEntitlements {
  plan: BillingPlanKey;
  plan_name: string;
  status: BillingSubscriptionStatus;
  /** A paid plan the tenant lost (canceled, or dunning grace elapsed). */
  downgraded: boolean;
  features: BillingFeatures;
  limits: BillingLimits;
  grace_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export interface BillingPlan {
  key: BillingPlanKey;
  name: string;
  sort_order: number;
  features: BillingFeatures;
  limits: BillingLimits;
}

/** `GET /api/v1/billing/plans` */
export interface BillingPlansResponse {
  plans: BillingPlan[];
}

export const BILLING_METRICS = ["mau", "m2m", "sms"] as const;
export type BillingMetric = (typeof BILLING_METRICS)[number];

export interface BillingUsageMetric {
  used: number;
  /** `null` = unlimited, `0` = not included in the plan. */
  limit: number | null;
  /** 0-100+, one decimal. `null` when unlimited or not included. */
  percent: number | null;
}

/** `GET /api/v1/billing/usage` */
export interface BillingUsage {
  plan: string;
  period_start: string;
  period_end: string;
  usage: Record<BillingMetric, BillingUsageMetric>;
}

/** `POST /api/v1/billing/checkout` and `POST /api/v1/billing/portal` */
export interface BillingRedirect {
  url: string;
}

export interface BillingCheckoutRequest {
  plan: BillingPurchasablePlan;
}

/**
 * Machine-readable error codes on billing writes.
 * 503 `billing_not_configured`, 400 `plan_not_purchasable`,
 * 409 `already_subscribed` | `no_stripe_customer`.
 */
export type BillingErrorCode =
  | "billing_not_configured"
  | "plan_not_purchasable"
  | "already_subscribed"
  | "no_stripe_customer"
  | "tenant_required";

/**
 * Body of a 402 from any entitlement-gated endpoint. `upgrade_url` is sent by
 * the server but the client never navigates to it: it routes to its own
 * `AppPaths.billing.upgrade`, so a tampered response cannot become a redirect.
 */
export interface FeatureNotEntitledPayload {
  error: "feature_not_entitled";
  feature: BillingFeature;
  required_plan: BillingPlanKey;
  upgrade_url?: string;
}

const isString = (value: unknown): value is string => typeof value === "string";

/**
 * Narrow an unknown 402 body to `FeatureNotEntitledPayload`. Unknown feature or
 * plan values are rejected rather than passed through, because both end up in a
 * query string and a notification.
 */
export function parseFeatureNotEntitled(
  body: unknown,
): FeatureNotEntitledPayload | null {
  if (body === null || typeof body !== "object") return null;
  const candidate = body as Record<string, unknown>;
  if (candidate.error !== "feature_not_entitled") return null;
  if (
    !isString(candidate.feature) ||
    !(BILLING_FEATURES as readonly string[]).includes(candidate.feature)
  ) {
    return null;
  }
  if (
    !isString(candidate.required_plan) ||
    !(BILLING_PLAN_KEYS as readonly string[]).includes(candidate.required_plan)
  ) {
    return null;
  }
  return {
    error: "feature_not_entitled",
    feature: candidate.feature as BillingFeature,
    required_plan: candidate.required_plan as BillingPlanKey,
    upgrade_url: isString(candidate.upgrade_url)
      ? candidate.upgrade_url
      : undefined,
  };
}
