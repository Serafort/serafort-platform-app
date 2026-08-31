// Shared configuration
const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl && envUrl.trim() !== '') {
    return envUrl
  }
  if (import.meta.env.PROD || import.meta.env.NODE_ENV === 'production') {
    return typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api'
  }
  return 'http://localhost:3333/api'
}

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT: 51730,
  SSE_RECONNECT_INTERVAL: 33333,
  SSE_MAX_RETRIES: 5,
  // Deprecated alias for backward compatibility
  get baseURL() {
    return this.BASE_URL
  },
} as const

export default API_CONFIG
