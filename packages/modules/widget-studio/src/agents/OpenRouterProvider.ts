import type {
  AIProvider,
  AIGenerateOptions,
  AIGenerateResult,
} from './AIProvider.interface'

const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1'

function getApiKey(): string | null {
  const key = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env
    .VITE_OPENROUTER_API_KEY
  if (!key || key === 'your_openrouter_api_key_here' || key.trim() === '') {
    return 'your-api-key' // fallback to the user's requested default
  }
  return key
}

function getModel(): string {
  const envModel = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env
    .VITE_OPENROUTER_MODEL
  return envModel || 'openai/gpt-4o-mini'
}

export class OpenRouterProvider implements AIProvider {
  private customModel?: string

  constructor(model?: string) {
    this.customModel = model
  }

  async generate(options: AIGenerateOptions): Promise<AIGenerateResult> {
    const apiKey = getApiKey()
    if (!apiKey) {
      const errorMsg = 'OpenRouter API key is not configured.'
      console.error('[OpenRouterProvider]', errorMsg)
      options.onChunk({ text: errorMsg, done: true })
      return { fullText: errorMsg, error: errorMsg }
    }

    const model = this.customModel || getModel()
    const endpoint = `${OPENROUTER_API_BASE}/chat/completions`

    // Map conversation history to OpenAI format
    const messages = [
      { role: 'system', content: options.systemPrompt },
      ...(options.history ?? []).map((msg) => ({
        role: msg.role === 'model' ? 'assistant' : msg.role,
        content: msg.content,
      })),
      { role: 'user', content: options.userMessage },
    ]

    const requestBody = {
      model,
      messages,
      stream: true,
      temperature: 0.2,
      top_p: 0.8,
      max_tokens: 8192,
      response_format: { type: 'json_object' }
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:5173', // OpenRouter requires this for free tiers sometimes
          'X-Title': 'CAP Framework Widget Studio',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        const errorMsg = `OpenRouter API error ${response.status}: ${errorText}`
        console.error('[OpenRouterProvider]', errorMsg)
        options.onChunk({ text: errorMsg, done: true })
        return { fullText: errorMsg, error: errorMsg }
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      if (!reader) {
        const msg = 'No response body from OpenRouter API'
        options.onChunk({ text: msg, done: true })
        return { fullText: msg, error: msg }
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const rawChunk = decoder.decode(value, { stream: true })
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
            const text = parsed?.choices?.[0]?.delta?.content ?? ''

            if (text) {
              accumulated += text
              options.onChunk({ text, done: false })
            }
          } catch {
            // Non-JSON SSE line, skip
          }
        }
      }

      let parsed: unknown | undefined
      try {
        const cleaned = accumulated.replace(/```(?:json)?\s*/g, '').replace(/```\s*$/g, '').trim()
        parsed = JSON.parse(cleaned)
      } catch {
        // Not pure JSON
      }

      return { fullText: accumulated, parsed }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error('[OpenRouterProvider] Network error:', errorMsg)
      options.onChunk({ text: `Network error: ${errorMsg}`, done: true })
      return { fullText: errorMsg, error: errorMsg }
    }
  }
}

export const openRouterProvider = new OpenRouterProvider()
