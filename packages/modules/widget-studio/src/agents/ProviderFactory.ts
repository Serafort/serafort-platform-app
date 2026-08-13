import type { AIProvider } from './AIProvider.interface'
import { GeminiProvider } from './GeminiProvider'
import { OpenRouterProvider } from './OpenRouterProvider'
import type { ProviderType } from '@cap/shared-types'

/**
 * Factory to determine which AI provider to use.
 * Checks dynamic arguments first, falling back to VITE_AI_PROVIDER env var, defaulting to openrouter.
 */
export function getAIProvider(overrideProvider?: ProviderType | string, overrideModel?: string): AIProvider {
  const envProvider = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env.VITE_AI_PROVIDER
  const providerName = overrideProvider || envProvider

  switch (providerName?.toLowerCase()) {
    case 'gemini':
      return new GeminiProvider(overrideModel)
    case 'openrouter':
    default:
      return new OpenRouterProvider(overrideModel)
  }
}
