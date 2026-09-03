import React, { ReactNode } from 'react'
import { PolicyAction, PolicyResource } from '../types/policy.types'
import { useCan } from '../hooks/useCan'

export interface CanProps {
  action: PolicyAction
  resource: PolicyResource
  /** Element(s) or render prop to display when action is permitted */
  children?: ReactNode | ((allowed: boolean) => ReactNode)
  /** Element to render when action is denied */
  fallback?: ReactNode
}

/**
 * Component-level guard for conditional UI rendering.
 */
export const Can: React.FC<CanProps> = ({
  action,
  resource,
  children,
  fallback = null,
}) => {
  const isAllowed = useCan(action, resource)

  if (typeof children === 'function') return <>{children(isAllowed)}</>

  if (isAllowed) return <>{children}</>

  return <>{fallback}</>
}
