import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query'
import type { FetchResponse, HttpError } from '@cap/platform-core'
import ssfService from '../services/ssf.service'
import type {
  SSFConfig,
  UpdateSSFConfigDTO,
  SSFTestStreamRequest,
  SSFTestStreamResponse,
  SSFBroadcastEventDTO,
  SSFBroadcastEventResponse,
  SSFHistoryLog,
} from '../types/ssf.types'

export const ssfKeys = {
  all: ['admin', 'ssf'] as const,
  config: () => [...ssfKeys.all, 'config'] as const,
  history: () => [...ssfKeys.all, 'history'] as const,
}

export function useSSFConfig(
  options?: Omit<UseQueryOptions<FetchResponse<SSFConfig>, HttpError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ssfKeys.config(),
    queryFn: () => ssfService.getConfig(),
    ...options,
  })
}

export function useUpdateSSFConfig(
  options?: UseMutationOptions<
    FetchResponse<{ message: string; config?: SSFConfig }>,
    HttpError,
    UpdateSSFConfigDTO,
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (data: UpdateSSFConfigDTO) => ssfService.updateConfig(data),
    ...restOptions,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ssfKeys.config() })
      customOnSuccess?.(...args)
    },
  })
}

export function useTestSSFStream(
  options?: UseMutationOptions<
    FetchResponse<SSFTestStreamResponse>,
    HttpError,
    SSFTestStreamRequest | void,
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (data?: SSFTestStreamRequest | void) => ssfService.testStream(data || {}),
    ...restOptions,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ssfKeys.history() })
      customOnSuccess?.(...args)
    },
  })
}

export function useBroadcastSSFEvent(
  options?: UseMutationOptions<
    FetchResponse<SSFBroadcastEventResponse>,
    HttpError,
    SSFBroadcastEventDTO,
    unknown
  >,
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (data: SSFBroadcastEventDTO) => ssfService.broadcastEvent(data),
    ...restOptions,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ssfKeys.history() })
      customOnSuccess?.(...args)
    },
  })
}

export function useSSFHistory(
  options?: Omit<
    UseQueryOptions<FetchResponse<SSFHistoryLog[]>, HttpError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: ssfKeys.history(),
    queryFn: () => ssfService.getHistory(),
    ...options,
  })
}
