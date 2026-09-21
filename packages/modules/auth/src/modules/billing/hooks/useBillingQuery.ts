import { useMutation, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@cap/platform-core'
import billingService from '../services/billing.service'
import type { BillingPurchasablePlan } from '../types/billing.types'
import { redirectToExternalUrl } from '../utils/redirect'

export const BILLING_KEYS = QUERY_KEYS.billing

/**
 * Current plan, status, features and limits.
 *
 * `retry: false`: a 403 `tenant_required` or a schema mismatch is a state to
 * show, not a transient fault. Kept fresh for a minute, matching the backend's
 * own entitlement cache TTL -- polling faster would only re-read the same value.
 */
export function useEntitlementsQuery() {
  return useQuery({
    queryKey: BILLING_KEYS.entitlements,
    queryFn: async () => (await billingService.getEntitlements()).data,
    staleTime: 60_000,
    retry: false,
  })
}

/** The active plan catalogue. Global rather than per tenant, so it changes rarely. */
export function usePlansQuery() {
  return useQuery({
    queryKey: BILLING_KEYS.plans,
    queryFn: async () => (await billingService.getPlans()).data,
    staleTime: 5 * 60_000,
    retry: false,
  })
}

export function useUsageQuery() {
  return useQuery({
    queryKey: BILLING_KEYS.usage,
    queryFn: async () => (await billingService.getUsage()).data,
    staleTime: 30_000,
    retry: false,
  })
}

/**
 * Start Checkout and leave for Stripe.
 *
 * A mutation, never retried: a second attempt after an ambiguous failure could
 * open a second Checkout session for the same tenant. Nothing is invalidated on
 * success because the user leaves the page; the webhook, not this client,
 * updates the subscription, and the return visit refetches.
 */
export function useCheckoutMutation() {
  return useMutation({
    mutationFn: async (plan: BillingPurchasablePlan) =>
      (await billingService.createCheckoutSession(plan)).data,
    retry: false,
    onSuccess: ({ url }) => redirectToExternalUrl(url),
  })
}

/** Open the Stripe Customer Portal. Same no-retry and redirect rules as checkout. */
export function usePortalMutation() {
  return useMutation({
    mutationFn: async () => (await billingService.createPortalSession()).data,
    retry: false,
    onSuccess: ({ url }) => redirectToExternalUrl(url),
  })
}
