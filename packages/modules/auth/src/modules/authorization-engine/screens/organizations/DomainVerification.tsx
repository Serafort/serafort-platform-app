import React, { useState } from 'react';
import Language from '@mui/icons-material/Language';
import Refresh from '@mui/icons-material/Refresh';
import Delete from '@mui/icons-material/Delete';
import Add from '@mui/icons-material/Add';
import ContentCopy from '@mui/icons-material/ContentCopy';
import Verified from '@mui/icons-material/Verified';
import Pending from '@mui/icons-material/Pending';
import { Box, Typography, Card, CardContent, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Alert, CircularProgress, Tooltip } from '@mui/material';
import { adminService, DomainVerification as DomainType } from '../../services/adminService';
import { toast } from 'react-toastify';

const DomainVerification = () => {
  const [loading, setLoading] = useState(false)
  const [domains, setDomains] = useState<DomainType[]>([])
  const [newDomain, setNewDomain] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  // Mock orgId - should come from context/URL
  const orgId = 1

  const fetchDomains = async () => {
    setLoading(true)
    try {
      // Mocking domain list; a dedicated getDomains endpoint would replace this
      setDomains([
        { id: 1, organization_id: 1, domain: 'example.com', status: 'verified' as const, verification_token: '', verified_at: '2024-01-01', created_at: '2024-01-01', updated_at: '2024-01-01' }
      ])
    } catch (error) {
      toast.error('Failed to fetch domains')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchDomains()
  }, [])

  const handleAddDomain = async () => {
    setIsVerifying(true)
    try {
      const response = await adminService.verifyDomain(orgId, newDomain)
      if (response.data) {
        setDomains([...domains, response.data])
        setNewDomain('')
        toast.success('Domain added and verification started')
      }
    } catch (error) {
      toast.error('Failed to add domain')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleCheckStatus = async (domainId: number) => {
    try {
      const response = await adminService.checkDomain(orgId, domainId)
      if (response.data) {
        setDomains(domains.map(d => d.id === domainId ? response.data : d))
        if (response.data.status === 'verified') {
          toast.success('Domain verified successfully!')
        } else {
          toast.warning('Domain not yet verified. Please check your DNS records.')
        }
      }
    } catch (error) {
      toast.error('Failed to check domain status')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.info('Copied to clipboard')
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' sx={{ fontWeight: 900, mb: 1 }}>
          DOMAIN VERIFICATION
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Verify ownership of your domains to enable SSO, email branding, and automated provisioning.
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 4, borderRadius: 3 }}>
        To verify a domain, you will need to add a TXT record to your DNS configuration.
      </Alert>

      <Card sx={{ borderRadius: 4, mb: 4, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Add New Domain</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              placeholder="e.g. acme.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              disabled={isVerifying}
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleAddDomain}
              disabled={!newDomain || isVerifying}
              startIcon={isVerifying ? <CircularProgress size={20} color="inherit" /> : <Add />}
              sx={{ borderRadius: 2, px: 4, textTransform: 'none', fontWeight: 700 }}
            >
              Add Domain
            </Button>
          </Box>
        </CardContent>
      </Card>

      <TableContainer component={Paper} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>DOMAIN</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>ADDED ON</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {domains.map((domain) => (
              <React.Fragment key={domain.id}>
                <TableRow hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Language color="primary" />
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{domain.domain}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={domain.status === 'verified' ? <Verified /> : <Pending />}
                      label={domain.status === 'verified' ? 'VERIFIED' : 'PENDING'}
                      color={domain.status === 'verified' ? 'success' : 'warning'}
                      size="small"
                      sx={{ borderRadius: 1.5, fontWeight: 800 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(domain.created_at).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      {domain.status !== 'verified' && (
                        <Tooltip title="Check Verification Status">
                          <IconButton size="small" color="primary" onClick={() => handleCheckStatus(domain.id)}>
                            <Refresh fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <IconButton size="small" color="error">
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
                {domain.status !== 'verified' && domain.verification_token && (
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell colSpan={4}>
                      <Box sx={{ p: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, mb: 1, display: 'block' }}>
                          DNS TXT RECORD REQUIRED:
                        </Typography>
                        <Box sx={{
                          p: 1.5,
                          bgcolor: 'grey.900',
                          color: 'success.light',
                          borderRadius: 2,
                          fontFamily: 'monospace',
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '0.75rem'
                        }}>
                          opencode-verification={domain.verification_token}
                          <IconButton size="small" sx={{ color: 'success.light', ml: 'auto' }} onClick={() => copyToClipboard(`opencode-verification=${domain.verification_token}`)}>
                            <ContentCopy fontSize="inherit" />
                          </IconButton>
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default DomainVerification
