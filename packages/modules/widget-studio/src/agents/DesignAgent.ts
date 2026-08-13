/**
 * Design Agent — Agent 2/6
 *
 * Converts structured requirements into UX/UI specifications.
 * Output: DesignOutput JSON
 */
import type { AIProvider } from './AIProvider.interface'
import type { RequirementOutput, DesignOutput } from '@cap/shared-types'
import { extractJson } from './sanitizer'

const SYSTEM_PROMPT = `You are the Design Agent in a widget generation pipeline.
You receive structured widget requirements and produce a UX/UI specification.

CRITICAL RULES:
- Output ONLY valid JSON. No prose, no explanations, no markdown.
- Never generate executable code, CSS, or React components.
- Choose layout based on content type: charts → "chart", metrics/KPIs → "stat", tables → "list", weather → "card", AI conversations → "chat".
- Size: "small" (4-col), "medium" (8-col), "large"/"full" (12-col).

Output schema (strict):
{
  "layout": "card|list|grid|chart|stat|chat",
  "size": "small|medium|large|full",
  "responsive": true,
  "sections": ["array of UI section names"],
  "accessibility": ["optional WCAG notes"]
}

Example output for a revenue chart:
{
  "layout": "chart",
  "size": "medium",
  "responsive": true,
  "sections": ["header", "chartArea", "legend"],
  "accessibility": ["provide text alternative for chart data"]
}`

export async function runDesignAgent(
  requirements: RequirementOutput,
  provider: AIProvider,
  onChunk: (text: string) => void,
): Promise<DesignOutput> {
  const result = await provider.generate({
    systemPrompt: SYSTEM_PROMPT,
    userMessage: `Produce a UI/UX specification for this widget requirement: ${JSON.stringify(requirements)}`,
    onChunk: (chunk) => {
      if (!chunk.done) onChunk(chunk.text)
    },
  })

  const parsed = extractJson(result.fullText)

  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`DesignAgent: Failed to parse output — ${result.fullText}`)
  }

  return parsed as DesignOutput
}
