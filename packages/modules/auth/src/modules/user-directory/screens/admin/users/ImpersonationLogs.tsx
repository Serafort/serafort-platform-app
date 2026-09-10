import React, { useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  alpha,
  useTheme,
  Stack,
  Divider,
  Paper,
  Tooltip,
  Avatar,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Menu,
  MenuItem,
  CircularProgress,
  Container,
} from '@mui/material'
import ArrowBack from '@mui/icons-material/ArrowBack'
import Search from '@mui/icons-material/Search'
import FilterList from '@mui/icons-material/FilterList'
import Download from '@mui/icons-material/Download'
import Security from '@mui/icons-material/Security'
import History from '@mui/icons-material/History'
import Person from '@mui/icons-material/Person'
import CheckCircle from '@mui/icons-material/CheckCircle'
import MoreVert from '@mui/icons-material/MoreVert'
import Block from '@mui/icons-material/Block'
import AssignmentTurnedIn from '@mui/icons-material/AssignmentTurnedIn'
import Refresh from '@mui/icons-material/Refresh'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ImpersonationRecord } from '@cap/shared-types'
import { useImpersonationLogs } from '../../../../authentication-core'
import { format, formatDistanceToNow } from 'date-fns'
import { buildLayoutSurfaceEffect } from '@cap/layout'
import { getTenantThemeEffects } from '@cap/theme'
import Path from '../../path'

