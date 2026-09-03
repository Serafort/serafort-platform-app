import { Locale, i18n } from './i18n'

export type DictionaryMap = Record<Locale, Record<string, unknown>>

const _modules: DictionaryMap[] = []

export function registerDictionary(dict: DictionaryMap): void {
  _modules.push(dict)
}

export function getMergedDictionary(locale: Locale): Record<string, unknown> {
  return _modules.reduce((acc, mod) => deepMerge(acc, mod[locale] ?? {}), {} as Record<string, unknown>)
}

export function getAvailableLocales(): Locale[] {
  return [...i18n.locales]
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target }
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const val = source[key]
      if (
        val &&
        typeof val === 'object' &&
        !Array.isArray(val) &&
        !isDate(val)
      ) {
        result[key] = deepMerge(
          (result[key] as Record<string, unknown>) ?? {},
          val as Record<string, unknown>,
        )
      } else {
        result[key] = val
      }
    }
  }
  return result
}

function isDate(value: unknown): boolean {
  return value instanceof Date ||
    (typeof value === 'object' &&
     value !== null &&
     Object.prototype.toString.call(value) === '[object Date]')
}
