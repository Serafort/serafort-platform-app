import { z } from 'zod'
import {
  BILLING_FEATURES,
  BILLING_LIMITS,
  BILLING_METRICS,
  BILLING_PLAN_KEYS,
} from '@cap/platform-core'

/**
 * Runtime validation for `/api/v1/billing/*`.
 *
 * Plan gating drives what a customer sees they are paying for, so a response
 * that drifted from the contract should fail loudly at the service boundary
 * instead of rendering `undefined` in a comparison table. Unknown extra fields
 * are stripped, not rejected, so an additive backend change does not break the UI.
 */
const planKey = z.enum(BILLING_PLAN_KEYS)

const features = z.object({
  allow_scim: z.boolean(),
  allow_saml_sso: z.boolean(),
  allow_jit: z.boolean(),
  allow_audit_anchoring: z.boolean(),
} satisfies Record<(typeof BILLING_FEATURES)[number], z.ZodBoolean>)

const limits = z.object({
  max_mau: z.number().nullable(),
  max_m2m_tokens: z.number().nullable(),
  max_sms: z.number().nullable(),
} satisfies Record<(typeof BILLING_LIMITS)[number], z.ZodNullable<z.ZodNumber>>)

const usageMetric = z.object({
  used: z.number(),
  limit: z.number().nullable(),
  percent: z.number().nullable(),
})

export const billingEntitlementsSchema = z.object({
  plan: planKey,
  plan_name: z.string(),
  status: z.enum(['active', 'past_due', 'canceled', 'trialing', 'none']),
  downgraded: z.boolean(),
  features,
  limits,
  grace_ends_at: z.string().nullable(),
  current_period_end: z.string().nullable(),
  cancel_at_period_end: z.boolean(),
})

export const billingPlansSchema = z.object({
  plans: z.array(
    z.object({
      key: planKey,
      name: z.string(),
      sort_order: z.number(),
      features,
      limits,
    }),
  ),
})

export const billingUsageSchema = z.object({
  plan: z.string(),
  period_start: z.string(),
  period_end: z.string(),
  usage: z.object({
    mau: usageMetric,
    m2m: usageMetric,
    sms: usageMetric,
  } satisfies Record<(typeof BILLING_METRICS)[number], typeof usageMetric>),
})

export const billingRedirectSchema = z.object({ url: z.string().min(1) })
