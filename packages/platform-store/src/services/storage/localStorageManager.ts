import StorageManager from './storage.service'

export const localStorageManager = {
  set: async (key: string, value: any, encrypt = false) =>
    await StorageManager.saveToLocalStorage(key, value, encrypt),
  get: async <T = any>(key: string, decrypt = false) =>
    await StorageManager.getFromLocalStorage<T>(key, decrypt),
  has: (key: string) => {
    try {
      return localStorage.getItem(key) !== null
    } catch {
      return false
    }
  },
  remove: (key: string) => StorageManager.deleteFromLocalStorage(key),
  clear: () => {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('LocalStorage clear error:', error)
    }
  },
}
