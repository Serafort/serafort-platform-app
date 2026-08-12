import type { AuthSlice } from './store/slices/authSlice'
import type { GuestSlice } from './store/slices/guestSlice'
import type { ProfileSlice } from './store/slices/profileSlice'
import type { NotificationSlice } from './store/slices/notificationSlice'
import type { PreferencesSlice } from './store/slices/preferences/preferences'
import type { SettingsSlice } from './store/slices/settingsSlice'
import type { NavigationSlice } from './store/slices/navigationSlice'
import type { NetworkSlice } from './store/slices/networkSlice'
import type { OfflineQueueSlice } from './store/slices/offlineQueueSlice'
import type { LayoutEngineSlice } from './store/slices/layoutEngineSlice'

export type AppStore = AuthSlice &
  GuestSlice &
  ProfileSlice &
  NotificationSlice &
  PreferencesSlice &
  SettingsSlice &
  NavigationSlice &
  NetworkSlice &
  LayoutEngineSlice &
  OfflineQueueSlice

export * from './store/types'
