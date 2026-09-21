import React from 'react'
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import ArrowBack from '@mui/icons-material/ArrowBack'
import Gavel from '@mui/icons-material/Gavel'
import Download from '@mui/icons-material/Download'
import People from '@mui/icons-material/People'
import PersonOutline from '@mui/icons-material/PersonOutline'
import AccessTime from '@mui/icons-material/AccessTime'
import DeleteSweep from '@mui/icons-material/DeleteSweep'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { buildLayoutSurfaceEffect } from '@cap/layout'
import { getTenantThemeEffects } from '@cap/theme'
import Path from '../../path'
import {
  useProcessingActivitiesQuery,
  useRetentionReportQuery,
} from '../../../hooks/useComplianceQuery'
import type { ProcessingActivity } from '../../../types/compliance.types'

/**
 * Compliance reports — the Article 30 register and the retention summary.
 *
 * The download is built in the browser from the fetched rows rather than from a
 * server-rendered file, because the backend has no export endpoint for either
 * report. Doing it here keeps the artefact identical to what is on screen; a
 * separately-generated file could drift from it.
 *
 * The retention figures are labelled as placeholders. `retentionReport` returns
 * fixed numbers in the backend today rather than querying anything, and a
 * retention report shown without that caveat is exactly the kind of thing that
 * gets pasted into an audit response as evidence.
 */
