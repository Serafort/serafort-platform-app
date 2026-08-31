// src/Modules/Auth/hooks/useNotificationsQuery.ts
// ============================================================================
// React Query Hooks for Notifications Service
// ============================================================================

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query'
import { FetchResponse, HttpError } from '@cap/platform-core'

import { notificationsService } from '../services/notifications.service'

// ============================================================================
// Query Keys
// ============================================================================

const NOTIFICATION_KEYS = {
  all: ['notifications'] as const,
  list: (params?: any) => ['notifications', 'list', params] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
  preferences: ['notifications', 'preferences'] as const,
}

// ============================================================================
// Query Hooks (GET operations)
// ============================================================================

/**
 * Get notifications
 */
export function useNotifications(
  params?: any,
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.list(params),
    queryFn: () => notificationsService.getNotifications(params),
    staleTime: 1000 * 60, // 1 minute
    ...options,
  })
}

/**
 * Get unread count
 */
export function useUnreadNotificationsCount(
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.unreadCount,
    queryFn: () => notificationsService.getUnreadCount(),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
    ...options,
  })
}

/**
 * Get notification preferences
 */
export function useNotificationPreferences(
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.preferences,
    queryFn: () => notificationsService.getPreferences(),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

// ============================================================================
// Mutation Hooks (POST, PUT, DELETE operations)
// ============================================================================

/**
 * Mark notification as read
 */
export function useMarkNotificationAsRead(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, number, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (id: number) => notificationsService.markAsRead(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

/**
 * Mark all notifications as read
 */
export function useMarkAllNotificationsAsRead(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, void, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

/**
 * Delete notification
 */
export function useDeleteNotification(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, number, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (id: number) => notificationsService.deleteNotification(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

/**
 * Clear all notifications
 */
export function useClearAllNotifications(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, void, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: () => notificationsService.clearAll(),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

/**
 * Update notification preferences
 */
export function useUpdateNotificationPreferences(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, any, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (data: any) => notificationsService.updatePreferences(data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.preferences })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}
