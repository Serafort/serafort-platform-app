import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, TextField, InputAdornment } from '@mui/material';
import Add from '@mui/icons-material/Add';
import Search from '@mui/icons-material/Search';
import VpnKey from '@mui/icons-material/VpnKey';
import CheckCircle from '@mui/icons-material/CheckCircle';
;
import { adminService, DeveloperApiKey } from '../../services/adminService';
import { toast } from 'react-toastify';
import { Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import ContentCopy from '@mui/icons-material/ContentCopy';
import Delete from '@mui/icons-material/Delete';

const MachineIdentityManagement = () => {

  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [identities, setIdentities] = useState<DeveloperApiKey[]>([])

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)

  // Mock orgId - in a real app this would come from context
  const orgId = 1

  const fetchKeys = async () => {
    setLoading(true)
    try {
      const response = await adminService.getDeveloperApiKeys(orgId)
      setIdentities(response.data || [])
    } catch (error) {
      toast.error('Failed to fetch API keys')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchKeys()
  }, [])

  const handleCreateKey = async () => {
    try {
      const response = await adminService.createDeveloperApiKey(orgId, { name: newKeyName })
      if (response.data) {
        setCreatedKey(response.data.key)
        fetchKeys()
        toast.success('API Key created successfully')
      }
    } catch (error) {
      toast.error('Failed to create API key')
    }
  }

  const handleRevokeKey = async (keyId: number) => {
    if (!window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return

    try {
      await adminService.revokeDeveloperApiKey(orgId, keyId)
      fetchKeys()
      toast.success('API Key revoked')
    } catch (error) {
      toast.error('Failed to revoke API key')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.info('Copied to clipboard')
  }

  const filteredIdentities = identities.filter(id =>
    id.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant='h4' sx={{ fontWeight: 900, letterSpacing: '-0.02em', mb: 1 }}>
            DEVELOPER API KEYS
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Machine identities and programmatic access tokens for your organization.
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<Add />}
          onClick={() => {
            setCreatedKey(null)
            setNewKeyName('')
            setCreateDialogOpen(true)
          }}
          sx={{
            borderRadius: 3,
            px: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 800,
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          Provision New Key
        </Button>
      </Box>

      <Card sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', gap: 2 }}>
            <TextField
              size='small'
              placeholder='Search keys...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Search fontSize='small' />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 },
              }}
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>KEY NAME</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>PREFIX</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>LAST USED</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>EXPIRES</TableCell>
                  <TableCell align='right'></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : filteredIdentities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">No API keys found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredIdentities.map((identity) => (
                  <TableRow key={identity.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <VpnKey sx={{ color: 'primary.main' }} />
                        <Typography variant='body2' sx={{ fontWeight: 700 }}>
                          {identity.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: 'action.selected', px: 1, py: 0.5, borderRadius: 1 }}>
                        {identity.prefix}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<CheckCircle />}
                        label="ACTIVE"
                        size='small'
                        color='success'
                        sx={{ borderRadius: 1.5, fontWeight: 800, height: 24 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant='caption' sx={{ fontFamily: 'monospace' }}>
                        {identity.last_used_at ? new Date(identity.last_used_at).toLocaleString() : 'Never'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='caption' sx={{ color: identity.expires_at ? 'text.primary' : 'text.disabled' }}>
                        {identity.expires_at ? new Date(identity.expires_at).toLocaleDateString() : 'Permanent'}
                      </Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <IconButton size='small' color="error" onClick={() => handleRevokeKey(identity.id)}>
                        <Delete fontSize='small' />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create Key Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>PROVISION NEW API KEY</DialogTitle>
        <DialogContent>
          {!createdKey ? (
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Provide a descriptive name for this machine identity (e.g., "GitHub Actions CI").
              </Typography>
              <TextField
                fullWidth
                label="Key Name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                autoFocus
              />
            </Box>
          ) : (
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" color="warning.main" sx={{ fontWeight: 700 }}>
                CRITICAL: Copy this key now. It will never be shown again.
              </Typography>
              <Box sx={{
                p: 2,
                bgcolor: 'grey.900',
                color: 'success.light',
                borderRadius: 2,
                fontFamily: 'monospace',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                wordBreak: 'break-all'
              }}>
                {createdKey}
                <IconButton size="small" sx={{ color: 'success.light' }} onClick={() => copyToClipboard(createdKey)}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          {!createdKey ? (
            <>
              <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleCreateKey} disabled={!newKeyName}>Generate Key</Button>
            </>
          ) : (
            <Button variant="contained" onClick={() => setCreateDialogOpen(false)}>Done</Button>
          )}
        </DialogActions>
      </Dialog>

      <Box sx={{ mt: 4, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
        <Card sx={{ borderRadius: 4, bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Typography variant='overline' sx={{ opacity: 0.8, fontWeight: 800 }}>Active Tokens</Typography>
            <Typography variant='h4' sx={{ fontWeight: 900 }}>42</Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
          <CardContent>
            <Typography variant='overline' sx={{ color: 'text.secondary', fontWeight: 800 }}>Revoked Today</Typography>
            <Typography variant='h4' sx={{ fontWeight: 900 }}>3</Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
          <CardContent>
            <Typography variant='overline' sx={{ color: 'text.secondary', fontWeight: 800 }}>System Health</Typography>
            <Typography variant='h4' sx={{ fontWeight: 900, color: 'success.main' }}>100%</Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default MachineIdentityManagement
