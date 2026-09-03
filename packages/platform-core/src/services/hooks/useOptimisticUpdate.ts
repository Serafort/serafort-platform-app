/**
 * React Hooks for Optimistic UI Updates
 *
 * Provides easy-to-use hooks for implementing optimistic updates
 * in React components.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { HttpMethodEnum, OptimisticUpdateTypeEnum } from '@cap/shared-types'
import {
  HttpError,
  FetchResponse,
  fetchClient,
  optimisticUpdateManager,
  OptimisticUpdate,
  OptimisticUpdateType,
} from '@cap/platform-store'

export interface UseOptimisticMutationOptions<TData, TVariables> {
  /**
   * Entity type for tracking
   */
  entityType: string

  /**
   * Update type
   */
  updateType: OptimisticUpdateType

  /**
   * Function to generate optimistic data from variables
   */
  optimisticDataFn: (variables: TVariables) => TData

  /**
   * Function to extract entity ID from variables
   */
  getEntityId?: (variables: TVariables) => string | number

  /**
   * Callback on success
   */
  onSuccess?: (data: TData, variables: TVariables) => void

  /**
   * Callback on error
   */
  onError?: (error: HttpError, variables: TVariables) => void

  /**
   * Callback on rollback
   */
  onRollback?: (variables: TVariables) => void

  /**
   * Custom rollback function
   */
  rollbackFn?: (variables: TVariables) => void
}

export interface UseOptimisticMutationResult<TData, TVariables> {
  mutate: (url: string, variables: TVariables) => Promise<TData | null>
  data: TData | null
  error: HttpError | null
  loading: boolean
  isOptimistic: boolean
  reset: () => void
}

/**
 * Hook for optimistic mutations
 */
function useOptimisticMutation<TData = any, TVariables = any>(
  options: UseOptimisticMutationOptions<TData, TVariables>,
): UseOptimisticMutationResult<TData, TVariables> {
  const [data, setData] = useState<TData | null>(null)
  const [error, setError] = useState<HttpError | null>(null)
  const [loading, setLoading] = useState(false)
  const [isOptimistic, setIsOptimistic] = useState(false)
  const updateIdRef = useRef<string | null>(null)

  const mutate = useCallback(
    async (url: string, variables: TVariables): Promise<TData | null> => {
      setLoading(true)
      setError(null)

      // Generate optimistic data
      const optimisticData = options.optimisticDataFn(variables)
      setData(optimisticData)
      setIsOptimistic(true)

      // Add optimistic update
      const updateId = optimisticUpdateManager.addUpdate({
        type: options.updateType,
        entityType: options.entityType,
        entityId: options.getEntityId?.(variables),
        optimisticData,
        previousData: data,
        rollbackFn: () => {
          setData(data)
          setIsOptimistic(false)
          options.rollbackFn?.(variables)
          options.onRollback?.(variables)
        },
      })

      updateIdRef.current = updateId

      try {
        // Make actual API request
        const response: FetchResponse<TData> = await fetchClient.request(url, {
          method: getMethodForUpdateType(options.updateType),
          data: variables,
        })

        // Update with server data
        setData(response.data)
        setIsOptimistic(false)
        setLoading(false)

        // Mark as successful
        optimisticUpdateManager.markSuccess(updateId, response.data)
        options.onSuccess?.(response.data, variables)

        return response.data
      } catch (err) {
        const httpError = err as HttpError
        setError(httpError)
        setLoading(false)
        setIsOptimistic(false)

        // Mark as failed and rollback
        optimisticUpdateManager.markFailed(updateId, httpError)
        options.onError?.(httpError, variables)

        return null
      }
    },
    [options, data],
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
    setIsOptimistic(false)
    if (updateIdRef.current) {
      optimisticUpdateManager.cancelUpdate(updateIdRef.current)
    }
  }, [])

  return {
    mutate,
    data,
    error,
    loading,
    isOptimistic,
    reset,
  }
}

/**
 * Hook for optimistic list updates
 */
function useOptimisticList<T extends { id: string | number }>(initialData: T[] = []) {
  const [items, setItems] = useState<T[]>(initialData)
  const [pendingUpdates, setPendingUpdates] = useState<OptimisticUpdate[]>([])

  useEffect(() => {
    const unsubscribe = optimisticUpdateManager.subscribe((updates) => {
      setPendingUpdates(updates.filter((u) => u.status === 'pending'))
    })
    return unsubscribe
  }, [])

  const addItem = useCallback((item: T, options?: { temporary?: boolean }) => {
    const optimisticItem = options?.temporary ? { ...item, _optimistic: true } : item

    setItems((prev) => [optimisticItem as T, ...prev])
    return optimisticItem
  }, [])

  const updateItem = useCallback((id: string | number, updates: Partial<T>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }, [])

  const removeItem = useCallback((id: string | number) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const rollbackItem = useCallback((id: string | number, originalItem: T) => {
    setItems((prev) => prev.map((item) => (item.id === id ? originalItem : item)))
  }, [])

  const hasPendingUpdate = useCallback(
    (id: string | number) => {
      return pendingUpdates.some((update) => update.entityId === id)
    },
    [pendingUpdates],
  )

  return {
    items,
    setItems,
    addItem,
    updateItem,
    removeItem,
    rollbackItem,
    hasPendingUpdate,
    pendingCount: pendingUpdates.length,
  }
}

/**
 * Hook to track all optimistic updates
 */
function useOptimisticUpdates(entityType?: string) {
  const [updates, setUpdates] = useState<OptimisticUpdate[]>([])

  useEffect(() => {
    const unsubscribe = optimisticUpdateManager.subscribe((allUpdates) => {
      if (entityType) {
        setUpdates(allUpdates.filter((update) => update.entityType === entityType))
      } else {
        setUpdates(allUpdates)
      }
    })

    return unsubscribe
  }, [entityType])

  const pending = updates.filter((u) => u.status === 'pending')
  const failed = updates.filter((u) => u.status === 'failed')

  return {
    updates,
    pending,
    failed,
    hasPending: pending.length > 0,
    hasFailed: failed.length > 0,
    stats: optimisticUpdateManager.getStats(),
  }
}

/**
 * Helper to get HTTP method for update type
 */
function getMethodForUpdateType(type: OptimisticUpdateType): string {
  switch (type) {
    case OptimisticUpdateTypeEnum.CREATE:
      return HttpMethodEnum.POST
    case OptimisticUpdateTypeEnum.UPDATE:
      return HttpMethodEnum.PUT
    case OptimisticUpdateTypeEnum.DELETE:
      return HttpMethodEnum.DELETE
    case OptimisticUpdateTypeEnum.CUSTOM:
      return HttpMethodEnum.POST
    default:
      return HttpMethodEnum.POST
  }
}

export default useOptimisticMutation
export { useOptimisticList, useOptimisticUpdates }
