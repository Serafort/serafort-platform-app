import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Grid,
  Avatar,
  Card,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Stack,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import ArrowBack from '@mui/icons-material/ArrowBack'
import Refresh from '@mui/icons-material/Refresh'
import CheckCircle from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import Delete from '@mui/icons-material/Delete'
import Settings from '@mui/icons-material/Settings'
import Storage from '@mui/icons-material/Storage'
import Info from '@mui/icons-material/Info'
import History from '@mui/icons-material/History'
import Hub from '@mui/icons-material/Hub'
import CompareArrows from '@mui/icons-material/CompareArrows'
import Security from '@mui/icons-material/Security'
import ChevronRight from '@mui/icons-material/ChevronRight'
import Save from '@mui/icons-material/Save'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import Path from '../path'
import {
  useProvisioningConnector,
  useSyncProvisioningConnector,
  useUpdateProvisioningConnector,
  useDeleteProvisioningConnector,
  useProvisioningConnectorLogs,
} from '../../hooks/useProvisioningQuery'
import logger from '@idaas/authentication-core/utils/logger'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`connector-tabpanel-${index}`}
      aria-labelledby={`connector-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

// â”€â”€â”€ Stat Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string | number
  icon: React.ReactElement
  color: 'success' | 'primary' | 'info' | 'warning'
}) {
  const theme = useTheme()
  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 2.5,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px -10px ${alpha(theme.palette[color].main, 0.2)}`,
          borderColor: alpha(theme.palette[color].main, 0.5),
        },
      }}
    >
      <Avatar
        sx={{
          bgcolor: alpha(theme.palette[color].main, 0.1),
          color: `${color}.main`,
          width: 56,
          height: 56,
          borderRadius: 3,
        }}
      >
        {icon}
      </Avatar>
      <Box>
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.075em',
            display: 'block',
            mb: 0.5,
          }}
        >
          {label}
        </Typography>
        <Typography variant='h6' sx={{ fontWeight: 900, letterSpacing: '-0.01em' }}>
          {value}
        </Typography>
      </Box>
    </Card>
  )
}

