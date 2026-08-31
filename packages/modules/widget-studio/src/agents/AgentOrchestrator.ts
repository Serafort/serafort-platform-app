/**
 * Agent Orchestrator — Frontend coordinator for the Widget Studio pipeline.
 *
 * Delegates all pipeline execution to the backend via TanStack Query mutations.
 * The SSE stream tracker in `widgetAgentClient.ts` handles real-time UI updates.
 *
 * This module provides imperative helpers that can be called from non-hook contexts
 * (e.g. event handlers that already have access to the mutation functions).
 */
import type { WidgetDefinition, WidgetAuditEntry } from '@cap/shared-types'
import { useAppStore } from '@cap/platform-store'
import { apiClient } from '@cap/platform-core'
import { connectPipelineStream, disconnectStream } from '../services/widgetAgentClient'
import type { GenerateWidgetResponse } from '../hooks/useWidgetStudioQuery'

export interface OrchestratorOptions {
  /** Draft ID in the Zustand store to update */
  draftId: string
  /** Raw user prompt */
  prompt: string
  /** Override the AI provider type */
  providerType?: string
  /** Override the AI model */
  model?: string
  /** Whether to auto-publish after successful validation */
  autoPublish?: boolean
  /** Target dashboard page */
  pageId?: string
}

export interface OrchestratorResult {
  success: boolean
  runId?: number
  dsl?: WidgetDefinition
  error?: string
}

/**
 * Run the full widget generation pipeline via the backend.
 *
 * This is an imperative wrapper for contexts where React hooks are not available.
 * In React components, prefer using `useGenerateWidget()` directly.
 */
export async function runAgentPipeline(
  options: OrchestratorOptions,
): Promise<OrchestratorResult> {
  const { draftId, prompt, autoPublish = false, pageId = 'dashboard' } = options
  const store = useAppStore.getState()

  // Set UI state
  store.setWidgetStudioRunning(true)
  store.setWidgetLifecycle(draftId, 'draft')

  try {
    const response = await apiClient.post<GenerateWidgetResponse>('/api/v1/widgets/generate', {
      draftId,
      prompt,
      userId: 1, // Resolved server-side from auth token
      providerType: options.providerType || store.selectedProvider || 'gemini',
      model: options.model || store.selectedModel,
      autoPublish,
      pageId,
      runAsync: true,
    })

    const data = response.data
    if (!data?.success || !data.runId) {
      const errorMsg = data?.error || 'Failed to initialize agent pipeline run on server'
      store.updateWidgetAgent(draftId, 'requirement', { status: 'error', error: errorMsg })
      store.setWidgetStudioRunning(false)
      return { success: false, error: errorMsg }
    }

    // Connect SSE stream for live updates
    connectPipelineStream({
      runId: data.runId,
      draftId,
      prompt,
      autoPublish,
    })

    return { success: true, runId: data.runId }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    store.updateWidgetAgent(draftId, 'requirement', { status: 'error', error: errorMsg })
    store.setWidgetStudioRunning(false)
    return { success: false, error: errorMsg }
  }
}

/**
 * Publish a validated widget DSL to the dashboard via the backend API.
 *
 * Imperative wrapper for non-hook contexts. Prefer `usePublishWidget()` in components.
 */
export async function publishDraft(
  draftId: string,
  pageId = 'dashboard',
): Promise<boolean> {
  const store = useAppStore.getState()
  const draft = store.widgetDrafts.find((d) => d.id === draftId)

  if (!draft?.dsl) {
    console.error('[AgentOrchestrator] No DSL found for draft:', draftId)
    return false
  }

  store.updateWidgetAgent(draftId, 'publish', {
    status: 'running',
    startedAt: new Date().toISOString(),
  })

  try {
    const response = await apiClient.post<{ success: boolean; error?: string }>('/api/v1/widgets/publish', {
      draftId,
      dsl: draft.dsl,
      pageId,
    })

    if (response.data?.success) {
      store.setWidgetLifecycle(draftId, 'published')
      store.updateWidgetAgent(draftId, 'publish', {
        status: 'done',
        completedAt: new Date().toISOString(),
      })

      // Add to local layout store for instant feedback
      const currentLayout = store.layouts?.[pageId]
      if (currentLayout) {
        const newSlotId = `${pageId}-ai-slot-${Date.now()}`
        store.addSlot(pageId, newSlotId, {
          widgetId: draft.dsl.component,
          config: draft.dsl.props,
        } as any, {
          span: draft.dsl.layout.width as 4 | 8 | 12,
          height: draft.dsl.layout.height as 200 | 280 | 340 | 400,
        })
      }

      const auditEntry: WidgetAuditEntry = {
        widgetId: draft.dsl.id,
        createdBy: 'current-user',
        generatedAt: new Date().toISOString(),
        model: store.selectedModel || 'gemini-2.0-flash',
        version: draft.dsl.version,
        action: 'published',
      }
      store.appendAuditEntry(draftId, auditEntry)

      return true
    }

    store.updateWidgetAgent(draftId, 'publish', {
      status: 'error',
      error: response.data?.error || 'Publish failed',
    })
    return false
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    store.updateWidgetAgent(draftId, 'publish', { status: 'error', error: errorMsg })
    return false
  }
}

/**
 * Cancel an active pipeline run.
 */
export async function cancelPipelineRun(runId: number): Promise<boolean> {
  disconnectStream(runId)
  try {
    const response = await apiClient.post<{ success: boolean }>(`/api/v1/widgets/runs/${runId}/cancel`, {})
    return response.data?.success ?? false
  } catch {
    return false
  }
}
