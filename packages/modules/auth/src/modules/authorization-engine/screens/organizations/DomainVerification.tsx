import React, { useState } from 'react'
import Language from '@mui/icons-material/Language'
import Refresh from '@mui/icons-material/Refresh'
import Delete from '@mui/icons-material/Delete'
import Add from '@mui/icons-material/Add'
import ContentCopy from '@mui/icons-material/ContentCopy'
import Verified from '@mui/icons-material/Verified'
import Pending from '@mui/icons-material/Pending'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material'
import { adminService, DomainVerification as DomainType } from '../../services/adminService'
import { useNotifications } from '@cap/platform-core'

import { normalizeDomain } from '../../../authentication-core/utils/schema'

const DomainVerification = () => {
  const { addNotification } = useNotifications()
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
        {
          id: 1,
          organization_id: 1,
          domain: 'example.com',
          status: 'verified' as const,
          verification_token: 'cap-verify-91a2b3c4',
          verified_at: '2024-01-01',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ])
    } catch (error) {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to fetch domains' })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchDomains()
  }, [])

  const handleAddDomain = async () => {
    const normalized = normalizeDomain(newDomain)
    if (!normalized) {
      addNotification({
        type: 'error',
        title: 'Invalid Domain',
        message: 'Please enter a valid domain name',
      })
      return
    }

    setIsVerifying(true)
    try {
      const response = await adminService.verifyDomain(orgId, normalized)
      if (response.data) {
        setDomains([...domains, response.data])
        setNewDomain('')
        addNotification({
          type: 'success',
          title: 'Domain Added',
          message: 'Domain added and verification token generated.',
        })
      }
    } catch (error) {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to add domain' })
    } finally {
      setIsVerifying(false)
    }
  }

  // Takes the record rather than just its id: the backend looks the pending
  // verification up by domain name, and the id is still needed to slot the
  // refreshed record back into the list.
  const handleCheckStatus = async (domainId: number, domainName: string) => {
    try {
      const response = await adminService.checkDomain(domainName)
      if (response.data) {
        setDomains(domains.map((d) => (d.id === domainId ? response.data : d)))
        if (response.data.status === 'verified') {
          addNotification({
            type: 'success',
            title: 'Domain Verified',
            message: 'Domain verified successfully!',
          })
        } else {
          addNotification({
            type: 'warning',
            title: 'Verification Pending',
            message: 'Domain not yet verified. Please check your DNS records.',
          })
        }
      }
    } catch (error) {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to check domain status' })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    addNotification({
      type: 'info',
      title: 'Copied',
      message: 'Verification token copied to clipboard',
    })
  }

  const verifiedCount = domains.filter((d) => d.status === 'verified').length
  const totalCount = domains.length

  return (
    <Box sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant='h4' sx={{ fontWeight: 900, mb: 1 }}>
            DOMAIN VERIFICATION
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Verify ownership of your domains to enable SSO, email branding, and automated
            provisioning.
          </Typography>
        </Box>

        {/* Zeigarnik Effect: Verification Progress Badge */}
        {totalCount > 0 && (
          <Chip
            icon={
              verifiedCount === totalCount ? (
                <Verified sx={{ fontSize: '1rem' }} />
              ) : (
                <Pending sx={{ fontSize: '1rem' }} />
              )
            }
            label={`${verifiedCount} of ${totalCount} Domains Verified`}
            color={verifiedCount === totalCount ? 'success' : 'warning'}
            variant='outlined'
            sx={{ fontWeight: 800, borderRadius: '50px', px: 1 }}
          />
        )}
      </Box>

      <Alert severity='info' sx={{ mb: 4, borderRadius: 3 }}>
        To verify a domain, add a <strong>TXT</strong> record with your verification token to your
        DNS configuration.
      </Alert>

      <Card
        sx={{
          borderRadius: 4,
          mb: 4,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant='h6' sx={{ fontWeight: 800, mb: 2 }}>
            Add New Domain
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              placeholder='e.g. acme.com or https://corp.acme.com'
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              helperText='Accepts full URL or domain name; automatically normalized.'
              disabled={isVerifying}
              size='small'
            />
            <Button
              variant='contained'
              onClick={handleAddDomain}
              disabled={!newDomain || isVerifying}
              startIcon={isVerifying ? <CircularProgress size={20} color='inherit' /> : <Add />}
              sx={{ borderRadius: 2, px: 4, textTransform: 'none', fontWeight: 700 }}
            >
              Add Domain
            </Button>
          </Box>
        </CardContent>
      </Card>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}
      >
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>DOMAIN</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>ADDED ON</TableCell>
              <TableCell align='right' sx={{ fontWeight: 700 }}>
                ACTIONS
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {domains.map((domain) => (
              <React.Fragment key={domain.id}>
                <TableRow hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Language color='primary' />
                      <Typography variant='body2' sx={{ fontWeight: 700 }}>
                        {domain.domain}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={domain.status === 'verified' ? <Verified /> : <Pending />}
                      label={domain.status === 'verified' ? 'VERIFIED' : 'PENDING'}
                      color={domain.status === 'verified' ? 'success' : 'warning'}
                      size='small'
                      sx={{ borderRadius: 1.5, fontWeight: 800 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant='caption' color='text.secondary'>
                      {new Date(domain.created_at).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align='right'>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      {domain.status !== 'verified' && (
                        <Tooltip title='Check Verification Status'>
                          <IconButton
                            size='small'
                            color='primary'
                            onClick={() => handleCheckStatus(domain.id, domain.domain)}
                          >
                            <Refresh fontSize='small' />
                          </IconButton>
                        </Tooltip>
                      )}
                      <IconButton size='small' color='error'>
                        <Delete fontSize='small' />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
                {domain.status !== 'verified' && domain.verification_token && (
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell colSpan={4}>
                      <Box sx={{ p: 1 }}>
                        <Typography
                          variant='caption'
                          sx={{ fontWeight: 800, mb: 1, display: 'block' }}
                        >
                          DNS TXT RECORD REQUIRED:
                        </Typography>
                        <Box
                          sx={{
                            p: 1.5,
                            bgcolor: 'grey.900',
                            color: 'success.light',
                            borderRadius: 2,
                            fontFamily: 'monospace',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '0.75rem',
                          }}
                        >
                          opencode-verification={domain.verification_token}
                          <IconButton
                            size='small'
                            sx={{ color: 'success.light', ml: 'auto' }}
                            onClick={() =>
                              copyToClipboard(`opencode-verification=${domain.verification_token}`)
                            }
                          >
                            <ContentCopy fontSize='inherit' />
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
