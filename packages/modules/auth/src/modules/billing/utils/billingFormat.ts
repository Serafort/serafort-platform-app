import type { BillingErrorCode } from '../types/billing.types'
import { getBillingErrorCode, getBillingErrorStatus } from '../services/billing.service'
import { UnsafeRedirectError } from './redirect'

/** Locale-aware medium date, or null for a missing or unparseable value. */
export function formatBillingDate(value: string | null | undefined, locale: string): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)
}

export function formatBillingNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value)
}

export interface BillingErrorMessage {
  key: string
  defaultValue: string
  /** The code the screen may branch on, e.g. to offer the portal instead. */
  code: BillingErrorCode | 'unsafe_redirect' | 'forbidden' | 'unknown'
}

const DEFAULTS: Record<BillingErrorMessage['code'], string> = {
  already_subscribed:
    'This organization already has a subscription. Use Manage billing to change or cancel it.',
  billing_not_configured:
    'Billing is not set up for this environment yet. Contact your platform administrator.',
  forbidden: 'Only organization admins can start a purchase or open billing.',
  no_stripe_customer: 'There is no billing account yet. Upgrade to a paid plan to create one.',
  plan_not_purchasable:
    'That plan cannot be purchased online. Choose another plan or contact sales.',
  tenant_required: 'Something went wrong while contacting billing. Please try again.',
  unsafe_redirect:
    'The billing page returned an unexpected address, so we did not open it. Please try again.',
  unknown: 'Something went wrong while contacting billing. Please try again.',
}

/**
 * Map a failed checkout/portal call to a friendly, translatable message.
 *
 * Only the documented codes are mapped; the server's own `message` text is never
 * displayed, so a leaked internal string cannot reach the user.
 */
export function describeBillingError(error: unknown): BillingErrorMessage {
  if (error instanceof UnsafeRedirectError) {
    return toMessage('unsafe_redirect')
  }
  const code = getBillingErrorCode(error)
  if (code && code !== 'tenant_required') return toMessage(code)
  if (getBillingErrorStatus(error) === 403) return toMessage('forbidden')
  return toMessage('unknown')
}

function toMessage(code: BillingErrorMessage['code']): BillingErrorMessage {
  const suffix = code === 'tenant_required' ? 'unknown' : code
  return { key: `billing.errors.${suffix}`, defaultValue: DEFAULTS[code], code }
}
