/**
 * I18n Registry for Landing Module
 *
 * Registers module-specific dictionaries and re-exports canonical
 * i18n functions from @cap/platform-core.
 */

import { registerDictionary } from '@cap/platform-core'
import en from '../data/dictionaries/en.json'
import fr from '../data/dictionaries/fr.json'
import ar from '../data/dictionaries/ar.json'

export const themeDictionaries = {
  en,
  fr,
  ar,
}

// Register landing dictionaries in the framework-wide i18n registry
registerDictionary(themeDictionaries as any)

export {
  registerDictionary,
  getMergedDictionary,
  getAvailableLocales,
  type DictionaryMap,
  i18n,
  type Locale,
} from '@cap/platform-core'
