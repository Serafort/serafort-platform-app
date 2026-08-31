// src/Modules/Auth/hooks/useProfileQuery.ts
// ============================================================================
// React Query Hooks for Resume Profile Service
// ============================================================================

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query'
import { FetchResponse, HttpError } from '@cap/platform-core'

import { profileService } from '@cap/module-auth/modules/user-directory/services/api.profile.service'

// ============================================================================
// Query Keys
// ============================================================================

const PROFILE_KEYS = {
  all: ['profiles'] as const,
  list: ['profiles', 'list'] as const,
  byId: (id: number) => ['profiles', id] as const,
  activeStatus: (id: number) => ['profiles', id, 'active-status'] as const,
}

// ============================================================================
// Query Hooks (GET operations)
// ============================================================================

/**
 * Get all profiles
 */
export function useProfiles(
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: PROFILE_KEYS.list,
    queryFn: () => profileService.getProfiles(),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

/**
 * Get profile by ID
 */
export function useProfileById(
  id: number,
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: PROFILE_KEYS.byId(id),
    queryFn: () => profileService.getProfileById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

/**
 * Get active status
 */
export function useProfileActiveStatus(
  id: number,
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: PROFILE_KEYS.activeStatus(id),
    queryFn: () => profileService.getActiveStatus(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

// ============================================================================
// Mutation Hooks (POST, PUT, DELETE operations)
// ============================================================================

/**
 * Upload profile
 */
export function useUploadProfile(
  options?: UseMutationOptions<
    FetchResponse,
    HttpError,
    { file: File; name: string; description?: string },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (data) => profileService.uploadProfile(data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.all })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

/**
 * Set active profile
 */
export function useSetActiveProfile(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, number, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (id: number) => profileService.setActiveProfile(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.all })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

/**
 * Update profile
 */
export function useUpdateResumeProfile(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, { id: number; data: any }, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: ({ id, data }) => profileService.updateProfile(id, data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.all })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

/**
 * Delete profile
 */
export function useDeleteProfile(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, number, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (id: number) => profileService.deleteProfile(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.all })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}
