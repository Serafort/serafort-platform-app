import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  assertSafeRedirectUrl,
  isSafeRedirectUrl,
  redirectToExternalUrl,
  UnsafeRedirectError,
} from './redirect'

describe('isSafeRedirectUrl', () => {
  it('accepts an absolute https URL', () => {
    expect(isSafeRedirectUrl('https://checkout.stripe.com/c/pay/cs_test_123')).toBe(true)
  })

  it.each([
    ['http', 'http://checkout.stripe.com/x'],
    ['javascript', 'javascript:alert(1)'],
    ['data', 'data:text/html,hello'],
    ['protocol-relative', '//evil.example/x'],
    ['relative', '/dashboard/billing'],
    ['embedded credentials', 'https://user:pass@evil.example/x'],
    ['empty', ''],
    ['garbage', 'not a url'],
  ])('rejects %s', (_label, value) => {
    expect(isSafeRedirectUrl(value)).toBe(false)
  })

  it('rejects non-strings', () => {
    expect(isSafeRedirectUrl(undefined)).toBe(false)
    expect(isSafeRedirectUrl(null)).toBe(false)
    expect(isSafeRedirectUrl({ url: 'https://x.example' })).toBe(false)
  })
})

describe('assertSafeRedirectUrl', () => {
  it('throws an error that does not echo the URL', () => {
    const secret = 'http://evil.example/?token=super-secret'
    let thrown: unknown
    try {
      assertSafeRedirectUrl(secret)
    } catch (error) {
      thrown = error
    }
    expect(thrown).toBeInstanceOf(UnsafeRedirectError)
    expect((thrown as Error).message).not.toContain('super-secret')
  })
})

describe('redirectToExternalUrl', () => {
  const original = window.location

  afterEach(() => {
    Object.defineProperty(window, 'location', { value: original, writable: true })
  })

  it('navigates with window.location.assign for a safe URL', () => {
    const assign = vi.fn()
    Object.defineProperty(window, 'location', { value: { assign }, writable: true })

    redirectToExternalUrl('https://billing.stripe.com/p/session/abc')

    expect(assign).toHaveBeenCalledWith('https://billing.stripe.com/p/session/abc')
  })

  it('never navigates for an unsafe URL', () => {
    const assign = vi.fn()
    Object.defineProperty(window, 'location', { value: { assign }, writable: true })

    expect(() => redirectToExternalUrl('javascript:alert(1)')).toThrow(UnsafeRedirectError)
    expect(assign).not.toHaveBeenCalled()
  })
})
