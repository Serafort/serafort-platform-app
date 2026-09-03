/**
 * Input Sanitization Layer — Security Layer 1
 *
 * Filters user prompts before they reach any AI agent.
 * Mitigates prompt injection, instruction override attempts, and
 * any patterns that could compromise agent governance.
 *
 * @see Architecture spec §13.2 Layer 1
 */

/** Patterns that indicate a prompt injection attempt */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/i,
  /forget\s+(everything|all|your)\s+(above|previous|prior)/i,
  /you\s+are\s+now\s+(a|an|the)\s+/i,
  /act\s+as\s+(a|an|the)\s+/i,
  /pretend\s+(to\s+be|you\s+are)/i,
  /\bsystem\s*:/i,
  /\bassistant\s*:/i,
  /\bai\s*:/i,
  /<\s*script[^>]*>/i,
  /eval\s*\(/i,
  /import\s*\(/i,
  /require\s*\(/i,
  /function\s*\(/i,
  /=>\s*\{/i,
  /\bexec\b/i,
  /\bspawn\b/i,
  /\bprocess\.env\b/i,
  /\bwindow\.\w+\s*=/i,
  /\bdocument\.\w+\s*=/i,
  /\blocalStorage\b/i,
  /\bsessionStorage\b/i,
  /\bfetch\s*\(/i,
  /\bXMLHttpRequest\b/i,
]

/** Characters/sequences that are stripped from prompts */
const STRIP_PATTERNS: RegExp[] = [
  /```[\w\s]*\n[\s\S]*?```/g,    // Code blocks
  /<[^>]+>/g,                     // HTML tags
  /\$\{[^}]*\}/g,                 // Template literals
]

export interface SanitizationResult {
  sanitized: string
  wasModified: boolean
  /** True if the input contained an injection pattern and should be rejected */
  hasInjection: boolean
  detectedPatterns: string[]
}

/**
 * Sanitizes a user prompt before sending it to any AI agent.
 * - Strips code blocks, HTML tags, template literals
 * - Detects and rejects prompt injection patterns
 * - Normalizes whitespace
 * - Truncates to max length
 */
export function sanitizePrompt(
  raw: string,
  options: { maxLength?: number } = {},
): SanitizationResult {
  const { maxLength = 2000 } = options

  let sanitized = raw

  // Strip dangerous patterns
  for (const pattern of STRIP_PATTERNS) {
    sanitized = sanitized.replace(pattern, '')
  }

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim()

  // Truncate
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength)
  }

  const wasModified = sanitized !== raw.trim()

  // Check for injection patterns
  const detectedPatterns: string[] = []
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      detectedPatterns.push(pattern.source)
    }
  }

  if (import.meta.env.DEV && detectedPatterns.length > 0) {
    console.warn('[Sanitizer] Injection patterns detected:', detectedPatterns)
  }

  return {
    sanitized,
    wasModified,
    hasInjection: detectedPatterns.length > 0,
    detectedPatterns,
  }
}

/**
 * Extracts pure JSON from an LLM response that may include markdown fences or prose.
 * Includes auto-repair for truncated outputs caused by stream limits.
 */
export function extractJson(text: string): unknown | null {
  if (!text || typeof text !== 'string') return null

  // Strategy 1: Direct JSON parse
  try {
    return JSON.parse(text.trim())
  } catch { /* continue */ }

  // Strategy 2: Extract from complete markdown code fence ```json ... ```
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch?.[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim())
    } catch { /* continue */ }
  }

  // Strategy 3: Find first { or [ and extract to matching close
  const objStart = text.indexOf('{')
  const arrStart = text.indexOf('[')
  const start = objStart === -1 ? arrStart : arrStart === -1 ? objStart : Math.min(objStart, arrStart)

  if (start !== -1) {
    const sub = text.slice(start)
    try {
      return JSON.parse(sub)
    } catch { /* continue */ }
  }

  // Strategy 4: Unclosed code fence or truncated stream JSON auto-repair
  let candidate = text
  const openFenceMatch = text.match(/```(?:json)?\s*([\s\S]*)/)
  if (openFenceMatch?.[1]) {
    candidate = openFenceMatch[1]
  }

  const oStart = candidate.indexOf('{')
  const aStart = candidate.indexOf('[')
  const cStart = oStart === -1 ? aStart : aStart === -1 ? oStart : Math.min(oStart, aStart)

  if (cStart !== -1) {
    let cleaned = candidate.slice(cStart).trim()

    // Remove unclosed trailing key/value fragments
    cleaned = cleaned.replace(/,\s*("[^"]*")?\s*:\s*("[^"]*)?$/, '')
    cleaned = cleaned.replace(/,\s*$/, '')

    let openBraces = 0
    let openBrackets = 0
    let inString = false
    let isEscaped = false

    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i]
      if (isEscaped) {
        isEscaped = false
        continue
      }
      if (char === '\\') {
        isEscaped = true
        continue
      }
      if (char === '"') {
        inString = !inString
        continue
      }
      if (!inString) {
        if (char === '{') openBraces++
        else if (char === '}') openBraces = Math.max(0, openBraces - 1)
        else if (char === '[') openBrackets++
        else if (char === ']') openBrackets = Math.max(0, openBrackets - 1)
      }
    }

    if (inString) cleaned += '"'
    while (openBrackets > 0) {
      cleaned += ']'
      openBrackets--
    }
    while (openBraces > 0) {
      cleaned += '}'
      openBraces--
    }

    try {
      return JSON.parse(cleaned)
    } catch { /* continue */ }
  }

  return null
}
