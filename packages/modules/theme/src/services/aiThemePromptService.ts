import type { TenantThemeConfig, ThemePresetId, ColorToken } from '@cap/theme'
import { DEFAULT_TENANT_THEME, THEME_PRESETS, applyPreset } from '@cap/theme'
import { themeService } from './theme.service'

export interface PromptAnalysisResult {
  prompt: string
  presetMatch: ThemePresetId
  detectedMood: string
  isDark: boolean
  primaryHex: string
  secondaryHex: string
  backgroundHex: string
  surfaceHex: string
  textHex: string
  textMutedHex: string
  borderHex: string
  borderRadius: string
  effectType: 'standard' | 'glass' | 'neu' | 'brutalism' | 'organic' | 'immersive'
  explanation: string
}

export interface PromptSuggestion {
  id: string
  title: string
  category: 'Modern Dark' | 'Clean SaaS' | 'Vibrant & Creative' | 'Warm & Earthy' | 'Luxury & Boutique'
  prompt: string
  tags: string[]
  previewColors: { primary: string; secondary: string; background: string }
}

export const CURATED_PROMPT_SUGGESTIONS: PromptSuggestion[] = [
  {
    id: 'cyberpunk-neon',
    title: 'Cyberpunk Neon HUD',
    category: 'Modern Dark',
    prompt: 'Cyberpunk dark HUD with neon cyan primary, magenta secondary, deep void background and glowing glass borders',
    tags: ['Dark Mode', 'Neon', 'Glassmorphism', 'Tech'],
    previewColors: { primary: '#00ffff', secondary: '#ff00ff', background: '#050510' },
  },
  {
    id: 'slate-fintech',
    title: 'Minimalist Slate Fintech',
    category: 'Clean SaaS',
    prompt: 'Clean modern fintech SaaS with deep sapphire blue primary, emerald green success accents, crisp white surfaces and subtle shadows',
    tags: ['Light Mode', 'SaaS', 'Corporate', 'Finance'],
    previewColors: { primary: '#0f62fe', secondary: '#0043ce', background: '#f4f7fb' },
  },
  {
    id: 'luxury-obsidian',
    title: 'Luxury Obsidian Gold',
    category: 'Luxury & Boutique',
    prompt: 'Ultra-luxurious obsidian dark theme with champagne gold primary, warm bronze secondary, deep onyx glass panels and refined golden borders',
    tags: ['Luxury', 'Dark Mode', 'Gold', 'Premium'],
    previewColors: { primary: '#D4AF37', secondary: '#AA7C11', background: '#0a0a0c' },
  },
  {
    id: 'earthy-terracotta',
    title: 'Warm Earthy Terracotta',
    category: 'Warm & Earthy',
    prompt: 'Warm organic aesthetic with roasted terracotta primary, sage green secondary, warm cream background and soft rounded pill corners',
    tags: ['Organic', 'Warm', 'Earthy', 'Soft UI'],
    previewColors: { primary: '#c85a32', secondary: '#4a7c59', background: '#faf6f0' },
  },
  {
    id: 'neo-brutalist',
    title: 'Neo-Brutalist Arcade',
    category: 'Vibrant & Creative',
    prompt: 'Retro neo-brutalist theme with electric canary yellow primary, hot coral secondary, sharp 0px corners, and bold 3px black offset shadows',
    tags: ['Brutalism', 'Retro', 'Bold', 'Playful'],
    previewColors: { primary: '#ffde59', secondary: '#ff5757', background: '#ffffff' },
  },
  {
    id: 'aurora-glass',
    title: 'Aurora Glassmorphism',
    category: 'Modern Dark',
    prompt: 'Translucent frosted glass bento theme with aurora violet primary, electric indigo secondary, and deep space glass background with 24px blur',
    tags: ['Glassmorphism', 'Bento', 'Violet', 'Modern'],
    previewColors: { primary: '#a855f7', secondary: '#6366f1', background: '#0b0f19' },
  },
]

