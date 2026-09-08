import React, { useMemo, useState } from 'react'
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Alert,
  Skeleton,
  Stack,
  Chip,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent,
  TimelineDot,
} from '@mui/lab'
import Login from '@mui/icons-material/Login'
import VpnKey from '@mui/icons-material/VpnKey'
import Security from '@mui/icons-material/Security'
import Password from '@mui/icons-material/Password'
import NotificationImportant from '@mui/icons-material/NotificationImportant'
import History from '@mui/icons-material/History'
import Refresh from '@mui/icons-material/Refresh'
import EventBusy from '@mui/icons-material/EventBusy'
import { useTranslation } from 'react-i18next'
import { useActivityTimeline } from '../../hooks/useSessionQuery'
import type { AuditLogItem } from '../../types/session.types'

type TimelineDotColor = 'success' | 'primary' | 'info' | 'warning' | 'error' | 'grey' | 'inherit'

/**
 * Buckets the free-form audit `action` string into the handful of things a
 * user actually scans this page for. Kept next to the icon/colour mapping so
 * a new action type is classified once, not twice.
 */
type ActivityCategory = 'login' | 'security' | 'admin' | 'error' | 'other'

const CATEGORY_FILTERS: Array<{
  id: ActivityCategory | 'all'
  labelKey: string
  fallback: string
}> = [
  { id: 'all', labelKey: 'auth.account.activity.filterAll', fallback: 'All' },
  { id: 'login', labelKey: 'auth.account.activity.filterLogins', fallback: 'Logins' },
  { id: 'security', labelKey: 'auth.account.activity.filterSecurity', fallback: 'Security' },
  { id: 'admin', labelKey: 'auth.account.activity.filterAdmin', fallback: 'Admin' },
  { id: 'error', labelKey: 'auth.account.activity.filterErrors', fallback: 'Errors' },
]

interface ActivityItem {
  id: string
  category: ActivityCategory
  title: string
  description: string
  date: string
  time: string
  icon: React.ReactNode
  color: TimelineDotColor
}

const toActivityItems = (logs: AuditLogItem[]): ActivityItem[] =>
  logs.map((log) => {
    let icon = <History fontSize='small' />
    let color: TimelineDotColor = 'grey'
    let category: ActivityCategory = 'other'
    const actionLower = (log.action || '').toLowerCase()

    if (
      actionLower.includes('login') ||
      actionLower.includes('signin') ||
      actionLower.includes('auth')
    ) {
      icon = <Login fontSize='small' />
      color = 'success'
      category = 'login'
    } else if (actionLower.includes('password')) {
      icon = <Password fontSize='small' />
      color = 'warning'
      category = 'security'
    } else if (actionLower.includes('mfa') || actionLower.includes('security')) {
      icon = <Security fontSize='small' />
      color = 'info'
      category = 'security'
    } else if (actionLower.includes('admin') || actionLower.includes('impersonat')) {
      icon = <Security fontSize='small' />
      color = 'primary'
      category = 'admin'
    } else if (actionLower.includes('token') || actionLower.includes('key')) {
      icon = <VpnKey fontSize='small' />
      color = 'primary'
      category = 'security'
    } else if (
      actionLower.includes('fail') ||
      actionLower.includes('error') ||
      actionLower.includes('revoke')
    ) {
      icon = <NotificationImportant fontSize='small' />
      color = 'error'
      category = 'error'
    }

    const rawTime = log.created_at || (log as any).createdAt
    const timestamp = rawTime ? new Date(rawTime) : new Date()

    return {
      id: String(log.id),
      category,
      title: log.action
        ? log.action.charAt(0).toUpperCase() + log.action.slice(1).replace(/[._-]/g, ' ')
        : 'Activity Event',
      description: `${log.resource_type || 'Account'}${log.resource_id ? ` #${log.resource_id}` : ''}${log.ip_address ? ` • IP: ${log.ip_address}` : ''}`,
      date: Number.isNaN(timestamp.getTime()) ? String(rawTime) : timestamp.toLocaleDateString(),
      time: Number.isNaN(timestamp.getTime()) ? '' : timestamp.toLocaleTimeString(),
      icon,
      color,
    }
  })

