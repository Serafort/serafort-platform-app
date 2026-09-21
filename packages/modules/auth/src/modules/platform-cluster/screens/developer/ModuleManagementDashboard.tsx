import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  InputAdornment,
  alpha,
  useTheme,
  Stack,
  Chip,
  Paper,
  CircularProgress,
  Alert,
  Switch,
  Divider,
  Tooltip,
} from '@mui/material'
import { AdminPageHeader } from '@auth/modules/authentication-core/components/shared/admin'

import SearchIcon from '@mui/icons-material/Search'
import ExtensionIcon from '@mui/icons-material/Extension'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RefreshIcon from '@mui/icons-material/Refresh'
import RouteIcon from '@mui/icons-material/AltRoute'
import MenuIcon from '@mui/icons-material/Menu'
import ShieldIcon from '@mui/icons-material/Shield'
import TravelExploreIcon from '@mui/icons-material/TravelExplore'
import TranslateIcon from '@mui/icons-material/Translate'

import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { modulesRouterService } from '@cap/platform-core'
import type { ModuleStatusInfo } from '@cap/shared-types'
import { buildLayoutSurfaceEffect } from '@cap/layout'
import { getTenantThemeEffects } from '@cap/theme'
import ModuleUploadModal from './components/ModuleUploadModal'
import { getErrorMessage } from '../../utils/errors'

