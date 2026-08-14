import { useMemo } from 'react';
import { Box, Button, Typography, Alert, Card, CardContent, LinearProgress, Chip, useTheme, Link as MuiLink, CircularProgress } from '@mui/material';
import Shield from '@mui/icons-material/Shield';
import Edit from '@mui/icons-material/Edit';
import Warning from '@mui/icons-material/Warning';
import Devices from '@mui/icons-material/Devices';
import LinkIcon from '@mui/icons-material/Link';
import Api from '@mui/icons-material/Api';
import LockOpen from '@mui/icons-material/LockOpen';
import Login from '@mui/icons-material/Login';
import Key from '@mui/icons-material/Key';
import LockReset from '@mui/icons-material/LockReset';
import VerifiedUser from '@mui/icons-material/VerifiedUser';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Path } from '@auth/routes/path';
import { useGetUser, useSecurityStatus, useActivityTimeline, useLinkedAccounts, useUserTokens } from '@auth';



interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  iconBgColor: string
  iconColor: string
  actionText?: string
  actionColor?: string
  onActionClick?: () => void
  badge?: React.ReactNode
  progress?: number
  loading?: boolean
}

interface ActivityItem {
  id: string
  title: string
  description: string
  timestamp: string
  icon: React.ReactNode
  iconBgColor: string
  iconColor: string
}

