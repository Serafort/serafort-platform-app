import React, { Suspense, type ReactNode } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Backdrop, CircularProgress, Alert, Box, Button } from '@mui/material'
import { useAppStore, type LayoutOverride } from '@cap/platform-core'
import { useSessionGuard } from '../../session-manager/middlewares/useSessionGuard'
import { Path } from '@auth/routes/path'
import { normalizeAuthUser } from '../utils/normalizeAuthUser'
import { useCan } from '@cap/authorization'

interface AuthRouteProps {
  element: ReactNode
  allowedRoles?: any[]
  requiresVerification?: boolean
  layout?: LayoutOverride
}

const AuthRoute = ({
  element,
  allowedRoles,
  requiresVerification = false,
  layout = 'none',
}: AuthRouteProps) => {
  const { isLoading, sessionError, isAuthenticated, user } = useSessionGuard()
  const location = useLocation()
  const updateLayoutOverride = useAppStore((state) => state.updateLayoutOverride)
  const navigate = useNavigate()

  const isAdminSession = useCan('access', { type: 'admin_route' })
  const hasAllowedRoleAccess = useCan('access', {
    type: 'auth_route',
    attributes: { allowedRoles },
  })

  React.useEffect(() => {
    if (layout !== 'none') {
      updateLayoutOverride(layout)
      return () => {
        updateLayoutOverride('none')
      }
    }
  }, [layout, updateLayoutOverride])

  if (isLoading) {
    return (
      <Backdrop open style={{ background: '#FFF', zIndex: 1400 }}>
        <CircularProgress color='inherit' />
      </Backdrop>
    )
  }

  if (sessionError) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
          p: 3,
        }}
      >
        <Alert severity='warning' sx={{ maxWidth: 500 }}>
          {sessionError}
        </Alert>
        <Button variant='contained' onClick={() => navigate(Path.auth.signin)}>
          Go to Login
        </Button>
      </Box>
    )
  }

  if (!isAuthenticated) {
    return (
      <React.Fragment>
        <Backdrop open style={{ background: '#FFF', zIndex: 1400 }} />
        <Navigate to={Path.auth.signin} replace state={{ from: location }} />
      </React.Fragment>
    )
  }

  // Check role access via authorization engine
  if (allowedRoles && allowedRoles.length > 0) {
    if (!hasAllowedRoleAccess) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: 2,
            p: 3,
          }}
        >
          <Alert severity='error' sx={{ maxWidth: 500 }}>
            You don&rsquo;t have permission to access this page.
          </Alert>
          <Button variant='contained' onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </Box>
      )
    }
  }

  // Handle email verification check
  if (requiresVerification) {
    // Admins bypass verification check
    if (!isAdminSession) {
      const userData: any = normalizeAuthUser(user)
      const isVerified = userData?.emailVerified === true

      if (!isVerified) {
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              gap: 2,
              p: 3,
            }}
          >
            <Alert severity='warning' sx={{ maxWidth: 500 }}>
              Please verify your email address to access this feature. Check your inbox for a
              verification email.
            </Alert>
            <Button variant='contained' onClick={() => navigate(Path.auth.emailVerification)}>
              Resend Verification Email
            </Button>
          </Box>
        )
      }
    }
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

export default AuthRoute
