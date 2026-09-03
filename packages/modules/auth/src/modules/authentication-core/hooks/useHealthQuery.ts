import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { FetchResponse, HttpError, apiClient } from '@cap/platform-core'
import { ENDPOINTS } from '@cap/platform-core'

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime?: number
  version?: string
}

export interface DetailedHealth {
  status: string
  timestamp: string
  lastCheck?: string
  healthScore?: number
  appVersion?: string
  environment?: string
  uptime?: string | number
  server?: string
  services: {
    name: string
    status: 'up' | 'down' | 'degraded'
    latency?: number
    message?: string
  }[]
  dependencies?: {
    id: string
    name: string
    description: string
    status: 'healthy' | 'degraded' | 'outage'
    responseTime: string | number
    version: string
  }[]
  database?: {
    status: string
    connectionPool?: number
    latency?: number
  }
  cache?: {
    status: string
    hitRate?: number
  }
  queue?: {
    status: string
    pendingJobs?: number
  }
}

export interface SystemMetrics {
  cpu: number
  memory: {
    used: number
    total: number
    percentage: number
  }
  disk: {
    used: number
    total: number
    percentage: number
  }
  network: {
    rx: number
    tx: number
  }
}

export function useHealth(
  options?: Omit<UseQueryOptions<FetchResponse<HealthStatus>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['health', 'basic'],
    queryFn: () => apiClient.get<HealthStatus>(ENDPOINTS.health.basic),
    staleTime: 1000 * 60,
    ...options,
  })
}

export function useHealthLive(
  options?: Omit<UseQueryOptions<FetchResponse<HealthStatus>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['health', 'live'],
    queryFn: () => apiClient.get<HealthStatus>(ENDPOINTS.health.live),
    staleTime: 1000 * 30,
    refetchInterval: 30000,
    ...options,
  })
}

export function useHealthReady(
  options?: Omit<UseQueryOptions<FetchResponse<HealthStatus>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['health', 'ready'],
    queryFn: () => apiClient.get<HealthStatus>(ENDPOINTS.health.ready),
    staleTime: 1000 * 30,
    ...options,
  })
}

export function useDetailedHealth(
  options?: Omit<UseQueryOptions<FetchResponse<DetailedHealth>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['health', 'detailed'],
    queryFn: () => apiClient.get<DetailedHealth>(ENDPOINTS.health.detailed),
    staleTime: 1000 * 60,
    ...options,
  })
}

export function useHealthStartup(
  options?: Omit<UseQueryOptions<FetchResponse<any>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['health', 'startup'],
    queryFn: () => apiClient.get(ENDPOINTS.health.startup),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function useMetrics(
  options?: Omit<UseQueryOptions<FetchResponse<SystemMetrics>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['metrics', 'basic'],
    queryFn: () => apiClient.get<SystemMetrics>(ENDPOINTS.metrics.basic),
    staleTime: 1000 * 30,
    refetchInterval: 30000,
    ...options,
  })
}

export function usePrometheusMetrics(
  options?: Omit<UseQueryOptions<FetchResponse<string>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['metrics', 'prometheus'],
    queryFn: () => apiClient.get<string>(ENDPOINTS.metrics.prometheus),
    staleTime: 1000 * 60,
    ...options,
  })
}
