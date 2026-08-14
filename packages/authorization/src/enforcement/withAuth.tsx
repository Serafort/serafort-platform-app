import React, { ComponentType } from 'react'
import { PolicyAction, PolicyResource } from '../types/policy.types'
import { useCan } from '../hooks/useCan'

/**
 * Higher-Order Component (HOC) wrapper to enforce policy checks.
 */
export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  action: PolicyAction,
  resource: PolicyResource,
  FallbackComponent: ComponentType<P> | null = null
): ComponentType<P> {
  const ComponentWithAuth: React.FC<P> = (props: P) => {
    const isAllowed = useCan(action, resource)

    if (!isAllowed) {
      if (FallbackComponent) return <FallbackComponent {...props} />
      return null
    }

    return <WrappedComponent {...props} />
  }

  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component'
  ComponentWithAuth.displayName = `WithAuth(${displayName})`

  return ComponentWithAuth
}
