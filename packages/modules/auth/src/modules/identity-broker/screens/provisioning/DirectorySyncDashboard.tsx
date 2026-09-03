import React, { useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  alpha,
  Stack,
  IconButton,
  Chip,
  Divider,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material'
import Add from '@mui/icons-material/Add'
import Sync from '@mui/icons-material/Sync'
import History from '@mui/icons-material/History'
import CheckCircle from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import CloudDone from '@mui/icons-material/CloudDone'
import Security from '@mui/icons-material/Security'
import Settings from '@mui/icons-material/Settings'
import ArrowForward from '@mui/icons-material/ArrowForward'
import CloudQueue from '@mui/icons-material/CloudQueue'
import Close from '@mui/icons-material/Close'
import Hub from '@mui/icons-material/Hub'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  useProvisioningConnectors,
  useSyncProvisioningConnector,
  useCreateProvisioningConnector,
  useProvisioningConnectorLogs,
} from '@auth/authorization-engine/hooks/useAdminQuery'
import type { Connector, ConnectorLog } from '@auth/authorization-engine/services/adminService'
import logger from '@idaas/authentication-core/utils/logger'
import { Path } from '@cap/module-auth/routes/path'

// â”€â”€â”€ Skeleton Loader â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ConnectorSkeleton() {
  return (
    <Card
      sx={{
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
          <Skeleton variant='rounded' width={48} height={48} sx={{ borderRadius: 2 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width='60%' height={24} />
            <Skeleton width='30%' height={16} />
          </Box>
        </Box>
        <Skeleton width='100%' height={32} sx={{ mb: 2 }} />
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6 }}>
            <Skeleton variant='rounded' height={64} />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Skeleton variant='rounded' height={64} />
          </Grid>
        </Grid>
        <Divider sx={{ mb: 2 }} />
        <Skeleton width='40%' height={20} />
      </CardContent>
    </Card>
  )
}

// â”€â”€â”€ Status Chip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StatusChip({ status }: { status: string }) {
  const { t } = useTranslation('auth')
  const map: Record<
    string,
    { label: string; color: 'success' | 'error' | 'warning' | 'default'; icon: React.ReactElement }
  > = {
    active: {
      label: t('admin.provisioning.scim.status_active'),
      color: 'success',
      icon: <CheckCircle sx={{ fontSize: 14 }} />,
    },
    error: {
      label: t('common.error') || 'ERROR',
      color: 'error',
      icon: <ErrorIcon sx={{ fontSize: 14 }} />,
    },
    inactive: {
      label: t('admin.provisioning.scim.status_inactive'),
      color: 'default',
      icon: <CloudQueue sx={{ fontSize: 14 }} />,
    },
  }
  const cfg = map[status] ?? map.inactive
  return (
    <Chip
      label={cfg.label}
      size='small'
      color={cfg.color}
      variant='outlined'
      icon={cfg.icon}
      sx={{ fontWeight: 800, height: 20, borderRadius: 1.5 }}
    />
  )
}

