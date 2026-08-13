/**
 * AIProvider — Pluggable AI backend interface for the Widget Studio agent pipeline.
 *
 * Implementations: GeminiProvider (default), can be extended for OpenAI, Anthropic, etc.
 */

export interface AIProviderMessage {
  role: 'user' | 'model'
  content: string
}

export interface AIStreamChunk {
  /** Text fragment from the streaming response */
  text: string
  /** Whether this is the final chunk */
  done: boolean
}

/**
 * Options for a streamed generation request.
 * @param systemPrompt - Role-constrained system instruction (JSON-only output enforced)
 * @param userMessage - The agent-specific user message
 * @param onChunk - Callback invoked for each streamed text chunk
 */
export interface AIGenerateOptions {
  systemPrompt: string
  userMessage: string
  history?: AIProviderMessage[]
  onChunk: (chunk: AIStreamChunk) => void
}

/**
 * Result of a completed generation — the full accumulated text.
 */
export interface AIGenerateResult {
  fullText: string
  /** Parsed JSON output (if the response was valid JSON) */
  parsed?: unknown
  error?: string
}

/**
 * The AIProvider interface. All agent calls go through this contract.
 * Implementations must:
 *  1. Enforce JSON-only output via system prompt
 *  2. Stream responses via onChunk callback
 *  3. Return the full accumulated text in the result
 */
export interface AIProvider {
  generate(options: AIGenerateOptions): Promise<AIGenerateResult>
}
