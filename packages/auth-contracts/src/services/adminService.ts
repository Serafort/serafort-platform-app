import { apiClient, type FetchResponse } from "@cap/platform-store";
import type { PaginatedResponse } from "@cap/shared-types";
import { ENDPOINTS } from "@cap/api-contracts";
import type {
  SCIMConfig,
  SAMLConfig,
  JWKSKey,
  CreateJWKSKeyRequest,
  JWKSKeyDetail,
  SSFConfig,
  BroadcastSSFEventRequest,
  BroadcastSSFEventResponse,
  AccessPolicy,
} from "@cap/shared-types";

export type {
  SCIMConfig,
  SAMLConfig,
  JWKSKey,
  CreateJWKSKeyRequest,
  JWKSKeyDetail,
  SSFConfig,
  BroadcastSSFEventRequest,
  BroadcastSSFEventResponse,
} from "@cap/shared-types";

export class AdminService {
  async listOIDCClients(): Promise<
    FetchResponse<import("../types").OIDCClient[]>
  > {
    return apiClient.get<import("../types").OIDCClient[]>(
      ENDPOINTS.admin.clients.index,
    );
  }

  async getOIDCClient(
    id: string | number,
  ): Promise<FetchResponse<import("../types").OIDCClient>> {
    return apiClient.get<import("../types").OIDCClient>(
      ENDPOINTS.admin.clients.byId(id as string),
    );
  }

  async createOIDCClient(
    data: import("../types").CreateOIDCClientRequest,
  ): Promise<FetchResponse<import("../types").OIDCClient>> {
    return apiClient.post<import("../types").OIDCClient>(
      ENDPOINTS.admin.clients.store,
      data,
    );
  }

  async updateOIDCClient(
    id: string | number,
    data: import("../types").UpdateOIDCClientRequest,
  ): Promise<FetchResponse<import("../types").OIDCClient>> {
    return apiClient.patch<import("../types").OIDCClient>(
      ENDPOINTS.admin.clients.update(id as string),
      data,
    );
  }

  async deleteOIDCClient(
    id: string | number,
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.delete<import("../types").MessageResponse>(
      ENDPOINTS.admin.clients.destroy(id as string),
    );
  }

  async rotateClientSecret(
    id: string | number,
  ): Promise<FetchResponse<{ client_secret: string }>> {
    return apiClient.post<{ client_secret: string }>(
      ENDPOINTS.admin.clients.rotateSecret(id as string),
    );
  }

  async getClientBranding(
    id: string | number,
  ): Promise<FetchResponse<unknown>> {
    return apiClient.get(ENDPOINTS.admin.clients.branding(id as string));
  }

  async updateClientBranding(
    id: string | number,
    data: unknown,
  ): Promise<FetchResponse<unknown>> {
    return apiClient.patch(
      ENDPOINTS.admin.clients.branding(id as string),
      data,
    );
  }

  async listUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<FetchResponse<PaginatedResponse<import("../types").AdminUser>>> {
    return apiClient.get(ENDPOINTS.admin.users.index, { params });
  }

  async getUser(
    id: string | number,
  ): Promise<FetchResponse<import("../types").AdminUser>> {
    return apiClient.get<import("../types").AdminUser>(
      ENDPOINTS.admin.users.byId(id as number),
    );
  }

  async createUser(
    data: import("../types").CreateUserRequest,
  ): Promise<FetchResponse<import("../types").AdminUser>> {
    return apiClient.post<import("../types").AdminUser>(
      ENDPOINTS.admin.users.store,
      data,
    );
  }

  async updateUser(
    id: string | number,
    data: import("../types").UpdateUserRequest,
  ): Promise<FetchResponse<import("../types").AdminUser>> {
    return apiClient.put<import("../types").AdminUser>(
      ENDPOINTS.admin.users.byId(id as number),
      data,
    );
  }

  async deleteUser(
    id: string | number,
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.delete<import("../types").MessageResponse>(
      ENDPOINTS.admin.users.byId(id as number),
    );
  }

  async banUser(
    id: string | number,
    reason?: string,
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.patch<import("../types").MessageResponse>(
      ENDPOINTS.admin.users.ban(id as number),
      { reason },
    );
  }

