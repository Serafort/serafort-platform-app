import {
  Policy,
  PolicyAction,
  PolicyDecision,
  PolicyEvaluationContext,
  PolicyResource,
  PolicyRule,
  PolicySet,
  PolicySubject,
} from '../types/policy.types'
import { getCondition } from './conditions'

export class PolicyEngine {
  private policySet: PolicySet = {
    version: '1.0.0',
    policies: [],
    defaultEffect: 'deny',
  }

  constructor(initialPolicySet?: PolicySet) {
    if (initialPolicySet) {
      this.policySet = initialPolicySet
    }
  }

  /**
   * Set or overwrite the active policy set.
   */
  public setPolicySet(policySet: PolicySet): void {
    this.policySet = policySet
  }

  /**
   * Additively merge new policies into the active policy set.
   */
  public mergePolicies(policies: Policy[]): void {
    const existingIds = new Set(this.policySet.policies.map((p) => p.id))
    for (const policy of policies) {
      if (existingIds.has(policy.id)) {
        // Replace existing policy definition
        this.policySet.policies = this.policySet.policies.map((p) =>
          p.id === policy.id ? policy : p
        )
      } else {
        this.policySet.policies.push(policy)
        existingIds.add(policy.id)
      }
    }
  }

  /**
   * Returns the active policy set.
   */
  public getPolicySet(): PolicySet {
    return this.policySet
  }

  /**
   * Evaluates a decision context against all rules in the active policy set.
   */
  public evaluate(context: PolicyEvaluationContext): PolicyDecision {
    const { subject, resource, action } = context

    if (!subject) {
      return { effect: 'deny', reason: 'No subject provided' }
    }

    interface MatchCandidate {
      policyId: string
      ruleIndex: number
      rule: PolicyRule
    }

    const matchingCandidates: MatchCandidate[] = []

    for (const policy of this.policySet.policies) {
      for (let i = 0; i < policy.rules.length; i++) {
        const rule = policy.rules[i]

        if (!this.matchesAction(rule, action)) continue
        if (!this.matchesResource(rule, resource)) continue
        if (!this.matchesRoleOrPermission(rule, subject)) continue
        if (!this.matchesCondition(rule, subject, resource)) continue

        matchingCandidates.push({
          policyId: policy.id,
          ruleIndex: i,
          rule,
        })
      }
    }

    if (matchingCandidates.length === 0) {
      return {
        effect: this.policySet.defaultEffect,
        reason: `No policy rule matched. Defaulting to ${this.policySet.defaultEffect}`,
      }
    }

    // Sort matching rules by priority descending.
    // If priorities are equal, 'deny' takes precedence over 'allow'.
    matchingCandidates.sort((a, b) => {
      const prioA = a.rule.priority ?? 0
      const prioB = b.rule.priority ?? 0

      if (prioA !== prioB) {
        return prioB - prioA
      }

      if (a.rule.effect === 'deny' && b.rule.effect === 'allow') return -1
      if (a.rule.effect === 'allow' && b.rule.effect === 'deny') return 1

      return 0
    })

    const winningCandidate = matchingCandidates[0]

    return {
      effect: winningCandidate.rule.effect,
      matchedPolicyId: winningCandidate.policyId,
      matchedRuleIndex: winningCandidate.ruleIndex,
      reason: `Matched rule in policy '${winningCandidate.policyId}' with effect '${winningCandidate.rule.effect}'`,
    }
  }

  /**
   * Boolean shorthand method for policy checks.
   */
  public can(subject: PolicySubject | null, action: PolicyAction, resource: PolicyResource): boolean {
    if (!subject) return false
    const decision = this.evaluate({ subject, resource, action })
    return decision.effect === 'allow'
  }

  private matchesAction(rule: PolicyRule, action: PolicyAction): boolean {
    if (!rule.actions || rule.actions.length === 0) return true
    return rule.actions.includes(action) || rule.actions.includes('*')
  }

  private matchesResource(rule: PolicyRule, resource: PolicyResource): boolean {
    if (!rule.resources || rule.resources.length === 0) return true
    return rule.resources.includes(resource.type) || rule.resources.includes('*')
  }

  private matchesRoleOrPermission(rule: PolicyRule, subject: PolicySubject): boolean {
    const hasRoleRequirement = rule.roles && rule.roles.length > 0
    const hasPermRequirement = rule.permissions && rule.permissions.length > 0

    if (!hasRoleRequirement && !hasPermRequirement) {
      return true
    }

    let roleMatched = false
    if (hasRoleRequirement) {
      roleMatched = rule.roles!.some((role) => subject.roles.includes(role) || subject.roles.includes('super_admin'))
    }

    let permMatched = false
    if (hasPermRequirement) {
      permMatched = rule.permissions!.some((perm) => subject.permissions.includes(perm))
    }

    if (hasRoleRequirement && hasPermRequirement) {
      return roleMatched && permMatched
    }

    return roleMatched || permMatched
  }

  private matchesCondition(
    rule: PolicyRule,
    subject: PolicySubject,
    resource: PolicyResource
  ): boolean {
    if (!rule.condition) return true

    const evaluator = getCondition(rule.condition.id)
    if (!evaluator) {
      if (import.meta.env?.DEV) console.warn(`[PolicyEngine] Condition evaluator '${rule.condition.id}' not found. Defaulting to false.`)
      return false
    }

    return evaluator(subject, resource, rule.condition.args)
  }
}

export const policyEngine = new PolicyEngine()
