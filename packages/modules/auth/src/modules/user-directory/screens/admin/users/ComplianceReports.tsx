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
} from '@mui/material'
import Gavel from '@mui/icons-material/Gavel'
import Download from '@mui/icons-material/Download'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Stack direction='row' alignItems='center' spacing={1.5} sx={{ mb: 1 }}>
        <Gavel color='primary' />
        <Typography variant='h4'>
          {t('admin.compliance.title', 'Compliance reports')}
        </Typography>
      </Stack>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        {t(
          'admin.compliance.subtitle',
          'The Article 30 register of processing activities and the data-retention summary.',
        )}
      </Typography>

      <Card variant='outlined' sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent='space-between'
            alignItems={{ sm: 'center' }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant='h6'>
                {t('admin.compliance.article30', 'Records of processing activities')}
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
            >
              {t('admin.compliance.download_csv', 'Download CSV')}
            </Button>
          </Stack>

          {activities.length === 0 ? (
            <Typography variant='body2' color='text.secondary'>
              {t('admin.compliance.no_activities', 'No processing activities are registered.')}
            </Typography>
          ) : (
            <TableContainer component={Paper} variant='outlined'>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('admin.compliance.activity', 'Activity')}</TableCell>
                    <TableCell>{t('admin.compliance.purpose', 'Purpose')}</TableCell>
                    <TableCell>{t('admin.compliance.legal_basis', 'Legal basis')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activities.map((activity) => (
                    <TableRow key={activity.name}>
                      <TableCell>{activity.name}</TableCell>
                      <TableCell>{activity.purpose}</TableCell>
                      <TableCell>{activity.legalBasis}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Alert severity='info' sx={{ mt: 2 }}>
            {t(
              'admin.compliance.article30_static',
              'This register is defined in the backend rather than configured, so it changes only with a deploy. Keep it reviewed alongside any change to what the platform processes.',
            )}
          </Alert>
        </CardContent>
      </Card>

      <Card variant='outlined'>
        <CardContent>
          <Typography variant='h6' sx={{ mb: 0.5 }}>
            {t('admin.compliance.retention', 'Data retention')}
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            {retention?.retentionPolicy ??
              t('admin.compliance.no_policy', 'No retention policy reported.')}
          </Typography>

          <Alert severity='warning' sx={{ mb: 2 }}>
            <AlertTitle>
              {t('admin.compliance.placeholder_title', 'Placeholder figures')}
            </AlertTitle>
            {t(
              'admin.compliance.placeholder_body',
              'The retention endpoint returns fixed values rather than querying the database. Do not use these numbers as audit evidence until it reports real counts.',
            )}
          </Alert>

          {retention && (
            <Grid container spacing={2}>
              <Metric
                label={t('admin.compliance.total_users', 'Total users')}
                value={retention.totalUsers}
              />
              <Metric
                label={t('admin.compliance.active_users', 'Active')}
                value={retention.activeUsers}
              />
              <Metric
                label={t('admin.compliance.stale_users', 'Stale')}
                value={retention.staleUsers}
              />
              <Metric
                label={t('admin.compliance.scheduled_purges', 'Scheduled purges')}
                value={retention.scheduledPurges}
              />
            </Grid>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}

const Metric: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <Grid size={{ xs: 6, md: 3 }}>
    <Card variant='outlined'>
      <CardContent>
        <Typography variant='overline' color='text.secondary'>
          {label}
        </Typography>
        <Typography variant='h5'>{value}</Typography>
      </CardContent>
    </Card>
  </Grid>
)

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
