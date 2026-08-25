export * from './screens'
export { default as PlatformClusterPath } from './screens/path'
export * from './types'
export * from './services/api-explorer.service'
export { default as apiExplorerService } from './services/api-explorer.service'

import { platformClusterDictionaries, registerDictionary } from './i18n/registry'

registerDictionary(platformClusterDictionaries as any)
