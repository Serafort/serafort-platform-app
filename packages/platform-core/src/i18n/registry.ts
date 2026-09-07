// Re-export only. The dictionary registry now lives in @cap/shared-types (Tier 0).
// Keeping this shim preserves the `@cap/platform-core` public surface that feature
// modules already import, while the single registry singleton lives in Tier 0.
export {
  registerDictionary,
  getMergedDictionary,
  getAvailableLocales,
  type DictionaryMap,
} from '@cap/shared-types'
