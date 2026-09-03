import { apiClient, API_CONTRACTS } from '@cap/platform-store'
import { UserDto } from '@cap/shared-types'

export const userService = {
  getMe: async () => {
    const response = await apiClient.execute(API_CONTRACTS.user.me, [])
    return response.data.data
  },

  updateProfile: async (data: Partial<UserDto>) => {
    const response = await apiClient.execute(API_CONTRACTS.user.update, [], data)
    return response.data.data
  },
}
