import React, { ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { PolicyAction, PolicyResource } from '../types/policy.types'
import { useCan } from '../hooks/useCan'

export interface RouteGuardProps {
  action: PolicyAction
  resource: PolicyResource
  /** Element to render if authorized (defaults to <Outlet /> or children) */
  children?: ReactNode
  /** Element to render on deny (defaults to <Navigate to="/403" replace />) */
  fallback?: ReactNode
}

/**
 * Enforces policy authorization at the Route level.
 */
export const RouteGuard: React.FC<RouteGuardProps> = ({
  action,
  resource,
  children,
  fallback = <Navigate to="/403" replace />,
}) => {
  const isAllowed = useCan(action, resource)

  if (!isAllowed) return <>{fallback}</>

  return <>{children ?? <Outlet />}</>
}
