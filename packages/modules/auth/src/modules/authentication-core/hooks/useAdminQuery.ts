import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { FetchResponse, HttpError, apiClient } from '@cap/platform-core';
import { ENDPOINTS } from '@cap/platform-core';

import { User, OIDCClient, AuditLog, Scope, CreateOIDCClientRequest, AdminOrganization, ActivityTimelineResponse, SAMLConfig, SCIMConfig, JWKSKey, ExportParams } from '../types/api.types';

// Re-export or alias if needed
export type AdminUser = User
export type {
  OIDCClient,
  AuditLog,
  Scope,
  ActivityTimelineResponse,
  SAMLConfig,
  SCIMConfig,
  JWKSKey,
}

export interface ProvisioningConnector {
  id: number
  name: string
  type: string
  status: string
  lastSync?: string
}

export interface ProvisioningConnectorLog {
  id: number
  connectorId: number
  status: string
  message: string
  timestamp: string
}

export interface OrganizationInvitation {
  id: number
  email: string
  role: string
  status: string
  expiresAt: string
}

export interface BanAppeal {
  id: number
  userId: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  resolvedAt?: string
}

const ADMIN_KEYS = {
  users: ['admin', 'users'] as const,
  user: (id: number) => ['admin', 'users', id] as const,
  organizations: ['admin', 'organizations'] as const,
  organization: (id: number) => ['admin', 'organizations', id] as const,
  auditLogs: ['admin', 'audit-logs'] as const,
  clients: ['admin', 'clients'] as const,
  scopes: ['admin', 'scopes'] as const,
  provisioning: ['admin', 'provisioning'] as const,
  samlConfig: ['admin', 'saml'] as const,
  scimConfig: ['admin', 'scim'] as const,
  jwks: ['admin', 'jwks'] as const,
  appeals: ['admin', 'appeals'] as const,
  impersonationLogs: ['admin', 'impersonation-logs'] as const,
}

export const adminKeys = ADMIN_KEYS

export function useAdminDashboard(
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => apiClient.get(ENDPOINTS.admin.dashboard),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function useUsers(
  params?: { page?: number; limit?: number; search?: string; status?: string; role?: string },
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: [...ADMIN_KEYS.users, params],
    queryFn: () => apiClient.get(ENDPOINTS.admin.users.index, { params }),
    staleTime: 1000 * 60 * 2,
    ...options,
  })
}

export function useUserById(
  id: number,
  options?: Omit<UseQueryOptions<FetchResponse<AdminUser>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ADMIN_KEYS.user(id),
    queryFn: () => apiClient.get<AdminUser>(ENDPOINTS.admin.users.byId(id)),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function useCreateUser(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, any, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (data) => apiClient.post(ENDPOINTS.admin.users.store, data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.users })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useUpdateUser(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, { id: number; data: any }, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: ({ id, data }) => apiClient.patch(ENDPOINTS.admin.users.byId(id), data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.users })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useDeleteUser(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, number, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (id) => apiClient.delete(ENDPOINTS.admin.users.byId(id)),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.users })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useBanUser(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, { id: number; reason?: string }, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: ({ id, reason }) => apiClient.post(ENDPOINTS.admin.users.ban(id), { reason }),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.users })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useUnbanUser(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, number, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (id) => apiClient.post(ENDPOINTS.admin.users.unban(id)),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.users })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useResetUserPassword(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, number, unknown>,
) {
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (id) => apiClient.post(ENDPOINTS.admin.users.resetPassword(id)),
    onSuccess: customOnSuccess,
    ...restOptions,
  })
}

export function useImpersonateUser(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, number, unknown>,
) {
  return useMutation({
    mutationFn: (id) => apiClient.post(ENDPOINTS.admin.users.impersonate(id)),
    ...options,
  })
}

export function useOrganizations(
  params?: { page?: number; limit?: number; search?: string },
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: [...ADMIN_KEYS.organizations, params],
    queryFn: () => apiClient.get(ENDPOINTS.admin.organizations.index, { params }),
    staleTime: 1000 * 60 * 2,
    ...options,
  })
}

