// src/Modules/Auth/hooks/useAdminQuery.ts
// ============================================================================
// Admin Query Hooks - TanStack Query hooks for admin operations
// ============================================================================
// ============================================================================
// Query Keys Factory
// ============================================================================
export const adminKeys = {
  all: ['admin'] as const,
  oidc: {
    all: ['admin', 'oidc'] as const,
    clients: () => [...adminKeys.oidc.all, 'clients'] as const,
    client: (id: string | number) => [...adminKeys.oidc.clients(), String(id)] as const,
    branding: (id: string | number) => [...adminKeys.oidc.client(id), 'branding'] as const,
  },
  users: {
    all: ['admin', 'users'] as const,
    list: (params?: any) => [...adminKeys.users.all, params] as const,
    detail: (id: string | number) => [...adminKeys.users.all, String(id)] as const,
    sessions: (id: string | number) => [...adminKeys.users.detail(id), 'sessions'] as const,
  },
  saml: {
    all: ['admin', 'saml'] as const,
    config: () => [...adminKeys.saml.all, 'config'] as const,
    metadata: () => [...adminKeys.saml.all, 'metadata'] as const,
  },
  ssf: {
    all: ['admin', 'ssf'] as const,
    config: () => [...adminKeys.ssf.all, 'config'] as const,
    history: () => [...adminKeys.ssf.all, 'history'] as const,
  },
  jwks: {
    all: ['admin', 'jwks'] as const,
    list: () => [...adminKeys.jwks.all, 'list'] as const,
    detail: (kid: string) => [...adminKeys.jwks.all, 'detail', kid] as const,
  },
  dashboard: () => ['admin', 'dashboard'] as const,
  auditLogs: (params?: any) => ['admin', 'auditLogs', params] as const,
  impersonationLogs: (params?: any) => ['admin', 'impersonationLogs', params] as const,
  appeals: {
    all: ['admin', 'appeals'] as const,
    list: (params?: any) => [...adminKeys.appeals.all, params] as const,
  },
  webhooks: {
    all: ['admin', 'webhooks'] as const,
    detail: (id: string | number) => [...adminKeys.webhooks.all, String(id)] as const,
  },
  rbac: {
    all: ['admin', 'rbac'] as const,
    permissions: () => [...adminKeys.rbac.all, 'permissions'] as const,
    policies: () => [...adminKeys.rbac.all, 'policies'] as const,
    roles: {
      all: () => [...adminKeys.rbac.all, 'roles'] as const,
      list: (params?: any) => [...adminKeys.rbac.roles.all(), params] as const,
      stats: () => [...adminKeys.rbac.roles.all(), 'stats'] as const,
      detail: (id: string | number) => [...adminKeys.rbac.roles.all(), String(id)] as const,
      permissions: (role: string) => [...adminKeys.rbac.roles.detail(role), 'permissions'] as const,
    },
  },
  organizations: {
    all: ['admin', 'organizations'] as const,
    list: (params?: any) => [...adminKeys.organizations.all, params] as const,
    detail: (id: string | number) => [...adminKeys.organizations.all, String(id)] as const,
    scimConfig: () => [...adminKeys.organizations.all, 'scimConfig'] as const,
  },
  scopes: {
    all: ['admin', 'scopes'] as const,
    list: () => [...adminKeys.scopes.all, 'list'] as const,
    detail: (id: string | number) => [...adminKeys.scopes.all, String(id)] as const,
  },
  scim: {
    all: ['admin', 'scim'] as const,
    tokens: () => [...adminKeys.scim.all, 'tokens'] as const,
  },
  provisioning: {
    all: ['admin', 'provisioning'] as const,
    connectors: () => [...adminKeys.provisioning.all, 'connectors'] as const,
    logs: (id: number) => [...adminKeys.provisioning.all, 'logs', id] as const,
  },
  statistics: {
    all: ['admin', 'statistics'] as const,
    summary: () => [...adminKeys.statistics.all, 'summary'] as const,
  },
  developerApiKeys: {
    all: ['admin', 'developer', 'apiKeys'] as const,
    list: (orgId?: number) => [...adminKeys.developerApiKeys.all, orgId] as const,
  },

  systemHealth: () => ['admin', 'systemHealth'] as const,
  systemMetrics: () => ['admin', 'systemMetrics'] as const,
}
// ============================================================================
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query'
import { FetchResponse, HttpError, PaginatedResponse } from '@cap/platform-core'
import { adminService } from '../services/adminService'
import type {
  OIDCClient,
  CreateOIDCClientRequest,
  UpdateOIDCClientRequest,
  AdminUser,
  CreateUserRequest,
  UpdateUserRequest,
  SSFConfig,
  MessageResponse,
  Role,
  Permission,
  AccessPolicy,
  Organization,
  CreateOrganizationRequest,
  OrganizationMember,
  Connector,
  ConnectorLog,
  SCIMToken,
  SAMLConfig,
  EmailTemplate,
  EmailTestRequest,
  BroadcastSSFEventRequest,
  BroadcastSSFEventResponse,
  MFAStats,
  UserStats,
  BulkActionRequest,
  BulkActionResult,
  AuthScope,
  CreateScopeRequest,
  UpdateScopeRequest,
  SCIMConfig,
  DetailedHealthReport,
  BasicMetrics,
  JWKSKey,
  JWKSKeyDetail,
  CreateJWKSKeyRequest,
  DomainVerification,
} from '../services/adminService'
// ============================================================================
// OIDC Client Management Hooks
// ============================================================================
/**
 * Get all OIDC clients
 */