  async unbanUser(
    id: string | number,
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.post<import("../types").MessageResponse>(
      ENDPOINTS.admin.users.unsuspend(id as number),
    );
  }

  async resetUserPassword(
    id: string | number,
    newPassword?: string,
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.post<import("../types").MessageResponse>(
      ENDPOINTS.admin.users.resetPassword(id as number),
      {
        password: newPassword,
      },
    );
  }

  async resetUserMfa(
    id: string | number,
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.post<import("../types").MessageResponse>(
      ENDPOINTS.admin.users.resetMfa(id as number),
    );
  }

  async impersonateUser(
    id: string | number,
  ): Promise<FetchResponse<{ token: string }>> {
    return apiClient.post<{ token: string }>(
      ENDPOINTS.admin.users.impersonate(id as number),
    );
  }

  async unlockUser(
    id: number,
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.post<import("../types").MessageResponse>(
      ENDPOINTS.admin.users.unlock(id),
    );
  }

  async assignRoleToUser(
    userId: number,
    roleId: number,
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.post<import("../types").MessageResponse>(
      ENDPOINTS.admin.users.assignRole(userId),
      {
        role_id: roleId,
      },
    );
  }

  async bulkAction(
    data: import("../types").BulkActionRequest,
  ): Promise<FetchResponse<import("../types").BulkActionResult>> {
    return apiClient.post<import("../types").BulkActionResult>(
      ENDPOINTS.admin.users.bulkAction,
      data,
    );
  }

  async getUserSessions(
    id: number | string,
  ): Promise<FetchResponse<unknown[]>> {
    return apiClient.get<unknown[]>(
      ENDPOINTS.admin.users.sessions(id as number),
    );
  }

  async uploadOrganizationLogo(
    id: number,
    file: File,
  ): Promise<FetchResponse<{ logo_url: string }>> {
    return apiClient.uploadFormData<{ logo_url: string }>(
      ENDPOINTS.admin.organizations.logo(id),
      { logo: file },
      "post",
    );
  }

  async getSAMLConfig(): Promise<FetchResponse<SAMLConfig>> {
    return apiClient.get<SAMLConfig>(ENDPOINTS.admin.saml.config);
  }

  async updateSAMLConfig(
    data: Partial<SAMLConfig>,
  ): Promise<FetchResponse<SAMLConfig>> {
    return apiClient.put<SAMLConfig>(ENDPOINTS.admin.saml.config, data);
  }

  async getSAMLMetadata(): Promise<FetchResponse<string>> {
    return apiClient.get<string>(ENDPOINTS.admin.saml.metadata);
  }

  async uploadSAMLMetadata(
    file: File,
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    const formData = new FormData();
    formData.append("metadata", file);
    return apiClient.post<import("../types").MessageResponse>(
      ENDPOINTS.admin.saml.uploadMetadata,
      formData,
    );
  }

  async fetchRemoteMetadata(
    url: string,
  ): Promise<FetchResponse<{ xml: string; entityId: string; name: string }>> {
    return apiClient.post(ENDPOINTS.admin.saml.fetchRemoteMetadata, { url });
  }

  async listRecentSAMLEntities(): Promise<FetchResponse<unknown[]>> {
    return apiClient.get(ENDPOINTS.admin.saml.recentEntities);
  }

  async getDashboard(): Promise<
    FetchResponse<{
      totalUsers: number;
      activeUsers: number;
      newSignups: number;
      failedLogins: number;
      activeSessions: number;
      mfaAdoption: string;
      totalBanned: number;
      newBans: number;
      pendingAppeals: number;
      systemHealth: string;
    }>
  > {
    return apiClient.get(ENDPOINTS.admin.dashboard);
  }

  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    user_id?: number;
    action?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<FetchResponse<unknown>> {
    return apiClient.get(ENDPOINTS.admin.auditLogs.index, { params });
  }

  async getImpersonationLogs(params?: {
    page?: number;
    limit?: number;
  }): Promise<FetchResponse<unknown>> {
    return apiClient.get(ENDPOINTS.admin.auditLogs.index, {
      params: { ...params, action: "USER_IMPERSONATION_START" },
    });
  }

  async getStatisticsSummary(): Promise<FetchResponse<unknown>> {
    return apiClient.get(ENDPOINTS.admin.statistics.overview);
  }