export function useCreateOrganization(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, { name: string; slug: string; domain?: string }, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (data) => apiClient.post(ENDPOINTS.admin.organizations.store, data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.organizations })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useOrganization(
  id?: number | string,
  options?: Omit<UseQueryOptions<FetchResponse<AdminOrganization>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useOrganizationById(Number(id), options)
}

export function useOrganizationById(
  id: number,
  options?: Omit<UseQueryOptions<FetchResponse<AdminOrganization>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ADMIN_KEYS.organization(id),
    queryFn: () => apiClient.get<AdminOrganization>(ENDPOINTS.admin.organizations.byId(id)),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function useDeleteOrganization(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, number, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (id) => apiClient.delete(ENDPOINTS.admin.organizations.byId(id)),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.organizations })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useImpersonateOrganization(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, number, unknown>,
) {
  return useMutation({
    mutationFn: (id) => apiClient.post(ENDPOINTS.admin.organizations.impersonate(id)),
    ...options,
  })
}

export function useUploadOrganizationLogo(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, { id: number; logo: File }, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: ({ id, logo }) =>
      apiClient.uploadFormData(ENDPOINTS.admin.organizations.logo(id), { logo }, 'post'),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.organizations }),
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useInviteOrganizationMember(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, { orgId: number; email: string; role: string }, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: ({ orgId, email, role }) =>
      apiClient.post(ENDPOINTS.admin.organizations.invite(orgId), { email, role }),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.organizations })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useRevokeOrganizationInvitation(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, { orgId: number; invitationId: number | string }, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: ({ orgId, invitationId }) =>
      apiClient.post(ENDPOINTS.admin.organizations.revokeInvitation(orgId, invitationId)),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.organizations })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useAuditLogs(
  params?: { page?: number; limit?: number; user_id?: number; action?: string; userId?: number },
  options?: Omit<UseQueryOptions<FetchResponse<ActivityTimelineResponse>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: [...ADMIN_KEYS.auditLogs, params],
    queryFn: () => apiClient.get<ActivityTimelineResponse>(ENDPOINTS.admin.auditLogs.index, { params }),
    staleTime: 1000 * 60 * 1,
    ...options,
  })
}

export function useExportAuditLogs(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, ExportParams, unknown>,
) {
  return useMutation({
    mutationFn: (params) => apiClient.post(ENDPOINTS.admin.auditLogs.export, params),
    ...options,
  })
}

export function useImpersonationLogs(
  params?: { page?: number; limit?: number },
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ADMIN_KEYS.impersonationLogs,
    queryFn: () => apiClient.get(ENDPOINTS.admin.impersonationLogs, { params }),
    staleTime: 1000 * 60 * 2,
    ...options,
  })
}

export function useAppeals(
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ADMIN_KEYS.appeals,
    queryFn: () => apiClient.get(ENDPOINTS.admin.appeals.index),
    staleTime: 1000 * 60 * 2,
    ...options,
  })
}