// WCAG Contrast Utilities
export function getLuminance(hex: string): number {
  const rgb = hex.replace('#', '').match(/.{2}/g)
  if (!rgb) return 0
  const [r, g, b] = rgb.map(c => {
    let val = parseInt(c, 16) / 255
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1)
  const lum2 = getLuminance(hex2)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  return (brightest + 0.05) / (darkest + 0.05)
}

export function getWcagComplianceBadge(foregroundHex: string, backgroundHex: string): { label: string, color: 'success' | 'warning' | 'error', ratio: number } {
  const ratio = getContrastRatio(foregroundHex, backgroundHex)
  if (ratio >= 7) return { label: `AAA (${ratio.toFixed(1)}:1)`, color: 'success', ratio }
  if (ratio >= 4.5) return { label: `AA (${ratio.toFixed(1)}:1)`, color: 'success', ratio }
  if (ratio >= 3) return { label: `AA Large (${ratio.toFixed(1)}:1)`, color: 'warning', ratio }
  return { label: `Fail (${ratio.toFixed(1)}:1)`, color: 'error', ratio }
}

class AiThemePromptService {
  /**
   * Parses natural language prompts using rule-based semantic color & typography extraction.
   */
  analyzePrompt(prompt: string): PromptAnalysisResult {
    const text = prompt.toLowerCase()

    // 1. Dark vs Light mode detection
    const isDark =
      text.includes('dark') ||
      text.includes('night') ||
      text.includes('cyberpunk') ||
      text.includes('obsidian') ||
      text.includes('black') ||
      text.includes('onyx') ||
      text.includes('midnight') ||
      text.includes('space') ||
      text.includes('void') ||
      text.includes('dracula') ||
      text.includes('tokyo night') ||
      text.includes('hud')

    // 2. Preset & Effect heuristics
    let presetMatch: ThemePresetId = isDark ? 'dark-ui' : 'flat-design'
    let effectType: PromptAnalysisResult['effectType'] = 'standard'
    let detectedMood = 'Modern Clean'

    if (text.includes('cyberpunk') || text.includes('hud') || text.includes('sci-fi') || text.includes('techno')) {
      presetMatch = 'cyberpunk-hud'
      effectType = 'glass'
      detectedMood = 'Futuristic Cyberpunk'
    } else if (text.includes('glass') || text.includes('frosted') || text.includes('translucent') || text.includes('bento') || text.includes('aurora')) {
      presetMatch = 'glassmorphism'
      effectType = 'glass'
      detectedMood = 'Frosted Glassmorphism'
    } else if (text.includes('neu') || text.includes('soft ui') || text.includes('molded') || text.includes('squishy') || text.includes('extruded')) {
      presetMatch = 'neumorphism'
      effectType = 'neu'
      detectedMood = 'Soft Neumorphism'
    } else if (text.includes('brutal') || text.includes('raw') || text.includes('arcade') || text.includes('comic') || text.includes('retro-y2k')) {
      presetMatch = text.includes('neo') ? 'neo-brutalism' : 'pure-brutalism'
      effectType = 'brutalism'
      detectedMood = 'High-Contrast Brutalism'
    } else if (text.includes('organic') || text.includes('fluid') || text.includes('liquid') || text.includes('nature') || text.includes('earthy')) {
      presetMatch = 'liquid-organic'
      effectType = 'organic'
      detectedMood = 'Warm Liquid Organic'
    } else if (text.includes('luxury') || text.includes('gold') || text.includes('premium') || text.includes('obsidian') || text.includes('champagne')) {
      presetMatch = 'godlio-premium'
      effectType = 'glass'
      detectedMood = 'Luxury Obsidian Gold'
    } else if (text.includes('minimal') || text.includes('clean') || text.includes('slate') || text.includes('swiss')) {
      presetMatch = 'minimalism'
      effectType = 'standard'
      detectedMood = 'Minimalist Swiss'
    }

    // 3. Hex code extraction (if prompt contains explicit hex like #6366f1)
    const hexMatches = prompt.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/g) || []
    let primaryHex = hexMatches[0] || ''
    let secondaryHex = hexMatches[1] || ''

    // 4. Color name semantic mapping
    if (!primaryHex) {
      if (text.includes('cyan') || text.includes('aqua')) primaryHex = '#00f0ff'
      else if (text.includes('magenta') || text.includes('fuchsia')) primaryHex = '#ff007f'
      else if (text.includes('gold') || text.includes('champagne')) primaryHex = '#D4AF37'
      else if (text.includes('emerald') || text.includes('mint') || text.includes('forest')) primaryHex = '#10b981'
      else if (text.includes('terracotta') || text.includes('clay') || text.includes('rust')) primaryHex = '#c85a32'
      else if (text.includes('indigo') || text.includes('electric blue')) primaryHex = '#6366f1'
      else if (text.includes('sapphire') || text.includes('navy') || text.includes('blue')) primaryHex = '#0f62fe'
      else if (text.includes('violet') || text.includes('purple')) primaryHex = '#8b5cf6'
      else if (text.includes('coral') || text.includes('peach') || text.includes('orange')) primaryHex = '#f97316'
      else if (text.includes('crimson') || text.includes('ruby') || text.includes('red')) primaryHex = '#ef4444'
      else if (text.includes('yellow') || text.includes('amber')) primaryHex = '#f59e0b'
      else if (text.includes('teal')) primaryHex = '#14b8a6'
      else if (text.includes('rose') || text.includes('pink')) primaryHex = '#ec4899'
      else {
        primaryHex = THEME_PRESETS[presetMatch]?.preview.primaryColor || (isDark ? '#6366f1' : '#1e40af')
      }
    }

    if (!secondaryHex) {
      if (text.includes('magenta') || text.includes('neon pink')) secondaryHex = '#ec4899'
      else if (text.includes('cyan') || text.includes('electric blue')) secondaryHex = '#06b6d4'
      else if (text.includes('bronze') || text.includes('amber')) secondaryHex = '#b45309'
      else if (text.includes('sage') || text.includes('olive')) secondaryHex = '#4a7c59'
      else if (text.includes('indigo')) secondaryHex = '#4f46e5'
      else if (text.includes('purple') || text.includes('violet')) secondaryHex = '#a855f7'
      else {
        secondaryHex = THEME_PRESETS[presetMatch]?.preview.secondaryColor || (isDark ? '#8b5cf6' : '#3b82f6')
      }
    }

    // 5. Background, Surface, Text, and Border calculations
    let backgroundHex = isDark ? '#09090b' : '#f8fafc'
    let surfaceHex = isDark ? '#18181b' : '#ffffff'
    let textHex = isDark ? '#fafafa' : '#0f172a'
    let textMutedHex = isDark ? '#71717a' : '#64748b'
    let borderHex = isDark ? '#27272a' : '#e2e8f0'

    if (presetMatch === 'cyberpunk-hud') {
      backgroundHex = '#050510'
      surfaceHex = '#0d0d1e'
      borderHex = '#1f1f3d'
      textHex = '#00ffff'
      textMutedHex = '#708090'
    } else if (presetMatch === 'godlio-premium') {
      backgroundHex = '#060608'
      surfaceHex = '#101014'
      borderHex = '#2a2415'
      textHex = '#fefefe'
      textMutedHex = '#9d9484'
    } else if (presetMatch === 'liquid-organic') {
      backgroundHex = '#fbf7f4'
      surfaceHex = '#ffffff'
      borderHex = '#f0e6dc'
      textHex = '#2c221e'
    } else if (presetMatch === 'neumorphism') {
      backgroundHex = '#e0e5ec'
      surfaceHex = '#e0e5ec'
      borderHex = '#d1d5db'
      textHex = '#374151'
    } else if (presetMatch === 'glassmorphism') {
      backgroundHex = isDark ? '#0b0f19' : '#f0f4f8'
      surfaceHex = isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.75)'
      borderHex = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'
    } else if (presetMatch === 'pure-brutalism' || presetMatch === 'neo-brutalism') {
      backgroundHex = '#ffffff'
      surfaceHex = '#ffffff'
      borderHex = '#000000'
      textHex = '#000000'
      textMutedHex = '#333333'
    }

    // 6. Border Radius
    let borderRadius = '8px'
    if (text.includes('sharp') || text.includes('square') || presetMatch === 'pure-brutalism') {
      borderRadius = '0px'
    } else if (text.includes('pill') || text.includes('organic') || presetMatch === 'liquid-organic') {
      borderRadius = '32px'
    } else if (text.includes('round') || presetMatch === 'neumorphism') {
      borderRadius = '16px'
    }

    const explanation = `Synthesized ${detectedMood} theme with ${primaryHex} primary and ${secondaryHex} secondary accents on ${isDark ? 'dark' : 'light'} base.`

    return {
      prompt,
      presetMatch,
      detectedMood,
      isDark,
      primaryHex,
      secondaryHex,
      backgroundHex,
      surfaceHex,
      textHex,
      textMutedHex,
      borderHex,
      borderRadius,
      effectType,
      explanation,
    }
  }

  /**
   * Synthesizes a full TenantThemeConfig object ready for the ThemeBridge & DesignSystemProvider.
   */
  generateThemeFromPrompt(prompt: string, baseConfig?: TenantThemeConfig): TenantThemeConfig {
    const analysis = this.analyzePrompt(prompt)
    const base = baseConfig || applyPreset(analysis.presetMatch) || DEFAULT_TENANT_THEME

    const newTheme: TenantThemeConfig = {
      ...base,
      name: `AI Theme: ${analysis.detectedMood}`,
      preset: analysis.presetMatch,
      tokens: {
        ...base.tokens,
        colors: {
          ...base.tokens.colors,
          primary: { value: analysis.primaryHex, description: 'AI Generated Primary' } as ColorToken,
          secondary: { value: analysis.secondaryHex, description: 'AI Generated Secondary' } as ColorToken,
          background: { value: analysis.backgroundHex, description: 'AI Generated Background' } as ColorToken,
          surface: { value: analysis.surfaceHex, description: 'AI Generated Surface' } as ColorToken,
          text: { value: analysis.textHex, description: 'AI Generated Text' } as ColorToken,
          textMuted: { value: analysis.textMutedHex, description: 'AI Generated Muted Text' } as ColorToken,
          border: { value: analysis.borderHex, description: 'AI Generated Border' } as ColorToken,
        },
        borderRadius: {
          ...base.tokens.borderRadius,
          md: analysis.borderRadius,
          lg: analysis.borderRadius === '0px' ? '0px' : '16px',
        },
      },
      effects: {
        ...base.effects,
        globalType: analysis.effectType,
        glassmorphism: {
          ...base.effects.glassmorphism,
          enabled: analysis.effectType === 'glass',
          blur: analysis.effectType === 'glass' ? '20px' : base.effects.glassmorphism.blur,
          background: analysis.isDark ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.65)',
          borderColor: analysis.isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
        },
        neumorphism: {
          ...base.effects.neumorphism,
          enabled: analysis.effectType === 'neu',
          backgroundColor: analysis.backgroundHex,
        },
      },
      metadata: {
        ...base.metadata,
        preset: analysis.presetMatch,
        mode: analysis.isDark ? 'dark' : 'light',
        updatedAt: new Date().toISOString(),
      },
    }

    return newTheme
  }

  /**
   * Generates a full theme from prompt by calling the backend AI engine,
   * falling back seamlessly to local rule-based synthesis if offline.
   */
  async generateThemeFromPromptAsync(
    prompt: string,
    baseConfig?: TenantThemeConfig,
    options?: { isDark?: boolean; useLlm?: boolean; providerType?: string; apiKey?: string }
  ): Promise<TenantThemeConfig> {
    try {
      const response = await themeService.generateAiTheme({
        prompt,
        isDark: options?.isDark,
        useLlm: options?.useLlm ?? true,
        providerType: options?.providerType,
        apiKey: options?.apiKey,
      });

      if (response.ok && response.data?.success && response.data.themeConfig) {
        const serverConfig = response.data.themeConfig
        const base =
          baseConfig ||
          applyPreset((response.data.presetId as any) || 'corporate-clean') ||
          DEFAULT_TENANT_THEME

        return {
          ...base,
          name: serverConfig.name || `AI Theme: ${prompt.slice(0, 30)}`,
          tokens: {
            ...base.tokens,
            colors: {
              ...base.tokens.colors,
              primary: {
                value: serverConfig.tokens?.colors?.primary?.value || serverConfig.tokens?.colors?.primary || '#6366f1',
                description: 'AI Generated Primary',
              } as ColorToken,
              secondary: {
                value: serverConfig.tokens?.colors?.secondary?.value || serverConfig.tokens?.colors?.secondary || '#8b5cf6',
                description: 'AI Generated Secondary',
              } as ColorToken,
              background: {
                value: serverConfig.tokens?.colors?.background?.value || serverConfig.tokens?.colors?.background || '#09090b',
                description: 'AI Generated Background',
              } as ColorToken,
              surface: {
                value: serverConfig.tokens?.colors?.surface?.value || serverConfig.tokens?.colors?.surface || '#18181b',
                description: 'AI Generated Surface',
              } as ColorToken,
              text: {
                value: serverConfig.tokens?.colors?.text?.value || serverConfig.tokens?.colors?.text || '#fafafa',
                description: 'AI Generated Text',
              } as ColorToken,
              textMuted: {
                value: serverConfig.tokens?.colors?.textMuted?.value || serverConfig.tokens?.colors?.textMuted || '#71717a',
                description: 'AI Generated Muted Text',
              } as ColorToken,
              border: {
                value: serverConfig.tokens?.colors?.border?.value || serverConfig.tokens?.colors?.border || '#27272a',
                description: 'AI Generated Border',
              } as ColorToken,
            },
          },
          effects: {
            ...base.effects,
            globalType: serverConfig.effects?.globalType || 'standard',
          },
          metadata: {
            ...base.metadata,
            mode: serverConfig.metadata?.mode || 'light',
            synthesisSource: 'llm',
            updatedAt: new Date().toISOString(),
          },
        }
      }
    } catch (err) {
      console.warn(
        '[aiThemePromptService] Backend generation unavailable, using local synthesis:',
        err
      )
    }

    // Fallback to local synchronous synthesis
    const localTheme = this.generateThemeFromPrompt(prompt, baseConfig)
    return {
      ...localTheme,
      metadata: {
        ...localTheme.metadata,
        synthesisSource: 'heuristic',
      },
    }
  }
}

export const aiThemePromptService = new AiThemePromptService()
export default aiThemePromptService
