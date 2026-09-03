import React, { useCallback, useState, useMemo } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Paper,
  Avatar,
  LinearProgress,
  Chip,
  Grid,
} from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import DownloadIcon from '@mui/icons-material/Download'
import FileIcon from '@mui/icons-material/FilePresent'
import HistoryIcon from '@mui/icons-material/History'
import ScheduleIcon from '@mui/icons-material/Schedule'
import StorageIcon from '@mui/icons-material/Storage'
import SpeedIcon from '@mui/icons-material/Speed'
import TimerIcon from '@mui/icons-material/Timer'
import { buildLayoutSurfaceEffect } from '@cap/layout'
import { getTenantThemeEffects } from '@cap/theme'
import { useComplianceExport, useExportMutation } from '../../hooks/useUserQuery'
import { useChunkProgressTracker } from '../../../authentication-core/hooks/useChunkProgressTracker'
import logger from '@idaas/authentication-core/utils/logger'

export const DataExport: React.FC = () => {
  const theme = useTheme()
  // const { t } = useTranslation()
  const [requestSuccess, setRequestSuccess] = useState(false)
  const tracker = useChunkProgressTracker({
    totalChunks: 24,
    chunkSize: 150,
    bytesPerChunk: 128 * 1024,
    updateIntervalMs: 140,
  })

  // Custom hook to fetch existing exports or request status
  const { data: exportData, isLoading, refetch } = useComplianceExport()
  const { mutateAsync: requestExport, isPending: isRequesting } = useExportMutation()

  const handleDownload = useCallback((exportId: number | string) => {
    // Construct the download URL using the endpoint helper
    const url = `/api/gdpr/export/${exportId}/download`
    window.open(url, '_blank')
  }, [])

  const handleRequestExport = useCallback(async () => {
    try {
      tracker.start()
      await requestExport()
      tracker.finish()
      setRequestSuccess(true)
      refetch()
    } catch (error) {
      logger.error('Failed to request export', { error })
      tracker.reset()
    }
  }, [requestExport, refetch, tracker])

  // Map backend response or use mock for demo if empty
  const items = useMemo(() => {
    if (exportData?.data && Array.isArray(exportData.data)) {
      return exportData.data
    }
    return []
  }, [exportData])

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }} className='animate-scale-in'>
      <Typography variant='h4' sx={{ mb: 1, fontWeight: 900, letterSpacing: '-0.027em' }}>
        Personal Data Archive
      </Typography>
      <Typography variant='body1' sx={{ color: 'text.secondary', mb: 4, fontWeight: 500 }}>
        Download a copy of your personal data. This archive includes your profile information,
        activity logs, and connected account data as per GDPR Right to Portability.
      </Typography>

      <Card
        sx={(theme: any) => ({
          borderRadius: 4,
          border: '1px solid ' + theme.palette.divider,
          mb: 4,
          ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
        })}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                display: 'flex',
              }}
            >
              <FileIcon fontSize='large' />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant='h6' sx={{ fontWeight: 800, mb: 0.5 }}>
                Request New Archive
              </Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary', mb: 3, fontWeight: 500 }}>
                We will gather all your data and prepare a JSON file. This process may take a few
                minutes. You will receive an email notification once it's ready.
              </Typography>

              {requestSuccess ? (
                <Alert severity='success' sx={{ mb: 2, borderRadius: 2, fontWeight: 600 }}>
                  Request submitted! We are preparing your data.
                </Alert>
              ) : (
                <Box>
                  <Button
                    variant='contained'
                    onClick={handleRequestExport}
                    disabled={isRequesting}
                    startIcon={
                      isRequesting ? (
                        <CircularProgress size={20} color='inherit' />
                      ) : (
                        <ScheduleIcon />
                      )
                    }
                    sx={{
                      borderRadius: 2.5,
                      textTransform: 'none',
                      px: 4,
                      py: 1.2,
                      bgcolor: 'info.main',
                      boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                      fontWeight: 700,
                    }}
                  >
                    {isRequesting
                      ? `Processing Archive (${tracker.progress}%)`
                      : 'Generate New Export'}
                  </Button>

                  {isRequesting && (
                    <Paper
                      variant='outlined'
                      sx={{
                        mt: 2.5,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.background.paper, 0.6),
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <Typography variant='caption' sx={{ fontWeight: 800 }}>
                          Collecting GDPR Chunk {tracker.processedChunks} of {tracker.totalChunks}
                        </Typography>
                        <Chip
                          label={`${tracker.progress}%`}
                          color='info'
                          size='small'
                          sx={{ fontWeight: 800, height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                      <LinearProgress
                        variant='determinate'
                        value={tracker.progress}
                        sx={{ height: 6, borderRadius: 3, mb: 1.5 }}
                      />
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 4 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <StorageIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography
                              variant='caption'
                              sx={{ color: 'text.secondary', fontWeight: 600 }}
                            >
                              {tracker.processedBytesFormatted} / {tracker.totalBytesFormatted}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <SpeedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography
                              variant='caption'
                              sx={{ color: 'text.secondary', fontWeight: 600 }}
                            >
                              {tracker.itemsPerSecond} rec/s
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <TimerIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography
                              variant='caption'
                              sx={{ color: 'text.secondary', fontWeight: 600 }}
                            >
                              ETA: {tracker.etaFormatted}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Typography
        variant='h6'
        sx={{ mb: 2, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}
      >
        <HistoryIcon color='info' /> Recent Exports
      </Typography>

      <Paper
        variant='outlined'
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          bgcolor: 'transparent',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {isLoading ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <List disablePadding>
            {items.map((item: any, index: number) => (
              <React.Fragment key={item.id}>
                <ListItem
                  sx={{
                    px: 4,
                    py: 3,
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.4) },
                  }}
                  secondaryAction={
                    item.status === 'Ready' && (
                      <Button
                        variant='contained'
                        size='small'
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownload(item.id)}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 700,
                          bgcolor: 'secondary.main',
                          color: 'common.white',
                          '&:hover': { bgcolor: 'secondary.dark' },
                        }}
                      >
                        Download
                      </Button>
                    )
                  }
                >
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        bgcolor: alpha(
                          item.status === 'Ready'
                            ? theme.palette.success.main
                            : theme.palette.text.disabled,
                          0.1,
                        ),
                        color: item.status === 'Ready' ? 'success.main' : 'text.disabled',
                        borderRadius: 2,
                      }}
                    >
                      <FileIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: 800 }}>Data Archive - {item.date}</Typography>
                    }
                    secondary={
                      <Typography
                        variant='caption'
                        sx={{ color: 'text.secondary', fontWeight: 600 }}
                      >
                        ID: {item.id} • Status:{' '}
                        <Box
                          component='span'
                          sx={{
                            color: item.status === 'Ready' ? 'success.main' : 'error.main',
                            fontWeight: 700,
                          }}
                        >
                          {item.status}
                        </Box>{' '}
                        • {item.expires}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < items.length - 1 && <Divider sx={{ opacity: 0.5 }} />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      <Box
        sx={(theme: any) => ({
          mt: 4,
          p: 3,
          borderRadius: `${theme.shape.borderRadius * 1.5}px`,
          bgcolor: alpha(theme.palette.warning.main, 0.1),
          border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
        })}
      >
        <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1, color: 'warning.dark' }}>
          Important Security Notice
        </Typography>
        <Typography variant='caption' sx={{ color: 'warning.main', display: 'block' }}>
          Your data archive contains sensitive information including PII. Please ensure you store
          this file in a secure location and delete it after use if possible. Each archive link is
          protected and expires after 7 days for your security.
        </Typography>
      </Box>
    </Box>
  )
}
export default DataExport
