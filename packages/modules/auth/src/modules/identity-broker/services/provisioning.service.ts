import { apiClient, ENDPOINTS, type FetchResponse } from '@cap/platform-core'
import type {
  DirectoryConnector,
  CreateConnectorDTO,
  UpdateConnectorDTO,
  SyncLog,
  ConnectorSyncResult,
} from '../types/provisioning.types'

export const provisioningService = {
  listConnectors: async (): Promise<FetchResponse<DirectoryConnector[]>> => {
    return apiClient.get<DirectoryConnector[]>(ENDPOINTS.admin.provisioning.index)
  },

  getConnector: async (id: number | string): Promise<FetchResponse<DirectoryConnector>> => {
    return apiClient.get<DirectoryConnector>(ENDPOINTS.admin.provisioning.byId(Number(id)))
  },

  createConnector: async (data: CreateConnectorDTO): Promise<FetchResponse<DirectoryConnector>> => {
    return apiClient.post<DirectoryConnector>(ENDPOINTS.admin.provisioning.store, data)
  },

  updateConnector: async (id: number | string, data: UpdateConnectorDTO): Promise<FetchResponse<DirectoryConnector>> => {
    return apiClient.patch<DirectoryConnector>(ENDPOINTS.admin.provisioning.update(Number(id)), data)
  },

  deleteConnector: async (id: number | string): Promise<FetchResponse<{ message?: string }>> => {
    return apiClient.delete(ENDPOINTS.admin.provisioning.destroy(Number(id)))
  },

  syncConnector: async (id: number | string): Promise<FetchResponse<ConnectorSyncResult>> => {
    return apiClient.post<ConnectorSyncResult>(ENDPOINTS.admin.provisioning.sync(Number(id)))
  },

  getConnectorLogs: async (id: number | string): Promise<FetchResponse<SyncLog[]>> => {
    return apiClient.get<SyncLog[]>(ENDPOINTS.admin.provisioning.logs(Number(id)))
  },
}

export default provisioningService
