/**
 * Widget Agent Client — Communicates with the backend AI Widget Pipeline via SSE.
 */
import type { WidgetDefinition, AgentId, WidgetAuditEntry } from '@cap/shared-types'
import { useAppStore } from '@cap/platform-store'
import { apiClient } from '@cap/platform-core'
import { sanitizeWidgetDsl } from '../agents/sanitizer'

export interface BackendGenerateRequest {
  draftId: string
  prompt: string
  userId?: string | number
  providerType?: string
  model?: string
  apiKey?: string
  autoPublish?: boolean
  pageId?: string
}

export interface BackendGenerateResponse {
  success: boolean
  runId: number
  status: string
  sseUrl: string
  error?: string
}

export interface SSEPipelineEvent {
  runId: number
  event: string
  timestamp: string
  agentId?: AgentId
  status?: 'idle' | 'running' | 'done' | 'error'
  text?: string
  output?: unknown
  error?: string
  dsl?: WidgetDefinition
  stages?: Record<string, unknown>
}

export interface ConnectStreamOptions {
  runId: number
  draftId: string
  prompt?: string
  userId?: string | number
  autoPublish?: boolean
  onComplete?: (dsl?: WidgetDefinition) => void
  onError?: (err: string) => void
}

/**
 * Resolve the API base URL from Vite environment.
 */
export function getApiBaseUrl(): string {
  const envUrl = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env
    .VITE_API_URL
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '')
  }
  return 'http://localhost:3333'
}

const activeStreams = new Map<number, EventSource>()

/**
 * Disconnect an active SSE stream by run ID.
 */
export function disconnectStream(runId: number): void {
  const stream = activeStreams.get(runId)
  if (stream) {
    stream.close()
    activeStreams.delete(runId)
  }
}

/**
 * Connect to an active backend SSE stream for an agent run and dispatch milestones into Zustand.
 */
export function connectPipelineStream(options: ConnectStreamOptions): () => void {
  const { runId, draftId, prompt = '', userId = 'anonymous', autoPublish = false, onComplete, onError } = options
  const store = useAppStore.getState()
  const baseUrl = getApiBaseUrl()
  const sseUrl = `${baseUrl}/api/v1/sse/agent-runs/${runId}`

  let finalDsl: WidgetDefinition | undefined
  const eventSource = new EventSource(sseUrl)
  activeStreams.set(runId, eventSource)

  eventSource.onmessage = (msgEvent) => {
    try {
      const payload: SSEPipelineEvent = JSON.parse(msgEvent.data)

      switch (payload.event) {
        case 'connected':
          // SSE stream connected
          break

        case 'agent_status': {
          const agentId = payload.agentId
          if (agentId) {
            store.updateWidgetAgent(draftId, agentId, {
              status: payload.status || 'running',
              startedAt: payload.status === 'running' ? new Date().toISOString() : undefined,
              completedAt: ['done', 'error'].includes(payload.status || '')
                ? new Date().toISOString()
                : undefined,
              output: payload.output,
              error: payload.error,
            })

            if (agentId === 'requirement' && payload.status === 'done') {
              store.setWidgetLifecycle(draftId, 'generated')
            } else if (agentId === 'component' && payload.status === 'done' && payload.output) {
              const compOut = payload.output as Record<string, unknown>
              if (compOut?.dsl) {
                const sanitized = sanitizeWidgetDsl({
                  id: (compOut.dsl as any)?.id || crypto.randomUUID(),
                  name: prompt.slice(0, 60),
                  version: '1.0.0',
                  component: compOut.widgetId,
                  props: compOut.suggestedProps ?? {},
                  layout: { width: 8, height: 280 },
                  behavior: { autoRefresh: false },
                  ...(compOut.dsl as any),
                })
                finalDsl = sanitized
                store.setWidgetDsl(draftId, sanitized)
              }
            } else if (agentId === 'validation' && payload.status === 'done') {
              store.setWidgetLifecycle(draftId, 'validated')
            } else if (agentId === 'preview' && payload.status === 'done') {
              store.setWidgetLifecycle(draftId, 'previewed')
            } else if (agentId === 'publish' && payload.status === 'done') {
              store.setWidgetLifecycle(draftId, 'published')
            }
          }
          break
        }

        case 'stream_chunk': {
          if (payload.agentId && payload.text) {
            store.appendAgentStream(draftId, payload.agentId, payload.text)
          }
          break
        }

        case 'run_completed': {
          eventSource.close()
          activeStreams.delete(runId)
          if (payload.dsl) {
            finalDsl = sanitizeWidgetDsl(payload.dsl)
            store.setWidgetDsl(draftId, finalDsl)
          }

          if (autoPublish) {
            store.setWidgetLifecycle(draftId, 'published')
            if (finalDsl) {
              const auditEntry: WidgetAuditEntry = {
                widgetId: finalDsl.id,
                createdBy: String(userId),
                generatedAt: new Date().toISOString(),
                model: store.selectedModel || 'gemini-2.0-flash',
                version: finalDsl.version || '1.0.0',
                action: 'published',
              }
              store.appendAuditEntry(draftId, auditEntry)
            }
          } else {
            store.setWidgetLifecycle(draftId, 'approved')
          }

          store.setWidgetStudioRunning(false)
          onComplete?.(finalDsl)
          break
        }

        case 'run_failed':
        case 'run_cancelled': {
          eventSource.close()
          activeStreams.delete(runId)
          const errorMsg = payload.error || 'Agent pipeline execution failed on backend'
          store.setWidgetStudioRunning(false)
          onError?.(errorMsg)
          break
        }

        default:
          break
      }
    } catch (parseErr) {
      console.warn('[widgetAgentClient] Failed to parse SSE event:', parseErr)
    }
  }

  eventSource.onerror = (err) => {
    console.error('[widgetAgentClient] SSE stream error:', err)
    eventSource.close()
    activeStreams.delete(runId)
    store.setWidgetStudioRunning(false)
    onError?.('Connection to server stream interrupted')
  }

  // Return unsubscribe / abort function
  return () => {
    eventSource.close()
    activeStreams.delete(runId)
  }
}

