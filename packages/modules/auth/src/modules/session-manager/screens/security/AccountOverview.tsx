import React, { useMemo, useCallback } from 'react'
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
  Alert,
  AlertTitle,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DevicesOutlined from '@mui/icons-material/DevicesOutlined'
import FingerprintOutlined from '@mui/icons-material/FingerprintOutlined'
import ShieldOutlined from '@mui/icons-material/ShieldOutlined'
import SecurityOutlined from '@mui/icons-material/SecurityOutlined'
import VerifiedUserOutlined from '@mui/icons-material/VerifiedUserOutlined'
import LinkOutlined from '@mui/icons-material/LinkOutlined'
import KeyOutlined from '@mui/icons-material/KeyOutlined'
import EditOutlined from '@mui/icons-material/EditOutlined'
import VpnKeyOutlined from '@mui/icons-material/VpnKeyOutlined'
import ChevronRight from '@mui/icons-material/ChevronRight'
import HistoryToggleOffOutlined from '@mui/icons-material/HistoryToggleOffOutlined'
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline'
import Refresh from '@mui/icons-material/Refresh'
import AdminPanelSettingsOutlined from '@mui/icons-material/AdminPanelSettingsOutlined'
import { useAppStore } from '@cap/platform-store'
import { Path } from '../../../../routes/path'
import {
  useGetUser,
  useSecurityStatus,
  useActivityTimeline,
  useLinkedAccounts,
  useUserPasskeys,
  useUserTokens,
} from '../../../../modules/user-directory/hooks'
import type { AuditLog, UserDTO } from '../../../../modules/authentication-core/types/api.types'
import Grid from '@cap/layout/components/Grid'

interface FormattedActivity {
  id: string
  title: string
  meta: string
  timestamp: string
  success: boolean
}

/**
 * One tile in the metric grid below the identity card.
 *
 * The four (now five) cards were near-identical hand-rolled `<Card>` blocks
 * that had drifted apart in small ways — most visibly, every one of them set
 * `p: 2.5` and then a literal `padding: '12px'` a few lines later in the same
 * `sx` object, so the second declaration silently won and the cards rendered
 * far tighter than their design (a 160px `minHeight` with only 12px of
 * padding) ever intended. One component fixes that once instead of five
 * times.
 */
interface OverviewMetricCardProps {
  label: React.ReactNode
  icon: React.ReactNode
  tone: 'primary' | 'warning' | 'error' | 'success' | 'info'
  value: React.ReactNode
  valueLoading?: boolean
  linkTo: string
  linkLabel: React.ReactNode
}

