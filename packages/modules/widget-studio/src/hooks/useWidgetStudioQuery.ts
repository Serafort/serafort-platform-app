/**
 * useWidgetStudioQuery — TanStack React Query hooks for Widget Studio.
 *
 * - `useGenerateWidget()` — Mutation: POST /api/v1/widgets/generate → returns { runId, sseUrl }
 * - `usePublishWidget()` — Mutation: POST /api/v1/widgets/publish → persists to dashboard layout
 * - `useWidgetRun(runId)` — Query: GET /api/v1/widgets/runs/:id → run details
 *
 * SSE live-tracking is handled separately in `widgetAgentClient.ts` (pushes to Zustand).
 */
import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query'
import { apiClient, type FetchResponse, type HttpError } from '@cap/platform-core'
import type { WidgetDefinition } from '@cap/shared-types'
import { useAppStore } from '@cap/platform-store'
import { connectPipelineStream } from '../services/widgetAgentClient'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface GenerateWidgetRequest {
  draftId: string
  prompt: string
  providerType?: string
  model?: string
  autoPublish?: boolean
  pageId?: string
}

export interface GenerateWidgetResponse {
  success: boolean
  runId: number
  status: string
  sseUrl: string
  error?: string
}

export interface PublishWidgetRequest {
  runId?: number
  draftId: string
  dsl: WidgetDefinition
  pageId?: string
  tenantId?: string | number
}

export interface PublishWidgetResponse {
  success: boolean
  widgetId?: string
  slotId?: string
  error?: string
}

export interface WidgetRunResponse {
  id: number
  userId: number
  status: string
  startedAt: string
  completedAt?: string
  metadata: Record<string, unknown>
  tasks: Array<{
    id: number
    agentId: string
    status: string
    output?: unknown
    error?: string
  }>
}

// ─── Query Keys ─────────────────────────────────────────────────────────────

export const WIDGET_STUDIO_KEYS = {
  all: ['widget-studio'] as const,
  runs: () => ['widget-studio', 'runs'] as const,
  run: (runId: number) => ['widget-studio', 'runs', runId] as const,
  artifacts: () => ['widget-studio', 'artifacts'] as const,
  dashboardLayouts: () => ['dashboard', 'layouts'] as const,
}

// ─── useGenerateWidget ──────────────────────────────────────────────────────

/**
 * Triggers the multi-agent widget generation pipeline on the backend.
 * After a successful POST, automatically connects the SSE stream to Zustand.
 */
export function useGenerateWidget(
  options?: UseMutationOptions<FetchResponse<GenerateWidgetResponse>, HttpError, GenerateWidgetRequest, unknown>
) {
  const { onSuccess: customOnSuccess, onError: customOnError, onSettled: customOnSettled, ...restOptions } = options || {}

  return useMutation({
    ...restOptions,
    mutationFn: async (payload: GenerateWidgetRequest) => {
      const store = useAppStore.getState()

      // Set UI state
      store.setWidgetStudioRunning(true)
      store.setWidgetLifecycle(payload.draftId, 'draft')

      return apiClient.post<GenerateWidgetResponse>('/api/v1/widgets/generate', {
        draftId: payload.draftId,
        prompt: payload.prompt,
        userId: 1, // resolved server-side from auth token
        providerType: store.selectedProvider || 'gemini',
        model: payload.model || store.selectedModel,
        autoPublish: payload.autoPublish ?? false,
        pageId: payload.pageId ?? 'dashboard',
        runAsync: true,
      })
    },
    onSuccess: (...args) => {
      const [response, variables] = args
      const data = response.data
      if (data?.success && data.runId) {
        // Connect to the SSE stream now that we have a runId
        connectPipelineStream({
          runId: data.runId,
          draftId: variables.draftId,
          prompt: variables.prompt,
          autoPublish: variables.autoPublish,
        })
      } else {
        // Generation failed to initialize
        const store = useAppStore.getState()
        store.updateWidgetAgent(variables.draftId, 'requirement', {
          status: 'error',
          error: data?.error || 'Failed to initialize agent pipeline',
        })
        store.setWidgetStudioRunning(false)
      }
      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      const [error, variables] = args
      const store = useAppStore.getState()
      store.updateWidgetAgent(variables.draftId, 'requirement', {
        status: 'error',
        error: error.message || 'Network error',
      })
      store.setWidgetStudioRunning(false)
      customOnError?.(...args)
    },
    onSettled: (...args) => {
      customOnSettled?.(...args)
    },
  })
}

// ─── usePublishWidget ───────────────────────────────────────────────────────

/**
 * Publishes a validated widget DSL to the tenant's dashboard layout via backend API.
 * Invalidates dashboard layout caches on success.
 */
export function usePublishWidget(
  options?: UseMutationOptions<FetchResponse<PublishWidgetResponse>, HttpError, PublishWidgetRequest, unknown>
) {
  const queryClient = useQueryClient()
  const { onSuccess: customOnSuccess, onError: customOnError, onSettled: customOnSettled, ...restOptions } = options || {}

  return useMutation({
    ...restOptions,
    mutationFn: (payload: PublishWidgetRequest) =>
      apiClient.post<PublishWidgetResponse>('/api/v1/widgets/publish', {
        draftId: payload.draftId,
        dsl: payload.dsl,
        pageId: payload.pageId ?? 'dashboard',
        tenantId: payload.tenantId,
        runId: payload.runId,
      }),
    onSuccess: (...args) => {
      const [response, variables] = args
      const store = useAppStore.getState()
      if (response.data?.success) {
        store.setWidgetLifecycle(variables.draftId, 'published')
        store.updateWidgetAgent(variables.draftId, 'publish', {
          status: 'done',
          completedAt: new Date().toISOString(),
        })

        // Also add to local Zustand layout store for instant feedback
        const dsl = variables.dsl
        const pageId = variables.pageId ?? 'dashboard'
        const currentLayout = store.layouts?.[pageId]
        if (currentLayout && dsl) {
          const newSlotId = `${pageId}-ai-slot-${Date.now()}`
          store.addSlot(pageId, newSlotId, {
            widgetId: dsl.component,
            config: dsl.props,
          } as any, {
            span: dsl.layout.width as 4 | 8 | 12,
            height: dsl.layout.height as 200 | 280 | 340 | 400,
          })
        }
      }

      // Invalidate dashboard caches
      queryClient.invalidateQueries({ queryKey: WIDGET_STUDIO_KEYS.dashboardLayouts() })

      customOnSuccess?.(...args)
    },
    onError: (...args) => {
      const [error, variables] = args
      const store = useAppStore.getState()
      store.updateWidgetAgent(variables.draftId, 'publish', {
        status: 'error',
        error: error.message || 'Publish failed',
      })
      customOnError?.(...args)
    },
    onSettled: (...args) => {
      customOnSettled?.(...args)
    },
  })
}

// ─── useWidgetRun ───────────────────────────────────────────────────────────

/**
 * Fetch details for a specific agent pipeline run.
 */
export function useWidgetRun(
  runId: number | undefined,
  options?: Omit<UseQueryOptions<FetchResponse<WidgetRunResponse>, HttpError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: WIDGET_STUDIO_KEYS.run(runId!),
    queryFn: () => apiClient.get<WidgetRunResponse>(`/api/v1/widgets/runs/${runId}`),
    enabled: runId !== undefined && runId > 0,
    staleTime: 1000 * 30, // 30 seconds
    ...options,
  })
}
