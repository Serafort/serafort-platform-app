export * from './components'
export * from './screens'
export * from './middlewares'
export * from './hooks'
export * from './services'
export * from './types'

import { sessionManagerDictionaries, registerDictionary } from './i18n/registry'

registerDictionary(sessionManagerDictionaries as any)
