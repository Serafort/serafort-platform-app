/**
 * Requirement Agent — Agent 1/6
 *
 * Converts natural language user prompts into structured widget requirements.
 * Output: RequirementOutput JSON
 */
import type { AIProvider } from './AIProvider.interface'
import type { RequirementOutput } from '@cap/shared-types'
import { extractJson } from './sanitizer'

const SYSTEM_PROMPT = `You are the Requirement Agent in a widget generation pipeline.
Your sole responsibility is to extract structured requirements from a user's natural language description.

CRITICAL RULES:
- Output ONLY valid JSON. No prose, no explanations, no markdown.
- Never generate executable code, JavaScript, or React components.
- Extract intent precisely — do not invent features the user did not mention.

Output schema (strict):
{
  "type": "string — widget category (weather|chart|table|metric|stat|chat|custom)",
  "features": ["array of feature strings extracted from the prompt"],
  "constraints": ["optional array of constraints or limitations mentioned"],
  "scope": "string — brief one-sentence description of the widget scope"
}

Example input: "Create a sales chart showing monthly revenue for the last 6 months with a target line"
Example output:
{
  "type": "chart",
  "features": ["monthly_revenue", "6_month_range", "target_line"],
  "constraints": [],
  "scope": "Monthly revenue area chart with target comparison line"
}`

export async function runRequirementAgent(
  prompt: string,
  provider: AIProvider,
  onChunk: (text: string) => void,
): Promise<RequirementOutput> {
  const result = await provider.generate({
    systemPrompt: SYSTEM_PROMPT,
    userMessage: `Extract widget requirements from this prompt: "${prompt}"`,
    onChunk: (chunk) => {
      if (!chunk.done) onChunk(chunk.text)
    },
  })

  const parsed = extractJson(result.fullText)

  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`RequirementAgent: Failed to parse output — ${result.fullText}`)
  }

  return parsed as RequirementOutput
}
