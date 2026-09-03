import { describe, it, expect } from 'vitest'
import Filters from './Filters'
import type { ITableData } from '@cap/shared-types'

// Minimal dataset used across tests
const makeData = (): ITableData => ({
  header: [{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }],
  rows: [
    { id: 1, firstname: 'Alice', phone: '', name: 'Alice', email: 'alice@example.com' },
    { id: 2, firstname: 'Bob', phone: '', name: 'Bob', email: 'bob@example.com' },
    { id: 3, firstname: 'Charlie', phone: '', name: 'Charlie', email: 'charlie@example.com' },
  ],
})

describe('Filters.search — string query', () => {
  it('returns all rows when query is an empty string', () => {
    const data = makeData()
    expect(Filters.search(data, '').rows).toHaveLength(3)
  })

  it('returns all rows when query is only whitespace', () => {
    const data = makeData()
    expect(Filters.search(data, '   ').rows).toHaveLength(3)
  })

  it('filters rows by string match across all columns', () => {
    const data = makeData()
    const result = Filters.search(data, 'alice')
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].name).toBe('Alice')
  })

  it('is case-insensitive', () => {
    const data = makeData()
    expect(Filters.search(data, 'ALICE').rows).toHaveLength(1)
  })

  it('returns empty rows when no match', () => {
    const data = makeData()
    expect(Filters.search(data, 'xyz123').rows).toHaveLength(0)
  })

  it('matches across multiple rows when term is shared', () => {
    const data = makeData()
    // 'example.com' appears in all three email fields
    expect(Filters.search(data, 'example.com').rows).toHaveLength(3)
  })

  it('preserves header and original shape', () => {
    const data = makeData()
    const result = Filters.search(data, 'Alice')
    expect(result.header).toEqual(data.header)
  })
})

describe('Filters.search — object query (IQuery)', () => {
  it('returns all rows when value is empty string', () => {
    const data = makeData()
    const result = Filters.search(data, { value: '', columns: ['name'] })
    expect(result.rows).toHaveLength(3)
  })

  it('returns all rows when value is undefined', () => {
    const data = makeData()
    const result = Filters.search(data, { value: undefined as any, columns: ['name'] })
    expect(result.rows).toHaveLength(3)
  })

  it('filters by specific column only', () => {
    const data = makeData()
    // 'alice' is in the name column
    const result = Filters.search(data, { value: 'alice', columns: ['name'] })
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].name).toBe('Alice')
  })

  it('does not match columns not included in the column list', () => {
    const data = makeData()
    // email has 'alice@example.com' but we only search 'name'
    const result = Filters.search(data, { value: '@example.com', columns: ['name'] })
    expect(result.rows).toHaveLength(0)
  })

  it('returns empty when rows is not an array', () => {
    const badData = { header: [], rows: null } as any
    const result = Filters.search(badData, 'anything')
    expect(result).toEqual(badData)
  })
})