export function useOIDCClients(
  _options?: Omit<UseQueryOptions<FetchResponse<OIDCClient[]>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: adminKeys.oidc.clients(),
    queryFn: () => adminService.listOIDCClients(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
/**
 * Get a specific OIDC client by ID
 */
export function useOIDCClient(
  id: string | number | null | undefined,
  _options?: Omit<UseQueryOptions<FetchResponse<OIDCClient>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: adminKeys.oidc.client(id!),
    queryFn: () => adminService.getOIDCClient(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}
/**
 * Create a new OIDC client
 */
export function useCreateOIDCClient(
  options?: UseMutationOptions<
    FetchResponse<OIDCClient>,
    HttpError,
    CreateOIDCClientRequest,
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (data) => adminService.createOIDCClient(data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.oidc.clients() })
      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}
/**
 * Update an OIDC client
 */
export function useUpdateOIDCClient(
  options?: UseMutationOptions<
    FetchResponse<OIDCClient>,
    HttpError,
    { id: string | number; data: UpdateOIDCClientRequest },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}
  return useMutation({
    mutationFn: ({ id, data }) => adminService.updateOIDCClient(id, data),
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({ queryKey: adminKeys.oidc.clients() })
      queryClient.invalidateQueries({ queryKey: adminKeys.oidc.client(variables.id) })
      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}
/**
 * Delete an OIDC client
 */
export function useDeleteOIDCClient(
  options?: UseMutationOptions<FetchResponse<MessageResponse>, HttpError, string | number, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (id) => adminService.deleteOIDCClient(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.oidc.clients() })
      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}
/**
 * Rotate client secret
 */
export function useRotateClientSecret(
  options?: UseMutationOptions<
    FetchResponse<{ client_secret: string }>,
    HttpError,
    string | number,
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (id) => adminService.rotateClientSecret(id),
    ...options,
    onSuccess: (...args) => {
      const [, clientId] = args
      queryClient.invalidateQueries({ queryKey: adminKeys.oidc.client(clientId) })
      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}
/**
 * Get client branding
 */
export function useClientBranding(
  id: string | number | null | undefined,
  _options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: adminKeys.oidc.branding(id!),
    queryFn: () => adminService.getClientBranding(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}
/**
 * Update client branding
 */
export function useUpdateClientBranding(
  options?: UseMutationOptions<
    FetchResponse<any>,
    HttpError,
    { id: string | number; data: any },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}
  return useMutation({
    mutationFn: ({ id, data }) => adminService.updateClientBranding(id, data),
    ...options,
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({
        queryKey: adminKeys.oidc.branding(variables.id),
      })
      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}
// ============================================================================
// User Management Hooks
// ============================================================================
/**
 * Get all users with pagination and filters
 */
export function useUsers(
  params?: {
    page?: number
    limit?: number
    search?: string
    role?: string
    status?: string
  },
  _options?: Omit<
    UseQueryOptions<FetchResponse<PaginatedResponse<AdminUser>>, HttpError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: adminKeys.users.list(params),
    queryFn: () => adminService.listUsers(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}
/**
 * Get a specific user by ID
 */
export function useUser(
  id: string | number | null | undefined,
  _options?: Omit<UseQueryOptions<FetchResponse<AdminUser>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: adminKeys.users.detail(id!),
    queryFn: () => adminService.getUser(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}
/**
 * Create a new user
 */
export function useCreateUser(
  options?: UseMutationOptions<FetchResponse<AdminUser>, HttpError, CreateUserRequest, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (data) => adminService.createUser(data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all })
      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}
/**
 * Update an existing user
 */
export function useUpdateUser(
  options?: UseMutationOptions<
    FetchResponse<AdminUser>,
    HttpError,
    { id: string | number; data: UpdateUserRequest },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}
  return useMutation({
    mutationFn: ({ id, data }) => adminService.updateUser(id, data),
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all })
      queryClient.invalidateQueries({ queryKey: adminKeys.users.detail(variables.id) })
      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}
/**
 * Delete a user
 */
export function useUpdateUserStatus(
  options?: UseMutationOptions<
    FetchResponse<AdminUser>,
    HttpError,
    { id: number | string; status: string; reason?: string },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, reason }) => adminService.updateUserStatus(id, status, reason),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all })
      options?.onSuccess?.(...args)
    },
  })
}
export function useDeleteUser(
  options?: UseMutationOptions<FetchResponse<MessageResponse>, HttpError, string | number, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (id) => adminService.deleteUser(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all })
      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}
/**
 * Ban a user
 */
export function useBanUser(
  options?: UseMutationOptions<
    FetchResponse<MessageResponse>,
    HttpError,
    { id: string | number; reason?: string },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}
  return useMutation({
    mutationFn: ({ id, reason }) => adminService.banUser(id, reason),
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all })
      queryClient.invalidateQueries({ queryKey: adminKeys.users.detail(variables.id) })
      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}
/**
 * Unban a user
 */
export function useUnbanUser(
  options?: UseMutationOptions<FetchResponse<MessageResponse>, HttpError, string | number, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (id) => adminService.unbanUser(id),
    onSuccess: (...args) => {
      const [, id] = args
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all })
      queryClient.invalidateQueries({ queryKey: adminKeys.users.detail(id!) })
      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}
/**
 * Reset user password
 */
export function useResetUserPassword(
  options?: UseMutationOptions<
    FetchResponse<MessageResponse>,
    HttpError,
    { id: string | number; newPassword: string },
    unknown
  >,
) {
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}
  return useMutation({
    mutationFn: ({ id, newPassword }) => adminService.resetUserPassword(id, newPassword),
    onSuccess: (...args) => {
      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}
/**
 * Reset user MFA
 */
export function useResetUserMfa(
  options?: UseMutationOptions<FetchResponse<MessageResponse>, HttpError, string | number, unknown>,
) {
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (id) => adminService.resetUserMfa(id),
    onSuccess: (...args) => {
      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}
/**
 * Impersonate a user
 */
export function useImpersonateUser(
  options?: UseMutationOptions<
    FetchResponse<{ token: string }>,
    HttpError,
    string | number,
    unknown
  >,
) {
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (id) => adminService.impersonateUser(id),
    ...options,
    onSuccess: (...args) => {
      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}
// ============================================================================
// Appeals Management Hooks
// ============================================================================
/**
 * Get appeals
 */
export function useAppeals(
  params?: { page?: number; limit?: number; status?: string },
  _options?: Omit<
    UseQueryOptions<FetchResponse<PaginatedResponse<any>>, HttpError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: adminKeys.appeals.list(params),
    queryFn: () => adminService.getAppeals(params),
  })
}
/**
 * Resolve an appeal
 */
export function useResolveAppeal(
  options?: UseMutationOptions<
    FetchResponse<MessageResponse>,
    HttpError,
    { id: number; data: { status: 'APPROVED' | 'DENIED'; reviewNotes?: string } },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}
  return useMutation({
    mutationFn: ({ id, data }) => adminService.resolveAppeal(id, data),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.appeals.all })
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all })
      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}
