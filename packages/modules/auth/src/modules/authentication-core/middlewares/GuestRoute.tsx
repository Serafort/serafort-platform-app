import React, { Suspense, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Backdrop, CircularProgress } from '@mui/material'
import { isObjectEmpty, useAppStore, type LayoutOverride } from '@cap/platform-core'
import { useSessionGuard } from '../../session-manager/middlewares/useSessionGuard'
import { resolveRedirectPathForUser } from '../utils/resolveRedirect'

/** The session shapes seen in practice: flat, or wrapped as `{ user: { ... } }`. */
interface SessionUserShape {
  role?: string | number
  roleId?: string | number
  user?: { role?: string | number }
}

interface RedirectState {
  from?: { pathname?: string }
}

interface GuestRouteProps {
  element: ReactNode
  redirectTo?: string
  layout?: LayoutOverride
}

const GuestRoute = ({ element, redirectTo, layout = 'none' }: GuestRouteProps) => {
  const { isLoading, isAuthenticated, user } = useSessionGuard()
  const location = useLocation()
  const updateLayoutOverride = useAppStore((state) => state.updateLayoutOverride)

  React.useEffect(() => {
    if (layout !== 'none') {
      updateLayoutOverride(layout)
      return () => updateLayoutOverride('none')
    }
  }, [layout, updateLayoutOverride])

  if (isLoading) {
    return (
      <Backdrop open sx={{ bgcolor: 'background.default', zIndex: 1400 }}>
        <CircularProgress color='inherit' />
      </Backdrop>
    )
  }

  if (isAuthenticated && user && !isObjectEmpty(user)) {
    const sessionUser = user as unknown as SessionUserShape
    const userRole = sessionUser.role || sessionUser.roleId || sessionUser.user?.role
    const fallbackRedirect = redirectTo || resolveRedirectPathForUser(userRole)
    const from = (location.state as RedirectState | null)?.from?.pathname || fallbackRedirect
    return <Navigate to={from} replace state={{ from: location }} />
  }

  return (
    <Suspense
      fallback={
        <Backdrop open sx={{ bgcolor: 'background.default', zIndex: 1400 }}>
          <CircularProgress color='inherit' />
        </Backdrop>
      }
    >
      {element}
    </Suspense>
  )
}

export default GuestRoute
