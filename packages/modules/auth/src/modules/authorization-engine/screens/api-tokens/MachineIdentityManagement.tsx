import React, { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import Add from '@mui/icons-material/Add'
import VpnKey from '@mui/icons-material/VpnKey'
import Delete from '@mui/icons-material/Delete'
import TimerIcon from '@mui/icons-material/Timer'
import HistoryToggleOff from '@mui/icons-material/HistoryToggleOff'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import {
  useDeveloperApiKeys,
  useCreateDeveloperApiKey,
  useRevokeDeveloperApiKey,
} from '../../hooks'
import { DeveloperApiKey } from '../../services/adminService'
import { useActiveOrganizationId } from '../../../authentication-core/hooks/useActiveOrganizationId'
import {
  AdminDataState,
  AdminPageHeader,
  AdminSearchField,
  AdminStatCard,
} from '../../../authentication-core/components/shared/admin'
import {
  AuthConfirmDrawer,
  AuthCopyField,
} from '../../../authentication-core/components/shared/auth'

/** A key is flagged as expiring while it has 30 days or less left to run. */
const EXPIRY_WARNING_DAYS = 30
const MS_PER_DAY = 24 * 60 * 60 * 1000

const daysUntil = (iso: string | null): number | null => {
  if (!iso) return null
  const at = new Date(iso).getTime()
  if (Number.isNaN(at)) return null
  return Math.ceil((at - Date.now()) / MS_PER_DAY)
}

const MachineIdentityManagement: React.FC = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const orgId = useActiveOrganizationId()
  const numericOrgId = Number(orgId) || undefined

  const [search, setSearch] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [pendingRevoke, setPendingRevoke] = useState<DeveloperApiKey | null>(null)

  const { data: keysResponse, isLoading, isError, refetch } = useDeveloperApiKeys(numericOrgId)
  const createKeyMutation = useCreateDeveloperApiKey()
  const revokeKeyMutation = useRevokeDeveloperApiKey()

  const identities = useMemo<DeveloperApiKey[]>(() => {
    const raw = keysResponse?.data
    return Array.isArray(raw) ? (raw as DeveloperApiKey[]) : []
  }, [keysResponse])

  /*
   * These three tiles previously read "Active Tokens 42", "Revoked Today 3"
   * and "System Health 100%" — all three were literals in the JSX, unconnected
   * to the account. Every metric here is derived from the fetched list.
   *
   * "Revoked today" is not among them: `DeveloperApiKey` carries no revocation
   * timestamp and the endpoint returns live keys only, so there is nothing to
   * count. A tile that cannot be measured is not shown.
   */
  const stats = useMemo(() => {
    const expiring = identities.filter((key) => {
      const days = daysUntil(key.expires_at)
      return days !== null && days >= 0 && days <= EXPIRY_WARNING_DAYS
    }).length
    return {
      total: identities.length,
      expiring,
      neverUsed: identities.filter((key) => !key.last_used_at).length,
    }
  }, [identities])

  const filteredIdentities = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return identities
    return identities.filter((key) => (key.name || '').toLowerCase().includes(needle))
  }, [identities, search])

  const handleCreateKey = async () => {
    if (!newKeyName.trim() || !numericOrgId) return
    try {
      const response = await createKeyMutation.mutateAsync({
        orgId: numericOrgId,
        data: { name: newKeyName.trim() },
      })
      if (response?.data?.key) {
        setCreatedKey(response.data.key)
        toast.success(t('auth.admin.machineIdentity.created', 'API key created.'))
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : ''
      toast.error(
        message || t('auth.admin.machineIdentity.create_failed', 'The API key could not be created.'),
      )
    }
  }

  const handleRevokeConfirmed = async () => {
    if (!pendingRevoke || !numericOrgId) return
    try {
      await revokeKeyMutation.mutateAsync({ orgId: numericOrgId, keyId: pendingRevoke.id })
      toast.success(t('auth.admin.machineIdentity.revoked', 'API key revoked.'))
      setPendingRevoke(null)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : ''
      toast.error(
        message || t('auth.admin.machineIdentity.revoke_failed', 'The API key could not be revoked.'),
      )
    }
  }

  const handleCloseDialog = () => {
    setCreatedKey(null)
    setNewKeyName('')
    setCreateDialogOpen(false)
  }

  const provisionButton = (
    <Button
      variant='contained'
      startIcon={<Add />}
      onClick={() => {
        setCreatedKey(null)
        setNewKeyName('')
        setCreateDialogOpen(true)
      }}
      sx={{
        minHeight: 44,
        px: 3,
        borderRadius: 2,
        textTransform: 'none',
        fontWeight: 700,
        width: { xs: '100%', sm: 'auto' },
      }}
    >
      {t('auth.admin.machineIdentity.provision', 'Provision new key')}
    </Button>
  )

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <AdminPageHeader
        icon={<VpnKey sx={{ fontSize: 28 }} />}
        title={t('auth.admin.machineIdentity.title', 'Developer API keys')}
        description={t(
          'auth.admin.machineIdentity.subtitle',
          'Machine identities that call the API on their own behalf, without a person signing in.',
        )}
        actions={provisionButton}
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
          icon={<VpnKey />}
          tone='primary'
          label={t('auth.admin.machineIdentity.stat_total', 'Provisioned keys')}
          value={isLoading ? undefined : stats.total}
        />
        <AdminStatCard
          icon={<TimerIcon />}
          tone='warning'
          label={t('auth.admin.machineIdentity.stat_expiring', 'Expiring soon')}
          value={isLoading ? undefined : stats.expiring}
          caption={t('auth.api_tokens.expiring_soon_caption', 'within 30 days')}
        />
        <AdminStatCard
          icon={<HistoryToggleOff />}
          tone={stats.neverUsed > 0 ? 'warning' : 'success'}
          label={t('auth.admin.machineIdentity.stat_never_used', 'Never used')}
          value={isLoading ? undefined : stats.neverUsed}
          caption={t('auth.admin.machineIdentity.stat_never_used_caption', 'candidates to revoke')}
        />
      </Box>

      <Card
        sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <AdminSearchField
              value={search}
              onChange={setSearch}
              placeholder={t('auth.admin.machineIdentity.search', 'Search keys…')}
              ariaLabel={t('auth.admin.machineIdentity.search_label', 'Search API keys by name')}
              fullWidth
            />
          </Box>

          <TableContainer>
            <Table sx={{ minWidth: 760 }}>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  {[
                    t('auth.admin.machineIdentity.col_name', 'Key name'),
                    t('auth.admin.machineIdentity.col_prefix', 'Prefix'),
                    t('auth.admin.machineIdentity.col_status', 'Status'),
                    t('auth.admin.machineIdentity.col_last_used', 'Last used'),
                    t('auth.admin.machineIdentity.col_expires', 'Expires'),
                  ].map((column) => (
                    <TableCell key={String(column)} sx={{ fontWeight: 800 }}>
                      {column}
                    </TableCell>
                  ))}
                  <TableCell align='right' sx={{ fontWeight: 800 }}>
                    {t('auth.admin.machineIdentity.col_actions', 'Actions')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AdminDataState
                  asTableRow
                  skeletonColumns={6}
                  loading={isLoading}
                  error={isError || undefined}
                  onRetry={() => void refetch()}
                  empty={filteredIdentities.length === 0}
                  emptyIcon={<VpnKey sx={{ fontSize: 32 }} />}
                  emptyTitle={
                    search
                      ? t('auth.admin.machineIdentity.no_match', 'No keys match your search.')
                      : t('auth.admin.machineIdentity.empty_title', 'No API keys yet')
                  }
                  emptyDescription={
                    search
                      ? undefined
                      : t(
                          'auth.admin.machineIdentity.empty_body',
                          'Provision a key to let a service — a CI pipeline, say — call the API without a person signing in.',
                        )
                  }
                  emptyAction={search ? undefined : provisionButton}
                >
                  {filteredIdentities.map((identity) => {
                    const days = daysUntil(identity.expires_at)
                    const isExpired = days !== null && days < 0
                    return (
                      <TableRow key={identity.id} hover>
                        <TableCell>
                          <Stack direction='row' spacing={2} alignItems='center'>
                            <VpnKey sx={{ color: 'primary.main' }} aria-hidden />
                            <Typography variant='body2' sx={{ fontWeight: 700 }}>
                              {identity.name}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography
                            component='code'
                            variant='caption'
                            // Attribute rather than a CSS declaration: stylis
                            // rewrites the value under RTL, which would reverse
                            // a key prefix.
                            dir='ltr'
                            sx={{
                              fontFamily: 'monospace',
                              bgcolor: 'action.selected',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                            }}
                          >
                            {identity.prefix}…
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {/*
                            This chip was hardcoded to "ACTIVE" for every row,
                            so an expired key was labelled active. There is no
                            status field on the record, but `expires_at` is
                            enough to tell the two apart.
                          */}
                          <Chip
                            label={
                              isExpired
                                ? t('auth.api_tokens.expired', 'Expired')
                                : t('auth.account.active', 'Active')
                            }
                            size='small'
                            sx={{
                              borderRadius: 1.5,
                              fontWeight: 800,
                              height: 24,
                              color: isExpired
                                ? theme.palette.warning.main
                                : theme.palette.success.main,
                              bgcolor: alpha(
                                isExpired
                                  ? theme.palette.warning.main
                                  : theme.palette.success.main,
                                0.12,
                              ),
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant='caption'>
                            {identity.last_used_at
                              ? new Date(identity.last_used_at).toLocaleString()
                              : t('auth.api_tokens.never_used', 'Never used')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant='caption'
                            sx={{ color: identity.expires_at ? 'text.primary' : 'text.disabled' }}
                          >
                            {identity.expires_at
                              ? new Date(identity.expires_at).toLocaleDateString()
                              : t('auth.admin.machineIdentity.permanent', 'Permanent')}
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Tooltip title={t('auth.admin.machineIdentity.revoke', 'Revoke key')}>
                            <IconButton
                              color='error'
                              aria-label={t('auth.admin.machineIdentity.revoke', 'Revoke key')}
                              onClick={() => setPendingRevoke(identity)}
                              sx={{ width: 44, height: 44 }}
                            >
                              <Delete fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </AdminDataState>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth='sm'>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {createdKey
            ? t('auth.admin.machineIdentity.created_title', 'Copy this key now')
            : t('auth.admin.machineIdentity.provision_title', 'Provision a new API key')}
        </DialogTitle>
        <DialogContent>
          {!createdKey ? (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant='body2' color='text.secondary'>
                {t(
                  'auth.admin.machineIdentity.name_help',
                  'Name it after the service that will use it, so it can be identified later.',
                )}
              </Typography>
              <TextField
                fullWidth
                autoFocus
                label={t('auth.admin.machineIdentity.name_label', 'Key name')}
                placeholder={t('auth.admin.machineIdentity.name_placeholder', 'GitHub Actions CI')}
                value={newKeyName}
                onChange={(event) => setNewKeyName(event.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { minHeight: 48 } }}
              />
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant='body2' color='warning.main' sx={{ fontWeight: 700 }}>
                {t(
                  'auth.admin.machineIdentity.copy_warning',
                  'This key is shown once and never again. Store it in a secret manager before closing this dialog.',
                )}
              </Typography>
              {/*
                Was a hand-rolled box on `grey.900` — a fixed dark surface that
                ignores the tenant theme — with a bare clipboard write that gave
                no feedback when the browser denied access.
              */}
              <AuthCopyField
                value={createdKey}
                label={t('auth.admin.machineIdentity.key_label', 'API key')}
                copyLabel={t('auth.admin.machineIdentity.copy_key', 'Copy API key')}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          {!createdKey ? (
            <>
              <Button onClick={handleCloseDialog} sx={{ minHeight: 44, textTransform: 'none' }}>
                {t('auth.common.cancel', 'Cancel')}
              </Button>
              <Button
                variant='contained'
                onClick={handleCreateKey}
                disabled={!newKeyName.trim() || createKeyMutation.isPending}
                startIcon={
                  createKeyMutation.isPending ? (
                    <CircularProgress size={18} color='inherit' />
                  ) : undefined
                }
                sx={{ minHeight: 44, textTransform: 'none', fontWeight: 700 }}
              >
                {t('auth.admin.machineIdentity.generate', 'Generate key')}
              </Button>
            </>
          ) : (
            <Button
              variant='contained'
              onClick={handleCloseDialog}
              sx={{ minHeight: 44, textTransform: 'none', fontWeight: 700 }}
            >
              {t('auth.admin.machineIdentity.done', 'I have copied it')}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/*
        Revoking used `window.confirm`, which is unstyled, untranslatable and
        blocks the main thread.
      */}
      <AuthConfirmDrawer
        id='revoke-api-key'
        open={Boolean(pendingRevoke)}
        onClose={() => setPendingRevoke(null)}
        onConfirm={handleRevokeConfirmed}
        loading={revokeKeyMutation.isPending}
        tone='error'
        title={t('auth.admin.machineIdentity.revoke_title', 'Revoke this API key?')}
        description={t('auth.admin.machineIdentity.revoke_body', {
          name: pendingRevoke?.name ?? '',
          defaultValue:
            'Anything authenticating as "{{name}}" will stop working immediately. This cannot be undone.',
        })}
        confirmLabel={t('auth.common.revokePermanently', 'Revoke permanently')}
      />
    </Box>
  )
}

export default MachineIdentityManagement
