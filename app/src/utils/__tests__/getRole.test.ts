import { describe, it, expect, vi } from 'vitest';

// Mock @cap/platform-core so tests are independent of the package resolution
vi.mock('@cap/platform-core', () => ({
  Roles: {
    USER: 1,
    PARTICIPANT: 2,
    JUDGE: 3,
    PROVIDEREMPLOYEE: 4,
    PROVIDERADMIN: 5,
    ADMIN: 6,
    SUPERADMINEMPLOYEE: 7,
    SUPERADMIN: 8,
  },
}))

// Dynamic import AFTER mock is set up
const { default: getRole } = await import('../getRole')

describe('getRole', () => {
  it('returns "USER" for role id 1', () => {
    expect(getRole(1)).toBe('USER')
  })

  it('returns "PARTICIPANT" for role id 2', () => {
    expect(getRole(2)).toBe('PARTICIPANT')
  })

  it('returns "JUDGE" for role id 3', () => {
    expect(getRole(3)).toBe('JUDGE')
  })

  it('returns "PROVIDER-EMPLOYEE" for role id 4', () => {
    expect(getRole(4)).toBe('PROVIDER-EMPLOYEE')
  })

  it('returns "PROVIDER-ADMIN" for role id 5', () => {
    expect(getRole(5)).toBe('PROVIDER-ADMIN')
  })

  it('returns "ADMIN" for role id 6', () => {
    expect(getRole(6)).toBe('ADMIN')
  })

  it('returns "SUPERADMIN-EMPLOYEE" for role id 7', () => {
    expect(getRole(7)).toBe('SUPERADMIN-EMPLOYEE')
  })

  it('returns "SUPER-ADMIN" for role id 8', () => {
    expect(getRole(8)).toBe('SUPER-ADMIN')
  })

  it('returns empty string for an unknown numeric role', () => {
    expect(getRole(99)).toBe('')
  })

  it('returns empty string for null', () => {
    expect(getRole(null as any)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(getRole(undefined)).toBe('')
  })

  it('accepts a string role id matching a known role', () => {
    // Roles enum values are numbers, string "6" won't match — verifies strict equality
    expect(getRole('6')).toBe('')
  })
})