// ============================================================================
// SAML Configuration Hooks
// ============================================================================
/**
 * Get SAML configuration
 */
export function useSAMLConfig(
  _options?: Omit<UseQueryOptions<FetchResponse<SAMLConfig>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: adminKeys.saml.config(),
    queryFn: () => adminService.getSAMLConfig(),
    staleTime: 1000 * 60 * 10, // 10 minutes
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
  _options?: Omit<UseQueryOptions<FetchResponse<string>, HttpError>, 'queryKey' | 'queryFn'>,
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
  _options?: Omit<UseQueryOptions<FetchResponse<any[]>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['admin', 'saml', 'recent'],
    queryFn: () => adminService.listRecentSAMLEntities(),
    staleTime: 1000 * 60 * 5,
  })
}

// Domain Verification Hooks
// ============================================================================
/**
 * Verify a domain
 */
export function useVerifyDomain(
  options?: UseMutationOptions<
    FetchResponse<DomainVerification>,
    HttpError,
    { domain: string; organizationId?: number },
    unknown
  >,
) {
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}
  return useMutation({
    mutationFn: ({ domain, organizationId }) =>
      adminService.verifyDomain(organizationId ?? 0, domain),
    onSuccess: (...args) => {
      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}
/**
 * Check domain verification status
 */
export function useCheckDomain(
  options?: UseMutationOptions<
    FetchResponse<DomainVerification>,
    HttpError,
    { domainId: number; organizationId: number },
    unknown
  >,
) {
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}
  return useMutation({
    mutationFn: ({ domainId, organizationId }) =>
      adminService.checkDomain(organizationId, domainId),
    ...options,
    onSuccess: (...args) => {
      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}
// ============================================================================
// Dashboard Hooks
// ============================================================================
/**
 * Get admin dashboard stats
 */
export function useAdminDashboard(
  _options?: Omit<
    UseQueryOptions<
      FetchResponse<{
        totalUsers: number
        activeUsers: number
        newSignups: number
        failedLogins: number
        activeSessions: number
        mfaAdoption: string
        totalBanned: number
        newBans: number
        pendingAppeals: number
        systemHealth: string
      }>,
      HttpError
    >,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: () => adminService.getDashboard(),
    staleTime: 1000 * 60 * 2,
  })
}
// ============================================================================
// Audit Logs Hooks
// ============================================================================
/**
 * Get audit logs with filters
 */
export function useAuditLogs(
  params?: {
    page?: number
    limit?: number
    user_id?: number
    action?: string
    start_date?: string
    end_date?: string
  },
  _options?: Omit<
    UseQueryOptions<FetchResponse<{ logs: any[]; total: number; data?: any[] }>, HttpError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: adminKeys.auditLogs(params),
    queryFn: () => adminService.getAuditLogs(params),
    staleTime: 1000 * 60 * 2,
  })
}
/**
 * Get impersonation audit logs
 */
export function useImpersonationLogs(
  params?: { page?: number; limit?: number },
  _options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: adminKeys.impersonationLogs(params),
    queryFn: () => adminService.getImpersonationLogs(params),
    staleTime: 1000 * 60 * 2,
  })
}
// ============================================================================
// Webhook Management Hooks
// ============================================================================
/**
 * List all webhooks
 */
export function useWebhooks(
  _options?: Omit<UseQueryOptions<FetchResponse<any[]>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: adminKeys.webhooks.all,
    queryFn: () => adminService.listWebhooks(),
    staleTime: 1000 * 60 * 5,
  })
}
/**
 * Get a specific webhook
 */
export function useWebhook(
  id: string | number | null | undefined,
  _options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: adminKeys.webhooks.detail(id!),
    queryFn: () => adminService.getWebhook(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}
/**
 * Create a webhook
 */
export function useCreateWebhook(
  options?: UseMutationOptions<
    FetchResponse<any>,
    HttpError,
    { url: string; events: string[]; secret?: string },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (data) => adminService.createWebhook(data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.webhooks.all })
      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}
/**
 * Update a webhook
 */
export function useUpdateWebhook(
  options?: UseMutationOptions<
    FetchResponse<any>,
    HttpError,
    { id: string | number; data: any },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}
  return useMutation({
    mutationFn: ({ id, data }) => adminService.updateWebhook(id, data),
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({ queryKey: adminKeys.webhooks.all })
      queryClient.invalidateQueries({ queryKey: adminKeys.webhooks.detail(variables.id) })
      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}
/**
 * Delete a webhook
 */
export function useDeleteWebhook(
  options?: UseMutationOptions<FetchResponse<MessageResponse>, HttpError, string | number, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (id) => adminService.deleteWebhook(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.webhooks.all })
      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}
/**
 * Test a webhook
 */