const StatCard = ({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  actionText,
  actionColor = 'primary',
  onActionClick,
  badge,
  progress,
  loading,
}: StatCardProps) => (
  <Card
    sx={{
      border: 1,
      borderColor: 'divider',
      boxShadow: 1,
      transition: 'box-shadow 0.2s',
      '&:hover': {
        boxShadow: 3,
      },
    }}
  >
    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
        <Box
          sx={{
            bgcolor: iconBgColor,
            color: iconColor,
            p: 0.75,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>

      {loading ? (
        <CircularProgress size={20} />
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant='h5' sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
            {value}
          </Typography>
          {badge}
        </Box>
      )}

      {progress !== undefined && (
        <LinearProgress
          variant='determinate'
          value={progress}
          sx={{
            mt: 1,
            height: 6,
            borderRadius: 3,
            bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              bgcolor: 'primary.main',
              borderRadius: 3,
            },
          }}
        />
      )}

      {actionText && (
        <MuiLink
          component='button'
          onClick={onActionClick}
          sx={{
            fontSize: '0.75rem',
            fontWeight: 500,
            textDecoration: 'none',
            color: actionColor === 'error' ? 'error.main' : 'primary.main',
            textAlign: 'left',
            mt: 0.5,
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {actionText}
        </MuiLink>
      )}
    </CardContent>
  </Card>
)

const ActivityListItem = ({ item }: { item: ActivityItem }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { xs: 'flex-start', sm: 'center' },
      justifyContent: 'space-between',
      gap: 2,
      p: 2,
      borderBottom: '1px solid',
      borderColor: 'divider',
      '&:hover': {
        bgcolor: 'action.hover',
      },
      '&:last-child': {
        borderBottom: 'none',
      },
      transition: 'background-color 0.2s',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
      <Box
        sx={{
          mt: 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: item.iconBgColor,
          color: item.iconColor,
          flexShrink: 0,
        }}
      >
        {item.icon}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant='body1' sx={{ fontWeight: 600 }}>
          {item.title}
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.875rem' }}>
          {item.description}
        </Typography>
      </Box>
    </Box>
    <Typography
      variant='body2'
      color='text.secondary'
      sx={{
        fontSize: '0.875rem',
        fontWeight: 500,
        textAlign: { xs: 'left', sm: 'right' },
        pl: { xs: 7, sm: 0 },
        flexShrink: 0,
      }}
    >
      {item.timestamp}
    </Typography>
  </Box>
)

export default function AccountOverview() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const theme = useTheme()

  const { data: userResponse, isLoading: isUserLoading } = useGetUser()
  const { data: securityResponse, isLoading: isSecurityLoading } = useSecurityStatus()
  const { data: activityResponse, isLoading: isActivityLoading } = useActivityTimeline()
  const { data: linkedAccountsResponse, isLoading: isLinkedLoading } = useLinkedAccounts()
  const { data: tokensResponse, isLoading: isTokensLoading } = useUserTokens()

  const user = userResponse?.data
  const security = securityResponse?.data
  const linkedAccounts = linkedAccountsResponse?.data?.accounts || []
  const tokensCount = tokensResponse?.data?.length || 0

  const activityItems: Array<ActivityItem> = useMemo(() => {
    if (!activityResponse?.data) return []

    return activityResponse.data.slice(0, 4).map((log: any) => {
      let icon = <Login />
      let iconColor = theme.palette.primary.main
      let iconBgColor = 'rgba(19, 127, 236, 0.1)'

      if (log.action.includes('login')) {
        icon = <Login />
        iconColor = theme.palette.success.main
        iconBgColor = theme.palette.success.light
      } else if (log.action.includes('password')) {
        icon = <LockReset />
        iconColor = theme.palette.warning.main
        iconBgColor = theme.palette.warning.light
      } else if (log.action.includes('mfa')) {
        icon = <Shield />
        iconColor = theme.palette.info.main
        iconBgColor = theme.palette.info.light
      } else if (log.action.includes('token')) {
        icon = <Key />
        iconColor = theme.palette.secondary.main
        iconBgColor = theme.palette.secondary.light
      }

      return {
        id: log.id.toString(),
        title: log.action.charAt(0).toUpperCase() + log.action.slice(1).replace(/_/g, ' '),
        description: `${log.resource_type} ${log.resource_id ? `#${log.resource_id}` : ''}`,
        timestamp: new Date(log.created_at).toLocaleString(),
        icon,
        iconColor,
        iconBgColor,
      }
    })
  }, [activityResponse, theme])

  return (
    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        height: '100%',
        position: 'relative',
      }}
    >
      {/* Page Content */}
      <Box
        sx={{
          flex: 1,
          maxWidth: 1100,
          width: '100%',
          mx: 'auto',
          p: { xs: 2, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {/* Page Heading */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography
              variant='h3'
              sx={{
                fontSize: { xs: '1.875rem', md: '2.25rem' },
                fontWeight: 900,
                letterSpacing: '-0.033em',
              }}
            >
              {t('auth.account.overview_title')}
            </Typography>
            <Typography variant='body1' color='text.secondary' sx={{ fontSize: '1rem' }}>
              {isUserLoading
                ? t('common.loading')
                : t('auth.account.overview_welcome', {
                    name: `${user?.firstName} ${user?.lastName}`,
                  })}
            </Typography>
          </Box>
          <Button
            variant='contained'
            startIcon={<Edit />}
            onClick={() => navigate(Path.account.view)}
            sx={{
              flexShrink: 0,
              height: 40,
              px: 2,
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: 1,
              // bgcolor: 'grey.200',
              color: 'text.primary',
              '&:hover': {
                bgcolor: 'grey.300',
              },
            }}
          >
            {t('auth.account.edit_profile')}
          </Button>
        </Box>

        {/* Security Alert */}
        {!isSecurityLoading && security && !security.mfaEnabled && (
          <Alert
            severity='warning'
            icon={<Warning sx={{ fontSize: 28 }} />}
            action={
              <Button
                variant='contained'
                size='small'
                onClick={() => navigate(Path.mfa.setup)}
                sx={{
                  px: 2,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  boxShadow: 2,
                  flexShrink: 0,
                }}
              >
                {t('auth.mfa.enable_2fa')}
              </Button>
            }
            sx={{
              borderRadius: 3,
              border: 1,
              borderColor: 'warning.light',
              bgcolor: 'warning.lighter',
              alignItems: 'center',
              p: 2.5,
              '& .MuiAlert-message': {
                flex: 1,
                py: 0,
              },
            }}
          >
            <Typography variant='body1' sx={{ fontWeight: 700, mb: 0.5 }}>
              {t('auth.account.security.recommendation')}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {t('auth.account.security.enable_2fa_message')}
            </Typography>
          </Alert>
        )}

        {/* Stats Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2,
          }}
        >
          <StatCard
            title={t('auth.account.stats.active_sessions')}
            value={security?.activeSessions || 0}
            icon={<Devices sx={{ fontSize: 20 }} />}
            iconBgColor='rgba(19, 127, 236, 0.1)'
            iconColor='primary.main'
            actionText={t('auth.account.stats.manage_devices')}
            onActionClick={() => navigate(Path.account.sessions)}
            loading={isSecurityLoading}
          />

          <StatCard
            title={t('auth.account.stats.linked_accounts')}
            value={linkedAccounts.length}
            icon={<LinkIcon sx={{ fontSize: 20 }} />}
            iconBgColor='rgba(19, 127, 236, 0.1)'
            iconColor='primary.main'
            badge={
              <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                {linkedAccounts.map((acc: { provider: string }, i: number) => (
                  <Chip
                    key={i}
                    label={acc.provider.charAt(0).toUpperCase()}
                    size='small'
                    sx={{
                      width: 24,
                      height: 24,
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      bgcolor: acc.provider === 'google' ? theme.palette.error.light : 'grey.800',
                      color: acc.provider === 'google' ? 'white' : 'white',
                      '& .MuiChip-label': { px: 0 },
                    }}
                  />
                ))}
              </Box>
            }
            loading={isLinkedLoading}
          />

          <StatCard
            title={t('auth.account.stats.api_tokens')}
            value={tokensCount}
            icon={<Api sx={{ fontSize: 20 }} />}
            iconBgColor='rgba(19, 127, 236, 0.1)'
            iconColor='primary.main'
            actionText={t('auth.account.stats.manage_tokens')}
            onActionClick={() => navigate(Path.apiTokens.dashboard)}
            loading={isTokensLoading}
          />

          <StatCard
            title={t('auth.account.stats.mfa_status')}
            value={
              security?.mfaEnabled ? t('auth.account.common.enabled') : t('auth.account.common.disabled')
            }
            icon={security?.mfaEnabled ? <VerifiedUser sx={{ fontSize: 20 }} /> : <LockOpen sx={{ fontSize: 20 }} />}
            iconBgColor={security?.mfaEnabled ? 'rgba(46, 125, 50, 0.1)' : 'rgba(211, 47, 47, 0.1)'}
            iconColor={security?.mfaEnabled ? 'success.main' : 'error.main'}
            actionText={security?.mfaEnabled ? t('auth.account.mfa.manage') : t('auth.account.mfa.enable_now')}
            actionColor={security?.mfaEnabled ? 'primary' : 'error'}
            onActionClick={() => navigate(security?.mfaEnabled ? Path.account.security : Path.mfa.setup)}
            loading={isSecurityLoading}
          />
        </Box>

        {/* Recent Activity Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              pt: 2,
              pb: 1,
            }}
          >
            <Typography
              variant='h5'
              sx={{
                fontSize: '1.375rem',
                fontWeight: 700,
                letterSpacing: '-0.015em',
              }}
            >
              {t('auth.account.activity.recent_feed')}
            </Typography>
            <Button
              onClick={() => navigate(Path.account.activityTimeline)}
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                textTransform: 'none',
                color: 'primary.main',
                '&:hover': {
                  textDecoration: 'underline',
                  bgcolor: 'transparent',
                },
              }}
            >
              {t('auth.account.activity.view_full_history')}
            </Button>
          </Box>

          <Card
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: 1,
            }}
          >
            {isActivityLoading ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <CircularProgress size={32} />
              </Box>
            ) : activityItems.length > 0 ? (
              activityItems.map((item) => <ActivityListItem key={item.id} item={item} />)
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color='text.secondary'>
                  {t('auth.account.activity.no_recent_activity')}
                </Typography>
              </Box>
            )}
          </Card>
        </Box>

        {/* Bottom Spacer */}
        <Box sx={{ height: 48 }} />
      </Box>
    </Box>
  )
}