export const UserActivityTimeline: React.FC = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  // The alternating layout needs two usable columns; below md it collapses
  // into an unreadable zig-zag, so the timeline runs down one side instead.
  const isWide = useMediaQuery(theme.breakpoints.up('md'))
  const { data, isLoading, isError, error, refetch, isFetching } = useActivityTimeline()

  const rawLogs = useMemo(() => {
    if (Array.isArray(data?.data)) return data.data
    if (data?.data && Array.isArray((data.data as any).logs)) return (data.data as any).logs
    return []
  }, [data])

  const activities = useMemo(() => toActivityItems(rawLogs), [rawLogs])

  const [activeFilter, setActiveFilter] = useState<ActivityCategory | 'all'>('all')

  const counts = useMemo(() => {
    const tally: Record<string, number> = { all: activities.length }
    activities.forEach((item) => {
      tally[item.category] = (tally[item.category] || 0) + 1
    })
    return tally
  }, [activities])

  const visibleActivities = useMemo(
    () =>
      activeFilter === 'all'
        ? activities
        : activities.filter((item) => item.category === activeFilter),
    [activities, activeFilter],
  )

  return (
    <Container maxWidth='lg' sx={{ py: 6 }}>
      <Box
        sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <Box>
          <Typography
            variant='h4'
            fontWeight='bold'
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <History sx={{ mr: 2, fontSize: 36, color: 'primary.main' }} />
            {t('auth.account.activity_timeline_title', 'Activity Timeline')}
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            {t(
              'auth.account.activity_timeline_desc',
              'Chronological feed of login events, security changes, and profile updates to help you monitor your account security.',
            )}
          </Typography>
        </Box>
        <IconButton onClick={() => refetch()} disabled={isLoading || isFetching}>
          <Refresh sx={{ animation: isFetching ? 'spin 1s linear infinite' : 'none' }} />
        </IconButton>
      </Box>

      {!isLoading && !isError && activities.length > 0 && (
        <Stack
          direction='row'
          spacing={1}
          flexWrap='wrap'
          useFlexGap
          role='group'
          aria-label={t('auth.account.activity.filterLabel', 'Filter activity')}
          sx={{ mb: 3 }}
        >
          {CATEGORY_FILTERS.map((filter) => {
            const count = counts[filter.id] || 0
            const selected = activeFilter === filter.id
            return (
              <Chip
                key={filter.id}
                clickable
                aria-pressed={selected}
                disabled={filter.id !== 'all' && count === 0}
                color={selected ? 'primary' : 'default'}
                variant={selected ? 'filled' : 'outlined'}
                onClick={() => setActiveFilter(filter.id)}
                label={`${t(filter.labelKey, filter.fallback)} (${count})`}
                sx={{ height: 36, fontWeight: 700, borderRadius: 2 }}
              />
            )
          })}
        </Stack>
      )}

      <Paper variant='outlined' sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>
        {isLoading ? (
          <Stack spacing={3} sx={{ py: 4, px: 2 }}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Skeleton variant='circular' width={36} height={36} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant='text' width='40%' height={24} />
                  <Skeleton variant='text' width='70%' height={18} />
                </Box>
                <Skeleton variant='text' width='15%' height={20} />
              </Box>
            ))}
          </Stack>
        ) : isError ? (
          <Box sx={{ py: 4 }}>
            <Alert
              severity='error'
              action={
                <Button
                  color='inherit'
                  size='small'
                  startIcon={<Refresh />}
                  onClick={() => refetch()}
                >
                  {t('auth.account.activity.retry', 'Retry')}
                </Button>
              }
            >
              {error?.message ||
                t(
                  'auth.account.activity.load_failed',
                  'Unable to load activity. Please try again.',
                )}
            </Alert>
          </Box>
        ) : visibleActivities.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <EventBusy sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant='h6' fontWeight={600} gutterBottom>
              {activeFilter === 'all'
                ? t('auth.account.activity.no_recent_activity', 'No recent activity found')
                : t('auth.account.activity.no_matching_activity', 'No matching activity')}
            </Typography>
            <Typography color='text.secondary'>
              {activeFilter === 'all'
                ? t(
                    'auth.account.activity.no_activity_desc',
                    'Security and login events will appear here in chronological order.',
                  )
                : t(
                    'auth.account.activity.no_matching_desc',
                    'No events in this category yet. Choose another filter to see more.',
                  )}
            </Typography>
          </Box>
        ) : (
          <Timeline position={isWide ? 'alternate' : 'right'}>
            {visibleActivities.map((activity, index) => (
              <TimelineItem key={activity.id}>
                <TimelineOppositeContent
                  align={isWide && index % 2 === 0 ? 'right' : 'left'}
                  sx={{ m: 'auto 0', flex: isWide ? 1 : 0, px: isWide ? undefined : 0 }}
                  color='text.secondary'
                >
                  <Typography variant='subtitle2' fontWeight='bold'>
                    {activity.date}
                  </Typography>
                  <Typography variant='caption'>{activity.time}</Typography>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineConnector />
                  <TimelineDot color={activity.color}>{activity.icon}</TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent sx={{ py: '12px', px: 2 }}>
                  <Paper
                    variant='outlined'
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'background.default',
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: (theme) => theme.shadows[2],
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    <Typography variant='subtitle1' fontWeight='bold'>
                      {activity.title}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {activity.description}
                    </Typography>
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        )}
      </Paper>

      {!isLoading && !isError && visibleActivities.length > 0 && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant='text'
            color='primary'
            startIcon={<Refresh />}
            disabled={isFetching}
            onClick={() => refetch()}
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
          >
            {t('auth.account.activity.refresh', 'Refresh activity')}
          </Button>
        </Box>
      )}
    </Container>
  )
}

export default UserActivityTimeline
