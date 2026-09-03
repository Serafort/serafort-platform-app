import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { FetchResponse, HttpError } from '@cap/platform-core';

import healthService from '../services/health.service';

const USER_KEYS = {
  basic: ['user', 'basic'] as const,
  live: ['user', 'live'] as const,
  ready: ['user', 'ready'] as const,
  detailed: ['user', 'detailed'] as const,
  startup: ['user', 'startup'] as const,
}

export function useBasicHealth(options?: UseQueryOptions<FetchResponse<any>, HttpError>) {
  return useQuery({
    queryKey: USER_KEYS.basic,
    queryFn: () => healthService.getBasic(),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function useLiveHealth(options?: UseQueryOptions<FetchResponse<any>, HttpError>) {
  return useQuery({
    queryKey: USER_KEYS.live,
    queryFn: () => healthService.getLive(),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function useReadyHealth(options?: UseQueryOptions<FetchResponse<any>, HttpError>) {
  return useQuery({
    queryKey: USER_KEYS.ready,
    queryFn: () => healthService.getReady(),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function useDetailedHealth(options?: UseQueryOptions<FetchResponse<any>, HttpError>) {
  return useQuery({
    queryKey: USER_KEYS.detailed,
    queryFn: () => healthService.getDetailed(),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

export function useStartupHealth(options?: UseQueryOptions<FetchResponse<any>, HttpError>) {
  return useQuery({
    queryKey: USER_KEYS.startup,
    queryFn: () => healthService.getStartup(),
    staleTime: 1000 * 60 * 5,
    ...options,
  })
}

