import { apiClient, FetchResponse, PaginatedResponse } from '@cap/platform-core';
import { ENDPOINTS } from '@cap/platform-core';
import type { SCIMConfig } from '../../../domain-kernel/src/types';
import type { SAMLConfig, JWKSKey, CreateJWKSKeyRequest, JWKSKeyDetail, SSFConfig, BroadcastSSFEventRequest, BroadcastSSFEventResponse } from '../../../domain-kernel/src/types';
import type { AccessPolicy, Role, Permission } from '@cap/shared-types';
export type { AccessPolicy, Role, Permission };
export type { SCIMConfig }
export type { SAMLConfig, JWKSKey, CreateJWKSKeyRequest, JWKSKeyDetail, SSFConfig, BroadcastSSFEventRequest, BroadcastSSFEventResponse }

// ============================================================================
// Type Definitions
// ============================================================================

export interface DependencyStatus {
  id: string
  name: string
  description: string
  status: 'healthy' | 'degraded' | 'outage'
  responseTime: string | number
  version: string
}

export interface DetailedHealthReport {
  status: 'healthy' | 'degraded' | 'unhealthy'
  healthScore: number
  lastCheck: string
  timestamp: string
  environment: string
  appVersion: string
  uptime: string
  server: string
  dependencies: Array<DependencyStatus>
}

export interface BasicMetrics {
  uptime: number
  memoryUsage: {
    rss: number
    heapTotal: number
    heapUsed: number
    external: number
    arrayBuffers: number
  }
  timestamp: string
}


export interface RolePermissionSyncRequest {
  permission_ids: number[]
}

export interface MemberOverride {
  id: number
  memberId: number
  permissionId: number
  grant: boolean
  permission?: {
    id: number
    name: string
    resource: string
  }
}

export interface OrganizationMembership {
  id: number
  user_id: number
  organization_id: number
  role_id: number
  organization?: {
    id: number
    name: string
    slug: string
  }
}

export interface Organization {
  id: number
  name: string
  slug: string
  status?: string
  domain: string | null
  support_email?: string | null
  logo_url: string | null
  members_count: number

  domainVerifications?: {
    id: number
    domain: string
    status: string
    verified_at: string
    verification_token: string
  }[]
  created_at: string
  updated_at: string
  brandingConfig?: {
    primaryColor?: string
    secondaryColor?: string
    logo_url?: string
    [key: string]: any
  }
  securityPolicies?: {
    enforceMfa?: boolean
    ssoOnly?: boolean
    allowPublicSignup?: boolean
    [key: string]: any
  }
  members?: OrganizationMember[]
}

export interface OrganizationMember {
  id: number
  user_id: number
  organization_id: number
  role: string
  user: {
    id: number
    email: string
    full_name: string
    avatar_url: string | null
  }
  joined_at: string
}

export interface OrganizationInvitation {
  id: number
  email: string
  role: string
  status: 'pending' | 'accepted' | 'expired'
  expires_at: string
  created_at: string
}

export interface CreateOrganizationRequest {
  name: string
  slug: string
  domain?: string
}

export interface InviteToOrganizationRequest {
  email: string
  role: string
  message?: string
}

