import { apiClient, ENDPOINTS, type FetchResponse } from '@cap/platform-core'
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

export const samlService = {
  getConfig: async (): Promise<FetchResponse<SAMLConfig>> => {
    return apiClient.get<SAMLConfig>(ENDPOINTS.admin.saml.config)
  },

  updateConfig: async (
    data: UpdateSAMLConfigDTO,
  ): Promise<FetchResponse<{ message: string; config?: SAMLConfig }>> => {
    return apiClient.put(ENDPOINTS.admin.saml.config, data)
  },

  getMetadata: async (): Promise<FetchResponse<SAMLMetadataResponse>> => {
    return apiClient.get<SAMLMetadataResponse>(ENDPOINTS.admin.saml.metadata)
  },

  uploadMetadata: async (
    metadataXmlOrFormData: FormData | { metadata: string },
  ): Promise<FetchResponse<RemoteMetadataResult>> => {
    return apiClient.post<RemoteMetadataResult>(
      ENDPOINTS.admin.saml.uploadMetadata,
      metadataXmlOrFormData,
    )
  },

  fetchRemoteMetadata: async (
    payload: RemoteMetadataFetchDTO,
  ): Promise<FetchResponse<RemoteMetadataResult>> => {
    return apiClient.post<RemoteMetadataResult>(ENDPOINTS.admin.saml.fetchRemoteMetadata, payload)
  },

  listRecentEntities: async (): Promise<FetchResponse<RecentSAMLEntity[]>> => {
    return apiClient.get<RecentSAMLEntity[]>(ENDPOINTS.admin.saml.recentEntities)
  },

  initiateSso: async (
    data: SAMLSSOInitiateDTO,
  ): Promise<FetchResponse<SAMLSSOInitiateResponse>> => {
    return apiClient.post<SAMLSSOInitiateResponse>(ENDPOINTS.auth.saml.sso, data)
  },

  discoverSso: async (identifier: string): Promise<FetchResponse<any>> => {
    return apiClient.get(
      `${ENDPOINTS.auth.sso.discover}?identifier=${encodeURIComponent(identifier)}`,
    )
  },
}

export default samlService
