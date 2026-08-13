/**
 * Component Agent — Agent 3/6
 *
 * Maps design specifications to approved platform widget registry components.
 * Produces the widgetId and the full Widget DSL.
 *
 * The APPROVED_WIDGETS registry here mirrors the components registered in globalWidgetRegistry.
 * Only these component IDs are valid — AI cannot invent new ones.
 */
import type { AIProvider } from './AIProvider.interface'
import type { RequirementOutput, DesignOutput, ComponentOutput, WidgetDefinition } from '@cap/shared-types'
import { extractJson } from './sanitizer'

/** Approved widget registry — mirrors globalWidgetRegistry entries */
const APPROVED_WIDGETS = [
  {
    id: 'dashboard-widget-weather',
    name: 'Weather Widget',
    description: 'Current weather conditions with temperature, humidity, and wind speed',
    bestFor: ['weather', 'climate', 'temperature'],
  },
  {
    id: 'dashboard-widget-revenueChart',
    name: 'Revenue Chart Widget',
    description: 'Area chart showing revenue data over time with a target line',
    bestFor: ['chart', 'revenue', 'sales', 'trends', 'analytics', 'time-series'],
  },
  {
    id: 'dashboard-widget-recentOrders',
    name: 'Recent Orders / Table Widget',
    description: 'Data table showing recent records, orders, transactions, or list data',
    bestFor: ['table', 'list', 'orders', 'records', 'transactions'],
  },
  {
    id: 'dashboard-widget-statCard',
    name: 'Stat Card / KPI Widget',
    description: 'Key Performance Indicator card showing a metric with label, value, trend, and icon',
    bestFor: ['metric', 'kpi', 'stat', 'count', 'total', 'users', 'number'],
  },
  {
    id: 'dashboard-widget-aiChat',
    name: 'AI Chat Widget',
    description: 'Conversational AI chat interface embedded in the dashboard',
    bestFor: ['chat', 'ai', 'assistant', 'conversation', 'help'],
  },
]

const SYSTEM_PROMPT = `You are the Component Agent in a widget generation pipeline.
You select the most appropriate registered widget component for a given requirement + design spec.

CRITICAL RULES:
- Output ONLY valid JSON. No prose, no code, no markdown.
- You MUST choose a widgetId from the approved registry only — never invent new component IDs.
- Also produce the full WidgetDefinition DSL for the selected component.

APPROVED WIDGET REGISTRY:
${JSON.stringify(APPROVED_WIDGETS, null, 2)}

Output schema (strict):
{
  "widgetId": "one of the approved widget IDs above",
  "rationale": "brief explanation of why this component was chosen",
  "suggestedProps": { "optional static props to pass to the component" },
  "dsl": {
    "id": "new-widget-<uuid-placeholder>",
    "name": "Human-readable widget name",
    "version": "1.0.0",
    "component": "<same as widgetId>",
    "props": { "optional props matching suggestedProps" },
    "layout": { "width": 4|8|12, "height": 200|280|340|400 },
    "dataSource": null,
    "behavior": { "autoRefresh": false }
  }
}`

export interface ComponentAgentOutput extends ComponentOutput {
  dsl: Omit<WidgetDefinition, 'id'>
}

export async function runComponentAgent(
  requirements: RequirementOutput,
  design: DesignOutput,
  provider: AIProvider,
  onChunk: (text: string) => void,
): Promise<ComponentAgentOutput> {
  const result = await provider.generate({
    systemPrompt: SYSTEM_PROMPT,
    userMessage: `Select the best registered component for:\nRequirements: ${JSON.stringify(requirements)}\nDesign spec: ${JSON.stringify(design)}`,
    onChunk: (chunk) => {
      if (!chunk.done) onChunk(chunk.text)
    },
  })

  const parsed = extractJson(result.fullText)

  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`ComponentAgent: Failed to parse output — ${result.fullText}`)
  }

  const output = parsed as ComponentAgentOutput

  // Enforce that widgetId is from the approved list
  const isApproved = APPROVED_WIDGETS.some((w) => w.id === output.widgetId)
  if (!isApproved) {
    throw new Error(
      `ComponentAgent: widgetId "${output.widgetId}" is not in the approved registry.`,
    )
  }

  return output
}

export { APPROVED_WIDGETS }
