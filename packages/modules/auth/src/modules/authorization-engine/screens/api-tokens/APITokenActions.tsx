import React, { useMemo, useState } from 'react'
import { Box, Button, Skeleton, Stack } from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import TuneIcon from '@mui/icons-material/Tune'
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useUserTokens, useRevokeToken } from '@auth/user-directory/hooks/useUserQuery'
import Path from '../path'
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminStatusBadge,
} from '../../../authentication-core/components/shared/admin'
import { ConfirmationDialog } from '../../../authentication-core/components/shared'
import { MetaGrid, MetaItem, MonoTag, SectionCard } from '../../components/panels'

interface TokenData {
  id: number | string
  name: string
  abilities: string[]
  lastUsedAt: string | null
  createdAt: string
  expiresAt: string | null
  status: 'active' | 'expired'
}

/**
 * Manage a personal access token: a read-only summary plus the destructive
 * revoke action, both backed by the real token endpoints. The API has no
 * update-token call, so name and notification settings are not editable here
 * (the previous version showed a hard-coded name and a save button that did
 * nothing).
 */
const APITokenActions: React.FC = () => {
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

  const detailsPath = Path.details.replace(':tokenId', tokenId ?? '')

  const breadcrumbs = [
    { label: t('auth.api_tokens.title', 'API Tokens'), to: Path.dashboard },
    { label: token?.name ?? t('auth.api_tokens.details_title', 'Token Details'), to: detailsPath },
    { label: t('auth.api_tokens.actions_title', 'Manage Token') },
  ]

  const formatDate = (value: string | null | undefined): string => {
    if (!value) return t('auth.common.never', 'Never')
    const date = new Date(value)
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }

  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 880, mx: 'auto' }} aria-busy='true'>
        <Skeleton variant='text' width={260} height={20} />
        <Skeleton variant='text' width={340} height={44} sx={{ mb: 3 }} />
        <Stack spacing={3}>
          <Skeleton variant='rounded' height={170} sx={{ borderRadius: 'var(--sf-radius-lg, 12px)' }} />
          <Skeleton variant='rounded' height={150} sx={{ borderRadius: 'var(--sf-radius-lg, 12px)' }} />
        </Stack>
      </Box>
    )
  }

  if (isError || !token) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 880, mx: 'auto' }}>
        <AdminPageHeader
          breadcrumbs={breadcrumbs.slice(0, 1)}
          icon={<TuneIcon />}
          title={t('auth.api_tokens.manage_header', 'Manage Token Settings')}
        />
        <AdminEmptyState
          variant='error'
          icon={<VpnKeyOutlinedIcon />}
          title={t('auth.api_tokens.token_not_found_title', 'We could not find this token')}
          description={t(
            'auth.api_tokens.token_not_found',
            'Token not found or you do not have access to it.',
          )}
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

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 880, mx: 'auto' }}>
      <AdminPageHeader
        breadcrumbs={breadcrumbs}
        icon={<TuneIcon />}
        title={t('auth.api_tokens.manage_header', 'Manage Token Settings')}
        description={t(
          'auth.api_tokens.manage_subheader_real',
          'Review this token and revoke it if it is no longer needed.',
        )}
      />

      <Stack spacing={3}>
        <SectionCard
          id='token-summary'
          icon={<VpnKeyOutlinedIcon fontSize='small' />}
          title={t('auth.api_tokens.general_settings', 'General Settings')}
          description={t(
            'auth.api_tokens.name_locked',
            'Token names are set when the token is created and cannot be changed.',
          )}
          action={
            <AdminStatusBadge
              tone={isActive ? 'success' : 'error'}
              label={isActive ? t('auth.common.active', 'Active') : t('auth.common.expired', 'Expired')}
            />
          }
        >
          <MetaGrid columns={2}>
            <MetaItem label={t('auth.api_tokens.field_name', 'Token Name')}>{token.name}</MetaItem>
            <MetaItem label={t('auth.api_tokens.token_id', 'Token ID')} mono>
              {token.id}
            </MetaItem>
            <MetaItem label={t('auth.api_tokens.created_at', 'Created')}>{formatDate(token.createdAt)}</MetaItem>
            <MetaItem label={t('auth.api_tokens.expires_at', 'Expires')}>{formatDate(token.expiresAt)}</MetaItem>
          </MetaGrid>
        </SectionCard>

        <SectionCard
          id='token-scopes'
          icon={<ShieldOutlinedIcon fontSize='small' />}
          title={t('auth.api_tokens.permissions', 'Permissions & Scopes')}
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
            <Box sx={{ color: 'text.secondary', fontSize: 'var(--sf-text-base, 0.875rem)' }}>
              {t('auth.api_tokens.full_access', 'Full access, no scope restrictions')}
            </Box>
          )}
        </SectionCard>

        <SectionCard
          id='token-danger'
          danger
          icon={<DeleteOutlineIcon fontSize='small' />}
          title={t('auth.api_tokens.danger_zone', 'Danger Zone')}
          description={t(
            'auth.api_tokens.danger_zone_desc',
            'Once revoked, this token will immediately stop working and cannot be restored.',
          )}
          footer={
            <Button
              variant='contained'
              color='error'
              startIcon={<DeleteOutlineIcon />}
              onClick={() => setConfirmOpen(true)}
              disabled={revokeTokenMutation.isPending}
              sx={{ minHeight: 44 }}
            >
              {t('auth.api_tokens.revoke_token_now', 'Revoke this Token')}
            </Button>
          }
        />
      </Stack>

      <Box sx={{ mt: 3 }}>
        <Button variant='text' onClick={() => navigate(detailsPath)} sx={{ minHeight: 44 }}>
          {t('auth.api_tokens.back_to_details', 'Back to token details')}
        </Button>
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
          'Applications using "{{name}}" will stop working immediately. This cannot be undone.',
          { name: token.name },
        )}
        confirmLabel={t('auth.common.revokePermanently', 'Revoke Permanently')}
        cancelLabel={t('auth.common.cancel', 'Cancel')}
      />
    </Box>
  )
}

export default APITokenActions
