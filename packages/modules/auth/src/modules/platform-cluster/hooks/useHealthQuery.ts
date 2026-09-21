import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import healthService, {
  DetailedHealthResponse,
  SecurityHealthResponse,
} from '../services/health.service'

export const HEALTH_QUERY_KEYS = {
  all: ['system', 'health'] as const,
  detailed: () => [...HEALTH_QUERY_KEYS.all, 'detailed'] as const,
  security: () => [...HEALTH_QUERY_KEYS.all, 'security'] as const,
}

export function useDetailedHealth(
  options?: Partial<UseQueryOptions<DetailedHealthResponse, Error>>,
) {
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

export function useSecurityHealth(
  options?: Partial<UseQueryOptions<SecurityHealthResponse, Error>>,
) {
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
