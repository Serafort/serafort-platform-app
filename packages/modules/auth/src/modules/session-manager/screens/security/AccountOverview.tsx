import React, { useMemo, useState, useCallback } from 'react'
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
  IconButton,
  Tooltip,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  InputAdornment,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import DevicesOutlined from '@mui/icons-material/DevicesOutlined'
import FingerprintOutlined from '@mui/icons-material/FingerprintOutlined'
import ShieldOutlined from '@mui/icons-material/ShieldOutlined'
import SecurityOutlined from '@mui/icons-material/SecurityOutlined'
import VerifiedUserOutlined from '@mui/icons-material/VerifiedUserOutlined'
import LinkOutlined from '@mui/icons-material/LinkOutlined'
import LinkOffOutlined from '@mui/icons-material/LinkOffOutlined'
import EditOutlined from '@mui/icons-material/EditOutlined'
import VpnKeyOutlined from '@mui/icons-material/VpnKeyOutlined'
import KeyOutlined from '@mui/icons-material/KeyOutlined'
import AddOutlined from '@mui/icons-material/AddOutlined'
import DeleteOutline from '@mui/icons-material/DeleteOutline'
import ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined'
import CheckOutlined from '@mui/icons-material/CheckOutlined'
import ChevronRight from '@mui/icons-material/ChevronRight'
import ErrorOutline from '@mui/icons-material/ErrorOutline'
import Refresh from '@mui/icons-material/Refresh'
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline'
import AdminPanelSettingsOutlined from '@mui/icons-material/AdminPanelSettingsOutlined'
import { useAppStore } from '@cap/platform-store'
import { Path } from '../../../../routes/path'
import {
  useGetUser,
  useSecurityStatus,
  useActivityTimeline,
  useLinkedAccounts,
  useUnlinkAccount,
  useUserPasskeys,
  useUserTokens,
  useCreateToken,
  useRevokeToken,
} from '../../../../modules/user-directory/hooks'
import type {
  AuditLog,
  UserDTO,
  LinkedAccountDTO,
  PersonalAccessTokenDTO,
} from '../../../../modules/authentication-core/types/api.types'
import Grid from '@cap/layout/components/Grid'

interface FormattedActivity {
  id: string
  title: string
  meta: string
  timestamp: string
  success: boolean
}

const AVAILABLE_ABILITIES = [
  { key: 'read', label: 'Read Access (General)' },
  { key: 'write', label: 'Write Access (General)' },
  { key: 'profile:read', label: 'Read Profile' },
  { key: 'profile:write', label: 'Update Profile' },
  { key: 'notifications:read', label: 'Read Notifications' },
  { key: 'widgets:read', label: 'Read Dashboard Widgets' },
  { key: 'widgets:write', label: 'Manage Dashboard Widgets' },
  { key: 'theme:read', label: 'Read Theme Config' },
  { key: 'theme:write', label: 'Update Theme Config' },
  { key: 'dashboard:read', label: 'Read Dashboard Analytics' },
]

