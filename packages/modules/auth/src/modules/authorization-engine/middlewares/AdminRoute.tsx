import React, { Suspense, type ReactNode } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Backdrop, CircularProgress, Alert, Box, Button } from '@mui/material'
import { isObjectEmpty, Roles, useAppStore, type LayoutOverride } from '@cap/platform-core'
import { useSessionGuard } from '@cap/module-auth/modules/session-manager/middlewares/useSessionGuard'
import Page403Forbidden from '@cap/module-auth/modules/platform-cluster/screens/system/Page403Forbidden'
import { Path } from '@cap/module-auth/routes/path'
import { useCan } from '@cap/authorization'

interface AdminRouteProps {
  element: ReactNode
  minimumRole?: Roles
  layout?: LayoutOverride
}

const AdminRoute = ({ element, minimumRole = Roles.ADMIN, layout = 'admin' }: AdminRouteProps) => {
  const { isLoading, sessionError, isAuthenticated, user } = useSessionGuard()
  const location = useLocation()
  const navigate = useNavigate()
  const updateLayoutOverride = useAppStore((state) => state.updateLayoutOverride)

  const canAccessAdminPage = useCan('access', { type: 'admin_route' })
  const hasMinimumRolePermission = useCan('access', { type: 'admin_route', attributes: { minimumRole } })

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

  const isUserAuthenticated =
    isAuthenticated && user && typeof user !== 'string' && !isObjectEmpty(user)

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

  if (!isUserAuthenticated) {
    return <Navigate to={Path.auth.signin} replace state={{ from: location }} />
  }

  if (!canAccessAdminPage) {
    return <Page403Forbidden />
  }

  if (!hasMinimumRolePermission) {
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
          textAlign: 'center',
        }}
      >
        <Alert severity='error' sx={{ maxWidth: 500 }}>
          <strong>Insufficient Permissions</strong>
          <br />
          This admin feature requires higher privileges.
        </Alert>
        <Button variant='contained' onClick={() => navigate(Path.admin.users)}>
          Go to Admin Dashboard
        </Button>
      </Box>
    )
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

export default AdminRoute



