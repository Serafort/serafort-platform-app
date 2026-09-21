import { apiClient, type FetchResponse } from "@cap/platform-store";
import { ENDPOINTS } from "@cap/api-contracts";

export interface DeveloperApiKeyItem {
  id: number;
  userId: number;
  name: string;
  keyHash: string;
  key?: string; // only returned once on creation
  expiresAt: string | null;
  createdAt: string;
  updatedAt?: string;
}

/**
 * A webhook subscription as `Webhook.serialize()` returns it. Note `id` is a
 * uuid string, not a number — the table's primary key is `uuid`.
 */
export interface WebhookItem {
  id: string;
  url: string;
  eventTypes: string[];
  isActive: boolean;
  /** True when auto-disabled by the retry budget, or manually paused. */
  isDisabled: boolean;
  maxRetries: number;
  timeoutSeconds: number;
  failureCount: number;
  lastTriggeredAt: string | null;
  /**
   * Set when the retry budget auto-disabled the endpoint. Null with
   * `isActive: false` means an admin simply paused it.
   */
  disabledAt: string | null;
  /**
   * Only ever populated on the create response. Reads withhold it, so treat any
   * value here as one-time-only.
   */
  secret?: string;
  createdAt: string;
  updatedAt?: string;
}

/** The catalogue of subscribable events, grouped by category. */
export interface WebhookEventCatalog {
  categories: Record<string, string[]>;
}

/**
 * What actually happened when the server dialled the endpoint. Returned on a
 * successful ping (HTTP 200) and on a failed one (HTTP 502) alike, so the
 * console can render the transport detail either way.
 */
export interface WebhookTestResult {
  ok: boolean;
  message: string;
  webhookUrl: string;
  statusCode: number | null;
  statusText: string | null;
  durationMs: number;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string> | null;
  responseBody: string | null;
  error: string | null;
  payload: unknown;
  webhook: WebhookItem;
}

export class DeveloperService {
  /**
   * List all developer API keys for the current user/tenant
   */
  async listApiKeys(): Promise<FetchResponse<DeveloperApiKeyItem[]>> {
    return apiClient.get<DeveloperApiKeyItem[]>(ENDPOINTS.developer.apiKeys);
  }

  /**
   * Create a new developer API key with optional expiration
   */
  async createApiKey(data: {
    name: string;
    expiresAt?: string | null;
  }): Promise<FetchResponse<DeveloperApiKeyItem>> {
    return apiClient.post<DeveloperApiKeyItem>(
      ENDPOINTS.developer.apiKeys,
      data,
    );
  }

  /**
   * Revoke/delete a developer API key
   */
  async deleteApiKey(id: number | string): Promise<FetchResponse<void>> {
    return apiClient.delete<void>(ENDPOINTS.developer.apiKeyById(id));
  }

  /**
   * List all registered webhooks
   */
  async listWebhooks(): Promise<FetchResponse<WebhookItem[]>> {
    return apiClient.get<WebhookItem[]>(ENDPOINTS.developer.webhooks);
  }

  /**
   * Fetch the server's catalogue of subscribable event types
   */
  async listWebhookEventTypes(): Promise<FetchResponse<WebhookEventCatalog>> {
    return apiClient.get<WebhookEventCatalog>(
      ENDPOINTS.developer.webhookEventTypes,
    );
  }

  /**
   * Get single webhook by ID
   */
  async getWebhook(id: number | string): Promise<FetchResponse<WebhookItem>> {
    return apiClient.get<WebhookItem>(ENDPOINTS.developer.webhookById(id));
  }

  /**
   * Create a new webhook subscription
   */
  async createWebhook(data: {
    url: string;
    eventTypes: string[];
    isActive?: boolean;
  }): Promise<FetchResponse<WebhookItem>> {
    return apiClient.post<WebhookItem>(ENDPOINTS.developer.webhooks, data);
  }

  /**
   * Update existing webhook configuration
   *
   * The backend only registers `PATCH /api/admin/webhooks/:id`
   * (`webhooks_controller.update`) — there is no `PUT` route for this
   * resource, so a `PUT` request 404s and every edit silently fails.
   */
  async updateWebhook(
    id: number | string,
    data: {
      url?: string;
      eventTypes?: string[];
      isActive?: boolean;
    },
  ): Promise<FetchResponse<WebhookItem>> {
    return apiClient.patch<WebhookItem>(
      ENDPOINTS.developer.webhookById(id),
      data,
    );
  }

  /**
   * Delete a webhook endpoint
   */
  async deleteWebhook(id: number | string): Promise<FetchResponse<void>> {
    return apiClient.delete<void>(ENDPOINTS.developer.webhookById(id));
  }

  /**
   * Dispatch a test ping event to verify webhook reachability
   */
  async testWebhook(
    id: number | string,
  ): Promise<FetchResponse<WebhookTestResult>> {
    return apiClient.post<WebhookTestResult>(
      ENDPOINTS.developer.testWebhook(id),
      {},
    );
  }
}

export const developerService = new DeveloperService();