  async listWebhooks(): Promise<FetchResponse<unknown[]>> {
    return apiClient.get(ENDPOINTS.admin.webhooks.index);
  }

  async getWebhook(id: string | number): Promise<FetchResponse<unknown>> {
    return apiClient.get(ENDPOINTS.admin.webhooks.byId(id as number));
  }

  async createWebhook(data: {
    url: string;
    events: string[];
    secret?: string;
  }): Promise<FetchResponse<unknown>> {
    return apiClient.post(ENDPOINTS.admin.webhooks.store, data);
  }

  async updateWebhook(
    id: string | number,
    data: unknown,
  ): Promise<FetchResponse<unknown>> {
    return apiClient.patch(ENDPOINTS.admin.webhooks.update(id as number), data);
  }

  async deleteWebhook(
    id: string | number,
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.delete<import("../types").MessageResponse>(
      ENDPOINTS.admin.webhooks.destroy(id as number),
    );
  }

  async testWebhook(
    id: string | number,
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.post<import("../types").MessageResponse>(
      ENDPOINTS.admin.webhooks.test(id as number),
    );
  }

  async getAppeals(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<FetchResponse<PaginatedResponse<unknown>>> {
    return apiClient.get(ENDPOINTS.admin.appeals.index, { params });
  }

  async resolveAppeal(
    id: number,
    data: { status: "APPROVED" | "DENIED"; reviewNotes?: string },
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.post<import("../types").MessageResponse>(
      ENDPOINTS.admin.appeals.resolve(id),
      data,
    );
  }

  async listScopes(): Promise<FetchResponse<import("../types").AuthScope[]>> {
    return apiClient.get<import("../types").AuthScope[]>(
      ENDPOINTS.admin.scopes.list,
    );
  }

  async getScope(
    id: number,
  ): Promise<FetchResponse<import("../types").AuthScope>> {
    return apiClient.get<import("../types").AuthScope>(
      ENDPOINTS.admin.scopes.byId(id),
    );
  }

  async createScope(
    data: import("../types").CreateScopeRequest,
  ): Promise<FetchResponse<import("../types").AuthScope>> {
    return apiClient.post<import("../types").AuthScope>(
      ENDPOINTS.admin.scopes.store,
      data,
    );
  }

  async updateScope(
    id: number,
    data: import("../types").UpdateScopeRequest,
  ): Promise<FetchResponse<import("../types").AuthScope>> {
    return apiClient.patch<import("../types").AuthScope>(
      ENDPOINTS.admin.scopes.update(id),
      data,
    );
  }

  async deleteScope(
    id: number,
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.delete<import("../types").MessageResponse>(
      ENDPOINTS.admin.scopes.destroy(id),
    );
  }

  async listRoles(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<FetchResponse<PaginatedResponse<import("../types").Role>>> {
    return apiClient.get<PaginatedResponse<import("../types").Role>>(
      ENDPOINTS.rbac.roles.list,
      { params },
    );
  }

  async getRoleStats(): Promise<
    FetchResponse<{
      totalRoles: number;
      totalPermissions: number;
      totalMemberships: number;
    }>
  > {
    return apiClient.get(ENDPOINTS.rbac.roles.stats);
  }

  async getRole(id: number): Promise<FetchResponse<import("../types").Role>> {
    return apiClient.get<import("../types").Role>(
      ENDPOINTS.rbac.roles.byId(id),
    );
  }

  async createRole(data: {
    name: string;
    guard_name?: string;
    description?: string;
  }): Promise<FetchResponse<import("../types").Role>> {
    return apiClient.post<import("../types").Role>(
      ENDPOINTS.rbac.roles.store,
      data,
    );
  }

  async updateRole(
    id: number,
    data: { name?: string; description?: string },
  ): Promise<FetchResponse<import("../types").Role>> {
    return apiClient.patch<import("../types").Role>(
      ENDPOINTS.rbac.roles.update(id),
      data,
    );
  }

  async deleteRole(
    id: number,
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.delete<import("../types").MessageResponse>(
      ENDPOINTS.rbac.roles.destroy(id),
    );
  }

  async getRolePermissions(
    role: string,
  ): Promise<FetchResponse<import("../types").Permission[]>> {
    return apiClient.get<import("../types").Permission[]>(
      ENDPOINTS.rbac.roles.permissions(role),
    );
  }

  async assignPermissionToRole(data: {
    role_id: number;
    permission_id: number;
  }): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.post<import("../types").MessageResponse>(
      ENDPOINTS.rbac.roles.assignPermission,
      data,
    );
  }

  async syncRolePermissions(
    roleId: number,
    permissionIds: number[],
  ): Promise<FetchResponse<import("../types").Role>> {
    return apiClient.put<import("../types").Role>(
      ENDPOINTS.rbac.roles.syncPermissions(roleId),
      {
        permissionIds,
      },
    );
  }

  async syncRoleParents(
    roleId: number,
    parentIds: number[],
  ): Promise<FetchResponse<import("../types").Role>> {
    return apiClient.put<import("../types").Role>(
      ENDPOINTS.rbac.roles.syncParents(roleId),
      {
        parentIds,
      },
    );
  }

  async listPermissions(): Promise<
    FetchResponse<import("../types").Permission[]>
  > {
    return apiClient.get<import("../types").Permission[]>(
      ENDPOINTS.rbac.permissions.list,
    );
  }

  async getPermission(
    id: number,
  ): Promise<FetchResponse<import("../types").Permission>> {
    return apiClient.get<import("../types").Permission>(
      ENDPOINTS.rbac.permissions.byId(id),
    );
  }

  async createPermission(data: {
    name: string;
    guard_name?: string;
    resource?: string;
    description?: string;
  }): Promise<FetchResponse<import("../types").Permission>> {
    return apiClient.post<import("../types").Permission>(
      ENDPOINTS.rbac.permissions.store,
      data,
    );
  }

  async updatePermission(
    id: number,
    data: {
      name?: string;
      guard_name?: string;
      resource?: string;
      description?: string;
    },
  ): Promise<FetchResponse<import("../types").Permission>> {
    return apiClient.patch<import("../types").Permission>(
      ENDPOINTS.rbac.permissions.byId(id),
      data,
    );
  }

  async deletePermission(
    id: number,
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.delete<import("../types").MessageResponse>(
      ENDPOINTS.rbac.permissions.byId(id),
    );
  }

  async grantPermission(data: {
    user_id: number;
    permission_id: number;
  }): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.post<import("../types").MessageResponse>(
      ENDPOINTS.rbac.permissions.grant,
      data,
    );
  }

