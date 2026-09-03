/// <reference lib="webworker" />
import * as comlink from 'comlink'
import { rankItem } from '@tanstack/match-sorter-utils'
import type { IPerson } from './types'

/**
 * Data Grid Search Worker
 * Offloads fuzzy matching and ranking to a background thread to prevent
 * the main UI thread from dropping frames when searching large tables.
 */

export async function fuzzyFilterData(data: IPerson[], searchTerm: string): Promise<IPerson[]> {
  if (!searchTerm) return data

  const filtered = data.filter((row) => {
    // We concatenate all searchable fields, or just use rankItem directly.
    // rankItem usually takes a string. Since we are fuzzy filtering the whole row,
    // we need to check each value or a concatenated string.

    // In React Table, it usually checks all column values.
    const valuesToSearch = Object.values(row)
      .filter((val) => typeof val === 'string' || typeof val === 'number')
      .join(' ')

    const itemRank = rankItem(valuesToSearch, searchTerm)
    return itemRank.passed
  })

  return filtered
}

const searchService = {
  fuzzyFilterData,
}

export type SearchService = typeof searchService

comlink.expose(searchService)
