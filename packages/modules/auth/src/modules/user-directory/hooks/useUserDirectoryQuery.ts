// useUserDirectoryQuery.ts
// TanStack React Query v5 Query Hooks for User Directory

import { useQuery, keepPreviousData, UseQueryOptions } from '@tanstack/react-query'
import { FetchResponse, HttpError } from '@cap/platform-core'
import userDirectoryService from '../services/userDirectory.service'
import {
  PaginatedUsersResponseDTO,
  UserDetailDTO,
  UserDirectoryFilterParams,
  RoleDTO,
  UserSessionDTO,
  UserActivityLogDTO,
} from '../types/userDirectory.types'

/**
 * Centralized Query Keys Factory for User Directory
 */
export const userDirectoryKeys = {
  all: ['user-directory'] as const,
  lists: () => [...userDirectoryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...userDirectoryKeys.lists(), filters] as const,
  details: () => [...userDirectoryKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...userDirectoryKeys.details(), id] as const,
  roles: () => ['roles', 'list'] as const,
  sessions: (id: number | string) => [...userDirectoryKeys.detail(id), 'sessions'] as const,
  activity: (id: number | string) => [...userDirectoryKeys.detail(id), 'activity'] as const,
}

/**
 * Query hook for paginated and filtered users list
 * Uses placeholderData: keepPreviousData for smooth pagination transitions
 */
export function useUsersQuery(
  filters: UserDirectoryFilterParams = {},
  options?: Omit<
    UseQueryOptions<FetchResponse<PaginatedUsersResponseDTO>, HttpError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: userDirectoryKeys.list(filters),
    queryFn: () => userDirectoryService.getUsers(filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2, // 2 minutes cache
    ...options,
  })
}

/**
 * Query hook for single user details & metadata
 */
export function useUserDetailQuery(
  id?: string | number | null,
  options?: Omit<UseQueryOptions<FetchResponse<UserDetailDTO>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: userDirectoryKeys.detail(id || 0),
    queryFn: () => userDirectoryService.getUserById(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 3, // 3 minutes cache
    ...options,
  })
}

/**
 * Query hook for available roles list
 */
export function useRolesQuery(
  options?: Omit<UseQueryOptions<FetchResponse<RoleDTO[]>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: userDirectoryKeys.roles(),
    queryFn: () => userDirectoryService.getRoles(),
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    ...options,
  })
}

/**
 * Query hook for user active sessions
 */
export function useUserSessionsQuery(
  id?: string | number | null,
  options?: Omit<
    UseQueryOptions<FetchResponse<UserSessionDTO[]>, HttpError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: userDirectoryKeys.sessions(id || 0),
    queryFn: () => userDirectoryService.getUserSessions(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2,
    ...options,
  })
}

/**
 * Query hook for user activity / audit logs
 */
export function useUserActivityQuery(
  id?: string | number | null,
  limit: number = 20,
  options?: Omit<
    UseQueryOptions<FetchResponse<UserActivityLogDTO[]>, HttpError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: userDirectoryKeys.activity(id || 0),
    queryFn: () => userDirectoryService.getUserActivityLogs(id!, limit),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2,
    ...options,
  })
}
