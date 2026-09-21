import React, { Suspense, type ReactNode } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Backdrop, CircularProgress, Alert, AlertTitle, Box, Button } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { isObjectEmpty, Roles, useAppStore, type LayoutOverride } from '@cap/platform-core'
import { useSessionGuard } from '../../session-manager/middlewares/useSessionGuard'
import Page403Forbidden from '../../platform-cluster/screens/system/Page403Forbidden'
import { Path } from '../../../routes/path'
import { useCan } from '@cap/authorization'

interface AdminRouteProps {
  element: ReactNode
  minimumRole?: Roles
  layout?: LayoutOverride
}

/**
 * Full-viewport veil shown while the session resolves. Painted with the theme
 * background token (not a hardcoded white) so dark mode never flashes white.
 */
const RouteVeil = ({ label, children }: { label?: string; children?: ReactNode }) => (
  <Backdrop
    open
    role={label ? 'status' : undefined}
    aria-label={label}
    sx={{ bgcolor: 'background.default', zIndex: 1400 }}
  >
    {children}
  </Backdrop>
)

const AdminRoute = ({ element, minimumRole = Roles.ADMIN, layout = 'admin' }: AdminRouteProps) => {
  const { t } = useTranslation('auth')
  const { isLoading, sessionError, isAuthenticated, user } = useSessionGuard()
  const location = useLocation()
  const navigate = useNavigate()
  const updateLayoutOverride = useAppStore((state) => state.updateLayoutOverride)

  const canAccessAdminPage = useCan('access', { type: 'admin_route' })
  const hasMinimumRolePermission = useCan('access', {
    type: 'admin_route',
    attributes: { minimumRole },
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
      <RouteVeil label={t('auth.admin_route.loading', 'Loading')}>
        <CircularProgress color='primary' />
      </RouteVeil>
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
        <Alert severity='warning' sx={{ maxWidth: 500, borderRadius: 'var(--sf-radius-lg, 12px)' }}>
          {sessionError}
        </Alert>
        <Button
          variant='contained'
          sx={{ minHeight: 44 }}
          onClick={() => navigate(Path.auth.signin)}
        >
          {t('auth.admin_route.go_to_login', 'Go to Login')}
        </Button>
      </Box>
    )
  }

  const isUserAuthenticated =
    isAuthenticated && user && typeof user !== 'string' && !isObjectEmpty(user)

  if (!isUserAuthenticated) {
    return (
      <React.Fragment>
        <RouteVeil />
        <Navigate to={Path.auth.signin} replace state={{ from: location }} />
      </React.Fragment>
    )
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
        <Alert severity='error' sx={{ maxWidth: 500, borderRadius: 'var(--sf-radius-lg, 12px)' }}>
          <AlertTitle sx={{ fontWeight: 700 }}>
            {t('auth.admin_route.insufficient_title', 'Insufficient Permissions')}
          </AlertTitle>
          {t(
            'auth.admin_route.insufficient_desc',
            'This admin feature requires higher privileges.',
          )}
        </Alert>
        <Button
          variant='contained'
          sx={{ minHeight: 44 }}
          onClick={() => navigate(Path.admin.users)}
        >
          {t('auth.admin_route.go_to_admin', 'Go to Admin Dashboard')}
        </Button>
      </Box>
    )
  }

  return (
    <Suspense
      fallback={
        <RouteVeil label={t('auth.admin_route.loading', 'Loading')}>
          <CircularProgress color='primary' />
        </RouteVeil>
      }
    >
      {element}
    </Suspense>
  )
}

export default AdminRoute
