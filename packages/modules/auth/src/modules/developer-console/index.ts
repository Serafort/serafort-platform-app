export * from './screens/DeveloperApiKeysScreen'
export * from './screens/WebhooksScreen'
export * from './hooks/useDeveloperConsoleQuery'

import { developerConsoleDictionaries, registerDictionary } from './i18n/registry'

registerDictionary(developerConsoleDictionaries as any)
