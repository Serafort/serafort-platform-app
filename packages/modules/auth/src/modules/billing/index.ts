export { default as BillingPath } from './screens/path'
export * from './types'
export * from './services'
export * from './hooks'
export * from './utils/redirect'

import { billingDictionaries, registerDictionary } from './i18n/registry'

registerDictionary(billingDictionaries as any)
