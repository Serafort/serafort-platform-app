export * from './hooks'
export * from './screens'
export { default as IdentityBrokerPath } from './screens/path'

import { identityBrokerDictionaries, registerDictionary } from './i18n/registry'

registerDictionary(identityBrokerDictionaries as any)