export interface Connector {
  id: number
  name: string
  type: 'scim' | 'ldap' | 'azure_ad' | 'okta' | 'google' | string
  status: 'active' | 'inactive' | 'error' | string
  last_sync_at: string | null
  sync_count: number
  error_message: string | null
  config: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ConnectorLog {
  id: number
  connector_id: number
  action: string
  event?: string
  status: 'success' | 'error' | 'warning' | string
  details: string
  records_processed: number
  created_at: string
  createdAt?: string
}

export interface SCIMToken {
  id: number
  name: string
  description: string | null
  last_used_at: string | null
  created_at: string
  // token only present on creation
  token?: string
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  preview_text: string
  category: string
  last_modified: string
}

export interface EmailTestRequest {
  template_id: string
  recipient: string
  variables?: Record<string, string>
}

export interface MFAStats {
  total_enabled: number
  totp_count: number
  passkey_count: number
  adoption_rate: number
  daily_challenges: Array<{ date: string; count: number }>
}

export interface UserStats {
  total: number
  active: number
  inactive: number
  banned: number
  new_today: number
  new_this_week: number
}

export type BulkActionType = 'activate' | 'deactivate' | 'delete' | 'assign_role' | 'ban'

export interface BulkActionRequest {
  ids: number[]
  action: BulkActionType
  payload?: { role_id?: number; reason?: string }
}

export interface BulkActionResult {
  succeeded: number[]
  failed: Array<{ id: number; reason: string }>
}

export interface OIDCClient {
  id: string | number
  client_id: string
  client_name: string
  client_secret?: string
  type: string
  description: string | null
  status: string
  scopes: string[]
  redirect_uris: string[]
  grant_types: string[]
  response_types: string[]
  token_endpoint_auth_method: string
  is_fapi_compliant: boolean
  created_at: string
  updated_at: string
}

export interface CreateOIDCClientRequest {
  name: string
  redirectUris: string[]
  grantTypes?: string[]
  responseTypes?: string[]
  scope?: string
  token_endpoint_auth_method?: string
  is_fapi_compliant?: boolean
}

export interface UpdateOIDCClientRequest {
  name?: string
  redirectUris?: string[]
  grantTypes?: string[]
  responseTypes?: string[]
  scope?: string
  token_endpoint_auth_method?: string
  is_fapi_compliant?: boolean
  description?: string
}

export interface AuthScope {
  id: number
  name: string
  displayName?: string
  description?: string
  isSystem?: boolean
  permissionsMapping?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateScopeRequest {
  name: string
  displayName?: string
  description?: string
}
export interface MessageResponse {
  message: string
}

export interface DomainVerification {
  id: number
  organization_id: number
  domain: string
  status: 'pending' | 'verified' | 'failed'
  verification_token: string
  verified_at: string | null
  created_at: string
  updated_at: string
}

export interface DeveloperApiKey {
  id: number
  name: string
  prefix: string
  organization_id: number
  user_id: number
  expires_at: string | null
  last_used_at: string | null
  created_at: string
  updated_at: string
  key?: string
}

export interface CreateUserRequest {
  email: string
  password: string
  firstname: string
  lastname: string
  role_id?: number
}

export interface UpdateUserRequest {
  email?: string
  firstname?: string
  lastname?: string
  role_id?: number
  is_active?: boolean
  apiAccessEnabled?: boolean
  maintenanceModeBypass?: boolean
}

export interface UpdateScopeRequest {
  name?: string
  displayName?: string
  description?: string
}

export interface AdminUser {
  id: number
  email: string
  firstName: string
  lastName: string
  role: number
  phone: string | null
  sexe: string | null
  avatarUrl: string | null
  isActif: boolean
  emailVerified: boolean | string | null
  emailVerifiedAt: string | null
  isTermsSign: boolean
  mfaEnabled: boolean
  mfaEnrolledAt: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED' | string
  suspendedReason?: string | null
  isAdmin: boolean
  apiAccessEnabled: boolean
  maintenanceModeBypass: boolean
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Admin Service Class
// ============================================================================

export class AdminService {
  // ==========================================================================
  // OIDC Client Management
  // ==========================================================================

  /**
   * Get all OIDC clients
   */
  async listOIDCClients(): Promise<FetchResponse<OIDCClient[]>> {
    return apiClient.get<OIDCClient[]>('/api/admin/clients')
  }

  /**
   * Get a specific OIDC client by ID
   */
  async getOIDCClient(id: string | number): Promise<FetchResponse<OIDCClient>> {
    return apiClient.get<OIDCClient>(`/api/admin/clients/${id}`)
  }

  /**
   * Create a new OIDC client
   */
  async createOIDCClient(data: CreateOIDCClientRequest): Promise<FetchResponse<OIDCClient>> {
    return apiClient.post<OIDCClient>('/api/admin/clients', data)
  }

  /**
   * Update an existing OIDC client
   */
  async updateOIDCClient(
    id: string | number,
    data: UpdateOIDCClientRequest,
  ): Promise<FetchResponse<OIDCClient>> {
    return apiClient.patch<OIDCClient>(`/api/admin/clients/${id}`, data)
  }

  /**
   * Delete an OIDC client
   */
  async deleteOIDCClient(id: string | number): Promise<FetchResponse<MessageResponse>> {
    return apiClient.delete<MessageResponse>(`/api/admin/clients/${id}`)
  }

  /**
   * Rotate client secret
   */
  async rotateClientSecret(id: string | number): Promise<FetchResponse<{ client_secret: string }>> {
    return apiClient.post<{ client_secret: string }>(`/api/admin/clients/${id}/rotate-secret`)
  }

  /**
   * Get client branding
   */
  async getClientBranding(id: string | number): Promise<FetchResponse<any>> {
    return apiClient.get(`/api/admin/clients/${id}/branding`)
  }

  /**
   * Update client branding
   */
  async updateClientBranding(id: string | number, data: any): Promise<FetchResponse<any>> {
    return apiClient.patch(`/api/admin/clients/${id}/branding`, data)
  }

  // ==========================================================================
  // User Management
  // ==========================================================================

  /**
   * Get all users with optional filters
   */
  async listUsers(params?: {
    page?: number
    limit?: number
    search?: string
    role?: string
    status?: string
  }): Promise<FetchResponse<PaginatedResponse<AdminUser>>> {
    return apiClient.get('/api/admin/users', { params })
  }

  /**
   * Get a specific user by ID
   */
  async getUser(id: string | number): Promise<FetchResponse<AdminUser>> {
    return apiClient.get<AdminUser>(`/api/admin/users/${id}`)
  }

  /**
   * Create a new user
   */
  async createUser(data: CreateUserRequest): Promise<FetchResponse<AdminUser>> {
    return apiClient.post<AdminUser>('/api/admin/users', data)
  }

