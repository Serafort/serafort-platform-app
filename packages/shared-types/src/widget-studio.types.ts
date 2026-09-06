/**
 * Widget Studio Type Definitions
 *
 * Defines the Widget DSL (Widget Definition Language), agent pipeline types,
 * and widget lifecycle types for the AI-Powered Agentic Widget Generation Platform.
 *
 * These types are in @cap/shared-types (Tier 0) so they are available to all packages
 * without circular dependency concerns.
 */

// ============================================
// Widget DSL — The canonical AI-produced definition
// ============================================

export type ProviderType = "openrouter" | "gemini";

export interface LLMModelOption {
  id: string;
  name: string;
  provider: ProviderType;
  description?: string;
}

export const AVAILABLE_LLM_MODELS: LLMModelOption[] = [
  // OpenRouter models
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openrouter",
    description: "Fast, balanced & lightweight",
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "openrouter",
    description: "High reasoning & intelligence",
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "openrouter",
    description: "Exceptional coding & design",
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B",
    provider: "openrouter",
    description: "Open-source state of the art",
  },
  {
    id: "google/gemini-2.0-flash-001",
    name: "Gemini 2.0 Flash (OR)",
    provider: "openrouter",
    description: "Ultra-fast multimodal model",
  },

  // Gemini Native models
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    provider: "gemini",
    description: "Native Google DeepMind Flash",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "gemini",
    description: "Fast low-latency generation",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "gemini",
    description: "Stable Google multimodal",
  },
];

export interface WidgetAction {
  type: "NAVIGATE" | "TOGGLE_STATE" | "NOTIFY" | "OPEN_LINK";
  payload?: Record<string, unknown> | string;
}

/**
 * A recursive node representing a generic layout element.
 * Used by the AI to compose completely custom widget designs.
 */
export interface WidgetRenderNode {
  /** The generic MUI element or HTML equivalent to render */
  type:
    | "box"
    | "typography"
    | "icon"
    | "stack"
    | "paper"
    | "divider"
    | "button"
    | "image"
    | "avatar"
    | "chip"
    | "card"
    | "grid";
  /** Props applied to the component (e.g. sx, variant, color) */
  props?: Record<string, unknown>;
  /** Optional interactive action triggered when clicked */
  action?: WidgetAction;
  /** Nested child nodes or text */
  children?: WidgetRenderNode[] | string;
}

/**
 * The canonical definition of a widget produced by the AI agent pipeline.
 * Widgets are executed by the platform's DynamicWidgetRenderer — never by the LLM.
 * The `component` field must match a registered widgetId in globalWidgetRegistry.
 */
export interface WidgetDefinition {
  /**
   * Shape version of this record, independent of `version` (which is the
   * widget's own SemVer and is authored by whoever generated it).
   *
   * Drafts are persisted in the browser, so definitions written by an older
   * build outlive that build. Absent means "before versioning existed" - see
   * DSL_SCHEMA_VERSION and migrateWidgetDsl in @cap/module-widget-studio.
   */
  schemaVersion?: number;
  /** Unique widget instance identifier (UUID) */
  id: string;
  /** Human-readable display name */
  name: string;
  /** SemVer string — e.g. "1.0.0" */
  version: string;
  /**
   * Registered component key. Must exist in globalWidgetRegistry.
   * Examples: "dashboard-widget-weather", "dashboard-widget-statCard"
   */
  component: string;
  /** Static props passed to the registered component */
  props?: Record<string, unknown>;
  /** Grid layout dimensions */
  layout: {
    /** Column span — 4 (1/3), 8 (2/3), or 12 (full width) */
    width: 4 | 8 | 12;
    /** Row height in pixels */
    height: 200 | 280 | 340 | 400;
  };
  /**
   * Where the widget gets its data. The provider must be one the platform
   * knows how to serve - an arbitrary string here is a request the renderer
   * cannot honour, so it is validated rather than passed through.
   */
  dataSource?: {
    provider: string;
    config?: Record<string, unknown>;
  };
  /** Runtime behavior configuration */
  behavior?: {
    autoRefresh?: boolean;
    /** Seconds between refreshes; only meaningful when autoRefresh is true. */
    refreshInterval?: number;
    /**
     * Whether the widget responds to interaction. Written by the sanitizer
     * since before this was declared, which is why a definition can carry it
     * without any producer having set it deliberately.
     */
    interactive?: boolean;
  };
  /** Per-tenant overrides (color, branding, etc.) */
  tenantOverrides?: Record<string, unknown>;
}

// ============================================
// Agent Pipeline Types
// ============================================