export function useTestWebhook(
  options?: UseMutationOptions<FetchResponse<MessageResponse>, HttpError, string | number, unknown>,
) {
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (id) => adminService.testWebhook(id),
    ...options,
    onSuccess: (...args) => {
      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      customOnError?.(...args)
    },
    ...restOptions,
  })
}
// ============================================================================
// â”€â”€ ROLES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function useRoles(
  params?: { page?: number; limit?: number; search?: string },
  _options?: Omit<
    UseQueryOptions<FetchResponse<PaginatedResponse<Role>>, HttpError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: adminKeys.rbac.roles.list(params),
    queryFn: () => adminService.listRoles(params),
    staleTime: 1000 * 60 * 5,
  })
}
/** Fetch RBAC statistics */
export function useRoleStats(
  _options?: Omit<
    UseQueryOptions<
      FetchResponse<{ totalRoles: number; totalPermissions: number; totalMemberships: number }>,
      HttpError
    >,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: adminKeys.rbac.roles.stats(),
    queryFn: () => adminService.getRoleStats(),
    staleTime: 1000 * 60 * 10,
  })
}
export function useRolePermissions(
  role: string,
  _options?: Omit<UseQueryOptions<FetchResponse<Permission[]>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: adminKeys.rbac.roles.permissions(role),
    queryFn: () => adminService.getRolePermissions(role),
    enabled: !!role,
    staleTime: 1000 * 60 * 5,
  })
}
export function useRole(
  id: number | null | undefined,
  _options?: Omit<UseQueryOptions<FetchResponse<Role>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: adminKeys.rbac.roles.detail(id!),
    queryFn: () => adminService.getRole(id as number),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}
export function useUpdateRole(
  options?: UseMutationOptions<
    FetchResponse<Role>,
    HttpError,
    { id: number; data: { name?: string; description?: string } },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => adminService.updateRole(id, data),
    ...options,
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({ queryKey: adminKeys.rbac.roles.all() })
      queryClient.invalidateQueries({ queryKey: adminKeys.rbac.roles.detail(variables.id) })
      options?.onSuccess?.(...args)
    },
  })
}
export function useSyncRolePermissions(options?: any) {
  const queryClient = useQueryClient()
  const { onMutate, onError, onSuccess, onSettled, ...restOptions } = options || {}
  return useMutation<
    FetchResponse<Role>,
    HttpError,
    { roleId: number; permissionIds: number[] },
    any
  >({
    mutationFn: ({ roleId, permissionIds }) =>
      adminService.syncRolePermissions(roleId, permissionIds),
    onMutate: async (variables) => {
      const { roleId, permissionIds } = variables
      await queryClient.cancelQueries({ queryKey: adminKeys.rbac.roles.detail(roleId) })
      const previousRole = queryClient.getQueryData<FetchResponse<Role>>(
        adminKeys.rbac.roles.detail(roleId),
      )
      if (previousRole?.data) {
        const allPermissions = queryClient.getQueryData<FetchResponse<Permission[]>>(
          adminKeys.rbac.permissions(),
        )
        const newPermissions = (allPermissions?.data || []).filter((p) =>
          permissionIds.includes(p.id),
        )
        queryClient.setQueryData<FetchResponse<Role>>(adminKeys.rbac.roles.detail(roleId), {
          ...previousRole,
          data: {
            ...previousRole.data,
            permissions: newPermissions,
          },
        })
      }
      const customContext = await onMutate?.(variables)
      return { previousRole, ...customContext }
    },
    onError: (err, variables, context) => {
      if (context?.previousRole) {
        queryClient.setQueryData(
          adminKeys.rbac.roles.detail(variables.roleId),
          context.previousRole,
        )
      }
      onError?.(err, variables, context)
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.rbac.roles.all() })
      onSuccess?.(data, variables, context)
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.rbac.roles.detail(variables.roleId) })
      onSettled?.(data, error, variables, context)
    },
    ...restOptions,
  })
}
export function useSyncRoleParents(options?: any) {
  const queryClient = useQueryClient()
  const { onMutate, onError, onSuccess, onSettled, ...restOptions } = options || {}
  return useMutation<FetchResponse<Role>, HttpError, { roleId: number; parentIds: number[] }, any>({
    mutationFn: ({ roleId, parentIds }) => adminService.syncRoleParents(roleId, parentIds),
    onMutate: async (variables: any) => {
      const { roleId } = variables
      await queryClient.cancelQueries({ queryKey: adminKeys.rbac.roles.detail(roleId) })
      const previousRole = queryClient.getQueryData<FetchResponse<Role>>(
        adminKeys.rbac.roles.detail(roleId),
      )
      const customContext = await onMutate?.(variables)
      return { previousRole, ...customContext }
    },
    onError: (...args: any[]) => {
      const [, variables, context] = args
      if (context?.previousRole) {
        queryClient.setQueryData(
          adminKeys.rbac.roles.detail(variables.roleId),
          context.previousRole,
        )
      }
      return onError?.(...args)
    },
    onSuccess: (...args: any[]) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.rbac.roles.all() })
      return onSuccess?.(...args)
    },
    onSettled: (...args: any[]) => {
      const [, , variables] = args
      if (variables?.roleId) {
        queryClient.invalidateQueries({ queryKey: adminKeys.rbac.roles.detail(variables.roleId) })
      }
      return onSettled?.(...args)
    },
    ...restOptions,
  })
}
export function useCreateRole(
  options?: UseMutationOptions<
    FetchResponse<Role>,
    HttpError,
    { name: string; description?: string; guard_name?: string },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => adminService.createRole(data),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.rbac.roles.all() })
      options?.onSuccess?.(...args)
    },
  })
}
/**
 * Duplicate an existing role including its permissions
 */
