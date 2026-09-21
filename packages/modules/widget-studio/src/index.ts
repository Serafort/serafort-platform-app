/**
 * @cap/module-widget-studio — AI-Powered Agentic Widget Generation Platform
 *
 * CAPModule contract for the Widget Studio feature.
 * Exports: module contract, panel/FAB components, agent orchestrator.
 *
 * Architecture:
 *   User Prompt → Sanitization → 6-Agent Pipeline (Gemini SSE)
 *   → Widget DSL → Validation → Widget Registry → Dynamic Renderer
 *   → Tenant Theme Provider → Dashboard
 */
import type { CAPModule } from "@cap/shared-types";
import { widgetStudioRouteConfig } from "./routes/routes";
import { widgetStudioDictionaries } from "./i18n/registry";
import { globalWidgetRegistry } from "@cap/platform-core";
import { DynamicLayoutWidget } from "@cap/theme";

// Register the core dynamic layout widget used by AI
globalWidgetRegistry.register({
  id: "core-dynamic-layout",
  titleKey: "theme.widgets.dynamicLayout.title",
  Component: DynamicLayoutWidget,
});

// Public component exports
export { default as WidgetStudioPanel } from "./screens/WidgetStudioPanel";
export { default as WidgetStudioFab } from "./components/WidgetStudioFab";
export { default as AgentPipelineTracker } from "./components/AgentPipelineTracker";
export { default as DslPreviewCard } from "./components/DslPreviewCard";
export { default as PromptInput } from "./components/PromptInput";

// Agent layer & sanitization exports
export {
  runAgentPipeline,
  publishDraft,
  cancelPipelineRun,
} from "./agents/AgentOrchestrator";
export {
  validateWidgetDsl,
  getApprovedWidgetIds,
  resolveGeneratedDsl,
  describeValidationFailure,
  APPROVED_WIDGETS,
} from "./agents/ValidationAgent";
export {
  DSL_SCHEMA_VERSION,
  migrateWidgetDsl,
  stampSchemaVersion,
} from "./agents/dslSchema";
export {
  buildClientAuditEntry,
  adoptServerAuditEntries,
  isAttestedTrail,
  resolveActor,
} from "./agents/auditTrail";
export {
  detectStructuralIntent,
  applyStructuralRefinement,
  buildRefinementPrompt,
  buildRefinementRequest,
} from "./agents/refineDraft";
export { DATA_SOURCE_PROVIDERS } from "./agents/ValidationAgent";
export {
  resolveDataSource,
  describeBindingProblem,
  dataSourceKey,
  DataSourceError,
  type DataSourceBinding,
  type DataSourceResult,
} from "./data/dataSourceRuntime";
export { useWidgetData } from "./hooks/useWidgetData";
export type { DataSourceProvider } from "./agents/ValidationAgent";
export { default as RefineInput } from "./components/RefineInput";
export {
  startPipelineRun,
  requestPipelineRun,
  attachPipelineRun,
  buildGeneratePayload,
  executeBackendAgentPipeline,
  cancelBackendAgentPipeline,
  type PipelineRunOptions,
  type PipelineRunResponse,
  type PipelineRunResult,
} from "./agents/pipeline";
export {
  sanitizePrompt,
  extractJson,
  sanitizeWidgetDsl,
} from "./agents/sanitizer";

// React Query Hooks & API Client
export * from "./hooks/useWidgetStudioQuery";
export * from "./services/widgetAgentClient";

// i18n
export {
  widgetStudioDictionaries,
  getMergedDictionary,
  i18n,
} from "./i18n/registry";
export type { Locale } from "./i18n/registry";

// Routes
export { widgetStudioRouteConfig };
export { WidgetStudioPath } from "./routes/path";

/**
 * CAPModule contract — auto-discovered by Vite glob in assembleApp.
 */
export const WidgetStudioModule: CAPModule = {
  id: "widget-studio-module",
  version: "1.0.1",
  name: "AI Widget Studio",
  description:
    "AI-Powered Agentic Widget Generation Platform. Uses a 6-agent Gemini pipeline to produce " +
    "Widget DSL from natural language prompts. No executable code generation.",
  routes: widgetStudioRouteConfig,
  i18n: widgetStudioDictionaries,
  plugins: [],
  navItems: [], // Phase 1: no nav item — panel is opened from the dashboard FAB
  searchItems: [
    {
      id: "search-widget-studio",
      name: "AI Widget Studio",
      url: "#widget-studio", // Opens panel via hash (handled in dashboard)
      icon: "tabler-sparkles",
      section: "Tools",
      subtitle: "Generate widgets with AI",
    },
  ],
};

export default WidgetStudioModule;
