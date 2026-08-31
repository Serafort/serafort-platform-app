export type ConnectorType =
  | 'azure_ad'
  | 'okta'
  | 'google_workspace'
  | 'generic_scim'
  | 'active_directory'
  | 'ldap'
  | string

export type SyncStatus = 'active' | 'syncing' | 'failed' | 'paused' | 'warning' | 'idle' | 'error' | string

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

export interface ConnectorSyncResult {
  message: string
  status: 'success' | 'queued' | 'syncing' | string
  jobId?: string
  synchronizedUsers?: number
  synchronizedGroups?: number
  errorsCount?: number
}
