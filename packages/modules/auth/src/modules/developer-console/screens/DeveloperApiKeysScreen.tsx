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
  const { t } = useTranslation('auth')
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
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `api-key-${createdKeyName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40)}.txt`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  // -----------------------------------------------------------------------
  // Render helpers
  // -----------------------------------------------------------------------

  const renderTableSkeleton = () => (
    <>
      {[1, 2, 3].map((i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton variant='text' width='60%' />
          </TableCell>
          <TableCell>
            <Skeleton variant='text' width='40%' />
          </TableCell>
          <TableCell>
            <Skeleton variant='rounded' width={80} height={24} />
          </TableCell>
          <TableCell>
            <Skeleton variant='text' width='50%' />
          </TableCell>
          <TableCell align='right'>
            <Skeleton variant='circular' width={28} height={28} />
          </TableCell>
        </TableRow>
      ))}
    </>
  )

  const renderEmptyState = () => (
    <TableRow>
      <TableCell colSpan={5} align='center' sx={{ py: 8 }}>
        <KeyIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
        <Typography variant='body1' fontWeight={600}>
          {t('auth.developer_console.api_keys.empty_title', 'No API Keys found.')}
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5, mb: 2 }}>
          {t(
            'auth.developer_console.api_keys.empty_desc',
            'Generate your first API key to interact with the Identity platform programmatically.',
          )}
        </Typography>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{ minHeight: 44, borderRadius: 'var(--sf-radius-md, 8px)', textTransform: 'none', fontWeight: 700 }}
        >
          {t('auth.developer_console.api_keys.generate_first', 'Generate Your First Key')}
        </Button>
      </TableCell>
    </TableRow>
  )

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography
            variant='h4'
            component='h1'
            fontWeight={700}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <KeyIcon color='primary' fontSize='large' />{' '}
            {t('auth.developer_console.api_keys.title', 'Developer API Keys')}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {t(
              'auth.developer_console.api_keys.subtitle',
              'Manage programmatic API credentials with custom expirations and granular access scopes.',
            )}
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{ minHeight: 44, borderRadius: 'var(--sf-radius-md, 8px)', textTransform: 'none', fontWeight: 700 }}
        >
          {t('auth.developer_console.api_keys.generate_new', 'Generate New Key')}
        </Button>
      </Box>

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
          {error instanceof Error
            ? error.message
            : t('auth.developer_console.api_keys.load_error', 'Failed to load developer API keys.')}
        </Alert>
      )}

      {/* Mutation error feedback */}
      {createMutation.isError && (
        <Alert severity='error' sx={{ mb: 3, borderRadius: 'var(--sf-radius-md, 10px)' }} onClose={() => createMutation.reset()}>
          {createMutation.error instanceof Error
            ? createMutation.error.message
            : t('auth.developer_console.api_keys.create_error', 'Failed to generate API key.')}
        </Alert>
      )}
      {deleteMutation.isError && (
        <Alert severity='error' sx={{ mb: 3, borderRadius: 'var(--sf-radius-md, 10px)' }} onClose={() => deleteMutation.reset()}>
          {deleteMutation.error instanceof Error
            ? deleteMutation.error.message
            : t('auth.developer_console.api_keys.revoke_error', 'Failed to revoke API key.')}
        </Alert>
      )}

      <Paper
        sx={{ borderRadius: 'var(--sf-radius-lg, 16px)', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}
      >
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>
                {t('auth.developer_console.api_keys.col_name', 'Key Name')}
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                {t('auth.developer_console.api_keys.col_last_used', 'Last Used')}
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                {t('auth.developer_console.api_keys.col_expires', 'Expires')}
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                {t('auth.developer_console.api_keys.col_created', 'Created')}
              </TableCell>
              <TableCell align='right' sx={{ fontWeight: 600 }}>
                {t('auth.common.actions', 'Actions')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? renderTableSkeleton()
              : keys.length === 0
                ? renderEmptyState()
                : keys.map((key) => {
                    const expiresAt = key.expiresAt || (key as any).expires_at
                    const createdAt = key.createdAt || (key as any).created_at
                    const lastUsedAt = (key as any).lastUsedAt || (key as any).last_used_at
                    const isExpired = expiresAt && new Date(expiresAt) < new Date()
                    const displayName =
                      key.name ||
                      (key as any).title ||
                      t('auth.developer_console.api_keys.untitled', 'API Key #{{id}}', {
                        id: key.id,
                      })
                    const neverLabel = t('auth.common.never', 'Never')
                    return (
                      <TableRow key={key.id} hover>
                        <TableCell>
                          <Typography variant='subtitle2' fontWeight={600}>
                            {displayName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' color='text.secondary'>
                            {lastUsedAt ? new Date(lastUsedAt).toLocaleDateString() : neverLabel}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {expiresAt ? (
                            <Chip
                              label={
                                isExpired
                                  ? t('auth.developer_console.api_keys.expired', 'Expired')
                                  : new Date(expiresAt).toLocaleDateString()
                              }
                              size='small'
                              color={isExpired ? 'error' : 'default'}
                              variant='outlined'
                              sx={{ borderRadius: 'var(--sf-radius-sm, 6px)', fontWeight: 700 }}
                            />
                          ) : (
                            <Chip
                              label={neverLabel}
                              size='small'
                              variant='outlined'
                              sx={{ borderRadius: 'var(--sf-radius-sm, 6px)', fontWeight: 700 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' color='text.secondary'>
                            {createdAt ? new Date(createdAt).toLocaleDateString() : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Tooltip
                            title={t(
                              'auth.developer_console.api_keys.revoke_tooltip',
                              'Revoke API Key',
                            )}
                          >
                            <IconButton
                              color='error'
                              sx={{ width: 44, height: 44 }}
                              aria-label={t(
                                'auth.developer_console.api_keys.revoke_tooltip',
                                'Revoke API Key',
                              )}
                              onClick={() => setDeleteTarget({ id: key.id, name: displayName })}
                            >
                              <DeleteOutlineIcon fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  })}
          </TableBody>
        </Table>
      </Paper>

      {/* Create Key Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth='sm'
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 'var(--sf-radius-lg, 16px)' } } }}
      >
        <DialogTitle fontWeight={600}>
          {t('auth.developer_console.api_keys.create_title', 'Generate New API Key')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label={t('auth.developer_console.api_keys.name_label', 'Key Name')}
              fullWidth
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder={t(
                'auth.developer_console.api_keys.name_placeholder',
                'e.g. CI/CD Deployment Pipeline, Zapier Sync',
              )}
              autoFocus
              required
            />
            <TextField
              label={t(
                'auth.developer_console.api_keys.description_label',
                'Description (optional)',
              )}
              fullWidth
              value={keyDescription}
              onChange={(e) => setKeyDescription(e.target.value)}
              placeholder={t(
                'auth.developer_console.api_keys.description_placeholder',
                'What is this key used for?',
              )}
              multiline
              minRows={2}
              maxRows={4}
            />
            <TextField
              select
              label={t('auth.developer_console.api_keys.expiration_label', 'Expiration')}
              fullWidth
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
            >
              <MenuItem value='30'>
                {t('auth.developer_console.api_keys.exp_30d', '30 Days')}
              </MenuItem>
              <MenuItem value='90'>
                {t('auth.developer_console.api_keys.exp_90d', '90 Days (Recommended)')}
              </MenuItem>
              <MenuItem value='180'>
                {t('auth.developer_console.api_keys.exp_180d', '180 Days')}
              </MenuItem>
              <MenuItem value='365'>
                {t('auth.developer_console.api_keys.exp_1y', '1 Year')}
              </MenuItem>
              <MenuItem value='never'>
                {t('auth.developer_console.api_keys.exp_never', 'Never (Not Recommended)')}
              </MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setCreateOpen(false)}
            sx={{ minHeight: 44, borderRadius: 'var(--sf-radius-md, 8px)', textTransform: 'none' }}
          >
            {t('auth.common.cancel', 'Cancel')}
          </Button>
          <Button
            variant='contained'
            onClick={handleCreate}
            disabled={!keyName.trim() || createMutation.isPending}
            sx={{ minHeight: 44, borderRadius: 'var(--sf-radius-md, 8px)', textTransform: 'none', fontWeight: 700 }}
          >
            {createMutation.isPending
              ? t('auth.developer_console.api_keys.generating', 'Generating...')
              : t('auth.developer_console.api_keys.generate_secret', 'Generate Secret Key')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reveal Raw Key Modal — one-time display */}
      <Dialog
        open={revealOpen}
        onClose={handleCloseRevealModal}
        maxWidth='sm'
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 'var(--sf-radius-lg, 16px)' } } }}
      >
        <DialogTitle fontWeight={700} sx={{ color: 'warning.main' }}>
          {t('auth.developer_console.api_keys.reveal_title', 'Save Your API Key')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Alert severity='warning' sx={{ borderRadius: 'var(--sf-radius-md, 10px)' }}>
              {t(
                'auth.developer_console.api_keys.reveal_warning_prefix',
                'Please copy or download your API key now. For security purposes, it will',
              )}{' '}
              <strong>
                {t('auth.developer_console.api_keys.reveal_warning_bold', 'never be shown again')}
              </strong>
              .
            </Alert>
            <Paper
              variant='outlined'
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'background.default',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                borderRadius: 'var(--sf-radius-md, 8px)',
              }}
            >
              <Typography variant='body2' sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                {createdRawKey}
              </Typography>
              <Stack direction='row' spacing={0.5} sx={{ ml: 1, flexShrink: 0 }}>
                <Tooltip
                  title={
                    copied
                      ? t('auth.common.copied', 'Copied!')
                      : t('auth.common.copy_to_clipboard', 'Copy to Clipboard')
                  }
                >
                  <IconButton
                    onClick={handleCopyKey}
                    color={copied ? 'success' : 'primary'}
                    sx={{ width: 44, height: 44 }}
                    aria-label={t('auth.common.copy_to_clipboard', 'Copy to Clipboard')}
                  >
                    {copied ? <CheckCircleOutlineIcon /> : <ContentCopyIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('auth.common.download_as_txt', 'Download as .txt file')}>
                  <IconButton
                    onClick={handleDownloadKey}
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
            onClick={handleCloseRevealModal}
            sx={{ minHeight: 44, borderRadius: 'var(--sf-radius-md, 8px)', textTransform: 'none', fontWeight: 700 }}
          >
            {t('auth.developer_console.api_keys.reveal_confirm', 'I have saved my key securely')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={t('auth.developer_console.api_keys.revoke_title', 'Revoke API Key')}
        message={t(
          'auth.developer_console.api_keys.revoke_message',
          'Are you sure you want to revoke "{{name}}"? This action is irreversible and any integrations using this key will immediately stop working.',
          { name: deleteTarget?.name },
        )}
        confirmLabel={t('auth.developer_console.api_keys.revoke_confirm', 'Revoke Key Permanently')}
        isSubmitting={deleteMutation.isPending}
      />
    </Box>
  )
}

export default DeveloperApiKeysScreen
