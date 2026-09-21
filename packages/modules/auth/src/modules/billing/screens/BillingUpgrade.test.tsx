import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const { canManage, redirect, service } = vi.hoisted(() => ({
  canManage: { value: true },
  redirect: vi.fn(),
  service: {
    getEntitlements: vi.fn(),
    getPlans: vi.fn(),
    getUsage: vi.fn(),
    createCheckoutSession: vi.fn(),
    createPortalSession: vi.fn(),
  },
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: unknown, opts?: Record<string, string>) => {
      const template = typeof fallback === 'string' ? fallback : key
      const values = (typeof fallback === 'object' ? fallback : opts) as Record<string, string>
      return template.replace(/{{(\w+)}}/g, (_m, k) => values?.[k] ?? '')
    },
    i18n: { language: 'en' },
  }),
}))
vi.mock('@cap/authorization', () => ({ useCan: () => canManage.value }))
vi.mock('../services/billing.service', async (importOriginal) => {
  const actual: any = await importOriginal()
  return { ...actual, default: service }
})
vi.mock('../utils/redirect', async (importOriginal) => {
  const actual: any = await importOriginal()
  return { ...actual, redirectToExternalUrl: redirect }
})

import BillingUpgrade from './BillingUpgrade'
import { pickRecommendedPlan } from '../utils/recommendPlan'

const off = {
  allow_scim: false,
  allow_saml_sso: false,
  allow_jit: false,
  allow_audit_anchoring: false,
}

const plans = [
  {
    key: 'free',
    name: 'Free',
    sort_order: 1,
    features: off,
    limits: { max_mau: 100, max_m2m_tokens: 0, max_sms: 0 },
  },
  {
    key: 'pro',
    name: 'Pro',
    sort_order: 2,
    features: { ...off, allow_saml_sso: true, allow_scim: true },
    limits: { max_mau: 10000, max_m2m_tokens: 5000, max_sms: 500 },
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    sort_order: 3,
    features: {
      allow_scim: true,
      allow_saml_sso: true,
      allow_jit: true,
      allow_audit_anchoring: true,
    },
    limits: { max_mau: null, max_m2m_tokens: null, max_sms: null },
  },
]

const entitlements = {
  plan: 'free',
  plan_name: 'Free',
  status: 'none',
  downgraded: false,
  features: off,
  limits: plans[0].limits,
  grace_ends_at: null,
  current_period_end: null,
  cancel_at_period_end: false,
}

const respond = (data: unknown) => Promise.resolve({ data, status: 200, ok: true })
const failure = (status: number, code: string) =>
  Object.assign(new Error('server said something internal'), {
    status,
    response: { data: { error: code, message: 'internal detail' } },
  })

