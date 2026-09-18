import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query'
import type { FetchResponse, HttpError } from '@cap/platform-core'
import jwksService from '../services/jwks.service'
import type {
  JWKKey,
  CreateJWKSKeyRequest,
  JWKSKeyDetailResponse,
  RotateJWKSResponse,
} from '../types/jwks.types'

export const jwksKeys = {
  all: ['admin', 'jwks'] as const,
  list: () => [...jwksKeys.all, 'list'] as const,
  detail: (kid: string) => [...jwksKeys.all, 'detail', kid] as const,
}

export function useJWKSKeys(
  options?: Omit<UseQueryOptions<FetchResponse<JWKKey[]>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: jwksKeys.list(),
    queryFn: () => jwksService.listKeys(),
    ...options,
  })
}

export function useGetJWKSKeyDetail(
  kid: string | null | undefined,
  options?: Omit<
    UseQueryOptions<FetchResponse<JWKSKeyDetailResponse>, HttpError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: jwksKeys.detail(kid || ''),
    queryFn: () => jwksService.getKeyDetail(kid || ''),
    enabled: !!kid,
    ...options,
  })
}

export function useCreateJWKSKey(
  options?: UseMutationOptions<FetchResponse<JWKKey>, HttpError, CreateJWKSKeyRequest, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (data: CreateJWKSKeyRequest) => jwksService.createKey(data),
    ...restOptions,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: jwksKeys.list() })
      customOnSuccess?.(...args)
    },
  })
}

export function useRotateJWKSKeys(
  options?: UseMutationOptions<FetchResponse<RotateJWKSResponse>, HttpError, void, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: () => jwksService.rotateKeys(),
    ...restOptions,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: jwksKeys.list() })
      customOnSuccess?.(...args)
    },
  })
}

export function useDeleteJWKSKey(
  options?: UseMutationOptions<FetchResponse<{ message?: string }>, HttpError, string, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (kid: string) => jwksService.deleteKey(kid),
    ...restOptions,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: jwksKeys.list() })
      if (args[1]) {
        queryClient.removeQueries({ queryKey: jwksKeys.detail(args[1]) })
      }
      customOnSuccess?.(...args)
    },
  })
}
