import { apiClient, ENDPOINTS, type FetchResponse } from '@cap/platform-core'
import type {
  SCIMConfig,
  UpdateSCIMConfigDTO,
  SCIMToken,
  CreateSCIMTokenDTO,
  CreateSCIMTokenResponse,
  SCIMConnectionTestResponse,
} from '../types/scim.types'

export const scimService = {
  getConfig: async (): Promise<FetchResponse<SCIMConfig>> => {
    return apiClient.get<SCIMConfig>(ENDPOINTS.admin.scim.config)
  },

  updateConfig: async (data: UpdateSCIMConfigDTO): Promise<FetchResponse<{ message: string; config?: SCIMConfig }>> => {
    return apiClient.patch(ENDPOINTS.admin.scim.config, data)
  },

  listTokens: async (): Promise<FetchResponse<SCIMToken[]>> => {
    return apiClient.get<SCIMToken[]>(ENDPOINTS.admin.scim.tokens.index)
  },

  createToken: async (data: CreateSCIMTokenDTO): Promise<FetchResponse<CreateSCIMTokenResponse>> => {
    return apiClient.post<CreateSCIMTokenResponse>(ENDPOINTS.admin.scim.tokens.store, data)
  },

  revokeToken: async (id: string | number): Promise<FetchResponse<{ message?: string }>> => {
    return apiClient.delete(ENDPOINTS.admin.scim.tokens.destroy(id))
  },

  testConnection: async (): Promise<FetchResponse<SCIMConnectionTestResponse>> => {
    return apiClient.post<SCIMConnectionTestResponse>(ENDPOINTS.admin.scim.test)
  },
}

export default scimService