  /**
   * Update an existing user
   */
  async updateUser(
    id: string | number,
    data: UpdateUserRequest,
  ): Promise<FetchResponse<AdminUser>> {
    return apiClient.put<AdminUser>(`/api/admin/users/${id}`, data)
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string | number): Promise<FetchResponse<MessageResponse>> {
    return apiClient.delete<MessageResponse>(`/api/admin/users/${id}`)
  }

  /**
   * Ban a user
   */
  async banUser(id: string | number, reason?: string): Promise<FetchResponse<MessageResponse>> {
    return apiClient.patch<MessageResponse>(ENDPOINTS.admin.users.ban(id as number), { reason })
  }

  /**
   * Unban a user
   */
  async unbanUser(id: string | number, _reason?: string): Promise<FetchResponse<MessageResponse>> {
    return apiClient.post<MessageResponse>(ENDPOINTS.admin.users.unsuspend(id as number))
  }

  /**
   * Reset user password
   */
  async resetUserPassword(
    id: string | number,
    newPassword?: string,
  ): Promise<FetchResponse<MessageResponse>> {
    return apiClient.post<MessageResponse>(ENDPOINTS.admin.users.resetPassword(id as number), {
      password: newPassword,
    })
  }

  /**
   * Reset user MFA
   */
  async resetUserMfa(id: string | number): Promise<FetchResponse<MessageResponse>> {
    return apiClient.post<MessageResponse>(ENDPOINTS.admin.users.resetMfa(id as number))
  }

  /**
   * Impersonate a user
   */
  async impersonateUser(id: string | number): Promise<FetchResponse<{ token: string }>> {
    return apiClient.post<{ token: string }>(`/api/admin/users/${id}/impersonate`)
  }

  /**
   * Unlock a user account
   */
  async unlockUser(id: number): Promise<FetchResponse<MessageResponse>> {
    return apiClient.post<MessageResponse>(ENDPOINTS.admin.users.unlock(id))
  }

  /**
   * Assign a role to a user
   */
  async assignRoleToUser(userId: number, roleId: number): Promise<FetchResponse<MessageResponse>> {
    return apiClient.post<MessageResponse>(ENDPOINTS.admin.users.assignRole(userId), {
      role_id: roleId,
    })
  }

  /**
   * Handle mass user actions
   */
  async bulkAction(data: BulkActionRequest): Promise<FetchResponse<BulkActionResult>> {
    return apiClient.post<BulkActionResult>(ENDPOINTS.admin.users.bulkAction, data)
  }

  /**
   * Get active sessions for a specific user
   */
  async getUserSessions(id: number | string): Promise<FetchResponse<any[]>> {
    return apiClient.get<any[]>(ENDPOINTS.admin.users.sessions(id as number))
  }

  /**
   * Upload an organization logo
   */
  async uploadOrganizationLogo(
    id: number,
    file: File,
  ): Promise<FetchResponse<{ logo_url: string }>> {
    const form = new FormData()
    form.append('logo', file)
    return apiClient.uploadFormData<{ logo_url: string }>(
      ENDPOINTS.admin.organizations.logo(id),
      { logo: file },
      'post',
    )
  }

  // ==========================================================================
  // SAML Configuration
  // ==========================================================================

  /**
   * Get SAML configuration
   */
  async getSAMLConfig(): Promise<FetchResponse<SAMLConfig>> {
    return apiClient.get<SAMLConfig>('/api/admin/saml/config')
  }

  /**
   * Update SAML configuration
   */
  async updateSAMLConfig(data: Partial<SAMLConfig>): Promise<FetchResponse<SAMLConfig>> {
    return apiClient.put<SAMLConfig>('/api/admin/saml/config', data)
  }

  /**
   * Get SAML metadata
   */
  async getSAMLMetadata(): Promise<FetchResponse<string>> {
    return apiClient.get<string>('/api/admin/saml/metadata')
  }

  /**
   * Upload IdP metadata
   */
  async uploadSAMLMetadata(file: File): Promise<FetchResponse<MessageResponse>> {
    const formData = new FormData()
    formData.append('metadata', file)
    return apiClient.post<MessageResponse>('/api/admin/saml/metadata/upload', formData)
  }

  /**
   * Fetch remote SAML metadata from a URL
   */
  async fetchRemoteMetadata(url: string): Promise<FetchResponse<{ xml: string; entityId: string; name: string }>> {
    return apiClient.post('/api/admin/saml/metadata/fetch-remote', { url })
  }

  /**
   * List recently explored SAML entities
   */
  async listRecentSAMLEntities(): Promise<FetchResponse<any[]>> {
    return apiClient.get('/api/admin/saml/metadata/recent')
  }

  // Consolidated into Domain Verification section below

  // ==========================================================================
  // Audit Logs
  // ==========================================================================

