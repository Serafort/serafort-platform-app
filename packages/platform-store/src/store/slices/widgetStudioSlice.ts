import { StateCreator } from "zustand";
import type { AppStore } from "../../types";
import type {
  WidgetStudioDraft,
  AgentId,
  AgentState,
  AgentStatus,
  WidgetDefinition,
  WidgetAuditEntry,
  WidgetLifecycle,
  ProviderType,
} from "@cap/shared-types";

/** Lineage and seed state for a draft created from an existing one. */
export interface NewDraftOptions {
  /** The draft this one refines. */
  parentDraftId?: string;
  /** 1 for an original, 2 for its first refinement, and so on. */
  revision?: number;
  /** The instruction that produced this revision. */
  refinement?: string;
  /** A definition the draft starts with, for refinements applied locally. */
  dsl?: WidgetDefinition;
  /** Starting lifecycle; defaults to "draft". */
  lifecycle?: WidgetLifecycle;
}

// ============================================
// Initial agent states for a fresh draft
// ============================================

const AGENT_IDS: AgentId[] = [
  "requirement",
  "design",
  "component",
  "validation",
  "preview",
  "publish",
];

const createInitialAgents = (): AgentState[] =>
  AGENT_IDS.map((id) => ({ id, status: "idle" as AgentStatus }));

// ============================================
// Slice Interface
// ============================================

export interface WidgetStudioSlice {
  // ---- LLM Provider & Model Selection ----
  selectedProvider: ProviderType;
  selectedModel: string;
  setSelectedProvider: (provider: ProviderType) => void;
  setSelectedModel: (model: string) => void;

  // ---- Panel State ----
  /** Whether the AI Widget Studio drawer is open */
  widgetStudioPanelOpen: boolean;
  /** Open the AI Widget Studio panel */
  openWidgetStudioPanel: () => void;
  /** Close the AI Widget Studio panel */
  closeWidgetStudioPanel: () => void;
  /** Toggle the AI Widget Studio panel */
  toggleWidgetStudioPanel: () => void;

  // ---- Draft Management ----
  /** All widget drafts (persisted) */
  widgetDrafts: WidgetStudioDraft[];
  /** ID of the draft currently being edited/viewed */
  activeDraftId: string | null;
  /** Whether the agent pipeline is currently executing */
  widgetStudioRunning: boolean;
  /**
   * The backend run currently streaming, if any. Transient (not persisted):
   * a run id from a previous session cannot be cancelled or resumed, and the
   * UI needs it only to offer Stop while the run is live.
   */
  activeRunId: number | null;
  /** Record (or clear) the run the UI can cancel */
  setActiveRunId: (runId: number | null) => void;
  /** Attach a backend run to a draft, so its server audit trail is fetchable */
  setDraftRunId: (draftId: string, runId: number) => void;

  /**
   * Create a new draft and make it active.
   *
   * A refinement passes `options`: it is a new draft with a parent rather
   * than an edit of the old one, so the previous version stays inspectable
   * in History.
   */
  createWidgetDraft: (prompt: string, options?: NewDraftOptions) => string;
  /** Set the active draft by ID */
  setActiveDraft: (draftId: string | null) => void;
  /** Get the active draft object */
  getActiveDraft: () => WidgetStudioDraft | null;
  /** Delete a draft */
  deleteWidgetDraft: (draftId: string) => void;

  // ---- Agent Pipeline ----
  /** Update a specific agent's state within a draft */
  updateWidgetAgent: (
    draftId: string,
    agentId: AgentId,
    patch: Partial<AgentState>,
  ) => void;
  /** Append streamed text chunk to an agent's streamedText */
  appendAgentStream: (draftId: string, agentId: AgentId, chunk: string) => void;
  /** Set the pipeline running flag */
  setWidgetStudioRunning: (running: boolean) => void;

  // ---- DSL & Lifecycle ----
  /** Set the resolved Widget DSL on a draft */
  setWidgetDsl: (draftId: string, dsl: WidgetDefinition) => void;
  /** Advance the lifecycle stage of a draft */
  setWidgetLifecycle: (draftId: string, lifecycle: WidgetLifecycle) => void;
  /** Append an audit trail entry */
  appendAuditEntry: (draftId: string, entry: WidgetAuditEntry) => void;
}

// ============================================
// Slice Implementation
// ============================================

export const createWidgetStudioSlice: StateCreator<
  AppStore,
  [["zustand/immer", never], ["zustand/devtools", never]],
  [],
  WidgetStudioSlice
