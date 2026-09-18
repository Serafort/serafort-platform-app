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
  Container,
  Stack,
} from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import DownloadIcon from '@mui/icons-material/Download'
import FileIcon from '@mui/icons-material/FilePresent'
import HistoryIcon from '@mui/icons-material/History'
import ScheduleIcon from '@mui/icons-material/Schedule'
import StorageIcon from '@mui/icons-material/Storage'
import SpeedIcon from '@mui/icons-material/Speed'
import TimerIcon from '@mui/icons-material/Timer'
import ArrowBack from '@mui/icons-material/ArrowBack'
import Security from '@mui/icons-material/Security'
import InboxOutlined from '@mui/icons-material/InboxOutlined'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { buildLayoutSurfaceEffect } from '@cap/layout'
import { getTenantThemeEffects } from '@cap/theme'
import { useComplianceExport, useExportMutation } from '../../hooks/useUserQuery'
import { useChunkProgressTracker } from '../../../authentication-core/hooks/useChunkProgressTracker'
import logger from '@idaas/authentication-core/utils/logger'
import { Path } from '../../../../routes/path'

export const DataExport: React.FC = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { t } = useTranslation('common')
  const effects = getTenantThemeEffects(theme)
  const surfaceEffect = buildLayoutSurfaceEffect(effects, theme)

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Container maxWidth='md' sx={{ py: { xs: 3, md: 5 } }}>
        {/* Top Back Navigation Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(Path.account.view || '/profile')}
          sx={{
            mb: 2.5,
            textTransform: 'none',
            fontWeight: 600,
            color: 'text.secondary',
            minHeight: 44,
            px: 2,
            borderRadius: 'var(--sf-radius-md, 8px)',
            bgcolor: alpha(theme.palette.action.active, 0.04),
            '&:hover': {
              bgcolor: alpha(theme.palette.action.active, 0.08),
              color: 'text.primary',
            },
          }}
        >
          {t('common.backToProfile', 'Back to Profile')}
        </Button>

        {/* Header Title Section */}
        <Box sx={{ mb: 4 }}>
          <Stack direction='row' alignItems='center' spacing={2.5}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 'var(--sf-radius-lg, 16px)',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FileIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography
                variant='h4'
                sx={{ fontWeight: 800, letterSpacing: '-0.025em', fontSize: { xs: '1.5rem', sm: '1.875rem' } }}
              >
                {t('auth.account.data_archive_title', 'Personal Data Archive')}
              </Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary', fontWeight: 500, mt: 0.5 }}>
                {t(
                  'auth.account.data_archive_subtitle',
                  'Download a copy of your personal data. This archive includes your profile information, activity logs, and connected account data as per GDPR Right to Portability.',
                )}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Request New Archive Card */}
        <Card
          sx={{
            borderRadius: 'var(--sf-radius-lg, 16px)',
            border: '1px solid',
            borderColor: 'divider',
            mb: 4,
            overflow: 'hidden',
            ...surfaceEffect,
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 'var(--sf-radius-md, 8px)',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DownloadIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant='h6' sx={{ fontWeight: 700, mb: 0.5 }}>
                  {t('auth.account.request_new_archive', 'Request New Archive')}
                </Typography>
                <Typography variant='body2' sx={{ color: 'text.secondary', mb: 3, fontWeight: 500 }}>
                  {t(
                    'auth.account.request_archive_desc',
                    'We will gather all your data and prepare a JSON archive. This process may take a few moments. You can track progress in real time.',
                  )}
                </Typography>

                {requestSuccess ? (
                  <Alert
                    severity='success'
                    sx={{
                      mb: 2,
                      borderRadius: 'var(--sf-radius-md, 8px)',
                      fontWeight: 600,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.success.main, 0.2),
                    }}
                  >
                    {t('auth.account.request_submitted', 'Request submitted! We are preparing your data archive.')}
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
                        borderRadius: 'var(--sf-radius-md, 8px)',
                        textTransform: 'none',
                        px: 3.5,
                        minHeight: 48,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        fontWeight: 700,
                        boxShadow: 'none',
                        '&:hover': {
                          boxShadow: 1,
                        },
                      }}
                    >
                      {isRequesting
                        ? `${t('auth.account.processing_archive', 'Processing Archive')} (${tracker.progress}%)`
                        : t('auth.account.generate_new_export', 'Generate New Export')}
                    </Button>

                    {isRequesting && (
                      <Paper
                        variant='outlined'
                        sx={{
                          mt: 2.5,
                          p: 2,
                          borderRadius: 'var(--sf-radius-md, 8px)',
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
                          <Typography variant='caption' sx={{ fontWeight: 700 }}>
                            {t('auth.account.collecting_chunks', 'Collecting GDPR Chunk {{current}} of {{total}}', {
                              current: tracker.processedChunks,
                              total: tracker.totalChunks,
                            })}
                          </Typography>
                          <Chip
                            label={`${tracker.progress}%`}
                            color='info'
                            size='small'
                            sx={{ fontWeight: 800, height: 22, fontSize: '0.75rem' }}
                          />
                        </Box>
                        <LinearProgress
                          variant='determinate'
                          value={tracker.progress}
                          sx={{ height: 6, borderRadius: 'var(--sf-radius-sm, 4px)', mb: 1.5 }}
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

        {/* Recent Exports Section */}
        <Typography
          variant='h6'
          sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}
        >
          <HistoryIcon color='primary' /> {t('auth.account.recent_exports', 'Recent Exports')}
        </Typography>

        <Paper
          variant='outlined'
          sx={{
            borderRadius: 'var(--sf-radius-lg, 16px)',
            overflow: 'hidden',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            ...surfaceEffect,
          }}
        >
          {isLoading ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <CircularProgress size={36} />
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <InboxOutlined sx={{ fontSize: 44, color: 'text.disabled', mb: 1 }} />
              <Typography variant='subtitle1' sx={{ fontWeight: 600, color: 'text.secondary' }}>
                {t('auth.account.no_exports_yet', 'No archives generated yet')}
              </Typography>
              <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                {t('auth.account.no_exports_hint', 'Your generated personal data archives will appear here.')}
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {items.map((item: any, index: number) => (
                <React.Fragment key={item.id}>
                  <ListItem
                    sx={{
                      px: { xs: 2.5, sm: 4 },
                      py: 2.5,
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
                            borderRadius: 'var(--sf-radius-md, 8px)',
                            textTransform: 'none',
                            fontWeight: 600,
                            minHeight: 44,
                            px: 2.5,
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            '&:hover': { bgcolor: 'primary.dark' },
                          }}
                        >
                          {t('auth.account.download', 'Download')}
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
                            0.12,
                          ),
                          color: item.status === 'Ready' ? 'success.main' : 'text.disabled',
                          borderRadius: 'var(--sf-radius-md, 8px)',
                        }}
                      >
                        <FileIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 700 }}>
                          Data Archive - {item.date}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant='caption'
                          sx={{ color: 'text.secondary', fontWeight: 500 }}
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

        {/* Security Notice */}
        <Box
          sx={{
            mt: 4,
            p: 3,
            borderRadius: 'var(--sf-radius-md, 8px)',
            bgcolor: alpha(theme.palette.warning.main, 0.08),
            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <Security sx={{ color: 'warning.main', fontSize: 24, mt: 0.2 }} />
          <Box>
            <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 0.5, color: 'warning.dark' }}>
              {t('auth.account.security_notice_title', 'Important Security Notice')}
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.6 }}>
              {t(
                'auth.account.security_notice_desc',
                'Your data archive contains sensitive information including PII. Please ensure you store this file in a secure location and delete it after use if possible. Each archive link is protected and expires after 7 days for your security.',
              )}
            </Typography>
          </Box>
        </Box>
      </Container>
    </motion.div>
  )
}

export default DataExport
