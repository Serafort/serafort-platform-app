export type ConnectorType =
  | 'azure_ad'
  | 'okta'
  | 'google_workspace'
  | 'generic_scim'
  | 'active_directory'
  | 'ldap'
  | string

export type SyncStatus =
  | 'active'
  | 'syncing'
  | 'failed'
  | 'paused'
  | 'warning'
  | 'idle'
  | 'error'
  | string

export interface DirectoryConnector {
  id: string | number
  name: string
  type: ConnectorType
  status: SyncStatus
  lastSyncAt?: string | null
  last_sync_at?: string | null
  successRate?: number
  success_rate?: number
  synchronizedUsers?: number
  synchronized_users?: number
  synchronizedGroups?: number
  synchronized_groups?: number
  sync_count?: number
  syncCount?: number
  sync_interval_minutes?: number
  endpointUrl?: string
  endpoint_url?: string
  base_dn?: string
  bind_dn?: string
  authConfig?: {
    type: 'bearer' | 'oauth2' | 'basic'
    secretHint?: string
    clientId?: string
  }
  created_at?: string
  updated_at?: string
}

export interface CreateConnectorDTO {
  name: string
  type: ConnectorType
  endpoint_url?: string
  sync_interval_minutes?: number
  base_dn?: string
  bind_dn?: string
  bind_password?: string
  client_id?: string
  client_secret?: string
  auth_type?: string
}

export interface UpdateConnectorDTO {
  name?: string
  type?: ConnectorType
  endpoint_url?: string
  sync_interval_minutes?: number
  base_dn?: string
  bind_dn?: string
  bind_password?: string
  client_id?: string
  client_secret?: string
  auth_type?: string
  status?: SyncStatus
}

export interface SyncLog {
  id: string | number
  connectorId?: string | number
  connector_id?: string | number
  timestamp?: string
  created_at?: string
  event: 'user_created' | 'user_updated' | 'user_deleted' | 'group_synced' | 'sync_error' | string
  target: string // User email or Group name
  status: 'success' | 'failure' | 'warning' | string
  details?: string | null
  errorMessage?: string | null
  error_message?: string | null
}

/**
 * `ConnectorsController.sync` (`POST /api/admin/provisioning/:id/sync`)
 * responds `202 Accepted` with exactly `{ message, connectorId }` — the sync
 * itself runs on a queued job (`QueueService.addSyncJob`), so there is no
 * `status`, `jobId`, `synchronizedUsers/Groups` or `errorsCount` in the HTTP
 * response; those would have to come from polling the connector or its logs
 * afterward.
 */
export interface ConnectorSyncResult {
  message: string
  connectorId: string | number
}

/**
 * `ConnectorsController.logs` (`GET /api/admin/provisioning/:id/logs`) is
 * AdonisJS's `.paginate()` shape, not a flat array — `{ data, meta }`.
 */
export interface PaginatedSyncLogs {
  data: SyncLog[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
    firstPage: number
  }
}
