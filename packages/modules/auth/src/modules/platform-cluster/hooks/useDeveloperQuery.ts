import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import developerService, {
  ClientApp,
  ScopeItem,
  WebhookItem,
  WebhookTestResult,
} from '../services/developer.service'

export const DEVELOPER_QUERY_KEYS = {
  all: ['admin', 'developer'] as const,
  clients: () => [...DEVELOPER_QUERY_KEYS.all, 'clients'] as const,
  clientById: (id: string) => [...DEVELOPER_QUERY_KEYS.all, 'client', id] as const,
  scopes: () => [...DEVELOPER_QUERY_KEYS.all, 'scopes'] as const,
  webhooks: () => [...DEVELOPER_QUERY_KEYS.all, 'webhooks'] as const,
  webhookById: (id: number) => [...DEVELOPER_QUERY_KEYS.all, 'webhook', id] as const,
}

// Applications (OIDC / OAuth2 Clients)
export function useClientsQuery() {
  return useQuery({
    queryKey: DEVELOPER_QUERY_KEYS.clients(),
    queryFn: async () => {
      const response = await developerService.getClients()
      return (Array.isArray(response.data) ? response.data : []) as ClientApp[]
    },
    staleTime: 30000,
  })
}

export function useClientDetailQuery(id: string) {
  return useQuery({
    queryKey: DEVELOPER_QUERY_KEYS.clientById(id),
    queryFn: async () => {
      const response = await developerService.getClientById(id)
      return response.data as ClientApp
    },
    enabled: !!id,
  })
}

export function useCreateClientMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<ClientApp>) => developerService.createClient(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVELOPER_QUERY_KEYS.clients() })
    },
  })
}

export function useUpdateClientMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<ClientApp> }) =>
      developerService.updateClient(id, body),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: DEVELOPER_QUERY_KEYS.clients() })
      queryClient.invalidateQueries({ queryKey: DEVELOPER_QUERY_KEYS.clientById(vars.id) })
    },
  })
}

export function useDeleteClientMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => developerService.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVELOPER_QUERY_KEYS.clients() })
    },
  })
}

export function useRotateClientSecretMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => developerService.rotateClientSecret(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: DEVELOPER_QUERY_KEYS.clientById(id) })
      queryClient.invalidateQueries({ queryKey: DEVELOPER_QUERY_KEYS.clients() })
    },
  })
}

// Scopes
export function useScopesQuery() {
  return useQuery({
    queryKey: DEVELOPER_QUERY_KEYS.scopes(),
    queryFn: async () => {
      const response = await developerService.getScopes()
      return (Array.isArray(response.data) ? response.data : []) as ScopeItem[]
    },
    staleTime: 60000,
  })
}

export function useCreateScopeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<ScopeItem>) => developerService.createScope(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVELOPER_QUERY_KEYS.scopes() })
    },
  })
}

export function useUpdateScopeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<ScopeItem> }) =>
      developerService.updateScope(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVELOPER_QUERY_KEYS.scopes() })
    },
  })
}

export function useDeleteScopeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => developerService.deleteScope(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVELOPER_QUERY_KEYS.scopes() })
    },
  })
}

// Webhooks
export function useWebhooksQuery() {
  return useQuery({
    queryKey: DEVELOPER_QUERY_KEYS.webhooks(),
    queryFn: async () => {
      const response = await developerService.getWebhooks()
      return (Array.isArray(response.data) ? response.data : []) as WebhookItem[]
    },
    staleTime: 30000,
  })
}

export function useWebhookDetailQuery(id: number) {
  return useQuery({
    queryKey: DEVELOPER_QUERY_KEYS.webhookById(id),
    queryFn: async () => {
      const response = await developerService.getWebhookById(id)
      return response.data as WebhookItem
    },
    enabled: !!id,
  })
}

export function useCreateWebhookMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<WebhookItem>) => developerService.createWebhook(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVELOPER_QUERY_KEYS.webhooks() })
    },
  })
}

export function useUpdateWebhookMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<WebhookItem> }) =>
      developerService.updateWebhook(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVELOPER_QUERY_KEYS.webhooks() })
    },
  })
}

export function useDeleteWebhookMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => developerService.deleteWebhook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEVELOPER_QUERY_KEYS.webhooks() })
    },
  })
}

export function useTestWebhookMutation() {
  return useMutation({
    mutationFn: (id: number) => developerService.testWebhook(id),
  })
}
