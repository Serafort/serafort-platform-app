import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { developerService, type DeveloperApiKeyItem, type WebhookItem } from '@cap/auth-contracts'

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
      const raw = response?.data
      if (Array.isArray(raw)) return raw as DeveloperApiKeyItem[]
      // Handle wrapped responses (e.g. { data: [...] }, { keys: [...] })
      const inner = (raw as any)?.keys ?? (raw as any)?.items ?? (raw as any)?.data
      return Array.isArray(inner) ? (inner as DeveloperApiKeyItem[]) : []
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
      const raw = response?.data
      if (Array.isArray(raw)) return raw as WebhookItem[]
      const inner = (raw as any)?.webhooks ?? (raw as any)?.items ?? (raw as any)?.data
      return Array.isArray(inner) ? (inner as WebhookItem[]) : []
    },
    staleTime: 30_000,
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
 * Send a test ping to a webhook endpoint.
 */
export function useTestWebhookMutation() {
  return useMutation({
    mutationFn: async (id: number | string) => {
      const response = await developerService.testWebhook(id)
      return response.data as { message: string; webhookUrl: string; payload: unknown }
    },
  })
}
