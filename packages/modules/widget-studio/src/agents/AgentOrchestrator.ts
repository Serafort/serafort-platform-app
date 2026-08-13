/**
 * Agent Orchestrator — The central coordinator of the 6-agent widget generation pipeline.
 *
 * Pipeline flow:
 *   User Prompt → Sanitization → Requirement Agent → Design Agent → Component Agent
 *   → Validation Agent → Preview Agent → Publish Agent → Dashboard
 *
 * Each step updates the Zustand widgetStudioSlice in real-time for live UI feedback.
 */
import type { AIProvider } from './AIProvider.interface'
import type { WidgetDefinition, AgentId, WidgetAuditEntry } from '@cap/shared-types'
import { sanitizePrompt } from './sanitizer'
import { runRequirementAgent } from './RequirementAgent'
import { runDesignAgent } from './DesignAgent'
import { runComponentAgent } from './ComponentAgent'
import { runCriticAgent } from './CriticAgent'
import { runValidationAgent } from './ValidationAgent'
import { runPreviewAgent } from './PreviewAgent'
import { runPublishAgent } from './PublishAgent'
import { getAIProvider } from './ProviderFactory'
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
 * Run the full 6-agent widget generation pipeline.
 */
export async function runAgentPipeline(
  options: OrchestratorOptions,
): Promise<OrchestratorResult> {
  const store = useAppStore.getState()
  const activeProvider = options.provider || getAIProvider(store.selectedProvider, store.selectedModel)

  const {
    draftId,
    prompt,
    userId = 'anonymous',
    provider = activeProvider,
    autoPublish = false,
  } = options

  // Mark pipeline as running
  store.setWidgetStudioRunning(true)
  store.setWidgetLifecycle(draftId, 'draft')

  try {
    // ========================================================
    // INPUT SANITIZATION (Security Layer 1)
    // ========================================================
    const sanitization = sanitizePrompt(prompt)

    if (sanitization.hasInjection) {
      // Surface injection attempt without exposing details to the LLM
      updateAgent(draftId, 'requirement', 'error', {
        error: 'Your prompt contains patterns that cannot be processed for security reasons. Please rephrase.',
      })
      store.setWidgetLifecycle(draftId, 'draft')
      store.setWidgetStudioRunning(false)
      return { success: false, error: 'Prompt injection detected' }
    }

    const safePrompt = sanitization.sanitized

    // ========================================================
    // AGENT 1 — Requirement Agent
    // ========================================================
    updateAgent(draftId, 'requirement', 'running')
    let requirements
    try {
      requirements = await runRequirementAgent(
        safePrompt,
        provider,
        (text) => appendStream(draftId, 'requirement', text),
      )
      updateAgent(draftId, 'requirement', 'done', { output: requirements })
      store.setWidgetLifecycle(draftId, 'generated')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      updateAgent(draftId, 'requirement', 'error', { error: msg })
      store.setWidgetStudioRunning(false)
      return { success: false, error: msg }
    }

    // ========================================================
    // AGENT 2 — Design Agent
    // ========================================================
    updateAgent(draftId, 'design', 'running')
    let design
    try {
      design = await runDesignAgent(
        requirements,
        provider,
        (text) => appendStream(draftId, 'design', text),
      )
      updateAgent(draftId, 'design', 'done', { output: design })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      updateAgent(draftId, 'design', 'error', { error: msg })
      store.setWidgetStudioRunning(false)
      return { success: false, error: msg }
    }

    // ========================================================
    // AGENT 3 — Component Agent
    // ========================================================
    updateAgent(draftId, 'component', 'running')
    let componentOutput
    let dsl: WidgetDefinition
    try {
      componentOutput = await runComponentAgent(
        requirements,
        design,
        provider,
        (text) => appendStream(draftId, 'component', text),
      )

      // Assemble final Widget DSL with a real UUID
      const baseDsl: WidgetDefinition = {
        id: crypto.randomUUID(),
        name: safePrompt.slice(0, 60),
        version: '1.0.0',
        component: componentOutput.widgetId,
        props: componentOutput.suggestedProps ?? {},
        layout: {
          width: design.size === 'small' ? 4 : design.size === 'large' || design.size === 'full' ? 12 : 8,
          height: design.layout === 'stat' ? 200 : design.layout === 'chart' ? 340 : 280,
        },
        behavior: { autoRefresh: false },
      }

      dsl = {
        ...baseDsl,
        ...(componentOutput.dsl ?? {}),
        id: crypto.randomUUID(),
      }

      store.setWidgetDsl(draftId, dsl)
      updateAgent(draftId, 'component', 'done', { output: componentOutput })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      updateAgent(draftId, 'component', 'error', { error: msg })
      store.setWidgetStudioRunning(false)
      return { success: false, error: msg }
    }

    // ========================================================
    // CRITIC AGENT — Aesthetic & Quality Evaluation
    // ========================================================
    try {
      await runCriticAgent(
        requirements,
        design,
        dsl,
        provider,
        (text) => appendStream(draftId, 'component', text),
      )
    } catch {
      // Non-blocking quality check
    }

    // ========================================================
    // AGENT 4 — Validation Agent (client-side, no AI call)
    // ========================================================
    updateAgent(draftId, 'validation', 'running')
    const validation = runValidationAgent(dsl, (msg) =>
      appendStream(draftId, 'validation', msg + '\n'),
    )
    store.setWidgetLifecycle(draftId, 'validated')

    if (!validation.isValid) {
      const allErrors = [
        ...validation.schemaErrors,
        ...validation.securityErrors,
        ...validation.componentErrors,
        ...validation.tenantErrors,
      ].join('; ')
      updateAgent(draftId, 'validation', 'error', {
        output: validation,
        error: allErrors,
      })
      store.setWidgetStudioRunning(false)
      return { success: false, error: allErrors }
    }

    updateAgent(draftId, 'validation', 'done', { output: validation })

    // ========================================================
    // AGENT 5 — Preview Agent (client-side)
    // ========================================================
    updateAgent(draftId, 'preview', 'running')
    const preview = runPreviewAgent(dsl, (msg) =>
      appendStream(draftId, 'preview', msg + '\n'),
    )
    store.setWidgetLifecycle(draftId, 'previewed')
    updateAgent(draftId, 'preview', 'done', { output: preview })

    // ========================================================
    // AGENT 6 — Publish Agent (only if autoPublish or user approves)
    // ========================================================
    if (autoPublish) {
      updateAgent(draftId, 'publish', 'running')
      const publish = runPublishAgent(dsl, {
        userId,
        model: (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env
          .VITE_GEMINI_MODEL ?? 'gemini-2.0-flash',
        onProgress: (msg) => appendStream(draftId, 'publish', msg + '\n'),
      })

      if (publish.published) {
        // Audit trail entry
        const auditEntry: WidgetAuditEntry = {
          widgetId: dsl.id,
          createdBy: userId,
          generatedAt: new Date().toISOString(),
          model: (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env
            .VITE_GEMINI_MODEL ?? 'gemini-2.0-flash',
          version: dsl.version,
          action: 'published',
        }
        store.appendAuditEntry(draftId, auditEntry)
        store.setWidgetLifecycle(draftId, 'published')
        updateAgent(draftId, 'publish', 'done', { output: publish })
      } else {
        updateAgent(draftId, 'publish', 'error', { error: 'Failed to publish widget' })
      }
    } else {
      // Pipeline complete — awaiting user approval to publish
      store.setWidgetLifecycle(draftId, 'approved')
    }

    store.setWidgetStudioRunning(false)
    return { success: true, dsl }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[AgentOrchestrator] Unexpected error:', msg)
    store.setWidgetStudioRunning(false)
    return { success: false, error: msg }
  }
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