export default function ImpersonationLogs() {
  const { t } = useTranslation('common')
  const theme = useTheme()
  const navigate = useNavigate()

  const {
    data: logsResponse,
    isLoading: isFetching,
    refetch,
  } = useImpersonationLogs({ page: 1, limit: 100 })
  const logs = useMemo(() => {
    // Backend returns a paginator object { meta, data: [] }
    if (
      logsResponse?.data &&
      'data' in (logsResponse.data as any) &&
      Array.isArray((logsResponse.data as any).data)
    ) {
      return (logsResponse.data as any).data as ImpersonationRecord[]
    }
    // Fallback if it's already an array or empty
    return (Array.isArray(logsResponse?.data) ? logsResponse.data : []) as ImpersonationRecord[]
  }, [logsResponse])

  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null)
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedLog, setSelectedLog] = useState<ImpersonationRecord | null>(null)

  const filteredLogs = useMemo(() => {
    return logs.filter(
      (log: ImpersonationRecord) =>
        log.actorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actorEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.targetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.targetEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.reason?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [logs, searchTerm])

  const paginatedLogs = useMemo(() => {
    return filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  }, [filteredLogs, page, rowsPerPage])

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'completed':
        return 'default'
      case 'revoked':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle fontSize='small' color='success' />
      case 'completed':
        return <AssignmentTurnedIn fontSize='small' color='action' />
      case 'revoked':
        return <Block fontSize='small' color='error' />
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Container maxWidth='xl' sx={{ py: 4 }}>
        {/* Back Navigation */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(Path.admin.users.list)}
            sx={{
              minHeight: 44,
              px: 2,
              borderRadius: 'var(--sf-radius-md, 8px)',
              textTransform: 'none',
              fontWeight: 600,
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary',
                bgcolor: 'action.hover',
              },
            }}
          >
            {t('auth.admin.backToUsers', 'Back to Users')}
          </Button>
        </Box>

        {/* Header with Visual Anchor */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2.5,
            mb: 4,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 'var(--sf-radius-lg, 24px)',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Security sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant='h4' sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.02em' }}>
                {t('auth.admin.impersonationLogs', 'Impersonation Logs')}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {t('auth.admin.auditTrailDesc', 'Audit trail of all administrative access sessions')}
              </Typography>
            </Box>
          </Box>
          <Stack direction='row' spacing={1.5} alignItems='center'>
            <Tooltip title={t('auth.common.refresh', 'Refresh Logs')}>
              <IconButton
                onClick={() => refetch()}
                disabled={isFetching}
                aria-label={t('auth.common.refresh', 'Refresh logs')}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--sf-radius-md, 8px)',
                  border: '1px solid ' + theme.palette.divider,
                  bgcolor: 'background.paper',
                }}
              >
                <Refresh color={isFetching ? 'disabled' : 'inherit'} />
              </IconButton>
            </Tooltip>
            <Button
              variant='outlined'
              startIcon={<Download />}
              sx={{
                minHeight: 44,
                px: 2.5,
                borderRadius: 'var(--sf-radius-md, 8px)',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              {t('auth.admin.exportCsv', 'Export CSV')}
            </Button>
          </Stack>
        </Box>

      {/* Stats/Overview Card */}
      <Card
        sx={(theme: any) => ({
          mb: 4,
          borderRadius: 'var(--sf-radius-lg, 16px)',
          border: '1px dashed ' + alpha(theme.palette.primary.main, 0.25),
          ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
        })}
      >
        <CardContent
          sx={{
            py: 3,
            px: { xs: 2.5, sm: 4 },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: 3,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, sm: 5 }}
            sx={{ overflowX: 'auto', width: '100%', pb: { xs: 1, md: 0 } }}
          >
            <Box>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                {t('auth.admin.activeSessions', 'Active Sessions')}
              </Typography>
              <Typography
                variant='h4'
                sx={{
                  fontWeight: 800,
                  color: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mt: 0.5,
                }}
              >
                {logs.filter((l: ImpersonationRecord) => l.status === 'active').length}
                <Box
                  component='span'
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    display: 'inline-block',
                    boxShadow: '0 0 0 2px ' + alpha(theme.palette.success.main, 0.2),
                  }}
                />
              </Typography>
            </Box>
            <Box>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                {t('auth.admin.totalRecords', 'Total Records (30d)')}
              </Typography>
              <Typography variant='h4' sx={{ fontWeight: 800, mt: 0.5 }}>
                {logs.length}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                {t('auth.admin.highRiskEvents', 'High Risk Events')}
              </Typography>
              <Typography variant='h4' sx={{ fontWeight: 800, color: 'warning.main', mt: 0.5 }}>
                0
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          fullWidth
          size='small'
          placeholder={t('auth.admin.searchLogs', 'Search by admin, user, or reason...')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: {
                minHeight: 44,
                borderRadius: 'var(--sf-radius-md, 8px)',
                bgcolor: 'background.paper',
              },
            },
          }}
          sx={{ flex: { xs: '1 1 100%', sm: 1 } }}
        />
        <Button
          variant='outlined'
          startIcon={<FilterList />}
          onClick={(e) => setFilterAnchorEl(e.currentTarget)}
          sx={{
            minHeight: 44,
            px: 2.5,
            borderRadius: 'var(--sf-radius-md, 8px)',
            textTransform: 'none',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            color: 'text.primary',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          {t('auth.admin.filter', 'Filter')}
        </Button>
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={() => setFilterAnchorEl(null)}
          slotProps={{
            paper: {
              elevation: 3,
              sx: { borderRadius: 'var(--sf-radius-md, 8px)', minWidth: 200, mt: 1 },
            },
          }}
        >
          <MenuItem onClick={() => setFilterAnchorEl(null)}>All Statuses</MenuItem>
          <MenuItem onClick={() => setFilterAnchorEl(null)}>Active Only</MenuItem>
          <MenuItem onClick={() => setFilterAnchorEl(null)}>Last 24 Hours</MenuItem>
          <MenuItem onClick={() => setFilterAnchorEl(null)}>Last 7 Days</MenuItem>
        </Menu>
      </Box>

      {/* Table Card */}
      <Paper
        sx={(theme: any) => ({
          borderRadius: 'var(--sf-radius-lg, 16px)',
          overflow: 'hidden',
          border: '1px solid ' + theme.palette.divider,
          ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
        })}
      >
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.action.hover, 0.4) }}>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                    color: 'text.secondary',
                  }}
                >
                  Date & Time
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                    color: 'text.secondary',
                  }}
                >
                  Administrator (Actor)
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                    color: 'text.secondary',
                  }}
                >
                  Target User
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                    color: 'text.secondary',
                  }}
                >
                  Reason
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                    color: 'text.secondary',
                  }}
                >
                  Status
                </TableCell>
                <TableCell align='right'></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          mb: 2,
                          borderRadius: 'var(--sf-radius-md, 8px)',
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                        }}
                      >
                        <History sx={{ fontSize: 32, color: 'primary.main' }} />
                      </Avatar>
                      <Typography variant='h6' sx={{ fontWeight: 700, mb: 0.5 }}>
                        {t('auth.admin.noLogsFound', 'No logs found')}
                      </Typography>
                      <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                        {t(
                          'auth.admin.noLogsHint',
                          'Try adjusting your search or resetting filters.',
                        )}
                      </Typography>
                      <Button
                        variant='outlined'
                        color='primary'
                        startIcon={<Refresh />}
                        onClick={() => {
                          setSearchTerm('')
                          refetch()
                        }}
                        sx={{
                          minHeight: 44,
                          px: 2.5,
                          borderRadius: 'var(--sf-radius-md, 8px)',
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        {t('auth.admin.resetAndRefresh', 'Reset Filters & Refresh')}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLogs.map((log: ImpersonationRecord) => (
                  <TableRow
                    key={log.id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant='body2' sx={{ fontWeight: 700 }}>
                        {format(new Date(log.startedAt), 'MMM dd, yyyy')}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {format(new Date(log.startedAt), 'HH:mm:ss')} •{' '}
                        {formatDistanceToNow(new Date(log.startedAt))} ago
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Stack direction='row' spacing={1.5} alignItems='center'>
                        <Avatar
                          src={log.actorAvatar}
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 'var(--sf-radius-xs, 4px)',
                            bgcolor: 'primary.main',
                            fontSize: '0.875rem',
                            fontWeight: 700,
                          }}
                        >
                          {log.actorName?.charAt(0) || <Person />}
                        </Avatar>
                        <Box>
                          <Typography variant='body2' sx={{ fontWeight: 700 }}>
                            {log.actorName}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {log.actorEmail}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Stack direction='row' spacing={1.5} alignItems='center'>
                        <Box sx={{ position: 'relative' }}>
                          <Avatar
                            src={log.targetAvatar}
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 'var(--sf-radius-xs, 4px)',
                              bgcolor: 'secondary.main',
                              fontSize: '0.875rem',
                              fontWeight: 700,
                            }}
                          >
                            {log.targetName?.charAt(0) || <Person />}
                          </Avatar>
                          <Security
                            sx={{
                              position: 'absolute',
                              bottom: -4,
                              right: -4,
                              fontSize: 14,
                              color: 'warning.main',
                              bgcolor: 'background.paper',
                              borderRadius: '50%',
                            }}
                          />
                        </Box>
                        <Box>
                          <Typography variant='body2' sx={{ fontWeight: 700 }}>
                            {log.targetName}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {log.targetEmail}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Tooltip title={log.reason || 'No reason provided'}>
                        <Typography
                          variant='body2'
                          sx={{
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: log.reason ? 'text.primary' : 'text.disabled',
                            fontStyle: log.reason ? 'normal' : 'italic',
                          }}
                        >
                          {log.reason || 'No reason specified'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        icon={getStatusIcon(log.status) || undefined}
                        label={log.status}
                        size='small'
                        color={getStatusColor(log.status) as any}
                        variant={log.status === 'active' ? 'filled' : 'outlined'}
                        sx={{
                          height: 24,
                          fontWeight: 700,
                          borderRadius: 'var(--sf-radius-xs, 4px)',
                          textTransform: 'capitalize',
                          ...(log.status === 'active' && {
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            color: 'success.main',
                            borderColor: alpha(theme.palette.success.main, 0.2),
                            border: '1px solid',
                          }),
                        }}
                      />
                    </TableCell>
                    <TableCell align='right' sx={{ py: 2 }}>
                      <IconButton
                        size='small'
                        onClick={(e) => {
                          setSelectedLog(log)
                          setActionAnchorEl(e.currentTarget)
                        }}
                        aria-label='More actions'
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 'var(--sf-radius-md, 8px)',
                        }}
                      >
                        <MoreVert fontSize='small' />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ opacity: 0.1 }} />

        <TablePagination
          component='div'
          count={filteredLogs.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              fontWeight: 600,
            },
          }}
        />
      </Paper>

      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={() => {
          setActionAnchorEl(null)
          setSelectedLog(null)
        }}
        slotProps={{
          paper: {
            elevation: 3,
            sx: { borderRadius: 'var(--sf-radius-md, 8px)', minWidth: 220, mt: 1 },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => {
            setActionAnchorEl(null)
            // handle view details
          }}
          sx={{ py: 1.5 }}
        >
          <History fontSize='small' sx={{ mr: 2, color: 'text.secondary' }} />
          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            View Session Details
          </Typography>
        </MenuItem>

        {selectedLog?.status === 'active' && [
          <Divider key='div1' sx={{ my: 1, opacity: 0.1 }} />,
          <MenuItem
            key='revoke'
            onClick={() => {
              setActionAnchorEl(null)
              // handle revoke
            }}
            sx={{ py: 1.5, color: 'error.main' }}
          >
            <Block fontSize='small' sx={{ mr: 2, color: 'inherit' }} />
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
              Force Terminate Session
            </Typography>
          </MenuItem>,
        ]}
      </Menu>
      </Container>
    </motion.div>
  )
}
