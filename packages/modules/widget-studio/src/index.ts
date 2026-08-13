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
import type { CAPModule } from '@cap/shared-types'
import { widgetStudioRouteConfig } from './routes/routes'
import { widgetStudioDictionaries } from './i18n/registry'

// Public component exports
export { default as WidgetStudioPanel } from './screens/WidgetStudioPanel'
export { default as WidgetStudioFab } from './components/WidgetStudioFab'
export { default as AgentPipelineTracker } from './components/AgentPipelineTracker'
export { default as DslPreviewCard } from './components/DslPreviewCard'
export { default as PromptInput } from './components/PromptInput'

// Agent layer exports
export { runAgentPipeline, publishDraft } from './agents/AgentOrchestrator'
export { validateWidgetDsl } from './agents/ValidationAgent'
export { sanitizePrompt, extractJson } from './agents/sanitizer'
export { geminiProvider } from './agents/GeminiProvider'
export type { AIProvider, AIGenerateOptions, AIGenerateResult } from './agents/AIProvider.interface'
export { APPROVED_WIDGETS } from './agents/ComponentAgent'

// i18n
export { widgetStudioDictionaries, getMergedDictionary, i18n } from './i18n/registry'
export type { Locale } from './i18n/registry'

// Routes
export { widgetStudioRouteConfig }
export { WidgetStudioPath } from './routes/path'

/**
 * CAPModule contract — auto-discovered by Vite glob in assembleApp.
 */
export const WidgetStudioModule: CAPModule = {
  id: 'widget-studio-module',
  version: '1.0.0',
  name: 'AI Widget Studio',
  description:
    'AI-Powered Agentic Widget Generation Platform. Uses a 6-agent Gemini pipeline to produce ' +
    'Widget DSL from natural language prompts. No executable code generation.',
  routes: widgetStudioRouteConfig,
  i18n: widgetStudioDictionaries,
  plugins: [],
  navItems: [], // Phase 1: no nav item — panel is opened from the dashboard FAB
  searchItems: [
    {
      id: 'search-widget-studio',
      name: 'AI Widget Studio',
      url: '#widget-studio', // Opens panel via hash (handled in dashboard)
      icon: 'tabler-sparkles',
      section: 'Tools',
      subtitle: 'Generate widgets with AI',
    },
  ],
}

export default WidgetStudioModule
