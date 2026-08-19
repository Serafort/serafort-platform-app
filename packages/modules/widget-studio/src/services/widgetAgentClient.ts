/**
 * Widget Agent Client — Communicates with the backend AI Widget Pipeline via SSE.
 */
import type { WidgetDefinition, AgentId, WidgetAuditEntry } from '@cap/shared-types'
import { useAppStore } from '@cap/platform-store'

export interface BackendGenerateRequest {
  draftId: string
  prompt: string
  userId?: string
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

/**
 * Resolve the API base URL from Vite environment.
 */
function getApiBaseUrl(): string {
  const envUrl = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env
    .VITE_API_URL
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '')
  }
  return 'http://localhost:3333'
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

  const baseUrl = getApiBaseUrl()
  const generateEndpoint = `${baseUrl}/api/v1/widgets/generate`

  try {
    const response = await fetch(generateEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        draftId,
        prompt,
        userId: Number.isNaN(Number(userId)) ? 1 : Number(userId),
        providerType: store.selectedProvider || 'gemini',
        model: store.selectedModel,
        autoPublish,
        pageId: 'dashboard',
        runAsync: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      const errorMsg = `Server error ${response.status}: ${errorText}`
      store.updateWidgetAgent(draftId, 'requirement', { status: 'error', error: errorMsg })
      store.setWidgetStudioRunning(false)
      return { success: false, error: errorMsg }
    }

    const data: BackendGenerateResponse = await response.json()
    if (!data.success || !data.runId) {
      const errorMsg = data.error || 'Failed to initialize agent pipeline run on server'
      store.updateWidgetAgent(draftId, 'requirement', { status: 'error', error: errorMsg })
      store.setWidgetStudioRunning(false)
      return { success: false, error: errorMsg }
    }

    const runId = data.runId
    const sseUrl = `${baseUrl}/api/v1/sse/agent-runs/${runId}`

    return new Promise((resolve) => {
      const eventSource = new EventSource(sseUrl)

      let finalDsl: WidgetDefinition | undefined

      eventSource.onmessage = (msgEvent) => {
        try {
          const payload: SSEPipelineEvent = JSON.parse(msgEvent.data)

          switch (payload.event) {
            case 'connected':
              // SSE stream ready
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
                  const compOut = payload.output as any
                  if (compOut?.dsl) {
                    const generatedDsl: WidgetDefinition = {
                      id: crypto.randomUUID(),
                      name: prompt.slice(0, 60),
                      version: '1.0.0',
                      component: compOut.widgetId,
                      props: compOut.suggestedProps ?? {},
                      layout: { width: 8, height: 280 },
                      behavior: { autoRefresh: false },
                      ...compOut.dsl,
                    }
                    finalDsl = generatedDsl
                    store.setWidgetDsl(draftId, generatedDsl)
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
              const completedDsl = payload.dsl
              if (completedDsl) {
                finalDsl = completedDsl
                store.setWidgetDsl(draftId, completedDsl)
              }

              if (autoPublish) {
                store.setWidgetLifecycle(draftId, 'published')
                if (finalDsl) {
                  const auditEntry: WidgetAuditEntry = {
                    widgetId: finalDsl.id,
                    createdBy: userId,
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
              resolve({ success: true, dsl: finalDsl })
              break
            }

            case 'run_failed':
            case 'run_cancelled': {
              eventSource.close()
              const errorMsg = payload.error || 'Agent pipeline execution failed on backend'
              store.setWidgetStudioRunning(false)
              resolve({ success: false, error: errorMsg })
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
        store.setWidgetStudioRunning(false)
        resolve({
          success: finalDsl !== undefined,
          dsl: finalDsl,
          error: 'Connection to server stream interrupted',
        })
      }
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    store.setWidgetStudioRunning(false)
    return { success: false, error: errorMsg }
  }
}
