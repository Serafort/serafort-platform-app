export * from './screens'
export * from './hooks'
export * from './routes/routes'
export { default as PasswordlessPath } from './screens/path'

import { passwordlessServiceDictionaries, registerDictionary } from './i18n/registry'

registerDictionary(passwordlessServiceDictionaries as any)
