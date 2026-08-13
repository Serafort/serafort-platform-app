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

/**
 * The canonical definition of a widget produced by the AI agent pipeline.
 * Widgets are executed by the platform's DynamicWidgetRenderer — never by the LLM.
 * The `component` field must match a registered widgetId in globalWidgetRegistry.
 */
export interface WidgetDefinition {
  /** Unique widget instance identifier (UUID) */
  id: string
  /** Human-readable display name */
  name: string
  /** SemVer string — e.g. "1.0.0" */
  version: string
  /**
   * Registered component key. Must exist in globalWidgetRegistry.
   * Examples: "dashboard-widget-weather", "dashboard-widget-statCard"
   */
  component: string
  /** Static props passed to the registered component */
  props?: Record<string, unknown>
  /** Grid layout dimensions */
  layout: {
    /** Column span — 4 (1/3), 8 (2/3), or 12 (full width) */
    width: 4 | 8 | 12
    /** Row height in pixels */
    height: 200 | 280 | 340 | 400
  }
  /** Optional data source configuration */
  dataSource?: {
    provider: string
    config?: Record<string, unknown>
  }
  /** Runtime behavior configuration */
  behavior?: {
    autoRefresh?: boolean
    refreshInterval?: number
  }
  /** Per-tenant overrides (color, branding, etc.) */
  tenantOverrides?: Record<string, unknown>
}

// ============================================
// Agent Pipeline Types
// ============================================

/** Identifiers for the 6-agent pipeline stages */
export type AgentId =
  | 'requirement'
  | 'design'
  | 'component'
  | 'validation'
  | 'preview'
  | 'publish'

/** Current status of a single agent run */
export type AgentStatus = 'idle' | 'running' | 'done' | 'error'

/** State of a single agent within the pipeline */
export interface AgentState {
  id: AgentId
  status: AgentStatus
  /** Structured output produced by this agent (JSON) */
  output?: unknown
  /** Error message if status === 'error' */
  error?: string
  /** Accumulated streamed text from Gemini (typewriter effect) */
  streamedText?: string
  /** Timestamp when the agent started (ISO string) */
  startedAt?: string
  /** Timestamp when the agent completed (ISO string) */
  completedAt?: string
}

// ============================================
// Widget Lifecycle
// ============================================

/** Ordered lifecycle states of an AI-generated widget */
export type WidgetLifecycle =
  | 'draft'
  | 'generated'
  | 'validated'
  | 'previewed'
  | 'approved'
  | 'published'
  | 'deprecated'
  | 'archived'

// ============================================
// Widget Studio Draft
// ============================================

/** A single widget generation session/draft managed by the Widget Studio */
export interface WidgetStudioDraft {
  /** UUID for this draft session */
  id: string
  /** Original user prompt text */
  prompt: string
  /** State of each agent in the pipeline */
  agents: AgentState[]
  /** The produced Widget DSL — undefined until component agent completes */
  dsl?: WidgetDefinition
  /** Current lifecycle stage */
  lifecycle: WidgetLifecycle
  /** ISO timestamp when draft was created */
  createdAt: string
  /** Ordered audit trail for this widget */
  auditTrail: WidgetAuditEntry[]
}

// ============================================
// Audit Trail
// ============================================

/** A single audit log entry for a widget lifecycle event */
export interface WidgetAuditEntry {
  widgetId: string
  /** User identifier who triggered this action */
  createdBy: string
  /** ISO timestamp */
  generatedAt: string
  /** AI model used (e.g. "gemini-2.0-flash") */
  model: string
  /** Widget DSL version at time of this action */
  version: string
  /** Lifecycle action taken */
  action: WidgetLifecycle
}

// ============================================
// Requirement Agent Output
// ============================================

export interface RequirementOutput {
  type: string
  features: string[]
  constraints?: string[]
  scope?: string
}

// ============================================
// Design Agent Output
// ============================================

export interface DesignOutput {
  layout: 'card' | 'list' | 'grid' | 'chart' | 'stat' | 'chat'
  size: 'small' | 'medium' | 'large' | 'full'
  responsive: boolean
  sections: string[]
  accessibility?: string[]
}

// ============================================
// Component Agent Output
// ============================================

export interface ComponentOutput {
  /** Resolved widget registry ID */
  widgetId: string
  /** Rationale for component selection */
  rationale: string
  /** Suggested static props */
  suggestedProps?: Record<string, unknown>
}

// ============================================
// Validation Agent Output
// ============================================

export interface ValidationOutput {
  isValid: boolean
  schemaErrors: string[]
  securityErrors: string[]
  tenantErrors: string[]
  componentErrors: string[]
}

// ============================================
// Preview Agent Output
// ============================================

export interface PreviewOutput {
  previewUrl?: string
  componentTree: string[]
  themeCompatible: boolean
  testResults: { name: string; passed: boolean }[]
}

// ============================================
// Publish Agent Output
// ============================================

export interface PublishOutput {
  published: boolean
  widgetId: string
  version: string
  deployedAt: string
}
