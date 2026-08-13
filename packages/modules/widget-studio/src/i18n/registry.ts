import { widgetStudioEn } from './locales/en'
import { widgetStudioFr } from './locales/fr'
import { widgetStudioAr } from './locales/ar'

export type Locale = 'en' | 'fr' | 'ar'

export const widgetStudioDictionaries: Record<Locale, typeof widgetStudioEn> = {
  en: widgetStudioEn,
  fr: widgetStudioFr,
  ar: widgetStudioAr,
}

export function getMergedDictionary(locale: Locale): typeof widgetStudioEn {
  return widgetStudioDictionaries[locale] ?? widgetStudioDictionaries.en
}

export const i18n = widgetStudioDictionaries