export function useDuplicateRole(
  options?: UseMutationOptions<
    FetchResponse<Role>,
    HttpError,
    { role: Role; newName: string },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const createRole = useCreateRole()
  const syncPermissions = useSyncRolePermissions()
  return useMutation({
    ...options,
    mutationFn: async ({ role, newName }) => {
      // 1. Create the new role
      const createResponse = await createRole.mutateAsync({
        name: newName,
        description: role.description || undefined,
        guard_name: role.guard_name,
      })
      const newRole = createResponse.data
      // 2. Sync permissions from the source role
      if (role.permissions && role.permissions.length > 0) {
        await syncPermissions.mutateAsync({
          roleId: newRole.id,
          permissionIds: role.permissions.map((p) => p.id),
        })
      }
      return createResponse
    },
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.rbac.roles.all() })
      options?.onSuccess?.(...args)
    },
  })
}
export function useDeleteRole(
  options?: UseMutationOptions<FetchResponse<MessageResponse>, HttpError, number, unknown>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => adminService.deleteRole(id),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.rbac.roles.all() })
      options?.onSuccess?.(...args)
    },
  })
}
// â”€â”€ PERMISSIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function usePermissions(
  _options?: Omit<UseQueryOptions<FetchResponse<Permission[]>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: adminKeys.rbac.permissions(),
    queryFn: () => adminService.listPermissions(),
    staleTime: 1000 * 60 * 5,
  })
}
export function useCreatePermission(
  options?: UseMutationOptions<
    FetchResponse<Permission>,
    HttpError,
    { name: string; guard_name?: string; resource?: string; description?: string },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => adminService.createPermission(data),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.rbac.permissions() })
      options?.onSuccess?.(...args)
    },
  })
}
export function useUpdatePermission(
  options?: UseMutationOptions<
    FetchResponse<Permission>,
    HttpError,
    {
      id: number
      data: { name?: string; guard_name?: string; resource?: string; description?: string }
    },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => adminService.updatePermission(id, data),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.rbac.permissions() })
      options?.onSuccess?.(...args)
    },
  })
}
export function useDeletePermission(
  options?: UseMutationOptions<FetchResponse<MessageResponse>, HttpError, number, unknown>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => adminService.deletePermission(id),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.rbac.permissions() })
      options?.onSuccess?.(...args)
    },
  })
}
// â”€â”€ ACCESS POLICIES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function useAccessPolicies(
  orgId: number | null | undefined,
  _options?: Omit<
    UseQueryOptions<FetchResponse<AccessPolicy[]>, HttpError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: [...adminKeys.rbac.policies(), orgId],
    queryFn: () => adminService.getAccessPolicies(orgId!),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5,
  })
}
export function useSaveAccessPolicies(
  orgId: number | null | undefined,
  options?: Omit<
    UseMutationOptions<FetchResponse<MessageResponse>, HttpError, AccessPolicy[], unknown>,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (policies) => adminService.saveAccessPolicies(orgId!, policies),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: [...adminKeys.rbac.policies(), orgId],
      })
      options?.onSuccess?.(...args)
    },
  })
}

export function useSimulatePolicy(
  options?: UseMutationOptions<
    FetchResponse<any>,
    HttpError,
    {
      graph: any
      request: {
        subject: Record<string, any>
        action: string
        resource: Record<string, any>
        environment?: Record<string, any>
      }
    },
    unknown
  >,
) {
  return useMutation({
    mutationFn: (data) => adminService.simulatePolicyGraph(data),
    ...options,
  })
}

export function useCompilePolicy(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, { graph: any }, unknown>,
) {
  return useMutation({
    mutationFn: (data) => adminService.compilePolicyGraph(data),
    ...options,
  })
}

export function useDecompilePolicy(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, { policySet: any }, unknown>,
) {
  return useMutation({
    mutationFn: (data) => adminService.decompilePolicySet(data),
    ...options,
  })
}

export function useDefaultPolicySet(
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: [...adminKeys.rbac.policies(), 'default'],
    queryFn: () => adminService.getDefaultPolicySet(),
    staleTime: 1000 * 60 * 10,
    ...options,
  })
}

export function useEvaluatePolicy(
  options?: UseMutationOptions<
    FetchResponse<{
      effect: 'Permit' | 'Deny' | 'NotApplicable' | 'Indeterminate'
      reasons?: string[]
      traces?: any[]
    }>,
    HttpError,
    {
      policySet?: any
      request: {
        subject: Record<string, any>
        action: string
        resource: Record<string, any>
        environment?: Record<string, any>
      }
    },
    unknown
  >,
) {
  return useMutation({
    mutationFn: (data) => adminService.evaluatePolicy(data),
    ...options,
  })
}

export function useMemberOverrides(
  memberId: number | null | undefined,
  orgId: number | null | undefined,
  options?: Omit<UseQueryOptions<FetchResponse<any[]>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['admin', 'members', memberId, 'overrides', orgId],
    queryFn: () => adminService.getMemberOverrides(memberId!, orgId!),
    enabled: !!memberId && !!orgId,
    staleTime: 1000 * 60 * 2,
    ...options,
  })
}

export function useAddMemberOverride(
  options?: UseMutationOptions<
    FetchResponse<MessageResponse>,
    HttpError,
    { memberId: number; orgId: number; override: { permissionId: number; grant: boolean } },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ memberId, orgId, override }) =>
      adminService.addMemberOverride(memberId, orgId, override),
    ...options,
    onSuccess: (...args) => {
      const [, vars] = args
      queryClient.invalidateQueries({
        queryKey: ['admin', 'members', vars.memberId, 'overrides', vars.orgId],
      })
      queryClient.invalidateQueries({ queryKey: adminKeys.rbac.roles.all() })
      options?.onSuccess?.(...args)
    },
  })
}

export function useRemoveMemberOverride(
  options?: UseMutationOptions<
    FetchResponse<MessageResponse>,
    HttpError,
    { memberId: number; orgId: number; permissionId: number },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ memberId, orgId, permissionId }) =>
      adminService.removeMemberOverride(memberId, orgId, permissionId),
    ...options,
    onSuccess: (...args) => {
      const [, vars] = args
      queryClient.invalidateQueries({
        queryKey: ['admin', 'members', vars.memberId, 'overrides', vars.orgId],
      })
      queryClient.invalidateQueries({ queryKey: adminKeys.rbac.roles.all() })
      options?.onSuccess?.(...args)
    },
  })
}

export function useDeveloperApiKeys(
  orgId?: number,
  options?: Omit<UseQueryOptions<FetchResponse<any[]>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: adminKeys.developerApiKeys.list(orgId),
    queryFn: () => adminService.getDeveloperApiKeys(orgId || 1),
    staleTime: 1000 * 60 * 2,
    ...options,
  })
}

