import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query'
import type { FetchResponse, HttpError } from '@cap/platform-core'
import provisioningService from '../services/provisioning.service'
import type {
  DirectoryConnector,
  CreateConnectorDTO,
  UpdateConnectorDTO,
  SyncLog,
  ConnectorSyncResult,
} from '../types/provisioning.types'

export const provisioningKeys = {
  all: ['admin', 'provisioning'] as const,
  connectors: () => [...provisioningKeys.all, 'connectors'] as const,
  connector: (id: string | number) => [...provisioningKeys.connectors(), String(id)] as const,
  logs: (id: string | number) => [...provisioningKeys.connector(id), 'logs'] as const,
}

export function useProvisioningConnectors(
  options?: Omit<UseQueryOptions<FetchResponse<DirectoryConnector[]>, HttpError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: provisioningKeys.connectors(),
    queryFn: () => provisioningService.listConnectors(),
    ...options,
  })
}

export function useProvisioningConnector(
  id: string | number | null | undefined,
  options?: Omit<UseQueryOptions<FetchResponse<DirectoryConnector>, HttpError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: provisioningKeys.connector(id || ''),
    queryFn: () => provisioningService.getConnector(id || ''),
    enabled: !!id,
    ...options,
  })
}

export function useCreateProvisioningConnector(
  options?: UseMutationOptions<FetchResponse<DirectoryConnector>, HttpError, CreateConnectorDTO, unknown>
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (data: CreateConnectorDTO) => provisioningService.createConnector(data),
    ...restOptions,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: provisioningKeys.connectors() })
      customOnSuccess?.(...args)
    },
  })
}

export function useUpdateProvisioningConnector(
  id?: string | number,
  options?: UseMutationOptions<FetchResponse<DirectoryConnector>, HttpError, { id?: string | number; data: UpdateConnectorDTO } | UpdateConnectorDTO, unknown>
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (payload) => {
      const targetId = ('id' in payload && payload.id) ? payload.id : id
      const targetData = ('data' in payload && payload.data) ? payload.data : (payload as UpdateConnectorDTO)
      if (!targetId) throw new Error('Connector ID is required for update')
      return provisioningService.updateConnector(targetId, targetData)
    },
    ...restOptions,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: provisioningKeys.connectors() })
      if (id) {
        queryClient.invalidateQueries({ queryKey: provisioningKeys.connector(id) })
      }
      customOnSuccess?.(...args)
    },
  })
}

export function useDeleteProvisioningConnector(
  options?: UseMutationOptions<FetchResponse<{ message?: string }>, HttpError, string | number, unknown>
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (id: string | number) => provisioningService.deleteConnector(id),
    ...restOptions,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: provisioningKeys.connectors() })
      customOnSuccess?.(...args)
    },
  })
}

export function useSyncProvisioningConnector(
  options?: UseMutationOptions<FetchResponse<ConnectorSyncResult>, HttpError, string | number, unknown>
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, ...restOptions } = options || {}
  return useMutation({
    mutationFn: (id: string | number) => provisioningService.syncConnector(id),
    ...restOptions,
    onSuccess: (...args) => {
      const variables = args[1]
      queryClient.invalidateQueries({ queryKey: provisioningKeys.connectors() })
      queryClient.invalidateQueries({ queryKey: provisioningKeys.connector(variables) })
      queryClient.invalidateQueries({ queryKey: provisioningKeys.logs(variables) })
      customOnSuccess?.(...args)
    },
  })
}

export function useProvisioningConnectorLogs(
  id: string | number | null | undefined,
  options?: Omit<UseQueryOptions<FetchResponse<SyncLog[]>, HttpError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: provisioningKeys.logs(id || ''),
    queryFn: () => provisioningService.getConnectorLogs(id || ''),
    enabled: !!id,
    ...options,
  })
}
