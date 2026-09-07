import type { Direction } from '../layout'

export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'fr', 'ar'],
  langDirection: {
    en: 'ltr',
    fr: 'ltr',
    ar: 'rtl',
  },
} as const

export type Locale = (typeof i18n)['locales'][number]

/**
 * Resolve the writing direction for a locale.
 *
 * `langDirection` above is the single source of truth for LTR/RTL parity.
 * Unknown or not-yet-registered locales fall back to 'ltr' rather than
 * throwing, so adding a locale to `locales` without a direction entry
 * degrades gracefully instead of breaking the shell.
 */
export function getLangDirection(locale: string | undefined | null): Direction {
  if (!locale) return 'ltr'
  // Accept regional tags ('ar-EG' -> 'ar') as well as bare locale codes.
  const base = String(locale).split('-')[0]
  const map = i18n.langDirection as Record<string, Direction>
  return map[locale as string] ?? map[base] ?? 'ltr'
}
