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
  MenuItem,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Skeleton,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import KeyIcon from '@mui/icons-material/VpnKey'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'
import {
  useApiKeysQuery,
  useCreateApiKeyMutation,
  useDeleteApiKeyMutation,
} from '../hooks/useDeveloperConsoleQuery'
import { ConfirmDeleteModal } from '../../authentication-core/components/shared'

export const DeveloperApiKeysScreen: React.FC = () => {
  // TanStack Query hooks
  const { data: keys = [], isLoading, isError, error, refetch } = useApiKeysQuery()
  const createMutation = useCreateApiKeyMutation()
  const deleteMutation = useDeleteApiKeyMutation()

  // Create Modal state
  const [createOpen, setCreateOpen] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [keyDescription, setKeyDescription] = useState('')
  const [expiresIn, setExpiresIn] = useState('90')

  // Reveal Key Modal state
  const [revealOpen, setRevealOpen] = useState(false)
  const [createdRawKey, setCreatedRawKey] = useState('')
  const [createdKeyName, setCreatedKeyName] = useState('')
  const [copied, setCopied] = useState(false)

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null)

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const handleCreate = async () => {
    if (!keyName.trim()) return

    let expiresAt: string | null = null
    if (expiresIn !== 'never') {
      const days = Number(expiresIn)
      const d = new Date()
      d.setDate(d.getDate() + days)
      expiresAt = d.toISOString()
    }

    const displayName = keyDescription.trim()
      ? `${keyName.trim()} — ${keyDescription.trim()}`
      : keyName.trim()

    try {
      const result = await createMutation.mutateAsync({
        name: displayName,
        expiresAt,
      })

      if (result?.key) {
        setCreatedRawKey(result.key)
        setCreatedKeyName(displayName)
        setCreateOpen(false)
        setKeyName('')
        setKeyDescription('')
        setExpiresIn('90')
        setRevealOpen(true)
      }
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

  const handleCloseRevealModal = () => {
    // Scrub the raw secret from component state
    setRevealOpen(false)
    setCreatedRawKey('')
    setCreatedKeyName('')
  }

  const handleCopyKey = () => {
    navigator.clipboard.writeText(createdRawKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleDownloadKey = () => {
    const content = [
      `CAP Developer API Key`,
      `======================`,
      `Name: ${createdKeyName}`,
      `Key:  ${createdRawKey}`,
      ``,
      `Generated: ${new Date().toISOString()}`,
      ``,
      `⚠ WARNING: Store this key securely. It cannot be retrieved again.`,
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `api-key-${createdKeyName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // -----------------------------------------------------------------------
  // Render helpers
  // -----------------------------------------------------------------------

  const renderTableSkeleton = () => (
    <>
      {[1, 2, 3].map((i) => (
        <TableRow key={i}>
          <TableCell><Skeleton variant="text" width="60%" /></TableCell>
          <TableCell><Skeleton variant="text" width="40%" /></TableCell>
          <TableCell><Skeleton variant="rounded" width={80} height={24} /></TableCell>
          <TableCell><Skeleton variant="text" width="50%" /></TableCell>
          <TableCell align="right"><Skeleton variant="circular" width={28} height={28} /></TableCell>
        </TableRow>
      ))}
    </>
  )

  const renderEmptyState = () => (
    <TableRow>
      <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
        <KeyIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography variant="body1" fontWeight={600}>
          No API Keys found.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
          Generate your first API key to interact with the Identity platform programmatically.
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Generate Your First Key
        </Button>
      </TableCell>
    </TableRow>
  )

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <KeyIcon color="primary" fontSize="large" /> Developer API Keys
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage programmatic API credentials with custom expirations and granular access scopes.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Generate New Key
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
          {error instanceof Error ? error.message : 'Failed to load developer API keys.'}
        </Alert>
      )}

      {/* Mutation error feedback */}
      {createMutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => createMutation.reset()}>
          {createMutation.error instanceof Error ? createMutation.error.message : 'Failed to generate API key.'}
        </Alert>
      )}
      {deleteMutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => deleteMutation.reset()}>
          {deleteMutation.error instanceof Error ? deleteMutation.error.message : 'Failed to revoke API key.'}
        </Alert>
      )}

      <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Key Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Last Used</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Expires</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              renderTableSkeleton()
            ) : keys.length === 0 ? (
              renderEmptyState()
            ) : (
              keys.map((key) => {
                const expiresAt = key.expiresAt || (key as any).expires_at
                const createdAt = key.createdAt || (key as any).created_at
                const lastUsedAt = (key as any).lastUsedAt || (key as any).last_used_at
                const isExpired = expiresAt && new Date(expiresAt) < new Date()
                const displayName = key.name || (key as any).title || `API Key #${key.id}`
                return (
                  <TableRow key={key.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {displayName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {lastUsedAt ? new Date(lastUsedAt).toLocaleDateString() : 'Never'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {expiresAt ? (
                        <Chip
                          label={isExpired ? 'Expired' : new Date(expiresAt).toLocaleDateString()}
                          size="small"
                          color={isExpired ? 'error' : 'default'}
                          variant="outlined"
                        />
                      ) : (
                        <Chip label="Never" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {createdAt ? new Date(createdAt).toLocaleDateString() : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Revoke API Key">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => setDeleteTarget({ id: key.id, name: displayName })}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Create Key Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={600}>Generate New API Key</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Key Name"
              fullWidth
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="e.g. CI/CD Deployment Pipeline, Zapier Sync"
              autoFocus
              required
            />
            <TextField
              label="Description (optional)"
              fullWidth
              value={keyDescription}
              onChange={(e) => setKeyDescription(e.target.value)}
              placeholder="What is this key used for?"
              multiline
              minRows={2}
              maxRows={4}
            />
            <TextField
              select
              label="Expiration"
              fullWidth
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
            >
              <MenuItem value="30">30 Days</MenuItem>
              <MenuItem value="90">90 Days (Recommended)</MenuItem>
              <MenuItem value="180">180 Days</MenuItem>
              <MenuItem value="365">1 Year</MenuItem>
              <MenuItem value="never">Never (Not Recommended)</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!keyName.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? 'Generating...' : 'Generate Secret Key'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reveal Raw Key Modal — one-time display */}
      <Dialog open={revealOpen} onClose={handleCloseRevealModal} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700} sx={{ color: 'warning.main' }}>
          Save Your API Key
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Alert severity="warning">
              Please copy or download your API key now. For security purposes, it will <strong>never be shown again</strong>.
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
                {createdRawKey}
              </Typography>
              <Stack direction="row" spacing={0.5} sx={{ ml: 1, flexShrink: 0 }}>
                <Tooltip title={copied ? 'Copied!' : 'Copy to Clipboard'}>
                  <IconButton onClick={handleCopyKey} color={copied ? 'success' : 'primary'} size="small">
                    {copied ? <CheckCircleOutlineIcon /> : <ContentCopyIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download as .txt file">
                  <IconButton onClick={handleDownloadKey} color="primary" size="small">
                    <DownloadOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button variant="contained" onClick={handleCloseRevealModal}>
            I have saved my key securely
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Revoke API Key"
        message={`Are you sure you want to revoke "${deleteTarget?.name}"? This action is irreversible and any integrations using this key will immediately stop working.`}
        confirmLabel="Revoke Key Permanently"
        isSubmitting={deleteMutation.isPending}
      />
    </Box>
  )
}

export default DeveloperApiKeysScreen
