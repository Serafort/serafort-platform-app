export * from './screens'
export { default as PlatformClusterPath } from './screens/path'
export * from './types'
export * from './services'
export * from './hooks'

import { platformClusterDictionaries, registerDictionary } from './i18n/registry'

registerDictionary(platformClusterDictionaries as any)
