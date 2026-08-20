import { useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, FormControl, InputLabel, Select, MenuItem, TextField, Stack, Chip, LinearProgress, Alert, AlertTitle, Divider, Paper } from '@mui/material';
import History from '@mui/icons-material/History';
import FileDownload from '@mui/icons-material/FileDownload';
import CloudDownload from '@mui/icons-material/CloudDownload';
import Analytics from '@mui/icons-material/Analytics';
import SpeedIcon from '@mui/icons-material/Speed';
import TimerIcon from '@mui/icons-material/Timer';
import StorageIcon from '@mui/icons-material/Storage';
import { useTranslation } from 'react-i18next';
import { useExportAuditLogs } from '@idaas/authentication-core/hooks/useAdminQuery';
import { useChunkProgressTracker } from '@idaas/authentication-core/hooks/useChunkProgressTracker';
import { toast } from 'react-toastify';
import logger from '@idaas/authentication-core/utils/logger';

export default function ExportAuditTrail() {
  const { t } = useTranslation('common')
  const tracker = useChunkProgressTracker({
    totalChunks: 36,
    chunkSize: 250,
    bytesPerChunk: 96 * 1024,
    updateIntervalMs: 120,
  })

  const [reportType, setReportType] = useState('security')
  const [format, setFormat] = useState('csv')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const exportMutation = useExportAuditLogs({
    onMutate: () => {
      tracker.start()
    },
    onSuccess: (response) => {
      try {
        tracker.finish()
        // Create a download link for the blob
        const url = window.URL.createObjectURL(response.data)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute(
          'download',
          `audit_logs_${reportType}_${new Date().toISOString().split('T')[0]}.${format}`,
        )
        document.body.appendChild(link)
        link.click()
        link.parentNode?.removeChild(link)
        window.URL.revokeObjectURL(url)
        toast.success(t('auth.admin.exportSuccess', 'Export completed successfully'), {  })
      } catch (err: unknown) {
        logger.error('Failed to process export response', { error: err })
      }

      setTimeout(() => tracker.reset(), 1500)
    },
    onError: (error) => {
      logger.error('Audit log export failed', { error })
      toast.error(error.message || t('auth.admin.exportFailed', 'Export failed'), {  })
      tracker.reset()
    },
  })

  const handleExport = () => {
    exportMutation.mutate({
      format: format as 'json' | 'csv',
      type: reportType,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })
  }

  const exportHistory = [
    { id: '1', date: '2023-10-25 09:00', type: 'Full Audit', format: 'PDF', status: 'ready' },
    {
      id: '2',
      date: '2023-10-20 14:30',
      type: 'Security Events Only',
      format: 'CSV',
      status: 'expired',
    },
  ]

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' sx={{ fontWeight: 900, mb: 1 }}>
          {t('auth.admin.exportAudit')}
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          {t('auth.admin.exportAudit_subtitle')}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant='h6' sx={{ fontWeight: 800, mb: 3 }}>
                {t('auth.admin.exportParameters')}
              </Typography>

              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel>{t('auth.admin.reportType')}</InputLabel>
                  <Select
                    label={t('auth.admin.reportType')}
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <MenuItem value='security'>Security & Access Events</MenuItem>
                    <MenuItem value='iam'>IAM & Perm Change Logs</MenuItem>
                    <MenuItem value='full'>Comprehensive System Audit</MenuItem>
                  </Select>
                </FormControl>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label='Start Date'
                      type='date'
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label='End Date'
                      type='date'
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>

                <FormControl fullWidth>
                  <InputLabel>{t('auth.admin.outputFormat')}</InputLabel>
                  <Select
                    label={t('auth.admin.outputFormat')}
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                  >
                    <MenuItem value='csv'>Spreadsheet (.csv)</MenuItem>
                    <MenuItem value='json'>JSON Data (.json)</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ mt: 2 }}>
                  <Button
                    fullWidth
                    variant='contained'
                    size='large'
                    startIcon={exportMutation.isPending ? undefined : <CloudDownload />}
                    disabled={exportMutation.isPending}
                    onClick={handleExport}
                    sx={{
                      height: 56,
                      fontWeight: 800,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      boxShadow: 'none',
                    }}
                  >
                    {exportMutation.isPending
                      ? `${t('auth.admin.generating')} ${tracker.progress}%`
                      : t('auth.admin.startExport')}
                  </Button>
                </Box>

                {exportMutation.isPending && (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        Exporting Chunk {tracker.processedChunks} of {tracker.totalChunks}
                      </Typography>
                      <Chip
                        label={`${tracker.progress}%`}
                        color="primary"
                        size="small"
                        sx={{ fontWeight: 800, borderRadius: 1.5 }}
                      />
                    </Box>

                    <LinearProgress
                      variant='determinate'
                      value={tracker.progress}
                      sx={{ height: 6, borderRadius: 3, mb: 2 }}
                    />

                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <StorageIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}>
                              Payload
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                              {tracker.processedBytesFormatted} / {tracker.totalBytesFormatted}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <SpeedIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}>
                              Throughput
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                              {tracker.itemsPerSecond} logs/s
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <TimerIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}>
                              ETA
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                              {tracker.etaFormatted}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={3}>
            <Alert severity='info' icon={<Analytics />} sx={{ borderRadius: 2 }}>
              <AlertTitle sx={{ fontWeight: 700 }}>{t('auth.admin.complianceTitle')}</AlertTitle>
              {t('auth.admin.complianceDesc')}
            </Alert>

            <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <CardContent>
                <Typography
                  variant='subtitle1'
                  sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center' }}
                >
                  <History sx={{ mr: 1, fontSize: 20 }} /> {t('auth.admin.recentExports')}
                </Typography>
                <Stack spacing={2}>
                  {exportHistory.map((item) => (
                    <Box key={item.id}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Box>
                          <Typography variant='body2' sx={{ fontWeight: 700 }}>
                            {item.type}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {item.date}
                          </Typography>
                        </Box>
                        <Chip
                          label={item.status}
                          size='small'
                          color={item.status === 'ready' ? 'success' : 'default'}
                          sx={{
                            textTransform: 'uppercase',
                            fontWeight: 900,
                            fontSize: '0.55rem',
                            height: 16,
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <Button
                          size='small'
                          startIcon={<FileDownload />}
                          disabled={item.status !== 'ready'}
                          sx={{
                            textTransform: 'none',
                            p: 0,
                            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                          }}
                        >
                          {t('auth.admin.downloadFormat', { format: item.format })}
                        </Button>
                      </Box>
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}

