import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getDictionary } from '../getDictionary'
import { getMergedDictionary } from '@cap/platform-core'

// Mock getMergedDictionary from platform-core
vi.mock('@cap/platform-core', () => ({
  getMergedDictionary: vi.fn(),
}))

// We can't mock dictionaries in getDictionary.ts because it's a non-exported module-level constant.
// We test against the real JSON files loaded by dynamic imports in the real module.

describe('getDictionary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Suppress console.warn to keep test output clean during fallback testing
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads en dictionary and merges with module dictionary', async () => {
    vi.mocked(getMergedDictionary).mockReturnValue({
      customModuleKey: 'customValue',
    })

    const result = await getDictionary('en' as any)

    // We expect result to contain properties from both base dictionary (en.json) and module dict
    expect(result).toBeDefined()
    expect(result.customModuleKey).toBe('customValue')
    // We can check if typical en dictionary structure is there, though we don't know the exact schema
    expect(typeof result).toBe('object')
  })

  it('falls back to en when unsupported locale is provided', async () => {
    vi.mocked(getMergedDictionary).mockReturnValue({
      customModuleKey: 'customValueForUnsupported',
    })

    const result = await getDictionary('es' as any) // es is not one of en/fr/ar

    expect(result).toBeDefined()
    expect(result.customModuleKey).toBe('customValueForUnsupported')
    expect(console.warn).toHaveBeenCalledWith('Dictionary for locale es not found, falling back to en')
  })

  it('loads fr dictionary successfully', async () => {
    vi.mocked(getMergedDictionary).mockReturnValue({})

    const result = await getDictionary('fr' as any)
    expect(result).toBeDefined()
    expect(typeof result).toBe('object')
    // Ensure we didn't fall back to en
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('performs deep merge correctly between base and module dictionaries', async () => {
    vi.mocked(getMergedDictionary).mockReturnValue({
      nested: {
        overriddenKey: 'new value',
        newKey: 'added value',
      },
      topLevelOverride: 'yes',
    })

    const result = await getDictionary('en' as any)

    // We can't easily assert on standard keys without knowing en.json contents,
    // but we can at least assert our merged keys are present
    expect(result.nested.overriddenKey).toBe('new value')
    expect(result.nested.newKey).toBe('added value')
    expect(result.topLevelOverride).toBe('yes')
  })
})
