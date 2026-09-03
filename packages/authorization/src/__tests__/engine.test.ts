import { describe, it, expect, beforeEach } from 'vitest'
import { PolicyEngine } from '../engine/engine'
import { PolicySubject, PolicyResource, PolicySet } from '../types/policy.types'

describe('PolicyEngine', () => {
  let engine: PolicyEngine

  const userSubject: PolicySubject = {
    id: 'user-1',
    roles: ['user'],
    permissions: ['read:docs'],
    attributes: { orgId: 10 },
  }

  const adminSubject: PolicySubject = {
    id: 'admin-1',
    roles: ['admin'],
    permissions: ['*'],
    attributes: { orgId: 10 },
  }

  const docResource: PolicyResource = {
    type: 'document',
    id: 'doc-100',
    attributes: { ownerId: 'user-1', orgId: 10 },
  }

  beforeEach(() => {
    engine = new PolicyEngine()
  })

  it('default effect is deny when no policy set loaded or matching', () => {
    const decision = engine.evaluate({
      subject: userSubject,
      resource: docResource,
      action: 'read',
    })
    expect(decision.effect).toBe('deny')
  })

  it('allows action based on role rule', () => {
    const policySet: PolicySet = {
      version: '1.0.0',
      defaultEffect: 'deny',
      policies: [
        {
          id: 'user-docs-policy',
          rules: [
            {
              effect: 'allow',
              roles: ['user'],
              actions: ['read'],
              resources: ['document'],
            },
          ],
        },
      ],
    }
    engine.setPolicySet(policySet)

    const decision = engine.evaluate({
      subject: userSubject,
      resource: docResource,
      action: 'read',
    })
    expect(decision.effect).toBe('allow')
    expect(engine.can(userSubject, 'read', docResource)).toBe(true)
  })

  it('evaluates ABAC condition (owns)', () => {
    const policySet: PolicySet = {
      version: '1.0.0',
      defaultEffect: 'deny',
      policies: [
        {
          id: 'owner-policy',
          rules: [
            {
              effect: 'allow',
              actions: ['delete'],
              resources: ['document'],
              condition: { id: 'owns' },
            },
          ],
        },
      ],
    }
    engine.setPolicySet(policySet)

    // user-1 owns doc-100
    expect(engine.can(userSubject, 'delete', docResource)).toBe(true)

    // user-2 does not own doc-100
    const otherUser: PolicySubject = {
      id: 'user-2',
      roles: ['user'],
      permissions: [],
      attributes: {},
    }
    expect(engine.can(otherUser, 'delete', docResource)).toBe(false)
  })

  it('deny rule overrides allow rule at same priority', () => {
    const policySet: PolicySet = {
      version: '1.0.0',
      defaultEffect: 'deny',
      policies: [
        {
          id: 'conflicting-policy',
          rules: [
            {
              effect: 'allow',
              roles: ['user'],
              actions: ['read'],
              priority: 1,
            },
            {
              effect: 'deny',
              roles: ['user'],
              actions: ['read'],
              priority: 1,
            },
          ],
        },
      ],
    }
    engine.setPolicySet(policySet)

    const decision = engine.evaluate({
      subject: userSubject,
      resource: docResource,
      action: 'read',
    })
    expect(decision.effect).toBe('deny')
  })

  it('merges policies correctly', () => {
    engine.setPolicySet({
      version: '1.0.0',
      defaultEffect: 'deny',
      policies: [],
    })

    engine.mergePolicies([
      {
        id: 'p1',
        rules: [{ effect: 'allow', roles: ['admin'] }],
      },
    ])

    expect(engine.can(adminSubject, 'access', docResource)).toBe(true)
  })
})
