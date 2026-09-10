import React, { useCallback, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import BlockIcon from '@mui/icons-material/Block'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ViewIcon from '@mui/icons-material/Visibility'
import KeyIcon from '@mui/icons-material/VpnKey'
import SecurityIcon from '@mui/icons-material/Security'
import TimerIcon from '@mui/icons-material/Timer'
import TerminalIcon from '@mui/icons-material/Terminal'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useUserTokens, useRevokeToken } from '@auth/user-directory/hooks/useUserQuery'
import type { PersonalAccessTokenDTO } from '@auth/authentication-core/types/api.types'
import { Path } from '@auth/routes/path'
import {
  AdminDataState,
  AdminPageHeader,
  AdminSearchField,
  AdminStatCard,
  AdminTableCard,
  AdminTableHead,
  AdminTableHeadCell,
  AdminTableRow,
} from '../../../authentication-core/components/shared/admin'
import { AuthConfirmDrawer } from '../../../authentication-core/components/shared/auth'

/** A token is flagged as expiring while it has 30 days or less left to run. */
const EXPIRY_WARNING_DAYS = 30
const MS_PER_DAY = 24 * 60 * 60 * 1000

type TokenStatus = 'active' | 'revoked' | 'expired'

const STATUS_TONE: Record<TokenStatus, 'success' | 'error' | 'warning'> = {
  active: 'success',
  revoked: 'error',
  expired: 'warning',
}

/**
 * A token with no scope restrictions can do anything the account can. The API
 * expresses that either as an explicit wildcard ability or as no abilities at
 * all, so both are counted.
 */
const isFullAccess = (token: PersonalAccessTokenDTO): boolean => {
  const abilities = token.abilities || []
  return abilities.length === 0 || abilities.includes('*')
}

const daysUntil = (iso: string | null | undefined): number | null => {
  if (!iso) return null
  const at = new Date(iso).getTime()
  if (Number.isNaN(at)) return null
  return Math.ceil((at - Date.now()) / MS_PER_DAY)
}

