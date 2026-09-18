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

/**
 * `OidcClient` (`app/models/oidc/oidc_client.ts`) declares
 * `@column({ serializeAs: 'client_id' })` etc. on nearly every field, so
 * `.serialize()` emits OAuth-spec-style snake_case (`client_id`,
 * `client_secret`, `client_name`, `redirect_uris`, `grant_types`,
 * `response_types`). The camelCase-response middleware that would normally
 * translate that back (`app/middleware/camel_case_response_middleware.ts`) is
 * never registered in `start/kernel.ts`, so today it arrives at the frontend
 * exactly as snake_case. Tolerate both casings here so this keeps working
 * whether or not that middleware gets wired up later.
 */
function normalizeOidcClient(raw: any): OIDCClient {
  if (!raw) return raw
  return {
    id: raw.id,
    clientId: raw.clientId ?? raw.client_id,
    clientName: raw.clientName ?? raw.client_name ?? raw.name,
    clientSecret: raw.clientSecret ?? raw.client_secret,
    redirectUris: raw.redirectUris ?? raw.redirect_uris ?? [],
    responseTypes: raw.responseTypes ?? raw.response_types,
    grantTypes: raw.grantTypes ?? raw.grant_types,
    tokenEndpointAuthMethod: raw.tokenEndpointAuthMethod ?? raw.token_endpoint_auth_method,
    logoUri: raw.logoUri ?? raw.logo_uri ?? null,
    policyUri: raw.policyUri ?? raw.policy_uri ?? null,
    tosUri: raw.tosUri ?? raw.tos_uri ?? null,
    scope: raw.scope,
    organizationId: raw.organizationId ?? raw.organization_id ?? null,
    createdAt: raw.createdAt ?? raw.created_at,
    updatedAt: raw.updatedAt ?? raw.updated_at,
  }
}

export const oidcService = {
  // --- Admin OIDC Clients Management ---
  listClients: async (): Promise<FetchResponse<OIDCClient[]>> => {
    const res = await apiClient.get<any[]>(ENDPOINTS.admin.clients.index)
    return { ...res, data: (res.data || []).map(normalizeOidcClient) }
  },

  getClient: async (id: string): Promise<FetchResponse<OIDCClient>> => {
    const res = await apiClient.get<any>(ENDPOINTS.admin.clients.byId(id))
    return { ...res, data: normalizeOidcClient(res.data) }
  },

  createClient: async (data: CreateOIDCClientDTO): Promise<FetchResponse<OIDCClient>> => {
    const res = await apiClient.post<any>(ENDPOINTS.admin.clients.store, data)
    return { ...res, data: normalizeOidcClient(res.data) }
  },

  /**
   * `ClientsController.update` returns `{ message, client }`, not the client
   * flat — unwrap it so this keeps returning the `OIDCClient` DTO callers
   * already expect.
   */
  updateClient: async (
    id: string,
    data: UpdateOIDCClientDTO,
  ): Promise<FetchResponse<OIDCClient>> => {
    const res = await apiClient.patch<{ message?: string; client?: any }>(
      ENDPOINTS.admin.clients.update(id),
      data,
    )
    return { ...res, data: normalizeOidcClient(res.data?.client ?? res.data) }
  },

  deleteClient: async (id: string): Promise<FetchResponse<{ message?: string }>> => {
    return apiClient.delete(ENDPOINTS.admin.clients.destroy(id))
  },

  /**
   * `ClientsController.rotateSecret` returns `{ message, client_secret }` —
   * it never echoes the client id back, so it's filled in here from the `id`
   * the caller already passed to build the URL.
   */
  rotateSecret: async (id: string): Promise<FetchResponse<RotateClientSecretResult>> => {
    const res = await apiClient.post<{ message?: string; client_secret?: string; clientSecret?: string }>(
      ENDPOINTS.admin.clients.rotateSecret(id),
    )
    return {
      ...res,
      data: {
        clientId: id,
        clientSecret: res.data?.clientSecret ?? res.data?.client_secret ?? '',
        message: res.data?.message ?? '',
      },
    }
  },

  getBranding: async (id: string): Promise<FetchResponse<OIDCClientBranding>> => {
    return apiClient.get<OIDCClientBranding>(ENDPOINTS.admin.clients.branding(id))
  },

  /**
   * `ClientsController.updateBranding` returns `{ message, branding }`, not
   * the branding object flat — unwrap it to match the declared DTO.
   */
  updateBranding: async (
    id: string,
    data: OIDCClientBranding,
  ): Promise<FetchResponse<OIDCClientBranding>> => {
    const res = await apiClient.patch<{ message?: string; branding?: OIDCClientBranding }>(
      ENDPOINTS.admin.clients.branding(id),
      data,
    )
    return { ...res, data: res.data?.branding ?? ({} as OIDCClientBranding) }
  },

  // --- OIDC Interaction Flow ---
  getInteraction: async (uid: string): Promise<FetchResponse<OIDCInteractionDetails>> => {
    return apiClient.get<OIDCInteractionDetails>(ENDPOINTS.auth.oidcInteraction.get(uid))
  },

  loginInteraction: async (
    uid: string,
    credentials: OIDCLoginCredentials,
  ): Promise<FetchResponse<OIDCLoginResponse>> => {
    return apiClient.post<OIDCLoginResponse>(ENDPOINTS.auth.oidcInteraction.login(uid), credentials)
  },

  verifyMfaInteraction: async (
    uid: string,
    data: OIDCMfaVerifyDTO,
  ): Promise<FetchResponse<OIDCRedirectResult>> => {
    return apiClient.post<OIDCRedirectResult>(ENDPOINTS.auth.oidcInteraction.mfa(uid), data)
  },

  getConsent: async (uid: string): Promise<FetchResponse<OIDCInteractionDetails>> => {
    return apiClient.get<OIDCInteractionDetails>(ENDPOINTS.auth.oidcInteraction.consent(uid))
  },

  confirmInteraction: async (
    uid: string,
    data?: OIDCConsentDTO,
  ): Promise<FetchResponse<OIDCRedirectResult>> => {
    return apiClient.post<OIDCRedirectResult>(
      ENDPOINTS.auth.oidcInteraction.confirm(uid),
      data || {},
    )
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

  pushedAuthorizationRequest: async (
    data: Record<string, any>,
  ): Promise<FetchResponse<{ request_uri: string; expires_in: number }>> => {
    return apiClient.post(ENDPOINTS.auth.oidc.par, data)
  },

  registerClientDynamic: async (
    data: Record<string, any>,
  ): Promise<FetchResponse<Record<string, any>>> => {
    return apiClient.post(ENDPOINTS.auth.oidc.register, data)
  },

  backchannelLogout: async (data: {
    logout_token: string
  }): Promise<FetchResponse<{ message?: string }>> => {
    return apiClient.post(ENDPOINTS.auth.oidc.backchannelLogout, data)
  },

  samlSso: async (data: Record<string, any>): Promise<FetchResponse<any>> => {
    return apiClient.post(ENDPOINTS.auth.saml.sso, data)
  },

  // --- Device Flow ---
  verifyDeviceCode: async (userCode: string): Promise<FetchResponse<OIDCDeviceVerifyResult>> => {
    return apiClient.post<OIDCDeviceVerifyResult>(ENDPOINTS.auth.oidcDevice.verifyAction, {
      userCode,
    })
  },
}

export default oidcService