/** Identifiers for the 6-agent pipeline stages */
export type AgentId =
  | "requirement"
  | "design"
  | "component"
  | "validation"
  | "preview"
  | "publish";

/** Current status of a single agent run */
export type AgentStatus = "idle" | "running" | "done" | "error";

/** State of a single agent within the pipeline */
export interface AgentState {
  id: AgentId;
  status: AgentStatus;
  /** Structured output produced by this agent (JSON) */
  output?: unknown;
  /** Error message if status === 'error' */
  error?: string;
  /** Accumulated streamed text from Gemini (typewriter effect) */
  streamedText?: string;
  /** Timestamp when the agent started (ISO string) */
  startedAt?: string;
  /** Timestamp when the agent completed (ISO string) */
  completedAt?: string;
}

// ============================================
// Widget Lifecycle
// ============================================

/** Ordered lifecycle states of an AI-generated widget */
export type WidgetLifecycle =
  | "draft"
  | "generated"
  | "validated"
  | "previewed"
  | "approved"
  | "published"
  | "deprecated"
  | "archived";

// ============================================
// Widget Studio Draft
// ============================================

/** A single widget generation session/draft managed by the Widget Studio */
export interface WidgetStudioDraft {
  /** UUID for this draft session */
  id: string;
  /** Original user prompt text */
  prompt: string;
  /** State of each agent in the pipeline */
  agents: AgentState[];
  /** The produced Widget DSL — undefined until component agent completes */
  dsl?: WidgetDefinition;
  /** Current lifecycle stage */
  lifecycle: WidgetLifecycle;
  /** ISO timestamp when draft was created */
  createdAt: string;
  /** Ordered audit trail for this widget */
  auditTrail: WidgetAuditEntry[];
  /**
   * The draft this one was refined from, if any. A refinement is a new draft
   * rather than a mutation, so the earlier version stays inspectable.
   */
  parentDraftId?: string;
  /** 1 for an original draft, 2 for its first refinement, and so on. */
  revision?: number;
  /** The instruction that produced this revision, e.g. "make it wider". */
  refinement?: string;
  /**
   * The backend run that produced this draft, when one did. It is what makes
   * the server's own audit trail fetchable for this widget.
   */
  runId?: number;
}

// ============================================
// Audit Trail
// ============================================

/** A single audit log entry for a widget lifecycle event */
export interface WidgetAuditEntry {
  widgetId: string;
  /**
   * User identifier who triggered this action, or "unknown" when the session
   * carries no id. Never a placeholder that reads like a real value.
   */
  createdBy: string;
  /** ISO timestamp */
  generatedAt: string;
  /** AI model used (e.g. "gemini-3.6-flash") */
  model: string;
  /** Widget DSL version at time of this action */
  version: string;
  /** Lifecycle action taken */
  action: WidgetLifecycle;
  /**
   * Who wrote this entry.
   *
   * "client" entries are a local record of what this browser believes it did:
   * useful for the panel, worthless as evidence, because the browser also
   * chooses what to write. "server" entries come from the backend's own run
   * record. A compliance trail is only ever the server's; the distinction is
   * carried explicitly so the two cannot be confused.
   */
  source: "client" | "server";
  /** Backend run this entry belongs to, when there was one. */
  runId?: number;
}

// ============================================
// Requirement Agent Output
// ============================================

export interface RequirementOutput {
  type: string;
  features: string[];
  constraints?: string[];
  scope?: string;
}

// ============================================
// Design Agent Output
// ============================================

export interface DesignOutput {
  layout: "card" | "list" | "grid" | "chart" | "stat" | "chat";
  size: "small" | "medium" | "large" | "full";
  responsive: boolean;
  sections: string[];
  accessibility?: string[];
}

// ============================================
// Component Agent Output
// ============================================

export interface ComponentOutput {
  /** Resolved widget registry ID */
  widgetId: string;
  /** Rationale for component selection */
  rationale: string;
  /** Suggested static props */
  suggestedProps?: Record<string, unknown>;
}

// ============================================
// Validation Agent Output
// ============================================

export interface ValidationOutput {
  isValid: boolean;
  schemaErrors: string[];
  securityErrors: string[];
  tenantErrors: string[];
  componentErrors: string[];
}

// ============================================
// Preview Agent Output
// ============================================

export interface PreviewOutput {
  previewUrl?: string;
  componentTree: string[];
  themeCompatible: boolean;
  testResults: { name: string; passed: boolean }[];
}

// ============================================
// Publish Agent Output
// ============================================

export interface PublishOutput {
  published: boolean;
  widgetId: string;
  version: string;
  deployedAt: string;
}
