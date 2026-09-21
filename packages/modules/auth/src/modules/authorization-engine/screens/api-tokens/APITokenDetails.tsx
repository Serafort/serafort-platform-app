import React, { useMemo, useState } from 'react'
import { Box, Button, Stack, Skeleton } from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import TerminalIcon from '@mui/icons-material/Terminal'
import TuneIcon from '@mui/icons-material/Tune'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import PublicIcon from '@mui/icons-material/Public'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useUserTokens, useRevokeToken } from '@auth/user-directory/hooks/useUserQuery'
import Path from '../path'
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminStatusBadge,
  type AdminStatusTone,
} from '../../../authentication-core/components/shared/admin'
import { ConfirmationDialog } from '../../../authentication-core/components/shared'
import { MetaGrid, MetaItem, MonoTag, SectionCard, TintAlert } from '../../components/panels'

interface TokenData {
  id: number | string
  name: string
  abilities: string[]
  lastUsedAt: string | null
  createdAt: string
  expiresAt: string | null
  status: 'active' | 'expired'
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

const APITokenDetails: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { tokenId } = useParams<{ tokenId: string }>()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { data: tokensResponse, isLoading, isError, refetch } = useUserTokens()

  const token = useMemo<TokenData | undefined>(() => {
    const list = tokensResponse?.data
    if (!Array.isArray(list)) return undefined
    return (list as unknown as TokenData[]).find((tk) => String(tk.id) === tokenId)
  }, [tokensResponse, tokenId])

  const revokeTokenMutation = useRevokeToken({
    onSuccess: () => {
      toast.success(t('auth.api_tokens.revoke_success', 'Token revoked successfully'))
      navigate(Path.dashboard)
    },
    onError: () => {
      toast.error(t('auth.api_tokens.revoke_error', 'Failed to revoke'))
    },
  })

