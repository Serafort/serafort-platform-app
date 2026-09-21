import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Switch,
  FormControlLabel,
  Divider,
  Skeleton,
} from '@mui/material'
import WebhookIcon from '@mui/icons-material/Webhook'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import SendIcon from '@mui/icons-material/Send'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'
import {
  useWebhooksQuery,
  useWebhookEventTypesQuery,
  useCreateWebhookMutation,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
  useTestWebhookMutation,
} from '../hooks/useDeveloperConsoleQuery'
import type { WebhookItem, WebhookTestResult } from '@cap/auth-contracts'
import { ConfirmDeleteModal } from '../../authentication-core/components/shared'
import { MONO_FONT } from '../../authorization-engine/components/tokens'
import {
  AdminDataState,
  AdminTableCard,
  AdminTableHead,
  AdminTableHeadCell,
  AdminTableRow,
  AdminPageHeader,
  AdminStatusBadge,
  AdminRowActionButton,
} from '../../authentication-core/components/shared/admin'

/**
 * Fallback catalogue, used only until `GET /api/admin/webhooks/event-types`
 * answers (or if it fails). The server owns the authoritative list — this copy
 * exists so the picker is never blank, not as a second source of truth.
 */
export const WEBHOOK_EVENT_CATEGORIES: Record<string, string[]> = {
  authentication: [
    'auth.login',
    'auth.logout',
    'auth.failed',
    'auth.mfa_challenged',
    'auth.password_reset',
  ],
  user_lifecycle: [
    'user.created',
    'user.updated',
    'user.deleted',
    'user.banned',
    'user.locked',
    'user.unlocked',
  ],
  authorization_rbac: ['role.assigned', 'role.revoked', 'policy.created', 'policy.updated'],
  security_ssf: ['security.anomaly', 'threat.detected', 'ssf.caep_event', 'session.revoked'],
  audit: ['audit.checkpoint', 'audit.export_completed'],
}

const CATEGORY_LABEL_KEYS: Record<string, string> = {
  authentication: 'auth.developer_console.webhooks.category_authentication',
  user_lifecycle: 'auth.developer_console.webhooks.category_user_lifecycle',
  authorization_rbac: 'auth.developer_console.webhooks.category_authorization_rbac',
  security_ssf: 'auth.developer_console.webhooks.category_security_ssf',
  audit: 'auth.developer_console.webhooks.category_audit',
}

const CATEGORY_LABEL_DEFAULTS: Record<string, string> = {
  authentication: 'Authentication',
  user_lifecycle: 'User Lifecycle',
  authorization_rbac: 'Authorization & RBAC',
  security_ssf: 'Security & SSF',
  audit: 'Audit & Compliance',
}

/** Turn an unrecognised category key from the server into a readable heading. */
const humanizeCategory = (key: string) =>
  key
    .split(/[_.-]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

/**
 * The endpoint must be an absolute http(s) URL. The server enforces this too
 * (and additionally refuses plaintext and internal addresses in production);
 * checking here just spares the round trip.
 */
const validateEndpointUrl = (value: string): 'empty' | 'invalid' | null => {
  const trimmed = value.trim()
  if (!trimmed) return 'empty'
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? null : 'invalid'
  } catch {
    return 'invalid'
  }
}