export function useCreateDeveloperApiKey(
  options?: UseMutationOptions<
    FetchResponse<{ message: string; key: string; data: any }>,
    HttpError,
    { orgId: number; data: { name: string; expiresAt?: string } },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orgId, data }) => adminService.createDeveloperApiKey(orgId, data),
    ...options,
    onSuccess: (...args) => {
      const [, vars] = args
      queryClient.invalidateQueries({ queryKey: adminKeys.developerApiKeys.list(vars.orgId) })
      queryClient.invalidateQueries({ queryKey: adminKeys.developerApiKeys.all })
      options?.onSuccess?.(...args)
    },
  })
}

export function useRevokeDeveloperApiKey(
  options?: UseMutationOptions<
    FetchResponse<MessageResponse>,
    HttpError,
    { orgId: number; keyId: number },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orgId, keyId }) => adminService.revokeDeveloperApiKey(orgId, keyId),
    ...options,
    onSuccess: (...args) => {
      const [, vars] = args
      queryClient.invalidateQueries({ queryKey: adminKeys.developerApiKeys.list(vars.orgId) })
      queryClient.invalidateQueries({ queryKey: adminKeys.developerApiKeys.all })
      options?.onSuccess?.(...args)
    },
  })
}
export function useGrantPermission(
  options?: UseMutationOptions<
    FetchResponse<MessageResponse>,
    HttpError,
    { user_id: number; permission_id: number },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => adminService.grantPermission(data),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.rbac.roles.all() })
      options?.onSuccess?.(...args)
    },
  })
}
export function useRevokePermission(
  options?: UseMutationOptions<
    FetchResponse<MessageResponse>,
    HttpError,
    { user_id: number; permission_id: number },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => adminService.revokePermission(data),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.rbac.roles.all() })
      options?.onSuccess?.(...args)
    },
  })
}
// ============================================================================
// â”€â”€ ORGANIZATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function useOrganizations(
  params?: { page?: number; limit?: number; search?: string },
  _options?: Omit<
    UseQueryOptions<FetchResponse<PaginatedResponse<Organization>>, HttpError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: adminKeys.organizations.list(params),
    queryFn: () => adminService.listOrganizations(params),
    staleTime: 1000 * 60 * 2,
  })
}
export function useOrganization(
  id: number | null | undefined,
  _options?: Omit<UseQueryOptions<FetchResponse<Organization>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: adminKeys.organizations.detail(id!),
    queryFn: () => adminService.getOrganization(id as number),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}
export function useCreateOrganization(
  options?: UseMutationOptions<
    FetchResponse<Organization>,
    HttpError,
    CreateOrganizationRequest,
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (data) => adminService.createOrganization(data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.organizations.all })
      onSuccess?.(...args)
    },
    ...restOptions,
  })
}
export function useUpdateOrganization(
  options?: UseMutationOptions<
    FetchResponse<Organization>,
    HttpError,
    { id: number; data: Partial<Organization> },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: ({ id, data }) => adminService.updateOrganization(id, data),
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({ queryKey: adminKeys.organizations.all })
      queryClient.invalidateQueries({ queryKey: adminKeys.organizations.detail(variables.id) })
      onSuccess?.(...args)
    },
    ...restOptions,
  })
}
export function useImpersonateOrganization(
  options?: UseMutationOptions<
    FetchResponse<{ token: string; user: any }>,
    HttpError,
    number,
    unknown
  >,
) {
  return useMutation({
    mutationFn: (id) => adminService.impersonateOrganization(id),
    ...options,
  })
}
export function useDeleteOrganization(
  options?: UseMutationOptions<FetchResponse<MessageResponse>, HttpError, number, unknown>,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (id) => adminService.deleteOrganization(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.organizations.all })
      onSuccess?.(...args)
    },
    ...restOptions,
  })
}
export function useAddOrganizationMember(
  options?: UseMutationOptions<
    FetchResponse<OrganizationMember>,
    HttpError,
    { orgId: number; data: { user_id: number; role: string } },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: ({ orgId, data }) => adminService.addOrganizationMember(orgId, data),
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({ queryKey: adminKeys.organizations.detail(variables.orgId) })
      onSuccess?.(...args)
    },
    ...restOptions,
  })
}
export function useRemoveOrganizationMember(
  options?: UseMutationOptions<
    FetchResponse<MessageResponse>,
    HttpError,
    { orgId: number; userId: number },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orgId, userId }) => adminService.removeOrganizationMember(orgId, userId),
    ...options,
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({ queryKey: adminKeys.organizations.detail(variables.orgId) })
      options?.onSuccess?.(...args)
    },
  })
}
export function useOrganizationInvitations(
  orgId: number | null | undefined,
  _options?: Omit<UseQueryOptions<FetchResponse<any[]>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: [...adminKeys.organizations.detail(orgId!), 'invitations'],
    queryFn: () => adminService.getOrganizationInvitations(orgId!),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5,
  })
}
export function useInviteOrganizationMember(
  options?: UseMutationOptions<
    FetchResponse<any>,
    HttpError,
    { orgId: number; data: { email: string; role: string } },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orgId, data }) => adminService.inviteToOrganization(orgId, data as any),
    ...options,
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({
        queryKey: [...adminKeys.organizations.detail(variables.orgId), 'invitations'],
      })
      options?.onSuccess?.(...args)
    },
  })
}
export function useRevokeOrganizationInvitation(
  options?: UseMutationOptions<
    FetchResponse<any>,
    HttpError,
    { orgId: number; invitationId: number | string },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orgId, invitationId }) =>
      adminService.revokeOrganizationInvitation(orgId, invitationId),
    ...options,
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({
        queryKey: [...adminKeys.organizations.detail(variables.orgId), 'invitations'],
      })
      options?.onSuccess?.(...args)
    },
  })
}
export function useUploadOrganizationLogo(
  options?: UseMutationOptions<
    FetchResponse<{ logo_url: string }>,
    HttpError,
    { id: number; file: File },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }) => adminService.uploadOrganizationLogo(id, file),
    ...options,
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({ queryKey: adminKeys.organizations.all })
      queryClient.invalidateQueries({ queryKey: adminKeys.organizations.detail(variables.id) })
      options?.onSuccess?.(...args)
    },
  })
}
/**
 * Get organization policies
 */
