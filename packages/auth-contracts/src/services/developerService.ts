import { apiClient, type FetchResponse } from '@cap/platform-store'
import { ENDPOINTS } from '@cap/api-contracts'

export interface DeveloperApiKeyItem {
  id: number
  userId: number
  name: string
  keyHash: string
  key?: string // only returned once on creation
  expiresAt: string | null
  createdAt: string
  updatedAt?: string
}

export interface WebhookItem {
  id: number
  url: string
  eventTypes: string[]
  isActive: boolean
  secret: string
  createdAt: string
  updatedAt?: string
}

export class DeveloperService {
  /**
   * List all developer API keys for the current user/tenant
   */
  async listApiKeys(): Promise<FetchResponse<DeveloperApiKeyItem[]>> {
    return apiClient.get<DeveloperApiKeyItem[]>(ENDPOINTS.developer.apiKeys)
  }

  /**
   * Create a new developer API key with optional expiration
   */
  async createApiKey(data: {
    name: string
    expiresAt?: string | null
  }): Promise<FetchResponse<DeveloperApiKeyItem>> {
    return apiClient.post<DeveloperApiKeyItem>(ENDPOINTS.developer.apiKeys, data)
  }

  /**
   * Revoke/delete a developer API key
   */
  async deleteApiKey(id: number | string): Promise<FetchResponse<void>> {
    return apiClient.delete<void>(ENDPOINTS.developer.apiKeyById(id))
  }

  /**
   * List all registered webhooks
   */
  async listWebhooks(): Promise<FetchResponse<WebhookItem[]>> {
    return apiClient.get<WebhookItem[]>(ENDPOINTS.developer.webhooks)
  }

  /**
   * Get single webhook by ID
   */
  async getWebhook(id: number | string): Promise<FetchResponse<WebhookItem>> {
    return apiClient.get<WebhookItem>(ENDPOINTS.developer.webhookById(id))
  }

  /**
   * Create a new webhook subscription
   */
  async createWebhook(data: {
    url: string
    eventTypes: string[]
    isActive?: boolean
  }): Promise<FetchResponse<WebhookItem>> {
    return apiClient.post<WebhookItem>(ENDPOINTS.developer.webhooks, data)
  }

  /**
   * Update existing webhook configuration
   */
  async updateWebhook(
    id: number | string,
    data: {
      url?: string
      eventTypes?: string[]
      isActive?: boolean
    }
  ): Promise<FetchResponse<WebhookItem>> {
    return apiClient.put<WebhookItem>(ENDPOINTS.developer.webhookById(id), data)
  }

  /**
   * Delete a webhook endpoint
   */
  async deleteWebhook(id: number | string): Promise<FetchResponse<void>> {
    return apiClient.delete<void>(ENDPOINTS.developer.webhookById(id))
  }

  /**
   * Dispatch a test ping event to verify webhook reachability
   */
  async testWebhook(
    id: number | string
  ): Promise<FetchResponse<{ message: string; webhookUrl: string; payload: unknown }>> {
    return apiClient.post<{ message: string; webhookUrl: string; payload: unknown }>(
      ENDPOINTS.developer.testWebhook(id),
      {}
    )
  }
}

export const developerService = new DeveloperService()
