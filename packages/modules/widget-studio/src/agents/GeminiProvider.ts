/**
 * GeminiProvider — Real Gemini API implementation of AIProvider.
 *
 * Uses the Gemini streaming API to power all 6 agents in the widget pipeline.
 * API key is sourced from VITE_GEMINI_API_KEY environment variable.
 *
 * Each agent enforces JSON-only output via a strict system prompt.
 * SSE chunks are delivered via the onChunk callback for live UI streaming.
 */
import type {
  AIProvider,
  AIGenerateOptions,
  AIGenerateResult,
} from './AIProvider.interface'

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

/**
 * Resolve the Gemini API key from the environment.
 * Returns null if not configured (caller should surface an error to the user).
 */
function getApiKey(): string | null {
  const key = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env
    .VITE_GEMINI_API_KEY
  if (!key || key === 'your_gemini_api_key_here' || key.trim() === '') {
    return null
  }
  return key
}

/**
 * Resolve the model to use (defaults to gemini-3.6-flash).
 */
function getModel(): string {
  const envModel = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env
    .VITE_GEMINI_MODEL
  return envModel && !['gemini-2.0-flash', 'gemini-1.5-flash'].includes(envModel)
    ? envModel
    : 'gemini-3.6-flash'
}

export class GeminiProvider implements AIProvider {
  async generate(options: AIGenerateOptions): Promise<AIGenerateResult> {
    const apiKey = getApiKey()
    if (!apiKey) {
      const errorMsg = 'VITE_GEMINI_API_KEY is not configured. Add it to your .env file.'
      console.error('[GeminiProvider]', errorMsg)
      options.onChunk({ text: errorMsg, done: true })
      return { fullText: errorMsg, error: errorMsg }
    }

    let model = getModel()
    let endpoint = `${GEMINI_API_BASE}/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`

    // Build request body — system prompt enforces JSON-only output
    const requestBody = {
      system_instruction: {
        parts: [{ text: options.systemPrompt }],
      },
      contents: [
        // Include conversation history (for context chaining between agents)
        ...(options.history ?? []).map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
        {
          role: 'user',
          parts: [{ text: options.userMessage }],
        },
      ],
      generationConfig: {
        temperature: 0.2,       // Low temperature for deterministic JSON outputs
        topP: 0.8,
        maxOutputTokens: 2048,
      },
    }

    try {
      let response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      // Automatic fallback if model is unavailable (404)
      if (response.status === 404 && model !== 'gemini-flash-latest') {
        if (import.meta.env.DEV) {
          console.warn(`[GeminiProvider] Model ${model} returned 404. Falling back to gemini-flash-latest...`)
        }
        model = 'gemini-flash-latest'
        endpoint = `${GEMINI_API_BASE}/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        })
      }

      if (!response.ok) {
        const errorText = await response.text()
        const errorMsg = `Gemini API error ${response.status}: ${errorText}`
        console.error('[GeminiProvider]', errorMsg)
        options.onChunk({ text: errorMsg, done: true })
        return { fullText: errorMsg, error: errorMsg }
      }

      // Read the streaming SSE response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      if (!reader) {
        const msg = 'No response body from Gemini API'
        options.onChunk({ text: msg, done: true })
        return { fullText: msg, error: msg }
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const rawChunk = decoder.decode(value, { stream: true })
        // SSE lines start with "data: "
        const lines = rawChunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const jsonStr = line.slice(6).trim()
          if (jsonStr === '[DONE]') {
            options.onChunk({ text: '', done: true })
            break
          }

          try {
            const parsed = JSON.parse(jsonStr)
            const text: string =
              parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

            if (text) {
              accumulated += text
              options.onChunk({ text, done: false })
            }

            // Check for finish reason
            const finishReason = parsed?.candidates?.[0]?.finishReason
            if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
              if (import.meta.env.DEV) {
                console.warn('[GeminiProvider] Unexpected finish reason:', finishReason)
              }
            }
          } catch {
            // Non-JSON SSE line (e.g. comments, empty), skip
          }
        }
      }

      // Attempt to parse the accumulated text as JSON
      let parsed: unknown | undefined
      try {
        // Remove markdown code fences if present
        const cleaned = accumulated.replace(/```(?:json)?\s*/g, '').replace(/```\s*$/g, '').trim()
        parsed = JSON.parse(cleaned)
      } catch {
        // Not pure JSON — caller will handle
      }

      return { fullText: accumulated, parsed }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error('[GeminiProvider] Network error:', errorMsg)
      options.onChunk({ text: `Network error: ${errorMsg}`, done: true })
      return { fullText: errorMsg, error: errorMsg }
    }
  }
}

/** Singleton instance — shared across all agents in the pipeline */
export const geminiProvider = new GeminiProvider()
