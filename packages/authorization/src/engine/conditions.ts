import { ConditionEvaluator, PolicySubject, PolicyResource } from '../types/policy.types'

const conditionRegistry = new Map<string, ConditionEvaluator>()

/**
 * Register a custom condition evaluator for ABAC rules.
 */
export function registerCondition(id: string, evaluator: ConditionEvaluator): void {
  conditionRegistry.set(id, evaluator)
}

/**
 * Retrieve a registered condition evaluator.
 */
export function getCondition(id: string): ConditionEvaluator | undefined {
  return conditionRegistry.get(id)
}

// Register built-in condition evaluators
registerCondition('owns', (subject: PolicySubject, resource: PolicyResource) => {
  if (!resource.attributes) return false
  const ownerId = resource.attributes.ownerId ?? resource.attributes.userId ?? resource.attributes.createdBy
  return String(subject.id) === String(ownerId)
})

registerCondition('sameOrg', (subject: PolicySubject, resource: PolicyResource) => {
  if (!resource.attributes) return false
  const subjectOrg = subject.attributes.orgId ?? subject.attributes.organizationId
  const resourceOrg = resource.attributes.orgId ?? resource.attributes.organizationId
  if (subjectOrg === undefined || resourceOrg === undefined) return false
  return String(subjectOrg) === String(resourceOrg)
})

registerCondition('always', () => true)
registerCondition('never', () => false)

// Role & Rank evaluation conditions
const ROLE_RANK: Record<string, number> = {
  user: 10,
  participant: 10,
  judge: 20,
  moderator: 30,
  provider_employee: 40,
  provider_admin: 50,
  admin: 50,
  super_admin_employee: 80,
  super_admin: 100,
}

registerCondition('hasMinimumRole', (subject: PolicySubject, resource: PolicyResource) => {
  const minimumRole = resource.attributes?.minimumRole
  if (!minimumRole) return true

  const normalizedMin = String(minimumRole).toLowerCase().replace(/[\s-]+/g, '_')
  const minRank = ROLE_RANK[normalizedMin] ?? 0

  const userRanks = subject.roles.map((r) => ROLE_RANK[String(r).toLowerCase().replace(/[\s-]+/g, '_')] ?? 0)
  const maxUserRank = Math.max(0, ...userRanks)

  return maxUserRank >= minRank
})

registerCondition('lacksMinimumRole', (subject: PolicySubject, resource: PolicyResource) => {
  const minimumRole = resource.attributes?.minimumRole
  if (!minimumRole) return false

  const normalizedMin = String(minimumRole).toLowerCase().replace(/[\s-]+/g, '_')
  const minRank = ROLE_RANK[normalizedMin] ?? 0

  const userRanks = subject.roles.map((r) => ROLE_RANK[String(r).toLowerCase().replace(/[\s-]+/g, '_')] ?? 0)
  const maxUserRank = Math.max(0, ...userRanks)

  return maxUserRank < minRank
})

registerCondition('hasAllowedRoles', (subject: PolicySubject, resource: PolicyResource) => {
  const allowedRoles = resource.attributes?.allowedRoles as unknown[] | undefined
  if (!allowedRoles || allowedRoles.length === 0) return true

  const normalizedAllowed = allowedRoles.map((r) => String(r).toLowerCase().replace(/[\s-]+/g, '_'))
  return subject.roles.some((r) => normalizedAllowed.includes(String(r).toLowerCase().replace(/[\s-]+/g, '_')))
})

registerCondition('lacksAllowedRoles', (subject: PolicySubject, resource: PolicyResource) => {
  const allowedRoles = resource.attributes?.allowedRoles as unknown[] | undefined
  if (!allowedRoles || allowedRoles.length === 0) return false

  const normalizedAllowed = allowedRoles.map((r) => String(r).toLowerCase().replace(/[\s-]+/g, '_'))
  return !subject.roles.some((r) => normalizedAllowed.includes(String(r).toLowerCase().replace(/[\s-]+/g, '_')))
})