export function useOrganizationPolicies(
  orgId: number | null | undefined,
  _options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: [...adminKeys.organizations.detail(orgId!), 'policies'],
    queryFn: () => adminService.getOrganizationPolicies(orgId!),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5,
  })
}
/**
 * Update organization policies
 */
export function useUpdateOrganizationPolicies(
  options?: UseMutationOptions<
    FetchResponse<any>,
    HttpError,
    { orgId: number; data: any },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orgId, data }) => adminService.updateOrganizationPolicies(orgId, data),
    ...options,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...adminKeys.organizations.detail(variables.orgId), 'policies'],
      })
    },
  })
}
// ============================================================================
// â”€â”€ PROVISIONING & SCIM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function useSCIMTokens(
  _options?: Omit<UseQueryOptions<FetchResponse<SCIMToken[]>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: adminKeys.scim.tokens(),
    queryFn: () => adminService.listSCIMTokens(),
    staleTime: 1000 * 60 * 10,
  })
}
export function useCreateSCIMToken(
  options?: UseMutationOptions<
    FetchResponse<SCIMToken>,
    HttpError,
    { label: string; expiresAt?: string },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => adminService.createSCIMToken(data),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.scim.tokens() })
      options?.onSuccess?.(...args)
    },
  })
}
export function useRevokeSCIMToken(
  options?: UseMutationOptions<FetchResponse<MessageResponse>, HttpError, number, unknown>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => adminService.revokeSCIMToken(id as number),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.scim.tokens() })
      options?.onSuccess?.(...args)
    },
  })
}
export function useProvisioningConnectors(
  _options?: Omit<UseQueryOptions<FetchResponse<Connector[]>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: adminKeys.provisioning.connectors(),
    queryFn: () => adminService.listConnectors(),
    staleTime: 1000 * 60 * 5,
  })
}
export function useProvisioningConnector(
  id: number,
  _options?: Omit<UseQueryOptions<FetchResponse<Connector>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: [...adminKeys.provisioning.all, 'detail', id],
    queryFn: () => adminService.getConnector(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}
export function useUpdateProvisioningConnector(
  options?: UseMutationOptions<
    FetchResponse<Connector>,
    HttpError,
    { id: number; data: Partial<Connector> },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => adminService.updateConnector(id, data),
    ...options,
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({ queryKey: adminKeys.provisioning.all })
      queryClient.invalidateQueries({
        queryKey: [...adminKeys.provisioning.all, 'detail', variables.id],
      })
      options?.onSuccess?.(...args)
    },
  })
}
export function useDeleteProvisioningConnector(
  options?: UseMutationOptions<FetchResponse<MessageResponse>, HttpError, number, unknown>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => adminService.deleteConnector(id),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.provisioning.all })
      options?.onSuccess?.(...args)
    },
  })
}
export function useSyncProvisioningConnector(
  options?: UseMutationOptions<FetchResponse<MessageResponse>, HttpError, number, unknown>,
) {
  return useMutation({
    mutationFn: (id) => adminService.syncConnector(id),
    ...options,
  })
}
export function useCreateProvisioningConnector(
  options?: UseMutationOptions<
    FetchResponse<Connector>,
    HttpError,
    {
      name: string
      type: Connector['type']
      organizationId: number
      config: Record<string, unknown>
    },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => adminService.createConnector(data),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.provisioning.all })
      options?.onSuccess?.(...args)
    },
  })
}
export function useProvisioningConnectorLogs(
  id: number,
  params?: { page?: number; limit?: number },
  options?: Omit<
    UseQueryOptions<FetchResponse<PaginatedResponse<ConnectorLog>>, HttpError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: adminKeys.provisioning.logs(id),
    queryFn: () => adminService.getConnectorLogs(id, params),
    enabled: id > 0,
    ...options,
  })
}
// ============================================================================
// Admin User Action Hooks
// ============================================================================
export function useUnlockUser(
  options?: UseMutationOptions<FetchResponse<MessageResponse>, HttpError, number, unknown>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => adminService.unlockUser(id as number),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all })
      options?.onSuccess?.(...args)
    },
  })
}
export function useAssignRole(
  options?: UseMutationOptions<
    FetchResponse<MessageResponse>,
    HttpError,
    { id: number; roleId: number },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, roleId }) => adminService.assignRoleToUser(id as number, roleId as number),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all })
      options?.onSuccess?.(...args)
    },
  })
}
/**
 * Handle mass user actions
 */
export function useBulkUserAction(
  options?: UseMutationOptions<
    FetchResponse<BulkActionResult>,
    HttpError,
    BulkActionRequest,
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (data) => adminService.bulkAction(data),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all })
      onSuccess?.(...args)
    },
    ...restOptions,
  })
}
/**
 * Get active sessions for a specific user
 */
export function useUserSessions(
  userId: number | string | null | undefined,
  _options?: Omit<UseQueryOptions<FetchResponse<any[]>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: adminKeys.users.sessions(userId!),
    queryFn: () => adminService.getUserSessions(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}
// ============================================================================
// â”€â”€ STATISTICS & EMAILS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function useMFAStats(
  _options?: Omit<UseQueryOptions<FetchResponse<MFAStats>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: [...adminKeys.statistics.all, 'mfa'],
    queryFn: () => adminService.getMFAStats(),
    staleTime: 1000 * 60 * 5,
  })
}
export function useUserStats(
  _options?: Omit<UseQueryOptions<FetchResponse<UserStats>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: [...adminKeys.statistics.all, 'users'],
    queryFn: () => adminService.getUserStats(),
    staleTime: 1000 * 60 * 5,
  })
}
export function useEmailTemplates(
  _options?: Omit<
    UseQueryOptions<FetchResponse<EmailTemplate[]>, HttpError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: ['admin', 'email', 'templates'],
    queryFn: () => adminService.getEmailTemplates(),
    staleTime: 1000 * 60 * 10,
  })
}
export function useSendTestEmail(
  options?: UseMutationOptions<
    FetchResponse<MessageResponse>,
    HttpError,
    EmailTestRequest,
    unknown
  >,
) {
  return useMutation({
    mutationFn: (data) => adminService.sendTestEmail(data),
    ...options,
  })
}
export function useExportAuditLogs(
  options?: UseMutationOptions<
    FetchResponse<Blob>,
    HttpError,
    | {
        startDate?: string
        endDate?: string
        format?: 'csv' | 'json'
        type?: string
        user_id?: number
      }
    | undefined,
    unknown
  >,
) {
  return useMutation({
    mutationFn: (params) => adminService.exportAuditLogs(params),
    ...options,
  })
}
export const useSecurityHealth = () => {
  return useQuery({
    queryKey: ['admin', 'security', 'health'],
    queryFn: () => adminService.getSecurityHealth(),
  })
}

