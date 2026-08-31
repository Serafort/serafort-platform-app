/**
 * GeminiProvider — DISABLED client-side provider.
 *
 * SECURITY: Browser-side AI provider calls required an API key to be shipped in
 * the public JS bundle (`VITE_GEMINI_API_KEY`) and sent from the user's browser
 * straight to Google. That is a credential-exposure / billing-abuse vector.
 *
 * All AI generation now runs SERVER-SIDE through the backend pipeline
 * (`POST /api/v1/widgets/generate`, streamed back over SSE — see
 * `services/widgetAgentClient.ts` and `agents/AgentOrchestrator.ts`). The API key
 * lives only in the backend environment.
 *
 * This class is kept as an inert stub so existing imports keep type-checking; any
 * attempt to use it fails loudly instead of silently re-introducing a key.
 */
import type {
  AIProvider,
  AIGenerateOptions,
  AIGenerateResult,
} from './AIProvider.interface'

const DISABLED_MESSAGE =
  'Client-side GeminiProvider is disabled. AI generation runs server-side via ' +
  'the backend pipeline (POST /api/v1/widgets/generate). No API key is exposed to the browser.'

export class GeminiProvider implements AIProvider {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_model?: string) {}

  async generate(options: AIGenerateOptions): Promise<AIGenerateResult> {
    console.error('[GeminiProvider]', DISABLED_MESSAGE)
    options.onChunk({ text: DISABLED_MESSAGE, done: true })
    return { fullText: DISABLED_MESSAGE, error: DISABLED_MESSAGE }
  }
}

/** Singleton instance — inert; retained for backward-compatible imports. */
export const geminiProvider = new GeminiProvider()
