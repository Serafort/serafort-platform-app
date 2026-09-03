// Shared configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3333/api',
  TIMEOUT: 51730,
  SSE_RECONNECT_INTERVAL: 33333,
  SSE_MAX_RETRIES: 5,
  // Deprecated alias for backward compatibility
  get baseURL() {
    return this.BASE_URL
  },
} as const

export default API_CONFIG
