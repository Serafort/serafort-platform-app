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
  {
    id: 'core-dynamic-layout',
    name: 'Dynamic Layout Widget',
    description: 'A highly flexible generic renderer that composes custom UI from a recursive tree of nodes.',
    bestFor: ['custom', 'creative', 'unique', 'composite', 'freeform'],
  },
]

const SYSTEM_PROMPT = `You are the Component Agent in a widget generation pipeline.
You select the most appropriate registered widget component for a given requirement + design spec.

CRITICAL RULES:
- Output ONLY valid JSON. No prose, no code, no markdown.
- You MUST choose a widgetId from the approved registry only — never invent new component IDs.
- Also produce the full WidgetDefinition DSL for the selected component.
- If using 'core-dynamic-layout' for custom designs, you MUST provide 'nodes' inside 'props' (or 'suggestedProps') which is an array of WidgetRenderNode objects.
- A WidgetRenderNode has a 'type' (box, typography, icon, stack, paper, divider, button, image, avatar, chip, card, grid), optional 'props' (e.g. { "sx": { "p": 2 }, "variant": "h6", "name": "Dashboard" for icons }), and optional 'children' (array of WidgetRenderNodes or text).
- CRITICALLY IMPORTANT: When the design specification calls for advanced UI like cards, bento boxes, avatars, or asymmetrical columns, you MUST aggressively use 'card', 'avatar', 'chip', and 'grid' nodes. Do NOT just fall back to basic 'box' and 'stack' elements.
- CRITICALLY IMPORTANT (AESTHETICS): To achieve beautiful, WOW-factor designs, you MUST extensively use the 'sx' prop on nodes to apply rich styling. Use gradients, glassmorphism (e.g., "backdropFilter": "blur(10px)", "backgroundColor": "rgba(...)"), neon borders, box-shadows, varied typography variants, and custom colors to make the UI look premium and tailored to the requested theme.
- STRUCTURAL EFFICIENCY: Keep your JSON tree clean, elegant, and concise. Avoid unnecessary redundant wrapper boxes (keep nesting depth <= 5 levels) so that the generated JSON fits comfortably within response limits.

APPROVED WIDGET REGISTRY:
${JSON.stringify(APPROVED_WIDGETS, null, 2)}

Output schema (strict):
{
  "widgetId": "one of the approved widget IDs above",
  "rationale": "brief explanation of why this component was chosen",
  "suggestedProps": { 
    "optional static props to pass to the component",
    "nodes": [ { "type": "grid", "props": { "container": true, "spacing": 2 }, "children": [ { "type": "grid", "props": { "item": true, "xs": 12, "md": 6 }, "children": [ { "type": "card", "props": { "sx": { "bgcolor": "background.paper" } }, "children": [ { "type": "avatar", "props": { "src": "/path.png" } } ] } ] } ] } ]
  },
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
