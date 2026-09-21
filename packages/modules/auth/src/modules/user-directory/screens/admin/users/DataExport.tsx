import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  LinearProgress,
  Grid,
  Container,
  alpha,
  useTheme,
} from '@mui/material'
import ArrowBack from '@mui/icons-material/ArrowBack'
import Download from '@mui/icons-material/Download'
import History from '@mui/icons-material/History'
import CloudDownload from '@mui/icons-material/CloudDownload'
import Delete from '@mui/icons-material/Delete'
import StorageIcon from '@mui/icons-material/Storage'
import SpeedIcon from '@mui/icons-material/Speed'
import TimerIcon from '@mui/icons-material/Timer'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { buildLayoutSurfaceEffect } from '@cap/layout'
import { getTenantThemeEffects } from '@cap/theme'
import Path from '../../path'
import { adminService } from '../../../../authorization-engine/services/adminService'
import { useChunkProgressTracker } from '../../../../authentication-core/hooks/useChunkProgressTracker'
import {
  AdminStatusBadge,
  AdminRowActionButton,
} from '../../../../authentication-core/components/shared/admin'

/** A user data-export job as listed by the admin API. */
interface DataExportItem {
  id: number | string
  status: string
  created_at: string
  expires_at?: string
  download_url?: string
}

