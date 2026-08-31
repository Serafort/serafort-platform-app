import { apiClient, FetchResponse, ENDPOINTS } from '@cap/platform-core'

export interface ClientApp {
  id: string
  name: string
  clientId?: string
  clientSecret?: string
  redirectUris?: string[]
  redirect_uris?: string[]
  allowedOrigins?: string[]
  allowed_origins?: string[]
  grantTypes?: string[]
  grant_types?: string[]
  scope?: string
  scopes?: string[]
  logoUri?: string
  logo_uri?: string
  status?: 'active' | 'inactive' | 'suspended'
  createdAt?: string
  created_at?: string
  updatedAt?: string
  updated_at?: string
}

export interface ScopeItem {
  id: number | string
  name: string
  description?: string
  isSystem?: boolean
  is_system?: boolean
  createdAt?: string
  created_at?: string
}

export interface WebhookItem {
  id: number | string
  url: string
  name?: string
  secret?: string
  events: string[]
  isActive?: boolean
  is_active?: boolean
  lastDeliveryStatus?: 'success' | 'failed' | 'pending' | null
  last_delivery_status?: 'success' | 'failed' | 'pending' | null
  createdAt?: string
  created_at?: string
}

export interface WebhookTestResult {
  success: boolean
  statusCode?: number
  status_code?: number
  responseTimeMs?: number
  response_time_ms?: number
  responseBody?: string
  response_body?: string
  error?: string
}

export interface ModuleItem {
  id: string
  name: string
  version: string
  description?: string
  enabled: boolean
  isCore?: boolean
  author?: string
  installedAt?: string
}

export const developerService = {
  // Clients (Applications)
  getClients: (): Promise<FetchResponse<ClientApp[]>> => {
    return apiClient.get<ClientApp[]>(ENDPOINTS.admin.clients.index)
  },

  getClientById: (id: string): Promise<FetchResponse<ClientApp>> => {
    return apiClient.get<ClientApp>(ENDPOINTS.admin.clients.byId(id))
  },

  createClient: (body: Partial<ClientApp>): Promise<FetchResponse<ClientApp>> => {
    return apiClient.post<ClientApp>(ENDPOINTS.admin.clients.store, body)
  },

  updateClient: (id: string, body: Partial<ClientApp>): Promise<FetchResponse<ClientApp>> => {
    return apiClient.patch<ClientApp>(ENDPOINTS.admin.clients.update(id), body)
  },

  deleteClient: (id: string): Promise<FetchResponse<{ message: string }>> => {
    return apiClient.delete<{ message: string }>(ENDPOINTS.admin.clients.destroy(id))
  },

  rotateClientSecret: (id: string): Promise<FetchResponse<{ clientSecret: string; client_secret?: string }>> => {
    return apiClient.post<{ clientSecret: string; client_secret?: string }>(ENDPOINTS.admin.clients.rotateSecret(id))
  },

  // Scopes
  getScopes: (): Promise<FetchResponse<ScopeItem[]>> => {
    return apiClient.get<ScopeItem[]>(ENDPOINTS.admin.scopes.list)
  },

  createScope: (body: Partial<ScopeItem>): Promise<FetchResponse<ScopeItem>> => {
    return apiClient.post<ScopeItem>(ENDPOINTS.admin.scopes.store, body)
  },

  updateScope: (id: number, body: Partial<ScopeItem>): Promise<FetchResponse<ScopeItem>> => {
    return apiClient.patch<ScopeItem>(ENDPOINTS.admin.scopes.update(id), body)
  },

  deleteScope: (id: number): Promise<FetchResponse<{ message: string }>> => {
    return apiClient.delete<{ message: string }>(ENDPOINTS.admin.scopes.destroy(id))
  },

  // Webhooks
  getWebhooks: (): Promise<FetchResponse<WebhookItem[]>> => {
    return apiClient.get<WebhookItem[]>(ENDPOINTS.admin.webhooks.index)
  },

  getWebhookById: (id: number): Promise<FetchResponse<WebhookItem>> => {
    return apiClient.get<WebhookItem>(ENDPOINTS.admin.webhooks.byId(id))
  },

  createWebhook: (body: Partial<WebhookItem>): Promise<FetchResponse<WebhookItem>> => {
    return apiClient.post<WebhookItem>(ENDPOINTS.admin.webhooks.store, body)
  },

  updateWebhook: (id: number, body: Partial<WebhookItem>): Promise<FetchResponse<WebhookItem>> => {
    return apiClient.patch<WebhookItem>(ENDPOINTS.admin.webhooks.update(id), body)
  },

  deleteWebhook: (id: number): Promise<FetchResponse<{ message: string }>> => {
    return apiClient.delete<{ message: string }>(ENDPOINTS.admin.webhooks.destroy(id))
  },

  testWebhook: (id: number): Promise<FetchResponse<WebhookTestResult>> => {
    return apiClient.post<WebhookTestResult>(ENDPOINTS.admin.webhooks.test(id))
  },
}

export default developerService
