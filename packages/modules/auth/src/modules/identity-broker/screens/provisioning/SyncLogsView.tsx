import React, { useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Avatar,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  useTheme,
  alpha,
  Pagination,
} from '@mui/material'
import History from '@mui/icons-material/History';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Refresh from '@mui/icons-material/Refresh';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import Download from '@mui/icons-material/Download';
import FilterList from '@mui/icons-material/FilterList';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Hub from '@mui/icons-material/Hub';
import Settings from '@mui/icons-material/Settings';
import Storage from '@mui/icons-material/Storage';
import Info from '@mui/icons-material/Info';
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next'
import {
  useProvisioningConnectors,
  useProvisioningConnectorLogs,
} from "@cap/module-auth/modules/authentication-core/hooks/useAdminQuery"


const SyncLogsView: React.FC = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { t } = useTranslation('auth')

  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  const { data: connectorsData, isLoading: isConnectorsLoading } = useProvisioningConnectors()
  const connectors = useMemo(() => (connectorsData?.data as any) ?? [], [connectorsData])

  const [selectedConnectorId, setSelectedConnectorId] = useState<number | null>(null)

  // Auto-select first connector if none selected
  React.useEffect(() => {
    if (!selectedConnectorId && connectors.length > 0) {
      setSelectedConnectorId(connectors[0].id)
    }
  }, [connectors, selectedConnectorId])

  const {
    data: logsData,
    isLoading: isLogsLoading,
    refetch,
  } = useProvisioningConnectorLogs(selectedConnectorId || 0, { queryKey: ['logs', page, pageSize] } as any)

  const logs = (logsData?.data as any)?.data ?? []
  const pagination = (logsData?.data as any)?.meta ?? { total: 0, last_page: 1 }

  const handleRefresh = () => {
    refetch()
    toast.info(t('admin.provisioning.logs.messages.refreshed'))
  }

  const handleExport = () => {
    toast.info(t('admin.provisioning.logs.messages.exporting'))
  }

  const getEventChip = (event: string) => {
    if (!event) return null
    const eventStr = String(event)
    const isError =
      eventStr.toLowerCase().includes('error') || eventStr.toLowerCase().includes('fail')
    const isUpdate = eventStr.toLowerCase().includes('update')
    return (
      <Chip
        label={(eventStr || '').replace(/_/g, ' ').toUpperCase()}
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

  if (isConnectorsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress thickness={4} size={40} />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
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
              bgcolor: alpha(theme.palette.secondary.main, 0.12),
              color: 'secondary.main',
              boxShadow: `0 12px 24px ${alpha(theme.palette.secondary.main, 0.18)}`,
            }}
          >
            <History sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{
                p: 0,
                mb: 0.5,
                color: 'text.secondary',
                '&:hover': { bgcolor: 'transparent', color: 'primary.main' },
              }}
            >
              <ArrowBack sx={{ fontSize: 20 }} />
            </IconButton>
            <Typography variant='h4' sx={{ fontWeight: 900, letterSpacing: '-0.027em' }}>
              {t('admin.provisioning.logs.title')}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
              {t('admin.provisioning.logs.subtitle')}
            </Typography>
          </Box>
        </Box>

        <Stack direction='row' spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant='outlined'
            startIcon={<Download />}
            onClick={handleExport}
            sx={{
              height: 44,
              px: 3,
              borderRadius: 2.5,
              fontWeight: 800,
              textTransform: 'none',
              borderColor: 'divider',
              color: 'text.primary',
              flex: { xs: 1, sm: 'none' },
            }}
          >
            {t('admin.provisioning.logs.export')}
          </Button>
          <Button
            variant='contained'
            startIcon={<Refresh />}
            onClick={handleRefresh}
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
            {t('admin.provisioning.logs.refresh')}
          </Button>
        </Stack>
      </Box>

      <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Paper
          sx={{
            p: 1.5,
            flex: 1,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.8),
          }}
        >
          <FormControl variant='standard' sx={{ minWidth: 240 }}>
            <InputLabel
              id='connector-label'
              sx={{
                ml: 1,
                fontWeight: 800,
                fontSize: 11,
                letterSpacing: '0.05em',
                transform: 'translate(0, -14px) scale(0.85)',
                color: 'text.secondary',
              }}
            >
              {t('admin.provisioning.logs.connector_label')}
            </InputLabel>
            <Select
              labelId='connector-label'
              value={selectedConnectorId || ''}
              onChange={(e) => {
                setSelectedConnectorId(Number(e.target.value))
                setPage(1)
              }}
              disableUnderline
              sx={{
                height: 38,
                px: 1,
                fontWeight: 800,
                fontSize: 14,
                '& .MuiSelect-select': { py: 0, display: 'flex', alignItems: 'center' },
              }}
            >
              {connectors.map((c: any) => (
                <MenuItem key={c.id} value={c.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Hub sx={{ fontSize: 18, color: 'primary.main' }} />
                    <Typography variant='body2' sx={{ fontWeight: 800 }}>
                      {c.name}
                    </Typography>
                    <Chip
                      label={c.type}
                      size='small'
                      sx={{ height: 18, fontSize: 9, fontWeight: 900, ml: 1, borderRadius: 1 }}
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        <Tooltip title={t('admin.provisioning.logs.filters')}>
          <IconButton
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2.5,
              width: 48,
              height: 48,
            }}
          >
            <FilterList />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            label: t('admin.provisioning.logs.stats.sync_count'),
            value: selectedConnectorId
              ? connectors.find((c: any) => c.id === selectedConnectorId)?.syncCount || 0
              : 0,
            icon: <Storage />,
            color: 'primary',
          },
          {
            label: t('admin.provisioning.logs.stats.success_rate'),
            value: '100%',
            icon: <CheckCircle />,
            color: 'success',
          },
          {
            label: t('admin.provisioning.logs.stats.errors'),
            value: 0,
            icon: <ErrorIcon />,
            color: 'error',
          },
        ].map((stat, i) => (
          <Grid key={i} size={{ xs: 12, md: 4 }}>
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
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: alpha(
                    theme.palette[stat.color as 'primary' | 'success' | 'error'].main,
                    0.1,
                  ),
                  color: `${stat.color}.main`,
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                }}
              >
                {stat.icon}
              </Avatar>
              <Box>
                <Typography
                  variant='caption'
                  sx={{
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.075em',
                    color: 'text.secondary',
                    display: 'block',
                    mb: 0.5,
                  }}
                >
                  {stat.label}
                </Typography>
                <Typography variant='h5' sx={{ fontWeight: 900, letterSpacing: '-0.01em' }}>
                  {stat.value}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card
        sx={{
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <Box
          sx={{
            p: 3,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Settings color='primary' sx={{ fontSize: 24 }} />
          <Typography
            variant='h6'
            sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            {t('admin.provisioning.logs.event_logs')}
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          {isLogsLoading ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <CircularProgress thickness={5} size={32} />
              <Typography variant='body2' color='text.secondary' sx={{ mt: 2, fontWeight: 700 }}>
                {t('admin.provisioning.logs.messages.fetching')}
              </Typography>
            </Box>
          ) : logs.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                }}
              >
                <History sx={{ color: 'primary.main' }} />
              </Avatar>
              <Typography variant='h6' sx={{ fontWeight: 900, mb: 0.5 }}>
                {t('admin.provisioning.logs.no_logs_title')}
              </Typography>
              <Typography color='text.secondary' sx={{ fontWeight: 500 }}>
                {t('admin.provisioning.logs.no_logs_desc')}
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
                <Table size='small'>
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
                        {t('admin.provisioning.logs.table.timestamp').toUpperCase()}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 900,
                          py: 2,
                          letterSpacing: '0.05em',
                          color: 'text.secondary',
                        }}
                      >
                        {t('admin.provisioning.logs.table.event').toUpperCase()}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 900,
                          py: 2,
                          letterSpacing: '0.05em',
                          color: 'text.secondary',
                        }}
                      >
                        {t('admin.provisioning.logs.table.target').toUpperCase()}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 900,
                          py: 2,
                          letterSpacing: '0.05em',
                          color: 'text.secondary',
                        }}
                      >
                        {t('admin.provisioning.logs.table.status').toUpperCase()}
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
                        {t('admin.provisioning.logs.table.details').toUpperCase()}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.map((log: any) => (
                      <TableRow
                        key={log.id}
                        hover
                        sx={{ '& td': { py: 2.5 }, '&:last-child td': { borderBottom: 'none' } }}
                      >
                        <TableCell>
                          <Typography variant='body2' sx={{ fontWeight: 700 }}>
                            {new Date(log.createdAt || log.created_at).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>{getEventChip(log.event || log.action)}</TableCell>
                        <TableCell>
                          <Typography
                            variant='body2'
                            sx={{
                              fontWeight: 800,
                              fontFamily: 'monospace',
                              bgcolor: alpha(theme.palette.action.hover, 0.8),
                              px: 1.25,
                              py: 0.5,
                              borderRadius: 1.5,
                              display: 'inline-block',
                              fontSize: '0.8rem',
                            }}
                          >
                            {log.target || t('common.not_available') || 'â€”'}
                          </Typography>
                        </TableCell>
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
                                textTransform: 'uppercase',
                                fontSize: 11,
                                letterSpacing: '0.02em',
                              }}
                            >
                              {t(String(log.status)).toUpperCase()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align='right'>
                          <IconButton
                            size='small'
                            sx={{ bgcolor: alpha(theme.palette.action.hover, 0.5) }}
                          >
                            <ChevronRight fontSize='small' />
                          </IconButton>
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
        </Box>
      </Card>

      {/* Troubleshooting Alert Section */}
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
            {t('admin.provisioning.logs.helper_title')}
          </Typography>
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ fontWeight: 500, lineHeight: 1.5 }}
          >
            {t('admin.provisioning.logs.helper_desc')}
          </Typography>
        </Box>
        <Button
          variant='outlined'
          color='info'
          sx={{ fontWeight: 900, textTransform: 'none', borderRadius: 2.5, px: 4, height: 44 }}
        >
          {t('common.documentation') || 'Documentation'}
        </Button>
      </Card>
    </Box>
  )
}

export default SyncLogsView