export const ComplianceReports: React.FC = () => {
  const { t } = useTranslation('common')
  const theme = useTheme()
  const navigate = useNavigate()
  const activitiesQuery = useProcessingActivitiesQuery()
  const retentionQuery = useRetentionReportQuery()

  const activities = activitiesQuery.data?.activities ?? []
  const retention = retentionQuery.data

  const downloadActivities = () => {
    const header = ['Activity', 'Purpose', 'Legal basis']
    const rows = activities.map((activity: ProcessingActivity) => [
      activity.name,
      activity.purpose,
      activity.legalBasis,
    ])
    downloadCsv('article-30-records-of-processing.csv', [header, ...rows])
  }

  if (activitiesQuery.isLoading || retentionQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Container maxWidth='lg' sx={{ py: 4 }}>
        {/* Navigation & Back Action */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(Path.admin.users.list)}
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
            {t('auth.admin.backToUsers', 'Back to Users')}
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
            <Gavel sx={{ fontSize: 32 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 240 }}>
            <Typography variant='h4' sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>
              {t('admin.compliance.title', 'Compliance Reports')}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {t(
                'admin.compliance.subtitle',
                'The Article 30 register of processing activities and the data-retention summary.',
              )}
            </Typography>
          </Box>
        </Box>

        {/* Section 1: Article 30 Register */}
        <Card
          variant='outlined'
          sx={{
            mb: 4,
            borderRadius: 'var(--sf-radius-lg, 16px)',
            borderColor: theme.palette.divider,
            ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent='space-between'
              alignItems={{ sm: 'center' }}
              spacing={2}
              sx={{ mb: 2.5 }}
            >
              <Box>
                <Typography variant='h6' sx={{ fontWeight: 700 }}>
                  {t('admin.compliance.article30', 'Records of Processing Activities')}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {t(
                    'admin.compliance.article30_help',
                    'GDPR Article 30. What is processed, why, and on what legal basis.',
                  )}
                </Typography>
              </Box>
              <Button
                startIcon={<Download />}
                variant='outlined'
                disabled={activities.length === 0}
                onClick={downloadActivities}
                sx={{
                  minHeight: 44,
                  px: 2.5,
                  borderRadius: 'var(--sf-radius-md, 8px)',
                  textTransform: 'none',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {t('admin.compliance.download_csv', 'Download CSV')}
              </Button>
            </Stack>

            {activities.length === 0 ? (
              <Alert
                severity='info'
                sx={{
                  borderRadius: 'var(--sf-radius-md, 12px)',
                  ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
                }}
              >
                {t('admin.compliance.no_activities', 'No processing activities are registered.')}
              </Alert>
            ) : (
              <TableContainer
                component={Paper}
                variant='outlined'
                sx={{
                  borderRadius: 'var(--sf-radius-md, 12px)',
                  borderColor: theme.palette.divider,
                  overflow: 'hidden',
                }}
              >
                <Table size='medium'>
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
                        {t('admin.compliance.activity', 'Activity')}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {t('admin.compliance.purpose', 'Purpose')}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {t('admin.compliance.legal_basis', 'Legal Basis')}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activities.map((activity) => (
                      <TableRow
                        key={activity.name}
                        hover
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 600, py: 1.75 }}>
                          {activity.name}
                        </TableCell>
                        <TableCell sx={{ py: 1.75 }}>{activity.purpose}</TableCell>
                        <TableCell sx={{ py: 1.75 }}>{activity.legalBasis}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Alert
              severity='info'
              sx={{
                mt: 2.5,
                borderRadius: 'var(--sf-radius-md, 12px)',
                ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
              }}
            >
              {t(
                'admin.compliance.article30_static',
                'This register is defined in the backend rather than configured, so it changes only with a deploy. Keep it reviewed alongside any change to what the platform processes.',
              )}
            </Alert>
          </CardContent>
        </Card>

        {/* Section 2: Data Retention Summary */}
        <Card
          variant='outlined'
          sx={{
            borderRadius: 'var(--sf-radius-lg, 16px)',
            borderColor: theme.palette.divider,
            ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant='h6' sx={{ fontWeight: 700, mb: 0.5 }}>
              {t('admin.compliance.retention', 'Data Retention')}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2.5 }}>
              {retention?.retentionPolicy ??
                t('admin.compliance.no_policy', 'No retention policy reported.')}
            </Typography>

            <Alert
              severity='warning'
              sx={{
                mb: 3,
                borderRadius: 'var(--sf-radius-md, 12px)',
                ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
              }}
            >
              <AlertTitle sx={{ fontWeight: 700 }}>
                {t('admin.compliance.placeholder_title', 'Placeholder Figures')}
              </AlertTitle>
              {t(
                'admin.compliance.placeholder_body',
                'The retention endpoint returns fixed values rather than querying the database. Do not use these numbers as audit evidence until it reports real counts.',
              )}
            </Alert>

            {retention && (
              <Grid container spacing={2.5}>
                <Metric
                  label={t('admin.compliance.total_users', 'Total users')}
                  value={retention.totalUsers}
                  icon={<People color='primary' />}
                />
                <Metric
                  label={t('admin.compliance.active_users', 'Active')}
                  value={retention.activeUsers}
                  icon={<PersonOutline color='success' />}
                />
                <Metric
                  label={t('admin.compliance.stale_users', 'Stale')}
                  value={retention.staleUsers}
                  icon={<AccessTime color='warning' />}
                />
                <Metric
                  label={t('admin.compliance.scheduled_purges', 'Scheduled purges')}
                  value={retention.scheduledPurges}
                  icon={<DeleteSweep color='error' />}
                />
              </Grid>
            )}
          </CardContent>
        </Card>
      </Container>
    </motion.div>
  )
}

const Metric: React.FC<{ label: string; value: number; icon: React.ReactNode }> = ({
  label,
  value,
  icon,
}) => {
  const theme = useTheme()
  return (
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <Card
        variant='outlined'
        sx={{
          borderRadius: 'var(--sf-radius-md, 12px)',
          borderColor: theme.palette.divider,
          ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography
              variant='caption'
              sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}
            >
              {label}
            </Typography>
            {icon}
          </Box>
          <Typography variant='h4' sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            {value.toLocaleString()}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  )
}

/**
 * Build and download a CSV in the browser.
 *
 * Every field is quoted and internal quotes doubled — an unescaped comma or
 * quote in a purpose string would silently shift columns, and a register whose
 * legal-basis column has slipped by one is worse than no register.
 */
function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default ComplianceReports