export const WebhooksScreen: React.FC = () => {
  const { t } = useTranslation('auth')
  // TanStack Query hooks
  const { data: webhooks = [], isLoading, isError, refetch } = useWebhooksQuery()
  const { data: serverCategories } = useWebhookEventTypesQuery()
  const createMutation = useCreateWebhookMutation()
  const updateMutation = useUpdateWebhookMutation()
  const deleteMutation = useDeleteWebhookMutation()
  const testMutation = useTestWebhookMutation()

  // Create / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [url, setUrl] = useState('')
  const [urlTouched, setUrlTouched] = useState(false)
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)

  // Prefer the server's catalogue; fall back to the bundled copy until it loads.
  const categories =
    serverCategories && Object.keys(serverCategories).length > 0
      ? serverCategories
      : WEBHOOK_EVENT_CATEGORIES

  const catalogEvents = React.useMemo(
    () => new Set(Object.values(categories).flat()),
    [categories],
  )

  /**
   * Events this subscription already carries that the catalogue does not list.
   * They are surfaced as their own group so that opening and saving such a
   * webhook preserves them instead of quietly unsubscribing it.
   */
  const customEvents = selectedEvents.filter((event) => !catalogEvents.has(event))

  // One-time Secret Reveal Modal (shown after creation)
  const [secretRevealOpen, setSecretRevealOpen] = useState(false)
  const [createdWebhookSecret, setCreatedWebhookSecret] = useState('')
  const [createdWebhookUrl, setCreatedWebhookUrl] = useState('')
  const [secretCopied, setSecretCopied] = useState(false)

  // Test Ping Modal state
  const [testResult, setTestResult] = useState<{
    open: boolean
    loading: boolean
    result?: WebhookTestResult
    error?: string
  }>({ open: false, loading: false })

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; url: string } | null>(null)

  // -----------------------------------------------------------------------
  // Form Handlers
  // -----------------------------------------------------------------------

  const handleOpenCreate = () => {
    setEditingId(null)
    setUrl('')
    setUrlTouched(false)
    setSelectedEvents(['auth.login', 'user.created'])
    setIsActive(true)
    createMutation.reset()
    updateMutation.reset()
    setModalOpen(true)
  }

  const handleOpenEdit = (wh: WebhookItem) => {
    setEditingId(wh.id)
    setUrl(wh.url)
    setUrlTouched(false)
    setSelectedEvents(Array.isArray(wh.eventTypes) ? wh.eventTypes : [])
    // A row auto-disabled by the retry budget reports isActive === false; the
    // toggle shows that truthfully, and turning it back on clears the failures.
    setIsActive(wh.isActive ?? true)
    createMutation.reset()
    updateMutation.reset()
    setModalOpen(true)
  }

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    )
  }

  const applyPreset = (type: 'all' | 'auth' | 'security' | 'clear') => {
    if (type === 'all') {
      // Keep any custom events already on the record — "All Events" should add,
      // not silently drop what the catalogue does not happen to list.
      setSelectedEvents(
        Array.from(new Set([...Object.values(categories).flat(), ...customEvents])),
      )
    } else if (type === 'auth') {
      setSelectedEvents(categories.authentication ?? [])
    } else if (type === 'security') {
      setSelectedEvents(categories.security_ssf ?? [])
    } else if (type === 'clear') {
      setSelectedEvents([])
    }
  }

  const urlError = validateEndpointUrl(url)
  const canSave = !urlError && selectedEvents.length > 0

  const handleSave = async () => {
    if (!canSave) {
      setUrlTouched(true)
      return
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          data: {
            url: url.trim(),
            eventTypes: selectedEvents,
            isActive,
          },
        })
      } else {
        const result = await createMutation.mutateAsync({
          url: url.trim(),
          eventTypes: selectedEvents,
          isActive,
        })

        // Show one-time signing secret reveal if the backend returned a secret
        if (result?.secret) {
          setCreatedWebhookSecret(result.secret)
          setCreatedWebhookUrl(url.trim())
          setSecretRevealOpen(true)
        }
      }
      setModalOpen(false)
    } catch {
      // Error is handled by mutation state
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
    } catch {
      // Error is handled by mutation state
    } finally {
      setDeleteTarget(null)
    }
  }

  /**
   * Dispatch a real signed POST to the endpoint. The request resolves whether
   * or not the endpoint answered — `result.ok` carries the delivery outcome —
   * so the catch here covers only a failure to reach *our own* API.
   */
  const handleSendTestPing = async (id: string) => {
    setTestResult({ open: true, loading: true })
    try {
      const result = await testMutation.mutateAsync(id)
      setTestResult({ open: true, loading: false, result })
    } catch (err: unknown) {
      setTestResult({
        open: true,
        loading: false,
        error:
          err instanceof Error
            ? err.message
            : t('auth.developer_console.webhooks.test_request_failed', 'Ping request failed'),
      })
    }
  }

  const handleCloseSecretReveal = () => {
    setSecretRevealOpen(false)
    setCreatedWebhookSecret('')
    setCreatedWebhookUrl('')
  }

  const handleCopySecret = () => {
    navigator.clipboard.writeText(createdWebhookSecret)
    setSecretCopied(true)
    setTimeout(() => setSecretCopied(false), 2500)
  }

  const handleDownloadSecret = () => {
    const content = [
      `CAP Webhook Signing Secret`,
      `===========================`,
      `Endpoint: ${createdWebhookUrl}`,
      `Secret:   ${createdWebhookSecret}`,
      ``,
      `Generated: ${new Date().toISOString()}`,
      ``,
      `⚠ WARNING: Store this secret securely. It cannot be retrieved again.`,
      `Use this secret to verify webhook payload signatures (HMAC-SHA256).`,
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const blobUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = blobUrl
    anchor.download = `webhook-secret-${createdWebhookUrl.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)}.txt`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    setTimeout(() => URL.revokeObjectURL(blobUrl), 0)
  }

  // -----------------------------------------------------------------------
  // Render helpers
  // -----------------------------------------------------------------------

  const isSaving = createMutation.isPending || updateMutation.isPending

  const renderTableSkeleton = () => (
    <AdminDataState asTableRow loading skeletonRows={3} skeletonColumns={6}>
      {null}
    </AdminDataState>
  )

  const renderEmptyState = () => (
    <AdminDataState
      asTableRow
      empty
      skeletonColumns={6}
      emptyIcon={<WebhookIcon sx={{ fontSize: 32 }} />}
      emptyTitle={t(
        'auth.developer_console.webhooks.empty_title',
        'No Webhook Endpoints configured.',
      )}
      emptyDescription={t(
        'auth.developer_console.webhooks.empty_desc',
        'Add an HTTPS webhook endpoint to receive real-time authentication and security signals.',
      )}
      emptyAction={
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{
            minHeight: 44,
            borderRadius: 'var(--sf-radius-md, 8px)',
            textTransform: 'none',
            fontWeight: 700,
          }}
        >
          {t('auth.developer_console.webhooks.add_first', 'Add Your First Webhook')}
        </Button>
      }
    >
      {null}
    </AdminDataState>
  )

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <AdminPageHeader
        icon={<WebhookIcon />}
        title={t('auth.developer_console.webhooks.title', 'Webhooks & Event Streams')}
        description={t(
          'auth.developer_console.webhooks.subtitle',
          'Subscribe your external infrastructure and SIEM systems to real-time Identity & Security events.',
        )}
        actions={
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{ minHeight: 44, borderRadius: 'var(--sf-radius-md, 8px)', textTransform: 'none', fontWeight: 700 }}
          >
            {t('auth.developer_console.webhooks.add_endpoint', 'Add Webhook Endpoint')}
          </Button>
        }
      />

      {/* Error Banner */}
      {isError && (
        <Alert
          severity='error'
          sx={{ mb: 3, borderRadius: 'var(--sf-radius-md, 10px)' }}
          action={
            <Button
              color='inherit'
              size='small'
              startIcon={<RefreshIcon />}
              onClick={() => refetch()}
              sx={{ minHeight: 44 }}
            >
              {t('auth.common.retry', 'Retry')}
            </Button>
          }
        >
          {t('auth.developer_console.webhooks.load_error', 'Failed to load webhooks.')}
        </Alert>
      )}

      {/* Mutation error feedback */}
      {createMutation.isError && (
        <Alert severity='error' sx={{ mb: 3, borderRadius: 'var(--sf-radius-md, 10px)' }} onClose={() => createMutation.reset()}>
          {createMutation.error instanceof Error
            ? createMutation.error.message
            : t('auth.developer_console.webhooks.create_error', 'Failed to create webhook.')}
        </Alert>
      )}
      {updateMutation.isError && (
        <Alert severity='error' sx={{ mb: 3, borderRadius: 'var(--sf-radius-md, 10px)' }} onClose={() => updateMutation.reset()}>
          {updateMutation.error instanceof Error
            ? updateMutation.error.message
            : t('auth.developer_console.webhooks.update_error', 'Failed to update webhook.')}
        </Alert>
      )}
      {deleteMutation.isError && (
        <Alert severity='error' sx={{ mb: 3, borderRadius: 'var(--sf-radius-md, 10px)' }} onClose={() => deleteMutation.reset()}>
          {deleteMutation.error instanceof Error
            ? deleteMutation.error.message
            : t('auth.developer_console.webhooks.delete_error', 'Failed to delete webhook.')}
        </Alert>
      )}

      <AdminTableCard>
        <Table>
          <AdminTableHead>
            <TableRow>
              <AdminTableHeadCell>
                {t('auth.developer_console.webhooks.col_url', 'Endpoint URL')}
              </AdminTableHeadCell>
              <AdminTableHeadCell>
                {t('auth.developer_console.webhooks.col_status', 'Status')}
              </AdminTableHeadCell>
              <AdminTableHeadCell>
                {t('auth.developer_console.webhooks.col_events', 'Subscribed Events')}
              </AdminTableHeadCell>
              <AdminTableHeadCell>
                {t('auth.developer_console.webhooks.col_failures', 'Failures')}
              </AdminTableHeadCell>
              <AdminTableHeadCell>
                {t('auth.developer_console.webhooks.col_last_triggered', 'Last Triggered')}
              </AdminTableHeadCell>
              <AdminTableHeadCell align='right'>
                {t('auth.common.actions', 'Actions')}
              </AdminTableHeadCell>
            </TableRow>
          </AdminTableHead>
          <TableBody>
            {isLoading
              ? renderTableSkeleton()
              : webhooks.length === 0
                ? renderEmptyState()
                : webhooks.map((wh: WebhookItem) => {
                    const events = Array.isArray(wh.eventTypes) ? wh.eventTypes : []
                    const isActiveStatus = wh.isActive ?? true
                    const failureCount = wh.failureCount ?? 0
                    const maxRetries = wh.maxRetries ?? 0
                    const lastTriggeredAt = wh.lastTriggeredAt
                    // Three distinct states: auto-disabled by the retry budget
                    // (disabledAt set), manually paused, or delivering.
                    const autoDisabled = !!wh.disabledAt
                    const statusLabel = autoDisabled
                      ? t('auth.developer_console.webhooks.status_disabled', 'Disabled')
                      : isActiveStatus
                        ? t('auth.developer_console.webhooks.status_active', 'Active')
                        : t('auth.developer_console.webhooks.status_paused', 'Paused')
                    const sendTestLabel = t(
                      'auth.developer_console.webhooks.send_test',
                      'Send Test Ping',
                    )
                    const editLabel = t('auth.developer_console.webhooks.edit', 'Edit Webhook')
                    const deleteLabel = t(
                      'auth.developer_console.webhooks.delete',
                      'Delete Webhook',
                    )
                    return (
                      <AdminTableRow
                        key={wh.id}
                        clickable
                        onClick={() => handleOpenEdit(wh)}
                        aria-label={editLabel}
                      >
                        <TableCell>
                          <Typography
                            variant='subtitle2'
                            fontWeight={600}
                            sx={{ fontFamily: MONO_FONT, fontSize: '0.8125rem', wordBreak: 'break-all' }}
                          >
                            {wh.url}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <AdminStatusBadge
                            tone={autoDisabled ? 'error' : isActiveStatus ? 'success' : 'neutral'}
                            label={statusLabel}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack
                            direction='row'
                            spacing={0.5}
                            flexWrap='wrap'
                            useFlexGap
                            sx={{ maxWidth: 350 }}
                          >
                            {events.slice(0, 3).map((event: string) => (
                              <Chip
                                key={event}
                                label={event}
                                size='small'
                                variant='outlined'
                                sx={{ borderRadius: 'var(--sf-radius-sm, 6px)', fontWeight: 700 }}
                              />
                            ))}
                            {events.length > 3 && (
                              <Chip
                                label={t(
                                  'auth.developer_console.webhooks.more_events',
                                  '+{{count}} more',
                                  {
                                    count: events.length - 3,
                                  },
                                )}
                                size='small'
                                variant='outlined'
                                sx={{ borderRadius: 'var(--sf-radius-sm, 6px)', fontWeight: 700 }}
                              />
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant='body2'
                            color={failureCount > 0 ? 'error.main' : 'text.secondary'}
                            fontWeight={failureCount > 0 ? 600 : 400}
                          >
                            {failureCount} / {maxRetries}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' color='text.secondary'>
                            {lastTriggeredAt
                              ? new Date(lastTriggeredAt).toLocaleString()
                              : t('auth.common.never', 'Never')}
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Stack direction='row' spacing={1} justifyContent='flex-end'>
                            <Tooltip title={sendTestLabel}>
                              <AdminRowActionButton
                                aria-label={sendTestLabel}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSendTestPing(wh.id)
                                }}
                              >
                                <SendIcon fontSize='small' />
                              </AdminRowActionButton>
                            </Tooltip>
                            <Tooltip title={deleteLabel}>
                              <AdminRowActionButton
                                color='error'
                                aria-label={deleteLabel}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeleteTarget({ id: wh.id, url: wh.url })
                                }}
                              >
                                <DeleteOutlineIcon fontSize='small' />
                              </AdminRowActionButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </AdminTableRow>
                    )
                  })}
          </TableBody>
        </Table>
      </AdminTableCard>

      {/* Create / Edit Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth='md'
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 'var(--sf-radius-lg, 16px)' } } }}
      >
        <DialogTitle fontWeight={600}>
          {editingId
            ? t('auth.developer_console.webhooks.edit_title', 'Edit Webhook Subscription')
            : t('auth.developer_console.webhooks.create_title', 'Add Webhook Subscription')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label={t('auth.developer_console.webhooks.url_label', 'HTTPS Endpoint URL')}
              fullWidth
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={() => setUrlTouched(true)}
              placeholder='https://api.yourdomain.com/webhooks/auth'
              error={urlTouched && urlError === 'invalid'}
              helperText={
                urlTouched && urlError === 'invalid'
                  ? t(
                      'auth.developer_console.webhooks.url_invalid',
                      'Enter an absolute URL beginning with https:// (or http:// in development).',
                    )
                  : t(
                      'auth.developer_console.webhooks.url_helper',
                      'Must be a valid HTTPS URL capable of receiving POST payloads.',
                    )
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  color='primary'
                />
              }
              label={t(
                'auth.developer_console.webhooks.enable_delivery',
                'Enable endpoint delivery',
              )}
            />

            <Divider />

            <Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1.5,
                }}
              >
                <Typography variant='subtitle2' fontWeight={600}>
                  {t(
                    'auth.developer_console.webhooks.subscribed_events_count',
                    'Subscribed Event Types ({{count}} selected)',
                    { count: selectedEvents.length },
                  )}
                </Typography>
                <Stack direction='row' spacing={1}>
                  <Button size='small' onClick={() => applyPreset('all')}>
                    {t('auth.developer_console.webhooks.preset_all', 'All Events')}
                  </Button>
                  <Button size='small' onClick={() => applyPreset('auth')}>
                    {t('auth.developer_console.webhooks.preset_auth', 'Auth Only')}
                  </Button>
                  <Button size='small' onClick={() => applyPreset('security')}>
                    {t('auth.developer_console.webhooks.preset_security', 'Security Only')}
                  </Button>
                  <Button size='small' color='secondary' onClick={() => applyPreset('clear')}>
                    {t('auth.common.clear', 'Clear')}
                  </Button>
                </Stack>
              </Box>

              <Stack spacing={2}>
                {Object.entries(categories).map(([category, events]) => (
                  <Box key={category} sx={{ p: 1.5, borderRadius: 'var(--sf-radius-md, 8px)', bgcolor: 'action.hover' }}>
                    <Typography
                      variant='caption'
                      fontWeight={700}
                      color='text.secondary'
                      sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}
                    >
                      {CATEGORY_LABEL_KEYS[category]
                        ? t(CATEGORY_LABEL_KEYS[category], CATEGORY_LABEL_DEFAULTS[category])
                        : humanizeCategory(category)}
                    </Typography>
                    <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                      {events.map((event) => {
                        const isSelected = selectedEvents.includes(event)
                        return (
                          <Chip
                            key={event}
                            label={event}
                            size='small'
                            onClick={() => toggleEvent(event)}
                            color={isSelected ? 'primary' : 'default'}
                            variant={isSelected ? 'filled' : 'outlined'}
                            sx={{ cursor: 'pointer', borderRadius: 'var(--sf-radius-sm, 6px)', fontWeight: 600 }}
                          />
                        )
                      })}
                    </Stack>
                  </Box>
                ))}

                {/* Events already on this subscription that the catalogue does
                    not list. Rendering them keeps a save from unsubscribing the
                    endpoint from events the picker simply could not show. */}
                {customEvents.length > 0 && (
                  <Box sx={{ p: 1.5, borderRadius: 'var(--sf-radius-md, 8px)', bgcolor: 'action.hover' }}>
                    <Typography
                      variant='caption'
                      fontWeight={700}
                      color='text.secondary'
                      sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}
                    >
                      {t('auth.developer_console.webhooks.category_custom', 'Other Subscribed Events')}
                    </Typography>
                    <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                      {customEvents.map((event) => (
                        <Chip
                          key={event}
                          label={event}
                          size='small'
                          onClick={() => toggleEvent(event)}
                          color='primary'
                          variant='filled'
                          sx={{ cursor: 'pointer', borderRadius: 'var(--sf-radius-sm, 6px)', fontWeight: 600 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setModalOpen(false)}
            sx={{ minHeight: 44, borderRadius: 'var(--sf-radius-md, 8px)', textTransform: 'none' }}
          >
            {t('auth.common.cancel', 'Cancel')}
          </Button>
          <Button
            variant='contained'
            onClick={handleSave}
            disabled={!canSave || isSaving}
            sx={{ minHeight: 44, borderRadius: 'var(--sf-radius-md, 8px)', textTransform: 'none', fontWeight: 700 }}
          >
            {isSaving
              ? t('auth.developer_console.webhooks.saving', 'Saving...')
              : editingId
                ? t('auth.developer_console.webhooks.update', 'Update Webhook')
                : t('auth.developer_console.webhooks.create', 'Create Webhook')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* One-Time Signing Secret Reveal Modal */}
      <Dialog
        open={secretRevealOpen}
        onClose={handleCloseSecretReveal}
        maxWidth='sm'
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 'var(--sf-radius-lg, 16px)' } } }}
      >
        <DialogTitle fontWeight={700} sx={{ color: 'warning.main' }}>
          {t(
            'auth.developer_console.webhooks.secret_reveal_title',
            'Save Your Webhook Signing Secret',
          )}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Alert severity='warning' sx={{ borderRadius: 'var(--sf-radius-md, 10px)' }}>
              {t(
                'auth.developer_console.webhooks.secret_reveal_warning',
                'Copy or download your signing secret now. For security purposes, it will never be shown again. Use this secret to verify webhook payload signatures (HMAC-SHA256).',
              )}
            </Alert>
            <Paper
              variant='outlined'
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'background.default',
                fontFamily: MONO_FONT,
                wordBreak: 'break-all',
                borderRadius: 'var(--sf-radius-md, 8px)',
              }}
            >
              <Typography variant='body2' sx={{ fontFamily: MONO_FONT, fontWeight: 600 }}>
                {createdWebhookSecret}
              </Typography>
              <Stack direction='row' spacing={0.5} sx={{ ml: 1, flexShrink: 0 }}>
                <Tooltip
                  title={
                    secretCopied
                      ? t('auth.common.copied', 'Copied!')
                      : t('auth.common.copy_to_clipboard', 'Copy to Clipboard')
                  }
                >
                  <IconButton
                    onClick={handleCopySecret}
                    color={secretCopied ? 'success' : 'primary'}
                    sx={{ width: 44, height: 44 }}
                    aria-label={t('auth.common.copy_to_clipboard', 'Copy to Clipboard')}
                  >
                    {secretCopied ? <CheckCircleOutlineIcon /> : <ContentCopyIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('auth.common.download_as_txt', 'Download as .txt file')}>
                  <IconButton
                    onClick={handleDownloadSecret}
                    color='primary'
                    sx={{ width: 44, height: 44 }}
                    aria-label={t('auth.common.download_as_txt', 'Download as .txt file')}
                  >
                    <DownloadOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            variant='contained'
            onClick={handleCloseSecretReveal}
            sx={{ minHeight: 44, borderRadius: 'var(--sf-radius-md, 8px)', textTransform: 'none', fontWeight: 700 }}
          >
            {t(
              'auth.developer_console.webhooks.secret_reveal_confirm',
              'I have saved my secret securely',
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Ping Result Dialog */}
      <Dialog
        open={testResult.open}
        onClose={() => setTestResult({ open: false, loading: false })}
        maxWidth='sm'
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 'var(--sf-radius-lg, 16px)' } } }}
      >
        <DialogTitle fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SendIcon color='primary' />{' '}
          {t('auth.developer_console.webhooks.test_ping_title', 'Webhook Test Ping')}
        </DialogTitle>
        <DialogContent>
          {testResult.loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Skeleton variant='circular' width={40} height={40} sx={{ mx: 'auto', mb: 2 }} />
              <Typography variant='body2' color='text.secondary'>
                {t(
                  'auth.developer_console.webhooks.test_ping_dispatching',
                  'Dispatching test ping event...',
                )}
              </Typography>
            </Box>
          ) : testResult.result ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Alert
                severity={testResult.result.ok ? 'success' : 'error'}
                icon={testResult.result.ok ? <CheckCircleIcon /> : <ErrorOutlineIcon />}
                sx={{ borderRadius: 'var(--sf-radius-md, 10px)' }}
              >
                {testResult.result.message}
              </Alert>

              {/* What the transport actually did — the only way an admin can
                  tell a 404 from a TLS failure from a timeout. */}
              <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                {testResult.result.statusCode !== null && (
                  <Chip
                    size='small'
                    color={testResult.result.ok ? 'success' : 'error'}
                    variant='outlined'
                    label={t(
                      'auth.developer_console.webhooks.test_ping_status',
                      'HTTP {{code}} {{text}}',
                      {
                        code: testResult.result.statusCode,
                        text: testResult.result.statusText ?? '',
                      },
                    )}
                    sx={{ borderRadius: 'var(--sf-radius-sm, 6px)', fontWeight: 700 }}
                  />
                )}
                <Chip
                  size='small'
                  variant='outlined'
                  label={t(
                    'auth.developer_console.webhooks.test_ping_duration',
                    'Took {{ms}} ms',
                    { ms: testResult.result.durationMs },
                  )}
                  sx={{ borderRadius: 'var(--sf-radius-sm, 6px)', fontWeight: 700 }}
                />
                <Chip
                  size='small'
                  variant='outlined'
                  label={testResult.result.webhookUrl}
                  sx={{
                    borderRadius: 'var(--sf-radius-sm, 6px)',
                    fontFamily: MONO_FONT,
                    maxWidth: '100%',
                  }}
                />
              </Stack>

              <Paper variant='outlined' sx={{ p: 2, bgcolor: 'background.default', borderRadius: 'var(--sf-radius-md, 8px)' }}>
                <Typography
                  variant='caption'
                  fontWeight={700}
                  color='text.secondary'
                  sx={{ mb: 1, display: 'block' }}
                >
                  {t('auth.developer_console.webhooks.test_ping_payload', 'Dispatched Payload')}
                </Typography>
                <pre
                  style={{
                    margin: 0,
                    fontSize: '0.8rem',
                    fontFamily: MONO_FONT,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  {JSON.stringify(testResult.result.payload, null, 2)}
                </pre>
              </Paper>

              <Paper variant='outlined' sx={{ p: 2, bgcolor: 'background.default', borderRadius: 'var(--sf-radius-md, 8px)' }}>
                <Typography
                  variant='caption'
                  fontWeight={700}
                  color='text.secondary'
                  sx={{ mb: 1, display: 'block' }}
                >
                  {t(
                    'auth.developer_console.webhooks.test_ping_request_headers',
                    'Signed Request Headers',
                  )}
                </Typography>
                <pre
                  style={{
                    margin: 0,
                    fontSize: '0.8rem',
                    fontFamily: MONO_FONT,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  {Object.entries(testResult.result.requestHeaders ?? {})
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n')}
                </pre>
              </Paper>

              {testResult.result.responseBody ? (
                <Paper variant='outlined' sx={{ p: 2, bgcolor: 'background.default', borderRadius: 'var(--sf-radius-md, 8px)' }}>
                  <Typography
                    variant='caption'
                    fontWeight={700}
                    color='text.secondary'
                    sx={{ mb: 1, display: 'block' }}
                  >
                    {t(
                      'auth.developer_console.webhooks.test_ping_response',
                      'Endpoint Response',
                    )}
                  </Typography>
                  <pre
                    style={{
                      margin: 0,
                      fontSize: '0.8rem',
                      fontFamily: MONO_FONT,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                    }}
                  >
                    {testResult.result.responseBody}
                  </pre>
                </Paper>
              ) : null}
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Alert severity='error' icon={<ErrorOutlineIcon />} sx={{ borderRadius: 'var(--sf-radius-md, 10px)' }}>
                {t(
                  'auth.developer_console.webhooks.test_ping_failed',
                  'Test ping failed: {{error}}',
                  {
                    error: testResult.error || t('auth.common.unknown_error', 'Unknown error'),
                  },
                )}
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            variant='contained'
            onClick={() => setTestResult({ open: false, loading: false })}
            sx={{ minHeight: 44, borderRadius: 'var(--sf-radius-md, 8px)', textTransform: 'none', fontWeight: 700 }}
          >
            {t('auth.common.close', 'Close')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={t('auth.developer_console.webhooks.delete_title', 'Delete Webhook Endpoint')}
        message={t(
          'auth.developer_console.webhooks.delete_message',
          'Are you sure you want to delete the webhook endpoint "{{url}}"? All event subscriptions will be removed and delivery to this URL will stop immediately.',
          { url: deleteTarget?.url },
        )}
        confirmLabel={t('auth.developer_console.webhooks.delete_confirm', 'Delete Webhook')}
        isSubmitting={deleteMutation.isPending}
      />
    </Box>
  )
}

export default WebhooksScreen
