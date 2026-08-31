import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query'
import type { FetchResponse, HttpError } from '@cap/platform-core'
import scimService from '../services/scim.service'
import type {
  SCIMConfig,
  UpdateSCIMConfigDTO,
  SCIMToken,
  CreateSCIMTokenDTO,
  CreateSCIMTokenResponse,
  SCIMConnectionTestResponse,
} from '../types/scim.types'

export const scimKeys = {
  all: ['admin', 'scim'] as const,
  config: () => [...scimKeys.all, 'config'] as const,
  tokens: () => [...scimKeys.all, 'tokens'] as const,
}

export function useSCIMConfig(
  options?: Omit<UseQueryOptions<FetchResponse<SCIMConfig>, HttpError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: scimKeys.config(),
    queryFn: () => scimService.getConfig(),
    ...options,
  })
}

export function useUpdateSCIMConfig(
  options?: UseMutationOptions<FetchResponse<{ message: string; config?: SCIMConfig }>, HttpError, UpdateSCIMConfigDTO, unknown>
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (data: UpdateSCIMConfigDTO) => scimService.updateConfig(data),
    ...restOptions,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: scimKeys.config() })
      customOnSuccess?.(...args)
    },
  })
}

// Backward compatibility alias for existing screens
export const useOrganizationScimConfig = useSCIMConfig
export const useUpdateOrganizationScimConfig = useUpdateSCIMConfig

export function useSCIMTokens(
  options?: Omit<UseQueryOptions<FetchResponse<SCIMToken[]>, HttpError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: scimKeys.tokens(),
    queryFn: () => scimService.listTokens(),
    ...options,
  })
}

export function useCreateSCIMToken(
  options?: UseMutationOptions<FetchResponse<CreateSCIMTokenResponse>, HttpError, CreateSCIMTokenDTO, unknown>
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (data: CreateSCIMTokenDTO) => scimService.createToken(data),
    ...restOptions,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: scimKeys.tokens() })
      customOnSuccess?.(...args)
    },
  })
}

export function useRevokeSCIMToken(
  options?: UseMutationOptions<FetchResponse<{ message?: string }>, HttpError, string | number, unknown>
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (id: string | number) => scimService.revokeToken(id),
    ...restOptions,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: scimKeys.tokens() })
      customOnSuccess?.(...args)
    },
  })
}

export function useTestSCIMConnection(
  options?: UseMutationOptions<FetchResponse<SCIMConnectionTestResponse>, HttpError, void, unknown>
) {
  return useMutation({
    mutationFn: () => scimService.testConnection(),
    ...options,
  })
}