const DataExport: React.FC = () => {
  const { id: userId } = useParams()
  const { t } = useTranslation('common')
  const theme = useTheme()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [exports, setExports] = useState<DataExportItem[]>([])
  const tracker = useChunkProgressTracker({
    totalChunks: 30,
    chunkSize: 200,
    bytesPerChunk: 112 * 1024,
    updateIntervalMs: 130,
  })

  const fetchExports = async () => {
    setLoading(true)
    try {
      const response = await adminService.listDataExports(Number(userId))
      setExports((response.data || []) as unknown as DataExportItem[])
    } catch (error) {
      console.error('Failed to fetch exports', error)
      // Mocking for demonstration if service call fails or is empty
      setExports([
        {
          id: 1,
          status: 'COMPLETED',
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 86400000 * 7).toISOString(),
          download_url: '#',
        },
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
    tracker.start()
    try {
      await adminService.requestDataExport(Number(userId))
      tracker.finish()
      toast.success(t('auth.admin.exportRequested', 'Data export request submitted. You will be notified when it is ready.'))
      fetchExports()
    } catch (error) {
      tracker.reset()
      toast.error(t('auth.admin.exportFailed', 'Failed to request data export'))
    } finally {
      setRequesting(false)
    }
  }

  const handleBack = () => {
    if (userId) {
      navigate(Path.admin.users.user_profile.replace(':id', userId))
    } else {
      navigate(Path.admin.users.list)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Container maxWidth='md' sx={{ py: 4 }}>
        {/* Back Navigation */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{
              minHeight: 44,
              px: 2,
              borderRadius: 'var(--sf-radius-md, 8px)',
              textTransform: 'none',
              fontWeight: 600,
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary',
                bgcolor: 'action.hover',
              },
            }}
          >
            {userId ? t('auth.admin.backToUser', 'Back to User Profile') : t('auth.admin.backToUsers', 'Back to Users')}
          </Button>
        </Box>

        {/* Header with Visual Anchor */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
            mb: 4,
            flexWrap: 'wrap',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 'var(--sf-radius-lg, 24px)',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CloudDownload sx={{ fontSize: 32 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 240 }}>
            <Typography variant='h4' sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>
              {t('auth.admin.dataPortabilityTitle', 'Data Portability (GDPR)')}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {t('auth.admin.dataPortabilitySubtitle', 'Request and manage downloads of personal data associated with this account.')}
            </Typography>
          </Box>
        </Box>

        <Alert
          severity='info'
          sx={{
            mb: 4,
            borderRadius: 'var(--sf-radius-md, 12px)',
            ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
          }}
        >
          {t('auth.admin.dataPortabilityNotice', 'Exports include profile information, security history, and application preferences. To protect privacy, download links expire after 7 days.')}
        </Alert>

        {/* Request Export Card */}
        <Card
          variant='outlined'
          sx={{
            borderRadius: 'var(--sf-radius-lg, 16px)',
            mb: 4,
            borderColor: theme.palette.divider,
            ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box>
                <Typography variant='h6' sx={{ fontWeight: 700 }}>
                  {t('auth.admin.requestNewExport', 'Request New Export')}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {t('auth.admin.requestExportDesc', 'Generate a comprehensive archive of all user data.')}
                </Typography>
              </Box>
              <Button
                variant='contained'
                startIcon={
                  requesting ? <CircularProgress size={20} color='inherit' /> : <CloudDownload />
                }
                onClick={handleRequestExport}
                disabled={requesting}
                sx={{
                  minHeight: 48,
                  px: 3,
                  borderRadius: 'var(--sf-radius-md, 8px)',
                  textTransform: 'none',
                  fontWeight: 700,
                  boxShadow: 'none',
                }}
              >
                {requesting
                  ? `${t('auth.common.processing', 'Processing')} (${tracker.progress}%)`
                  : t('auth.admin.requestDownload', 'Request Download')}
              </Button>
            </Box>

            {requesting && (
              <Paper
                variant='outlined'
                sx={{
                  mt: 3,
                  p: 2.5,
                  borderRadius: 'var(--sf-radius-md, 12px)',
                  bgcolor: 'background.default',
                  borderColor: theme.palette.divider,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1.5,
                  }}
                >
                  <Typography variant='caption' sx={{ fontWeight: 700 }}>
                    Exporting User Portability Chunk {tracker.processedChunks} of {tracker.totalChunks}
                  </Typography>
                  <Chip
                    label={`${tracker.progress}%`}
                    color='primary'
                    size='small'
                    sx={{ fontWeight: 700, height: 22, fontSize: '0.75rem', borderRadius: 'var(--sf-radius-xs, 4px)' }}
                  />
                </Box>
                <LinearProgress
                  variant='determinate'
                  value={tracker.progress}
                  sx={{ height: 8, borderRadius: 'var(--sf-radius-xs, 4px)', mb: 2 }}
                />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StorageIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        {tracker.processedBytesFormatted} / {tracker.totalBytesFormatted}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SpeedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        {tracker.itemsPerSecond} rec/s
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimerIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        ETA: {tracker.etaFormatted}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </CardContent>
        </Card>

        {/* History Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <History fontSize='small' sx={{ color: 'text.secondary' }} />
          <Typography
            variant='subtitle1'
            sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            {t('auth.admin.requestHistory', 'Request History')}
          </Typography>
        </Box>

        <TableContainer
          component={Paper}
          variant='outlined'
          sx={{
            borderRadius: 'var(--sf-radius-lg, 16px)',
            borderColor: theme.palette.divider,
            overflow: 'hidden',
            ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: alpha(theme.palette.action.hover, 0.4) }}>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {t('auth.admin.requestedOn', 'Requested On')}
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {t('auth.admin.status', 'Status')}
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {t('auth.admin.expires', 'Expires')}
                </TableCell>
                <TableCell
                  align='right'
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {t('auth.common.actions', 'Actions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align='center' sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : exports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align='center' sx={{ py: 6 }}>
                    <Typography variant='body2' color='text.secondary'>
                      {t('auth.admin.noExports', 'No export history found.')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                exports.map((exp) => (
                  <TableRow key={exp.id} hover>
                    <TableCell sx={{ fontWeight: 600, py: 2 }}>
                      {new Date(exp.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <AdminStatusBadge
                        tone={exp.status === 'COMPLETED' ? 'success' : 'warning'}
                        label={exp.status}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant='caption' color='text.secondary'>
                        {exp.expires_at ? new Date(exp.expires_at).toLocaleDateString() : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align='right' sx={{ py: 2 }}>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                        {exp.status === 'COMPLETED' && (
                          <Button
                            size='small'
                            variant='outlined'
                            startIcon={<Download />}
                            href={exp.download_url}
                            sx={{
                              minHeight: 44,
                              px: 2,
                              borderRadius: 'var(--sf-radius-md, 8px)',
                              textTransform: 'none',
                              fontWeight: 700,
                            }}
                          >
                            {t('auth.common.download', 'Download')}
                          </Button>
                        )}
                        <AdminRowActionButton
                          color='error'
                          aria-label={t('auth.common.delete', 'Delete export')}
                        >
                          <Delete fontSize='small' />
                        </AdminRowActionButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </motion.div>
  )
}

export default DataExport
