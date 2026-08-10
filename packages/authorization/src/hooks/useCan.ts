import { PolicyAction, PolicyResource, PolicyEffectEnum } from '../types/policy.types'
import { usePolicy } from './usePolicy'

/**
 * Returns boolean indication of whether the current user can perform an action on a resource.
 */
export function useCan(action: PolicyAction, resource: PolicyResource): boolean {
  const decision = usePolicy(action, resource)
  return decision.effect === PolicyEffectEnum.ALLOW
}
