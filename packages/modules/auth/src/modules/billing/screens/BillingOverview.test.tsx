import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react'
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

import BillingOverview from './BillingOverview'

const features = {
  allow_scim: false,
  allow_saml_sso: true,
  allow_jit: false,
  allow_audit_anchoring: false,
}
const limits = { max_mau: 1000, max_m2m_tokens: null, max_sms: 0 }

const entitlements = (overrides: Record<string, unknown> = {}) => ({
  plan: 'pro',
  plan_name: 'Pro',
  status: 'active',
  downgraded: false,
  features,
  limits,
  grace_ends_at: null,
  current_period_end: null,
  cancel_at_period_end: false,
  ...overrides,
})

const usage = (mau: { used: number; limit: number | null; percent: number | null }) => ({
  plan: 'pro',
  period_start: '2026-09-01',
  period_end: '2026-09-30',
  usage: {
    mau,
    m2m: { used: 12, limit: null, percent: null },
    sms: { used: 0, limit: 0, percent: null },
  },
})

const respond = (data: unknown) => Promise.resolve({ data, status: 200, ok: true })

function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <BillingOverview />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('BillingOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    canManage.value = true
    service.getEntitlements.mockReturnValue(respond(entitlements()))
    service.getUsage.mockReturnValue(respond(usage({ used: 100, limit: 1000, percent: 10 })))
  })

  it('shows the current plan and an active status chip', async () => {
    renderScreen()

    expect(await screen.findByTestId('current-plan-name')).toHaveTextContent('Pro')
    expect(screen.getByTestId('plan-status-chip')).toHaveTextContent('Active')
    expect(screen.queryByTestId('past-due-banner')).not.toBeInTheDocument()
  })

  it('shows a past-due banner that names the grace date', async () => {
    service.getEntitlements.mockReturnValue(
      respond(entitlements({ status: 'past_due', grace_ends_at: '2026-10-05T00:00:00.000Z' })),
    )

    renderScreen()

    const banner = await screen.findByTestId('past-due-banner')
    expect(banner).toHaveTextContent(/payment failed/i)
    expect(banner).toHaveTextContent(/2026/)
    expect(screen.getByTestId('plan-status-chip')).toHaveTextContent('Payment past due')
  })

  it('still warns about past-due when there is no grace date', async () => {
    service.getEntitlements.mockReturnValue(respond(entitlements({ status: 'past_due' })))

    renderScreen()

    expect(await screen.findByTestId('past-due-banner')).toHaveTextContent(/payment failed/i)
  })

  it.each([
    ['below 80%', { used: 790, limit: 1000, percent: 79 }, 'ok'],
    ['at 80%', { used: 800, limit: 1000, percent: 80 }, 'warning'],
    ['at 100%', { used: 1000, limit: 1000, percent: 100 }, 'error'],
    ['over 100%', { used: 1200, limit: 1000, percent: 120 }, 'error'],
  ])('colours the meter for usage %s', async (_label, mau, severity) => {
    service.getUsage.mockReturnValue(respond(usage(mau)))

    renderScreen()

    const meters = await screen.findAllByTestId('usage-meter')
    expect(meters[0]).toHaveAttribute('data-severity', severity)
    expect(within(meters[0]).getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      String(Math.min(100, mau.percent)),
    )
  })

  it('draws no bar for an unlimited or excluded metric', async () => {
    renderScreen()

    const meters = await screen.findAllByTestId('usage-meter')
    expect(meters[1]).toHaveAttribute('data-severity', 'unlimited')
    expect(within(meters[1]).queryByRole('progressbar')).not.toBeInTheDocument()
    expect(meters[2]).toHaveAttribute('data-severity', 'excluded')
    expect(within(meters[2]).queryByRole('progressbar')).not.toBeInTheDocument()
    expect(within(meters[2]).getByText('Not included')).toBeInTheDocument()
  })

  it('lets an admin open the billing portal', async () => {
    service.createPortalSession.mockReturnValue(respond({ url: 'https://billing.stripe.com/p/1' }))

    renderScreen()
    await screen.findByTestId('current-plan-name')
    fireEvent.click(screen.getByRole('button', { name: /manage billing/i }))

    await waitFor(() => expect(redirect).toHaveBeenCalledWith('https://billing.stripe.com/p/1'))
  })

  it('disables Manage billing for a non-admin', async () => {
    canManage.value = false

    renderScreen()
    await screen.findByTestId('current-plan-name')

    expect(screen.getByRole('button', { name: /manage billing/i })).toBeDisabled()
    expect(service.createPortalSession).not.toHaveBeenCalled()
  })

  it('explains a portal failure without showing the server message', async () => {
    service.createPortalSession.mockRejectedValue(
      Object.assign(new Error('stripe exploded: sk_live_secret'), {
        status: 409,
        response: { data: { error: 'no_stripe_customer', message: 'sk_live_secret' } },
      }),
    )

    renderScreen()
    await screen.findByTestId('current-plan-name')
    fireEvent.click(screen.getByRole('button', { name: /manage billing/i }))

    const alert = await screen.findByTestId('portal-error')
    expect(alert).toHaveTextContent(/no billing account yet/i)
    expect(alert).not.toHaveTextContent('sk_live_secret')
  })

  it('renders an error state with retry when entitlements fail to load', async () => {
    service.getEntitlements.mockRejectedValue(new Error('boom'))

    renderScreen()

    expect(await screen.findByRole('button', { name: /retry|try again/i })).toBeInTheDocument()
  })
})
