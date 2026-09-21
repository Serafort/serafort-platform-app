import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import type { FeatureNotEntitledPayload } from '@cap/platform-core'

const { navigate, toastWarning, capture } = vi.hoisted(() => ({
  navigate: vi.fn(),
  toastWarning: vi.fn(),
  capture: { handler: null as null | ((p: FeatureNotEntitledPayload) => void) },
}))

vi.mock('react-router-dom', () => ({ useNavigate: () => navigate }))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string, opts?: Record<string, string>) =>
      typeof fallback === 'string'
        ? fallback.replace(/{{(\w+)}}/g, (_m, k) => opts?.[k] ?? '')
        : _key,
  }),
}))
vi.mock('react-toastify', () => ({ toast: { warning: toastWarning } }))
vi.mock('@cap/platform-core', () => ({
  onEntitlementRequired: (handler: (p: FeatureNotEntitledPayload) => void) => {
    capture.handler = handler
    return () => {
      capture.handler = null
    }
  },
}))

import EntitlementListener from './EntitlementListener'
import { buildUpgradePath } from './utils/buildUpgradePath'

const payload: FeatureNotEntitledPayload = {
  error: 'feature_not_entitled',
  feature: 'allow_scim',
  required_plan: 'pro',
  upgrade_url: 'https://evil.example/steal',
}

describe('buildUpgradePath', () => {
  it('targets the in-app upgrade route and ignores the server-sent upgrade_url', () => {
    const path = buildUpgradePath(payload)
    expect(path).toBe('/dashboard/billing/upgrade?feature=allow_scim&required_plan=pro')
    expect(path).not.toContain('evil')
  })
})

describe('EntitlementListener', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    capture.handler = null
  })

  it('subscribes on mount and unsubscribes on unmount', () => {
    const { unmount } = render(<EntitlementListener />)
    expect(capture.handler).toBeTypeOf('function')
    unmount()
    expect(capture.handler).toBeNull()
  })

  it('raises one keyed toast whose action navigates to the upgrade route', () => {
    render(<EntitlementListener />)

    act(() => capture.handler?.(payload))

    expect(toastWarning).toHaveBeenCalledTimes(1)
    const [content, options] = toastWarning.mock.calls[0]
    // Keyed by feature so concurrent 402s collapse into one notice.
    expect(options.toastId).toBe('entitlement-allow_scim')

    const closeToast = vi.fn()
    render(content({ closeToast }))
    fireEvent.click(screen.getByRole('button', { name: 'View plans' }))

    expect(closeToast).toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledWith(
      '/dashboard/billing/upgrade?feature=allow_scim&required_plan=pro',
    )
  })
})
