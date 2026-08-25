export * from './screens'
export { default as PasswordlessPath } from './screens/path'


import { passwordlessServiceDictionaries, registerDictionary } from './i18n/registry'

registerDictionary(passwordlessServiceDictionaries as any)