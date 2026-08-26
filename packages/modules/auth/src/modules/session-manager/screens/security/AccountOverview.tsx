import React, { useMemo } from 'react'
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Stack,
  Skeleton,
  useTheme,
  alpha,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DevicesOutlined from '@mui/icons-material/DevicesOutlined'
import FingerprintOutlined from '@mui/icons-material/FingerprintOutlined'
import ShieldOutlined from '@mui/icons-material/ShieldOutlined'
import SecurityOutlined from '@mui/icons-material/SecurityOutlined'
import VerifiedUserOutlined from '@mui/icons-material/VerifiedUserOutlined'
import LinkOutlined from '@mui/icons-material/LinkOutlined'
import EditOutlined from '@mui/icons-material/EditOutlined'
import VpnKeyOutlined from '@mui/icons-material/VpnKeyOutlined'
import ChevronRight from '@mui/icons-material/ChevronRight'
import ErrorOutline from '@mui/icons-material/ErrorOutline'
import { Path } from '../../../../routes/path'
import {
  useGetUser,
  useSecurityStatus,
  useActivityTimeline,
  useLinkedAccounts,
  useUserPasskeys,
} from '../../../../modules/user-directory/hooks'
import type { AuditLog } from '../../../../modules/authentication-core/types/api.types'
import Grid from '@cap/layout/components/Grid'

interface FormattedActivity {
  id: string
  title: string
  meta: string
  timestamp: string
  success: boolean
}

