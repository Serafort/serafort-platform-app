import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@cap/platform-core'
import billingService, { getBillingErrorCode, getBillingErrorStatus } from './billing.service'
import { UnsafeRedirectError } from '../utils/redirect'

vi.mock('@cap/platform-core', async () => {
  const actual = await vi.importActual('@cap/platform-core')
  return {
    ...actual,
    apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  }
})

const ok = (data: unknown) => ({
  data,
  status: 200,
  statusText: 'OK',
  ok: true,
  headers: new Headers(),
  config: {} as any,
})

const features = {
  allow_scim: false,
  allow_saml_sso: false,
  allow_jit: true,
  allow_audit_anchoring: false,
}
const limits = { max_mau: 1000, max_m2m_tokens: null, max_sms: 0 }

const entitlements = {
  plan: 'free',
  plan_name: 'Free',
  status: 'none',
  downgraded: false,
  features,
  limits,
  grace_ends_at: null,
  current_period_end: null,
  cancel_at_period_end: false,
}

describe('billingService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reads entitlements from the registry endpoint and returns the flat payload', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(ok(entitlements))

    const response = await billingService.getEntitlements()

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/billing/entitlements')
    expect(response.data.plan).toBe('free')
    expect(response.data.limits.max_m2m_tokens).toBeNull()
  })

  it('reads plans and usage from their registry endpoints', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(
      ok({ plans: [{ key: 'pro', name: 'Pro', sort_order: 2, features, limits }] }),
    )
    await billingService.getPlans()
    expect(apiClient.get).toHaveBeenLastCalledWith('/api/v1/billing/plans')

    const metric = { used: 1, limit: 10, percent: 10 }
    vi.mocked(apiClient.get).mockResolvedValueOnce(
      ok({
        plan: 'free',
        period_start: '2026-09-01',
        period_end: '2026-09-30',
        usage: { mau: metric, m2m: metric, sms: metric },
      }),
    )
    const usage = await billingService.getUsage()
    expect(apiClient.get).toHaveBeenLastCalledWith('/api/v1/billing/usage')
    expect(usage.data.usage.mau.percent).toBe(10)
  })

  it('rejects a response that drifted from the contract', async () => {
    // A plan key the UI has no copy for must fail at the boundary, not render blank.
    vi.mocked(apiClient.get).mockResolvedValueOnce(ok({ ...entitlements, plan: 'platinum' }))

    await expect(billingService.getEntitlements()).rejects.toThrow()
  })

  it('posts the plan to checkout and silences the generic toast', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce(ok({ url: 'https://checkout.stripe.com/c/1' }))

    const response = await billingService.createCheckoutSession('pro')

    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/v1/billing/checkout',
      { plan: 'pro' },
      { skipGlobalNotification: true },
    )
    expect(response.data.url).toBe('https://checkout.stripe.com/c/1')
  })

  it('opens the portal', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce(ok({ url: 'https://billing.stripe.com/p/1' }))

    const response = await billingService.createPortalSession()

    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/billing/portal', undefined, {
      skipGlobalNotification: true,
    })
    expect(response.data.url).toBe('https://billing.stripe.com/p/1')
  })

  it('refuses a non-https checkout URL', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce(ok({ url: 'http://evil.example/pay' }))

    await expect(billingService.createCheckoutSession('pro')).rejects.toBeInstanceOf(
      UnsafeRedirectError,
    )
  })

  it('refuses a javascript: portal URL', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce(ok({ url: 'javascript:alert(1)' }))

    await expect(billingService.createPortalSession()).rejects.toBeInstanceOf(UnsafeRedirectError)
  })
})

describe('getBillingErrorCode', () => {
  it('reads a documented code from the response body', () => {
    expect(getBillingErrorCode({ response: { data: { error: 'already_subscribed' } } })).toBe(
      'already_subscribed',
    )
  })

  it('ignores codes the backend does not document', () => {
    expect(getBillingErrorCode({ response: { data: { error: '<img onerror=x>' } } })).toBeNull()
    expect(getBillingErrorCode(null)).toBeNull()
    expect(getBillingErrorCode(new Error('boom'))).toBeNull()
  })

  it('reads the status', () => {
    expect(getBillingErrorStatus({ status: 503 })).toBe(503)
    expect(getBillingErrorStatus({ status: 0 })).toBeNull()
    expect(getBillingErrorStatus(undefined)).toBeNull()
  })
})
