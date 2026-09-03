import React from 'react'
import { getMergedDictionary, type Locale } from '@cap/platform-core'

const dictionaries = {
  en: () => import('../data/dictionaries/en.json').then((module) => module.default),
  fr: () => import('../data/dictionaries/fr.json').then((module) => module.default),
  ar: () => import('../data/dictionaries/ar.json').then((module) => module.default),
}

function deepMerge(target: any, source: any): any {
  const output = { ...target }
  if (target && typeof target === 'object' && source && typeof source === 'object') {
    Object.keys(source).forEach((key) => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] })
        } else {
          output[key] = deepMerge(target[key], source[key])
        }
      } else {
        Object.assign(output, { [key]: source[key] })
      }
    })
  }
  return output
}

/**
 * Hook to load translations
 * Uses local dictionary files combined with module-registered dictionaries
 */
export const useLang = (code?: Locale): Record<string, string | object> => {
  const [lang, setLang] = React.useState<Record<string, string | object>>({})

  React.useEffect(() => {
    const fetchLang = async () => {
      try {
        const locale = code || 'en'
        const dictionary = await getDictionary(locale as Locale)
        setLang(dictionary)
      } catch {
        console.warn(`Translation file for ${code} not available, using fallback`)
        setLang({})
      }
    }

    fetchLang()
  }, [code])

  return lang
}

/**
 * Get dictionary by locale
 * Merges shell dictionary with module-registered i18n dictionaries
 */
export const getDictionary = async (locale: Locale) => {
  let baseDict = {}
  try {
    baseDict = await dictionaries[locale]()
  } catch {
    console.warn(`Dictionary for locale ${locale} not found, falling back to en`)
    baseDict = await dictionaries.en()
  }

  const moduleDict = getMergedDictionary(locale)
  return deepMerge(baseDict, moduleDict)
}