export const AccountOverview: React.FC = () => {
  const { t } = useTranslation()
  const theme = useTheme()

  const { isLoading: isUserLoading } = useGetUser()
  const { data: securityResponse, isLoading: isSecurityLoading } = useSecurityStatus()
  const { data: passkeysResponse, isLoading: isPasskeysLoading } = useUserPasskeys()
  const { data: linkedAccountsResponse, isLoading: isLinkedLoading } = useLinkedAccounts()
  const { data: activityResponse, isLoading: isActivityLoading } = useActivityTimeline()

  const isLoading =
    isUserLoading || isSecurityLoading || isPasskeysLoading || isLinkedLoading

  const security = securityResponse?.data
  const passkeys = (passkeysResponse?.data as unknown as unknown[]) || []
  const linkedAccounts =
    (linkedAccountsResponse?.data?.accounts as Array<{ provider: string }>) || []
  const passkeysCount = passkeys.length || security?.passkeys || 0

  const stats = useMemo(() => {
    return {
      activeSessions: security?.activeSessions ?? 1,
      passkeysCount,
      isMfaEnabled: Boolean(security?.mfaEnabled),
      linkedAccounts: linkedAccounts.length,
    }
  }, [security, passkeysCount, linkedAccounts])

  const activities: FormattedActivity[] = useMemo(() => {
    const rawLogs: AuditLog[] = activityResponse?.data || []
    if (!Array.isArray(rawLogs) || rawLogs.length === 0) return []

    return rawLogs.slice(0, 5).map((log, index) => {
      const action = (log.action || '').toLowerCase()
      const isFailed =
        action.includes('fail') ||
        action.includes('denied') ||
        action.includes('error') ||
        action.includes('block')

      const meta = (log.metadata && typeof log.metadata === 'object' ? log.metadata : {}) as Record<
        string,
        unknown
      >
      const ip =
        (meta.ip_address as string) ||
        (meta.ipAddress as string) ||
        (meta.ip as string) ||
        ''
      const device =
        (meta.user_agent as string) ||
        (meta.userAgent as string) ||
        (meta.browser as string) ||
        (meta.device as string) ||
        ''
      const location =
        (meta.location as string) ||
        (meta.city as string) ||
        (meta.country as string) ||
        ''

      const metadataParts = [device, location, ip].filter(Boolean)
      const metaString =
        metadataParts.length > 0
          ? metadataParts.join(' • ')
          : log.resource_type
            ? `${log.resource_type}${log.resource_id ? ` #${log.resource_id}` : ''}`
            : t('auth.account.activity.direct_api', 'Direct API Access')

      let formattedDate = ''
      try {
        const parsedDate = new Date(log.created_at)
        if (!Number.isNaN(parsedDate.getTime())) {
          formattedDate = parsedDate.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        } else {
          formattedDate = log.created_at || ''
        }
      } catch {
        formattedDate = log.created_at || ''
      }

      const formattedTitle = log.action
        ? log.action.toUpperCase().replace(/_/g, ' ')
        : t('auth.account.activity.recent_feed', 'SECURITY EVENT')

      return {
        id: log.id ? log.id.toString() : `log-${index}`,
        title: formattedTitle,
        meta: metaString,
        timestamp: formattedDate,
        success: !isFailed,
      }
    })
  }, [activityResponse, t])

  return (
    <Box
      sx={{
        // maxWidth: 1280,
        mx: 'auto',
        width: '100%',
        py: { xs: 2.5, md: 4 },
        px: { xs: 2, sm: 3, md: 4 },
        boxSizing: 'border-box',
      }}
    >
      {/* ── Page Header ── */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3.5,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              fontSize: { xs: '1.5rem', sm: '1.875rem' },
              letterSpacing: '-0.025em',
            }}
          >
            {t('auth.account.overview_title', 'Account Overview')}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.875rem',
              mt: 0.5,
            }}
          >
            {t(
              'auth.account.overview_subtitle',
              'Manage your security settings, active sessions, passkeys, and multi-factor authentication.',
            )}
          </Typography>
        </Box>

        <Button
          component={RouterLink}
          to={Path.user.profile.view}
          variant="outlined"
          startIcon={<EditOutlined sx={{ fontSize: 16 }} />}
          sx={{
            borderColor: 'divider',
            color: 'text.primary',
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'none',
            borderRadius: '10px',
            px: 2,
            py: 0.8,
            backgroundColor: 'background.paper',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            '&:hover': {
              borderColor: 'text.secondary',
              backgroundColor: alpha(theme.palette.action.hover, 0.04),
            },
          }}
        >
          {t('auth.account.edit_profile', 'Edit Profile')}
        </Button>
      </Box>

      {/* ── Passkey Promotion Banner ── */}
      <Card
        variant="outlined"
        sx={{
          mb: 3.5,
          p: { xs: 2, sm: 2.5 },
          borderRadius: '16px',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2.5,
          my: { xs: 2, sm: 0, md: 2, lg: 2 }
        }}
      >
        <Stack direction="row" spacing={2.5} alignItems="center" sx={{ flex: 1 }}>
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.warning.main, 0.12),
              color: theme.palette.warning.dark || '#d97706',
              width: 48,
              height: 48,
              borderRadius: '50%',
              flexShrink: 0,
            }}
          >
            <FingerprintOutlined sx={{ fontSize: 26 }} />
          </Avatar>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1rem', mb: 0.25 }}
            >
              {t('auth.account.passkey_banner_title', 'Strengthen Your Account with Passkeys')}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.45 }}
            >
              {t(
                'auth.account.passkey_banner_desc',
                'Experience fast, phishing-resistant logins using biometric verification (Touch ID, Face ID, Windows Hello) or security keys.',
              )}
            </Typography>
          </Box>
        </Stack>

        <Button
          component={RouterLink}
          to={Path.mfa.passkey.management}
          variant="outlined"
          startIcon={<VpnKeyOutlined sx={{ fontSize: 16 }} />}
          sx={{
            borderColor: 'divider',
            color: 'text.primary',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '10px',
            px: 2.25,
            py: 0.8,
            fontSize: '0.875rem',
            whiteSpace: 'nowrap',
            backgroundColor: 'background.paper',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            width: { xs: '100%', sm: 'auto' },
            '&:hover': {
              borderColor: 'text.secondary',
              backgroundColor: alpha(theme.palette.action.hover, 0.04),
            },
          }}
        >
          {t('auth.account.setup_passkey', 'Set Up Passkey')}
        </Button>
      </Card>

      {/* ── Bento Grid (Metric Cards) ── */}
      <Grid
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 2.5,
          my: 4,
          width: '100%',
        }}
      >
        {/* Card 1: Active Sessions */}
        <Grid
          size={{ xs: 12, md: 6, lg: 3 }}
          sx={{
            m: { xs: 0, sx: 0, md: 2, lg: 2 },
            ml: { xs: 0, sx: 0, md: 0, lg: 0 },
            my: { xs: 2, sm: 0, md: 2, lg: 2 }
          }}
        >
          <Card
            variant="outlined"
            sx={{
              borderRadius: '16px',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
              p: 2.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 160,
              padding: '12px'
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.875rem' }}>
                  {t('auth.account.active_sessions', 'Active Sessions')}
                </Typography>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.warning.main, 0.12),
                    color: '#f97316',
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                  }}
                >
                  <DevicesOutlined sx={{ fontSize: 18 }} />
                </Avatar>
              </Box>
              {isLoading ? (
                <Skeleton width="40%" height={40} />
              ) : (
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.875rem', lineHeight: 1 }}>
                  {stats.activeSessions}
                </Typography>
              )}
            </Box>

            <Button
              component={RouterLink}
              to={Path.session.activeSessions}
              variant="text"
              endIcon={<ChevronRight sx={{ fontSize: 16, transition: 'transform 0.2s', '.MuiButton-root:hover &': { transform: 'translateX(3px)' } }} />}
              sx={{
                justifyContent: 'flex-start',
                px: 0,
                mt: 2,
                fontWeight: 600,
                fontSize: '0.8125rem',
                color: 'text.secondary',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: 'text.primary',
                },
              }}
            >
              {t('auth.account.manage_devices', 'Manage Devices')}
            </Button>
          </Card>
        </Grid>

        {/* Card 2: Passkeys & Biometrics */}
        <Grid
          size={{ xs: 12, md: 6, lg: 3 }}
          sx={{
            m: { xs: 0, sx: 0, md: 2, lg: 2 },
            my: { xs: 2, sm: 0, md: 2, lg: 2 }
          }}
        >
          <Card
            variant="outlined"
            sx={{
              borderRadius: '16px',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
              p: 2.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 160,
              padding: '12px'

            }}
          >
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.875rem' }}>
                  {t('auth.account.passkeys_enrolled', 'Passkeys & Biometrics')}
                </Typography>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    color: '#ef4444',
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                  }}
                >
                  <FingerprintOutlined sx={{ fontSize: 18 }} />
                </Avatar>
              </Box>
              {isLoading ? (
                <Skeleton width="40%" height={40} />
              ) : (
                <Stack direction="row" spacing={1} alignItems="baseline">
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.875rem', lineHeight: 1 }}>
                    {stats.passkeysCount}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.875rem' }}>
                    {stats.passkeysCount > 0
                      ? t('auth.account.common.active', 'Active')
                      : t('auth.account.common.disabled', 'Disabled')}
                  </Typography>
                </Stack>
              )}
            </Box>

            <Button
              component={RouterLink}
              to={Path.mfa.passkey.management}
              variant="text"
              endIcon={<ChevronRight sx={{ fontSize: 16, transition: 'transform 0.2s', '.MuiButton-root:hover &': { transform: 'translateX(3px)' } }} />}
              sx={{
                justifyContent: 'flex-start',
                px: 0,
                mt: 2,
                fontWeight: 600,
                fontSize: '0.8125rem',
                color: 'text.secondary',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: 'text.primary',
                },
              }}
            >
              {t('auth.account.manage_passkeys', 'Manage Passkeys')}
            </Button>
          </Card>
        </Grid>

        {/* Card 3: MFA Status */}
        <Grid
          size={{ xs: 12, md: 6, lg: 3 }}
          sx={{
            m: { xs: 0, sx: 0, md: 2, lg: 2 },
            my: { xs: 2, sm: 0, md: 2, lg: 2 }
          }}
        >
          <Card
            variant="outlined"
            sx={{
              borderRadius: '16px',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
              p: 2.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 160,
              padding: '12px'

            }}
          >
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.875rem' }}>
                  {t('auth.account.mfa_status', 'MFA Status')}
                </Typography>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Chip
                    label="2FA"
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      bgcolor: stats.isMfaEnabled ? '#dcfce7' : alpha(theme.palette.warning.main, 0.12),
                      color: stats.isMfaEnabled ? '#15803d' : theme.palette.warning.main,
                      borderRadius: '4px',
                    }}
                  />
                  <Avatar
                    sx={{
                      bgcolor: stats.isMfaEnabled ? '#f0fdf4' : alpha(theme.palette.error.main, 0.1),
                      color: stats.isMfaEnabled ? '#16a34a' : '#dc2626',
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                    }}
                  >
                    <VerifiedUserOutlined sx={{ fontSize: 17 }} />
                  </Avatar>
                </Stack>
              </Box>
              {isLoading ? (
                <Skeleton width="50%" height={40} />
              ) : (
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.75rem', lineHeight: 1 }}>
                  {stats.isMfaEnabled
                    ? t('auth.account.mfa.enabled', 'Enabled')
                    : t('auth.account.mfa.disabled', 'Disabled')}
                </Typography>
              )}
            </Box>

            <Button
              component={RouterLink}
              to={stats.isMfaEnabled ? Path.mfa.mfa.dashboard : Path.mfa.mfa.setup}
              variant="text"
              endIcon={<ChevronRight sx={{ fontSize: 16, transition: 'transform 0.2s', '.MuiButton-root:hover &': { transform: 'translateX(3px)' } }} />}
              sx={{
                justifyContent: 'flex-start',
                px: 0,
                mt: 2,
                fontWeight: 600,
                fontSize: '0.8125rem',
                color: 'text.secondary',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: 'text.primary',
                },
              }}
            >
              {stats.isMfaEnabled
                ? t('auth.account.mfa.manage', 'Manage MFA')
                : t('auth.account.mfa.enable_now', 'Enable 2FA Now')}
            </Button>
          </Card>
        </Grid>

        {/* Card 4: Linked Accounts */}
        <Grid
          size={{ xs: 12, md: 6, lg: 3 }}
          sx={{
            m: { xs: 0, sx: 0, md: 2, lg: 2 },
            mr: { xs: 0, sx: 0, md: 0, lg: 0 },
            my: { xs: 2, sm: 0, md: 2, lg: 2 }
          }}
        >
          <Card
            variant="outlined"
            sx={{
              borderRadius: '16px',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
              p: 2.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 160,
              padding: '12px'

            }}
          >
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.875rem' }}>
                  {t('auth.account.linked_accounts', 'Linked Accounts')}
                </Typography>
                <Avatar
                  sx={{
                    bgcolor: '#eff6ff',
                    color: '#3b82f6',
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                  }}
                >
                  <LinkOutlined sx={{ fontSize: 18 }} />
                </Avatar>
              </Box>
              {isLoading ? (
                <Skeleton width="40%" height={40} />
              ) : (
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.875rem', lineHeight: 1 }}>
                  {stats.linkedAccounts}
                </Typography>
              )}
            </Box>

            <Button
              component={RouterLink}
              to={Path.user.profile.linkedAccounts}
              variant="text"
              endIcon={<ChevronRight sx={{ fontSize: 16, transition: 'transform 0.2s', '.MuiButton-root:hover &': { transform: 'translateX(3px)' } }} />}
              sx={{
                justifyContent: 'flex-start',
                px: 0,
                mt: 2,
                fontWeight: 600,
                fontSize: '0.8125rem',
                color: 'text.secondary',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: 'text.primary',
                },
              }}
            >
              {t('auth.account.manage_accounts', 'Manage Accounts')}
            </Button>
          </Card>
        </Grid>
      </Grid>

      {/* ── Recent Security Activity Card ── */}
      <Card
        variant="outlined"
        sx={{
          borderRadius: '16px',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          overflow: 'hidden',
        }}
      >
        {/* Activity Card Header */}
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            borderBottom: '1px solid',
            borderColor: 'divider',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.05rem', mb: 0.25 }}>
              {t('auth.account.activity.recent_feed', 'Recent Security Activity')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
              {t(
                'auth.account.activity.subtitle',
                'Chronological feed of login events, security changes, and sessions.',
              )}
            </Typography>
          </Box>

          <Button
            component={RouterLink}
            to={Path.session.activityTimeline}
            variant="text"
            endIcon={<ChevronRight sx={{ fontSize: 18 }} />}
            sx={{
              color: 'text.primary',
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'transparent',
                color: theme.palette.primary.main,
              },
            }}
          >
            {t('auth.account.activity.view_full_history', 'View Full History')}
          </Button>
        </Box>

        {/* Activity List Content */}
        {isActivityLoading ? (
          <Box sx={{ p: 2.5 }}>
            {[1, 2, 3].map((item) => (
              <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
                <Skeleton variant="circular" width={36} height={36} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="30%" height={20} />
                  <Skeleton width="60%" height={16} />
                </Box>
                <Skeleton width="15%" height={16} />
              </Box>
            ))}
          </Box>
        ) : activities.length > 0 ? (
          <List disablePadding>
            {activities.map((item, index) => {
              const isLast = index === activities.length - 1
              return (
                <ListItem
                  key={item.id}
                  sx={{
                    py: 2,
                    px: { xs: 2, sm: 2.5 },
                    borderBottom: isLast ? 'none' : '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    transition: 'background-color 0.15s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.action.hover, 0.04),
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Avatar
                      sx={{
                        bgcolor: item.success ? '#eff6ff' : alpha(theme.palette.error.main, 0.1),
                        color: item.success ? '#3b82f6' : '#ef4444',
                        width: 38,
                        height: 38,
                      }}
                    >
                      {item.success ? (
                        <ShieldOutlined sx={{ fontSize: 20 }} />
                      ) : (
                        <SecurityOutlined sx={{ fontSize: 20 }} />
                      )}
                    </Avatar>
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.875rem' }}
                      >
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      <Box component="span" sx={{ display: 'inline-block', mt: 0.5 }}>
                        <Chip
                          label={item.meta}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.75rem',
                            bgcolor: 'action.hover',
                            color: 'text.secondary',
                            fontWeight: 500,
                            borderRadius: '6px',
                          }}
                        />
                      </Box>
                    }
                    sx={{ my: 0 }}
                  />

                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 500,
                      fontSize: '0.8125rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.timestamp}
                  </Typography>
                </ListItem>
              )
            })}
          </List>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <ErrorOutline sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('auth.account.activity.no_recent_activity', 'No recent security activity found.')}
            </Typography>
          </Box>
        )}
      </Card>
    </Box >
  )
}

export default AccountOverview