export function useResolveAppeal(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, { id: number; action: 'approved' | 'rejected' }, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: ({ id, action }) => apiClient.post(ENDPOINTS.admin.appeals.resolve(id), { action }),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.appeals })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useOIDCClients(
  options?: Omit<UseQueryOptions<FetchResponse<OIDCClient[]>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ADMIN_KEYS.clients,
    queryFn: () => apiClient.get<OIDCClient[]>(ENDPOINTS.admin.clients.index),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function useCreateOIDCClient(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, CreateOIDCClientRequest, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (data) => apiClient.post(ENDPOINTS.admin.clients.store, data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.clients })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useUpdateOIDCClient(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, { id: string | number; data: Partial<OIDCClient> }, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: ({ id, data }) => apiClient.patch(ENDPOINTS.admin.clients.update(String(id)), data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.clients })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useDeleteOIDCClient(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, string, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (id) => apiClient.delete(ENDPOINTS.admin.clients.destroy(id)),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.clients })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useRotateClientSecret(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, string, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (id) => apiClient.post(ENDPOINTS.admin.clients.rotateSecret(id)),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.clients })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useScopes(
  options?: Omit<UseQueryOptions<FetchResponse<Scope[]>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ADMIN_KEYS.scopes,
    queryFn: () => apiClient.get<Scope[]>(ENDPOINTS.admin.scopes.list),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function useCreateScope(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, { name: string; description?: string }, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (data) => apiClient.post(ENDPOINTS.admin.scopes.store, data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.scopes })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useUpdateScope(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, { id: number; data: Partial<Scope> }, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: ({ id, data }) => apiClient.patch(ENDPOINTS.admin.scopes.update(id), data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.scopes })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useDeleteScope(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, number, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (id) => apiClient.delete(ENDPOINTS.admin.scopes.destroy(id)),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.scopes })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useSAMLConfig(
  options?: Omit<UseQueryOptions<FetchResponse<SAMLConfig>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ADMIN_KEYS.samlConfig,
    queryFn: () => apiClient.get<SAMLConfig>(ENDPOINTS.admin.saml.config),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function useUpdateSAMLConfig(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, SAMLConfig, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (data) => apiClient.post(ENDPOINTS.admin.saml.config, data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.samlConfig })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useUploadSAMLMetadata(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, File, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (file) =>
      apiClient.uploadFormData(ENDPOINTS.admin.saml.uploadMetadata, { metadata: file }, 'post'),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.samlConfig })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useSCIMConfig(
  options?: Omit<UseQueryOptions<FetchResponse<SCIMConfig>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ADMIN_KEYS.scimConfig,
    queryFn: () => apiClient.get<SCIMConfig>(ENDPOINTS.admin.scim.config),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function useUpdateOrganizationScimConfig(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, { orgId: number; config: SCIMConfig }, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: ({ orgId, config }) => apiClient.patch(ENDPOINTS.admin.scim.config, { ...config, organizationId: orgId }),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.scimConfig })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useTestSCIMConnection(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, SCIMConfig, unknown>,
) {
  return useMutation({
    mutationFn: (config) => apiClient.post(ENDPOINTS.admin.scim.config, { ...config, test: true }),
    ...options,
  })
}

export function useJWKSKeys(
  options?: Omit<UseQueryOptions<FetchResponse<JWKSKey[]>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ADMIN_KEYS.jwks,
    queryFn: () => apiClient.get<JWKSKey[]>(ENDPOINTS.admin.jwks.index),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function useGetJWKSKeyDetail(
  kid: string,
  options?: Omit<UseQueryOptions<FetchResponse<JWKSKey>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: [...ADMIN_KEYS.jwks, kid],
    queryFn: () => apiClient.get<JWKSKey>(ENDPOINTS.admin.jwks.show(kid)),
    enabled: !!kid,
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function useCreateJWKSKey(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, { alg: string; use: string }, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (data) => apiClient.post(ENDPOINTS.admin.jwks.store, data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.jwks })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useRotateJWKS(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, void, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: () => apiClient.post(ENDPOINTS.admin.jwks.rotate),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.jwks })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useDeleteJWKSKey(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, string, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (kid) => apiClient.delete(ENDPOINTS.admin.jwks.destroy(kid)),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.jwks })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useProvisioningConnectors(
  options?: Omit<UseQueryOptions<FetchResponse<ProvisioningConnector[]>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ADMIN_KEYS.provisioning,
    queryFn: () => apiClient.get<ProvisioningConnector[]>(ENDPOINTS.admin.provisioning.connectors),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function useCreateProvisioningConnector(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, { name: string; type: string; config: any }, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (data) => apiClient.post(ENDPOINTS.admin.provisioning.store, data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.provisioning })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useUpdateProvisioningConnector(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, { id: number; data: any }, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: ({ id, data }) => apiClient.patch(ENDPOINTS.admin.provisioning.update(id), data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.provisioning })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useDeleteProvisioningConnector(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, number, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (id) => apiClient.delete(ENDPOINTS.admin.provisioning.destroy(id)),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.provisioning })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useSyncProvisioningConnector(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, number, unknown>,
) {
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (id) => apiClient.post(ENDPOINTS.admin.provisioning.sync(id)),
    onSuccess: customOnSuccess,
    ...restOptions,
  })
}

