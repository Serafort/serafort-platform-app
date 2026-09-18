import { apiClient, ENDPOINTS, type FetchResponse } from '@cap/platform-core'
import type {
  SAMLConfig,
  UpdateSAMLConfigDTO,
  RemoteMetadataFetchDTO,
  RemoteMetadataResult,
  UploadSAMLMetadataResult,
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

  /**
   * `SamlConfigController.getMetadata` responds with raw
   * `Content-Type: application/xml`, not JSON — `apiClient`'s default parser
   * calls `response.json()`, which throws on an XML body and silently
   * resolves to `null`. Requesting `text` avoids that and gets the real
   * metadata document back as a string.
   */
  getMetadata: async (): Promise<FetchResponse<string>> => {
    return apiClient.get<string>(ENDPOINTS.admin.saml.metadata, { responseType: 'text' })
  },

  uploadMetadata: async (
    metadataXmlOrFormData: FormData | { metadata: string },
  ): Promise<FetchResponse<UploadSAMLMetadataResult>> => {
    return apiClient.post<UploadSAMLMetadataResult>(
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