const OverviewMetricCard: React.FC<OverviewMetricCardProps> = ({
  label,
  icon,
  tone,
  value,
  valueLoading,
  linkTo,
  linkLabel,
}) => {
  const theme = useTheme()
  const color = theme.palette[tone].main

  return (
    <Card
      variant='outlined'
      sx={{
        borderRadius: 'var(--sf-radius-lg, 16px)',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        boxShadow: 'var(--sf-shadow-xs)',
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 160,
        height: '100%',
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant='body2' sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.875rem' }}>
            {label}
          </Typography>
          <Avatar
            aria-hidden
            sx={{ bgcolor: alpha(color, 0.12), color, width: 32, height: 32, borderRadius: 'var(--sf-radius-sm, 8px)' }}
          >
            {icon}
          </Avatar>
        </Box>
        {valueLoading ? (
          <Skeleton width='40%' height={40} />
        ) : (
          <Typography variant='h4' sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.875rem', lineHeight: 1 }}>
            {value}
          </Typography>
        )}
      </Box>

      <Button
        component={RouterLink}
        to={linkTo}
        variant='text'
        endIcon={
          <ChevronRight
            sx={{ fontSize: 16, transition: 'transform 0.2s', '.MuiButton-root:hover &': { transform: 'translateX(3px)' } }}
          />
        }
        sx={{
          justifyContent: 'flex-start',
          px: 0,
          mt: 2,
          minHeight: 44,
          fontWeight: 600,
          fontSize: '0.8125rem',
          color: 'text.secondary',
          textTransform: 'none',
          '&:hover': { backgroundColor: 'transparent', color: 'text.primary' },
        }}
      >
        {linkLabel}
      </Button>
    </Card>
  )
}

export const AccountOverview: React.FC = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const storeUser = useAppStore((state) => state.user)

  const {
    data: userResponse,
    isLoading: isUserLoading,
    isError: isUserError,
    refetch: refetchUser,
    isFetching: isUserFetching,
  } = useGetUser()

  const {
    data: securityResponse,
    isLoading: isSecurityLoading,
    isError: isSecurityError,
    refetch: refetchSecurity,
    isFetching: isSecurityFetching,
  } = useSecurityStatus()

  const {
    data: passkeysResponse,
    isLoading: isPasskeysLoading,
    isError: isPasskeysError,
    refetch: refetchPasskeys,
    isFetching: isPasskeysFetching,
  } = useUserPasskeys()

  const {
    data: linkedAccountsResponse,
    isLoading: isLinkedLoading,
    isError: isLinkedError,
    refetch: refetchLinked,
    isFetching: isLinkedFetching,
  } = useLinkedAccounts()

  const {
    data: tokensResponse,
    isLoading: isTokensLoading,
    isError: isTokensError,
    refetch: refetchTokens,
    isFetching: isTokensFetching,
  } = useUserTokens()

  const {
    data: activityResponse,
    isLoading: isActivityLoading,
    isError: isActivityError,
    refetch: refetchActivity,
    isFetching: isActivityFetching,
  } = useActivityTimeline()

  const isLoading = isUserLoading || isSecurityLoading || isPasskeysLoading
  const isFetching =
    isUserFetching ||
    isSecurityFetching ||
    isPasskeysFetching ||
    isLinkedFetching ||
    isTokensFetching ||
    isActivityFetching
  const isAnyError =
    isUserError || isSecurityError || isPasskeysError || isLinkedError || isTokensError || isActivityError

  const handleRefreshAll = useCallback(() => {
    refetchUser()
    refetchSecurity()
    refetchPasskeys()
    refetchLinked()
    refetchTokens()
    refetchActivity()
  }, [refetchUser, refetchSecurity, refetchPasskeys, refetchLinked, refetchTokens, refetchActivity])

  // ── Data Normalization & Extraction ──
  const user = useMemo<UserDTO>(() => {
    const apiData = userResponse?.data
    if (apiData && typeof apiData === 'object') {
      return apiData as UserDTO
    }
    return (storeUser || {}) as unknown as UserDTO
  }, [userResponse, storeUser])

  const displayName = useMemo(() => {
    if (user.name) return user.name
    const first = user.firstName || user.firstname || ''
    const last = user.lastName || user.lastname || ''
    const combined = `${first} ${last}`.trim()
    return combined || user.email || t('auth.account.user', 'User')
  }, [user, t])

  const avatarUrl = user.avatarUrl || user.avatar || undefined
  const userStatus = (user.status || 'ACTIVE').toUpperCase()
  // The chip rendered this raw enum value directly (`label={userStatus}`),
  // so it read "ACTIVE" in French and Arabic too. `UserDTO['status']` is
  // `'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED' | string` — the known
  // values are translated; anything outside that enum still shows the raw
  // value rather than guessing at a translation for it.
  const userStatusLabel = useMemo(() => {
    const known: Record<string, string> = {
      ACTIVE: t('auth.account.statusLabel.active', 'Active'),
      INACTIVE: t('auth.account.statusLabel.inactive', 'Inactive'),
      SUSPENDED: t('auth.account.statusLabel.suspended', 'Suspended'),
      BANNED: t('auth.account.statusLabel.banned', 'Banned'),
    }
    return known[userStatus] ?? userStatus
  }, [userStatus, t])
  /*
   * `UserDTO.role` is typed as `string | number`, but the real endpoint
   * (`GET /api/user/me`) returns the full role record — `{ id, name,
   * permissions, ... }` — not a scalar. The type and the backend have drifted
   * apart, and the chip below rendered the literal string "Role
   * #[object Object]" for every account until this normalised the shape.
   */
  const userRole = useMemo(() => {
    const raw: unknown = user.role ?? (user.roles && user.roles[0])
    if (!raw) return ''
    if (typeof raw === 'string' || typeof raw === 'number') return raw
    if (typeof raw === 'object' && 'name' in raw && typeof (raw as { name?: unknown }).name === 'string') {
      return (raw as { name: string }).name
    }
    return ''
  }, [user])

  const security = securityResponse?.data
  const passkeys = useMemo(
    () => (Array.isArray(passkeysResponse) ? passkeysResponse : []),
    [passkeysResponse],
  )

  const linkedAccounts = useMemo(() => {
    const raw = linkedAccountsResponse?.data
    if (Array.isArray(raw)) return raw
    if (raw && typeof raw === 'object' && Array.isArray((raw as any).accounts)) {
      return (raw as any).accounts
    }
    return []
  }, [linkedAccountsResponse])

  const tokens = useMemo(() => {
    const raw = tokensResponse?.data
    if (Array.isArray(raw)) return raw
    if (raw && typeof raw === 'object' && Array.isArray((raw as any).tokens)) {
      return (raw as any).tokens
    }
    return []
  }, [tokensResponse])

  const passkeysCount = passkeys.length || security?.passkeys || 0
  const isMfaActive = Boolean(security?.mfaEnabled ?? user?.mfaEnabled)
  const isEmailVerified = Boolean(user.emailVerified ?? security?.emailVerified)

  const stats = useMemo(
    () => ({
      activeSessions: security?.activeSessions ?? 1,
      passkeysCount,
      isMfaEnabled: isMfaActive,
      linkedAccounts: linkedAccounts.length,
      tokensCount: tokens.length,
    }),
    [security, passkeysCount, isMfaActive, linkedAccounts, tokens],
  )

  const activities: FormattedActivity[] = useMemo(() => {
    const raw = activityResponse?.data
    const rawLogs: AuditLog[] = Array.isArray(raw)
      ? raw
      : raw && typeof raw === 'object' && Array.isArray((raw as any).logs)
        ? (raw as any).logs
        : []

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
        log.ipAddress ||
        log.ip_address ||
        (meta.ip_address as string) ||
        (meta.ipAddress as string) ||
        (meta.ip as string) ||
        ''
      const device =
        log.userAgent ||
        log.user_agent ||
        (meta.user_agent as string) ||
        (meta.userAgent as string) ||
        (meta.browser as string) ||
        (meta.device as string) ||
        ''
      const location =
        (meta.location as string) || (meta.city as string) || (meta.country as string) || ''

      const metadataParts = [device, location, ip].filter(Boolean)
      const metaString =
        metadataParts.length > 0
          ? metadataParts.join(' • ')
          : log.resource_type
            ? `${log.resource_type}${log.resource_id ? ` #${log.resource_id}` : ''}`
            : t('auth.account.activity.direct_api', 'Direct API Access')

      let formattedDate = ''
      try {
        const rawDate = log.createdAt || log.created_at
        const parsedDate = rawDate ? new Date(rawDate) : new Date()
        if (!Number.isNaN(parsedDate.getTime())) {
          formattedDate = parsedDate.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        } else {
          formattedDate = rawDate || ''
        }
      } catch {
        formattedDate = log.createdAt || log.created_at || ''
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
            component='h1'
            variant='h4'
            sx={{ fontWeight: 800, color: 'text.primary', fontSize: { xs: '1.5rem', sm: '1.875rem' }, letterSpacing: '-0.025em' }}
          >
            {t('auth.account.overview_title', 'Account Overview')}
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: '0.875rem', mt: 0.5 }}>
            {t(
              'auth.account.overview_subtitle',
              'Manage your security settings, active sessions, passkeys, and multi-factor authentication.',
            )}
          </Typography>
        </Box>

        <Button
          component={RouterLink}
          to={Path.user.profile.view}
          variant='outlined'
          startIcon={<EditOutlined sx={{ fontSize: 16 }} />}
          sx={{
            minHeight: 44,
            borderColor: 'divider',
            color: 'text.primary',
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'none',
            borderRadius: 'var(--sf-radius-md, 10px)',
            px: 2,
            backgroundColor: 'background.paper',
            boxShadow: `0 1px 2px ${alpha(theme.palette.common.black, 0.05)}`,
            '&:hover': { borderColor: 'text.secondary', backgroundColor: alpha(theme.palette.action.hover, 0.04) },
          }}
        >
          {t('auth.account.edit_profile', 'Edit Profile')}
        </Button>
      </Box>

      {/* ── Error Banner if any query failed ── */}
      {isAnyError && (
        <Alert
          severity='warning'
          sx={{ mb: 3.5, borderRadius: 'var(--sf-radius-md, 12px)' }}
          action={
            <Button color='inherit' startIcon={<Refresh />} onClick={handleRefreshAll} disabled={isFetching} sx={{ minHeight: 44 }}>
              {t('auth.account.retry', 'Retry')}
            </Button>
          }
        >
          <AlertTitle sx={{ fontWeight: 700 }}>
            {t('auth.account.sync_notice', 'Some security metrics could not be loaded')}
          </AlertTitle>
          {t(
            'auth.account.sync_notice_desc',
            'We encountered an issue syncing some of your account data. Click retry to refresh.',
          )}
        </Alert>
      )}

      {/* ── User Identity Profile Summary Card ── */}
      <Card
        variant='outlined'
        sx={{
          mb: 3.5,
          p: { xs: 2, sm: 2.5 },
          borderRadius: 'var(--sf-radius-lg, 16px)',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          boxShadow: 'var(--sf-shadow-xs)',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2.5}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent='space-between'
        >
          <Stack direction='row' spacing={2} alignItems='center' sx={{ minWidth: 0 }}>
            {isUserLoading ? (
              <Skeleton variant='circular' width={56} height={56} />
            ) : (
              <Avatar
                src={avatarUrl}
                alt={displayName}
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  border: `2px solid ${theme.palette.divider}`,
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </Avatar>
            )}

            <Box sx={{ minWidth: 0 }}>
              {isUserLoading ? (
                <>
                  <Skeleton width={180} height={28} />
                  <Skeleton width={240} height={20} />
                </>
              ) : (
                <>
                  <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap'>
                    <Typography
                      variant='h6'
                      sx={{ fontWeight: 700, color: 'text.primary', fontSize: { xs: '1.05rem', sm: '1.2rem' } }}
                      noWrap
                    >
                      {displayName}
                    </Typography>
                    {/*
                      The status and verified chips read a hardcoded
                      `theme.palette.success.dark || '#16a34a'` — a fallback
                      that can never fire (every MUI palette channel defines
                      `.dark`) and a hex literal if it somehow did. Dropped in
                      favour of the token alone.
                    */}
                    <Chip
                      label={userStatusLabel}
                      size='small'
                      sx={{
                        height: 20,
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        borderRadius: 'var(--sf-radius-sm, 4px)',
                        bgcolor: alpha(
                          userStatus === 'ACTIVE' ? theme.palette.success.main : theme.palette.error.main,
                          0.12,
                        ),
                        color: userStatus === 'ACTIVE' ? theme.palette.success.dark : theme.palette.error.dark,
                      }}
                    />
                    {isEmailVerified && (
                      <Chip
                        icon={<CheckCircleOutline sx={{ fontSize: '14px !important' }} />}
                        label={t('auth.account.verified', 'Verified')}
                        size='small'
                        sx={{
                          height: 20,
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          borderRadius: 'var(--sf-radius-sm, 4px)',
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.dark,
                        }}
                      />
                    )}
                  </Stack>
                  <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: '0.875rem', mt: 0.25 }} noWrap>
                    {user.email || t('auth.account.no_email', 'No email address on file')}
                  </Typography>
                </>
              )}
            </Box>
          </Stack>

          <Stack direction='row' spacing={1.5} alignItems='center' flexWrap='wrap'>
            {userRole && (
              <Chip
                icon={<AdminPanelSettingsOutlined sx={{ fontSize: '15px !important' }} />}
                label={typeof userRole === 'string' ? userRole.toUpperCase() : `Role #${userRole}`}
                variant='outlined'
                size='small'
                sx={{ borderRadius: 'var(--sf-radius-sm, 6px)', fontWeight: 600, fontSize: '0.75rem', borderColor: 'divider' }}
              />
            )}
            {user.tenantId && (
              <Chip
                label={t('auth.account.tenant_label', {
                  tenant: user.tenantId,
                  defaultValue: 'Tenant: {{tenant}}',
                })}
                variant='outlined'
                size='small'
                sx={{ borderRadius: 'var(--sf-radius-sm, 6px)', fontWeight: 500, fontSize: '0.75rem', borderColor: 'divider' }}
              />
            )}
          </Stack>
        </Stack>
      </Card>

      {/* ── Passkey Promotion Banner ── */}
      <Card
        variant='outlined'
        sx={{
          mb: 3.5,
          p: { xs: 2, sm: 2.5 },
          borderRadius: 'var(--sf-radius-lg, 16px)',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          boxShadow: 'var(--sf-shadow-xs)',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2.5,
        }}
      >
        <Stack direction='row' spacing={2.5} alignItems='center' sx={{ flex: 1 }}>
          <Avatar
            aria-hidden
            sx={{ bgcolor: alpha(theme.palette.warning.main, 0.12), color: theme.palette.warning.dark, width: 48, height: 48, flexShrink: 0 }}
          >
            <FingerprintOutlined sx={{ fontSize: 26 }} />
          </Avatar>
          <Box>
            <Typography variant='subtitle1' sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1rem', mb: 0.25 }}>
              {passkeysCount > 0
                ? t('auth.account.passkey_active_title', 'Passkey authentication enabled')
                : t('auth.account.passkey_banner_title', 'Strengthen Your Account with Passkeys')}
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.45 }}>
              {passkeysCount > 0
                ? t(
                    'auth.account.passkey_active_desc',
                    'Your account is protected by a passkey. You can manage or add another one anytime.',
                  )
                : t(
                    'auth.account.passkey_banner_desc',
                    'Experience fast, phishing-resistant logins using biometric verification (Touch ID, Face ID, Windows Hello) or security keys.',
                  )}
            </Typography>
          </Box>
        </Stack>

        <Button
          component={RouterLink}
          to={Path.mfa.passkey.management}
          variant='outlined'
          startIcon={<VpnKeyOutlined sx={{ fontSize: 16 }} />}
          sx={{
            minHeight: 44,
            borderColor: 'divider',
            color: 'text.primary',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 'var(--sf-radius-md, 10px)',
            px: 2.25,
            fontSize: '0.875rem',
            whiteSpace: 'nowrap',
            backgroundColor: 'background.paper',
            boxShadow: `0 1px 2px ${alpha(theme.palette.common.black, 0.05)}`,
            width: { xs: '100%', sm: 'auto' },
            '&:hover': { borderColor: 'text.secondary', backgroundColor: alpha(theme.palette.action.hover, 0.04) },
          }}
        >
          {passkeysCount > 0
            ? t('auth.account.manage_passkeys_cta', 'Manage keys')
            : t('auth.account.setup_passkey', 'Set Up Passkey')}
        </Button>
      </Card>

      {/* ── Bento Grid (Metric Cards) ──
          Five tiles, each a measurement with a link to where it is managed —
          Active Sessions, Passkeys, MFA, Linked Accounts, and now API Tokens.
          The token count (`stats.tokensCount`) was already computed from a
          real query but never rendered anywhere: the inline token-management
          card that used to sit lower on this page was commented out (see the
          note below), and nothing replaced the summary it provided. This
          tile restores that, in the same pattern as its four siblings,
          linking to the dedicated API tokens screen rather than
          reintroducing a second copy of that management UI on this page.
      */}
      <Grid
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
          gap: 2.5,
          mb: 3.5,
          width: '100%',
        }}
      >
        <OverviewMetricCard
          label={t('auth.account.active_sessions', 'Active Sessions')}
          icon={<DevicesOutlined sx={{ fontSize: 18 }} />}
          tone='warning'
          value={stats.activeSessions}
          valueLoading={isLoading}
          linkTo={Path.session.activeSessions}
          linkLabel={t('auth.account.manage_devices', 'Manage Devices')}
        />

        <OverviewMetricCard
          label={t('auth.account.passkeys_enrolled', 'Passkeys & Biometrics')}
          icon={<FingerprintOutlined sx={{ fontSize: 18 }} />}
          tone='error'
          value={
            <Stack direction='row' spacing={1} alignItems='baseline'>
              <Typography variant='h4' sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.875rem', lineHeight: 1 }}>
                {stats.passkeysCount}
              </Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.875rem' }}>
                {stats.passkeysCount > 0
                  ? t('auth.account.common.active', 'Active')
                  : t('auth.account.common.disabled', 'Disabled')}
              </Typography>
            </Stack>
          }
          valueLoading={isLoading}
          linkTo={Path.mfa.passkey.management}
          linkLabel={t('auth.account.manage_passkeys', 'Manage Passkeys')}
        />

        <OverviewMetricCard
          label={t('auth.account.mfa_status', 'MFA Status')}
          icon={<VerifiedUserOutlined sx={{ fontSize: 17 }} />}
          tone={stats.isMfaEnabled ? 'success' : 'error'}
          value={
            stats.isMfaEnabled ? t('auth.account.mfa.enabled', 'Enabled') : t('auth.account.mfa.disabled', 'Disabled')
          }
          valueLoading={isLoading}
          linkTo={stats.isMfaEnabled ? Path.mfa.mfa.management : Path.mfa.mfa.setup}
          linkLabel={
            stats.isMfaEnabled ? t('auth.account.mfa.manage', 'Manage MFA') : t('auth.account.mfa.enable_now', 'Enable 2FA Now')
          }
        />

        <OverviewMetricCard
          label={t('auth.account.linked_accounts', 'Linked Accounts')}
          icon={<LinkOutlined sx={{ fontSize: 18 }} />}
          tone='primary'
          value={stats.linkedAccounts}
          // Each count waits on its own query — the shared `isLoading` never
          // covered these two, so they flashed a false "0" first.
          valueLoading={isLinkedLoading}
          linkTo={Path.user.profile.linkedAccounts}
          linkLabel={t('auth.account.manage_accounts', 'Manage Accounts')}
        />

        <OverviewMetricCard
          label={t('auth.account.api_tokens', 'API Tokens')}
          icon={<KeyOutlined sx={{ fontSize: 18 }} />}
          tone='info'
          value={stats.tokensCount}
          valueLoading={isTokensLoading}
          // `Path.apiTokens` (top-level) is the whole authorization-engine path
          // object, not a route string — the real string lives under the
          // admin grouping key even though the route itself needs no admin
          // permission (`/auth/api-tokens`, registered with createAuthRoute).
          linkTo={Path.admin.apiTokens}
          linkLabel={t('auth.account.manage_tokens', 'Manage Tokens')}
        />
      </Grid>

      {/* ── Recent Security Activity Card ── */}
      <Card
        variant='outlined'
        sx={{ borderRadius: 'var(--sf-radius-lg, 16px)', borderColor: 'divider', backgroundColor: 'background.paper', boxShadow: 'var(--sf-shadow-xs)', overflow: 'hidden' }}
      >
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
            <Typography variant='subtitle1' sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.05rem', mb: 0.25 }}>
              {t('auth.account.activity.recent_feed', 'Recent Security Activity')}
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
              {t('auth.account.activity.subtitle', 'Chronological feed of login events, security changes, and sessions.')}
            </Typography>
          </Box>

          <Button
            component={RouterLink}
            to={Path.session.activityTimeline}
            variant='text'
            endIcon={<ChevronRight sx={{ fontSize: 18 }} />}
            sx={{
              minHeight: 44,
              color: 'text.primary',
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'none',
              '&:hover': { backgroundColor: 'transparent', color: theme.palette.primary.main },
            }}
          >
            {t('auth.account.activity.view_full_history', 'View Full History')}
          </Button>
        </Box>

        {isActivityLoading ? (
          <Box sx={{ p: 2.5 }}>
            {[1, 2, 3].map((item) => (
              <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
                <Skeleton variant='circular' width={36} height={36} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width='30%' height={20} />
                  <Skeleton width='60%' height={16} />
                </Box>
                <Skeleton width='15%' height={16} />
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
                    '&:hover': { backgroundColor: alpha(theme.palette.action.hover, 0.04) },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Avatar
                      aria-hidden
                      sx={{
                        bgcolor: alpha(item.success ? theme.palette.info.main : theme.palette.error.main, 0.1),
                        color: item.success ? theme.palette.info.main : theme.palette.error.main,
                        width: 38,
                        height: 38,
                      }}
                    >
                      {item.success ? <ShieldOutlined sx={{ fontSize: 20 }} /> : <SecurityOutlined sx={{ fontSize: 20 }} />}
                    </Avatar>
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Typography variant='body2' sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.875rem' }}>
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      <Box component='span' sx={{ display: 'inline-block', mt: 0.5 }}>
                        <Chip
                          label={item.meta}
                          size='small'
                          sx={{ height: 22, fontSize: '0.75rem', bgcolor: 'action.hover', color: 'text.secondary', fontWeight: 500, borderRadius: 'var(--sf-radius-sm, 6px)' }}
                        />
                      </Box>
                    }
                    slotProps={{ secondary: { component: 'div' } }}
                    sx={{ my: 0 }}
                  />

                  <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                    {item.timestamp}
                  </Typography>
                </ListItem>
              )
            })}
          </List>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            {/* An empty feed is not an error — was rendered with ErrorOutline,
                the same icon the failed-query banner above uses. */}
            <HistoryToggleOffOutlined sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              {t('auth.account.activity.no_recent_activity', 'No recent security activity found.')}
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  )
}

export default AccountOverview
