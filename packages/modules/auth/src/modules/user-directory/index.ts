export * from './hooks'
export * from './screens'
export { default as UserDirectoryPath } from './screens/path'

import { userDirectoryDictionaries, registerDictionary } from './i18n/registry'

registerDictionary(userDirectoryDictionaries as any)
