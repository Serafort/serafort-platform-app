import { apiClient, ENDPOINTS, type FetchResponse } from '@cap/platform-core'
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

export const oidcService = {
  // --- Admin OIDC Clients Management ---
  listClients: async (): Promise<FetchResponse<OIDCClient[]>> => {
    return apiClient.get<OIDCClient[]>(ENDPOINTS.admin.clients.index)
  },

  getClient: async (id: string): Promise<FetchResponse<OIDCClient>> => {
    return apiClient.get<OIDCClient>(ENDPOINTS.admin.clients.byId(id))
  },

  createClient: async (data: CreateOIDCClientDTO): Promise<FetchResponse<OIDCClient>> => {
    return apiClient.post<OIDCClient>(ENDPOINTS.admin.clients.store, data)
  },

  updateClient: async (id: string, data: UpdateOIDCClientDTO): Promise<FetchResponse<OIDCClient>> => {
    return apiClient.patch<OIDCClient>(ENDPOINTS.admin.clients.update(id), data)
  },

  deleteClient: async (id: string): Promise<FetchResponse<{ message?: string }>> => {
    return apiClient.delete(ENDPOINTS.admin.clients.destroy(id))
  },

  rotateSecret: async (id: string): Promise<FetchResponse<RotateClientSecretResult>> => {
    return apiClient.post<RotateClientSecretResult>(ENDPOINTS.admin.clients.rotateSecret(id))
  },

  getBranding: async (id: string): Promise<FetchResponse<OIDCClientBranding>> => {
    return apiClient.get<OIDCClientBranding>(ENDPOINTS.admin.clients.branding(id))
  },

  updateBranding: async (id: string, data: OIDCClientBranding): Promise<FetchResponse<OIDCClientBranding>> => {
    return apiClient.patch<OIDCClientBranding>(ENDPOINTS.admin.clients.branding(id), data)
  },

  // --- OIDC Interaction Flow ---
  getInteraction: async (uid: string): Promise<FetchResponse<OIDCInteractionDetails>> => {
    return apiClient.get<OIDCInteractionDetails>(ENDPOINTS.auth.oidcInteraction.get(uid))
  },

  loginInteraction: async (uid: string, credentials: OIDCLoginCredentials): Promise<FetchResponse<OIDCLoginResponse>> => {
    return apiClient.post<OIDCLoginResponse>(ENDPOINTS.auth.oidcInteraction.login(uid), credentials)
  },

  verifyMfaInteraction: async (uid: string, data: OIDCMfaVerifyDTO): Promise<FetchResponse<OIDCRedirectResult>> => {
    return apiClient.post<OIDCRedirectResult>(`/api/auth/oidc/interaction/${uid}/mfa`, data)
  },

  getConsent: async (uid: string): Promise<FetchResponse<OIDCInteractionDetails>> => {
    return apiClient.get<OIDCInteractionDetails>(ENDPOINTS.auth.oidcInteraction.consent(uid))
  },

  confirmInteraction: async (uid: string, data?: OIDCConsentDTO): Promise<FetchResponse<OIDCRedirectResult>> => {
    return apiClient.post<OIDCRedirectResult>(ENDPOINTS.auth.oidcInteraction.confirm(uid), data || {})
  },

  abortInteraction: async (uid: string): Promise<FetchResponse<OIDCRedirectResult>> => {
    return apiClient.get<OIDCRedirectResult>(ENDPOINTS.auth.oidcInteraction.abort(uid))
  },

  // --- OIDC Compliance Protocols ---
  getUserInfo: async (): Promise<FetchResponse<Record<string, any>>> => {
    return apiClient.get<Record<string, any>>(ENDPOINTS.auth.oidc.userinfo)
  },

  introspectToken: async (token: string): Promise<FetchResponse<Record<string, any>>> => {
    return apiClient.post<Record<string, any>>(ENDPOINTS.auth.oidc.introspect, { token })
  },

  revokeToken: async (token: string): Promise<FetchResponse<{ message?: string }>> => {
    return apiClient.post(ENDPOINTS.auth.oidc.revoke, { token })
  },

  endSession: async (): Promise<FetchResponse<{ message?: string }>> => {
    return apiClient.get(ENDPOINTS.auth.oidc.endSession)
  },

  // --- Device Flow ---
  verifyDeviceCode: async (userCode: string): Promise<FetchResponse<OIDCDeviceVerifyResult>> => {
    return apiClient.post<OIDCDeviceVerifyResult>(ENDPOINTS.auth.oidcDevice.verifyAction, { userCode })
  },
}

export default oidcService
