import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query'
import type { FetchResponse, HttpError } from '@cap/platform-core'
import oidcService from '../services/oidc.service'
import type {
  OIDCClient,
  CreateOIDCClientDTO,
  UpdateOIDCClientDTO,
  RotateClientSecretResult,
  OIDCClientBranding,
  OIDCInteractionDetails,
  OIDCLoginCredentials,
  OIDCLoginResponse,
  OIDCMfaVerifyDTO,
  OIDCConsentDTO,
  OIDCDeviceVerifyResult,
  OIDCRedirectResult,
} from '../types/oidc.types'

/**
 * Query keys for OIDC operations
 */
export const oidcKeys = {
  all: ['oidc'] as const,
  clients: () => [...oidcKeys.all, 'clients'] as const,
  client: (id: string) => [...oidcKeys.clients(), id] as const,
  clientBranding: (id: string) => [...oidcKeys.client(id), 'branding'] as const,
  userinfo: () => [...oidcKeys.all, 'userinfo'] as const,
  interaction: (uid: string) => [...oidcKeys.all, 'interaction', uid] as const,
  consent: (uid: string) => [...oidcKeys.all, 'consent', uid] as const,
}

// Backward compatibility alias
export const oidcComplianceKeys = oidcKeys

// ============================================================================
// OIDC Clients Management Hooks (Admin)
// ============================================================================

export function useOIDCClients(
  options?: Omit<UseQueryOptions<FetchResponse<OIDCClient[]>, HttpError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: oidcKeys.clients(),
    queryFn: () => oidcService.listClients(),
    ...options,
  })
}

export function useOIDCClient(
  id: string | null | undefined,
  options?: Omit<UseQueryOptions<FetchResponse<OIDCClient>, HttpError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: oidcKeys.client(id || ''),
    queryFn: () => oidcService.getClient(id || ''),
    enabled: !!id,
    ...options,
  })
}

export function useCreateOIDCClient(
  options?: UseMutationOptions<FetchResponse<OIDCClient>, HttpError, CreateOIDCClientDTO, unknown>
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (data: CreateOIDCClientDTO) => oidcService.createClient(data),
    ...restOptions,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: oidcKeys.clients() })
      customOnSuccess?.(...args)
    },
  })
}

export function useUpdateOIDCClient(
  id?: string,
  options?: UseMutationOptions<FetchResponse<OIDCClient>, HttpError, { id?: string; data: UpdateOIDCClientDTO } | UpdateOIDCClientDTO, unknown>
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (payload) => {
      const targetId = ('id' in payload && payload.id) ? payload.id : id
      const targetData = ('data' in payload && payload.data) ? payload.data : (payload as UpdateOIDCClientDTO)
      if (!targetId) throw new Error('Client ID is required for update')
      return oidcService.updateClient(targetId, targetData)
    },
    ...restOptions,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: oidcKeys.clients() })
      if (id) {
        queryClient.invalidateQueries({ queryKey: oidcKeys.client(id) })
      }
      customOnSuccess?.(...args)
    },
  })
}

export function useDeleteOIDCClient(
  options?: UseMutationOptions<FetchResponse<{ message?: string }>, HttpError, string | number, unknown>
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (id: string | number) => oidcService.deleteClient(String(id)),
    ...restOptions,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: oidcKeys.clients() })
      customOnSuccess?.(...args)
    },
  })
}

export function useRotateClientSecret(
  options?: UseMutationOptions<FetchResponse<RotateClientSecretResult>, HttpError, string, unknown>
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (id: string) => oidcService.rotateSecret(id),
    ...restOptions,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: oidcKeys.clients() })
      if (args[1]) {
        queryClient.invalidateQueries({ queryKey: oidcKeys.client(args[1]) })
      }
      customOnSuccess?.(...args)
    },
  })
}

export function useClientBranding(
  id: string | null | undefined,
  options?: Omit<UseQueryOptions<FetchResponse<OIDCClientBranding>, HttpError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: oidcKeys.clientBranding(id || ''),
    queryFn: () => oidcService.getBranding(id || ''),
    enabled: !!id,
    ...options,
  })
}

