import { describe, it, expect } from 'vitest'
import { buildSubject } from '../subject/buildSubject'

describe('buildSubject', () => {
  it('returns null for null/undefined input', () => {
    expect(buildSubject(null)).toBeNull()
    expect(buildSubject(undefined)).toBeNull()
  })

  it('normalizes simple user object', () => {
    const rawUser = {
      id: 123,
      email: 'user@example.com',
      role: 'admin',
      permissions: ['read', 'write'],
      organizationId: 5,
    }

    const subject = buildSubject(rawUser)
    expect(subject).not.toBeNull()
    expect(subject?.id).toBe(123)
    expect(subject?.roles).toContain('admin')
    expect(subject?.permissions).toEqual(['read', 'write'])
    expect(subject?.attributes.orgId).toBe(5)
  })

  it('handles nested user payload structure (user.user)', () => {
    const nested = {
      user: {
        id: 'usr_abc',
        email: 'test@test.com',
        roleName: 'super_admin',
        permissions: ['*'],
      },
    }

    const subject = buildSubject(nested)
    expect(subject?.id).toBe('usr_abc')
    expect(subject?.roles).toContain('super_admin')
  })
})
