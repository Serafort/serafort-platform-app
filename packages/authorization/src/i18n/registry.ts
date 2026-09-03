/**
 * I18n Registry for Authorization Module
 *
 * Registers module-specific dictionaries and re-exports canonical
 * i18n functions from @cap/platform-core.
 */

import { registerDictionary } from "@cap/platform-core";
import en from "../data/dictionaries/en.json";
import fr from "../data/dictionaries/fr.json";
import ar from "../data/dictionaries/ar.json";

export const authorizationDictionaries = {
  en,
  fr,
  ar,
};

// Register Authorization dictionaries in the framework-wide i18n registry
registerDictionary(authorizationDictionaries as any);

export {
  registerDictionary,
  getMergedDictionary,
  getAvailableLocales,
  type DictionaryMap,
  i18n,
  type Locale,
} from "@cap/platform-core";