export function useUpdateClientBranding(
  id: string,
  options?: UseMutationOptions<FetchResponse<OIDCClientBranding>, HttpError, OIDCClientBranding, unknown>
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (data: OIDCClientBranding) => oidcService.updateBranding(id, data),
    ...restOptions,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: oidcKeys.clientBranding(id) })
      queryClient.invalidateQueries({ queryKey: oidcKeys.client(id) })
      customOnSuccess?.(...args)
    },
  })
}

// ============================================================================
// OIDC Interaction Lifecycle Hooks
// ============================================================================

export function useOidcInteraction(
  uid: string | null | undefined,
  options?: Omit<UseQueryOptions<FetchResponse<OIDCInteractionDetails>, HttpError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: oidcKeys.interaction(uid || ''),
    queryFn: () => oidcService.getInteraction(uid || ''),
    enabled: !!uid,
    staleTime: 0,
    ...options,
  })
}

export function useOidcLogin(
  uid: string | null | undefined,
  options?: UseMutationOptions<FetchResponse<OIDCLoginResponse>, HttpError, OIDCLoginCredentials, unknown>
) {
  return useMutation({
    mutationFn: (credentials: OIDCLoginCredentials) => {
      const targetUid = uid || credentials.interaction
      if (!targetUid) throw new Error('Interaction UID is required for login')
      return oidcService.loginInteraction(targetUid, credentials)
    },
    ...options,
  })
}

export function useOidcVerifyMfa(
  uid: string | null | undefined,
  options?: UseMutationOptions<FetchResponse<OIDCRedirectResult>, HttpError, OIDCMfaVerifyDTO, unknown>
) {
  return useMutation({
    mutationFn: (data: OIDCMfaVerifyDTO) => {
      if (!uid) throw new Error('Interaction UID is required for MFA verification')
      return oidcService.verifyMfaInteraction(uid, data)
    },
    ...options,
  })
}

export function useOidcConsent(
  uid: string | null | undefined,
  options?: Omit<UseQueryOptions<FetchResponse<OIDCInteractionDetails>, HttpError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: oidcKeys.consent(uid || ''),
    queryFn: () => oidcService.getConsent(uid || ''),
    enabled: !!uid,
    staleTime: 0,
    ...options,
  })
}

export function useConfirmOidcInteraction(
  uid: string | null | undefined,
  options?: UseMutationOptions<FetchResponse<OIDCRedirectResult>, HttpError, OIDCConsentDTO | void, unknown>
) {
  return useMutation({
    mutationFn: (data?: OIDCConsentDTO | void) => oidcService.confirmInteraction(uid || '', data || undefined),
    ...options,
  })
}

export function useAbortOidcInteraction(
  uid: string | null | undefined,
  options?: UseMutationOptions<FetchResponse<OIDCRedirectResult>, HttpError, void, unknown>
) {
  return useMutation({
    mutationFn: () => oidcService.abortInteraction(uid || ''),
    ...options,
  })
}

// ============================================================================
// OIDC Standard Compliance Protocols
// ============================================================================

export function useOidcUserInfo(
  options?: Omit<UseQueryOptions<FetchResponse<Record<string, any>>, HttpError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: oidcKeys.userinfo(),
    queryFn: () => oidcService.getUserInfo(),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function useOidcInfoIntrospect(
  options?: UseMutationOptions<FetchResponse<Record<string, any>>, HttpError, string, unknown>
) {
  return useMutation({
    mutationFn: (token: string) => oidcService.introspectToken(token),
    ...options,
  })
}

export function useOidcTokenRevocation(
  options?: UseMutationOptions<FetchResponse<{ message?: string }>, HttpError, string, unknown>
) {
  return useMutation({
    mutationFn: (token: string) => oidcService.revokeToken(token),
    ...options,
  })
}

export function useOidcEndSession(
  options?: UseMutationOptions<FetchResponse<{ message?: string }>, HttpError, void, unknown>
) {
  return useMutation({
    mutationFn: () => oidcService.endSession(),
    ...options,
  })
}

export function useVerifyDeviceCode(
  options?: UseMutationOptions<FetchResponse<OIDCDeviceVerifyResult>, HttpError, string, unknown>
) {
  return useMutation({
    mutationFn: (userCode: string) => oidcService.verifyDeviceCode(userCode),
    ...options,
  })
}
