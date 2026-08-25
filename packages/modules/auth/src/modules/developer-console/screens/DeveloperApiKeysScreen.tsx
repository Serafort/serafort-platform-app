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
  MenuItem,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Stack,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import KeyIcon from '@mui/icons-material/VpnKey'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { developerService, type DeveloperApiKeyItem } from '@cap/auth-contracts'

export const DeveloperApiKeysScreen: React.FC = () => {
  const [keys, setKeys] = useState<DeveloperApiKeyItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create Modal state
  const [createOpen, setCreateOpen] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [expiresIn, setExpiresIn] = useState('90')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reveal Key Modal state
  const [revealOpen, setRevealOpen] = useState(false)
  const [createdRawKey, setCreatedRawKey] = useState('')
  const [copied, setCopied] = useState(false)

  const loadKeys = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await developerService.listApiKeys()
      if (response?.data) {
        const rawKeys = Array.isArray(response.data)
          ? response.data
          : (response.data as any)?.keys || (response.data as any)?.items || (response.data as any)?.data || []
        setKeys(Array.isArray(rawKeys) ? rawKeys : [])
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load developer API keys.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadKeys()
  }, [])

  const handleCreate = async () => {
    if (!keyName.trim()) return
    setIsSubmitting(true)
    try {
      let expiresAt: string | null = null
      if (expiresIn !== 'never') {
        const days = Number(expiresIn)
        const d = new Date()
        d.setDate(d.getDate() + days)
        expiresAt = d.toISOString()
      }

      const response = await developerService.createApiKey({
        name: keyName.trim(),
        expiresAt,
      })

      if (response?.data?.key) {
        setCreatedRawKey(response.data.key)
        setCreateOpen(false)
        setKeyName('')
        setExpiresIn('90')
        setRevealOpen(true)
        loadKeys()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate API key.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to revoke this API key? This action is irreversible.')) return
    try {
      await developerService.deleteApiKey(id)
      setKeys((prev) => prev.filter((k) => k.id !== id))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to revoke API key.')
    }
  }

  const handleCopyKey = () => {
    navigator.clipboard.writeText(createdRawKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Key Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Key Hash / Identifier</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Expires</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Loading API keys...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : keys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" fontWeight={500}>No API Keys found.</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Generate your first API key to interact with the Identity platform programmatically.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              keys.map((key) => {
                const expiresAt = key.expiresAt || (key as any).expires_at
                const createdAt = key.createdAt || (key as any).created_at
                const isExpired = expiresAt && new Date(expiresAt) < new Date()
                const keyHash = key.keyHash || (key as any).key_hash || (key as any).key || (key as any).token || (key as any).prefix || ''
                const keyName = key.name || (key as any).title || `API Key #${key.id}`
                return (
                  <TableRow key={key.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {keyName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: 'action.selected', px: 1, py: 0.5, borderRadius: 1 }}>
                        {keyHash ? `${keyHash.slice(0, 16)}...` : '••••••••••••••••'}
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
                          onClick={() => handleDelete(key.id)}
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
              label="Key Name / Description"
              fullWidth
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="e.g. CI/CD Deployment Pipeline, Zapier Sync"
              autoFocus
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
            disabled={!keyName.trim() || isSubmitting}
          >
            {isSubmitting ? 'Generating...' : 'Generate Secret Key'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reveal Raw Key Modal */}
      <Dialog open={revealOpen} onClose={() => setRevealOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700} sx={{ color: 'warning.main' }}>
          Save Your API Key
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Alert severity="warning">
              Please copy your API key now. For security purposes, it will <strong>never be shown again</strong>.
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
              <Tooltip title={copied ? 'Copied!' : 'Copy to Clipboard'}>
                <IconButton onClick={handleCopyKey} color={copied ? 'success' : 'primary'} sx={{ ml: 1 }}>
                  {copied ? <CheckCircleOutlineIcon /> : <ContentCopyIcon />}
                </IconButton>
              </Tooltip>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button variant="contained" onClick={() => setRevealOpen(false)}>
            I have saved my key securely
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DeveloperApiKeysScreen
