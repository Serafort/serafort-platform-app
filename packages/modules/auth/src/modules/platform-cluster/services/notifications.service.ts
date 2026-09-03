import { apiClient, FetchResponse } from '@cap/platform-core'
import { ENDPOINTS } from '@cap/platform-core'

/**
 * Notifications Service
 */
export const notificationsService = {
  getNotifications: (params?: any): Promise<FetchResponse> => {
    const query = params ? `?${new URLSearchParams(params)}` : ''
    return apiClient.get(`${ENDPOINTS.notifications.list}${query}`)
  },

  markAsRead: (id: number): Promise<FetchResponse> => {
    return apiClient.put(ENDPOINTS.notifications.markAsRead(id))
  },

  markAllAsRead: (): Promise<FetchResponse> => {
    return apiClient.put(ENDPOINTS.notifications.markAllAsRead)
  },

  deleteNotification: (id: number): Promise<FetchResponse> => {
    return apiClient.delete(ENDPOINTS.notifications.delete(id))
  },

  clearAll: (): Promise<FetchResponse> => {
    return apiClient.delete(ENDPOINTS.notifications.clearAll)
  },

  getPreferences: (): Promise<FetchResponse> => {
    return apiClient.get(ENDPOINTS.notifications.preferences)
  },

  updatePreferences: (body: any): Promise<FetchResponse> => {
    return apiClient.put(ENDPOINTS.notifications.updatePreferences, body)
  },

  getUnreadCount: (): Promise<FetchResponse> => {
    return apiClient.get(ENDPOINTS.notifications.unreadCount)
  },
}

export default notificationsService
