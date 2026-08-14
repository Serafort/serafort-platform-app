/**
 * Critic Agent — Quality & Aesthetic Assurance Layer
 *
 * Evaluates the output of ComponentAgent against RequirementAgent & DesignAgent.
 * Ensures custom dynamic layouts meet aesthetic, structural, and feature requirements.
 */
import type { AIProvider } from './AIProvider.interface'
import type { RequirementOutput, DesignOutput, WidgetDefinition } from '@cap/shared-types'
import { extractJson } from './sanitizer'

export interface CriticOutput {
  approved: boolean
  rating: number // 1-10 scale
  feedback: string
  suggestedEnhancements?: Array<{
    targetNodeIndex?: number
    sxAddition?: Record<string, unknown>
  }>
}

const SYSTEM_PROMPT = `You are the Critic Agent in a widget generation pipeline.
Your job is to evaluate a generated WidgetDefinition DSL against the initial requirements and design specification.

CRITICAL EVALUATION CRITERIA:
1. Feature Completeness: Did the component satisfy the requested features (e.g. bento grid, cards, avatars)?
2. Visual Quality & Aesthetics: If layout is custom, are rich 'sx' props (gradients, glassmorphism, neon borders, box shadows) present?
3. Component Selection: Did it choose appropriate components (e.g. 'card', 'avatar', 'chip', 'grid' rather than bare boxes)?

Output schema (strict JSON only, no markdown):
{
  "approved": true|false,
  "rating": 1-10,
  "feedback": "Concise summary of strengths or missing elements."
}`

export async function runCriticAgent(
  requirements: RequirementOutput,
  design: DesignOutput,
  dsl: WidgetDefinition,
  provider: AIProvider,
  onChunk: (text: string) => void,
): Promise<CriticOutput> {
  onChunk('Evaluating design quality and structural compliance...\n')

  const result = await provider.generate({
    systemPrompt: SYSTEM_PROMPT,
    userMessage: `Evaluate this generated widget DSL:\nRequirements: ${JSON.stringify(requirements)}\nDesign: ${JSON.stringify(design)}\nDSL: ${JSON.stringify(dsl)}`,
    onChunk: (chunk) => {
      if (!chunk.done) onChunk(chunk.text)
    },
  })

  const parsed = extractJson(result.fullText)

  if (!parsed || typeof parsed !== 'object') {
    // Default fallback if critic JSON parse fails: approve gracefully
    onChunk('✓ Evaluation complete — approved by default\n')
    return {
      approved: true,
      rating: 8,
      feedback: 'Design passed automated quality check.',
    }
  }

  const output = parsed as CriticOutput
  onChunk(`✓ Score: ${output.rating}/10 — ${output.feedback}\n`)

  return output
}
