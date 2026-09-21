import { apiClient, FetchResponse, ENDPOINTS } from '@cap/platform-core'
import {
  billingEntitlementsSchema,
  billingPlansSchema,
  billingRedirectSchema,
  billingUsageSchema,
} from '../types/billing.schemas'
import type {
  BillingEntitlements,
  BillingErrorCode,
  BillingPlansResponse,
  BillingPurchasablePlan,
  BillingRedirect,
  BillingUsage,
} from '../types/billing.types'
import { assertSafeRedirectUrl } from '../utils/redirect'

/**
 * Billing & entitlements, `/api/v1/billing/*`.
 *
 * These controllers answer flat snake_case JSON with no `successResponse`
 * envelope, so `response.data` is the payload itself. Every response is parsed
 * through its Zod schema before it reaches a screen.
 *
 * Checkout and portal are org-admin only and hand back a Stripe-hosted URL. The
 * URL is checked to be `https:` here, at the boundary, so no caller can forget.
 * Their failures are shown inline by the billing screens, so the client's
 * generic toast is skipped to avoid announcing the same error twice.
 */
const billingService = {
  getEntitlements: async (): Promise<FetchResponse<BillingEntitlements>> => {
    const response = await apiClient.get<unknown>(ENDPOINTS.billing.entitlements)
    return { ...response, data: billingEntitlementsSchema.parse(response.data) }
  },

  getPlans: async (): Promise<FetchResponse<BillingPlansResponse>> => {
    const response = await apiClient.get<unknown>(ENDPOINTS.billing.plans)
    return { ...response, data: billingPlansSchema.parse(response.data) }
  },

  getUsage: async (): Promise<FetchResponse<BillingUsage>> => {
    const response = await apiClient.get<unknown>(ENDPOINTS.billing.usage)
    return { ...response, data: billingUsageSchema.parse(response.data) }
  },

  /** Start Stripe Checkout for a paid plan. */
  createCheckoutSession: async (
    plan: BillingPurchasablePlan,
  ): Promise<FetchResponse<BillingRedirect>> => {
    const response = await apiClient.post<unknown>(
      ENDPOINTS.billing.checkout,
      { plan },
      { skipGlobalNotification: true },
    )
    const parsed = billingRedirectSchema.parse(response.data)
    return { ...response, data: { url: assertSafeRedirectUrl(parsed.url) } }
  },

  /** Open the Stripe Customer Portal. */
  createPortalSession: async (): Promise<FetchResponse<BillingRedirect>> => {
    const response = await apiClient.post<unknown>(ENDPOINTS.billing.portal, undefined, {
      skipGlobalNotification: true,
    })
    const parsed = billingRedirectSchema.parse(response.data)
    return { ...response, data: { url: assertSafeRedirectUrl(parsed.url) } }
  },
}

const KNOWN_CODES: readonly BillingErrorCode[] = [
  'billing_not_configured',
  'plan_not_purchasable',
  'already_subscribed',
  'no_stripe_customer',
  'tenant_required',
]

/**
 * The machine-readable billing code on a failed request, or null.
 *
 * Read from the response body's `error` field (`HttpError.response.data`), and
 * only accepted when it is one of the codes the backend documents, so an
 * arbitrary server string never becomes a translation key or a branch.
 */
export function getBillingErrorCode(error: unknown): BillingErrorCode | null {
  const candidate = error as {
    response?: { data?: { error?: unknown } }
    data?: { error?: unknown }
  } | null
  const raw = candidate?.response?.data?.error ?? candidate?.data?.error
  return typeof raw === 'string' && (KNOWN_CODES as readonly string[]).includes(raw)
    ? (raw as BillingErrorCode)
    : null
}

export function getBillingErrorStatus(error: unknown): number | null {
  const status = (error as { status?: unknown } | null)?.status
  return typeof status === 'number' && status > 0 ? status : null
}

export default billingService