  /**
   * Get admin dashboard stats
   */
  async getDashboard(): Promise<
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
    }>
  > {
    return apiClient.get('/api/admin/dashboard')
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(params?: {
    page?: number
    limit?: number
    user_id?: number
    action?: string
    start_date?: string
    end_date?: string
  }): Promise<FetchResponse<any>> {
    return apiClient.get('/api/admin/audit-logs', { params })
  }

  /**
   * Get impersonation audit logs
   */
  async getImpersonationLogs(params?: {
    page?: number
    limit?: number
  }): Promise<FetchResponse<any>> {
    return apiClient.get('/api/admin/audit-logs', {
      params: { ...params, action: 'USER_IMPERSONATION_START' },
    })
  }

  /**
   * Export audit logs
   */

  /**
   * Get system statistics summary
   */
  async getStatisticsSummary(): Promise<FetchResponse<any>> {
    return apiClient.get('/api/admin/statistics/summary')
  }

  // ==========================================================================
  // Webhooks
  // ==========================================================================

  /**
   * List all webhooks
   */
  async listWebhooks(): Promise<FetchResponse<any[]>> {
    return apiClient.get('/api/admin/webhooks')
  }

  /**
   * Get webhook details
   */
  async getWebhook(id: string | number): Promise<FetchResponse<any>> {
    return apiClient.get(`/api/admin/webhooks/${id}`)
  }

  /**
   * Create a webhook
   */
  async createWebhook(data: {
    url: string
    events: string[]
    secret?: string
  }): Promise<FetchResponse<any>> {
    return apiClient.post('/api/admin/webhooks', data)
  }

  /**
   * Update a webhook
   */
  async updateWebhook(id: string | number, data: any): Promise<FetchResponse<any>> {
    return apiClient.patch(`/api/admin/webhooks/${id}`, data)
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(id: string | number): Promise<FetchResponse<MessageResponse>> {
    return apiClient.delete<MessageResponse>(`/api/admin/webhooks/${id}`)
  }

  /**
   * Test a webhook
   */
  async testWebhook(id: string | number): Promise<FetchResponse<MessageResponse>> {
    return apiClient.post<MessageResponse>(`/api/admin/webhooks/${id}/test`)
  }

  // ==========================================================================
  // Ban Appeals
  // ==========================================================================

  async getAppeals(params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<FetchResponse<PaginatedResponse<any>>> {
    return apiClient.get(ENDPOINTS.admin.appeals.index, { params })
  }

  async resolveAppeal(
    id: number,
    data: { status: 'APPROVED' | 'DENIED'; reviewNotes?: string },
  ): Promise<FetchResponse<MessageResponse>> {
    return apiClient.post<MessageResponse>(ENDPOINTS.admin.appeals.resolve(id), data)
  }

  // ==========================================================================
  // Developer Platform â€” Scopes
  // ==========================================================================

  /**
   * List all Scopes
   */
  async listScopes(): Promise<FetchResponse<AuthScope[]>> {
    return apiClient.get<AuthScope[]>(ENDPOINTS.admin.scopes.list)
  }

  /**
   * Get Scope by ID
   */
  async getScope(id: number): Promise<FetchResponse<AuthScope>> {
    return apiClient.get<AuthScope>(ENDPOINTS.admin.scopes.byId(id))
  }

  /**
   * Create a new Scope
   */
  async createScope(data: CreateScopeRequest): Promise<FetchResponse<AuthScope>> {
    return apiClient.post<AuthScope>(ENDPOINTS.admin.scopes.store, data)
  }

  /**
   * Update an existing Scope
   */
  async updateScope(id: number, data: UpdateScopeRequest): Promise<FetchResponse<AuthScope>> {
    return apiClient.patch<AuthScope>(ENDPOINTS.admin.scopes.update(id), data)
  }

  /**
   * Delete a Scope
   */
  async deleteScope(id: number): Promise<FetchResponse<MessageResponse>> {
    return apiClient.delete<MessageResponse>(ENDPOINTS.admin.scopes.destroy(id))
  }

  // ==========================================================================
  // RBAC â€” Roles
  // ==========================================================================

  /** List all roles with pagination and search */
  async listRoles(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<FetchResponse<PaginatedResponse<Role>>> {
    return apiClient.get<PaginatedResponse<Role>>(ENDPOINTS.rbac.roles.list, { params })
  }

  /** Get RBAC statistics */
  async getRoleStats(): Promise<
    FetchResponse<{
      totalRoles: number
      totalPermissions: number
      totalMemberships: number
    }>
  > {
    return apiClient.get(ENDPOINTS.rbac.roles.stats)
  }

  /** Get a specific role by ID */
  async getRole(id: number): Promise<FetchResponse<Role>> {
    return apiClient.get<Role>(ENDPOINTS.rbac.roles.byId(id))
  }

  /** Create a new role */
  async createRole(data: {
    name: string
    guard_name?: string
    description?: string
  }): Promise<FetchResponse<Role>> {
    return apiClient.post<Role>(ENDPOINTS.rbac.roles.store, data)
  }

  /** Update a role */
  async updateRole(
    id: number,
    data: { name?: string; description?: string },
  ): Promise<FetchResponse<Role>> {
    return apiClient.patch<Role>(ENDPOINTS.rbac.roles.update(id), data)
  }

  /** Delete a role */
  async deleteRole(id: number): Promise<FetchResponse<MessageResponse>> {
    return apiClient.delete<MessageResponse>(ENDPOINTS.rbac.roles.destroy(id))
  }

  /** Get all permissions assigned to a role */
  async getRolePermissions(role: string): Promise<FetchResponse<Permission[]>> {
    return apiClient.get<Permission[]>(ENDPOINTS.rbac.roles.permissions(role))
  }

  /** Assign one permission to a role */
  async assignPermissionToRole(data: {
    role_id: number
    permission_id: number
  }): Promise<FetchResponse<MessageResponse>> {
    return apiClient.post<MessageResponse>(ENDPOINTS.rbac.roles.assignPermission, data)
  }

  /** Replace all permissions on a role atomically */
  async syncRolePermissions(roleId: number, permissionIds: number[]): Promise<FetchResponse<Role>> {
    return apiClient.put<Role>(ENDPOINTS.rbac.roles.syncPermissions(roleId), {
      permissionIds,
    })
  }

  /** Sync parent roles for a specific role */
  async syncRoleParents(roleId: number, parentIds: number[]): Promise<FetchResponse<Role>> {
    return apiClient.put<Role>(ENDPOINTS.rbac.roles.syncParents(roleId), {
      parentIds,
    })
  }

  // ==========================================================================
  // RBAC â€” Permissions
  // ==========================================================================

  async listPermissions(): Promise<FetchResponse<Permission[]>> {
    return apiClient.get<Permission[]>(ENDPOINTS.rbac.permissions.list)
  }

  async getPermission(id: number): Promise<FetchResponse<Permission>> {
    return apiClient.get<Permission>(ENDPOINTS.rbac.permissions.byId(id))
  }

  async createPermission(data: {
    name: string
    guard_name?: string
    resource?: string
    description?: string
  }): Promise<FetchResponse<Permission>> {
    return apiClient.post<Permission>(ENDPOINTS.rbac.permissions.store, data)
  }

  async updatePermission(
    id: number,
    data: {
      name?: string
      guard_name?: string
      resource?: string
      description?: string
    },
  ): Promise<FetchResponse<Permission>> {
    return apiClient.patch<Permission>(ENDPOINTS.rbac.permissions.byId(id), data)
  }

  async deletePermission(id: number): Promise<FetchResponse<MessageResponse>> {
    return apiClient.delete<MessageResponse>(ENDPOINTS.rbac.permissions.byId(id))
  }

  async grantPermission(data: {
    user_id: number
    permission_id: number
  }): Promise<FetchResponse<MessageResponse>> {
    return apiClient.post<MessageResponse>(ENDPOINTS.rbac.permissions.grant, data)
  }

  async revokePermission(data: {
    user_id: number
    permission_id: number
  }): Promise<FetchResponse<MessageResponse>> {
    return apiClient.post<MessageResponse>(ENDPOINTS.rbac.permissions.revoke, data)
  }

  // ==========================================================================
  // RBAC â€” Access Policies & Overrides
  // ==========================================================================

  /**
   * Get access policies
   */
  async getAccessPolicies(orgId: number): Promise<FetchResponse<AccessPolicy[]>> {
    if (isNaN(orgId) || orgId <= 0) {
      throw new Error('Valid organization context required for access policies.')
    }
    return apiClient.get<AccessPolicy[]>(ENDPOINTS.rbac.accessPolicies, {
      headers: { 'x-organization-id': String(orgId) },
    })
  }

  /**
   * Save access policies
   */
  async saveAccessPolicies(
    orgId: number,
    policies: AccessPolicy[],
  ): Promise<FetchResponse<MessageResponse>> {
    if (isNaN(orgId) || orgId <= 0) {
      throw new Error('Valid organization context required for access policies.')
    }
    return apiClient.post<MessageResponse>(
      ENDPOINTS.rbac.accessPolicies,
      { policies },
      { headers: { 'x-organization-id': String(orgId) } },
    )
  }

  /**
   * Get developer API keys for an organization
   */
  async getDeveloperApiKeys(orgId: number): Promise<FetchResponse<DeveloperApiKey[]>> {
    return apiClient.get(ENDPOINTS.developerApiKeys.index, { params: { org_id: orgId } })
  }

  /**
   * Create a new developer API key
   */
  async createDeveloperApiKey(
    orgId: number,
    data: { name: string; expiresAt?: string },
  ): Promise<FetchResponse<{ message: string; key: string; data: DeveloperApiKey }>> {
    return apiClient.post(ENDPOINTS.developerApiKeys.store, data, {
      params: { org_id: orgId },
    })
  }

  /**
   * Revoke a developer API key
   */
  async revokeDeveloperApiKey(orgId: number, keyId: number): Promise<FetchResponse<MessageResponse>> {
    return apiClient.delete(ENDPOINTS.developerApiKeys.destroy(keyId), {
      params: { org_id: orgId },
    })
  }

  /**
   * Get memberships for a user
   */
  async getUserMemberships(userId: number): Promise<FetchResponse<OrganizationMembership[]>> {
    return apiClient.get(`${ENDPOINTS.admin.users.byId(userId)}/memberships`)
  }

  /**
   * Get permission overrides for a specific member
   */
  async getMemberOverrides(
    memberId: number,
    orgId: number,
  ): Promise<FetchResponse<MemberOverride[]>> {
    return apiClient.get(`/api/admin/members/${memberId}/overrides`, {
      params: { org_id: orgId },
    })
  }

  /**
   * Add a granular permission override for a member
   */
  async addMemberOverride(
    memberId: number,
    orgId: number,
    override: { permissionId: number; grant: boolean },
  ): Promise<FetchResponse<MessageResponse>> {
    return apiClient.post(`/api/admin/members/${memberId}/overrides`, override, {
      params: { org_id: orgId },
    })
  }

  /**
   * Remove a granular permission override for a member
   */
  async removeMemberOverride(
    memberId: number,
    orgId: number,
    permissionId: number,
  ): Promise<FetchResponse<MessageResponse>> {
    return apiClient.delete(`/api/admin/members/${memberId}/overrides/${permissionId}`, {
      params: { org_id: orgId },
    })
  }

  /**
   * Verify a domain for an organization
   */
  async verifyDomain(orgId: number, domain: string): Promise<FetchResponse<DomainVerification>> {
    return apiClient.post(`/api/admin/organizations/${orgId}/domains`, { domain })
  }

  /**
   * Check verification status for a domain
   */
  async checkDomain(orgId: number, domainId: number): Promise<FetchResponse<DomainVerification>> {
    return apiClient.get(`/api/admin/organizations/${orgId}/domains/${domainId}/check`)
  }

  // ==========================================================================
  // Organizations
  // ==========================================================================

  async listOrganizations(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<FetchResponse<PaginatedResponse<Organization>>> {
    return apiClient.get(ENDPOINTS.admin.organizations.index, { params })
  }

  /**
   * Get organization policies
   */
  async getOrganizationPolicies(id: number | string): Promise<FetchResponse<any>> {
    return apiClient.get(ENDPOINTS.admin.organizations.policies(id as number))
  }

  /**
   * Update organization policies
   */
  async updateOrganizationPolicies(id: number | string, data: any): Promise<FetchResponse<any>> {
    return apiClient.patch(ENDPOINTS.admin.organizations.policies(id as number), data)
  }

  async createOrganization(data: CreateOrganizationRequest): Promise<FetchResponse<Organization>> {
    return apiClient.post<Organization>(ENDPOINTS.admin.organizations.store, data)
  }

  async updateOrganization(
    id: number,
    data: Partial<Organization>,
  ): Promise<FetchResponse<Organization>> {
    return apiClient.put<Organization>(ENDPOINTS.admin.organizations.byId(id), data)
  }

  async impersonateOrganization(id: number): Promise<FetchResponse<{ token: string; user: any }>> {
    return apiClient.post<{ token: string; user: any }>(
      `/api/admin/organizations/${id}/impersonate`,
    )
  }

  /**
   * Get organization SCIM Configuration
   */
  async getOrganizationScimConfig(): Promise<FetchResponse<SCIMConfig>> {
    return apiClient.get(ENDPOINTS.admin.scim.config)
  }

  /**
   * Update organization SCIM configuration
   */
  async updateOrganizationScimConfig(
    data: Partial<SCIMConfig>,
  ): Promise<FetchResponse<{ message: string; scimConfig: SCIMConfig }>> {
    return apiClient.patch(ENDPOINTS.admin.scim.config, data)
  }

  async getOrganization(id: number): Promise<FetchResponse<Organization>> {
    return apiClient.get<Organization>(ENDPOINTS.admin.organizations.byId(id))
  }

  async deleteOrganization(id: number): Promise<FetchResponse<MessageResponse>> {
    return apiClient.delete<MessageResponse>(ENDPOINTS.admin.organizations.destroy(id))
  }

  async addOrganizationMember(
    orgId: number,
    data: { user_id: number; role: string },
  ): Promise<FetchResponse<OrganizationMember>> {
    return apiClient.post<OrganizationMember>(ENDPOINTS.admin.organizations.addMember(orgId), data)
  }

  /**
   * Remove a member from an organization
   */
  async removeOrganizationMember(
    id: number,
    userId: number,
  ): Promise<FetchResponse<MessageResponse>> {
    return apiClient.delete<MessageResponse>(ENDPOINTS.admin.organizations.removeMember(id, userId))
  }

  async inviteToOrganization(
    orgId: number,
    data: InviteToOrganizationRequest,
  ): Promise<FetchResponse<OrganizationInvitation>> {
    return apiClient.post<OrganizationInvitation>(ENDPOINTS.admin.organizations.invite(orgId), data)
  }

  async getOrganizationInvitations(
    orgId: number,
  ): Promise<FetchResponse<OrganizationInvitation[]>> {
    return apiClient.get<OrganizationInvitation[]>(ENDPOINTS.admin.organizations.invitations(orgId))
  }

  async revokeOrganizationInvitation(
    orgId: number,
    invitationId: number | string,
  ): Promise<FetchResponse<any>> {
    return apiClient.post(ENDPOINTS.admin.organizations.revokeInvitation(orgId, invitationId))
  }

  async getInvitationDetails(token: string, email: string): Promise<FetchResponse<any>> {
    return apiClient.get(ENDPOINTS.auth.invitationDetails, {
      params: { token, email },
    })
  }

  async acceptInvitation(token: string, email: string): Promise<FetchResponse<any>> {
    return apiClient.post(ENDPOINTS.auth.acceptInvitation, { token, email })
  }

  async declineInvitation(token: string, email: string): Promise<FetchResponse<any>> {
    return apiClient.post(ENDPOINTS.auth.declineInvitation, { token, email })
  }

  // ==========================================================================
  // Provisioning & Directory Sync
  // ==========================================================================

  async listConnectors(): Promise<FetchResponse<Connector[]>> {
    return apiClient.get<Connector[]>(ENDPOINTS.admin.provisioning.connectors)
  }

  async createConnector(data: {
    name: string
    type: Connector['type']
    config: Record<string, unknown>
  }): Promise<FetchResponse<Connector>> {
    return apiClient.post<Connector>(ENDPOINTS.admin.provisioning.store, data)
  }

  async getConnector(id: number): Promise<FetchResponse<Connector>> {
    return apiClient.get<Connector>(ENDPOINTS.admin.provisioning.byId(id))
  }

  async updateConnector(id: number, data: Partial<Connector>): Promise<FetchResponse<Connector>> {
    return apiClient.patch<Connector>(ENDPOINTS.admin.provisioning.update(id), data)
  }

  async deleteConnector(id: number): Promise<FetchResponse<MessageResponse>> {
    return apiClient.delete<MessageResponse>(ENDPOINTS.admin.provisioning.destroy(id))
  }

  async syncConnector(id: number): Promise<FetchResponse<MessageResponse>> {
    return apiClient.post<MessageResponse>(ENDPOINTS.admin.provisioning.syncConnector(id))
  }

  async getConnectorLogs(
    id: number,
    params?: { page?: number; limit?: number },
  ): Promise<FetchResponse<PaginatedResponse<ConnectorLog>>> {
    return apiClient.get(ENDPOINTS.admin.provisioning.connectorLogs(id), { params })
  }

  // ==========================================================================
  // SCIM Token Management
  // ==========================================================================

  // SCIM Token Management
  async listSCIMTokens(): Promise<FetchResponse<SCIMToken[]>> {
    return apiClient.get(ENDPOINTS.admin.scim.tokens.index)
  }

  async createSCIMToken(data: {
    label: string
    expiresAt?: string
  }): Promise<FetchResponse<SCIMToken>> {
    return apiClient.post(ENDPOINTS.admin.scim.tokens.store, data)
  }

  async revokeSCIMToken(id: string | number): Promise<FetchResponse<MessageResponse>> {
    return apiClient.delete(ENDPOINTS.admin.scim.tokens.destroy(id))
  }

  /**
   * Test SCIM connection
   */
  async testSCIMConnection(): Promise<
    FetchResponse<{ status: string; message: string; diagnostics: any }>
  > {
    return apiClient.post('/api/admin/scim/test')
  }

  // ==========================================================================
  // Audit Export
  // ==========================================================================

  async exportAuditLogs(params?: {
    startDate?: string
    endDate?: string
    format?: 'csv' | 'json'
    type?: string
    user_id?: number
  }): Promise<FetchResponse<Blob>> {
    return apiClient.get(ENDPOINTS.audit.export, {
      params,
      responseType: 'blob',
    })
  }

  // ==========================================================================
  // GDPR â€" Data Portability
  // ==========================================================================

  /**
   * List all data export requests for a specific user
   */
  async listDataExports(userId: number): Promise<FetchResponse<any[]>> {
    return apiClient.get(`/api/admin/users/${userId}/data-exports`)
  }

  /**
   * Request a new GDPR data export for a user
   */
  async requestDataExport(userId: number): Promise<FetchResponse<MessageResponse>> {
    return apiClient.post<MessageResponse>(`/api/admin/users/${userId}/data-exports`)
  }

  // ==========================================================================
  // Statistics â€” MFA
  // ==========================================================================

  async getMFAStats(): Promise<FetchResponse<MFAStats>> {
    return apiClient.get<MFAStats>(ENDPOINTS.admin.statistics.mfa)
  }

  async getUserStats(): Promise<FetchResponse<UserStats>> {
    return apiClient.get<UserStats>(ENDPOINTS.admin.statistics.users)
  }

  // ==========================================================================
  // Email Templates & Testing
  // ==========================================================================

  async getEmailTemplates(): Promise<FetchResponse<EmailTemplate[]>> {
    return apiClient.get<EmailTemplate[]>(ENDPOINTS.admin.email.templates)
  }

  async getEmailTemplate(id: string): Promise<FetchResponse<EmailTemplate>> {
    return apiClient.get<EmailTemplate>(ENDPOINTS.admin.email.templateById(id))
  }

  async previewEmailTemplate(
    id: string,
    variables?: Record<string, string>,
  ): Promise<FetchResponse<{ html: string; text: string }>> {
    return apiClient.post(ENDPOINTS.admin.email.preview, { template_id: id, variables })
  }

  async sendTestEmail(data: EmailTestRequest): Promise<FetchResponse<MessageResponse>> {
    return apiClient.post<MessageResponse>(ENDPOINTS.admin.email.test, data)
  }

  // ==========================================================================
  // Security Health Check
  // ==========================================================================

  async updateUserStatus(
    id: number | string,
    status: string,
    reason?: string,
  ): Promise<FetchResponse<AdminUser>> {
    const response = await apiClient.patch(ENDPOINTS.admin.users.byId(id as number) + '/status', {
      status,
      reason,
    })
    return response as FetchResponse<AdminUser>
  }

  async getSecurityHealth(): Promise<FetchResponse<SecurityHealthResponse>> {
    return apiClient.get<SecurityHealthResponse>(ENDPOINTS.admin.security.health)
  }

  // ==========================================================================
  // SSF Configuration
  // ==========================================================================

  async getSSFConfig(): Promise<FetchResponse<SSFConfig>> {
    return apiClient.get<SSFConfig>(ENDPOINTS.admin.ssf.config)
  }

  async updateSSFConfig(config: SSFConfig): Promise<FetchResponse<{ message: string; config: SSFConfig }>> {
    return apiClient.put<{ message: string; config: SSFConfig }>(ENDPOINTS.admin.ssf.updateConfig, config)
  }

  async testSSFStream(): Promise<FetchResponse<{ success: boolean; message: string; timestamp: string }>> {
    return apiClient.post<{ success: boolean; message: string; timestamp: string }>(ENDPOINTS.admin.ssf.test)
  }

  async broadcastSSFEvent(data: BroadcastSSFEventRequest): Promise<FetchResponse<BroadcastSSFEventResponse>> {
    return apiClient.post<BroadcastSSFEventResponse>(ENDPOINTS.admin.ssf.broadcast, data)
  }

  async getSSFHistory(): Promise<FetchResponse<any[]>> {
    return apiClient.get<any[]>('/api/admin/ssf/history')
  }

  // ==========================================================================
  // JWKS Management
  // ==========================================================================

  /**
   * Get all JWKS keys
   */
  async getJWKSKeys(): Promise<FetchResponse<JWKSKey[]>> {
    return apiClient.get<JWKSKey[]>(ENDPOINTS.admin.jwks.index)
  }

  /**
   * Rotate JWKS keys
   */
  async rotateJWKSKeys(): Promise<FetchResponse<JWKSKey>> {
    return apiClient.post<JWKSKey>(ENDPOINTS.admin.jwks.rotate)
  }

  /**
   * Delete a JWKS key
   */
  async deleteJWKSKey(kid: string): Promise<FetchResponse<MessageResponse>> {
    return apiClient.delete<MessageResponse>(ENDPOINTS.admin.jwks.destroy(kid))
  }

  async createJWKSKey(data: CreateJWKSKeyRequest): Promise<FetchResponse<JWKSKey>> {
    return apiClient.post<JWKSKey>(ENDPOINTS.admin.jwks.store, data)
  }

  /**
   * Get a single JWKS key's public details
   */
  async getJWKSKeyDetail(kid: string): Promise<FetchResponse<JWKSKeyDetail>> {
    return apiClient.get<JWKSKeyDetail>(ENDPOINTS.admin.jwks.show(kid))
  }

  // ==========================================================================
  // System Health
  // ==========================================================================

  async getSystemHealth(): Promise<FetchResponse<DetailedHealthReport>> {
    return apiClient.get<DetailedHealthReport>(ENDPOINTS.health.detailed)
  }

  async getSystemMetrics(): Promise<FetchResponse<BasicMetrics>> {
    return apiClient.get<BasicMetrics>(ENDPOINTS.metrics.basic)
  }
}

export interface SecurityHealthResponse {
  score: number
  stats: {
    totalUsers: number
    mfaEnabled: number
    inactiveUsers: number
    oldTokens: number
  }
  recommendations: Array<{
    id: string
    title: string
    description: string
    severity: 'critical' | 'warning' | 'info'
  }>
}

export const adminService = new AdminService()

