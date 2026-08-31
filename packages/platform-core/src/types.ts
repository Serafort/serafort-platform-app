/**
 * @cap/platform-core/types
 *
 * Clean entry point for importing types without triggering heavy runtime dependencies
 * (MUI, Zustand, TanStack Query, etc.). Use this for type-only imports in feature modules.
 */

export type * from '@cap/platform-store'
export type * from '@cap/shared-types'

// Export all types specific to platform-core
export * from './types/index'
export * from './services/tenantService'
export * from './hooks/usePermissions'
export * from './contexts/tenantContext'
export * from './registry/PluginRegistry'