function renderScreen(search = '') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[`/dashboard/billing/upgrade${search}`]}>
        <BillingUpgrade />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('BillingUpgrade', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    canManage.value = true
    service.getPlans.mockReturnValue(respond({ plans }))
    service.getEntitlements.mockReturnValue(respond(entitlements))
  })

  it('renders every active plan with its features and limits', async () => {
    renderScreen()

    for (const key of ['free', 'pro', 'enterprise']) {
      expect(await screen.findByTestId(`plan-card-${key}`)).toBeInTheDocument()
    }
    const pro = screen.getByTestId('plan-card-pro')
    expect(pro.querySelector('[data-feature="allow_saml_sso"]')).toHaveAttribute(
      'data-included',
      'true',
    )
    expect(pro.querySelector('[data-feature="allow_jit"]')).toHaveAttribute(
      'data-included',
      'false',
    )
    expect(screen.getByTestId('plan-card-enterprise')).toHaveTextContent('Unlimited')
  })

  it('marks the current plan and offers no purchase for it', async () => {
    renderScreen()

    const free = await screen.findByTestId('plan-card-free')
    expect(free).toHaveAttribute('data-current', 'true')
    expect(screen.getByTestId('plan-card-pro')).toHaveAttribute('data-current', 'false')
    expect(screen.queryByRole('button', { name: /upgrade to free/i })).not.toBeInTheDocument()
  })

  it('highlights the plan named by ?required_plan and explains the feature', async () => {
    renderScreen('?feature=allow_jit&required_plan=enterprise')

    const enterprise = await screen.findByTestId('plan-card-enterprise')
    expect(enterprise).toHaveAttribute('data-recommended', 'true')
    expect(screen.getByTestId('plan-card-pro')).toHaveAttribute('data-recommended', 'false')
    expect(screen.getByTestId('feature-required-banner')).toHaveTextContent(
      /just-in-time provisioning.*enterprise/i,
    )
  })

  it('falls back to the cheapest plan that unlocks ?feature', async () => {
    renderScreen('?feature=allow_saml_sso')

    expect(await screen.findByTestId('plan-card-pro')).toHaveAttribute('data-recommended', 'true')
  })

  it('ignores unknown query values instead of rendering them', async () => {
    renderScreen('?feature=<script>&required_plan=platinum')

    await screen.findByTestId('plan-card-pro')
    expect(screen.queryByTestId('feature-required-banner')).not.toBeInTheDocument()
    expect(screen.getByTestId('plan-card-pro')).toHaveAttribute('data-recommended', 'false')
  })

  it('starts checkout for the chosen plan and redirects to the returned https URL', async () => {
    service.createCheckoutSession.mockReturnValue(
      respond({ url: 'https://checkout.stripe.com/c/pay/1' }),
    )

    renderScreen()
    fireEvent.click(await screen.findByRole('button', { name: /upgrade to pro/i }))

    await waitFor(() => expect(service.createCheckoutSession).toHaveBeenCalled())
    expect(service.createCheckoutSession.mock.calls[0][0]).toBe('pro')
    await waitFor(() =>
      expect(redirect).toHaveBeenCalledWith('https://checkout.stripe.com/c/pay/1'),
    )
  })

  it('disables purchase for a non-admin', async () => {
    canManage.value = false

    renderScreen()

    expect(await screen.findByRole('button', { name: /upgrade to pro/i })).toBeDisabled()
    expect(screen.getByText(/only organization admins/i)).toBeInTheDocument()
  })

  it.each([
    [503, 'billing_not_configured', /not set up/i],
    [400, 'plan_not_purchasable', /cannot be purchased online/i],
    [409, 'already_subscribed', /already has a subscription/i],
  ])('shows a friendly message for %s %s', async (status, code, message) => {
    service.createCheckoutSession.mockRejectedValue(failure(status, code))

    renderScreen()
    fireEvent.click(await screen.findByRole('button', { name: /upgrade to pro/i }))

    const alert = await screen.findByTestId('billing-error')
    expect(alert).toHaveTextContent(message)
    // The server's own message text is never shown.
    expect(alert).not.toHaveTextContent('internal detail')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('offers the portal when the organization is already subscribed', async () => {
    service.createCheckoutSession.mockRejectedValue(failure(409, 'already_subscribed'))
    service.createPortalSession.mockReturnValue(respond({ url: 'https://billing.stripe.com/p/1' }))

    renderScreen()
    fireEvent.click(await screen.findByRole('button', { name: /upgrade to pro/i }))
    fireEvent.click(await screen.findByRole('button', { name: /manage billing/i }))

    await waitFor(() => expect(redirect).toHaveBeenCalledWith('https://billing.stripe.com/p/1'))
  })

  it('does not follow an http URL from the checkout response', async () => {
    // The real service rejects it; simulate that boundary check.
    service.createCheckoutSession.mockRejectedValue(
      Object.assign(new Error('Refused'), { name: 'UnsafeRedirectError', code: 'unsafe_redirect' }),
    )

    renderScreen()
    fireEvent.click(await screen.findByRole('button', { name: /upgrade to pro/i }))

    await screen.findByTestId('billing-error')
    expect(redirect).not.toHaveBeenCalled()
  })
})

describe('pickRecommendedPlan', () => {
  const typed = plans as any

  it('prefers the explicit required plan when it exists', () => {
    expect(pickRecommendedPlan(typed, 'free', 'allow_saml_sso', 'enterprise')).toBe('enterprise')
  })

  it('ignores a required plan the catalogue does not offer', () => {
    expect(pickRecommendedPlan(typed.slice(0, 2), 'free', null, 'enterprise')).toBeNull()
  })

  it('never recommends a plan at or below the current one', () => {
    expect(pickRecommendedPlan(typed, 'pro', 'allow_scim', null)).toBe('enterprise')
    expect(pickRecommendedPlan(typed, 'enterprise', 'allow_scim', null)).toBeNull()
  })

  it('recommends nothing without a feature or plan', () => {
    expect(pickRecommendedPlan(typed, 'free', null, null)).toBeNull()
  })
})
