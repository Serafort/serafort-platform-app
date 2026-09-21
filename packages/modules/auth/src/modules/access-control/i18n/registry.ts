/**
 * I18n registry for the access-control module.
 *
 * Registers the module's dictionaries and re-exports the canonical i18n
 * functions from @cap/platform-core.
 */

import { registerDictionary } from '@cap/platform-core'
import en from '../data/dictionaries/en.json'
import fr from '../data/dictionaries/fr.json'
import ar from '../data/dictionaries/ar.json'

export const accessControlDictionaries = {
  en,
  fr,
  ar,
}

registerDictionary(accessControlDictionaries as any)

export {
  registerDictionary,
  getMergedDictionary,
  getAvailableLocales,
  type DictionaryMap,
  i18n,
  type Locale,
} from '@cap/platform-core'
