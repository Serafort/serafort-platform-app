import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  developerService,
  type DeveloperApiKeyItem,
  type WebhookItem,
  type WebhookTestResult,
} from '@cap/auth-contracts'

// ---------------------------------------------------------------------------
// Query Key Registry
// ---------------------------------------------------------------------------

export const DEVCON_QUERY_KEYS = {
  all: ['admin', 'developer-console'] as const,

  // API Keys
  apiKeys: () => ['admin', 'api-keys'] as const,

  // Webhooks
  webhooks: () => ['admin', 'webhooks'] as const,
  webhookById: (id: number | string) => ['admin', 'webhooks', id] as const,
  // Kept outside the `['admin', 'webhooks']` prefix on purpose: the catalogue is
  // static config, so mutating a subscription must not invalidate it.
  webhookEventTypes: () => ['admin', 'webhook-event-types'] as const,
}

/**
 * An API key row as the backend may serialise it. The contract type is
 * camelCase, but older deployments answer snake_case and some carry a legacy
 * `title`; the screen reads whichever is present.
 */
export interface DeveloperApiKeyRecord extends DeveloperApiKeyItem {
  title?: string
  expires_at?: string | null
  created_at?: string | null
  last_used_at?: string | null
  lastUsedAt?: string | null
}

/**
 * Unwraps a list that may arrive bare or wrapped in `{ <key>: [...] }`,
 * `{ items: [...] }` or `{ data: [...] }`.
 */
function unwrapList<T>(raw: unknown, wrapperKey: string): T[] {
  if (Array.isArray(raw)) return raw as T[]
  if (raw && typeof raw === 'object') {
    const bag = raw as Record<string, unknown>
    const inner = bag[wrapperKey] ?? bag.items ?? bag.data
    if (Array.isArray(inner)) return inner as T[]
  }
  return []
}

// ---------------------------------------------------------------------------
// API Key Queries & Mutations
// ---------------------------------------------------------------------------

/**
 * Fetch all developer API keys for the current user/tenant.
 */
export function useApiKeysQuery() {
  return useQuery({
    queryKey: DEVCON_QUERY_KEYS.apiKeys(),
    queryFn: async () => {
      const response = await developerService.listApiKeys()
      // Handle wrapped responses (e.g. { data: [...] }, { keys: [...] })
      return unwrapList<DeveloperApiKeyRecord>(response?.data, 'keys')
    },
    staleTime: 30_000,
  })
}

/**
 * Create a new developer API key.
 * Returns the full key item including the one-time raw secret (`key` field).
 */
export function useCreateApiKeyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { name: string; expiresAt?: string | null }) => {
      const response = await developerService.createApiKey(data)
      return response.data as DeveloperApiKeyItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVCON_QUERY_KEYS.apiKeys() })
    },
  })
}

/**
 * Revoke / delete a developer API key by ID.
 */
export function useDeleteApiKeyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number | string) => {
      await developerService.deleteApiKey(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVCON_QUERY_KEYS.apiKeys() })
    },
  })
}

// ---------------------------------------------------------------------------
// Webhook Queries & Mutations
// ---------------------------------------------------------------------------

/**
 * Fetch all webhook subscriptions.
 */
export function useWebhooksQuery() {
  return useQuery({
    queryKey: DEVCON_QUERY_KEYS.webhooks(),
    queryFn: async () => {
      const response = await developerService.listWebhooks()
      return unwrapList<WebhookItem>(response?.data, 'webhooks')
    },
    staleTime: 30_000,
  })
}

/**
 * Fetch the server-owned catalogue of subscribable event types.
 *
 * The console used to hardcode this list, which drifted from the backend: a
 * subscription to an event the UI did not know about (`audit.checkpoint`,
 * `user.locked`) was invisible in the picker and silently dropped on save.
 */
export function useWebhookEventTypesQuery() {
  return useQuery({
    queryKey: DEVCON_QUERY_KEYS.webhookEventTypes(),
    queryFn: async () => {
      const response = await developerService.listWebhookEventTypes()
      const categories = response?.data?.categories
      return categories && typeof categories === 'object'
        ? (categories as Record<string, string[]>)
        : {}
    },
    staleTime: 5 * 60_000,
  })
}

/**
 * Create a new webhook endpoint.
 * The backend returns the full webhook record including the one-time `secret`.
 */
export function useCreateWebhookMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { url: string; eventTypes: string[]; isActive?: boolean }) => {
      const response = await developerService.createWebhook(data)
      return response.data as WebhookItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVCON_QUERY_KEYS.webhooks() })
    },
  })
}

/**
 * Update an existing webhook subscription.
 */
export function useUpdateWebhookMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number | string
      data: { url?: string; eventTypes?: string[]; isActive?: boolean }
    }) => {
      const response = await developerService.updateWebhook(id, data)
      return response.data as WebhookItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVCON_QUERY_KEYS.webhooks() })
    },
  })
}

/**
 * Delete a webhook endpoint.
 */
export function useDeleteWebhookMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number | string) => {
      await developerService.deleteWebhook(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVCON_QUERY_KEYS.webhooks() })
    },
  })
}

/**
 * Send a real test ping to a webhook endpoint.
 *
 * The server dials the URL for real, so the attempt moves `lastTriggeredAt` and
 * `failureCount` on the record (and can auto-disable a dead endpoint once the
 * retry budget is spent). The list is therefore invalidated on both outcomes,
 * not just on success, so the table reflects what the ping did.
 */
export function useTestWebhookMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number | string) => {
      const response = await developerService.testWebhook(id)
      return response.data as WebhookTestResult
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: DEVCON_QUERY_KEYS.webhooks() })
    },
  })
}
