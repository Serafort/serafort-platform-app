import React, { useState } from 'react'
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
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
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'
import {
  useWebhooksQuery,
  useCreateWebhookMutation,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
  useTestWebhookMutation,
} from '../hooks/useDeveloperConsoleQuery'
import { ConfirmDeleteModal } from '../../authentication-core/components/shared'

export const WEBHOOK_EVENT_CATEGORIES = {
  Authentication: [
    'auth.login',
    'auth.logout',
    'auth.failed',
    'auth.mfa_challenged',
    'auth.password_reset',
  ],
  'User Lifecycle': [
    'user.created',
    'user.updated',
    'user.deleted',
    'user.banned',
    'user.unlocked',
  ],
  'Authorization & RBAC': [
    'role.assigned',
    'role.revoked',
    'policy.created',
    'policy.updated',
  ],
  'Security & SSF': [
    'security.anomaly',
    'threat.detected',
    'ssf.caep_event',
    'session.revoked',
  ],
}

export const WebhooksScreen: React.FC = () => {
  // TanStack Query hooks
  const { data: webhooks = [], isLoading, isError, error, refetch } = useWebhooksQuery()
  const createMutation = useCreateWebhookMutation()
  const updateMutation = useUpdateWebhookMutation()
  const deleteMutation = useDeleteWebhookMutation()
  const testMutation = useTestWebhookMutation()

  // Create / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [url, setUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)

  // One-time Secret Reveal Modal (shown after creation)
  const [secretRevealOpen, setSecretRevealOpen] = useState(false)
  const [createdWebhookSecret, setCreatedWebhookSecret] = useState('')
  const [createdWebhookUrl, setCreatedWebhookUrl] = useState('')
  const [secretCopied, setSecretCopied] = useState(false)

  // Test Ping Modal state
  const [testResult, setTestResult] = useState<{
    open: boolean
    loading: boolean
    success?: boolean
    payload?: unknown
    error?: string
  }>({ open: false, loading: false })

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; url: string } | null>(null)

  // -----------------------------------------------------------------------
  // Form Handlers
  // -----------------------------------------------------------------------

  const handleOpenCreate = () => {
    setEditingId(null)
    setUrl('')
    setSelectedEvents(['auth.login', 'user.created'])
    setIsActive(true)
    setModalOpen(true)
  }

  const handleOpenEdit = (wh: any) => {
    setEditingId(wh.id)
    setUrl(wh.url)
    setSelectedEvents(wh.eventTypes || (wh as any).event_types || [])
    setIsActive(wh.isActive ?? (wh as any).is_active ?? true)
    setModalOpen(true)
  }

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    )
  }

  const applyPreset = (type: 'all' | 'auth' | 'security' | 'clear') => {
    if (type === 'all') {
      const all = Object.values(WEBHOOK_EVENT_CATEGORIES).flat()
      setSelectedEvents(Array.from(new Set(all)))
    } else if (type === 'auth') {
      setSelectedEvents(WEBHOOK_EVENT_CATEGORIES.Authentication)
    } else if (type === 'security') {
      setSelectedEvents(WEBHOOK_EVENT_CATEGORIES['Security & SSF'])
    } else if (type === 'clear') {
      setSelectedEvents([])
    }
  }

  const handleSave = async () => {
    if (!url.trim() || selectedEvents.length === 0) return

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

  const handleSendTestPing = async (id: number) => {
    setTestResult({ open: true, loading: true })
    try {
      const result = await testMutation.mutateAsync(id)
      setTestResult({ open: true, loading: false, success: true, payload: result })
    } catch (err: unknown) {
      setTestResult({
        open: true,
        loading: false,
        success: false,
        error: err instanceof Error ? err.message : 'Ping delivery failed',
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
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = `webhook-secret-${createdWebhookUrl.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)}.txt`
    a.click()
    URL.revokeObjectURL(blobUrl)
  }

  // -----------------------------------------------------------------------
  // Render helpers
  // -----------------------------------------------------------------------

  const isSaving = createMutation.isPending || updateMutation.isPending

  const renderTableSkeleton = () => (
    <>
      {[1, 2, 3].map((i) => (
        <TableRow key={i}>
          <TableCell><Skeleton variant="text" width="70%" /></TableCell>
          <TableCell><Skeleton variant="rounded" width={60} height={24} /></TableCell>
          <TableCell><Skeleton variant="text" width="60%" /></TableCell>
          <TableCell><Skeleton variant="text" width="40%" /></TableCell>
          <TableCell><Skeleton variant="text" width="40%" /></TableCell>
          <TableCell align="right"><Skeleton variant="rounded" width={100} height={28} /></TableCell>
        </TableRow>
      ))}
    </>
  )

  const renderEmptyState = () => (
    <TableRow>
      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
        <WebhookIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography variant="body1" fontWeight={600}>
          No Webhook Endpoints configured.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
          Add an HTTPS webhook endpoint to receive real-time authentication and security signals.
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ borderRadius: 2 }}
        >
          Add Your First Webhook
        </Button>
      </TableCell>
    </TableRow>
  )

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WebhookIcon color="primary" fontSize="large" /> Webhooks & Event Streams
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Subscribe your external infrastructure and SIEM systems to real-time Identity & Security events.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ borderRadius: 2 }}
        >
          Add Webhook Endpoint
        </Button>
      </Box>

      {/* Error Banner */}
      {isError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          {error instanceof Error ? error.message : 'Failed to load webhooks.'}
        </Alert>
      )}

      {/* Mutation error feedback */}
      {createMutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => createMutation.reset()}>
          {createMutation.error instanceof Error ? createMutation.error.message : 'Failed to create webhook.'}
        </Alert>
      )}
      {updateMutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => updateMutation.reset()}>
          {updateMutation.error instanceof Error ? updateMutation.error.message : 'Failed to update webhook.'}
        </Alert>
      )}
      {deleteMutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => deleteMutation.reset()}>
          {deleteMutation.error instanceof Error ? deleteMutation.error.message : 'Failed to delete webhook.'}
        </Alert>
      )}

      <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Endpoint URL</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Subscribed Events</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Failures</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Last Triggered</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              renderTableSkeleton()
            ) : webhooks.length === 0 ? (
              renderEmptyState()
            ) : (
              webhooks.map((wh: any) => {
                const events = Array.isArray(wh.eventTypes) ? wh.eventTypes : (wh.event_types || [])
                const isActiveStatus = wh.isActive ?? wh.is_active ?? true
                const isDisabled = wh.isDisabled ?? false
                const failureCount = wh.failureCount ?? wh.failure_count ?? 0
                const maxRetries = wh.maxRetries ?? wh.max_retries ?? 0
                const lastTriggeredAt = wh.lastTriggeredAt ?? wh.last_triggered_at
                return (
                  <TableRow key={wh.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                        {wh.url}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={isDisabled ? 'Disabled' : isActiveStatus ? 'Active' : 'Paused'}
                        size="small"
                        color={isDisabled ? 'error' : isActiveStatus ? 'success' : 'default'}
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ maxWidth: 350 }}>
                        {events.slice(0, 3).map((event: string) => (
                          <Chip key={event} label={event} size="small" variant="outlined" />
                        ))}
                        {events.length > 3 && (
                          <Chip label={`+${events.length - 3} more`} size="small" variant="outlined" />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={failureCount > 0 ? 'error.main' : 'text.secondary'}
                        fontWeight={failureCount > 0 ? 600 : 400}
                      >
                        {failureCount} / {maxRetries}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {lastTriggeredAt ? new Date(lastTriggeredAt).toLocaleString() : 'Never'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="Send Test Ping">
                          <IconButton size="small" color="primary" onClick={() => handleSendTestPing(wh.id)}>
                            <SendIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Webhook">
                          <IconButton size="small" onClick={() => handleOpenEdit(wh)}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Webhook">
                          <IconButton size="small" color="error" onClick={() => setDeleteTarget({ id: wh.id, url: wh.url })}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={600}>
          {editingId ? 'Edit Webhook Subscription' : 'Add Webhook Subscription'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="HTTPS Endpoint URL"
              fullWidth
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.yourdomain.com/webhooks/auth"
              helperText="Must be a valid HTTPS URL capable of receiving POST payloads."
            />

            <FormControlLabel
              control={
                <Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} color="primary" />
              }
              label="Enable endpoint delivery"
            />

            <Divider />

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Subscribed Event Types ({selectedEvents.length} selected)
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => applyPreset('all')}>All Events</Button>
                  <Button size="small" onClick={() => applyPreset('auth')}>Auth Only</Button>
                  <Button size="small" onClick={() => applyPreset('security')}>Security Only</Button>
                  <Button size="small" color="secondary" onClick={() => applyPreset('clear')}>Clear</Button>
                </Stack>
              </Box>

              <Stack spacing={2}>
                {Object.entries(WEBHOOK_EVENT_CATEGORIES).map(([category, events]) => (
                  <Box key={category} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'action.hover' }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
                      {category}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {events.map((event) => {
                        const isSelected = selectedEvents.includes(event)
                        return (
                          <Chip
                            key={event}
                            label={event}
                            size="small"
                            onClick={() => toggleEvent(event)}
                            color={isSelected ? 'primary' : 'default'}
                            variant={isSelected ? 'filled' : 'outlined'}
                            sx={{ cursor: 'pointer' }}
                          />
                        )
                      })}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!url.trim() || selectedEvents.length === 0 || isSaving}
          >
            {isSaving ? 'Saving...' : editingId ? 'Update Webhook' : 'Create Webhook'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* One-Time Signing Secret Reveal Modal */}
      <Dialog open={secretRevealOpen} onClose={handleCloseSecretReveal} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700} sx={{ color: 'warning.main' }}>
          Save Your Webhook Signing Secret
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Alert severity="warning">
              Copy or download your signing secret now. For security purposes, it will <strong>never be shown again</strong>.
              Use this secret to verify webhook payload signatures (HMAC-SHA256).
            </Alert>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'background.default',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
              }}
            >
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                {createdWebhookSecret}
              </Typography>
              <Stack direction="row" spacing={0.5} sx={{ ml: 1, flexShrink: 0 }}>
                <Tooltip title={secretCopied ? 'Copied!' : 'Copy to Clipboard'}>
                  <IconButton onClick={handleCopySecret} color={secretCopied ? 'success' : 'primary'} size="small">
                    {secretCopied ? <CheckCircleOutlineIcon /> : <ContentCopyIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download as .txt file">
                  <IconButton onClick={handleDownloadSecret} color="primary" size="small">
                    <DownloadOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button variant="contained" onClick={handleCloseSecretReveal}>
            I have saved my secret securely
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Ping Result Dialog */}
      <Dialog
        open={testResult.open}
        onClose={() => setTestResult({ open: false, loading: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SendIcon color="primary" /> Webhook Test Ping
        </DialogTitle>
        <DialogContent>
          {testResult.loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mx: 'auto', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Dispatching test ping event...
              </Typography>
            </Box>
          ) : testResult.success ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Alert severity="success" icon={<CheckCircleIcon />}>
                Test ping payload successfully created and scheduled for dispatch!
              </Alert>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Dispatched Payload
                </Typography>
                <pre style={{ margin: 0, fontSize: '0.8rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {JSON.stringify(testResult.payload, null, 2)}
                </pre>
              </Paper>
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Alert severity="error" icon={<ErrorOutlineIcon />}>
                Test ping failed: {testResult.error || 'Unknown error'}
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button variant="contained" onClick={() => setTestResult({ open: false, loading: false })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Webhook Endpoint"
        message={`Are you sure you want to delete the webhook endpoint "${deleteTarget?.url}"? All event subscriptions will be removed and delivery to this URL will stop immediately.`}
        confirmLabel="Delete Webhook"
        isSubmitting={deleteMutation.isPending}
      />
    </Box>
  )
}

export default WebhooksScreen
