import { StateCreator } from 'zustand'
import type { AppStore } from '../../types'

// Re-export notification types from shared-types for backward compatibility
export type {  Notification, NotificationInput } from '@cap/shared-types'
import type {  Notification } from '@cap/shared-types'

export interface NotificationSlice {
  // State
  notifications: Notification[]
  unreadCount: number

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearNotifications: () => void
  getUnreadNotifications: () => Notification[]
}

const generateNotificationId = (): string => {
  return `notif_${crypto.randomUUID()}`
}

export const createNotificationSlice: StateCreator<
  AppStore,
  [['zustand/immer', never], ['zustand/persist', unknown]],
  [],
  NotificationSlice
> = (set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notificationData) => {
    set((state) => {
      const notification: Notification = {
        ...notificationData,
        id: generateNotificationId(),
        timestamp: new Date().toISOString(),
        read: false,
      }

      state.notifications.unshift(notification)
      state.unreadCount += 1

      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50)
      }
    })
  },

  markAsRead: (id: string) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id)
      if (notification && !notification.read) {
        notification.read = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    })
  },

  markAllAsRead: () => {
    set((state) => {
      state.notifications.forEach((n) => {
        n.read = true
      })
      state.unreadCount = 0
    })
  },

  deleteNotification: (id: string) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id)
      if (notification && !notification.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
      state.notifications = state.notifications.filter((n) => n.id !== id)
    })
  },

  clearNotifications: () => {
    set((state) => {
      state.notifications = []
      state.unreadCount = 0
    })
  },

  getUnreadNotifications: () => {
    return get().notifications.filter((n) => !n.read)
  },
})
