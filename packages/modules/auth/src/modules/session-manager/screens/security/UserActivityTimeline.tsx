
import { Box, Typography, Container, Paper, Button, Alert, CircularProgress } from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineOppositeContent, TimelineDot } from '@mui/lab';
import Login from '@mui/icons-material/Login';
import VpnKey from '@mui/icons-material/VpnKey';
import Security from '@mui/icons-material/Security';
import Password from '@mui/icons-material/Password';
import NotificationImportant from '@mui/icons-material/NotificationImportant';
import History from '@mui/icons-material/History';
import Refresh from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';
import { useActivityTimeline } from '../../../user-directory/hooks/useUserQuery';
import { AuditLog } from '../../../authentication-core/types/api.types';
import { useMemo } from 'react';

type TimelineDotColor = 'success' | 'primary' | 'info' | 'warning' | 'error' | 'grey' | 'inherit';

interface ActivityItem {
  id: string
  title: string
  description: string
  date: string
  time: string
  icon: React.ReactNode
  color: TimelineDotColor
}

const toActivityItems = (logs: AuditLog[]): ActivityItem[] =>
  logs.map((log) => {
    let icon = <History fontSize='small' />
    let color: TimelineDotColor = 'grey'

    if (log.action.includes('login')) {
      icon = <Login fontSize='small' />
      color = 'success'
    } else if (log.action.includes('password')) {
      icon = <Password fontSize='small' />
      color = 'warning'
    } else if (log.action.includes('mfa')) {
      icon = <Security fontSize='small' />
      color = 'info'
    } else if (log.action.includes('token')) {
      icon = <VpnKey fontSize='small' />
      color = 'primary'
    } else if (log.action.includes('fail')) {
      icon = <NotificationImportant fontSize='small' />
      color = 'error'
    }

    const timestamp = new Date(log.created_at)

    return {
      id: log.id.toString(),
      title: log.action.charAt(0).toUpperCase() + log.action.slice(1).replace(/_/g, ' '),
      description: `${log.resource_type}${log.resource_id ? ` #${log.resource_id}` : ''}`,
      date: Number.isNaN(timestamp.getTime()) ? log.created_at : timestamp.toLocaleDateString(),
      time: Number.isNaN(timestamp.getTime()) ? '' : timestamp.toLocaleTimeString(),
      icon,
      color,
    }
  })

const UserActivityTimeline = () => {
  const { t } = useTranslation()
  const { data, isLoading, isError, refetch, isFetching } = useActivityTimeline()

  const activities = useMemo(
    () => toActivityItems(data?.data ?? []),
    [data],
  )

  return (
    <Container maxWidth='lg' sx={{ py: 6 }}>
      <Box sx={{ mb: 6 }}>
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

      <Paper variant='outlined' sx={{ p: 4, borderRadius: 3 }}>
        {isLoading ? (
          <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
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
              {t('auth.account.activity.load_failed', 'Unable to load activity. Please try again.')}
            </Alert>
          </Box>
        ) : activities.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography color='text.secondary'>
              {t('auth.account.activity.no_recent_activity', 'No recent activity found.')}
            </Typography>
          </Box>
        ) : (
          <Timeline position='alternate'>
            {activities.map((activity, index) => (
              <TimelineItem key={activity.id}>
                <TimelineOppositeContent
                  sx={{ m: 'auto 0' }}
                  align={index % 2 === 0 ? 'right' : 'left'}
                  variant='body2'
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
