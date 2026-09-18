import { apiClient, FetchResponse, ENDPOINTS } from '@cap/platform-core'

/**
 * `OidcClient` (app/models/oidc/oidc_client.ts) does NOT use the app-wide
 * CamelCaseNamingStrategy for every field — several columns carry an explicit
 * `serializeAs` override and are ONLY ever emitted snake_case, regardless of
 * `CamelCaseResponseMiddleware` (which is also not registered in
 * start/kernel.ts, so it never runs anyway): `clientId` -> `client_id`,
 * `clientSecret` -> `client_secret`, `name` -> `client_name` (there is no
 * `name` key on the wire at all), `redirectUris` -> `redirect_uris`,
 * `grantTypes` -> `grant_types`, `responseTypes` -> `response_types`. Columns
 * without an override (`status`, `isActive`, `type`, `description`,
 * `createdAt`, `updatedAt`, `organizationId`) do stay camelCase, since the
 * naming strategy camelCases an already-camelCase property name as a no-op.
 * The camelCase variants below are kept only for forward-compat; the
 * snake_case ones are what actually arrives today. `allowedOrigins`,
 * `scope` (singular) and `logoUri` have no backing column on this model at
 * all (branding lives in a separate untyped `branding` JSON blob) and will
 * always be undefined.
 */
export interface ClientApp {
  id: string
  name?: string
  client_name?: string
  clientId?: string
  client_id?: string
  clientSecret?: string
  client_secret?: string
  redirectUris?: string[]
  redirect_uris?: string[]
  allowedOrigins?: string[]
  allowed_origins?: string[]
  grantTypes?: string[]
  grant_types?: string[]
  responseTypes?: string[]
  response_types?: string[]
  scope?: string
  scopes?: string[]
  logoUri?: string
  logo_uri?: string
  status?: 'active' | 'inactive' | 'suspended' | string
  isActive?: boolean
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

  updateClient: async (
    id: string,
    body: Partial<ClientApp>,
  ): Promise<FetchResponse<ClientApp>> => {
    // ClientsController.update returns { message, client }, not the client
    // flat at the top level like show()/store() do — unwrap it so every
    // client-shaped response this service returns has the same shape.
    const response = await apiClient.patch<{ message: string; client: ClientApp }>(
      ENDPOINTS.admin.clients.update(id),
      body,
    )
    return { ...response, data: response.data.client }
  },

  deleteClient: (id: string): Promise<FetchResponse<{ message: string }>> => {
    return apiClient.delete<{ message: string }>(ENDPOINTS.admin.clients.destroy(id))
  },

  rotateClientSecret: (
    id: string,
    // ClientsController.rotateSecret builds its response as a plain object
    // literal (not through the model's naming strategy), and only ever
    // writes the key `client_secret` — there is no camelCase `clientSecret`
    // key on the wire. Kept optional only for forward-compat.
  ): Promise<FetchResponse<{ message: string; client_secret: string; clientSecret?: string }>> => {
    return apiClient.post<{ message: string; client_secret: string; clientSecret?: string }>(
      ENDPOINTS.admin.clients.rotateSecret(id),
    )
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
