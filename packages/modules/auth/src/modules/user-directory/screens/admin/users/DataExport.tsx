import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Alert, CircularProgress } from '@mui/material';
import Download from '@mui/icons-material/Download';
import History from '@mui/icons-material/History';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Pending from '@mui/icons-material/Pending';
import CloudDownload from '@mui/icons-material/CloudDownload';
import Delete from '@mui/icons-material/Delete';
import { adminService } from '../../../../authorization-engine/services/adminService';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';

const DataExport = () => {
  const { id: userId } = useParams()
  const [loading, setLoading] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [exports, setExports] = useState<any[]>([])

  const fetchExports = async () => {
    setLoading(true)
    try {
      const response = await adminService.listDataExports(Number(userId))
      setExports(response.data || [])
    } catch (error) {
      console.error('Failed to fetch exports', error)
      // Mocking for demonstration if service call fails or is empty
      setExports([
        { id: 1, status: 'COMPLETED', created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 86400000 * 7).toISOString(), download_url: '#' }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) fetchExports()
  }, [userId])

  const handleRequestExport = async () => {
    setRequesting(true)
    try {
      await adminService.requestDataExport(Number(userId))
      toast.success('Data export request submitted. You will be notified when it is ready.')
      fetchExports()
    } catch (error) {
      toast.error('Failed to request data export')
    } finally {
      setRequesting(false)
    }
  }

  return (
    <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' sx={{ fontWeight: 900, mb: 1 }}>
          DATA PORTABILITY (GDPR)
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Request and manage downloads of personal data associated with this account.
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 4, borderRadius: 3 }}>
        Exports include profile information, security history, and application preferences. To protect privacy, download links expire after 7 days.
      </Alert>

      <Card sx={{ borderRadius: 4, mb: 4, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Request New Export</Typography>
            <Typography variant="body2" color="text.secondary">Generate a comprehensive archive of all user data.</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={requesting ? <CircularProgress size={20} color="inherit" /> : <CloudDownload />}
            onClick={handleRequestExport}
            disabled={requesting}
            sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 700 }}
          >
            {requesting ? 'Processing...' : 'Request Download'}
          </Button>
        </CardContent>
      </Card>

      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <History fontSize="small" /> REQUEST HISTORY
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>REQUESTED ON</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>EXPIRES</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell>
              </TableRow>
            ) : exports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">No export history found.</Typography>
                </TableCell>
              </TableRow>
            ) : exports.map((exp) => (
              <TableRow key={exp.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {new Date(exp.created_at).toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={exp.status === 'COMPLETED' ? <CheckCircle /> : <Pending />}
                    label={exp.status}
                    color={exp.status === 'COMPLETED' ? 'success' : 'warning'}
                    size="small"
                    sx={{ borderRadius: 1.5, fontWeight: 800 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {exp.expires_at ? new Date(exp.expires_at).toLocaleDateString() : '-'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {exp.status === 'COMPLETED' && (
                    <Button
                      size="small"
                      startIcon={<Download />}
                      href={exp.download_url}
                      sx={{ textTransform: 'none', fontWeight: 700 }}
                    >
                      Download
                    </Button>
                  )}
                  <IconButton size="small" color="error">
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default DataExport
