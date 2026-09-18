import { apiClient, ENDPOINTS, type FetchResponse } from '@cap/platform-core'
import type {
  JWKKey,
  CreateJWKSKeyRequest,
  CreateJWKSKeyResult,
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

  /** `OidcKeysController.store` returns the raw created model, not a `JWKKey` projection. */
  createKey: async (data: CreateJWKSKeyRequest): Promise<FetchResponse<CreateJWKSKeyResult>> => {
    return apiClient.post<CreateJWKSKeyResult>(ENDPOINTS.admin.jwks.store, data)
  },

  /** `OidcKeysController.rotate` returns the raw new-key model, not `{ message, activeKey }`. */
  rotateKeys: async (): Promise<FetchResponse<RotateJWKSResponse>> => {
    return apiClient.post<RotateJWKSResponse>(ENDPOINTS.admin.jwks.rotate)
  },

  deleteKey: async (kid: string): Promise<FetchResponse<{ message?: string }>> => {
    return apiClient.delete(ENDPOINTS.admin.jwks.destroy(kid))
  },
}

export default jwksService
