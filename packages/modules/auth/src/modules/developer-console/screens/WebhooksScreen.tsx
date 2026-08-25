import React, { useEffect, useState } from 'react'
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
  CircularProgress,
  Stack,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material'
import WebhookIcon from '@mui/icons-material/Webhook'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import SendIcon from '@mui/icons-material/Send'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { developerService, type WebhookItem } from '@cap/auth-contracts'

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
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Create / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [url, setUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Test Ping Modal state
  const [testResult, setTestResult] = useState<{ open: boolean; loading: boolean; payload?: unknown }>(
    { open: false, loading: false }
  )

  const loadWebhooks = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await developerService.listWebhooks()
      if (response?.data) {
        const rawWebhooks = Array.isArray(response.data)
          ? response.data
          : (response.data as any)?.webhooks || (response.data as any)?.items || (response.data as any)?.data || []
        setWebhooks(Array.isArray(rawWebhooks) ? rawWebhooks : [])
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load webhooks.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadWebhooks()
  }, [])

  const handleOpenCreate = () => {
    setEditingId(null)
    setUrl('')
    setSelectedEvents(['auth.login', 'user.created'])
    setIsActive(true)
    setModalOpen(true)
  }

  const handleOpenEdit = (wh: WebhookItem) => {
    setEditingId(wh.id)
    setUrl(wh.url)
    setSelectedEvents(wh.eventTypes || [])
    setIsActive(wh.isActive)
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
    setIsSubmitting(true)
    try {
      if (editingId) {
        await developerService.updateWebhook(editingId, {
          url: url.trim(),
          eventTypes: selectedEvents,
          isActive,
        })
        setSuccessMsg('Webhook endpoint updated successfully.')
      } else {
        await developerService.createWebhook({
          url: url.trim(),
          eventTypes: selectedEvents,
          isActive,
        })
        setSuccessMsg('Webhook endpoint created successfully.')
      }
      setModalOpen(false)
      loadWebhooks()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save webhook.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this webhook subscription?')) return
    try {
      await developerService.deleteWebhook(id)
      setWebhooks((prev) => prev.filter((w) => w.id !== id))
      setSuccessMsg('Webhook endpoint deleted.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete webhook.')
    }
  }

  const handleSendTestPing = async (id: number) => {
    setTestResult({ open: true, loading: true })
    try {
      const response = await developerService.testWebhook(id)
      setTestResult({ open: true, loading: false, payload: response.data })
    } catch (err: unknown) {
      setTestResult({
        open: true,
        loading: false,
        payload: { error: err instanceof Error ? err.message : 'Ping delivery failed' },
      })
    }
  }

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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      )}

      <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Endpoint URL</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Subscribed Events</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Signing Secret</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Loading webhooks...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : webhooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" fontWeight={500}>No Webhook Endpoints configured.</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Add an HTTPS webhook endpoint to receive real-time authentication and security signals.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              webhooks.map((wh) => (
                <TableRow key={wh.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                      {wh.url}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={wh.isActive ? 'Active' : 'Disabled'}
                      size="small"
                      color={wh.isActive ? 'success' : 'default'}
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const events = Array.isArray(wh.eventTypes) ? wh.eventTypes : ((wh as any).event_types || [])
                      return (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ maxWidth: 350 }}>
                          {events.slice(0, 3).map((event: string) => (
                            <Chip key={event} label={event} size="small" variant="outlined" />
                          ))}
                          {events.length > 3 && (
                            <Chip label={`+${events.length - 3} more`} size="small" variant="outlined" />
                          )}
                        </Stack>
                      )
                    })()}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: 'action.selected', px: 1, py: 0.5, borderRadius: 1 }}>
                      {wh.secret ? `${wh.secret.slice(0, 10)}...` : 'whsec_••••••••'}
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
                        <IconButton size="small" color="error" onClick={() => handleDelete(wh.id)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
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
            disabled={!url.trim() || selectedEvents.length === 0 || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : editingId ? 'Update Webhook' : 'Create Webhook'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Ping Result Dialog */}
      <Dialog open={testResult.open} onClose={() => setTestResult({ open: false, loading: false })} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SendIcon color="primary" /> Webhook Test Ping
        </DialogTitle>
        <DialogContent>
          {testResult.loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Dispatching test ping event...
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Alert severity="success" icon={<CheckCircleIcon />}>
                Test ping payload successfully created and scheduled for dispatch!
              </Alert>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Dispatched Payload
                </Typography>
                <pre style={{ margin: 0, fontSize: '0.8rem', fontFamily: 'monospace' }}>
                  {JSON.stringify(testResult.payload, null, 2)}
                </pre>
              </Paper>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button variant="contained" onClick={() => setTestResult({ open: false, loading: false })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default WebhooksScreen
