import { apiClient, FetchResponse, ENDPOINTS } from '@cap/platform-core'

export interface ComponentHealthStatus {
  status: 'up' | 'down' | 'degraded' | 'healthy' | 'unhealthy'
  latencyMs?: number
  message?: string
  details?: Record<string, any>
}

export interface DetailedHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'ok'
  version?: string
  uptime?: number
  timestamp?: string
  services?: {
    database?: ComponentHealthStatus
    redis?: ComponentHealthStatus
    cache?: ComponentHealthStatus
    queue?: ComponentHealthStatus
    storage?: ComponentHealthStatus
    mail?: ComponentHealthStatus
  }
  system?: {
    memoryUsageMb?: number
    cpuUsagePercent?: number
    nodeVersion?: string
    heapUsedMb?: number
  }
}

export interface QueueHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  waitingCount: number
  activeCount: number
  failedCount: number
  completedCount: number
  delayedCount?: number
  latencyMs?: number
}

export interface SecurityHealthResponse {
  status: 'healthy' | 'warning' | 'critical'
  score: number
  checks: Array<{
    name: string
    passed: boolean
    severity: 'low' | 'medium' | 'high' | 'critical'
    description?: string
    recommendation?: string
  }>
  sslStatus?: {
    valid: boolean
    daysRemaining: number
    issuer?: string
  }
  securityHeaders?: Record<string, boolean>
}

const healthService = {
  getBasic: (): Promise<FetchResponse<{ status: string; timestamp?: string }>> => {
    return apiClient.get(ENDPOINTS.health.basic)
  },

  getLive: (): Promise<FetchResponse<{ status: string }>> => {
    return apiClient.get(ENDPOINTS.health.live)
  },

  getReady: (): Promise<FetchResponse<{ status: string; ready: boolean }>> => {
    return apiClient.get(ENDPOINTS.health.ready)
  },

  getDetailed: (): Promise<FetchResponse<DetailedHealthResponse>> => {
    return apiClient.get<DetailedHealthResponse>(ENDPOINTS.health.detailed)
  },

  getStartup: (): Promise<FetchResponse<{ status: string; initialized: boolean }>> => {
    return apiClient.get(ENDPOINTS.health.startup)
  },

  getQueueStatus: (): Promise<FetchResponse<QueueHealthResponse>> => {
    return apiClient.get<QueueHealthResponse>('/api/health/queue')
  },

  getSecurityHealth: (): Promise<FetchResponse<SecurityHealthResponse>> => {
    return apiClient.get<SecurityHealthResponse>(ENDPOINTS.admin.security.health)
  },

  getPrometheusMetrics: (): Promise<FetchResponse<string>> => {
    return apiClient.get<string>('/api/metrics/prometheus')
  },
}

export default healthService