export function useProvisioningConnectorLogs(
  connectorId: number,
  options?: Omit<UseQueryOptions<FetchResponse<ProvisioningConnectorLog[]>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: [...ADMIN_KEYS.provisioning, 'logs', connectorId],
    queryFn: () => apiClient.get<ProvisioningConnectorLog[]>(ENDPOINTS.admin.provisioning.connectorLogs(connectorId)),
    enabled: !!connectorId,
    staleTime: 1000 * 60 * 2,
    ...options,
  })
}

export function useSSFConfig(
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['admin', 'ssf'],
    queryFn: () => apiClient.get(ENDPOINTS.admin.ssf.config),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function useUpdateSSFConfig(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, any, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (data) => apiClient.post(ENDPOINTS.admin.ssf.updateConfig, data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ssf'] })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useTestSSFStream(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, { message: string }, unknown>,
) {
  return useMutation({
    mutationFn: (data) => apiClient.post(ENDPOINTS.admin.ssf.test, data),
    ...options,
  })
}

export function useSSFHistory(
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['admin', 'ssf', 'history'],
    queryFn: () => apiClient.get(ENDPOINTS.admin.ssf.broadcast),
    staleTime: 1000 * 60 * 2,
    ...options,
  })
}

export function useUser(id?: number | string) {
  return useUserById(Number(id))
}

export function useGetUser(id?: number | string) {
  return useUserById(Number(id))
}

export function useResetUserMfa(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, number | string, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (id) => apiClient.post(ENDPOINTS.admin.users.resetMfa(Number(id))),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.users })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useOIDCClient(
  id?: string,
  options?: Omit<UseQueryOptions<FetchResponse<OIDCClient>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: [...ADMIN_KEYS.clients, id],
    queryFn: () => apiClient.get<OIDCClient>(ENDPOINTS.admin.clients.byId(id!)),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function useSecurityHealth(
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['admin', 'security', 'health'],
    queryFn: () => apiClient.get(ENDPOINTS.admin.security.health),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function useUpdateOrganization(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, { id: number; data: any }, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: ({ id, data }) => apiClient.patch(ENDPOINTS.admin.organizations.byId(id), data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.organizations })
      customOnSuccess?.(...args)
    },
    ...restOptions,
  })
}

export function useVerifyDomain(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, { domain: string }, unknown>,
) {
  return useMutation({
    mutationFn: (data) => apiClient.post(ENDPOINTS.admin.domains.verify, data),
    ...options,
  })
}

// ─── Aliases & missing hooks ────────────────────────────────────────────────

/** Singular alias — ConnectorDetailView imports this name */
export const useProvisioningConnector = useProvisioningConnectors

/** Fetch all pending/accepted invitations for an org */
export function useOrganizationInvitations(
  orgId: number,
  options?: Omit<UseQueryOptions<FetchResponse<OrganizationInvitation[]>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: [...ADMIN_KEYS.organizations, orgId, 'invitations'],
    queryFn: () => apiClient.get<OrganizationInvitation[]>(ENDPOINTS.admin.organizations.invitations(orgId)),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 2,
    ...options,
  })
}

/** SAML metadata stored on the server */
export function useSAMLMetadata(
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: [...ADMIN_KEYS.samlConfig, 'metadata'],
    queryFn: () => apiClient.get(ENDPOINTS.admin.saml.metadata),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

/** Fetch remote IdP metadata by URL */
export function useFetchRemoteMetadata(
  url: string,
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: [...ADMIN_KEYS.samlConfig, 'remote-metadata', url],
    queryFn: () => apiClient.post(ENDPOINTS.admin.saml.fetchRemoteMetadata, { url }),
    enabled: !!url,
    staleTime: 1000 * 60 * 2,
    ...options,
  })
}

/** Recently-used SAML entity IDs */
export function useRecentSAMLEntities(
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: [...ADMIN_KEYS.samlConfig, 'recent-entities'],
    queryFn: () => apiClient.get(ENDPOINTS.admin.saml.recentEntities),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

/** Alias — SAMLMetadataDisplay uses this name */
export const useRemoteMetadata = useFetchRemoteMetadata
