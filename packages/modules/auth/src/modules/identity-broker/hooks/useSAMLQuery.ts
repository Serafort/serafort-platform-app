import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query'
import type { FetchResponse, HttpError } from '@cap/platform-core'
import samlService from '../services/saml.service'
import type {
  SAMLConfig,
  UpdateSAMLConfigDTO,
  SAMLMetadataResponse,
  RemoteMetadataFetchDTO,
  RemoteMetadataResult,
  RecentSAMLEntity,
  SAMLSSOInitiateDTO,
  SAMLSSOInitiateResponse,
} from '../types/saml.types'

export const samlKeys = {
  all: ['admin', 'saml'] as const,
  config: () => [...samlKeys.all, 'config'] as const,
  metadata: () => [...samlKeys.all, 'metadata'] as const,
  recentEntities: () => [...samlKeys.all, 'recent-entities'] as const,
  discovery: (identifier: string) => ['auth', 'sso', 'discover', identifier] as const,
}

export function useSAMLConfig(
  options?: Omit<UseQueryOptions<FetchResponse<SAMLConfig>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: samlKeys.config(),
    queryFn: () => samlService.getConfig(),
    ...options,
  })
}

export function useUpdateSAMLConfig(
  options?: UseMutationOptions<
    FetchResponse<{ message: string; config?: SAMLConfig }>,
    HttpError,
    UpdateSAMLConfigDTO,
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (data: UpdateSAMLConfigDTO) => samlService.updateConfig(data),
    ...restOptions,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: samlKeys.config() })
      customOnSuccess?.(...args)
    },
  })
}

export function useSAMLMetadata(
  options?: Omit<
    UseQueryOptions<FetchResponse<SAMLMetadataResponse>, HttpError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: samlKeys.metadata(),
    queryFn: () => samlService.getMetadata(),
    ...options,
  })
}

export function useUploadSAMLMetadata(
  options?: UseMutationOptions<
    FetchResponse<RemoteMetadataResult>,
    HttpError,
    FormData | { metadata: string },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (payload: FormData | { metadata: string }) => samlService.uploadMetadata(payload),
    ...restOptions,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: samlKeys.config() })
      queryClient.invalidateQueries({ queryKey: samlKeys.recentEntities() })
      customOnSuccess?.(...args)
    },
  })
}

export function useFetchRemoteMetadata(
  options?: UseMutationOptions<
    FetchResponse<RemoteMetadataResult>,
    HttpError,
    string | RemoteMetadataFetchDTO,
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (payload: string | RemoteMetadataFetchDTO) => {
      const dto = typeof payload === 'string' ? { url: payload } : payload
      return samlService.fetchRemoteMetadata(dto)
    },
    ...restOptions,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: samlKeys.recentEntities() })
      customOnSuccess?.(...args)
    },
  })
}

export function useRecentSAMLEntities(
  options?: Omit<
    UseQueryOptions<FetchResponse<RecentSAMLEntity[]>, HttpError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: samlKeys.recentEntities(),
    queryFn: () => samlService.listRecentEntities(),
    ...options,
  })
}

export function useInitiateSamlSso(
  options?: UseMutationOptions<
    FetchResponse<SAMLSSOInitiateResponse>,
    HttpError,
    SAMLSSOInitiateDTO,
    unknown
  >,
) {
  return useMutation({
    mutationFn: (data: SAMLSSOInitiateDTO) => samlService.initiateSso(data),
    ...options,
  })
}

export function useSsoDiscovery(
  identifier: string | null | undefined,
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: samlKeys.discovery(identifier || ''),
    queryFn: () => samlService.discoverSso(identifier || ''),
    enabled: !!identifier && identifier.trim().length > 0,
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}
