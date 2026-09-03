import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query'
import { FetchResponse, HttpError, useAppStore, secureTokenManager } from '@cap/platform-core'
import sessionService from '../services/session.service'
import type {
  SessionsResponse,
  SecurityStatusResponse,
  AuditLogItem,
  ChangePasswordRequest,
  ChangePasswordResponse,
  DeactivateAccountRequest,
  DeactivateAccountResponse,
} from '../types/session.types'

export const SESSION_QUERY_KEYS = {
  sessions: ['auth', 'sessions'] as const,
  securityStatus: ['user', 'security-status'] as const,
  activityTimeline: ['user', 'activity-timeline'] as const,
}

/**
 * List active sessions with parsed device, IP, and activity status
 */
export function useSessions(
  options?: Omit<
    UseQueryOptions<FetchResponse<SessionsResponse>, HttpError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: SESSION_QUERY_KEYS.sessions,
    queryFn: () => sessionService.getSessions(),
    staleTime: 1000 * 60 * 1, // 1 minute
    ...options,
  })
}

/**
 * Revoke a single active session by ID
 */
export function useRevokeSession(
  options?: UseMutationOptions<
    FetchResponse<{ message: string }>,
    HttpError,
    string | number,
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (sessionId: string | number) => sessionService.revokeSession(sessionId),
    onSuccess: (...args) => {
      const [, variables] = args
      // Invalidate related caches
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.sessions })
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.securityStatus })
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.activityTimeline })

      // Check if current session was revoked
      const cachedSessions = queryClient.getQueryData<FetchResponse<SessionsResponse>>(
        SESSION_QUERY_KEYS.sessions,
      )
      const currentSessionId = cachedSessions?.data?.current_session_id
      if (currentSessionId && String(variables) === String(currentSessionId)) {
        secureTokenManager.clearTokens()
        useAppStore.getState().signOut()
      }

      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}

/**
 * Revoke all other active sessions except current
 */
export function useRevokeAllSessions(
  options?: UseMutationOptions<
    FetchResponse<{ message: string }>,
    HttpError,
    void | undefined,
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}

  return useMutation({
    mutationFn: () => sessionService.revokeAllSessions(),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.sessions })
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.securityStatus })
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.activityTimeline })

      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}

/**
 * Retrieve user activity timeline / audit log
 */
export function useActivityTimeline(
  options?: Omit<UseQueryOptions<FetchResponse<AuditLogItem[]>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: SESSION_QUERY_KEYS.activityTimeline,
    queryFn: () => sessionService.getActivityTimeline(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  })
}

/**
 * Retrieve user security status summary
 */
export function useSecurityStatus(
  options?: Omit<
    UseQueryOptions<FetchResponse<SecurityStatusResponse>, HttpError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: SESSION_QUERY_KEYS.securityStatus,
    queryFn: () => sessionService.getSecurityStatus(),
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  })
}

/**
 * Change current user password mutation
 */
export function useChangePasswordMutation(
  options?: UseMutationOptions<
    FetchResponse<ChangePasswordResponse>,
    HttpError,
    ChangePasswordRequest,
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) => sessionService.changePassword(payload),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.securityStatus })
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.activityTimeline })
      queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEYS.sessions })

      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}

/**
 * Deactivate user account mutation
 */
export function useDeactivateAccountMutation(
  options?: UseMutationOptions<
    FetchResponse<DeactivateAccountResponse>,
    HttpError,
    DeactivateAccountRequest | void,
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (payload?: DeactivateAccountRequest | void) =>
      sessionService.deactivateAccount(payload || undefined),
    onSuccess: (...args) => {
      secureTokenManager.clearTokens()
      useAppStore.getState().signOut()
      queryClient.clear()

      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}

export const useChangePassword = useChangePasswordMutation
export const useDeactivateAccount = useDeactivateAccountMutation
