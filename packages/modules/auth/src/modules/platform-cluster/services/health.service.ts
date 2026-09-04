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

/**
 * What `/api/health/queue` actually returns: one dependency status for the
 * `sync-directory` queue.
 *
 * The count fields below were aspirational — the endpoint has never returned
 * them, so anything reading `waitingCount` here was reading `undefined`. They
 * are kept optional for callers that still reference them, but the real source
 * of job counts is `queueTelemetryService.getQueues()`.
 */
export interface QueueHealthResponse {
  id?: string
  name?: string
  description?: string
  status: 'healthy' | 'degraded' | 'outage' | 'unhealthy'
  responseTime?: string
  version?: string
  /** @deprecated Never populated by this endpoint — use the queue telemetry API. */
  waitingCount?: number
  /** @deprecated Never populated by this endpoint — use the queue telemetry API. */
  activeCount?: number
  /** @deprecated Never populated by this endpoint — use the queue telemetry API. */
  failedCount?: number
  /** @deprecated Never populated by this endpoint — use the queue telemetry API. */
  completedCount?: number
  /** @deprecated Never populated by this endpoint — use the queue telemetry API. */
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

  /**
   * Liveness for the directory-sync queue only — the backend answers a single
   * `DependencyStatus`, not job counts. For per-queue waiting/active/failed
   * figures use `queueTelemetryService.getQueues()`.
   */
  getQueueStatus: (): Promise<FetchResponse<QueueHealthResponse>> => {
    return apiClient.get<QueueHealthResponse>(ENDPOINTS.health.queue)
  },

  getSecurityHealth: (): Promise<FetchResponse<SecurityHealthResponse>> => {
    return apiClient.get<SecurityHealthResponse>(ENDPOINTS.admin.security.health)
  },

  getPrometheusMetrics: (): Promise<FetchResponse<string>> => {
    return apiClient.get<string>('/api/metrics/prometheus')
  },
}

export default healthService