const APITokensDashboard: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const theme = useTheme()

  const [searchQuery, setSearchQuery] = useState('')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedToken, setSelectedToken] = useState<PersonalAccessTokenDTO | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { data: tokensResponse, isLoading, isError, refetch } = useUserTokens()

  const revokeTokenMutation = useRevokeToken({
    onSuccess: () => {
      toast.success(t('auth.api_tokens.revoked_success', 'Token revoked.'))
      setConfirmOpen(false)
      setSelectedToken(null)
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : ''
      toast.error(message || t('auth.api_tokens.revoked_error', 'The token could not be revoked.'))
    },
  })

  const tokens = useMemo<PersonalAccessTokenDTO[]>(() => {
    const raw = tokensResponse?.data
    return Array.isArray(raw) ? raw : []
  }, [tokensResponse])

  const stats = useMemo(() => {
    const active = tokens.filter((token) => token.status === 'active')
    return {
      active: active.length,
      // Only live tokens can expire soon; an already-expired one is not a
      // pending deadline.
      expiring: active.filter((token) => {
        const days = daysUntil(token.expiresAt ?? token.expires_at)
        return days !== null && days >= 0 && days <= EXPIRY_WARNING_DAYS
      }).length,
      fullAccess: active.filter(isFullAccess).length,
    }
  }, [tokens])

  const filteredTokens = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase()
    if (!needle) return tokens
    return tokens.filter((token) => (token.name || '').toLowerCase().includes(needle))
  }, [tokens, searchQuery])

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, token: PersonalAccessTokenDTO) => {
    setAnchorEl(event.currentTarget)
    setSelectedToken(token)
  }

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const handleRevokeConfirmed = () => {
    if (selectedToken) revokeTokenMutation.mutate(selectedToken.id)
  }

  const statusLabel = (status: TokenStatus) =>
    ({
      active: t('auth.account.active', 'Active'),
      revoked: t('auth.api_tokens.revoked', 'Revoked'),
      expired: t('auth.api_tokens.expired', 'Expired'),
    })[status]

  const createButton = (
    <Button
      variant='contained'
      startIcon={<AddIcon />}
      onClick={() => navigate(Path.apiTokens.createBasic)}
      sx={{
        minHeight: 44,
        px: 3,
        borderRadius: 2,
        fontWeight: 700,
        textTransform: 'none',
        width: { xs: '100%', sm: 'auto' },
      }}
    >
      {t('auth.api_tokens.create_new_token', 'Create new token')}
    </Button>
  )

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <AdminPageHeader
        icon={<KeyIcon sx={{ fontSize: 28 }} />}
        title={t('auth.api_tokens.dashboard_title', 'API tokens')}
        description={t(
          'auth.api_tokens.dashboard_subtitle',
          'Manage and monitor your API access tokens.',
        )}
        breadcrumbs={[
          {
            label: t('auth.account.overview_title', 'Account Overview'),
            to: '/auth/account/overview',
          },
          { label: t('auth.api_tokens.title', 'API Tokens') },
        ]}
        actions={createButton}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        <AdminStatCard
          icon={<KeyIcon />}
          tone='primary'
          label={t('auth.api_tokens.total_active', 'Active tokens')}
          value={isLoading ? undefined : stats.active}
        />
        {/*
          This tile was hardcoded to 0 and never measured anything. `expiresAt`
          is on the DTO, so it is now counted.
        */}
        <AdminStatCard
          icon={<TimerIcon />}
          tone='warning'
          label={t('auth.api_tokens.expiring_soon', 'Expiring soon')}
          value={isLoading ? undefined : stats.expiring}
          caption={t('auth.api_tokens.expiring_soon_caption', 'within 30 days')}
        />
        {/*
          Replaces a "Security Status: Healthy" tile that was a constant — it
          read "Healthy" whatever the account held. A count of tokens carrying
          no scope restriction says the same thing when it is zero, and is
          actually measured.
        */}
        <AdminStatCard
          icon={<LockOpenIcon />}
          tone={stats.fullAccess > 0 ? 'warning' : 'success'}
          label={t('auth.api_tokens.full_access_count', 'Full-access tokens')}
          value={isLoading ? undefined : stats.fullAccess}
          caption={t('auth.api_tokens.full_access_caption', 'no scope restrictions')}
        />
      </Box>

      <AdminTableCard>
        <Box sx={{ px: 3, py: 2 }}>
          <AdminSearchField
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('auth.api_tokens.search_placeholder', 'Search tokens…')}
            ariaLabel={t('auth.api_tokens.search_label', 'Search tokens by name')}
            sx={{ width: { xs: '100%', sm: 360 } }}
          />
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 720 }}>
            <AdminTableHead>
              <TableRow>
                {[
                  t('auth.api_tokens.header_name', 'Token name'),
                  t('auth.api_tokens.header_status', 'Status'),
                  t('auth.api_tokens.header_created', 'Created'),
                  t('auth.api_tokens.header_last_used', 'Last used'),
                ].map((column) => (
                  <AdminTableHeadCell key={String(column)} sx={{ py: 2 }}>
                    {column}
                  </AdminTableHeadCell>
                ))}
                <AdminTableHeadCell align='right'>
                  {t('auth.api_tokens.header_actions', 'Actions')}
                </AdminTableHeadCell>
              </TableRow>
            </AdminTableHead>

            <TableBody>
              <AdminDataState
                asTableRow
                skeletonColumns={5}
                loading={isLoading}
                error={isError || undefined}
                onRetry={() => void refetch()}
                empty={filteredTokens.length === 0}
                emptyIcon={<KeyIcon sx={{ fontSize: 32 }} />}
                emptyTitle={
                  searchQuery
                    ? t('auth.api_tokens.no_tokens_found', 'No tokens match your search.')
                    : t('auth.api_tokens.no_tokens_yet', 'No API tokens yet')
                }
                emptyDescription={
                  searchQuery
                    ? undefined
                    : t(
                        'auth.api_tokens.no_tokens_yet_desc',
                        'A token lets an application call the API as you, without your password. Create one to get started.',
                      )
                }
                emptyAction={searchQuery ? undefined : createButton}
              >
                {filteredTokens.map((token) => {
                  const status = (token.status || 'active') as TokenStatus
                  const created = token.createdAt ?? token.created_at
                  const lastUsed = token.lastUsedAt ?? token.last_used_at
                  return (
                    <AdminTableRow
                      key={token.id}
                      clickable
                      onClick={() =>
                        navigate(Path.apiTokens.details.replace(':tokenId', String(token.id)))
                      }
                      aria-label={t('auth.common.viewDetails', 'View details')}
                    >
                      <TableCell>
                        <Typography variant='body2' sx={{ fontWeight: 700 }}>
                          {token.name || t('auth.api_tokens.title', 'API Tokens')}
                        </Typography>
                        <Stack
                          direction='row'
                          spacing={0.5}
                          sx={{ mt: 0.5 }}
                          flexWrap='wrap'
                          useFlexGap
                        >
                          {(token.abilities || []).slice(0, 2).map((scope) => (
                            <Chip
                              key={scope}
                              label={scope}
                              size='small'
                              variant='outlined'
                              sx={{ fontSize: '0.65rem', height: 20 }}
                            />
                          ))}
                          {(token.abilities || []).length > 2 && (
                            <Chip
                              label={`+${(token.abilities || []).length - 2}`}
                              size='small'
                              variant='outlined'
                              sx={{ fontSize: '0.65rem', height: 20 }}
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {/*
                          Was `status.toUpperCase()`, which printed the raw
                          English enum in every locale.
                        */}
                        <Chip
                          label={statusLabel(status)}
                          size='small'
                          sx={{
                            fontWeight: 700,
                            borderRadius: 1.5,
                            color: theme.palette[STATUS_TONE[status]].main,
                            bgcolor: alpha(theme.palette[STATUS_TONE[status]].main, 0.12),
                          }}
                        />
                      </TableCell>
                      <TableCell>{created ? new Date(created).toLocaleDateString() : '—'}</TableCell>
                      <TableCell>
                        {lastUsed
                          ? new Date(lastUsed).toLocaleString()
                          : t('auth.api_tokens.never_used', 'Never used')}
                      </TableCell>
                      <TableCell align='right'>
                        <Stack direction='row' spacing={0.5} justifyContent='flex-end'>
                          <IconButton
                            aria-label={t('auth.api_tokens.actions_title', 'Manage token')}
                            onClick={(event) => {
                              event.stopPropagation()
                              handleMenuOpen(event, token)
                            }}
                            sx={{ width: 44, height: 44 }}
                          >
                            <MoreVertIcon fontSize='small' />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </AdminTableRow>
                  )
                })}
              </AdminDataState>
            </TableBody>
          </Table>
        </TableContainer>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem
            onClick={() => {
              if (selectedToken) {
                navigate(Path.apiTokens.details.replace(':tokenId', String(selectedToken.id)))
              }
              handleMenuClose()
            }}
            sx={{ minHeight: 44 }}
          >
            <ListItemIcon>
              <ViewIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText primary={t('auth.common.viewDetails', 'View details')} />
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (selectedToken) {
                navigate(Path.apiTokens.display.replace(':tokenId', String(selectedToken.id)))
              }
              handleMenuClose()
            }}
            sx={{ minHeight: 44 }}
          >
            <ListItemIcon>
              <TerminalIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText primary={t('auth.api_tokens.usage_guide', 'Usage guide')} />
          </MenuItem>
          {/*
            Revoking used to fire straight from this menu with no confirmation,
            and drew its icon as an IconButton nested inside the menu item — a
            button inside a menuitem, which takes its own tab stop and is not a
            valid nesting. It is now a plain icon, and the action opens the
            shared confirmation sheet.
          */}
          <MenuItem
            onClick={() => {
              handleMenuClose()
              setConfirmOpen(true)
            }}
            sx={{ minHeight: 44, color: 'error.main' }}
          >
            <ListItemIcon>
              <BlockIcon fontSize='small' color='error' />
            </ListItemIcon>
            <ListItemText primary={t('auth.api_tokens.revoke', 'Revoke token')} />
          </MenuItem>
        </Menu>
      </AdminTableCard>

      {/*
        `info.lighter` is not a key in the MUI palette, so this banner had no
        background at all, and its text used `info.contrastText` — the colour
        meant for text sitting *on* `info.main`. Against the page background
        that is near-white on near-white. It now tints with alpha() and uses
        body text colours.
      */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ sm: 'center' }}
        sx={{
          mt: 4,
          p: 2.5,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.info.main, 0.08),
          border: '1px solid',
          borderColor: alpha(theme.palette.info.main, 0.28),
        }}
      >
        <SecurityIcon color='info' aria-hidden />
        <Box sx={{ flex: 1, minInlineSize: 0 }}>
          <Typography variant='subtitle2' sx={{ fontWeight: 800 }}>
            {t('auth.api_tokens.security_tip_title', 'Security reminder')}
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
            {t(
              'auth.api_tokens.security_tip_message',
              'Rotate your tokens regularly and restrict them to specific IP addresses.',
            )}
          </Typography>
        </Box>
        <Button
          onClick={() => navigate(Path.apiTokens.securityWarning)}
          sx={{
            minHeight: 44,
            fontWeight: 700,
            textTransform: 'none',
            flexShrink: 0,
            alignSelf: { xs: 'flex-start', sm: 'center' },
          }}
        >
          {t('auth.common.learnMore', 'Learn more')}
        </Button>
      </Stack>

      <AuthConfirmDrawer
        id='revoke-token'
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleRevokeConfirmed}
        loading={revokeTokenMutation.isPending}
        tone='error'
        title={t('auth.api_tokens.revoke_confirm_title', 'Revoke this token?')}
        description={t('auth.api_tokens.revoke_confirm_msg', {
          name: selectedToken?.name ?? '',
          defaultValue:
            'Applications using "{{name}}" will stop working immediately. This cannot be undone.',
        })}
        confirmLabel={t('auth.common.revokePermanently', 'Revoke permanently')}
      />
    </Box>
  )
}

export default APITokensDashboard
