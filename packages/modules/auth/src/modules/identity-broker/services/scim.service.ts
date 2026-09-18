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
  /** `ScimTokensController.getConfig` wraps the config in `{ data }`. */
  getConfig: async (): Promise<FetchResponse<SCIMConfig>> => {
    const res = await apiClient.get<{ data: SCIMConfig }>(ENDPOINTS.admin.scim.config)
    return { ...res, data: res.data?.data ?? ({ enabled: false } as SCIMConfig) }
  },

  /** `updateConfig` returns `{ message, scimConfig }`, not `{ message, config }`. */
  updateConfig: async (
    data: UpdateSCIMConfigDTO,
  ): Promise<FetchResponse<{ message: string; scimConfig?: SCIMConfig }>> => {
    return apiClient.patch(ENDPOINTS.admin.scim.config, data)
  },

  /** `ScimTokensController.index` wraps the list in `{ data }`. */
  listTokens: async (): Promise<FetchResponse<SCIMToken[]>> => {
    const res = await apiClient.get<{ data: SCIMToken[] }>(ENDPOINTS.admin.scim.tokens.index)
    return { ...res, data: res.data?.data ?? [] }
  },

  /**
   * `store` reads `request.only(['label', 'expiresAt'])` and wraps its
   * response in `{ data }` too.
   */
  createToken: async (
    data: CreateSCIMTokenDTO,
  ): Promise<FetchResponse<CreateSCIMTokenResponse>> => {
    const res = await apiClient.post<{ data: CreateSCIMTokenResponse }>(
      ENDPOINTS.admin.scim.tokens.store,
      data,
    )
    return { ...res, data: res.data?.data ?? (res.data as any) }
  },

  revokeToken: async (id: string | number): Promise<FetchResponse<{ message?: string }>> => {
    return apiClient.delete(ENDPOINTS.admin.scim.tokens.destroy(id))
  },

  testConnection: async (): Promise<FetchResponse<SCIMConnectionTestResponse>> => {
    return apiClient.post<SCIMConnectionTestResponse>(ENDPOINTS.admin.scim.test)
  },
}

export default scimService
