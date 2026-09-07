// Re-export only. The locale config now lives in @cap/shared-types (Tier 0) so
// that Tier 1/2 packages can consume it without importing this Tier 3 facade.
export { i18n, type Locale } from '@cap/shared-types'
