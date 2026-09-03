export type ConnectorType =
  | 'azure_ad'
  | 'okta'
  | 'google_workspace'
  | 'generic_scim'
  | 'active_directory'

export type SyncStatus = 'active' | 'syncing' | 'failed' | 'paused' | 'warning'

export interface DirectoryConnector {
  id: string
  name: string
  type: ConnectorType
  status: SyncStatus
  lastSyncAt?: string
  successRate: number // Percentage 0-100
  synchronizedUsers: number
  synchronizedGroups: number
  endpointUrl?: string
  authConfig: {
    type: 'bearer' | 'oauth2' | 'basic'
    secretHint?: string
    clientId?: string
  }
}

export interface SyncLog {
  id: string
  connectorId: string
  timestamp: string
  event: 'user_created' | 'user_updated' | 'user_deleted' | 'group_synced' | 'sync_error'
  target: string // User email or Group name
  status: 'success' | 'failure'
  details?: string
  errorMessage?: string
}

export interface SCIMConfig {
  enabled: boolean
  baseUrl: string
  tokenExpiry?: string
  attributeMapping: Record<string, string> // SCIM -> Internal
}
