import { describe, it, expect } from 'vitest'
import { PolicyGraphCompiler } from '../engine/PolicyGraphCompiler'
import { POLICY_CANVAS_TEMPLATES } from '../policies/policyTemplates'
import type { VisualPolicyGraph } from '../types/graphTypes'

describe('PolicyGraphCompiler', () => {
  it('compiles multi-tenant isolation template into a valid PolicySet', () => {
    const template = POLICY_CANVAS_TEMPLATES.find(
      (t) => t.id === 'template-multi-tenant-isolation'
    )
    expect(template).toBeDefined()

    const compiled = PolicyGraphCompiler.compileGraphToPolicySet(template!)
    expect(compiled.policies.length).toBe(1)
    expect(compiled.policies[0].rules.length).toBeGreaterThan(0)

    const rule = compiled.policies[0].rules[0]
    expect(rule.roles).toContain('member')
    expect(rule.effect).toBe('allow')
    expect(rule.condition?.id).toBe('sameOrg')
  })

  it('decompiles a PolicySet back into a 5-tier VisualPolicyGraph layout', () => {
    const template = POLICY_CANVAS_TEMPLATES[0]
    const compiled = PolicyGraphCompiler.compileGraphToPolicySet(template)
    const decompiled = PolicyGraphCompiler.decompilePolicySetToGraph(compiled)

    expect(decompiled.nodes.length).toBeGreaterThan(0)
    expect(decompiled.edges.length).toBeGreaterThan(0)
    expect(decompiled.nodes.some((n) => n.type === 'subject')).toBe(true)
    expect(decompiled.nodes.some((n) => n.type === 'decision')).toBe(true)
  })

  it('simulates matching subject and highlights active path with ALLOW', () => {
    const template = POLICY_CANVAS_TEMPLATES.find(
      (t) => t.id === 'template-multi-tenant-isolation'
    )!

    const result = PolicyGraphCompiler.simulateGraph(template, {
      subject: {
        id: 'usr-1',
        roles: ['member'],
        permissions: [],
        attributes: { orgId: 'org-acme' },
      },
      action: 'read',
      resource: {
        type: 'document',
        attributes: { orgId: 'org-acme' },
      },
    })

    expect(result.effect).toBe('allow')
    expect(result.activeNodeIds.length).toBeGreaterThan(0)
    expect(result.activeEdgeIds.length).toBeGreaterThan(0)
    expect(result.stepTraces.some((t) => t.status === 'pass')).toBe(true)
  })

  it('simulates cross-tenant access and returns DENY on condition failure', () => {
    const template = POLICY_CANVAS_TEMPLATES.find(
      (t) => t.id === 'template-multi-tenant-isolation'
    )!

    const result = PolicyGraphCompiler.simulateGraph(template, {
      subject: {
        id: 'usr-1',
        roles: ['member'],
        permissions: [],
        attributes: { orgId: 'org-acme' },
      },
      action: 'read',
      resource: {
        type: 'document',
        attributes: { orgId: 'org-competitor' },
      },
    })

    expect(result.effect).toBe('deny')
  })

  it('validates graph topology accurately', () => {
    const validResult = PolicyGraphCompiler.validateGraph(POLICY_CANVAS_TEMPLATES[0])
    expect(validResult.isValid).toBe(true)
    expect(validResult.errors.length).toBe(0)

    const emptyGraph: VisualPolicyGraph = {
      id: 'empty',
      name: 'Empty Graph',
      version: '1.0.0',
      defaultEffect: 'deny',
      combiningAlgorithm: 'deny-overrides',
      nodes: [],
      edges: [],
    }

    const invalidResult = PolicyGraphCompiler.validateGraph(emptyGraph)
    expect(invalidResult.isValid).toBe(false)
    expect(invalidResult.errors.length).toBeGreaterThan(0)
  })
})
