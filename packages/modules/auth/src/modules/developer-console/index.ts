export * from './screens/DeveloperApiKeysScreen'
export * from './screens/WebhooksScreen'


import { developerConsoleDictionaries, registerDictionary } from './i18n/registry'

registerDictionary(developerConsoleDictionaries as any)
