import { apiClient } from '@cap/platform-core';
import { ENDPOINTS } from '@cap/platform-core';

const adminService = {
  dashboard: () => apiClient.get(ENDPOINTS.admin.dashboard),

  users: {
    list: (params?: { page?: number; limit?: number; search?: string }) =>
      apiClient.get(ENDPOINTS.admin.users.index, { params }),
    get: (id: number) => apiClient.get(ENDPOINTS.admin.users.byId(id)),
    create: (data: any) => apiClient.post(ENDPOINTS.admin.users.store, data),
    update: (id: number, data: any) => apiClient.patch(ENDPOINTS.admin.users.byId(id), data),
    delete: (id: number) => apiClient.delete(ENDPOINTS.admin.users.byId(id)),
    activate: (id: number) => apiClient.patch(ENDPOINTS.admin.users.activate(id)),
    deactivate: (id: number) => apiClient.patch(ENDPOINTS.admin.users.deactivate(id)),
    ban: (id: number, reason?: string) => apiClient.post(ENDPOINTS.admin.users.ban(id), { reason }),
    unban: (id: number) => apiClient.post(ENDPOINTS.admin.users.unban(id)),
    resetPassword: (id: number) => apiClient.post(ENDPOINTS.admin.users.resetPassword(id)),
    resetMfa: (id: number) => apiClient.post(ENDPOINTS.admin.users.resetMfa(id)),
    bulkAction: (data: any) => apiClient.post(ENDPOINTS.admin.users.bulkAction, data),
    assignRole: (id: number, role: string) => apiClient.post(ENDPOINTS.admin.users.assignRole(id), { role }),
    impersonate: (id: number) => apiClient.post(ENDPOINTS.admin.users.impersonate(id)),
    unlock: (id: number) => apiClient.post(ENDPOINTS.admin.users.unlock(id)),
    sessions: (id: number) => apiClient.get(ENDPOINTS.admin.users.sessions(id)),
  },

  appeals: {
    list: () => apiClient.get(ENDPOINTS.admin.appeals.index),
    resolve: (id: number, action: 'approved' | 'rejected') =>
      apiClient.post(ENDPOINTS.admin.appeals.resolve(id), { action }),
  },

  clients: {
    list: () => apiClient.get(ENDPOINTS.admin.clients.index),
    get: (id: string) => apiClient.get(ENDPOINTS.admin.clients.byId(id)),
    create: (data: any) => apiClient.post(ENDPOINTS.admin.clients.store, data),
    update: (id: string, data: any) => apiClient.patch(ENDPOINTS.admin.clients.update(id), data),
    delete: (id: string) => apiClient.delete(ENDPOINTS.admin.clients.destroy(id)),
    rotateSecret: (id: string) => apiClient.post(ENDPOINTS.admin.clients.rotateSecret(id)),
    branding: (id: string, data: any) => apiClient.post(ENDPOINTS.admin.clients.branding(id), data),
  },

  saml: {
    getConfig: () => apiClient.get(ENDPOINTS.admin.saml.config),
    updateConfig: (data: any) => apiClient.post(ENDPOINTS.admin.saml.config, data),
    getMetadata: () => apiClient.get(ENDPOINTS.admin.saml.metadata),
    uploadMetadata: (file: File) =>
      apiClient.uploadFormData(ENDPOINTS.admin.saml.uploadMetadata, { metadata: file }, 'post'),
  },

  ssf: {
    getConfig: () => apiClient.get(ENDPOINTS.admin.ssf.config),
    updateConfig: (data: any) => apiClient.post(ENDPOINTS.admin.ssf.updateConfig, data),
    test: (message: string) => apiClient.post(ENDPOINTS.admin.ssf.test, { message }),
    broadcast: () => apiClient.get(ENDPOINTS.admin.ssf.broadcast),
  },

  jwks: {
    list: () => apiClient.get(ENDPOINTS.admin.jwks.index),
    get: (kid: string) => apiClient.get(ENDPOINTS.admin.jwks.show(kid)),
    create: (data: any) => apiClient.post(ENDPOINTS.admin.jwks.store, data),
    rotate: () => apiClient.post(ENDPOINTS.admin.jwks.rotate),
    delete: (kid: string) => apiClient.delete(ENDPOINTS.admin.jwks.destroy(kid)),
  },

  scopes: {
    list: () => apiClient.get(ENDPOINTS.admin.scopes.list),
    get: (id: number) => apiClient.get(ENDPOINTS.admin.scopes.byId(id)),
    create: (data: any) => apiClient.post(ENDPOINTS.admin.scopes.store, data),
    update: (id: number, data: any) => apiClient.patch(ENDPOINTS.admin.scopes.update(id), data),
    delete: (id: number) => apiClient.delete(ENDPOINTS.admin.scopes.destroy(id)),
  },

  domains: {
    verify: (domain: string) => apiClient.post(ENDPOINTS.admin.domains.verify, { domain }),
    check: (domain: string) => apiClient.post(ENDPOINTS.admin.domains.check, { domain }),
  },

  webhooks: {
    list: () => apiClient.get(ENDPOINTS.admin.webhooks.index),
    get: (id: number) => apiClient.get(ENDPOINTS.admin.webhooks.byId(id)),
    create: (data: any) => apiClient.post(ENDPOINTS.admin.webhooks.store, data),
    update: (id: number, data: any) => apiClient.patch(ENDPOINTS.admin.webhooks.update(id), data),
    delete: (id: number) => apiClient.delete(ENDPOINTS.admin.webhooks.destroy(id)),
    test: (id: number) => apiClient.post(ENDPOINTS.admin.webhooks.test(id)),
  },

  organizations: {
    list: (params?: { page?: number; limit?: number; search?: string }) =>
      apiClient.get(ENDPOINTS.admin.organizations.index, { params }),
    get: (id: number) => apiClient.get(ENDPOINTS.admin.organizations.byId(id)),
    create: (data: any) => apiClient.post(ENDPOINTS.admin.organizations.store, data),
    delete: (id: number) => apiClient.delete(ENDPOINTS.admin.organizations.destroy(id)),
    addMember: (id: number, userId: number, role: string) =>
      apiClient.post(ENDPOINTS.admin.organizations.addMember(id), { userId, role }),
    removeMember: (id: number, userId: number) =>
      apiClient.delete(ENDPOINTS.admin.organizations.removeMember(id, userId)),
    uploadLogo: (id: number, logo: File) =>
      apiClient.uploadFormData(ENDPOINTS.admin.organizations.logo(id), { logo }, 'post'),
    invite: (id: number, email: string, role: string) =>
      apiClient.post(ENDPOINTS.admin.organizations.invite(id), { email, role }),
    invitations: (id: number) => apiClient.get(ENDPOINTS.admin.organizations.invitations(id)),
    revokeInvitation: (orgId: number, invitationId: number | string) =>
      apiClient.post(ENDPOINTS.admin.organizations.revokeInvitation(orgId, invitationId)),
    policies: (id: number) => apiClient.get(ENDPOINTS.admin.organizations.policies(id)),
    impersonate: (id: number) => apiClient.post(ENDPOINTS.admin.organizations.impersonate(id)),
  },

  provisioning: {
    list: () => apiClient.get(ENDPOINTS.admin.provisioning.connectors),
    get: (id: number) => apiClient.get(ENDPOINTS.admin.provisioning.byId(id)),
    create: (data: any) => apiClient.post(ENDPOINTS.admin.provisioning.store, data),
    update: (id: number, data: any) => apiClient.patch(ENDPOINTS.admin.provisioning.update(id), data),
    delete: (id: number) => apiClient.delete(ENDPOINTS.admin.provisioning.destroy(id)),
    sync: (id: number) => apiClient.post(ENDPOINTS.admin.provisioning.sync(id)),
    logs: (id: number) => apiClient.get(ENDPOINTS.admin.provisioning.logs(id)),
  },

  auditLogs: {
    list: (params?: { page?: number; limit?: number; userId?: number; action?: string }) =>
      apiClient.get(ENDPOINTS.admin.auditLogs.index, { params }),
    export: (format?: string) => apiClient.post(ENDPOINTS.admin.auditLogs.export, { format }),
    security: () => apiClient.get(ENDPOINTS.admin.auditLogs.security),
    impersonation: () => apiClient.get(ENDPOINTS.admin.auditLogs.impersonation),
    statistics: () => apiClient.get(ENDPOINTS.admin.auditLogs.statistics),
  },

  email: {
    templates: () => apiClient.get(ENDPOINTS.admin.email.templates),
    templateById: (id: string) => apiClient.get(ENDPOINTS.admin.email.templateById(id)),
    preview: (data: any) => apiClient.post(ENDPOINTS.admin.email.preview, data),
    test: (data: any) => apiClient.post(ENDPOINTS.admin.email.test, data),
  },

  statistics: {
    overview: () => apiClient.get(ENDPOINTS.admin.statistics.overview),
    users: () => apiClient.get(ENDPOINTS.admin.statistics.users),
    mfa: () => apiClient.get(ENDPOINTS.admin.statistics.mfa),
    sessionStatistics: () => apiClient.get(ENDPOINTS.admin.statistics.sessionStatistics),
    trends: () => apiClient.get(ENDPOINTS.admin.statistics.trends),
  },

  impersonationLogs: (params?: { page?: number; limit?: number }) =>
    apiClient.get(ENDPOINTS.admin.impersonationLogs, { params }),

  securityHealth: () => apiClient.get(ENDPOINTS.admin.security.health),

  scim: {
    tokens: {
      list: () => apiClient.get(ENDPOINTS.admin.scim.tokens.index),
      create: (data: any) => apiClient.post(ENDPOINTS.admin.scim.tokens.store, data),
      delete: (id: string | number) => apiClient.delete(ENDPOINTS.admin.scim.tokens.destroy(id)),
    },
    getConfig: () => apiClient.get(ENDPOINTS.admin.scim.config),
    updateConfig: (data: any) => apiClient.patch(ENDPOINTS.admin.scim.config, data),
  },
}

export default adminService
