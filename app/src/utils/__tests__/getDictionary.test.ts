import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getDictionary } from '../getDictionary'
import { getMergedDictionary, type Locale } from '@cap/platform-core'

vi.mock('@cap/platform-core', () => ({
  getMergedDictionary: vi.fn(),
}))

vi.mock('../../data/dictionaries/en.json', () => ({
  default: { base: 'en-base', nested: { val: 1 } }
}))

vi.mock('../../data/dictionaries/fr.json', () => ({
  default: { base: 'fr-base', nested: { val: 2 } }
}))

describe('getDictionary', () => {
  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    consoleWarnSpy.mockClear()
  })

  it('loads en dictionary and merges with module dictionary', async () => {
    vi.mocked(getMergedDictionary).mockReturnValue({
      moduleKey: 'mod-val',
      nested: { extra: 3 }
    })

    const result = await getDictionary('en')

    expect(result).toEqual({
      base: 'en-base',
      nested: { val: 1, extra: 3 },
      moduleKey: 'mod-val'
    })

    expect(getMergedDictionary).toHaveBeenCalledWith('en')
    expect(consoleWarnSpy).not.toHaveBeenCalled()
  })

  it('loads fr dictionary and merges with module dictionary', async () => {
    vi.mocked(getMergedDictionary).mockReturnValue({
      fromModule: true
    })

    const result = await getDictionary('fr')

    expect(result).toEqual({
      base: 'fr-base',
      nested: { val: 2 },
      fromModule: true
    })
  })

  it('falls back to en dictionary when dictionary for locale throws or is missing', async () => {
    vi.mocked(getMergedDictionary).mockReturnValue({
      moduleKey: 'mod-val'
    })

    // passing an invalid locale to force the catch block
    const result = await getDictionary('invalid-locale' as Locale)

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Dictionary for locale invalid-locale not found, falling back to en'
    )

    // Should fall back to en.json base dict
    expect(result).toEqual({
      base: 'en-base',
      nested: { val: 1 },
      moduleKey: 'mod-val'
    })
  })
})
