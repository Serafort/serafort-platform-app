// NOTE: Screen components are route-loaded lazily via ./routes/routes.tsx
// (React.lazy). Re-exporting them here creates a static import edge that pulls
// them back into the eager `module-auth-core` chunk and defeats the code-split.
export * from './hooks/useDeveloperConsoleQuery'

import { developerConsoleDictionaries, registerDictionary } from './i18n/registry'

registerDictionary(developerConsoleDictionaries as any)