// â”€â”€â”€ Sync Logs Dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SyncLogsDialog({
  open,
  onClose,
  connectorId,
  connectorName,
}: {
  open: boolean
  onClose: () => void
  connectorId: number
  connectorName: string
}) {
  const { t } = useTranslation('auth')
  const { data, isLoading } = useProvisioningConnectorLogs(connectorId, { limit: 50 })
  const logs: ConnectorLog[] = (data?.data as any)?.data ?? data?.data ?? []

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <History color='primary' sx={{ fontSize: 24 }} />
          <Typography variant='h6' sx={{ fontWeight: 900 }}>
            {t('admin.provisioning.dashboard.dialogs.logs.title')} &ldquo;{connectorName}&rdquo;
          </Typography>
        </Box>
        <IconButton aria-label='Close sync logs' onClick={onClose} size='small'>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {isLoading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={32} thickness={5} />
          </Box>
        ) : logs.length === 0 ? (
          <Box sx={{ p: 4 }}>
            <Alert severity='info' sx={{ borderRadius: 3, fontWeight: 600 }}>
              {t('admin.provisioning.dashboard.dialogs.logs.no_logs')}
            </Alert>
          </Box>
        ) : (
          <TableContainer>
            <Table size='small'>
              <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.6) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 900, py: 2 }}>
                    {t('admin.provisioning.logs.table.event').toUpperCase()}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>
                    {t('admin.provisioning.logs.table.target').toUpperCase()}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>
                    {t('admin.provisioning.logs.table.status').toUpperCase()}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>
                    {t('admin.provisioning.logs.table.timestamp').toUpperCase()}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant='body2' sx={{ fontWeight: 700 }}>
                        {(log.action || '').toUpperCase()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant='body2'
                        sx={{ fontWeight: 800, fontFamily: 'monospace', fontSize: 13 }}
                      >
                        {log.details || 'â€”'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.status.toUpperCase()}
                        size='small'
                        color={log.status === 'success' ? 'success' : 'error'}
                        sx={{ fontWeight: 900, height: 20, borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant='caption'
                        sx={{ fontWeight: 600, color: 'text.secondary' }}
                      >
                        {new Date(log.created_at).toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 800 }}>
          {t('admin.provisioning.dashboard.dialogs.logs.close')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// â”€â”€â”€ Add Connector Dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AddConnectorDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const { t } = useTranslation('auth')
  const [name, setName] = useState('')
  const [type, setType] = useState<Connector['type']>('azure_ad')
  const [orgId, setOrgId] = useState('')

  const createMutation = useCreateProvisioningConnector({
    onSuccess: () => {
      toast.success(t('admin.provisioning.dashboard.dialogs.add.success'))
      setName('')
      setType('azure_ad')
      setOrgId('')
      onCreated()
      onClose()
    },
    onError: (error: unknown) => {
      logger.error('Failed to create connector', { error })
      toast.error(t('admin.provisioning.dashboard.dialogs.add.error'))
    },
  })

  const handleSubmit = () => {
    if (!name.trim() || !orgId.trim()) return
    createMutation.mutate({
      name: name.trim(),
      type,
      organizationId: parseInt(orgId, 10),
      config: {},
    })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Add color='primary' sx={{ fontSize: 24 }} />
          <Typography variant='h6' sx={{ fontWeight: 900 }}>
            {t('admin.provisioning.dashboard.dialogs.add.title')}
          </Typography>
        </Box>
        <IconButton aria-label='Close add connector' onClick={onClose} size='small'>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={3.5} sx={{ mt: 1 }}>
          <TextField
            label={t('admin.provisioning.dashboard.dialogs.add.name_label')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            placeholder={t('admin.provisioning.dashboard.dialogs.add.name_placeholder')}
            required
            slotProps={{
              input: { sx: { borderRadius: 3, fontWeight: 600 } },
              inputLabel: { sx: { fontWeight: 700 } },
            }}
          />
          <FormControl fullWidth>
            <InputLabel sx={{ fontWeight: 700 }}>
              {t('admin.provisioning.dashboard.dialogs.add.type_label')}
            </InputLabel>
            <Select
              value={type}
              label={t('admin.provisioning.dashboard.dialogs.add.type_label')}
              onChange={(e) => setType(e.target.value as Connector['type'])}
              sx={{ borderRadius: 3, fontWeight: 700 }}
            >
              <MenuItem value='azure_ad' sx={{ fontWeight: 700 }}>
                {t('admin.provisioning.dashboard.dialogs.add.types.azure')}
              </MenuItem>
              <MenuItem value='okta' sx={{ fontWeight: 700 }}>
                {t('admin.provisioning.dashboard.dialogs.add.types.okta')}
              </MenuItem>
              <MenuItem value='google' sx={{ fontWeight: 700 }}>
                {t('admin.provisioning.dashboard.dialogs.add.types.google')}
              </MenuItem>
              <MenuItem value='ldap' sx={{ fontWeight: 700 }}>
                {t('admin.provisioning.dashboard.dialogs.add.types.ldap')}
              </MenuItem>
              <MenuItem value='scim' sx={{ fontWeight: 700 }}>
                {t('admin.provisioning.dashboard.dialogs.add.types.scim')}
              </MenuItem>
            </Select>
          </FormControl>
          <TextField
            label={t('admin.provisioning.dashboard.dialogs.add.org_label')}
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
            fullWidth
            type='number'
            placeholder={t('admin.provisioning.dashboard.dialogs.add.org_placeholder')}
            required
            helperText={t('admin.provisioning.dashboard.dialogs.add.org_helper')}
            slotProps={{
              input: { sx: { borderRadius: 3, fontWeight: 600 } },
              inputLabel: { sx: { fontWeight: 700 } },
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2.5 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', fontWeight: 800 }}>
          {t('admin.provisioning.dashboard.dialogs.add.cancel')}
        </Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={!name.trim() || !orgId.trim() || createMutation.isPending}
          sx={{
            bgcolor: 'primary.main',
            boxShadow: (theme) => `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
            fontWeight: 900,
            textTransform: 'none',
            px: 4,
            height: 48,
            borderRadius: 3,
          }}
        >
          {createMutation.isPending
            ? t('admin.provisioning.dashboard.dialogs.add.submitting')
            : t('admin.provisioning.dashboard.dialogs.add.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function DirectorySyncDashboard() {
  const navigate = useNavigate()
  const { t } = useTranslation('auth')
  const { data: connectorsData, isLoading, refetch } = useProvisioningConnectors()
  const [syncingId, setSyncingId] = useState<number | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [logsOpen, setLogsOpen] = useState(false)
  const [logsConnector, setLogsConnector] = useState<{ id: number; name: string } | null>(null)

  const syncMutation = useSyncProvisioningConnector({
    onSuccess: () => {
      toast.success(t('admin.provisioning.dashboard.messages.sync_started'))
      setSyncingId(null)
      refetch()
    },
    onError: (error: unknown) => {
      logger.error('Directory sync failed', { error })
      toast.error(t('admin.provisioning.dashboard.messages.sync_failed'))
      setSyncingId(null)
    },
  })

  const connectors = useMemo<Connector[]>(
    () => (connectorsData?.data as any) ?? [],
    [connectorsData],
  )

  const handleSync = (id: number) => {
    setSyncingId(id)
    syncMutation.mutate(id)
  }

  // â”€â”€ Derived stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const statsValues = useMemo(() => {
    const activeCount = connectors.filter((c: Connector) => c.status === 'active').length
    const totalSynced = connectors.reduce(
      (sum: number, c: Connector) => sum + (c.sync_count ?? 0),
      0,
    )
    const successRate =
      connectors.length > 0 ? Math.round((activeCount / connectors.length) * 100) : 0
    return {
      totalSynced: totalSynced.toLocaleString(),
      activeRatio: `${activeCount}/${connectors.length}`,
      successRate: `${successRate}%`,
    }
  }, [connectors])

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      <style>
        {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
      </style>

      {/* â”€â”€ Dialogs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AddConnectorDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => refetch()}
      />
      {logsConnector && (
        <SyncLogsDialog
          open={logsOpen}
          onClose={() => {
            setLogsOpen(false)
            setLogsConnector(null)
          }}
          connectorId={logsConnector.id}
          connectorName={logsConnector.name}
        />
      )}

      {/* â”€â”€ Pattern 1: Page Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar
            sx={{
              width: 72,
              height: 72,
              borderRadius: '22px',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
              color: 'primary.main',
              boxShadow: (theme) => `0 12px 24px ${alpha(theme.palette.primary.main, 0.18)}`,
            }}
          >
            <CloudDone sx={{ fontSize: 34 }} />
          </Avatar>
          <Box>
            <Typography variant='h4' sx={{ fontWeight: 900, mb: 0.5, letterSpacing: '-0.03em' }}>
              {t('admin.provisioning.dashboard.title')}
            </Typography>
            <Typography variant='body1' color='text.secondary' sx={{ fontWeight: 500 }}>
              {t('admin.provisioning.dashboard.subtitle')}
            </Typography>
          </Box>
        </Box>
        <Stack direction='row' spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant='outlined'
            startIcon={<History />}
            onClick={() => navigate(Path.admin.syncLogs)}
            sx={{
              height: 48,
              px: 3.5,
              borderRadius: 3,
              fontWeight: 800,
              textTransform: 'none',
              borderColor: 'divider',
              color: 'text.primary',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
              },
              flex: { xs: 1, sm: 'none' },
            }}
          >
            {t('admin.provisioning.dashboard.sync_logs')}
          </Button>
          <Button
            variant='contained'
            startIcon={<Add />}
            onClick={() => setAddOpen(true)}
            sx={{
              bgcolor: 'primary.main',
              boxShadow: (theme) => `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': { bgcolor: 'primary.dark' },
              height: 48,
              px: 4,
              borderRadius: 3,
              fontWeight: 900,
              textTransform: 'none',
              flex: { xs: 1, sm: 'none' },
            }}
          >
            {t('admin.provisioning.dashboard.add_connector')}
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        {[
          {
            label: t('admin.provisioning.dashboard.stats.total_users'),
            value: statsValues.totalSynced,
            icon: <CheckCircle />,
            color: 'success' as const,
          },
          {
            label: t('admin.provisioning.dashboard.stats.active_connectors'),
            value: statsValues.activeRatio,
            icon: <Sync />,
            color: 'primary' as const,
          },
          {
            label: t('admin.provisioning.dashboard.stats.success_rate'),
            value: statsValues.successRate,
            icon: <Security />,
            color: 'info' as const,
          },
        ].map((stat) => (
          <Grid key={stat.label} size={{ xs: 12, md: 4 }}>
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
              }}
            >
              <Avatar
                sx={{
                  bgcolor: (theme) => alpha(theme.palette[stat.color].main, 0.1),
                  color: `${stat.color}.main`,
                  width: 60,
                  height: 60,
                  borderRadius: 3,
                }}
              >
                {stat.icon}
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
                  {stat.label}
                </Typography>
                <Typography variant='h5' sx={{ fontWeight: 900, letterSpacing: '-0.01em' }}>
                  {isLoading ? <Skeleton width={60} /> : stat.value}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3.5 }}>
        <Sync color='primary' sx={{ fontSize: 24 }} />
        <Typography
          variant='h6'
          sx={{
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {t('admin.provisioning.connectors.title')}
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        {isLoading ? (
          <>
            <Grid size={{ xs: 12, md: 6 }}>
              <ConnectorSkeleton />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ConnectorSkeleton />
            </Grid>
          </>
        ) : connectors.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Alert severity='info' sx={{ borderRadius: 3, p: 2, fontWeight: 600 }}>
              {t('admin.provisioning.dashboard.empty')}
            </Alert>
          </Grid>
        ) : (
          connectors.map((conn: Connector) => {
            const isSyncing = syncingId === conn.id && syncMutation.isPending
            return (
              <Grid key={conn.id} size={{ xs: 12, md: 6 }}>
                <Card
                  sx={{
                    borderRadius: 5,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-6px)',
                      boxShadow: (theme) =>
                        `0 14px 44px -10px ${alpha(theme.palette.primary.main, 0.12)}`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3.5 }}>
                      <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: 2.5,
                            bgcolor: (theme) => alpha(theme.palette.action.hover, 0.7),
                            color: 'primary.main',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Hub sx={{ fontSize: 26 }} />
                        </Avatar>
                        <Box>
                          <Typography variant='h6' sx={{ fontWeight: 900, mb: 0.25 }}>
                            {conn.name}
                          </Typography>
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            sx={{
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            {conn.type.replace('_', ' ')}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        aria-label={`Sync ${conn.name}`}
                        onClick={() => handleSync(conn.id)}
                        disabled={isSyncing}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2.5,
                          width: 48,
                          height: 48,
                          bgcolor: (theme) => alpha(theme.palette.action.hover, 0.4),
                        }}
                      >
                        <Sync
                          sx={{
                            fontSize: 22,
                            animation: isSyncing ? 'spin 1.5s linear infinite' : 'none',
                          }}
                        />
                      </IconButton>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3.5,
                      }}
                    >
                      <Typography
                        variant='caption'
                        sx={{
                          fontWeight: 800,
                          color: 'text.secondary',
                          textTransform: 'uppercase',
                          letterSpacing: '0.075em',
                        }}
                      >
                        {t('admin.provisioning.dashboard.connector_card.status_label')}
                      </Typography>
                      <StatusChip status={conn.status} />
                    </Box>

                    <Grid container spacing={2.5} sx={{ mb: 4 }}>
                      <Grid size={{ xs: 6 }}>
                        <Card
                          variant='outlined'
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            bgcolor: (theme) => alpha(theme.palette.action.hover, 0.3),
                            borderStyle: 'dashed',
                          }}
                        >
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            sx={{
                              display: 'block',
                              mb: 0.5,
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            {t('admin.provisioning.dashboard.connector_card.last_sync')}
                          </Typography>
                          <Typography variant='body2' sx={{ fontWeight: 800, fontSize: 13 }}>
                            {conn.last_sync_at
                              ? new Date(conn.last_sync_at).toLocaleDateString()
                              : t('admin.provisioning.dashboard.connector_card.never')}
                          </Typography>
                        </Card>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Card
                          variant='outlined'
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            bgcolor: (theme) => alpha(theme.palette.action.hover, 0.3),
                            borderStyle: 'dashed',
                          }}
                        >
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            sx={{
                              display: 'block',
                              mb: 0.5,
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                            }}
                          >
                            {t('admin.provisioning.dashboard.connector_card.sync_count')}
                          </Typography>
                          <Typography variant='h6' sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                            {conn.sync_count ?? 0}
                          </Typography>
                        </Card>
                      </Grid>
                    </Grid>

                    <Divider sx={{ mb: 2.5, borderStyle: 'dotted' }} />

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle
                          sx={{
                            color: conn.status === 'active' ? 'success.main' : 'text.disabled',
                            fontSize: 16,
                          }}
                        />
                        <Typography
                          variant='caption'
                          sx={{ fontWeight: 800, color: 'text.secondary' }}
                        >
                          {conn.status === 'active'
                            ? t('admin.provisioning.dashboard.connector_card.healthy')
                            : conn.error_message ||
                              t('admin.provisioning.dashboard.connector_card.standby') ||
                              'STANDBY'}
                        </Typography>
                      </Box>
                      <Button
                        size='small'
                        endIcon={<ArrowForward />}
                        onClick={() =>
                          navigate(Path.admin.connectorDetail.replace(':id', String(conn.id)))
                        }
                        sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2 }}
                      >
                        {t('admin.provisioning.dashboard.connector_card.manage')}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })
        )}

        <Grid size={{ xs: 12 }}>
          <Card
            sx={{
              p: 4,
              borderRadius: 5,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
              display: 'flex',
              alignItems: { xs: 'flex-start', md: 'center' },
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              gap: 4,
            }}
          >
            <Box sx={{ display: 'flex', gap: 3.5, alignItems: 'center' }}>
              <Avatar
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.12),
                  color: 'secondary.main',
                  width: 68,
                  height: 68,
                  borderRadius: 3.5,
                  boxShadow: (theme) => `0 8px 20px ${alpha(theme.palette.secondary.main, 0.15)}`,
                }}
              >
                <Settings sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography
                  variant='h6'
                  sx={{ fontWeight: 900, mb: 0.5, letterSpacing: '-0.01em' }}
                >
                  {t('admin.provisioning.dashboard.scim_promo.title')}
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ maxWidth: 600, fontWeight: 500, lineHeight: 1.6 }}
                >
                  {t('admin.provisioning.dashboard.scim_promo.subtitle')}
                </Typography>
              </Box>
            </Box>
            <Button
              variant='contained'
              color='secondary'
              onClick={() => navigate(Path.admin.scim)}
              sx={{
                height: 52,
                px: 5,
                borderRadius: 3,
                fontWeight: 900,
                textTransform: 'none',
                boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.secondary.main, 0.25)}`,
                whiteSpace: 'nowrap',
                minWidth: 200,
              }}
            >
              {t('admin.provisioning.dashboard.scim_promo.configure')}
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
