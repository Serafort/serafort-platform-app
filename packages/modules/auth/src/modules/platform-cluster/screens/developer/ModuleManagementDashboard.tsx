import { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, TextField, InputAdornment, alpha, useTheme, Stack, Chip, Paper, CircularProgress, Alert, Switch, Divider } from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import ExtensionIcon from '@mui/icons-material/Extension';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import RouteIcon from '@mui/icons-material/AltRoute';
import MenuIcon from '@mui/icons-material/Menu';
import ShieldIcon from '@mui/icons-material/Shield';

import { useTranslation } from 'react-i18next';
import { modulesRouterService } from '@cap/platform-core';
import type { ModuleStatusInfo } from '@cap/shared-types';
import ModuleUploadModal from './components/ModuleUploadModal';

export default function ModuleManagementDashboard() {
  const theme = useTheme()
  const { t: _t } = useTranslation('common')

  const [modules, setModules] = useState<ModuleStatusInfo[]>([])
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
    } catch (err: any) {
      setError(err.message || 'Failed to load installed module list')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchModules()
  }, [fetchModules])

  const filteredModules = useMemo(() => {
    return modules.filter((mod) => {
      const matchesSearch =
        mod.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (mod.description || '').toLowerCase().includes(searchTerm.toLowerCase())

      if (!matchesSearch) return false

      if (statusFilter === 'active') return mod.status === 'active'
      if (statusFilter === 'disabled') return mod.status === 'disabled'
      if (statusFilter === 'core') return mod.isCore === true
      return true
    })
  }, [modules, searchTerm, statusFilter])

  const handleToggleModule = async (id: string, currentEnabled: boolean) => {
    try {
      await modulesRouterService.toggleModuleStatus(id, !currentEnabled)
      setModules((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: !currentEnabled ? 'active' : 'disabled' } : m)),
      )
    } catch (err: any) {
      setError(err.message || `Failed to toggle module ${id}`)
    }
  }

  const stats = useMemo(() => {
    const total = modules.length
    const active = modules.filter((m) => m.status === 'active').length
    const core = modules.filter((m) => m.isCore).length
    const totalRoutes = modules.reduce((sum, m) => sum + m.routeCount, 0)
    return { total, active, core, totalRoutes }
  }, [modules])

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <ExtensionIcon color='primary' sx={{ fontSize: 32 }} />
            <Typography
              variant='h4'
              sx={{
                fontWeight: 900,
                letterSpacing: '-0.027em',
                fontSize: { xs: '1.5rem', md: '2.125rem' },
              }}
            >
              Module Management & Auto-Registration
            </Typography>
          </Box>
          <Typography variant='body2' color='text.secondary'>
            Upload, unpack, test, and dynamically manage platform modules across the system.
          </Typography>
        </Box>

        <Stack direction='row' spacing={1.5} sx={{ flexShrink: 0 }}>
          <Button
            variant='outlined'
            startIcon={<RefreshIcon />}
            onClick={fetchModules}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant='contained'
            startIcon={<CloudUploadIcon />}
            onClick={() => setIsUploadModalOpen(true)}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              px: 2.5,
              bgcolor: 'primary.main',
              boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
            }}
          >
            Upload Module Package
          </Button>
        </Stack>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: alpha(theme.palette.primary.main, 0.03),
            }}
          >
            <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 700 }}>
              TOTAL INSTALLED
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 900, mt: 0.5 }}>
              {stats.total}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: alpha(theme.palette.success.main, 0.03),
            }}
          >
            <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 700 }}>
              ACTIVE MODULES
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 900, mt: 0.5, color: 'success.main' }}>
              {stats.active}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: alpha(theme.palette.info.main, 0.03),
            }}
          >
            <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 700 }}>
              CORE PLATFORM MODULES
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 900, mt: 0.5, color: 'info.main' }}>
              {stats.core}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: alpha(theme.palette.warning.main, 0.03),
            }}
          >
            <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 700 }}>
              REGISTERED ROUTES
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 900, mt: 0.5, color: 'warning.main' }}>
              {stats.totalRoutes}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Controls Bar */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
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
          placeholder='Search modules by name, ID, or description...'
          size='small'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ flex: 1, minWidth: 260, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        <Stack direction='row' spacing={1}>
          {(['all', 'active', 'disabled', 'core'] as const).map((filter) => (
            <Button
              key={filter}
              size='small'
              variant={statusFilter === filter ? 'contained' : 'outlined'}
              onClick={() => setStatusFilter(filter)}
              sx={{ textTransform: 'capitalize', borderRadius: 2, fontWeight: 700 }}
            >
              {filter}
            </Button>
          ))}
        </Stack>
      </Paper>

      {error && (
        <Alert severity='error' sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredModules.map((module) => {
            const isActive = module.status === 'active'
            return (
              <Grid size={{ xs: 12, md: 6 }} key={module.id}>
                <Card
                  sx={{
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: isActive
                      ? alpha(theme.palette.primary.main, 0.2)
                      : 'divider',
                    boxShadow: 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        mb: 1.5,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2.5,
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
                        <Box>
                          <Stack direction='row' spacing={1} alignItems='center'>
                            <Typography variant='h6' sx={{ fontWeight: 800 }}>
                              {module.name}
                            </Typography>
                            {module.isCore && (
                              <Chip
                                icon={<ShieldIcon sx={{ fontSize: 13 }} />}
                                label='CORE'
                                size='small'
                                color='info'
                                variant='outlined'
                                sx={{ fontWeight: 800, height: 20, fontSize: '0.65rem' }}
                              />
                            )}
                          </Stack>
                          <Typography variant='caption' sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                            id: {module.id} | v{module.version}
                          </Typography>
                        </Box>
                      </Box>

                      <Switch
                        checked={isActive}
                        disabled={module.isCore}
                        onChange={() => handleToggleModule(module.id, isActive)}
                        color='primary'
                      />
                    </Box>

                    <Typography variant='body2' color='text.secondary' sx={{ mb: 2, minHeight: 40 }}>
                      {module.description}
                    </Typography>

                    <Divider sx={{ my: 1.5 }} />

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        pt: 0.5,
                      }}
                    >
                      <Stack direction='row' spacing={2}>
                        <Chip
                          icon={<RouteIcon sx={{ fontSize: 14 }} />}
                          label={`${module.routeCount} Routes`}
                          size='small'
                          variant='outlined'
                        />
                        <Chip
                          icon={<MenuIcon sx={{ fontSize: 14 }} />}
                          label={`${module.navCount} Nav Items`}
                          size='small'
                          variant='outlined'
                        />
                      </Stack>

                      <Chip
                        icon={isActive ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : undefined}
                        label={isActive ? 'Active' : 'Disabled'}
                        color={isActive ? 'success' : 'default'}
                        size='small'
                        sx={{ fontWeight: 800 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Upload Modal */}
      <ModuleUploadModal
        open={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          fetchModules()
        }}
      />
    </Box>
  )
}
