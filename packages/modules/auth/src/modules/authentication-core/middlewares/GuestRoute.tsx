import React, { Suspense, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Backdrop, CircularProgress } from '@mui/material'
import { isObjectEmpty, useAppStore, type LayoutOverride } from '@cap/platform-core'
import { useSessionGuard } from '../../session-manager/middlewares/useSessionGuard'

interface GuestRouteProps {
  element: ReactNode
  redirectTo?: string
  layout?: LayoutOverride
}

const GuestRoute = ({ element, redirectTo = '/dashboard', layout = 'none' }: GuestRouteProps) => {
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
      <Backdrop open style={{ background: '#FFF', zIndex: 1400 }}>
        <CircularProgress color='inherit' />
      </Backdrop>
    )
  }

  if (isAuthenticated && user && !isObjectEmpty(user)) {
    const from = (location.state as any)?.from?.pathname || redirectTo
    return <Navigate to={from} replace state={{ from: location }} />
  }

  return (
    <Suspense
      fallback={
        <Backdrop open style={{ background: '#FFF', zIndex: 1400 }}>
          <CircularProgress color='inherit' />
        </Backdrop>
      }
    >
      {element}
    </Suspense>
  )
}

export default GuestRoute
