import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import healthService, {
  DetailedHealthResponse,
  QueueHealthResponse,
  SecurityHealthResponse,
} from '../services/health.service'

export const HEALTH_QUERY_KEYS = {
  all: ['system', 'health'] as const,
  basic: () => [...HEALTH_QUERY_KEYS.all, 'basic'] as const,
  live: () => [...HEALTH_QUERY_KEYS.all, 'live'] as const,
  ready: () => [...HEALTH_QUERY_KEYS.all, 'ready'] as const,
  detailed: () => [...HEALTH_QUERY_KEYS.all, 'detailed'] as const,
  startup: () => [...HEALTH_QUERY_KEYS.all, 'startup'] as const,
  queue: () => [...HEALTH_QUERY_KEYS.all, 'queue'] as const,
  security: () => [...HEALTH_QUERY_KEYS.all, 'security'] as const,
}

export function useBasicHealth(options?: Partial<UseQueryOptions<any, any>>) {
  return useQuery({
    queryKey: HEALTH_QUERY_KEYS.basic(),
    queryFn: async () => {
      const res = await healthService.getBasic()
      return res.data
    },
    staleTime: 30000,
    ...options,
  })
}

export function useLiveHealth(options?: Partial<UseQueryOptions<any, any>>) {
  return useQuery({
    queryKey: HEALTH_QUERY_KEYS.live(),
    queryFn: async () => {
      const res = await healthService.getLive()
      return res.data
    },
    staleTime: 10000,
    refetchInterval: 10000,
    ...options,
  })
}

export function useReadyHealth(options?: Partial<UseQueryOptions<any, any>>) {
  return useQuery({
    queryKey: HEALTH_QUERY_KEYS.ready(),
    queryFn: async () => {
      const res = await healthService.getReady()
      return res.data
    },
    staleTime: 10000,
    ...options,
  })
}

export function useDetailedHealth(options?: Partial<UseQueryOptions<DetailedHealthResponse, any>>) {
  return useQuery({
    queryKey: HEALTH_QUERY_KEYS.detailed(),
    queryFn: async () => {
      const res = await healthService.getDetailed()
      return res.data as DetailedHealthResponse
    },
    staleTime: 15000,
    refetchInterval: 15000,
    ...options,
  })
}

export function useStartupHealth(options?: Partial<UseQueryOptions<any, any>>) {
  return useQuery({
    queryKey: HEALTH_QUERY_KEYS.startup(),
    queryFn: async () => {
      const res = await healthService.getStartup()
      return res.data
    },
    staleTime: 60000,
    ...options,
  })
}

export function useQueueHealth(options?: Partial<UseQueryOptions<QueueHealthResponse, any>>) {
  return useQuery({
    queryKey: HEALTH_QUERY_KEYS.queue(),
    queryFn: async () => {
      const res = await healthService.getQueueStatus()
      return res.data as QueueHealthResponse
    },
    staleTime: 15000,
    refetchInterval: 15000,
    ...options,
  })
}

export function useSecurityHealth(options?: Partial<UseQueryOptions<SecurityHealthResponse, any>>) {
  return useQuery({
    queryKey: HEALTH_QUERY_KEYS.security(),
    queryFn: async () => {
      const res = await healthService.getSecurityHealth()
      return res.data as SecurityHealthResponse
    },
    staleTime: 30000,
    refetchInterval: 30000,
    ...options,
  })
}