  async revokePermission(data: {
    user_id: number;
    permission_id: number;
  }): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.post<import("../types").MessageResponse>(
      ENDPOINTS.rbac.permissions.revoke,
      data,
    );
  }

  async getAccessPolicies(
    orgId: number,
  ): Promise<FetchResponse<AccessPolicy[]>> {
    if (isNaN(orgId) || orgId <= 0) {
      throw new Error(
        "Valid organization context required for access policies.",
      );
    }
    return apiClient.get<AccessPolicy[]>(ENDPOINTS.rbac.accessPolicies, {
      headers: { "x-organization-id": String(orgId) },
    });
  }

  async saveAccessPolicies(
    orgId: number,
    policies: AccessPolicy[],
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    if (isNaN(orgId) || orgId <= 0) {
      throw new Error(
        "Valid organization context required for access policies.",
      );
    }
    return apiClient.post<import("../types").MessageResponse>(
      ENDPOINTS.rbac.accessPolicies,
      { policies },
      { headers: { "x-organization-id": String(orgId) } },
    );
  }

  async getDeveloperApiKeys(
    orgId: number,
  ): Promise<FetchResponse<import("../types").DeveloperApiKey[]>> {
    return apiClient.get(ENDPOINTS.developerApiKeys.index, {
      params: { org_id: orgId },
    });
  }

  async createDeveloperApiKey(
    orgId: number,
    data: { name: string; expiresAt?: string },
  ): Promise<
    FetchResponse<{
      message: string;
      key: string;
      data: import("../types").DeveloperApiKey;
    }>
  > {
    return apiClient.post(ENDPOINTS.developerApiKeys.store, data, {
      params: { org_id: orgId },
    });
  }

  async revokeDeveloperApiKey(
    orgId: number,
    keyId: number,
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.delete(ENDPOINTS.developerApiKeys.destroy(keyId), {
      params: { org_id: orgId },
    });
  }

  async getUserMemberships(
    userId: number,
  ): Promise<FetchResponse<import("../types").OrganizationMembership[]>> {
    return apiClient.get(`${ENDPOINTS.admin.users.byId(userId)}/memberships`);
  }

  async getMemberOverrides(
    memberId: number,
    orgId: number,
  ): Promise<FetchResponse<import("../types").MemberOverride[]>> {
    return apiClient.get(ENDPOINTS.adminMembers.overrides(memberId), {
      params: { org_id: orgId },
    });
  }

  async addMemberOverride(
    memberId: number,
    orgId: number,
    override: { permissionId: number; grant: boolean },
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.post(
      ENDPOINTS.adminMembers.addOverride(memberId),
      override,
      {
        params: { org_id: orgId },
      },
    );
  }

  async removeMemberOverride(
    memberId: number,
    orgId: number,
    permissionId: number,
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.delete(
      ENDPOINTS.adminMembers.removeOverride(memberId, permissionId),
      {
        params: { org_id: orgId },
      },
    );
  }

  /**
   * Domain verification is tenant-level: the organization travels in the body,
   * and the backend falls back to looking it up by the domain when no id is
   * given. The organization-scoped URLs these used to build were never served.
   */
  async verifyDomain(
    orgId: number,
    domain: string,
  ): Promise<FetchResponse<import("../types").DomainVerification>> {
    return apiClient.post(ENDPOINTS.admin.domains.verify, {
      domain,
      organizationId: orgId || undefined,
    });
  }

  /** By domain name — the backend keys the pending verification on it. */
  async checkDomain(
    domain: string,
  ): Promise<FetchResponse<import("../types").DomainVerification>> {
    return apiClient.post(ENDPOINTS.admin.domains.check, { domain });
  }

  async listOrganizations(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<
    FetchResponse<PaginatedResponse<import("../types").Organization>>
  > {
    return apiClient.get(ENDPOINTS.admin.organizations.index, { params });
  }

  async getOrganizationPolicies(
    id: number | string,
  ): Promise<FetchResponse<unknown>> {
    return apiClient.get(ENDPOINTS.admin.organizations.policies(id as number));
  }

  async updateOrganizationPolicies(
    id: number | string,
    data: unknown,
  ): Promise<FetchResponse<unknown>> {
    return apiClient.patch(
      ENDPOINTS.admin.organizations.policies(id as number),
      data,
    );
  }

  async createOrganization(
    data: import("../types").CreateOrganizationRequest,
  ): Promise<FetchResponse<import("../types").Organization>> {
    return apiClient.post<import("../types").Organization>(
      ENDPOINTS.admin.organizations.store,
      data,
    );
  }

  async updateOrganization(
    id: number,
    data: Partial<import("../types").Organization>,
  ): Promise<FetchResponse<import("../types").Organization>> {
    return apiClient.put<import("../types").Organization>(
      ENDPOINTS.admin.organizations.byId(id),
      data,
    );
  }

  async impersonateOrganization(
    id: number,
  ): Promise<FetchResponse<{ token: string; user: unknown }>> {
    return apiClient.post<{ token: string; user: unknown }>(
      ENDPOINTS.admin.organizations.impersonate(id),
    );
  }

  async getOrganizationScimConfig(): Promise<FetchResponse<SCIMConfig>> {
    return apiClient.get(ENDPOINTS.admin.scim.config);
  }

  async updateOrganizationScimConfig(
    data: Partial<SCIMConfig>,
  ): Promise<FetchResponse<{ message: string; scimConfig: SCIMConfig }>> {
    return apiClient.patch(ENDPOINTS.admin.scim.config, data);
  }

  async getOrganization(
    id: number,
  ): Promise<FetchResponse<import("../types").Organization>> {
    return apiClient.get<import("../types").Organization>(
      ENDPOINTS.admin.organizations.byId(id),
    );
  }

  async deleteOrganization(
    id: number,
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.delete<import("../types").MessageResponse>(
      ENDPOINTS.admin.organizations.destroy(id),
    );
  }

  async addOrganizationMember(
    orgId: number,
    data: { user_id: number; role: string },
  ): Promise<FetchResponse<import("../types").OrganizationMember>> {
    return apiClient.post<import("../types").OrganizationMember>(
      ENDPOINTS.admin.organizations.addMember(orgId),
      data,
    );
  }

  async removeOrganizationMember(
    id: number,
    userId: number,
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.delete<import("../types").MessageResponse>(
      ENDPOINTS.admin.organizations.removeMember(id, userId),
    );
  }

  async inviteToOrganization(
    orgId: number,
    data: import("../types").InviteToOrganizationRequest,
  ): Promise<FetchResponse<import("../types").OrganizationInvitation>> {
    return apiClient.post<import("../types").OrganizationInvitation>(
      ENDPOINTS.admin.organizations.invite(orgId),
      data,
    );
  }

  async getOrganizationInvitations(
    orgId: number,
  ): Promise<FetchResponse<import("../types").OrganizationInvitation[]>> {
    return apiClient.get<import("../types").OrganizationInvitation[]>(
      ENDPOINTS.admin.organizations.invitations(orgId),
    );
  }

  async revokeOrganizationInvitation(
    orgId: number,
    invitationId: number | string,
  ): Promise<FetchResponse<unknown>> {
    return apiClient.post(
      ENDPOINTS.admin.organizations.revokeInvitation(orgId, invitationId),
    );
  }

  async listConnectors(): Promise<
    FetchResponse<import("../types").Connector[]>
  > {
    return apiClient.get<import("../types").Connector[]>(
      ENDPOINTS.admin.provisioning.connectors,
    );
  }

  async createConnector(data: {
    name: string;
    type: import("../types").Connector["type"];
    config: Record<string, unknown>;
  }): Promise<FetchResponse<import("../types").Connector>> {
    return apiClient.post<import("../types").Connector>(
      ENDPOINTS.admin.provisioning.store,
      data,
    );
  }

  async getConnector(
    id: number,
  ): Promise<FetchResponse<import("../types").Connector>> {
    return apiClient.get<import("../types").Connector>(
      ENDPOINTS.admin.provisioning.byId(id),
    );
  }

  async updateConnector(
    id: number,
    data: Partial<import("../types").Connector>,
  ): Promise<FetchResponse<import("../types").Connector>> {
    return apiClient.patch<import("../types").Connector>(
      ENDPOINTS.admin.provisioning.update(id),
      data,
    );
  }

  async deleteConnector(
    id: number,
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.delete<import("../types").MessageResponse>(
      ENDPOINTS.admin.provisioning.destroy(id),
    );
  }

  async syncConnector(
    id: number,
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.post<import("../types").MessageResponse>(
      ENDPOINTS.admin.provisioning.syncConnector(id),
    );
  }

  async getConnectorLogs(
    id: number,
    params?: { page?: number; limit?: number },
  ): Promise<
    FetchResponse<PaginatedResponse<import("../types").ConnectorLog>>
  > {
    return apiClient.get(ENDPOINTS.admin.provisioning.connectorLogs(id), {
      params,
    });
  }

  async listSCIMTokens(): Promise<
    FetchResponse<import("../types").SCIMToken[]>
  > {
    return apiClient.get<import("../types").SCIMToken[]>(
      ENDPOINTS.admin.scim.tokens.index,
    );
  }

  async createSCIMToken(data: {
    label: string;
    expiresAt?: string;
  }): Promise<FetchResponse<import("../types").SCIMToken>> {
    return apiClient.post(ENDPOINTS.admin.scim.tokens.store, data);
  }

  async revokeSCIMToken(
    id: string | number,
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.delete(ENDPOINTS.admin.scim.tokens.destroy(id));
  }

  async testSCIMConnection(): Promise<
    FetchResponse<{ status: string; message: string; diagnostics: unknown }>
  > {
    return apiClient.post(ENDPOINTS.admin.scim.test);
  }

  async exportAuditLogs(params?: {
    startDate?: string;
    endDate?: string;
    format?: "csv" | "json";
    type?: string;
    user_id?: number;
  }): Promise<FetchResponse<Blob>> {
    return apiClient.get(ENDPOINTS.audit.export, {
      params,
      responseType: "blob",
    });
  }

  async listDataExports(userId: number): Promise<FetchResponse<unknown[]>> {
    return apiClient.get(ENDPOINTS.admin.users.dataExports(userId));
  }

  async requestDataExport(
    userId: number,
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.post<import("../types").MessageResponse>(
      ENDPOINTS.admin.users.requestDataExport(userId),
    );
  }

  async getMFAStats(): Promise<FetchResponse<import("../types").MFAStats>> {
    return apiClient.get<import("../types").MFAStats>(
      ENDPOINTS.admin.statistics.mfa,
    );
  }

  async getUserStats(): Promise<FetchResponse<import("../types").UserStats>> {
    return apiClient.get<import("../types").UserStats>(
      ENDPOINTS.admin.statistics.users,
    );
  }

  async getEmailTemplates(): Promise<
    FetchResponse<import("../types").EmailTemplate[]>
  > {
    return apiClient.get<import("../types").EmailTemplate[]>(
      ENDPOINTS.admin.email.templates,
    );
  }

  async getEmailTemplate(
    id: string,
  ): Promise<FetchResponse<import("../types").EmailTemplate>> {
    return apiClient.get<import("../types").EmailTemplate>(
      ENDPOINTS.admin.email.templateById(id),
    );
  }

  async previewEmailTemplate(
    id: string,
    variables?: Record<string, string>,
  ): Promise<FetchResponse<{ html: string; text: string }>> {
    return apiClient.post(ENDPOINTS.admin.email.preview, {
      template_id: id,
      variables,
    });
  }

  async sendTestEmail(
    data: import("../types").EmailTestRequest,
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.post<import("../types").MessageResponse>(
      ENDPOINTS.admin.email.test,
      data,
    );
  }

  async updateUserStatus(
    id: number | string,
    status: string,
    reason?: string,
  ): Promise<FetchResponse<import("../types").AdminUser>> {
    const response = await apiClient.patch(
      ENDPOINTS.admin.users.byId(id as number) + "/status",
      { status, reason },
    );
    return response as FetchResponse<import("../types").AdminUser>;
  }

  async getSecurityHealth(): Promise<
    FetchResponse<import("../types").SecurityHealthResponse>
  > {
    return apiClient.get<import("../types").SecurityHealthResponse>(
      ENDPOINTS.admin.security.health,
    );
  }

  async getSSFConfig(): Promise<FetchResponse<SSFConfig>> {
    return apiClient.get<SSFConfig>(ENDPOINTS.admin.ssf.config);
  }

  async updateSSFConfig(
    config: SSFConfig,
  ): Promise<FetchResponse<{ message: string; config: SSFConfig }>> {
    return apiClient.put<{ message: string; config: SSFConfig }>(
      ENDPOINTS.admin.ssf.updateConfig,
      config,
    );
  }

  async testSSFStream(): Promise<
    FetchResponse<{ success: boolean; message: string; timestamp: string }>
  > {
    return apiClient.post<{
      success: boolean;
      message: string;
      timestamp: string;
    }>(ENDPOINTS.admin.ssf.test, {});
  }

  async broadcastSSFEvent(
    data: BroadcastSSFEventRequest,
  ): Promise<FetchResponse<BroadcastSSFEventResponse>> {
    return apiClient.post<BroadcastSSFEventResponse>(
      ENDPOINTS.admin.ssf.broadcast,
      data,
    );
  }

  async getSSFHistory(): Promise<FetchResponse<unknown[]>> {
    return apiClient.get<unknown[]>(ENDPOINTS.admin.ssf.history);
  }

  async getJWKSKeys(): Promise<FetchResponse<JWKSKey[]>> {
    return apiClient.get<JWKSKey[]>(ENDPOINTS.admin.jwks.index);
  }

  async rotateJWKSKeys(): Promise<FetchResponse<JWKSKey>> {
    return apiClient.post<JWKSKey>(ENDPOINTS.admin.jwks.rotate);
  }

  async deleteJWKSKey(
    kid: string,
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.delete<import("../types").MessageResponse>(
      ENDPOINTS.admin.jwks.destroy(kid),
    );
  }

  async createJWKSKey(
    data: CreateJWKSKeyRequest,
  ): Promise<FetchResponse<JWKSKey>> {
    return apiClient.post<JWKSKey>(ENDPOINTS.admin.jwks.store, data);
  }

  async getJWKSKeyDetail(kid: string): Promise<FetchResponse<JWKSKeyDetail>> {
    return apiClient.get<JWKSKeyDetail>(ENDPOINTS.admin.jwks.show(kid));
  }

  async getSystemHealth(): Promise<
    FetchResponse<import("../types").DetailedHealthReport>
  > {
    return apiClient.get<import("../types").DetailedHealthReport>(
      ENDPOINTS.health.detailed,
    );
  }

  async getSystemMetrics(): Promise<
    FetchResponse<import("../types").BasicMetrics>
  > {
    return apiClient.get<import("../types").BasicMetrics>(
      ENDPOINTS.metrics.basic,
    );
  }

  // ─── Alert Rules Engine ───
  async listAlertRules(): Promise<FetchResponse<unknown[]>> {
    return apiClient.get<unknown[]>(ENDPOINTS.admin.alertRules.index);
  }

  async createAlertRule(data: {
    name: string;
    description?: string;
    severity: "info" | "low" | "medium" | "high" | "critical";
    condition: Record<string, unknown>;
    action: string;
  }): Promise<FetchResponse<unknown>> {
    return apiClient.post(ENDPOINTS.admin.alertRules.store, data);
  }

  async updateAlertRule(
    id: string | number,
    data: Record<string, unknown>,
  ): Promise<FetchResponse<unknown>> {
    return apiClient.patch(ENDPOINTS.admin.alertRules.update(id), data);
  }

  async deleteAlertRule(
    id: string | number,
  ): Promise<FetchResponse<import("../types").MessageResponse>> {
    return apiClient.delete<import("../types").MessageResponse>(
      ENDPOINTS.admin.alertRules.destroy(id),
    );
  }

  // ─── Threat Intelligence ───
  async getThreatMetrics(): Promise<FetchResponse<unknown>> {
    return apiClient.get(ENDPOINTS.admin.threatIntel.metrics);
  }

  async getThreatScore(): Promise<
    FetchResponse<{ score: number; level: string }>
  > {
    return apiClient.get<{ score: number; level: string }>(
      ENDPOINTS.admin.threatIntel.score,
    );
  }

  async getThreatHeatmap(): Promise<FetchResponse<unknown[]>> {
    return apiClient.get<unknown[]>(ENDPOINTS.admin.threatIntel.heatmap);
  }

  async getThreatIndicators(): Promise<FetchResponse<unknown[]>> {
    return apiClient.get<unknown[]>(ENDPOINTS.admin.threatIntel.indicators);
  }

  async lookupIpThreat(ip: string): Promise<FetchResponse<unknown>> {
    return apiClient.get(ENDPOINTS.admin.threatIntel.lookupIp(ip));
  }

  async lookupDomainThreat(domain: string): Promise<FetchResponse<unknown>> {
    return apiClient.get(ENDPOINTS.admin.threatIntel.lookupDomain(domain));
  }

  // ─── Policy Simulation & AST Compilation ───
  async simulatePolicy(payload: {
    subject: Record<string, unknown>;
    resource: string;
    action: string;
    context?: Record<string, unknown>;
  }): Promise<
    FetchResponse<{
      decision: "allow" | "deny";
      matchedPolicies: string[];
      reason?: string;
    }>
  > {
    return apiClient.post<{
      decision: "allow" | "deny";
      matchedPolicies: string[];
      reason?: string;
    }>("/api/v1/admin/rbac/policies/simulate", payload);
  }

  async compilePolicyGraph(
    graph: unknown,
  ): Promise<
    FetchResponse<{ policySet: unknown; validationErrors?: string[] }>
  > {
    return apiClient.post<{ policySet: unknown; validationErrors?: string[] }>(
      "/api/v1/admin/rbac/policies/compile",
      { graph },
    );
  }

  async decompilePolicy(
    policySet: unknown,
  ): Promise<FetchResponse<{ graph: unknown }>> {
    return apiClient.post<{ graph: unknown }>(
      "/api/v1/admin/rbac/policies/decompile",
      { policySet },
    );
  }
}

export const adminService = new AdminService();
