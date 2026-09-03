import { describe, it, expect } from 'vitest'
import { isMatch, isPropertyDefined, converTimestampToDate } from '../Functions'

// ─── isMatch ─────────────────────────────────────────────────────────────────

describe('isMatch', () => {
  it('returns true when member property starts with query value (case-insensitive)', () => {
    const member = { name: 'Alice', city: 'Paris' }
    const query = [{ property: 'name', value: 'ali' }]
    expect(isMatch(member, query)).toBe(true)
  })

  it('returns true on exact match', () => {
    const member = { email: 'test@example.com' }
    const query = [{ property: 'email', value: 'test@example.com' }]
    expect(isMatch(member, query)).toBe(true)
  })

  it('returns false when no property starts with the query value', () => {
    const member = { name: 'Alice' }
    const query = [{ property: 'name', value: 'Bob' }]
    expect(isMatch(member, query)).toBe(false)
  })

  it('returns false when value is in the middle but not at start', () => {
    const member = { name: 'Alice' }
    const query = [{ property: 'name', value: 'ice' }]
    expect(isMatch(member, query)).toBe(false)
  })

  it('returns true when at least one query item matches', () => {
    const member = { name: 'Alice', role: 'admin' }
    const query = [
      { property: 'name', value: 'Bob' },
      { property: 'role', value: 'adm' },
    ]
    expect(isMatch(member, query)).toBe(true)
  })

  it('returns false when member is undefined', () => {
    expect(isMatch(undefined as any, [{ property: 'name', value: 'Alice' }])).toBe(false)
  })

  it('returns false when query is undefined', () => {
    expect(isMatch({ name: 'Alice' }, undefined as any)).toBe(false)
  })

  it('returns false for empty query array', () => {
    expect(isMatch({ name: 'Alice' }, [])).toBe(false)
  })
})

// ─── isPropertyDefined ───────────────────────────────────────────────────────

describe('isPropertyDefined', () => {
  it('returns true for an existing own property', () => {
    expect(isPropertyDefined({ name: 'Alice', age: 30 }, 'name')).toBe(true)
  })

  it('returns true for a property with a falsy value', () => {
    expect(isPropertyDefined({ active: false }, 'active')).toBe(true)
  })

  it('returns true for a property set to null', () => {
    expect(isPropertyDefined({ data: null }, 'data')).toBe(true)
  })

  it('returns false when the property does not exist', () => {
    expect(isPropertyDefined({ name: 'Alice' }, 'email')).toBe(false)
  })

  it('returns false on an empty object', () => {
    expect(isPropertyDefined({}, 'anything')).toBe(false)
  })
})

// ─── converTimestampToDate ───────────────────────────────────────────────────

describe('converTimestampToDate', () => {
  it('converts a Firestore-style timestamp (seconds) to a JS Date', () => {
    const ts = { seconds: 1_000_000 }
    const result = converTimestampToDate(ts)
    expect(result).toBeInstanceOf(Date)
    expect(result.getTime()).toBe(1_000_000 * 1000)
  })

  it('returns epoch (1970-01-01) for seconds = 0', () => {
    const result = converTimestampToDate({ seconds: 0 })
    expect(result.toISOString()).toBe('1970-01-01T00:00:00.000Z')
  })

  it('handles large timestamps (year 2025+)', () => {
    // 2025-01-01T00:00:00.000Z = 1735689600
    const result = converTimestampToDate({ seconds: 1_735_689_600 })
    expect(result.getFullYear()).toBe(2025)
  })
})
