// Shared hooks index file
export * from './useApi'
export * from './useDebounce'
export * from './useSSE'
export { default as usePersistentForm } from './usePersistentForm'
export {
  useRouteState,
  useHasRouteState,
  useClearAllRouteStates,
  useRestoreRouteState,
} from './useRouteState'
export { default as useTabSync } from './useTabSync'
export { default as useDeduplicatedRequest } from './useDeduplicatedRequest'
export { default as useOptimisticUpdate } from './useOptimisticUpdate'
export { useActionLock, useActionLock as default, type UseActionLockOptions, type UseActionLockLegacyReturn } from './useActionLock'


