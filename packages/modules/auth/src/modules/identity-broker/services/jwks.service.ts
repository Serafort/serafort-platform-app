import { apiClient, ENDPOINTS, type FetchResponse } from '@cap/platform-core'
import type {
  JWKKey,
  CreateJWKSKeyRequest,
  JWKSKeyDetailResponse,
  RotateJWKSResponse,
} from '../types/jwks.types'

export const jwksService = {
  listKeys: async (): Promise<FetchResponse<JWKKey[]>> => {
    return apiClient.get<JWKKey[]>(ENDPOINTS.admin.jwks.index)
  },

  getKeyDetail: async (kid: string): Promise<FetchResponse<JWKSKeyDetailResponse>> => {
    return apiClient.get<JWKSKeyDetailResponse>(ENDPOINTS.admin.jwks.show(kid))
  },

  createKey: async (data: CreateJWKSKeyRequest): Promise<FetchResponse<JWKKey>> => {
    return apiClient.post<JWKKey>(ENDPOINTS.admin.jwks.store, data)
  },

  rotateKeys: async (): Promise<FetchResponse<RotateJWKSResponse>> => {
    return apiClient.post<RotateJWKSResponse>(ENDPOINTS.admin.jwks.rotate)
  },

  deleteKey: async (kid: string): Promise<FetchResponse<{ message?: string }>> => {
    return apiClient.delete(ENDPOINTS.admin.jwks.destroy(kid))
  },
}

export default jwksService
