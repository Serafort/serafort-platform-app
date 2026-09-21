/**
 * Hand-off to Stripe-hosted pages (Checkout, Customer Portal).
 *
 * The URL comes out of an API response, so it is treated as untrusted: only an
 * absolute `https:` URL with no embedded credentials is followed. That rules out
 * `javascript:`/`data:` payloads and relative URLs.
 *
 * The URL is never logged. Stripe session URLs are bearer-like -- anyone holding
 * one can act on the session -- so it does not go to the console, an error
 * message or analytics.
 */
export function isSafeRedirectUrl(candidate: unknown): candidate is string {
  if (typeof candidate !== 'string' || candidate.length === 0) return false
  let parsed: URL
  try {
    parsed = new URL(candidate)
  } catch {
    return false
  }
  return parsed.protocol === 'https:' && parsed.username === '' && parsed.password === ''
}

export class UnsafeRedirectError extends Error {
  readonly code = 'unsafe_redirect'
  constructor() {
    // Deliberately carries no URL.
    super('Refused to follow an unsafe billing redirect.')
    this.name = 'UnsafeRedirectError'
  }
}

/** Throws `UnsafeRedirectError` for anything that is not a safe https URL. */
export function assertSafeRedirectUrl(url: unknown): string {
  if (!isSafeRedirectUrl(url)) throw new UnsafeRedirectError()
  return url
}

/** Full-page navigation to a validated external URL. */
export function redirectToExternalUrl(url: string): void {
  window.location.assign(assertSafeRedirectUrl(url))
}
