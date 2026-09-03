import React from 'react'
import {
  Box,
  Button,
  IconButton,
  Typography,
  Paper,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Link as MuiLink,
  CircularProgress,
  Alert,
} from '@mui/material'
import Check from '@mui/icons-material/Check';
import Storage from '@mui/icons-material/Storage';
import Layers from '@mui/icons-material/Layers';
import VerifiedUser from '@mui/icons-material/VerifiedUser';
import Mail from '@mui/icons-material/Mail';
import ChevronRight from '@mui/icons-material/ChevronRight';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Warning from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import Info from '@mui/icons-material/Info';
import Dns from '@mui/icons-material/Dns';
import { alpha, useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { useDetailedHealth } from "@cap/module-auth/modules/authentication-core/hooks/useHealthQuery"

interface ApiDependency {
  id: string
  name: string
  description: string
  status: 'healthy' | 'degraded' | 'outage'
  responseTime: string | number
  version: string
}

interface Dependency extends ApiDependency {
  icon: React.ReactNode
  iconColor: string
  iconBg: string
}

interface SystemHealthDashboardProps {
  onRefresh?: () => void
  onDownloadLogs?: () => void
}

const SystemHealthDashboard: React.FC<SystemHealthDashboardProps> = ({
  onRefresh,
  onDownloadLogs: _onDownloadLogs,
}) => {
  const theme = useTheme()
  const { t } = useTranslation()

  // Fetch health data from API
  const {
    data: healthResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useDetailedHealth({
    refetchInterval: 51730, // Refresh every 30 seconds
    staleTime: 10000, // Consider data fresh for 10 seconds
    refetchOnWindowFocus: false, // Don't refetch on window focus
  } as any)

  const healthData = healthResponse?.data

  // Map dependency IDs to icons and colors
  const getIconConfig = (id: string) => {
    switch (id) {
      case 'postgres':
        return {
          icon: <Storage sx={{ fontSize: 20 }} />,
          iconColor: theme.palette.info.main,
          iconBg: alpha(theme.palette.info.main, 0.1),
        }
      case 'redis':
        return {
          icon: <Layers sx={{ fontSize: 20 }} />,
          iconColor: theme.palette.error.main,
          iconBg: alpha(theme.palette.error.main, 0.1),
        }
      case 'auth':
        return {
          icon: <VerifiedUser sx={{ fontSize: 20 }} />,
          iconColor: theme.palette.secondary.main,
          iconBg: alpha(theme.palette.secondary.main, 0.1),
        }
      case 'email':
        return {
          icon: <Mail sx={{ fontSize: 20 }} />,
          iconColor: theme.palette.text.secondary,
          iconBg: theme.palette.action.hover,
        }
      default:
        return {
          icon: <Storage sx={{ fontSize: 20 }} />,
          iconColor: theme.palette.primary.main,
          iconBg: alpha(theme.palette.primary.main, 0.1),
        }
    }
  }

  // Transform API dependencies to include icons
  const dependencies: Array<Dependency> =
    healthData?.dependencies?.map((dep: ApiDependency) => ({
      ...dep,
      ...getIconConfig(dep.id),
    })) || []

  const lastCheck = healthData?.lastCheck || 'N/A'
  const healthScore = healthData?.healthScore || 0
  const appVersion = healthData?.appVersion || 'N/A'
  const environment = healthData?.environment || 'N/A'
  const uptime = healthData?.uptime || 'N/A'
  const server = healthData?.server || 'N/A'

  const getStatusConfig = (status: Dependency['status']) => {
    switch (status) {
      case 'healthy':
        return {
          label: t('monitoring.dashboard.status_healthy'),
          icon: <CheckCircle sx={{ fontSize: 14 }} />,
          color: theme.palette.success.main,
          bg: alpha(theme.palette.success.main, 0.1),
          border: alpha(theme.palette.success.main, 0.2),
        }
      case 'degraded':
        return {
          label: t('monitoring.dashboard.status_degraded'),
          icon: <Warning sx={{ fontSize: 14 }} />,
          color: theme.palette.warning.main,
          bg: alpha(theme.palette.warning.main, 0.1),
          border: alpha(theme.palette.warning.main, 0.2),
        }
      case 'outage':
        return {
          label: t('monitoring.dashboard.status_outage'),
          icon: <ErrorIcon sx={{ fontSize: 14 }} />,
          color: theme.palette.error.main,
          bg: alpha(theme.palette.error.main, 0.1),
          border: alpha(theme.palette.error.main, 0.2),
        }
    }
  }

  const getResponseTimeColor = (status: Dependency['status']) => {
    switch (status) {
      case 'healthy':
        return 'text.primary'
      case 'degraded':
        return 'warning.main'
      case 'outage':
        return 'error.main'
    }
  }

  const handleRefresh = () => {
    refetch()
    onRefresh?.()
  }

  const allSystemsOperational = dependencies.every((dep) => dep.status === 'healthy')

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography color='text.secondary'>{t('monitoring.dashboard.loading_data')}</Typography>
      </Box>
    )
  }

  // Error state
  if (isError) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          bgcolor: 'background.default',
          p: 4,
        }}
      >
        <Alert
          severity='error'
          sx={{ maxWidth: 500, mb: 2 }}
          action={
            <Button color='inherit' size='small' onClick={handleRefresh}>
              {t('monitoring.dashboard.retry_button')}
            </Button>
          }
        >
          {t('monitoring.dashboard.error_failed_to_load', {
            error: error?.message || 'Unknown error',
          })}
        </Alert>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      {/* Main Content */}
      <Box
        component='main'
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          p: { xs: 2, md: 5 },
          px: { lg: 20 },
        }}
      >
        {/* Central Status Card */}
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            maxWidth: 1200,
            borderRadius: '12px',
            overflow: 'hidden',
            border: 1,
            borderColor: 'divider',
          }}
        >
          {/* Global Status Indicator */}
          <Box
            sx={{
              p: 4,
              pb: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: 1,
              borderColor: 'divider',
              background: (theme) =>
                `linear-gradient(to bottom, ${theme.palette.background.paper}, ${alpha(theme.palette.background.default, 0.4)})`,
            }}
          >
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: allSystemsOperational ? 'success.main' : 'warning.main',
                  borderRadius: '50%',
                  filter: 'blur(16px)',
                  opacity: 0.2,
                  animation: 'pulse 2s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 0.2 },
                    '50%': { opacity: 0.3 },
                  },
                }}
              />
              <Box
                sx={{
                  position: 'relative',
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: allSystemsOperational
                    ? alpha(theme.palette.success.main, 0.1)
                    : alpha(theme.palette.warning.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 1,
                  borderColor: allSystemsOperational
                    ? alpha(theme.palette.success.main, 0.2)
                    : alpha(theme.palette.warning.main, 0.2),
                }}
              >
                <Check
                  sx={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: allSystemsOperational ? 'success.main' : 'warning.main',
                  }}
                />
              </Box>
            </Box>

            <Typography
              sx={{
                fontSize: { xs: '20px', md: '24px' },
                fontWeight: 700,
                color: 'text.primary',
                mb: 1,
              }}
            >
              {allSystemsOperational
                ? t('monitoring.dashboard.all_systems_operational')
                : t('monitoring.dashboard.degraded_performance')}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: isFetching ? 'warning.main' : 'success.main',
                  animation: isFetching ? 'pulse 1s ease-in-out infinite' : 'none',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.4 },
                  },
                }}
              />
              <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
                {isFetching
                  ? t('monitoring.dashboard.refreshing')
                  : t('monitoring.dashboard.last_check', { time: lastCheck })}
              </Typography>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ width: '100%', maxWidth: 448, mt: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'text.secondary',
                  mb: 1,
                }}
              >
                <Typography component='span' sx={{ fontSize: 'inherit' }}>
                  {t('monitoring.dashboard.overall_health_score')}
                </Typography>
                <Typography
                  component='span'
                  sx={{ fontSize: 'inherit', color: 'text.primary', fontWeight: 600 }}
                >
                  {healthScore}%
                </Typography>
              </Box>
              <LinearProgress
                variant='determinate'
                value={healthScore}
                sx={{
                  height: 8,
                  borderRadius: 9999,
                  bgcolor: 'action.hover',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'success.main',
                    borderRadius: 9999,
                  },
                }}
              />
            </Box>
          </Box>

          {/* Dependency Matrix Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: 'action.hover',
                  }}
                >
                  <TableCell
                    sx={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      py: 2,
                    }}
                  >
                    {t('monitoring.dashboard.dependency_col')}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      py: 2,
                    }}
                  >
                    {t('monitoring.dashboard.status_col')}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      py: 2,
                    }}
                  >
                    {t('monitoring.dashboard.response_time_col')}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      py: 2,
                    }}
                  >
                    {t('monitoring.dashboard.version_col')}
                  </TableCell>
                  <TableCell
                    align='right'
                    sx={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      py: 2,
                    }}
                  >
                    {t('monitoring.dashboard.details_col')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dependencies.map((dep) => {
                  const statusConfig = getStatusConfig(dep.status)
                  return (
                    <TableRow
                      key={dep.id}
                      sx={{
                        '&:hover': {
                          bgcolor: alpha(theme.palette.action.hover, 0.5),
                        },
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '4px',
                              bgcolor: dep.iconBg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: dep.iconColor,
                            }}
                          >
                            {dep.icon}
                          </Box>
                          <Box>
                            <Typography
                              sx={{
                                fontSize: '14px',
                                fontWeight: 500,
                                color: 'text.primary',
                              }}
                            >
                              {dep.name}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: '12px',
                                color: 'text.secondary',
                              }}
                            >
                              {dep.description}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          icon={statusConfig.icon}
                          label={statusConfig.label}
                          size='small'
                          sx={{
                            height: 28,
                            fontSize: '12px',
                            fontWeight: 500,
                            bgcolor: statusConfig.bg,
                            color: statusConfig.color,
                            border: 1,
                            borderColor: statusConfig.border,
                            '& .MuiChip-icon': {
                              color: 'inherit',
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography
                          sx={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: getResponseTimeColor(dep.status),
                          }}
                        >
                          {dep.responseTime}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography
                          component='code'
                          sx={{
                            fontSize: '14px',
                            fontFamily: 'monospace',
                            color: 'text.secondary',
                            bgcolor: 'action.hover',
                            px: 1,
                            py: 0.5,
                            borderRadius: '4px',
                          }}
                        >
                          {dep.version}
                        </Typography>
                      </TableCell>
                      <TableCell align='right' sx={{ py: 2 }}>
                        <IconButton
                          size='small'
                          sx={{
                            color: 'text.secondary',
                            '&:hover': { color: 'primary.main' },
                          }}
                        >
                          <ChevronRight sx={{ fontSize: 20 }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer Meta Info */}
          <Box
            sx={{
              px: 3,
              py: 2,
              bgcolor: 'action.hover',
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 1,
              fontSize: '12px',
              color: 'text.secondary',
            }}
          >
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Info sx={{ fontSize: 16 }} />
                <span>{t('monitoring.dashboard.app_version', { version: appVersion })}</span>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Dns sx={{ fontSize: 16 }} />
                <span>{t('monitoring.dashboard.environment', { env: environment })}</span>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <span>{t('monitoring.dashboard.uptime', { uptime })}</span>
              <span>â€¢</span>
              <span>{t('monitoring.dashboard.server', { server })}</span>
            </Box>
          </Box>
        </Paper>

        {/* Security/Info Note */}
        <Box sx={{ mt: 4, maxWidth: 768, textAlign: 'center' }}>
          <Typography
            sx={{
              fontSize: '12px',
              color: 'text.disabled',
            }}
          >
            {t('monitoring.dashboard.status_page_desc')}
            <Box component='br' sx={{ display: { xs: 'none', md: 'block' } }} />
            {t('monitoring.dashboard.incident_report_prefix')}{' '}
            <MuiLink
              href='#'
              sx={{
                color: 'primary.main',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {t('monitoring.dashboard.incident_portal_link')}
            </MuiLink>
            .
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default SystemHealthDashboard