/**
 * Triggers the multi-agent pipeline on the backend and streams live events into the Zustand store.
 */
export async function executeBackendAgentPipeline(
  options: BackendGenerateRequest
): Promise<{ success: boolean; dsl?: WidgetDefinition; error?: string }> {
  const store = useAppStore.getState()
  const { draftId, prompt, userId = 'anonymous', autoPublish = false } = options

  store.setWidgetStudioRunning(true)
  store.setWidgetLifecycle(draftId, 'draft')

  try {
    const response = await apiClient.post<BackendGenerateResponse>('/api/v1/widgets/generate', {
      draftId,
      prompt,
      userId: Number.isNaN(Number(userId)) ? 1 : Number(userId),
      providerType: store.selectedProvider || 'gemini',
      model: store.selectedModel,
      autoPublish,
      pageId: 'dashboard',
      runAsync: true,
    })

    const data = response.data
    if (!data?.success || !data.runId) {
      const errorMsg = data?.error || 'Failed to initialize agent pipeline run on server'
      store.updateWidgetAgent(draftId, 'requirement', { status: 'error', error: errorMsg })
      store.setWidgetStudioRunning(false)
      return { success: false, error: errorMsg }
    }

    return new Promise((resolve) => {
      connectPipelineStream({
        runId: data.runId,
        draftId,
        prompt,
        userId,
        autoPublish,
        onComplete: (dsl) => resolve({ success: true, dsl }),
        onError: (error) => resolve({ success: false, error }),
      })
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    store.updateWidgetAgent(draftId, 'requirement', { status: 'error', error: errorMsg })
    store.setWidgetStudioRunning(false)
    return { success: false, error: errorMsg }
  }
}

/**
 * Cancel an active pipeline run on the backend.
 */
export async function cancelBackendAgentPipeline(runId: number): Promise<{ success: boolean }> {
  try {
    const response = await apiClient.post<{ success: boolean }>(`/api/v1/widgets/runs/${runId}/cancel`)
    return response.data || { success: false }
  } catch {
    return { success: false }
  }
}