export default function ModuleManagementDashboard() {
  const theme = useTheme()
  const { t } = useTranslation('common')

  const effects = getTenantThemeEffects(theme)
  const surfaceEffect = buildLayoutSurfaceEffect(effects, theme)

  const [modules, setModules] = useState<ModuleStatusInfo[]>([])
  const [registeredRoutes, setRegisteredRoutes] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled' | 'core'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  const fetchModules = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await modulesRouterService.listInstalledModules()
      setModules(data)
      setRegisteredRoutes(modulesRouterService.countRegisteredRoutes())
    } catch (err: unknown) {
      setError(
        getErrorMessage(err) ||
          t('monitoring.modules.load_failed', 'Failed to load the installed module list.'),
      )
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchModules()
    // Another tab (or the shell itself) may change what is enabled.
    return modulesRouterService.subscribe(() => {
      void fetchModules()
    })
  }, [fetchModules])

  const filteredModules = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase()
    return modules.filter((mod) => {
      const matchesSearch =
        !searchLower ||
        mod.id.toLowerCase().includes(searchLower) ||
        mod.name.toLowerCase().includes(searchLower) ||
        (mod.description || '').toLowerCase().includes(searchLower)

      if (!matchesSearch) return false

      if (statusFilter === 'active') return mod.status === 'active'
      if (statusFilter === 'disabled') return mod.status === 'disabled'
      if (statusFilter === 'core') return mod.isCore
      return true
    })
  }, [modules, searchTerm, statusFilter])

  const handleToggleModule = async (id: string, currentEnabled: boolean) => {
    const previous = modules
    setError(null)
    // Optimistic: the switch answers within the Doherty threshold.
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: currentEnabled ? 'disabled' : 'active' } : m)),
    )

    try {
      await modulesRouterService.toggleModuleStatus(id, !currentEnabled)
      setRegisteredRoutes(modulesRouterService.countRegisteredRoutes())
    } catch (err: unknown) {
      setModules(previous)
      setError(
        getErrorMessage(err) ||
          t('monitoring.modules.toggle_failed', 'Could not change that module. Try again.'),
      )
    }
  }

  const stats = useMemo(() => {
    const total = modules.length
    const active = modules.filter((m) => m.status === 'active').length
    const core = modules.filter((m) => m.isCore).length
    return { total, active, core }
  }, [modules])

  const statCards: {
    key: string
    label: string
    value: number
    color: string
    accent: string
  }[] = [
    {
      key: 'total',
      label: t('monitoring.modules.stat_total', 'REGISTERED MODULES'),
      value: stats.total,
      color: 'text.primary',
      accent: theme.palette.primary.main,
    },
    {
      key: 'active',
      label: t('monitoring.modules.stat_active', 'ACTIVE MODULES'),
      value: stats.active,
      color: 'success.main',
      accent: theme.palette.success.main,
    },
    {
      key: 'core',
      label: t('monitoring.modules.stat_core', 'CORE PLATFORM MODULES'),
      value: stats.core,
      color: 'info.main',
      accent: theme.palette.info.main,
    },
    {
      key: 'routes',
      label: t('monitoring.modules.stat_routes', 'MOUNTED ROUTES'),
      value: registeredRoutes,
      color: 'warning.main',
      accent: theme.palette.warning.main,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
        {/* Header */}
        <AdminPageHeader
          icon={<ExtensionIcon />}
          title={t('monitoring.modules.title', 'Module Management')}
          description={t(
            'monitoring.modules.subtitle',
            'Every module assembled into this shell, with the routes, menu entries and command-palette entries each one contributes.',
          )}
          actions={
            <Stack direction='row' spacing={1.5} sx={{ flexShrink: 0 }}>
              <Button
                variant='outlined'
                startIcon={<RefreshIcon />}
                onClick={fetchModules}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 'var(--sf-radius-md, 8px)',
                  minHeight: 44,
                }}
              >
                {t('monitoring.modules.refresh', 'Refresh')}
              </Button>
              <Button
                variant='contained'
                startIcon={<CloudUploadIcon />}
                onClick={() => setIsUploadModalOpen(true)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 'var(--sf-radius-md, 8px)',
                  px: 2.5,
                  bgcolor: 'primary.main',
                  minHeight: 48,
                }}
              >
                {t('monitoring.modules.upload', 'Inspect Module Package')}
              </Button>
            </Stack>
          }
        />

        {/* Stat Cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {statCards.map((card) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.key}>
              <Paper
                sx={{
                  ...surfaceEffect,
                  p: 2.5,
                  borderRadius: 'var(--sf-radius-md, 8px)',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: alpha(card.accent, 0.03),
                }}
              >
                <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 700 }}>
                  {card.label}
                </Typography>
                <Typography variant='h4' sx={{ fontWeight: 800, mt: 0.5, color: card.color }}>
                  {isLoading ? '—' : card.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Controls Bar */}
        <Paper
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 'var(--sf-radius-lg, 12px)',
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <TextField
            placeholder={t(
              'monitoring.modules.search_placeholder',
              'Search modules by name, ID, or description...',
            )}
            size='small'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                'aria-label': t('monitoring.modules.search_placeholder', 'Search modules'),
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              flex: 1,
              minWidth: 260,
              '& .MuiOutlinedInput-root': { borderRadius: 'var(--sf-radius-md, 8px)' },
            }}
          />

          <Stack direction='row' spacing={1}>
            {(['all', 'active', 'disabled', 'core'] as const).map((filter) => (
              <Button
                key={filter}
                size='small'
                variant={statusFilter === filter ? 'contained' : 'outlined'}
                aria-pressed={statusFilter === filter}
                onClick={() => setStatusFilter(filter)}
                sx={{
                  textTransform: 'capitalize',
                  borderRadius: 'var(--sf-radius-md, 8px)',
                  fontWeight: 700,
                }}
              >
                {t('monitoring.modules.filter_' + filter, filter)}
              </Button>
            ))}
          </Stack>
        </Paper>

        {error && (
          <Alert
            severity='error'
            onClose={() => setError(null)}
            sx={{ mb: 3, borderRadius: 'var(--sf-radius-md, 8px)' }}
          >
            {error}
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredModules.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              borderRadius: 'var(--sf-radius-lg, 12px)',
              border: '1px solid',
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            <ExtensionIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            <Typography variant='subtitle1' sx={{ fontWeight: 800 }}>
              {t('monitoring.modules.empty_title', 'No modules match')}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {modules.length === 0
                ? t('monitoring.modules.empty_none', 'No modules are registered in this shell yet.')
                : t('monitoring.modules.empty_filtered', 'Try a different search term or filter.')}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredModules.map((module) => {
              const isActive = module.status === 'active'
              return (
                <Grid size={{ xs: 12, md: 6 }} key={module.id}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 'var(--sf-radius-lg, 12px)',
                      border: '1px solid',
                      borderColor: isActive ? alpha(theme.palette.primary.main, 0.2) : 'divider',
                      boxShadow: 'none',
                      opacity: isActive ? 1 : 0.72,
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.06)}`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 1,
                          mb: 1.5,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              flexShrink: 0,
                              borderRadius: 'var(--sf-radius-md, 8px)',
                              bgcolor: isActive
                                ? alpha(theme.palette.primary.main, 0.1)
                                : alpha(theme.palette.text.secondary, 0.1),
                              color: isActive ? 'primary.main' : 'text.secondary',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <ExtensionIcon />
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Stack direction='row' spacing={1} alignItems='center'>
                              <Typography
                                variant='h6'
                                sx={{ fontWeight: 800, unicodeBidi: 'plaintext' }}
                                noWrap
                              >
                                {module.name}
                              </Typography>
                              {module.isCore && (
                                <Chip
                                  icon={<ShieldIcon sx={{ fontSize: 13 }} />}
                                  label={t('monitoring.modules.core_badge', 'CORE')}
                                  size='small'
                                  color='info'
                                  variant='outlined'
                                  sx={{ fontWeight: 800, height: 22, fontSize: '0.75rem' }}
                                />
                              )}
                            </Stack>
                            <Typography
                              variant='caption'
                              sx={{
                                fontFamily: 'monospace',
                                color: 'text.secondary',
                                unicodeBidi: 'plaintext',
                              }}
                            >
                              {module.id} · v{module.version}
                            </Typography>
                          </Box>
                        </Box>

                        <Stack
                          direction='row'
                          spacing={1}
                          alignItems='center'
                          sx={{ flexShrink: 0 }}
                        >
                          <Chip
                            icon={isActive ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : undefined}
                            label={
                              isActive
                                ? t('monitoring.modules.status_active', 'Active')
                                : t('monitoring.modules.status_disabled', 'Disabled')
                            }
                            color={isActive ? 'success' : 'default'}
                            size='small'
                            sx={{ fontWeight: 800 }}
                          />
                          <Tooltip
                            title={
                              module.isCore
                                ? t(
                                    'monitoring.modules.core_locked',
                                    'Core platform modules cannot be disabled — the shell needs them to run.',
                                  )
                                : isActive
                                  ? t('monitoring.modules.toggle_off', 'Disable this module')
                                  : t('monitoring.modules.toggle_on', 'Enable this module')
                            }
                          >
                            {/* Span keeps the tooltip reachable while the switch is disabled. */}
                            <Box component='span' sx={{ display: 'inline-flex', flexShrink: 0 }}>
                              <Switch
                                checked={isActive}
                                disabled={module.isCore}
                                onChange={() => handleToggleModule(module.id, isActive)}
                                color='primary'
                                slotProps={{
                                  input: {
                                    'aria-label': t('monitoring.modules.toggle_aria', {
                                      name: module.name,
                                      defaultValue: 'Enable module {{name}}',
                                    }),
                                  },
                                }}
                              />
                            </Box>
                          </Tooltip>
                        </Stack>
                      </Box>

                      {/* Module-supplied text, in whatever script the module author wrote:
                          `plaintext` lets each description pick its own direction. */}
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{ mb: 2, minHeight: 40, unicodeBidi: 'plaintext' }}
                      >
                        {module.description ||
                          t('monitoring.modules.no_description', 'No description provided.')}
                      </Typography>

                      <Divider sx={{ my: 1.5 }} />

                      <Box sx={{ pt: 0.5 }}>
                        <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                          <Chip
                            icon={<RouteIcon sx={{ fontSize: 14 }} />}
                            label={t('monitoring.modules.routes_count', {
                              count: module.routeCount,
                              defaultValue_one: '{{count}} Route',
                              defaultValue: '{{count}} Routes',
                            })}
                            size='small'
                            variant='outlined'
                          />
                          <Chip
                            icon={<MenuIcon sx={{ fontSize: 14 }} />}
                            label={t('monitoring.modules.nav_count', {
                              count: module.navCount,
                              defaultValue_one: '{{count}} Nav Item',
                              defaultValue: '{{count}} Nav Items',
                            })}
                            size='small'
                            variant='outlined'
                          />
                          <Chip
                            icon={<TravelExploreIcon sx={{ fontSize: 14 }} />}
                            label={t('monitoring.modules.search_count', {
                              count: module.searchCount,
                              defaultValue_one: '{{count}} Search Item',
                              defaultValue: '{{count}} Search Items',
                            })}
                            size='small'
                            variant='outlined'
                          />
                          {module.locales.length > 0 && (
                            <Chip
                              icon={<TranslateIcon sx={{ fontSize: 14 }} />}
                              label={module.locales.join(', ').toUpperCase()}
                              size='small'
                              variant='outlined'
                            />
                          )}
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        )}

        {/* Package inspection modal */}
        <ModuleUploadModal
          open={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={() => {
            fetchModules()
          }}
        />
      </Box>
    </motion.div>
  )
}
