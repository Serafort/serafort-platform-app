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
  SAMLConfig,
  MessageResponse,
  JsonObject,
} from '../../authorization-engine/services/adminService'
import { adminKeys } from '../../authorization-engine/hooks/useAdminQuery'

// ============================================================================
// SAML Configuration Hooks
// ============================================================================
/**
 * Get SAML configuration
 */
export function useSAMLConfig(
  options?: Omit<UseQueryOptions<FetchResponse<SAMLConfig>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: adminKeys.saml.config(),
    queryFn: () => adminService.getSAMLConfig(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...options,
  })
}

/**
 * Update SAML configuration
 */
export function useUpdateSAMLConfig(
  options?: UseMutationOptions<FetchResponse<SAMLConfig>, HttpError, Partial<SAMLConfig>, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (data) => adminService.updateSAMLConfig(data),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.saml.config() })
      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}

/**
 * Get SAML metadata
 */
export function useSAMLMetadata(
  options?: Omit<UseQueryOptions<FetchResponse<string>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: adminKeys.saml.metadata(),
    queryFn: () => adminService.getSAMLMetadata(),
    staleTime: 1000 * 60 * 10,
  })
}

/**
 * Upload SAML metadata
 */
export function useUploadSAMLMetadata(
  options?: UseMutationOptions<FetchResponse<MessageResponse>, HttpError, File, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (file) => adminService.uploadSAMLMetadata(file),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.saml.config() })
      queryClient.invalidateQueries({ queryKey: adminKeys.saml.metadata() })
      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}

/**
 * Fetch remote SAML metadata from a URL
 */
export function useFetchRemoteMetadata(
  options?: UseMutationOptions<
    FetchResponse<{ xml: string; entityId: string; name: string }>,
    HttpError,
    string,
    unknown
  >,
) {
  return useMutation({
    mutationFn: (url: string) => adminService.fetchRemoteMetadata(url),
    ...options,
  })
}

/**
 * Get remote SAML metadata from a URL (Query)
 */
export function useRemoteMetadata(
  url: string,
  options?: Omit<
    UseQueryOptions<FetchResponse<{ xml: string; entityId: string; name: string }>, HttpError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: ['admin', 'saml', 'remote', url],
    queryFn: () => adminService.fetchRemoteMetadata(url),
    enabled: !!url,
    ...options,
  })
}

/**
 * List recently explored SAML entities
 */
export function useRecentSAMLEntities(
  options?: Omit<UseQueryOptions<FetchResponse<JsonObject[]>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['admin', 'saml', 'recent'],
    queryFn: () => adminService.listRecentSAMLEntities(),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}
