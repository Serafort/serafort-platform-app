import { describe, it, expect } from 'vitest'
import { API_ENDPOINTS, API_QUERY_KEYS, ENDPOINTS, QUERY_KEYS } from './endpoints'

function collectLeafValues(value: unknown, acc: unknown[] = []): unknown[] {
  if (typeof value === 'string' || typeof value === 'function') {
    acc.push(value)
    return acc
  }
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value)) {
      collectLeafValues(child, acc)
    }
  }
  return acc
}

function collectQueryKeys(value: unknown, acc: unknown[] = []): unknown[] {
  if (Array.isArray(value)) {
    acc.push(value)
    return acc
  }
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value)) {
      collectQueryKeys(child, acc)
    }
  }
  return acc
}

describe('API_ENDPOINTS registry', () => {
  it('exposes the ENDPOINTS alias pointing at the same object', () => {
    expect(ENDPOINTS).toBe(API_ENDPOINTS)
    expect(QUERY_KEYS).toBe(API_QUERY_KEYS)
  })

  it('keeps every string path as a well-formed absolute path', () => {
    const strings = collectLeafValues(API_ENDPOINTS).filter(
      (v): v is string => typeof v === 'string',
    )
    expect(strings.length).toBeGreaterThan(0)

    for (const path of strings) {
      expect(path, `path "${path}" should start with "/"`).toMatch(/^\//)
      expect(path, `path "${path}" should not contain a double slash`).not.toContain('//')
      if (path !== '/') {
        expect(path, `path "${path}" should not end with a slash`).not.toMatch(/\/$/)
      }
    }
  })

  it('keeps every dynamic builder producing a well-formed path', () => {
    const fns = collectLeafValues(API_ENDPOINTS).filter((v): v is (...a: unknown[]) => unknown =>
      typeof v === 'function',
    )
    expect(fns.length).toBeGreaterThan(0)

    for (const fn of fns) {
      const placeholders = Array.from({ length: fn.length }, (_, i) => i)
      const path = fn(...placeholders) as string
      expect(typeof path).toBe('string')
      expect(path).toMatch(/^\//)
      expect(path).not.toContain('//')
      expect(path).not.toMatch(/\/$/)
    }
  })

  it('keeps every query key as a non-empty array of strings', () => {
    const keys = collectQueryKeys(API_QUERY_KEYS)
    expect(keys.length).toBeGreaterThan(0)

    for (const key of keys) {
      expect(Array.isArray(key)).toBe(true)
      expect((key as unknown[]).length).toBeGreaterThan(0)
      for (const part of key as string[]) {
        expect(typeof part).toBe('string')
      }
    }
  })

  describe('admin registry additions', () => {
    it('exposes the adminMembers overrides group', () => {
      expect(ENDPOINTS.adminMembers.overrides(5)).toBe('/api/admin/members/5/overrides')
      expect(ENDPOINTS.adminMembers.addOverride(5)).toBe('/api/admin/members/5/overrides')
      expect(ENDPOINTS.adminMembers.removeOverride(5, 9)).toBe(
        '/api/admin/members/5/overrides/9',
      )
    })

    it('exposes the organization domains endpoints', () => {
      expect(ENDPOINTS.admin.organizations.domains(5)).toBe(
        '/api/admin/organizations/5/domains',
      )
      expect(ENDPOINTS.admin.organizations.domainsCheck(5, 9)).toBe(
        '/api/admin/organizations/5/domains/9/check',
      )
    })

    it('exposes the scim test endpoint', () => {
      expect(ENDPOINTS.admin.scim.test).toBe('/api/admin/scim/test')
    })

    it('exposes the ssf history endpoint', () => {
      expect(ENDPOINTS.admin.ssf.history).toBe('/api/admin/ssf/history')
    })
  })
})