// ============================================================================
// Developer Platform â€” Scopes
// ============================================================================

export function useScopes(
  options?: Omit<UseQueryOptions<FetchResponse<AuthScope[]>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: adminKeys.scopes.list(),
    queryFn: () => adminService.listScopes(),
    ...options,
  })
}

export function useScope(
  id: number | null | undefined,
  options?: Omit<UseQueryOptions<FetchResponse<AuthScope>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: adminKeys.scopes.detail(id!),
    queryFn: () => adminService.getScope(id!),
    enabled: !!id,
    ...options,
  })
}

export function useCreateScope(
  options?: UseMutationOptions<FetchResponse<AuthScope>, HttpError, CreateScopeRequest, unknown>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => adminService.createScope(data),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.scopes.all })
      options?.onSuccess?.(...args)
    },
  })
}

export function useUpdateScope(
  options?: UseMutationOptions<
    FetchResponse<AuthScope>,
    HttpError,
    { id: number; data: UpdateScopeRequest },
    unknown
  >,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => adminService.updateScope(id, data),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.scopes.all })
      options?.onSuccess?.(...args)
    },
  })
}

export function useDeleteScope(
  options?: UseMutationOptions<FetchResponse<MessageResponse>, HttpError, number, unknown>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => adminService.deleteScope(id),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.scopes.list() })
      options?.onSuccess?.(...args)
    },
  })
}

// ============================================================================
// Organization SCIM Hooks
// ============================================================================
/**
 * Get organization SCIM configuration
 */
export function useOrganizationScimConfig(
  options?: Omit<UseQueryOptions<FetchResponse<SCIMConfig>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: adminKeys.organizations.scimConfig(),
    queryFn: () => adminService.getOrganizationScimConfig() as any,
    ...options,
  })
}

/**
 * Update organization SCIM configuration
 */
export function useUpdateOrganizationScimConfig(
  options?: UseMutationOptions<
    FetchResponse<{ message: string; scimConfig: SCIMConfig }>,
    HttpError,
    Partial<SCIMConfig>,
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (data) => adminService.updateOrganizationScimConfig(data) as any,
    ...restOptions,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: adminKeys.organizations.scimConfig(),
      })
      if (options?.onSuccess) {
        options.onSuccess(...args)
      }
    },
  })
}

/**
 * Test SCIM connection
 */
export function useTestSCIMConnection(
  options?: UseMutationOptions<
    FetchResponse<{ status: string; message: string; diagnostics: any }>,
    HttpError,
    void,
    unknown
  >,
) {
  return useMutation({
    mutationFn: () => adminService.testSCIMConnection(),
    ...options,
  })
}

// ============================================================================
// System Health Hooks
// ============================================================================

/**
 * Get detailed system health status
 */
export function useSystemHealth(
  options?: Omit<
    UseQueryOptions<FetchResponse<DetailedHealthReport>, HttpError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: adminKeys.systemHealth(),
    queryFn: () => adminService.getSystemHealth(),
    staleTime: 1000 * 10,
    ...options,
  })
}

/**
 * Get basic system metrics
 */
export function useSystemMetrics(
  options?: Omit<UseQueryOptions<FetchResponse<BasicMetrics>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: adminKeys.systemMetrics(),
    queryFn: () => adminService.getSystemMetrics(),
    staleTime: 1000 * 10,
    ...options,
  })
}

// ============================================================================
// SSF Configuration Hooks
// ============================================================================

export function useSSFConfig(
  options?: Omit<UseQueryOptions<FetchResponse<SSFConfig>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: adminKeys.ssf.config(),
    queryFn: () => adminService.getSSFConfig(),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function useUpdateSSFConfig(
  options?: Omit<
    UseMutationOptions<FetchResponse<{ message: string; config: SSFConfig }>, HttpError, SSFConfig>,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (config: SSFConfig) => adminService.updateSSFConfig(config),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.ssf.config() })
      if (options?.onSuccess) {
        options.onSuccess(...args)
      }
    },
    ...options,
  })
}

export function useTestSSFStream(
  options?: Omit<
    UseMutationOptions<
      FetchResponse<{ success: boolean; message: string; timestamp: string }>,
      HttpError,
      void
    >,
    'mutationFn'
  >,
) {
  return useMutation({
    mutationFn: () => adminService.testSSFStream(),
    ...options,
  })
}

export function useBroadcastSSFEvent(
  options?: Omit<
    UseMutationOptions<
      FetchResponse<BroadcastSSFEventResponse>,
      HttpError,
      BroadcastSSFEventRequest
    >,
    'mutationFn'
  >,
) {
  return useMutation({
    mutationFn: (data: BroadcastSSFEventRequest) => adminService.broadcastSSFEvent(data),
    ...options,
  })
}

export function useSSFHistory(
  options?: Omit<UseQueryOptions<FetchResponse<any[]>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: adminKeys.ssf.history(),
    queryFn: () => adminService.getSSFHistory(),
    staleTime: 1000 * 30, // 30 seconds
    ...options,
  })
}
// ============================================================================
// JWKS Management Hooks
// ============================================================================

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