> = (set, get) => ({
  // ---- LLM Provider & Model Selection ----
  selectedProvider: "openrouter",
  selectedModel: "openai/gpt-4o-mini",

  setSelectedProvider: (provider: ProviderType) =>
    set((state) => {
      state.selectedProvider = provider;
      // Automatically switch to default model for chosen provider
      if (provider === "gemini") {
        state.selectedModel = "gemini-3.6-flash";
      } else {
        state.selectedModel = "openai/gpt-4o-mini";
      }
    }),

  setSelectedModel: (model: string) =>
    set((state) => {
      state.selectedModel = model;
    }),

  // ---- Panel State ----
  widgetStudioPanelOpen: false,

  openWidgetStudioPanel: () =>
    set((state) => {
      state.widgetStudioPanelOpen = true;
    }),

  closeWidgetStudioPanel: () =>
    set((state) => {
      state.widgetStudioPanelOpen = false;
    }),

  toggleWidgetStudioPanel: () =>
    set((state) => {
      state.widgetStudioPanelOpen = !state.widgetStudioPanelOpen;
    }),

  // ---- Draft Management ----
  widgetDrafts: [],
  activeDraftId: null,
  widgetStudioRunning: false,
  activeRunId: null,

  setActiveRunId: (runId: number | null) =>
    set((state) => {
      state.activeRunId = runId;
    }),

  setDraftRunId: (draftId: string, runId: number) =>
    set((state) => {
      const draft = state.widgetDrafts.find((d) => d.id === draftId);
      if (draft) draft.runId = runId;
    }),

  createWidgetDraft: (prompt: string, options?: NewDraftOptions) => {
    const id = crypto.randomUUID();
    const draft: WidgetStudioDraft = {
      id,
      prompt,
      agents: createInitialAgents(),
      lifecycle: options?.lifecycle ?? "draft",
      createdAt: new Date().toISOString(),
      auditTrail: [],
      ...(options?.dsl ? { dsl: options.dsl } : {}),
      ...(options?.parentDraftId
        ? { parentDraftId: options.parentDraftId }
        : {}),
      ...(options?.revision ? { revision: options.revision } : {}),
      ...(options?.refinement ? { refinement: options.refinement } : {}),
    };
    set((state) => {
      state.widgetDrafts.push(draft);
      state.activeDraftId = id;
    });
    return id;
  },

  setActiveDraft: (draftId: string | null) =>
    set((state) => {
      state.activeDraftId = draftId;
    }),

  getActiveDraft: () => {
    const { widgetDrafts, activeDraftId } = get();
    if (!activeDraftId) return null;
    return widgetDrafts.find((d) => d.id === activeDraftId) ?? null;
  },

  deleteWidgetDraft: (draftId: string) =>
    set((state) => {
      state.widgetDrafts = state.widgetDrafts.filter((d) => d.id !== draftId);
      if (state.activeDraftId === draftId) {
        state.activeDraftId =
          state.widgetDrafts[state.widgetDrafts.length - 1]?.id ?? null;
      }
    }),

  // ---- Agent Pipeline ----
  updateWidgetAgent: (draftId, agentId, patch) =>
    set((state) => {
      const draft = state.widgetDrafts.find((d) => d.id === draftId);
      if (!draft) return;
      const agent = draft.agents.find((a) => a.id === agentId);
      if (!agent) return;
      Object.assign(agent, patch);
    }),

  appendAgentStream: (draftId, agentId, chunk) =>
    set((state) => {
      const draft = state.widgetDrafts.find((d) => d.id === draftId);
      if (!draft) return;
      const agent = draft.agents.find((a) => a.id === agentId);
      if (!agent) return;
      agent.streamedText = (agent.streamedText ?? "") + chunk;
    }),

  setWidgetStudioRunning: (running: boolean) =>
    set((state) => {
      state.widgetStudioRunning = running;
    }),

  // ---- DSL & Lifecycle ----
  setWidgetDsl: (draftId, dsl) =>
    set((state) => {
      const draft = state.widgetDrafts.find((d) => d.id === draftId);
      if (!draft) return;
      draft.dsl = dsl;
    }),

  setWidgetLifecycle: (draftId, lifecycle) =>
    set((state) => {
      const draft = state.widgetDrafts.find((d) => d.id === draftId);
      if (!draft) return;
      draft.lifecycle = lifecycle;
    }),

  appendAuditEntry: (draftId, entry) =>
    set((state) => {
      const draft = state.widgetDrafts.find((d) => d.id === draftId);
      if (!draft) return;
      draft.auditTrail.push(entry);
    }),
});
