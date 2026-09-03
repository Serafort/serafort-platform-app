/// <reference types="vite/client" />
import './types/pwa.d.ts'
import './types/mui.d.ts'

export * from '@cap/platform-store'
export { AdaptiveLogo, Alert, Copyright } from '@cap/theme'

export { default as defaultCoreTheme } from './theme'
export type { Settings } from '@cap/shared-types'
export * from './types'
export * from './services'
export * from './i18n/i18n'
export * from './i18n/registry'
export { themeConfig } from '@cap/theme'

export * from './utils'
export * from './assembly'
export { default as useObjectCookie } from './hooks/useObjectCookie'
export * from './hooks/usePermissions'
export * from './contexts/tenantContext'
export * from './contexts/LayoutEngineContext'
export * from './hooks/useDynamicTheme'
export * from './hooks/useNetworkSync'
export * from './hooks/useAuth'
export * from './hooks/useNavigation'
// Container-size / widget-registry primitives now live in @cap/theme (a lower tier)
// so @cap/theme's widget components no longer need to import up into @cap/platform-core.
// Re-exported here to keep @cap/platform-core's public surface unchanged.
export {
  useResizeObserver,
  useContainerQuery,
  ContainerSizeContext,
  ContainerSizeProvider,
  useContainerSize,
  useContainerSizeClass,
  observeElement,
  unobserveElement,
  globalWidgetRegistry,
  registerModuleWidgets,
} from '@cap/theme'
export type {
  ResizeBoxSizing,
  ObserveOptions,
  ContainerSize,
  ContainerBreakpoints,
  ElementSize,
  UseResizeObserverOptions,
  ContainerSizeProviderProps,
  WidgetDescriptor,
  RegisterModuleWidgetsOptions,
} from '@cap/theme'
export * from './components'

export * from './registry/PluginRegistry'
export * from './authorization/bootstrap'
