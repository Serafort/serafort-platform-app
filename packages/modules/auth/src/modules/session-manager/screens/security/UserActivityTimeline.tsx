import React, { useMemo } from 'react'
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Alert,
  Skeleton,
  Stack,
  IconButton,
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

interface ActivityItem {
  id: string
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
    const actionLower = (log.action || '').toLowerCase()

    if (actionLower.includes('login') || actionLower.includes('signin') || actionLower.includes('auth')) {
      icon = <Login fontSize='small' />
      color = 'success'
    } else if (actionLower.includes('password')) {
      icon = <Password fontSize='small' />
      color = 'warning'
    } else if (actionLower.includes('mfa') || actionLower.includes('security')) {
      icon = <Security fontSize='small' />
      color = 'info'
    } else if (actionLower.includes('token') || actionLower.includes('key')) {
      icon = <VpnKey fontSize='small' />
      color = 'primary'
    } else if (actionLower.includes('fail') || actionLower.includes('error') || actionLower.includes('revoke')) {
      icon = <NotificationImportant fontSize='small' />
      color = 'error'
    }

    const rawTime = log.created_at || (log as any).createdAt
    const timestamp = rawTime ? new Date(rawTime) : new Date()

    return {
      id: String(log.id),
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
  const { data, isLoading, isError, error, refetch, isFetching } = useActivityTimeline()

  const rawLogs = useMemo(() => {
    if (Array.isArray(data?.data)) return data.data
    if (data?.data && Array.isArray((data.data as any).logs)) return (data.data as any).logs
    return []
  }, [data])

  const activities = useMemo(() => toActivityItems(rawLogs), [rawLogs])

  return (
    <Container maxWidth='lg' sx={{ py: 6 }}>
      <Box sx={{ mb: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
              'Chronological feed of login events, security changes, and profile updates to help you monitor your account security.'
            )}
          </Typography>
        </Box>
        <IconButton onClick={() => refetch()} disabled={isLoading || isFetching}>
          <Refresh sx={{ animation: isFetching ? 'spin 1s linear infinite' : 'none' }} />
        </IconButton>
      </Box>

      <Paper variant='outlined' sx={{ p: 4, borderRadius: 3 }}>
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
              {error?.message || t('auth.account.activity.load_failed', 'Unable to load activity. Please try again.')}
            </Alert>
          </Box>
        ) : activities.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <EventBusy sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant='h6' fontWeight={600} gutterBottom>
              {t('auth.account.activity.no_recent_activity', 'No recent activity found')}
            </Typography>
            <Typography color='text.secondary'>
              {t('auth.account.activity.no_activity_desc', 'Security and login events will appear here in chronological order.')}
            </Typography>
          </Box>
        ) : (
          <Timeline position='alternate'>
            {activities.map((activity, index) => (
              <TimelineItem key={activity.id}>
                <TimelineOppositeContent
                  sx={{ m: 'auto 0' }}
                  align={index % 2 === 0 ? 'right' : 'left'}
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

      {!isLoading && !isError && activities.length > 0 && (
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
