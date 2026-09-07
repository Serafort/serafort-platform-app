import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getDictionary } from './getDictionary'
import * as platformCore from '@cap/platform-core'

vi.mock('@cap/platform-core', () => ({
  getMergedDictionary: vi.fn(),
}))

vi.mock('../data/dictionaries/en.json', () => ({
  default: {
    baseKey: 'baseValue',
    common: {
      baseNested: 'yes',
      overrideMe: 'base'
    }
  }
}))

describe('getDictionary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('loads requested dictionary and merges it with module dictionary', async () => {
    vi.mocked(platformCore.getMergedDictionary).mockReturnValue({
      moduleKey: 'moduleValue',
      components: {
        Test: 'moduleTest'
      },
      common: {
        overrideMe: 'module'
      }
    })

    const dict = await getDictionary('en')

    expect(dict).toBeDefined()
    expect(dict.baseKey).toBe('baseValue') // From base dictionary
    expect(dict.moduleKey).toBe('moduleValue') // From module dictionary
    expect(dict.components.Test).toBe('moduleTest')
    expect(dict.common.baseNested).toBe('yes') // From base dictionary
    expect(dict.common.overrideMe).toBe('module') // Overridden by module dictionary
  })

  it('falls back to english when locale dictionary fails to load', async () => {
    vi.mocked(platformCore.getMergedDictionary).mockReturnValue({
      fallback: true
    })

    const dict = await getDictionary('invalid-locale' as any)

    expect(console.warn).toHaveBeenCalledWith('Dictionary for locale invalid-locale not found, falling back to en')
    expect(dict.baseKey).toBe('baseValue') // Still gets base english dictionary
    expect(dict.fallback).toBe(true)
  })

  it('merges deep structures correctly', async () => {
    vi.mocked(platformCore.getMergedDictionary).mockReturnValue({
      common: {
        newCommonKey: 'new value'
      }
    })

    const dict = await getDictionary('en')
    expect(dict.common.baseNested).toBe('yes')
    expect(dict.common.newCommonKey).toBe('new value')
  })
})
