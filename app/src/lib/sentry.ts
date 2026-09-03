/**
 * Frontend error monitoring.
 *
 * Thin wrapper around `@sentry/react`. Everything here is a no-op unless
 * `VITE_SENTRY_DSN` is set at build time, so local/dev builds and any
 * deployment that has not configured a DSN ship with monitoring inert and
 * make zero network calls.
 *
 * Wire-up: `initSentry()` is called once from `main.tsx` before React renders.
 * React render errors are swallowed by error boundaries and never reach the
 * global handlers, so `ErrorBoundary` (in `@cap/theme`) forwards them here via
 * the `window.__SENTRY_CAPTURE__` bridge that `initSentry()` installs.
 */
import * as Sentry from '@sentry/react'

declare global {
  interface Window {
    /**
     * Installed by `initSentry()` when a DSN is configured. `ErrorBoundary`
     * calls this so component render errors are reported despite being caught.
     */
    __SENTRY_CAPTURE__?: (error: unknown, context?: Record<string, unknown>) => void
  }
}

let initialized = false

const readDsn = (): string => (import.meta.env.VITE_SENTRY_DSN ?? '').trim()

const readSampleRate = (key: string, fallback: number): number => {
  const raw = import.meta.env[key]
  const parsed = raw != null ? Number(raw) : NaN
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : fallback
}

/**
 * Initialise Sentry. Safe to call more than once; only the first call with a
 * configured DSN takes effect.
 */
export const initSentry = (): void => {
  if (initialized) return

  const dsn = readDsn()
  if (!dsn) return

  Sentry.init({
    dsn,
    environment:
      (import.meta.env.VITE_SENTRY_ENVIRONMENT ?? import.meta.env.MODE ?? 'production').trim(),
    release: import.meta.env.VITE_APP_VERSION,
    // Performance tracing — keep low in production to control quota/cost.
    tracesSampleRate: readSampleRate('VITE_SENTRY_TRACES_SAMPLE_RATE', 0.1),
    // Do not attach PII (IP address, cookies, request bodies) by default.
    sendDefaultPii: false,
  })

  window.__SENTRY_CAPTURE__ = (error, context) => {
    Sentry.captureException(error, context ? { extra: context } : undefined)
  }

  initialized = true
}

/**
 * Report a handled error. No-op unless Sentry has been initialised with a DSN.
 */
export const captureError = (error: unknown, context?: Record<string, unknown>): void => {
  if (!initialized) return
  Sentry.captureException(error, context ? { extra: context } : undefined)
}