export const AccountOverview: React.FC = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const storeUser = useAppStore((state) => state.user)

  // ── Modals & Dialog State ──
  // const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false)
  // const [accountToUnlink, setAccountToUnlink] = useState<LinkedAccountDTO | null>(null)

  // const [createTokenDialogOpen, setCreateTokenDialogOpen] = useState(false)
  // const [tokenName, setTokenName] = useState('')
  // const [tokenExpiresIn, setTokenExpiresIn] = useState('30 days')
  // const [tokenAbilities, setTokenAbilities] = useState<string[]>(['read', 'write'])

  // const [newTokenSecret, setNewTokenSecret] = useState<string | null>(null)
  // const [isCopiedToken, setIsCopiedToken] = useState(false)

  // const [revokeTokenDialogOpen, setRevokeTokenDialogOpen] = useState(false)
  // const [tokenToRevoke, setTokenToRevoke] = useState<PersonalAccessTokenDTO | null>(null)

  // ── TanStack Query Hooks ──
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

  // ── Mutations ──
  // const { mutate: unlinkAccount, isPending: isUnlinking } = useUnlinkAccount({
  //   onSuccess: () => {
  //     toast.success(t('auth.account.unlink_success', 'Account unlinked successfully'))
  //     setUnlinkDialogOpen(false)
  //     setAccountToUnlink(null)
  //   },
  //   onError: (err: any) => {
  //     toast.error(
  //       err?.response?.data?.message ||
  //       err?.message ||
  //       t('auth.account.unlink_error', 'Failed to unlink account'),
  //     )
  //   },
  // })

  // const { mutate: createToken, isPending: isCreatingToken } = useCreateToken({
  //   onSuccess: (res) => {
  //     const generated = (res?.data as any)?.token || (res as any)?.token || ''
  //     if (generated) {
  //       setNewTokenSecret(generated)
  //     } else {
  //       toast.success(t('auth.account.token_created', 'Personal access token created successfully'))
  //       setCreateTokenDialogOpen(false)
  //     }
  //     setTokenName('')
  //     setTokenAbilities(['read', 'write'])
  //   },
  //   onError: (err: any) => {
  //     toast.error(
  //       err?.response?.data?.error ||
  //       err?.response?.data?.message ||
  //       err?.message ||
  //       t('auth.account.token_create_error', 'Failed to create personal access token'),
  //     )
  //   },
  // })

  // const { mutate: revokeToken, isPending: isRevokingToken } = useRevokeToken({
  //   onSuccess: () => {
  //     toast.success(t('auth.account.token_revoked', 'Personal access token revoked successfully'))
  //     setRevokeTokenDialogOpen(false)
  //     setTokenToRevoke(null)
  //   },
  //   onError: (err: any) => {
  //     toast.error(
  //       err?.response?.data?.message ||
  //       err?.message ||
  //       t('auth.account.token_revoke_error', 'Failed to revoke token'),
  //     )
  //   },
  // })

  const isLoading =
    isUserLoading || isSecurityLoading || isPasskeysLoading || isLinkedLoading || isTokensLoading
  const isFetching =
    isUserFetching ||
    isSecurityFetching ||
    isPasskeysFetching ||
    isLinkedFetching ||
    isTokensFetching ||
    isActivityFetching
  const isAnyError =
    isUserError ||
    isSecurityError ||
    isPasskeysError ||
    isLinkedError ||
    isTokensError ||
    isActivityError

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
  const userRole = user.role || (user.roles && user.roles[0]) || ''

  const security = securityResponse?.data
  const passkeys = useMemo(() => {
    const raw = passkeysResponse?.data
    if (Array.isArray(raw)) return raw
    if (raw && typeof raw === 'object' && Array.isArray((raw as any).passkeys)) {
      return (raw as any).passkeys
    }
    return []
  }, [passkeysResponse])

  const linkedAccounts = useMemo<LinkedAccountDTO[]>(() => {
    const raw = linkedAccountsResponse?.data
    if (Array.isArray(raw)) return raw
    if (raw && typeof raw === 'object' && Array.isArray((raw as any).accounts)) {
      return (raw as any).accounts
    }
    return []
  }, [linkedAccountsResponse])

  const tokens = useMemo<PersonalAccessTokenDTO[]>(() => {
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

  const stats = useMemo(() => {
    return {
      activeSessions: security?.activeSessions ?? 1,
      passkeysCount,
      isMfaEnabled: isMfaActive,
      linkedAccounts: linkedAccounts.length,
      tokensCount: tokens.length,
    }
  }, [security, passkeysCount, isMfaActive, linkedAccounts, tokens])

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

  // const handleCopyToken = () => {
  //   if (newTokenSecret) {
  //     navigator.clipboard.writeText(newTokenSecret)
  //     setIsCopiedToken(true)
  //     toast.success(t('auth.account.token_copied', 'Token copied to clipboard'))
  //     setTimeout(() => setIsCopiedToken(false), 2500)
  //   }
  // }

  // const handleToggleAbility = (ability: string) => {
  //   setTokenAbilities((prev) =>
  //     prev.includes(ability) ? prev.filter((a) => a !== ability) : [...prev, ability],
  //   )
  // }

  // const handleSubmitCreateToken = (e: React.FormEvent) => {
  //   e.preventDefault()
  //   if (!tokenName.trim()) {
  //     toast.error(t('auth.account.token_name_required', 'Token name is required'))
  //     return
  //   }
  //   createToken({
  //     name: tokenName.trim(),
  //     expiresIn: tokenExpiresIn,
  //     abilities: tokenAbilities,
  //   })
  // }

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
            variant='h4'
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
            variant='body2'
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

        <Stack direction='row' spacing={1.5} alignItems='center'>
          <Button
            component={RouterLink}
            to={Path.user.profile.view}
            variant='outlined'
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
        </Stack>
      </Box>

      {/* ── Error Banner if any query failed ── */}
      {isAnyError && (
        <Alert
          severity='warning'
          sx={{ mb: 3.5, borderRadius: '12px' }}
          action={
            <Button
              color='inherit'
              size='small'
              startIcon={<Refresh />}
              onClick={handleRefreshAll}
              disabled={isFetching}
            >
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
          borderRadius: '16px',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
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
                      sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        fontSize: { xs: '1.05rem', sm: '1.2rem' },
                      }}
                      noWrap
                    >
                      {displayName}
                    </Typography>
                    <Chip
                      label={userStatus}
                      size='small'
                      sx={{
                        height: 20,
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        borderRadius: '4px',
                        bgcolor:
                          userStatus === 'ACTIVE'
                            ? alpha(theme.palette.success.main, 0.12)
                            : alpha(theme.palette.error.main, 0.12),
                        color:
                          userStatus === 'ACTIVE'
                            ? theme.palette.success.dark || '#16a34a'
                            : theme.palette.error.dark || '#dc2626',
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
                          borderRadius: '4px',
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.dark || '#0284c7',
                        }}
                      />
                    )}
                  </Stack>
                  <Typography
                    variant='body2'
                    sx={{ color: 'text.secondary', fontSize: '0.875rem', mt: 0.25 }}
                    noWrap
                  >
                    {user.email || t('auth.account.no_email', 'No email address')}
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
                sx={{
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  borderColor: 'divider',
                }}
              />
            )}
            {user.tenantId && (
              <Chip
                label={`${t('auth.account.tenant', 'Tenant')}: ${user.tenantId}`}
                variant='outlined'
                size='small'
                sx={{
                  borderRadius: '6px',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  borderColor: 'divider',
                }}
              />
            )}
          </Stack>
        </Stack>
      </Card>

      {/* ── Passkey Promotion Banner ── */}
      <Card
        variant='outlined'
        sx={{
          my: { xs: 2, sm: 0, md: 2, lg: 2 },
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
        }}
      >
        <Stack direction='row' spacing={2.5} alignItems='center' sx={{ flex: 1 }}>
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
              variant='subtitle1'
              sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1rem', mb: 0.25 }}
            >
              {passkeysCount > 0
                ? t('auth.account.passkey_active_title', 'Passkey Authentication Enabled')
                : t('auth.account.passkey_banner_title', 'Strengthen Your Account with Passkeys')}
            </Typography>
            <Typography
              variant='body2'
              sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.45 }}
            >
              {passkeysCount > 0
                ? t(
                    'auth.account.passkey_active_desc',
                    'Your account is protected by biometric passkeys. You can manage or add new security keys anytime.',
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
          {passkeysCount > 0
            ? t('auth.account.manage_passkeys_cta', 'Manage Keys')
            : t('auth.account.setup_passkey', 'Set Up Passkey')}
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
          my: 3.5,
          width: '100%',
        }}
      >
        {/* Card 1: Active Sessions */}
        <Grid
          size={{ xs: 12, md: 6, lg: 3 }}
          sx={{
            // my: { xs: 1, sm: 0 },
            m: { xs: 0, sx: 0, md: 2, lg: 2 },
            ml: { xs: 0, sx: 0, md: 0, lg: 0 },
            my: { xs: 2, sm: 0, md: 2, lg: 2 },
          }}
        >
          <Card
            variant='outlined'
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
              padding: '12px',
            }}
          >
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 2,
                }}
              >
                <Typography
                  variant='body2'
                  sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.875rem' }}
                >
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
                <Skeleton width='40%' height={40} />
              ) : (
                <Typography
                  variant='h4'
                  sx={{
                    fontWeight: 800,
                    color: 'text.primary',
                    fontSize: '1.875rem',
                    lineHeight: 1,
                  }}
                >
                  {stats.activeSessions}
                </Typography>
              )}
            </Box>

            <Button
              component={RouterLink}
              to={Path.session.activeSessions}
              variant='text'
              endIcon={
                <ChevronRight
                  sx={{
                    fontSize: 16,
                    transition: 'transform 0.2s',
                    '.MuiButton-root:hover &': { transform: 'translateX(3px)' },
                  }}
                />
              }
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
            // my: { xs: 1, sm: 0 },
            m: { xs: 0, sx: 0, md: 2, lg: 2 },
            my: { xs: 2, sm: 0, md: 2, lg: 2 },
          }}
        >
          <Card
            variant='outlined'
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
              padding: '12px',
            }}
          >
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 2,
                }}
              >
                <Typography
                  variant='body2'
                  sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.875rem' }}
                >
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
                <Skeleton width='40%' height={40} />
              ) : (
                <Stack direction='row' spacing={1} alignItems='baseline'>
                  <Typography
                    variant='h4'
                    sx={{
                      fontWeight: 800,
                      color: 'text.primary',
                      fontSize: '1.875rem',
                      lineHeight: 1,
                    }}
                  >
                    {stats.passkeysCount}
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.875rem' }}
                  >
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
              variant='text'
              endIcon={
                <ChevronRight
                  sx={{
                    fontSize: 16,
                    transition: 'transform 0.2s',
                    '.MuiButton-root:hover &': { transform: 'translateX(3px)' },
                  }}
                />
              }
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
            // my: { xs: 1, sm: 0 },
            m: { xs: 0, sx: 0, md: 2, lg: 2 },
            my: { xs: 2, sm: 0, md: 2, lg: 2 },
          }}
        >
          <Card
            variant='outlined'
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
              padding: '12px',
            }}
          >
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography
                  variant='body2'
                  sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.875rem' }}
                >
                  {t('auth.account.mfa_status', 'MFA Status')}
                </Typography>
                <Stack direction='row' spacing={0.75} alignItems='center'>
                  <Chip
                    label='2FA'
                    size='small'
                    sx={{
                      height: 20,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      bgcolor: stats.isMfaEnabled
                        ? '#dcfce7'
                        : alpha(theme.palette.warning.main, 0.12),
                      color: stats.isMfaEnabled ? '#15803d' : theme.palette.warning.main,
                      borderRadius: '4px',
                    }}
                  />
                  <Avatar
                    sx={{
                      bgcolor: stats.isMfaEnabled
                        ? '#f0fdf4'
                        : alpha(theme.palette.error.main, 0.1),
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
                <Skeleton width='50%' height={40} />
              ) : (
                <Typography
                  variant='h4'
                  sx={{
                    fontWeight: 800,
                    color: 'text.primary',
                    fontSize: '1.75rem',
                    lineHeight: 1,
                  }}
                >
                  {stats.isMfaEnabled
                    ? t('auth.account.mfa.enabled', 'Enabled')
                    : t('auth.account.mfa.disabled', 'Disabled')}
                </Typography>
              )}
            </Box>

            <Button
              component={RouterLink}
              to={stats.isMfaEnabled ? Path.mfa.mfa.dashboard : Path.mfa.mfa.setup}
              variant='text'
              endIcon={
                <ChevronRight
                  sx={{
                    fontSize: 16,
                    transition: 'transform 0.2s',
                    '.MuiButton-root:hover &': { transform: 'translateX(3px)' },
                  }}
                />
              }
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
            my: { xs: 2, sm: 0, md: 2, lg: 2 },
          }}
        >
          <Card
            variant='outlined'
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
              padding: '12px',
            }}
          >
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 2,
                }}
              >
                <Typography
                  variant='body2'
                  sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.875rem' }}
                >
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
                <Skeleton width='40%' height={40} />
              ) : (
                <Typography
                  variant='h4'
                  sx={{
                    fontWeight: 800,
                    color: 'text.primary',
                    fontSize: '1.875rem',
                    lineHeight: 1,
                  }}
                >
                  {stats.linkedAccounts}
                </Typography>
              )}
            </Box>

            <Button
              component={RouterLink}
              to={Path.user.profile.linkedAccounts}
              variant='text'
              endIcon={
                <ChevronRight
                  sx={{
                    fontSize: 16,
                    transition: 'transform 0.2s',
                    '.MuiButton-root:hover &': { transform: 'translateX(3px)' },
                  }}
                />
              }
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

      {/* ── Section: Personal Access Tokens (PATs) & Linked Accounts Row ── */}
      <Grid
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
          gap: 3.5,
          mb: 3.5,
          width: '100%',
        }}
      >
        {/* ── Personal Access Tokens (PATs) Card ── */}
        {/* <Card
          variant="outlined"
          sx={{
            borderRadius: '16px',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              p: { xs: 2, sm: 2.5 },
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.05rem' }}>
                {t('auth.account.tokens.title', 'Personal Access Tokens')}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                {t('auth.account.tokens.desc', 'API keys for programmatic integration and CLI authentication.')}
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="small"
              startIcon={<AddOutlined />}
              onClick={() => setCreateTokenDialogOpen(true)}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
              }}
            >
              {t('auth.account.tokens.generate', 'Generate Token')}
            </Button>
          </Box>

          <Box sx={{ p: { xs: 1.5, sm: 2 }, flex: 1 }}>
            {isTokensLoading ? (
              <Stack spacing={1.5} sx={{ p: 1 }}>
                <Skeleton variant="rounded" height={50} />
                <Skeleton variant="rounded" height={50} />
              </Stack>
            ) : tokens.length > 0 ? (
              <List disablePadding>
                {tokens.map((token, index) => {
                  const isExpired = token.status === 'expired'
                  const isLast = index === tokens.length - 1
                  return (
                    <ListItem
                      key={token.id}
                      sx={{
                        py: 1.5,
                        px: 1.5,
                        borderRadius: '10px',
                        borderBottom: isLast ? 'none' : '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.action.hover, 0.04),
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: isExpired
                              ? alpha(theme.palette.error.main, 0.1)
                              : alpha(theme.palette.primary.main, 0.1),
                            color: isExpired ? theme.palette.error.main : theme.palette.primary.main,
                          }}
                        >
                          <KeyOutlined sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700, color: 'text.primary' }}
                              noWrap
                            >
                              {token.name}
                            </Typography>
                            <Chip
                              label={isExpired ? 'Expired' : 'Active'}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                bgcolor: isExpired
                                  ? alpha(theme.palette.error.main, 0.1)
                                  : alpha(theme.palette.success.main, 0.12),
                                color: isExpired
                                  ? theme.palette.error.main
                                  : theme.palette.success.dark || '#16a34a',
                              }}
                            />
                          </Stack>
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}
                          >
                            {token.expiresAt
                              ? `Expires: ${new Date(token.expiresAt).toLocaleDateString()}`
                              : 'No expiration'}
                            {token.lastUsedAt && ` • Last used: ${new Date(token.lastUsedAt).toLocaleDateString()}`}
                          </Typography>
                        </Box>
                      </Stack>

                      <Tooltip title={t('auth.account.tokens.revoke', 'Revoke Token')}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setTokenToRevoke(token)
                            setRevokeTokenDialogOpen(true)
                          }}
                        >
                          <DeleteOutline sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  )
                })}
              </List>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <KeyOutlined sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {t('auth.account.tokens.empty', 'No personal access tokens generated yet.')}
                </Typography>
              </Box>
            )}
          </Box>
        </Card> */}

        {/* ── Linked Accounts Card ── */}
        {/* <Card
          variant="outlined"
          sx={{
            borderRadius: '16px',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              p: { xs: 2, sm: 2.5 },
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.05rem' }}>
                {t('auth.account.linked.title', 'Connected Identities & OAuth')}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                {t('auth.account.linked.desc', 'Third-party single sign-on providers linked to this account.')}
              </Typography>
            </Box>

            <Button
              component={RouterLink}
              to={Path.user.profile.linkedAccounts}
              variant="outlined"
              size="small"
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {t('auth.account.linked.manage', 'Manage SSO')}
            </Button>
          </Box>

          <Box sx={{ p: { xs: 1.5, sm: 2 }, flex: 1 }}>
            {isLinkedLoading ? (
              <Stack spacing={1.5} sx={{ p: 1 }}>
                <Skeleton variant="rounded" height={50} />
                <Skeleton variant="rounded" height={50} />
              </Stack>
            ) : linkedAccounts.length > 0 ? (
              <List disablePadding>
                {linkedAccounts.map((account, index) => {
                  const isLast = index === linkedAccounts.length - 1
                  const providerName = (account.provider || '').toUpperCase()
                  return (
                    <ListItem
                      key={account.id}
                      sx={{
                        py: 1.5,
                        px: 1.5,
                        borderRadius: '10px',
                        borderBottom: isLast ? 'none' : '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.action.hover, 0.04),
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            fontWeight: 700,
                            fontSize: '0.8125rem',
                          }}
                        >
                          {providerName.slice(0, 2)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: 'text.primary' }}
                            noWrap
                          >
                            {providerName}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', display: 'block' }}
                            noWrap
                          >
                            {account.email || (account.linkedAt ? `Linked: ${new Date(account.linkedAt).toLocaleDateString()}` : 'Connected')}
                          </Typography>
                        </Box>
                      </Stack>

                      <Tooltip title={t('auth.account.linked.unlink', 'Unlink provider')}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setAccountToUnlink(account)
                            setUnlinkDialogOpen(true)
                          }}
                        >
                          <LinkOffOutlined sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  )
                })}
              </List>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <LinkOutlined sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {t('auth.account.linked.empty', 'No external accounts connected yet.')}
                </Typography>
              </Box>
            )}
          </Box>
        </Card> */}
      </Grid>

      {/* ── Recent Security Activity Card ── */}
      <Card
        variant='outlined'
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
            <Typography
              variant='subtitle1'
              sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.05rem', mb: 0.25 }}
            >
              {t('auth.account.activity.recent_feed', 'Recent Security Activity')}
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
              {t(
                'auth.account.activity.subtitle',
                'Chronological feed of login events, security changes, and sessions.',
              )}
            </Typography>
          </Box>

          <Button
            component={RouterLink}
            to={Path.session.activityTimeline}
            variant='text'
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
                        variant='body2'
                        sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.875rem' }}
                      >
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      <Box component='span' sx={{ display: 'inline-block', mt: 0.5 }}>
                        <Chip
                          label={item.meta}
                          size='small'
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
                    secondaryTypographyProps={{ component: 'div' }}
                    sx={{ my: 0 }}
                  />

                  <Typography
                    variant='caption'
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
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              {t('auth.account.activity.no_recent_activity', 'No recent security activity found.')}
            </Typography>
          </Box>
        )}
      </Card>

      {/* ── Dialog: Create Personal Access Token ── */}
      {/* <Dialog
        open={createTokenDialogOpen}
        onClose={() => {
          if (!isCreatingToken) {
            setCreateTokenDialogOpen(false)
            setNewTokenSecret(null)
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {newTokenSecret
            ? t('auth.account.tokens.secret_title', 'Token Generated Successfully')
            : t('auth.account.tokens.modal_title', 'Generate Personal Access Token')}
        </DialogTitle>
        <DialogContent>
          {newTokenSecret ? (
            <Box sx={{ pt: 1 }}>
              <Alert severity="warning" sx={{ mb: 2.5, borderRadius: '8px' }}>
                <AlertTitle sx={{ fontWeight: 700 }}>
                  {t('auth.account.tokens.save_warning_title', 'Save this token immediately')}
                </AlertTitle>
                {t(
                  'auth.account.tokens.save_warning_desc',
                  'For security reasons, you will not be able to view this token secret again.',
                )}
              </Alert>

              <TextField
                fullWidth
                label="Token Secret"
                value={newTokenSecret}
                slotProps={{
                  input: {
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleCopyToken} edge="end">
                          {isCopiedToken ? <CheckOutlined color="success" /> : <ContentCopyOutlined />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmitCreateToken} sx={{ pt: 1 }}>
              <DialogContentText sx={{ mb: 2.5, fontSize: '0.875rem' }}>
                {t(
                  'auth.account.tokens.modal_desc',
                  'Personal access tokens allow external applications and CLI tools to authenticate on your behalf with specific scopes.',
                )}
              </DialogContentText>

              <TextField
                fullWidth
                label={t('auth.account.tokens.name_label', 'Token Name')}
                placeholder="e.g. CI/CD Pipeline, VSCode Extension"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                required
                sx={{ mb: 2.5 }}
              />

              <FormControl fullWidth sx={{ mb: 2.5 }}>
                <InputLabel>{t('auth.account.tokens.expires_label', 'Expiration')}</InputLabel>
                <Select
                  value={tokenExpiresIn}
                  label={t('auth.account.tokens.expires_label', 'Expiration')}
                  onChange={(e) => setTokenExpiresIn(e.target.value)}
                >
                  <MenuItem value="7 days">7 Days</MenuItem>
                  <MenuItem value="30 days">30 Days</MenuItem>
                  <MenuItem value="60 days">60 Days</MenuItem>
                  <MenuItem value="90 days">90 Days</MenuItem>
                  <MenuItem value="1 year">1 Year</MenuItem>
                  <MenuItem value="never">No Expiration</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                {t('auth.account.tokens.scopes_label', 'Token Scopes & Abilities')}
              </Typography>
              <FormGroup sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0.5 }}>
                {AVAILABLE_ABILITIES.map((ability) => (
                  <FormControlLabel
                    key={ability.key}
                    control={
                      <Checkbox
                        checked={tokenAbilities.includes(ability.key)}
                        onChange={() => handleToggleAbility(ability.key)}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2">{ability.label}</Typography>}
                  />
                ))}
              </FormGroup>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          {newTokenSecret ? (
            <Button
              variant="contained"
              onClick={() => {
                setCreateTokenDialogOpen(false)
                setNewTokenSecret(null)
              }}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {t('auth.account.tokens.done', 'Done')}
            </Button>
          ) : (
            <>
              <Button
                onClick={() => setCreateTokenDialogOpen(false)}
                disabled={isCreatingToken}
                sx={{ textTransform: 'none', color: 'text.secondary' }}
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmitCreateToken}
                disabled={isCreatingToken || !tokenName.trim()}
                startIcon={isCreatingToken ? <CircularProgress size={16} color="inherit" /> : null}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {isCreatingToken ? t('common.generating', 'Generating...') : t('auth.account.tokens.generate', 'Generate Token')}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog> */}

      {/* ── Dialog: Revoke Personal Access Token ── */}
      {/* <Dialog
        open={revokeTokenDialogOpen}
        onClose={() => !isRevokingToken && setRevokeTokenDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {t('auth.account.tokens.revoke_confirm_title', 'Revoke Personal Access Token?')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '0.875rem' }}>
            {t(
              'auth.account.tokens.revoke_confirm_desc',
              'Any scripts or applications currently using "{{name}}" will immediately lose access. This action cannot be undone.',
              { name: tokenToRevoke?.name || 'this token' },
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setRevokeTokenDialogOpen(false)}
            disabled={isRevokingToken}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => tokenToRevoke && revokeToken(tokenToRevoke.id)}
            disabled={isRevokingToken}
            startIcon={isRevokingToken ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {isRevokingToken ? t('common.revoking', 'Revoking...') : t('auth.account.tokens.confirm_revoke', 'Revoke Token')}
          </Button>
        </DialogActions>
      </Dialog> */}

      {/* ── Dialog: Unlink External Account ── */}
      {/* <Dialog
        open={unlinkDialogOpen}
        onClose={() => !isUnlinking && setUnlinkDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {t('auth.account.linked.unlink_confirm_title', 'Unlink External Account?')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '0.875rem' }}>
            {t(
              'auth.account.linked.unlink_confirm_desc',
              'Are you sure you want to disconnect {{provider}}? You will no longer be able to log in with this third-party provider.',
              { provider: (accountToUnlink?.provider || '').toUpperCase() },
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setUnlinkDialogOpen(false)}
            disabled={isUnlinking}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => accountToUnlink && unlinkAccount(accountToUnlink.id)}
            disabled={isUnlinking}
            startIcon={isUnlinking ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {isUnlinking ? t('common.unlinking', 'Unlinking...') : t('auth.account.linked.confirm_unlink', 'Unlink Account')}
          </Button>
        </DialogActions>
      </Dialog> */}
    </Box>
  )
}

export default AccountOverview
