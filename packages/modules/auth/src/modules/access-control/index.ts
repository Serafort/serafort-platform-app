export * from './screens'
export { default as AccessControlPath } from './screens/path'
export * from './types'
export * from './services'
export * from './hooks'

import { accessControlDictionaries, registerDictionary } from './i18n/registry'

registerDictionary(accessControlDictionaries as any)
