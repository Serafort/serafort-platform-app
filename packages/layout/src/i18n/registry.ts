/**
 * I18n Registry for Layout Module
 *
 * Registers module-specific dictionaries and re-exports canonical
 * i18n functions from @cap/shared-types (Tier 0).
 */

import { registerDictionary } from '@cap/shared-types'
import en from '../data/dictionaries/en.json'
import fr from '../data/dictionaries/fr.json'
import ar from '../data/dictionaries/ar.json'

export const layoutDictionaries = {
  en,
  fr,
  ar,
}

// Register Layout dictionaries in the framework-wide i18n registry
registerDictionary(layoutDictionaries as any)

export {
  registerDictionary,
  getMergedDictionary,
  getAvailableLocales,
  type DictionaryMap,
  i18n,
  type Locale,
} from '@cap/shared-types'