  const formatDate = (value: string | null | undefined): string => {
    if (!value) return t('auth.common.never', 'Never')
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const expiry = useMemo((): { tone: AdminStatusTone; label: string } => {
    if (!token) return { tone: 'neutral', label: '' }
    if (token.status === 'expired') {
      return { tone: 'error', label: t('auth.api_tokens.expired', 'Expired') }
    }
    if (!token.expiresAt) {
      return { tone: 'info', label: t('auth.api_tokens.no_expiry', 'No expiry') }
    }
    const days = Math.ceil((new Date(token.expiresAt).getTime() - Date.now()) / MS_PER_DAY)
    if (days <= 0) return { tone: 'error', label: t('auth.api_tokens.expired', 'Expired') }
    if (days <= 7) {
      return { tone: 'warning', label: t('auth.api_tokens.expiring_soon', 'Expiring soon') }
    }
    return {
      tone: 'success',
      label: `${days} ${t('auth.common.daysRemaining', 'days remaining')}`,
    }
  }, [token, t])

  const breadcrumbs = [
    { label: t('auth.api_tokens.title', 'API Tokens'), to: Path.dashboard },
    { label: token?.name ?? t('auth.api_tokens.details_title', 'Token Details') },
  ]

  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }} aria-busy='true'>
        <Skeleton variant='text' width={220} height={20} />
        <Skeleton variant='text' width={360} height={44} sx={{ mb: 3 }} />
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' } }}>
          <Stack spacing={3}>
            <Skeleton variant='rounded' height={150} sx={{ borderRadius: 'var(--sf-radius-lg, 12px)' }} />
            <Skeleton variant='rounded' height={190} sx={{ borderRadius: 'var(--sf-radius-lg, 12px)' }} />
          </Stack>
          <Skeleton variant='rounded' height={240} sx={{ borderRadius: 'var(--sf-radius-lg, 12px)' }} />
        </Box>
      </Box>
    )
  }

  if (isError || !token) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        <AdminPageHeader
          breadcrumbs={breadcrumbs.slice(0, 1)}
          icon={<VpnKeyOutlinedIcon />}
          title={t('auth.api_tokens.details_title', 'Token Details')}
        />
        <AdminEmptyState
          variant='error'
          icon={<VpnKeyOutlinedIcon />}
          title={t('auth.api_tokens.token_not_found_title', 'We could not find this token')}
          description={
            isError
              ? t(
                  'auth.api_tokens.token_load_error',
                  'The token list could not be loaded. Check your connection and try again.',
                )
              : t(
                  'auth.api_tokens.token_not_found',
                  'Token not found or you do not have access to it.',
                )
          }
          action={
            <Stack direction='row' spacing={1.5} justifyContent='center'>
              {isError && (
                <Button variant='outlined' onClick={() => refetch()} sx={{ minHeight: 44 }}>
                  {t('auth.common.retry', 'Try again')}
                </Button>
              )}
              <Button variant='contained' onClick={() => navigate(Path.dashboard)} sx={{ minHeight: 44 }}>
                {t('auth.common.goBack', 'Go Back')}
              </Button>
            </Stack>
          }
        />
      </Box>
    )
  }

  const isActive = token.status === 'active'
  const goTo = (path: string) => navigate(path.replace(':tokenId', String(token.id)))

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <AdminPageHeader
        breadcrumbs={breadcrumbs}
        icon={<VpnKeyOutlinedIcon />}
        tone={isActive ? 'primary' : 'error'}
        title={token.name}
        description={
          <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap' useFlexGap>
            <Box component='span' sx={{ fontFamily: 'var(--sf-font-mono, monospace)' }}>
              ID {token.id}
            </Box>
            <AdminStatusBadge
              tone={isActive ? 'success' : 'error'}
              label={isActive ? t('auth.common.active', 'Active') : t('auth.common.expired', 'Expired')}
            />
            <AdminStatusBadge tone={expiry.tone} label={expiry.label} />
          </Stack>
        }
        actions={
          <Stack direction='row' spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant='outlined'
              startIcon={<TuneIcon />}
              onClick={() => goTo(Path.actions)}
              sx={{ minHeight: 44, flex: { xs: 1, sm: 'none' } }}
            >
              {t('auth.api_tokens.manage_token', 'Manage')}
            </Button>
            <Button
              variant='contained'
              color='error'
              startIcon={<DeleteOutlineIcon />}
              onClick={() => setConfirmOpen(true)}
              disabled={revokeTokenMutation.isPending}
              sx={{ minHeight: 44, flex: { xs: 1, sm: 'none' } }}
            >
              {t('auth.common.revoke', 'Revoke Token')}
            </Button>
          </Stack>
        }
      />

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 2fr) minmax(0, 1fr)' } }}>
        <Stack spacing={3}>
          <SectionCard
            id='token-overview'
            icon={<EventOutlinedIcon fontSize='small' />}
            title={t('auth.api_tokens.overview', 'Overview')}
            description={t('auth.api_tokens.overview_desc', 'When this token was issued and last used.')}
          >
            <MetaGrid>
              <MetaItem label={t('auth.api_tokens.created_at', 'Created')}>{formatDate(token.createdAt)}</MetaItem>
              <MetaItem label={t('auth.api_tokens.expires_at', 'Expires')}>{formatDate(token.expiresAt)}</MetaItem>
              <MetaItem label={t('auth.api_tokens.last_used', 'Last Used')}>{formatDate(token.lastUsedAt)}</MetaItem>
            </MetaGrid>
          </SectionCard>

          <SectionCard
            id='token-scopes'
            icon={<ShieldOutlinedIcon fontSize='small' />}
            title={t('auth.api_tokens.permissions', 'Permissions & Scopes')}
            description={t('auth.api_tokens.permissions_desc', 'What applications holding this token are allowed to do.')}
          >
            {token.abilities && token.abilities.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {token.abilities.map((ability) => (
                  <MonoTag key={ability} tone='primary'>
                    {ability}
                  </MonoTag>
                ))}
              </Box>
            ) : (
              <TintAlert tone='warning' icon={<PublicIcon />} title={t('auth.api_tokens.full_access', 'Full access, no scope restrictions')}>
                {t(
                  'auth.api_tokens.full_access_hint',
                  'This token can call every endpoint you can. Prefer a scoped token for production.',
                )}
              </TintAlert>
            )}
          </SectionCard>
        </Stack>

        <Stack spacing={3}>
          <SectionCard
            id='token-next'
            icon={<TerminalIcon fontSize='small' />}
            title={t('auth.api_tokens.quick_actions', 'Quick Actions')}
          >
            <Stack spacing={1.5}>
              <Button
                variant='outlined'
                fullWidth
                startIcon={<TerminalIcon />}
                onClick={() => goTo(Path.display)}
                sx={{ minHeight: 44, justifyContent: 'flex-start' }}
              >
                {t('auth.api_tokens.usage_guide', 'Usage Guide')}
              </Button>
              <Button
                variant='outlined'
                fullWidth
                startIcon={<TuneIcon />}
                onClick={() => goTo(Path.actions)}
                sx={{ minHeight: 44, justifyContent: 'flex-start' }}
              >
                {t('auth.api_tokens.manage_header', 'Manage Token Settings')}
              </Button>
            </Stack>
          </SectionCard>

          <TintAlert tone='info' title={t('auth.api_tokens.security_tip_title', 'Security Reminder')}>
            {t(
              'auth.api_tokens.revoke_warning',
              'Once revoked, this token will immediately stop working. Any applications using this token will lose access.',
            )}
          </TintAlert>
        </Stack>
      </Box>

      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => revokeTokenMutation.mutate(token.id)}
        isSubmitting={revokeTokenMutation.isPending}
        severity='error'
        title={t('auth.api_tokens.revoke_confirm_title', 'Revoke API Token?')}
        message={t(
          'auth.api_tokens.revoke_confirm_msg',
          'Revoke "{{name}}"? Applications using this token lose access immediately, and it cannot be restored.',
          { name: token.name },
        )}
        confirmLabel={t('auth.common.revokePermanently', 'Revoke Permanently')}
        cancelLabel={t('auth.common.cancel', 'Cancel')}
      />
    </Box>
  )
}

export default APITokenDetails
