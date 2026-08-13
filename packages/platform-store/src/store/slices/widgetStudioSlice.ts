import { StateCreator } from 'zustand'
import type { AppStore } from '../../types'
import type {
  WidgetStudioDraft,
  AgentId,
  AgentState,
  AgentStatus,
  WidgetDefinition,
  WidgetAuditEntry,
  WidgetLifecycle,
  ProviderType,
} from '@cap/shared-types'

// ============================================
// Initial agent states for a fresh draft
// ============================================

const AGENT_IDS: AgentId[] = [
  'requirement',
  'design',
  'component',
  'validation',
  'preview',
  'publish',
]

const createInitialAgents = (): AgentState[] =>
  AGENT_IDS.map((id) => ({ id, status: 'idle' as AgentStatus }))

// ============================================
// Slice Interface
// ============================================

export interface WidgetStudioSlice {
  // ---- LLM Provider & Model Selection ----
  selectedProvider: ProviderType
  selectedModel: string
  setSelectedProvider: (provider: ProviderType) => void
  setSelectedModel: (model: string) => void

  // ---- Panel State ----
  /** Whether the AI Widget Studio drawer is open */
  widgetStudioPanelOpen: boolean
  /** Open the AI Widget Studio panel */
  openWidgetStudioPanel: () => void
  /** Close the AI Widget Studio panel */
  closeWidgetStudioPanel: () => void
  /** Toggle the AI Widget Studio panel */
  toggleWidgetStudioPanel: () => void

  // ---- Draft Management ----
  /** All widget drafts (persisted) */
  widgetDrafts: WidgetStudioDraft[]
  /** ID of the draft currently being edited/viewed */
  activeDraftId: string | null
  /** Whether the agent pipeline is currently executing */
  widgetStudioRunning: boolean

  /** Create a new draft and make it active */
  createWidgetDraft: (prompt: string) => string
  /** Set the active draft by ID */
  setActiveDraft: (draftId: string | null) => void
  /** Get the active draft object */
  getActiveDraft: () => WidgetStudioDraft | null
  /** Delete a draft */
  deleteWidgetDraft: (draftId: string) => void

  // ---- Agent Pipeline ----
  /** Update a specific agent's state within a draft */
  updateWidgetAgent: (
    draftId: string,
    agentId: AgentId,
    patch: Partial<AgentState>,
  ) => void
  /** Append streamed text chunk to an agent's streamedText */
  appendAgentStream: (draftId: string, agentId: AgentId, chunk: string) => void
  /** Set the pipeline running flag */
  setWidgetStudioRunning: (running: boolean) => void

  // ---- DSL & Lifecycle ----
  /** Set the resolved Widget DSL on a draft */
  setWidgetDsl: (draftId: string, dsl: WidgetDefinition) => void
  /** Advance the lifecycle stage of a draft */
  setWidgetLifecycle: (draftId: string, lifecycle: WidgetLifecycle) => void
  /** Append an audit trail entry */
  appendAuditEntry: (draftId: string, entry: WidgetAuditEntry) => void
}

// ============================================
// Slice Implementation
// ============================================

export const createWidgetStudioSlice: StateCreator<
  AppStore,
  [['zustand/immer', never], ['zustand/devtools', never]],
  [],
  WidgetStudioSlice
> = (set, get) => ({
  // ---- LLM Provider & Model Selection ----
  selectedProvider: 'openrouter',
  selectedModel: 'openai/gpt-4o-mini',

  setSelectedProvider: (provider: ProviderType) =>
    set((state) => {
      state.selectedProvider = provider
      // Automatically switch to default model for chosen provider
      if (provider === 'gemini') {
        state.selectedModel = 'gemini-3.6-flash'
      } else {
        state.selectedModel = 'openai/gpt-4o-mini'
      }
    }),

  setSelectedModel: (model: string) =>
    set((state) => {
      state.selectedModel = model
    }),

  // ---- Panel State ----
  widgetStudioPanelOpen: false,

  openWidgetStudioPanel: () =>
    set((state) => {
      state.widgetStudioPanelOpen = true
    }),

  closeWidgetStudioPanel: () =>
    set((state) => {
      state.widgetStudioPanelOpen = false
    }),

  toggleWidgetStudioPanel: () =>
    set((state) => {
      state.widgetStudioPanelOpen = !state.widgetStudioPanelOpen
    }),

  // ---- Draft Management ----
  widgetDrafts: [],
  activeDraftId: null,
  widgetStudioRunning: false,

  createWidgetDraft: (prompt: string) => {
    const id = crypto.randomUUID()
    const draft: WidgetStudioDraft = {
      id,
      prompt,
      agents: createInitialAgents(),
      lifecycle: 'draft',
      createdAt: new Date().toISOString(),
      auditTrail: [],
    }
    set((state) => {
      state.widgetDrafts.push(draft)
      state.activeDraftId = id
    })
    return id
  },

  setActiveDraft: (draftId: string | null) =>
    set((state) => {
      state.activeDraftId = draftId
    }),

  getActiveDraft: () => {
    const { widgetDrafts, activeDraftId } = get()
    if (!activeDraftId) return null
    return widgetDrafts.find((d) => d.id === activeDraftId) ?? null
  },

  deleteWidgetDraft: (draftId: string) =>
    set((state) => {
      state.widgetDrafts = state.widgetDrafts.filter((d) => d.id !== draftId)
      if (state.activeDraftId === draftId) {
        state.activeDraftId = state.widgetDrafts[state.widgetDrafts.length - 1]?.id ?? null
      }
    }),

  // ---- Agent Pipeline ----
  updateWidgetAgent: (draftId, agentId, patch) =>
    set((state) => {
      const draft = state.widgetDrafts.find((d) => d.id === draftId)
      if (!draft) return
      const agent = draft.agents.find((a) => a.id === agentId)
      if (!agent) return
      Object.assign(agent, patch)
    }),

  appendAgentStream: (draftId, agentId, chunk) =>
    set((state) => {
      const draft = state.widgetDrafts.find((d) => d.id === draftId)
      if (!draft) return
      const agent = draft.agents.find((a) => a.id === agentId)
      if (!agent) return
      agent.streamedText = (agent.streamedText ?? '') + chunk
    }),

  setWidgetStudioRunning: (running: boolean) =>
    set((state) => {
      state.widgetStudioRunning = running
    }),

  // ---- DSL & Lifecycle ----
  setWidgetDsl: (draftId, dsl) =>
    set((state) => {
      const draft = state.widgetDrafts.find((d) => d.id === draftId)
      if (!draft) return
      draft.dsl = dsl
    }),

  setWidgetLifecycle: (draftId, lifecycle) =>
    set((state) => {
      const draft = state.widgetDrafts.find((d) => d.id === draftId)
      if (!draft) return
      draft.lifecycle = lifecycle
    }),

  appendAuditEntry: (draftId, entry) =>
    set((state) => {
      const draft = state.widgetDrafts.find((d) => d.id === draftId)
      if (!draft) return
      draft.auditTrail.push(entry)
    }),
})
