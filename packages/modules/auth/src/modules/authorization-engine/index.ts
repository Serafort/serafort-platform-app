export * from './hooks'
export { default as AdminRoute } from './middlewares/AdminRoute'
export * from './components'
export * from './screens'
export { default as AuthorizationEnginePath } from './screens/path'
export * from './services/adminService'
export * from './src/services/rbac.subscriber'
export * from './src/services/authorization.service'
export { authorizationEngineRouteConfig } from './routes/routes'

import { authorizationEngineDictionaries, registerDictionary } from './i18n/registry'

registerDictionary(authorizationEngineDictionaries as any)
