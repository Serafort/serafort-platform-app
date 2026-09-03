import { describe, it, expect } from 'vitest'
import {
  API_CONTRACTS,
  type API_CONTRACTS as API_CONTRACTS_TYPE,
} from './contracts'
import { ENDPOINTS } from './endpoints'
import { contractType, resolveContractPath, type EndpointContract, type HttpMethod } from './types/endpoint-contract'

const VALID_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

interface ContractLeaf {
  id: string
  method: HttpMethod
  resolve: (...args: unknown[]) => string
}

function collectContracts(value: unknown, acc: ContractLeaf[] = []): ContractLeaf[] {
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (
      typeof record.id === 'string' &&
      typeof record.method === 'string' &&
      typeof record.resolve === 'function'
    ) {
      acc.push(record as unknown as ContractLeaf)
      return acc
    }
    for (const child of Object.values(record)) {
      collectContracts(child, acc)
    }
  }
  return acc
}

function endpointBySegments(segments: string[]): unknown {
  let current: unknown = ENDPOINTS
  for (const segment of segments) {
    if (current === null || typeof current !== 'object') {
      return undefined
    }
    const record = current as Record<string, unknown>
    if (!(segment in record)) {
      return undefined
    }
    current = record[segment]
  }
  return current
}

describe('API_CONTRACTS registry', () => {
  const contracts = collectContracts(API_CONTRACTS)

  it('exposes a non-empty set of contracts', () => {
    expect(contracts.length).toBeGreaterThan(0)
  })

  it('gives every contract a stable, non-empty id', () => {
    for (const contract of contracts) {
      expect(typeof contract.id).toBe('string')
      expect(contract.id.length).toBeGreaterThan(0)
      expect(contract.id).toMatch(/^[a-zA-Z0-9.]+$/)
    }
  })

  it('gives every contract a supported HTTP method', () => {
    for (const contract of contracts) {
      expect(VALID_METHODS, `contract "${contract.id}" uses method ${contract.method}`).toContain(
        contract.method,
      )
    }
  })

  it('keeps contract ids unique across the whole registry', () => {
    const ids = contracts.map((c) => c.id)
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
    expect(duplicates).toEqual([])
  })

  it('resolves every contract to a well-formed path', () => {
    for (const contract of contracts) {
      const placeholders = Array.from({ length: contract.resolve.length }, (_, i) => i)
      const path = contract.resolve(...placeholders)
      expect(typeof path, `contract "${contract.id}" resolve should return a string`).toBe('string')
      expect(path, `contract "${contract.id}" path "${path}" should start with "/"`).toMatch(
        /^\//,
      )
      expect(path, `contract "${contract.id}" path should not contain "//"`).not.toContain('//')
    }
  })

  it('resolves every contract path from its matching ENDPOINTS entry (no drift)', () => {
    for (const contract of contracts) {
      const endpointLeaf = endpointBySegments(contract.id.split('.'))
      if (endpointLeaf === undefined) {
        continue
      }
      const placeholders = Array.from(
        { length: Math.max(contract.resolve.length, typeof endpointLeaf === 'function' ? (endpointLeaf as () => unknown).length : 0) },
        (_, i) => i,
      )
      const resolved = contract.resolve(...placeholders)
      const expected =
        typeof endpointLeaf === 'function'
          ? (endpointLeaf as (...args: unknown[]) => string)(...placeholders)
          : endpointLeaf
      expect(resolved, `contract "${contract.id}" drifts from ENDPOINTS entry`).toBe(expected)
    }
  })

  describe('resolveContractPath helper', () => {
    it('returns the same path as calling resolve directly', () => {
      const looseResolve = resolveContractPath as (c: EndpointContract, ...args: unknown[]) => string
      for (const contract of contracts) {
        const placeholders = Array.from({ length: contract.resolve.length }, (_, i) => i)
        const viaHelper = looseResolve(contract as EndpointContract, ...placeholders)
        expect(viaHelper).toBe(contract.resolve(...placeholders))
      }
    })
  })

  describe('contractType marker', () => {
    it('produces no runtime value (type-only marker)', () => {
      expect(contractType<{ id: number }>()).toBeUndefined()
    })
  })

  describe('admin additions', () => {
    it('binds adminMembers.overrides to the ENDPOINTS path', () => {
      expect(API_CONTRACTS.adminMembers.overrides.resolve(5)).toBe(
        ENDPOINTS.adminMembers.overrides(5),
      )
      expect(API_CONTRACTS.adminMembers.addOverride.resolve(5)).toBe(
        ENDPOINTS.adminMembers.addOverride(5),
      )
      expect(API_CONTRACTS.adminMembers.removeOverride.resolve(5, 9)).toBe(
        ENDPOINTS.adminMembers.removeOverride(5, 9),
      )
    })

    it('binds admin.organizations domains endpoints to the ENDPOINTS paths', () => {
      expect(API_CONTRACTS.admin.organizations.domains.resolve(5)).toBe(
        ENDPOINTS.admin.organizations.domains(5),
      )
      expect(API_CONTRACTS.admin.organizations.domainsCheck.resolve(5, 9)).toBe(
        ENDPOINTS.admin.organizations.domainsCheck(5, 9),
      )
    })

    it('binds admin.scim.test and admin.ssf.history to the ENDPOINTS paths', () => {
      expect(API_CONTRACTS.admin.scim.test.resolve()).toBe(ENDPOINTS.admin.scim.test)
      expect(API_CONTRACTS.admin.ssf.history.resolve()).toBe(ENDPOINTS.admin.ssf.history)
    })
  })

  it('exposes a type export for the contract registry', () => {
    const registryType: API_CONTRACTS_TYPE = API_CONTRACTS
    expect(registryType).toBe(API_CONTRACTS)
  })
})
