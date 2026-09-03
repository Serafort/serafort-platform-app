import { apiClient, FetchResponse } from '@cap/platform-core'

import {
  UpdateNamesRequest,
  UpdateEmailRequest,
  UpdatePhotoRequest,
} from '@auth/authentication-core/types/api.types'
import { ENDPOINTS } from '@cap/platform-core'

/**
 * Resume Profiles Service
 */
export const profileService = {
  // User Profile
  getProfileSettings: (): Promise<FetchResponse> => {
    return apiClient.get(ENDPOINTS.user.me)
  },

  updateNames: (data: UpdateNamesRequest): Promise<FetchResponse> => {
    return apiClient.put(ENDPOINTS.user.update, data)
  },

  updateEmail: (data: UpdateEmailRequest): Promise<FetchResponse> => {
    return apiClient.post(ENDPOINTS.user.changeEmail, data)
  },

  updatePhoto: (data: UpdatePhotoRequest): Promise<FetchResponse> => {
    return apiClient.put(ENDPOINTS.user.update, data)
  },

  // Resume Profiles
  getProfiles: (): Promise<FetchResponse> => {
    return apiClient.get(ENDPOINTS.profiles.list)
  },

  getProfileById: (id: number): Promise<FetchResponse> => {
    return apiClient.get(ENDPOINTS.profiles.byId(id))
  },

  uploadProfile: (data: {
    file: File
    name: string
    description?: string
  }): Promise<FetchResponse> => {
    return apiClient.uploadFile(ENDPOINTS.profiles.upload, [data.file], 'file', {
      name: data.name,
      description: data.description,
    })
  },

  setActiveProfile: (id: number): Promise<FetchResponse> => {
    return apiClient.put(ENDPOINTS.profiles.setActive(id))
  },

  updateProfile: (id: number, body: any): Promise<FetchResponse> => {
    return apiClient.put(ENDPOINTS.profiles.update(id), body)
  },

  deleteProfile: (id: number): Promise<FetchResponse> => {
    return apiClient.delete(ENDPOINTS.profiles.delete(id))
  },

  getActiveStatus: (id: number): Promise<FetchResponse<any>> => {
    return apiClient.get(ENDPOINTS.profiles.activeStatus(id))
  },
}

export default profileService