const ConnectorDetailView: React.FC = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation('auth')

  const [tabValue, setTabValue] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  const connectorId = Number(id)

  // â”€â”€ Queries & Mutations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const {
    data: connectorData,
    isLoading,
    error,
    refetch: refetchConnector,
  } = useProvisioningConnector(connectorId)
  const connector = connectorData?.data

  const { data: logsData, isLoading: isLogsLoading } = useProvisioningConnectorLogs(connectorId)
  const logs = Array.isArray(logsData?.data) ? logsData.data : []
  const pagination = { total: logs.length, last_page: 1 }

  const syncMutation = useSyncProvisioningConnector({
    onSuccess: () => {
      toast.success(t('admin.provisioning.connector.messages.sync_queued'))
      refetchConnector()
    },
    onError: (err: any) => {
      logger.error('Sync failed', { error: err })
      toast.error(t('admin.provisioning.connector.messages.error_generic'))
    },
  })

  const updateMutation = useUpdateProvisioningConnector(connectorId, {
    onSuccess: () => {
      toast.success(t('admin.provisioning.connector.messages.config_saved'))
      refetchConnector()
    },
    onError: (err: any) => {
      logger.error('Update failed', { error: err })
      toast.error(t('admin.provisioning.connector.messages.error_generic'))
    },
  })

  const deleteMutation = useDeleteProvisioningConnector({
    onSuccess: () => {
      toast.success(t('admin.provisioning.connector.messages.deleted'))
      navigate(Path.provisioning)
    },
    onError: (err: any) => {
      logger.error('Delete failed', { error: err })
      toast.error(t('admin.provisioning.connector.messages.error_generic'))
    },
  })

  // â”€â”€ Form State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [configName, setConfigName] = React.useState('')
  const [configStatus, setConfigStatus] = React.useState('')

  React.useEffect(() => {
    if (connector) {
      setConfigName(connector.name)
      setConfigStatus(connector.status)
    }
  }, [connector])

  // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleSync = () => {
    syncMutation.mutate(connectorId)
  }

  const handleDelete = () => {
    if (window.confirm(t('admin.provisioning.connector.delete_confirm'))) {
      deleteMutation.mutate(connectorId)
    }
  }

  const handleSaveConfig = () => {
    updateMutation.mutate({
      id: connectorId,
      data: { name: configName, status: configStatus } as any,
    })
  }

  const getEventChip = (event: string) => {
    const isError = event.toLowerCase().includes('error') || event.toLowerCase().includes('fail')
    const isUpdate = event.toLowerCase().includes('update')
    return (
      <Chip
        label={(event || '').replace(/_/g, ' ').toUpperCase()}
        size='small'
        sx={{
          fontWeight: 900,
          fontSize: 10,
          bgcolor: isError
            ? alpha(theme.palette.error.main, 0.1)
            : isUpdate
              ? alpha(theme.palette.info.main, 0.1)
              : alpha(theme.palette.success.main, 0.1),
          color: isError ? 'error.main' : isUpdate ? 'info.main' : 'success.main',
          borderRadius: 1,
          px: 0.5,
        }}
      />
    )
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    )
  }

  if (error || !connector) {
    return (
      <Box sx={{ textAlign: 'center', py: 12, px: 2 }}>
        <Avatar
          sx={{
            mx: 'auto',
            mb: 3,
            width: 80,
            height: 80,
            bgcolor: alpha(theme.palette.error.main, 0.1),
            color: 'error.main',
          }}
        >
          <ErrorIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant='h5' sx={{ fontWeight: 900, mb: 1 }}>
          {t('admin.provisioning.connector.not_found')}
        </Typography>
        <Typography color='text.secondary' sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
          {t('admin.provisioning.connector.not_found_desc') ||
            'The connector you are looking for does not exist or has been removed.'}
        </Typography>
        <Button
          variant='contained'
          onClick={() => navigate(Path.provisioning)}
          startIcon={<ArrowBack />}
          sx={{ fontWeight: 800, px: 4, py: 1.5, borderRadius: 3 }}
        >
          {t('admin.provisioning.connector.back_to_list')}
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
      {/* â”€â”€ Pattern 1: Page Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Avatar
            sx={{
              width: 72,
              height: 72,
              borderRadius: '20px',
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: 'primary.main',
              boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
            }}
          >
            <Hub sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <IconButton
              onClick={() => navigate(Path.provisioning)}
              sx={{
                p: 0,
                mb: 0.5,
                color: 'text.secondary',
                '&:hover': { bgcolor: 'transparent', color: 'primary.main' },
              }}
            >
              <ArrowBack sx={{ fontSize: 20 }} />
            </IconButton>
            <Stack direction='row' alignItems='center' spacing={1.5}>
              <Typography variant='h4' sx={{ fontWeight: 900, letterSpacing: '-0.027em' }}>
                {connector.name}
              </Typography>
              <Chip
                label={(connector.status || '').toUpperCase()}
                size='small'
                color={connector.status === 'active' ? 'success' : 'default'}
                sx={{ fontWeight: 900, fontSize: 10, height: 20, borderRadius: 1 }}
              />
            </Stack>
            <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
              {connector.type} {t('admin.provisioning.connector.type_label')} â€¢ ID: {connector.id}
            </Typography>
          </Box>
        </Box>

        <Stack direction='row' spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant='outlined'
            color='error'
            startIcon={<Delete />}
            onClick={handleDelete}
            sx={{
              height: 44,
              px: 3,
              borderRadius: 2.5,
              fontWeight: 800,
              textTransform: 'none',
              borderColor: 'divider',
              flex: { xs: 1, sm: 'none' },
            }}
          >
            {t('admin.provisioning.connector.delete')}
          </Button>
          <Button
            variant='contained'
            startIcon={<Refresh />}
            onClick={handleSync}
            disabled={syncMutation.isPending}
            sx={{
              bgcolor: 'info.main',
              boxShadow: '0 4px 14px 0 rgba(0,118,255,0.35)',
              height: 44,
              px: 3,
              borderRadius: 2.5,
              fontWeight: 800,
              textTransform: 'none',
              '&:hover': { bgcolor: 'info.dark' },
              flex: { xs: 1, sm: 'none' },
            }}
          >
            {syncMutation.isPending
              ? t('admin.provisioning.connector.syncing')
              : t('admin.provisioning.connector.sync_now')}
          </Button>
        </Stack>
      </Box>

      {/* â”€â”€ Pattern 2: Quick Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            label={t('admin.provisioning.connector.stats.last_sync')}
            value={
              connector.last_sync_at
                ? new Date(connector.last_sync_at).toLocaleString()
                : t('admin.provisioning.connector.never')
            }
            icon={<History />}
            color='primary'
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            label={t('admin.provisioning.connector.stats.records')}
            value={connector.sync_count || 0}
            icon={<Storage />}
            color='success'
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            label={t('admin.provisioning.connector.stats.status')}
            value={
              connector.status === 'active'
                ? t('admin.provisioning.scim.status_active')
                : t('admin.provisioning.scim.status_inactive')
            }
            icon={<Security />}
            color='info'
          />
        </Grid>
      </Grid>

      {/* â”€â”€ Main Content: Tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Card
        sx={{
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
          overflow: 'visible',
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 1 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 800,
                textTransform: 'uppercase',
                fontSize: 13,
                minHeight: 64,
                letterSpacing: '0.05em',
              },
            }}
          >
            <Tab
              icon={<Settings sx={{ mr: 1, fontSize: 20 }} />}
              iconPosition='start'
              label={t('admin.provisioning.connector.tabs.config')}
            />
            <Tab
              icon={<CompareArrows sx={{ mr: 1, fontSize: 20 }} />}
              iconPosition='start'
              label={t('admin.provisioning.connector.tabs.mappings')}
            />
            <Tab
              icon={<History sx={{ mr: 1, fontSize: 20 }} />}
              iconPosition='start'
              label={t('admin.provisioning.connector.tabs.history')}
            />
          </Tabs>
        </Box>

        <Box sx={{ p: { xs: 2.5, md: 4 } }}>
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={5}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Typography
                  variant='h6'
                  sx={{
                    fontWeight: 900,
                    mb: 3.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                  }}
                >
                  {t('admin.provisioning.connector.general_settings')}
                </Typography>
                <Stack spacing={3.5}>
                  <TextField
                    fullWidth
                    label={t('admin.provisioning.connector.fields.name')}
                    value={configName}
                    onChange={(e) => setConfigName(e.target.value)}
                    variant='outlined'
                    slotProps={{
                      input: { sx: { borderRadius: 3, fontWeight: 600 } },
                      inputLabel: { sx: { fontWeight: 700 } },
                    }}
                  />
                  <FormControl fullWidth>
                    <InputLabel id='status-label' sx={{ fontWeight: 700 }}>
                      {t('admin.provisioning.connector.fields.status')}
                    </InputLabel>
                    <Select
                      labelId='status-label'
                      value={configStatus}
                      label={t('admin.provisioning.connector.fields.status')}
                      onChange={(e) => setConfigStatus(e.target.value as any)}
                      sx={{ borderRadius: 3, fontWeight: 700 }}
                    >
                      <MenuItem value='active' sx={{ fontWeight: 700 }}>
                        {t('admin.provisioning.scim.status_active').toUpperCase()}
                      </MenuItem>
                      <MenuItem value='inactive' sx={{ fontWeight: 700 }}>
                        {t('admin.provisioning.scim.status_inactive').toUpperCase()}
                      </MenuItem>
                      <MenuItem value='error' sx={{ fontWeight: 700 }}>
                        {t('common.error').toUpperCase()}
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <Box sx={{ pt: 2 }}>
                    <Button
                      variant='contained'
                      startIcon={<Save />}
                      onClick={handleSaveConfig}
                      disabled={updateMutation.isPending}
                      sx={{
                        height: 48,
                        px: 4,
                        borderRadius: 3,
                        fontWeight: 900,
                        bgcolor: 'primary.main',
                        boxShadow: `0 8px 16px -4px ${alpha(theme.palette.primary.main, 0.3)}`,
                        textTransform: 'none',
                      }}
                    >
                      {updateMutation.isPending
                        ? t('admin.provisioning.connector.saving')
                        : t('admin.provisioning.connector.save_changes')}
                    </Button>
                  </Box>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 5 }}>
                <Card
                  variant='outlined'
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette.action.hover, 0.4),
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography
                    variant='subtitle2'
                    sx={{
                      fontWeight: 900,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    <Storage fontSize='small' color='primary' />{' '}
                    {t('admin.provisioning.connector.metadata')}
                  </Typography>
                  <Divider sx={{ mb: 2.5 }} />
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        variant='caption'
                        sx={{ fontWeight: 800, color: 'text.secondary' }}
                      >
                        {t('admin.provisioning.connector.metadata_fields.created_on')}
                      </Typography>
                      <Typography variant='body2' sx={{ fontWeight: 800 }}>
                        {connector.created_at
                          ? new Date(connector.created_at).toLocaleDateString(undefined, {
                              dateStyle: 'medium',
                            })
                          : 'â€”'}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        variant='caption'
                        sx={{ fontWeight: 800, color: 'text.secondary' }}
                      >
                        {t('admin.provisioning.connector.metadata_fields.type')}
                      </Typography>
                      <Chip
                        label={connector.type}
                        size='small'
                        sx={{
                          fontWeight: 900,
                          borderRadius: 1.5,
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      />
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Avatar
                sx={{
                  mx: 'auto',
                  mb: 3,
                  width: 64,
                  height: 64,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                }}
              >
                <CompareArrows sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant='h6' sx={{ fontWeight: 900, mb: 1.5 }}>
                {t('admin.provisioning.connector.mappings_title')}
              </Typography>
              <Typography
                color='text.secondary'
                sx={{ maxWidth: 450, mx: 'auto', fontWeight: 500, lineHeight: 1.6 }}
              >
                {t('admin.provisioning.connector.mappings_desc')}
              </Typography>
              <Button
                variant='outlined'
                sx={{ mt: 4, borderRadius: 2.5, fontWeight: 800, textTransform: 'none' }}
              >
                {t('admin.provisioning.connector.configure_mappings')}
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {isLogsLoading ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <CircularProgress size={32} thickness={5} />
              </Box>
            ) : logs.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Avatar
                  sx={{
                    mx: 'auto',
                    mb: 2,
                    bgcolor: alpha(theme.palette.action.hover, 0.5),
                    color: 'text.disabled',
                  }}
                >
                  <History />
                </Avatar>
                <Typography color='text.secondary' sx={{ fontWeight: 700 }}>
                  {t('admin.provisioning.connector.no_logs')}
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.action.hover, 0.6) }}>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 900,
                            py: 2,
                            letterSpacing: '0.05em',
                            color: 'text.secondary',
                          }}
                        >
                          {t('admin.provisioning.connector.table.timestamp').toUpperCase()}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 900,
                            py: 2,
                            letterSpacing: '0.05em',
                            color: 'text.secondary',
                          }}
                        >
                          {t('admin.provisioning.connector.table.event').toUpperCase()}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 900,
                            py: 2,
                            letterSpacing: '0.05em',
                            color: 'text.secondary',
                          }}
                        >
                          {t('admin.provisioning.connector.table.status').toUpperCase()}
                        </TableCell>
                        <TableCell
                          align='right'
                          sx={{
                            fontWeight: 900,
                            py: 2,
                            letterSpacing: '0.05em',
                            color: 'text.secondary',
                          }}
                        >
                          {t('admin.provisioning.connector.table.actions').toUpperCase()}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logs.map((log: any, _idx: number) => (
                        <TableRow
                          key={log.id}
                          hover
                          sx={{ '& td': { py: 2.5 }, '&:last-child td': { borderBottom: 'none' } }}
                        >
                          <TableCell>
                            <Typography variant='body2' sx={{ fontWeight: 700 }}>
                              {log.created_at
                                ? new Date(log.created_at).toLocaleString()
                                : new Date(log.createdAt).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>{getEventChip(log.action || log.event)}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {log.status === 'success' ? (
                                <CheckCircle sx={{ color: 'success.main', fontSize: 18 }} />
                              ) : (
                                <ErrorIcon sx={{ color: 'error.main', fontSize: 18 }} />
                              )}
                              <Typography
                                variant='body2'
                                sx={{
                                  fontWeight: 900,
                                  color: log.status === 'success' ? 'success.dark' : 'error.dark',
                                  fontSize: 11,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.02em',
                                }}
                              >
                                {(log.status || '').toString()}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align='right'>
                            <Tooltip title='View Log Entry'>
                              <IconButton
                                size='small'
                                sx={{ bgcolor: alpha(theme.palette.action.hover, 0.5) }}
                              >
                                <ChevronRight fontSize='small' />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {pagination.last_page > 1 && (
                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                      count={pagination.last_page}
                      page={page}
                      onChange={(_, value) => setPage(value)}
                      sx={{
                        '& .MuiPaginationItem-root': { fontWeight: 900, borderRadius: 2 },
                        '& .Mui-selected': {
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </TabPanel>
        </Box>
      </Card>

      {/* Troubleshooting Helper */}
      <Card
        sx={{
          mt: 4,
          p: 3,
          borderRadius: 5,
          border: '1px solid',
          borderColor: alpha(theme.palette.info.main, 0.2),
          bgcolor: alpha(theme.palette.info.main, 0.03),
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          boxShadow: 'none',
        }}
      >
        <Avatar
          sx={{
            bgcolor: alpha(theme.palette.info.main, 0.1),
            color: 'info.main',
            width: 52,
            height: 52,
            borderRadius: 2.5,
          }}
        >
          <Info />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant='subtitle1' sx={{ fontWeight: 900, mb: 0.5 }}>
            {t('admin.provisioning.connector.helper_title')}
          </Typography>
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ fontWeight: 500, lineHeight: 1.5 }}
          >
            {t('admin.provisioning.connector.helper_desc')}
          </Typography>
        </Box>
        <Button
          variant='outlined'
          color='info'
          sx={{
            fontWeight: 900,
            textTransform: 'none',
            borderRadius: 2.5,
            px: 4,
            height: 44,
            borderColor: alpha(theme.palette.info.main, 0.3),
          }}
        >
          {t('admin.provisioning.connector.view_docs')}
        </Button>
      </Card>
    </Box>
  )
}

export default ConnectorDetailView
