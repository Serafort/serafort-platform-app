import StorageManager from './storage.service'
export const sessionStorageManager = {
  set: (key: string, value: any) => StorageManager.saveToSessionStorage(key, value),
  get: <T = any>(key: string) => StorageManager.getFromSessionStorage<T>(key),
  has: (key: string) => {
    try {
      return sessionStorage.getItem(key) !== null
    } catch {
      return false
    }
  },
  remove: (key: string) => StorageManager.deleteFromSessionStorage(key),
  clear: () => {
    try {
      sessionStorage.clear()
    } catch (error) {
      console.error('SessionStorage clear error:', error)
    }
  },
}
