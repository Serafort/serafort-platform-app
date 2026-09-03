import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Stack,
  Tooltip,
  useTheme,
  alpha,
  Paper,
  CircularProgress,
  TablePagination,
} from '@mui/material'
import Search from '@mui/icons-material/Search';
import FilterList from '@mui/icons-material/FilterList';
import Circle from '@mui/icons-material/Circle';
import Login from '@mui/icons-material/Login';
import VpnKey from '@mui/icons-material/VpnKey';
import Block from '@mui/icons-material/Block';
import Security from '@mui/icons-material/Security';
import GppGood from '@mui/icons-material/GppGood';
import Info from '@mui/icons-material/Info';
import { useTranslation } from 'react-i18next'
import { useAuditLogs } from "@cap/module-auth/modules/authentication-core/hooks/useAdminQuery"

export default function AuthEventsMonitor() {
  const { t } = useTranslation('common')
  const theme = useTheme()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [search, setSearch] = useState('')
  const [isLive, setIsLive] = useState(true)

  const { data, isLoading, error } = useAuditLogs(
    {
      page,
      limit,
      action: search || undefined,
    },
    { refetchInterval: isLive ? 5000 : false },
  )

  const events = (data?.data as any)?.data || []
  const totalCount = (data?.data as any)?.meta?.total || 0

  const getEventIcon = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'login_success':
      case 'login':
        return <Login sx={{ color: 'success.main', fontSize: 18 }} />
      case 'mfa_challenge':
      case 'mfa_failed':
        return <Security sx={{ color: 'warning.main', fontSize: 18 }} />
      case 'account_locked':
      case 'permission_denied':
      case 'user_suspended':
      case 'failed_login':
        return <Block sx={{ color: 'error.main', fontSize: 18 }} />
      case 'password_changed':
      case 'password_reset':
        return <VpnKey sx={{ color: 'info.main', fontSize: 18 }} />
      case 'impersonation_start':
      case 'user_impersonation_start':
      case 'user_impersonation':
      case 'impersonation':
        return <GppGood sx={{ color: 'warning.main', fontSize: 18 }} />
      default:
        if (action?.toLowerCase().includes('failed')) {
          return <Block sx={{ color: 'error.main', fontSize: 18 }} />
        }
        return <Circle sx={{ color: 'action.active', fontSize: 18 }} />
    }
  }

  const getSeverityColor = (action: string) => {
    const act = action?.toLowerCase() || ''
    if (
      act.includes('failed') ||
      act.includes('locked') ||
      act.includes('denied') ||
      act.includes('suspended') ||
      act.includes('error')
    ) {
      return 'error'
    }
    if (
      act.includes('mfa') ||
      act.includes('impersonation') ||
      act.includes('suspicious') ||
      act.includes('warning')
    ) {
      return 'warning'
    }
    return 'info'
  }

  const getSeverityLabel = (action: string) => {
    return getSeverityColor(action)
  }

  const handlePageChange = (_event: unknown, newPage: number) => {
    setPage(newPage + 1)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLimit(parseInt(event.target.value, 10))
    setPage(1)
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant='h4' sx={{ fontWeight: 900, letterSpacing: '-0.027em', mb: 1 }}>
            {t('auth.admin.eventsMonitor')}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {t('auth.admin.eventsMonitor_subtitle')}
          </Typography>
        </Box>
        <Stack direction='row' spacing={1}>
          <Tooltip title='Pause Stream'>
            <Chip
              label={isLive ? 'Live' : 'Paused'}
              color={isLive ? 'success' : 'default'}
              size='small'
              onClick={() => setIsLive(!isLive)}
              deleteIcon={
                isLive ? (
                  <Circle sx={{ animation: 'pulse 1.5s infinite', fontSize: '10px !important' }} />
                ) : undefined
              }
              onDelete={isLive ? () => setIsLive(!isLive) : undefined}
              sx={{ fontWeight: 800, px: 1, cursor: 'pointer' }}
            />
          </Tooltip>
        </Stack>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              size='small'
              placeholder={t('auth.admin.searchEventsPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    {isLoading ? (
                      <CircularProgress size={16} />
                    ) : (
                      <Search fontSize='small' color='action' />
                    )}
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: { sm: 400 } }}
            />
            <Box sx={{ flexGrow: 1 }} />
            <Button
              startIcon={<FilterList fontSize='small' />}
              size='small'
              sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}
            >
              {t('auth.common.filters')}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Events Table */}
      <TableContainer
        component={Paper}
        variant='outlined'
        sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
      >
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ bgcolor: alpha(theme.palette.action.hover, 0.5) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                {t('auth.admin.colEventType')}
              </TableCell>
              <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                {t('auth.admin.colSubjectUser')}
              </TableCell>
              <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                {t('auth.admin.colSourceIp')}
              </TableCell>
              <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                {t('auth.common.timestamp')}
              </TableCell>
              <TableCell
                sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}
                align='right'
              >
                {t('auth.admin.colSeverity')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && !data && (
              <TableRow>
                <TableCell colSpan={5} align='center' sx={{ py: 8 }}>
                  <CircularProgress size={32} />
                  <Typography variant='body2' sx={{ mt: 2 }} color='text.secondary'>
                    {t('auth.admin.loadingEvents', 'Loading events...')}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={5} align='center' sx={{ py: 6 }}>
                  <Typography color='error' sx={{ fontWeight: 600 }}>
                    {t('auth.admin.errorLoadingEvents', 'Failed to load events. Please try again.')}
                  </Typography>
                  <Button
                    variant='outlined'
                    color='inherit'
                    size='small'
                    sx={{ mt: 2 }}
                    onClick={() => window.location.reload()}
                  >
                    {t('auth.common.retry', 'Retry')}
                  </Button>
                </TableCell>
              </TableRow>
            )}
            {events.length === 0 && !isLoading && !error && (
              <TableRow>
                <TableCell colSpan={5} align='center' sx={{ py: 8 }}>
                  <Typography variant='body2' color='text.secondary'>
                    {t('auth.admin.noEventsFound', 'No events found')}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {events.map((event: any) => (
              <TableRow
                key={event.id}
                hover
                sx={{
                  '& td': {
                    borderBottom: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.5),
                  },
                }}
              >
                <TableCell>
                  <Stack direction='row' spacing={1.5} alignItems='center'>
                    {getEventIcon(event.action)}
                    <Typography variant='body2' sx={{ fontWeight: 700 }}>
                      {event.action?.replace(/_/g, ' ') || 'Unknown'}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {event.user?.email || event.userId || 'System'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      {event.ipAddress || 'Unknown IP'}
                    </Typography>
                    {event.userAgent && (
                      <Typography variant='caption' color='text.secondary'>
                        {event.userAgent.split(' ')[0]}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ fontFamily: 'monospace' }}
                  >
                    {new Date(event.createdAt).toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell align='right'>
                  <Chip
                    label={getSeverityLabel(event.action)}
                    size='small'
                    color={getSeverityColor(event.action) as any}
                    variant='outlined'
                    sx={{
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      fontSize: '0.6rem',
                      height: 18,
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component='div'
          count={totalCount}
          page={page - 1}
          onPageChange={handlePageChange}
          rowsPerPage={limit}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage={t('auth.common.rowsPerPage', 'Rows per page:')}
        />
      </TableContainer>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <Info fontSize='inherit' sx={{ mr: 0.5 }} />{' '}
          {t('auth.admin.eventsCountFooter', {
            count: totalCount,
            defaultValue: `Showing ${events.length} of ${totalCount} events`,
          })}
        </Typography>
      </Box>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `,
        }}
      />
    </Box>
  )
}
