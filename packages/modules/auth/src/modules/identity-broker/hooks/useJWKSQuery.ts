import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query'
import type { FetchResponse, HttpError } from '@cap/platform-core'
import { adminService } from '../../authorization-engine/services/adminService'
import type {
  JWKSKey,
  JWKSKeyDetail,
  MessageResponse,
  CreateJWKSKeyRequest,
} from '../../authorization-engine/services/adminService'
import { adminKeys } from '../../authorization-engine/hooks/useAdminQuery'

/**
 * Get all JWKS keys
 */
export function useJWKSKeys(
  options?: Omit<UseQueryOptions<FetchResponse<JWKSKey[]>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: adminKeys.jwks.list(),
    queryFn: () => adminService.getJWKSKeys(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  })
}

/**
 * Rotate JWKS keys
 */
export function useRotateJWKSKeys(
  options?: UseMutationOptions<FetchResponse<JWKSKey>, HttpError, void, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: () => adminService.rotateJWKSKeys(),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.jwks.list() })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

/**
 * Delete a JWKS key
 */
export function useDeleteJWKSKey(
  options?: UseMutationOptions<FetchResponse<MessageResponse>, HttpError, string, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (kid: string) => adminService.deleteJWKSKey(kid),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.jwks.list() })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

/**
 * Manually create a JWKS key
 */
export function useCreateJWKSKey(
  options?: Omit<
    UseMutationOptions<FetchResponse<JWKSKey>, HttpError, CreateJWKSKeyRequest, unknown>,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: (data: CreateJWKSKeyRequest) => adminService.createJWKSKey(data),
    onSuccess: (res, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.jwks.all })
      options?.onSuccess?.(res, variables, context, mutation)
    },
  })
}

/**
 * Get detailed info for a single JWKS key
 */
export function useGetJWKSKeyDetail(
  kid: string | null,
  options?: Omit<UseQueryOptions<FetchResponse<JWKSKeyDetail>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: adminKeys.jwks.detail(kid ?? ''),
    queryFn: () => adminService.getJWKSKeyDetail(kid!),
    enabled: !!kid,
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}
