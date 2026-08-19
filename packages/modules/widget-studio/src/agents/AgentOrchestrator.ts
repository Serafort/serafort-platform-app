/**
 * Agent Orchestrator — Frontend coordinator for the Widget Studio pipeline.
 *
 * Delegates pipeline execution directly to the backend multi-agent SSE pipeline,
 * while updating the Zustand widgetStudioSlice in real time for live UI feedback.
 */
import type { AIProvider } from './AIProvider.interface'
import type { WidgetDefinition, AgentId, WidgetAuditEntry } from '@cap/shared-types'
import { runPublishAgent } from './PublishAgent'
import { executeBackendAgentPipeline } from '../services/widgetAgentClient'
import { useAppStore } from '@cap/platform-store'

export interface OrchestratorOptions {
  /** Draft ID in the Zustand store to update */
  draftId: string
  /** Raw user prompt (will be sanitized) */
  prompt: string
  /** Current authenticated user ID */
  userId?: string
  /** Override the AI provider (useful for testing) */
  provider?: AIProvider
  /** Whether to auto-publish after successful validation */
  autoPublish?: boolean
}

export interface OrchestratorResult {
  success: boolean
  dsl?: WidgetDefinition
  error?: string
}

/**
 * Helper to update a specific agent's state in the store
 */
function updateAgent(
  draftId: string,
  agentId: AgentId,
  status: 'idle' | 'running' | 'done' | 'error',
  extras: { output?: unknown; error?: string } = {},
) {
  const store = useAppStore.getState()
  store.updateWidgetAgent(draftId, agentId, {
    status,
    startedAt: status === 'running' ? new Date().toISOString() : undefined,
    completedAt: ['done', 'error'].includes(status) ? new Date().toISOString() : undefined,
    ...extras,
  })
}

/**
 * Helper to append a stream chunk to an agent's streamed text
 */
function appendStream(draftId: string, agentId: AgentId, text: string) {
  useAppStore.getState().appendAgentStream(draftId, agentId, text)
}

/**
 * Run the full 6-agent widget generation pipeline via the backend.
 */
export async function runAgentPipeline(
  options: OrchestratorOptions,
): Promise<OrchestratorResult> {
  const { draftId, prompt, userId = 'anonymous', autoPublish = false } = options

  // Delegate directly to the backend multi-agent SSE pipeline
  return executeBackendAgentPipeline({
    draftId,
    prompt,
    userId,
    autoPublish,
  })
}

/**
 * Publish an already-validated draft (called from UI when user clicks "Publish")
 */
export async function publishDraft(
  draftId: string,
  userId = 'anonymous',
): Promise<boolean> {
  const store = useAppStore.getState()
  const draft = store.widgetDrafts.find((d) => d.id === draftId)

  if (!draft?.dsl) {
    console.error('[AgentOrchestrator] No DSL found for draft:', draftId)
    return false
  }

  updateAgent(draftId, 'publish', 'running')

  const publish = runPublishAgent(draft.dsl, {
    userId,
    model: (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env
      .VITE_GEMINI_MODEL ?? 'gemini-2.0-flash',
    onProgress: (msg) => appendStream(draftId, 'publish', msg + '\n'),
  })

  if (publish.published) {
    const auditEntry: WidgetAuditEntry = {
      widgetId: draft.dsl.id,
      createdBy: userId,
      generatedAt: publish.deployedAt,
      model: (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env
        .VITE_GEMINI_MODEL ?? 'gemini-2.0-flash',
      version: draft.dsl.version,
      action: 'published',
    }
    store.appendAuditEntry(draftId, auditEntry)
    store.setWidgetLifecycle(draftId, 'published')
    updateAgent(draftId, 'publish', 'done', { output: publish })
    return true
  }

  updateAgent(draftId, 'publish', 'error', { error: 'Publish failed' })
  return false
}
