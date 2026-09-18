import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import Insights from '@mui/icons-material/Insights'
import TravelExplore from '@mui/icons-material/TravelExplore'
import Refresh from '@mui/icons-material/Refresh'
import RadarIcon from '@mui/icons-material/Radar'
import { useTranslation } from 'react-i18next'
import {
  useAnomaliesQuery,
  useAnomalyStatsQuery,
  useDetectAnomaliesMutation,
  useRefreshBaselineMutation,
  useUpdateAnomalyStatusMutation,
} from '../../hooks/useSecurityIntelQuery'
import { useAdminSessionStatsQuery } from '../../hooks/useAdminMonitoringQuery'
import type { Anomaly, AnomalyStatus } from '../../types/securityIntel.types'

/**
 * Anomaly & Threat Intel Dashboard.
 *
 * Renders the persisted `Anomaly` records — detector type, the baseline it
 * scored against, what was actually observed, and the resulting deviation —
 * plus a geographic view of recent sign-ins.
 *
 * The geographic panel is built from `admin.statistics.sessionStatistics`,
 * whose `geographicBreakdown` comes from real `session_logs` rows. It is
 * deliberately **not** built from `admin.threatIntel.heatmap`, which returns an
 * empty array unconditionally in the backend today: a map fed by a stub would
 * look like "no threats" rather than "no data", which is the more dangerous of
 * the two to show a security operator.
 */

const STATUS_COLOR: Record<AnomalyStatus, 'error' | 'warning' | 'info' | 'success' | 'default'> = {
  detected: 'error',
  investigating: 'warning',
  confirmed: 'error',
  false_positive: 'default',
  resolved: 'success',
}

const STATUS_OPTIONS: AnomalyStatus[] = [
  'detected',
  'investigating',
  'confirmed',
  'resolved',
  'false_positive',
]

/**
 * Detector types whose findings are a travel/geography claim. Used only to pick
 * the right icon and explanation — an unknown type still renders, it just gets
 * the generic treatment rather than being dropped.
 */
const GEO_DETECTORS = new Set(['impossible_travel', 'geo_velocity', 'new_country'])

export const AnomalyDashboard: React.FC = () => {
  const { t } = useTranslation()
  const [status, setStatus] = useState<AnomalyStatus | ''>('')

  const anomaliesQuery = useAnomaliesQuery({ status: status || undefined, limit: 50 })
  const statsQuery = useAnomalyStatsQuery()
  const sessionStats = useAdminSessionStatsQuery()
  const detectMutation = useDetectAnomaliesMutation()
  const baselineMutation = useRefreshBaselineMutation()
  const updateStatus = useUpdateAnomalyStatusMutation()

  const anomalies: Anomaly[] = useMemo(() => {
    const payload = anomaliesQuery.data as any
    if (!payload) return []
    // Lucid paginators serialise as `{ data, meta }`; a plain array is also
    // accepted so a filtered/unpaginated response does not blank the table.
    return Array.isArray(payload) ? payload : (payload.data ?? [])
  }, [anomaliesQuery.data])

  const geography = sessionStats.data?.geographicBreakdown ?? []
  const geoMax = geography.reduce((max, point) => Math.max(max, point.count), 0)

  const byType = statsQuery.data?.byType ?? []

  if (anomaliesQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent='space-between'
        alignItems={{ sm: 'center' }}
        spacing={2}
        sx={{ mb: 1 }}
      >
        <Stack direction='row' alignItems='center' spacing={1.5}>
          <Insights color='primary' />
          <Typography variant='h4'>
            {t('monitoring.anomalies.title', 'Anomaly detection')}
          </Typography>
        </Stack>
        <Stack direction='row' spacing={1}>
          <Button
            size='small'
            startIcon={<Refresh />}
            disabled={baselineMutation.isPending}
            onClick={() => baselineMutation.mutate()}
          >
            {t('monitoring.anomalies.refresh_baseline', 'Recompute baseline')}
          </Button>
          <Button
            size='small'
            variant='contained'
            startIcon={<RadarIcon />}
            disabled={detectMutation.isPending}
            onClick={() => detectMutation.mutate()}
          >
            {t('monitoring.anomalies.detect', 'Run detection')}
          </Button>
        </Stack>
      </Stack>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        {t(
          'monitoring.anomalies.subtitle',
          'Each finding records the baseline it was scored against and what was actually observed, so a detection can be judged rather than just trusted.',
        )}
      </Typography>

      {detectMutation.isPending && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant='outlined' sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant='overline' color='text.secondary'>
                {t('monitoring.anomalies.by_type', 'Detections by type')}
              </Typography>
              {byType.length === 0 ? (
                <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                  {t('monitoring.anomalies.no_detections', 'No detections recorded.')}
                </Typography>
              ) : (
                <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                  {byType.map((entry) => {
                    const count = Number(entry.count)
                    const max = Math.max(...byType.map((item) => Number(item.count)), 1)
                    return (
                      <Box key={entry.type}>
                        <Stack direction='row' justifyContent='space-between'>
                          <Typography variant='body2'>{entry.type}</Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {count}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant='determinate'
                          value={(count / max) * 100}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    )
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant='outlined' sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction='row' spacing={1} alignItems='center'>
                <TravelExplore fontSize='small' color='action' />
                <Typography variant='overline' color='text.secondary'>
                  {t('monitoring.anomalies.geography', 'Sign-ins by country')}
                </Typography>
              </Stack>
              {geography.length === 0 ? (
                <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                  {t('monitoring.anomalies.no_geography', 'No geolocated sessions recorded.')}
                </Typography>
              ) : (
                <Stack spacing={1} sx={{ mt: 1.5 }}>
                  {geography.slice(0, 8).map((point) => (
                    <Box key={point.country}>
                      <Stack direction='row' justifyContent='space-between'>
                        <Typography variant='body2'>{point.country}</Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {point.count}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant='determinate'
                        value={geoMax ? (point.count / geoMax) * 100 : 0}
                        color='secondary'
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card variant='outlined'>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent='space-between'
            alignItems={{ sm: 'center' }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Typography variant='h6'>
              {t('monitoring.anomalies.queue', 'Detections')}
            </Typography>
            <Select
              size='small'
              displayEmpty
              value={status}
              onChange={(event) => setStatus(event.target.value as AnomalyStatus | '')}
              inputProps={{ 'aria-label': t('monitoring.anomalies.filter', 'Filter by status') }}
            >
              <MenuItem value=''>{t('monitoring.anomalies.all', 'All statuses')}</MenuItem>
              {STATUS_OPTIONS.map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </Stack>

          {updateStatus.error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {t('monitoring.anomalies.update_failed', 'The anomaly could not be updated.')}
            </Alert>
          )}

          {anomalies.length === 0 ? (
            <Typography variant='body2' color='text.secondary'>
              {t('monitoring.anomalies.empty', 'Nothing detected for this filter.')}
            </Typography>
          ) : (
            <TableContainer component={Paper} variant='outlined'>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('monitoring.anomalies.detected_at', 'Detected')}</TableCell>
                    <TableCell>{t('monitoring.anomalies.type', 'Detector')}</TableCell>
                    <TableCell>{t('monitoring.anomalies.observed', 'Baseline → observed')}</TableCell>
                    <TableCell align='right'>{t('monitoring.anomalies.score', 'Score')}</TableCell>
                    <TableCell>{t('monitoring.anomalies.status', 'Status')}</TableCell>
                    <TableCell align='right'>{t('monitoring.anomalies.triage', 'Triage')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {anomalies.map((anomaly) => (
                    <TableRow key={anomaly.id}>
                      <TableCell>{new Date(anomaly.detectedAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Stack direction='row' spacing={0.5} alignItems='center'>
                          {GEO_DETECTORS.has(anomaly.type) && (
                            <Tooltip
                              title={t(
                                'monitoring.anomalies.geo_detector',
                                'A geographic / travel-velocity finding',
                              )}
                            >
                              <TravelExplore fontSize='small' color='action' />
                            </Tooltip>
                          )}
                          <span>{anomaly.type}</span>
                        </Stack>
                        {anomaly.affectedIp && (
                          <Typography variant='caption' color='text.secondary'>
                            {anomaly.affectedIp}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <DeviationCell anomaly={anomaly} />
                      </TableCell>
                      <TableCell align='right'>{anomaly.score}</TableCell>
                      <TableCell>
                        <Chip
                          size='small'
                          color={STATUS_COLOR[anomaly.status] ?? 'default'}
                          label={anomaly.status}
                        />
                      </TableCell>
                      <TableCell align='right'>
                        <Select
                          size='small'
                          value=''
                          displayEmpty
                          disabled={updateStatus.isPending}
                          onChange={(event) =>
                            updateStatus.mutate({
                              id: anomaly.id,
                              status: event.target.value as AnomalyStatus,
                            })
                          }
                          inputProps={{
                            'aria-label': t('monitoring.anomalies.set_status', 'Set status'),
                          }}
                        >
                          <MenuItem value='' disabled>
                            {t('monitoring.anomalies.set_status', 'Set status')}
                          </MenuItem>
                          {STATUS_OPTIONS.filter((value) => value !== anomaly.status).map(
                            (value) => (
                              <MenuItem key={value} value={value}>
                                {value}
                              </MenuItem>
                            ),
                          )}
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}

/**
 * "What normal looked like → what happened." Falls back to the raw metric names
 * when the detector recorded no numbers, rather than rendering an empty cell
 * that reads as missing data.
 */
const DeviationCell: React.FC<{ anomaly: Anomaly }> = ({ anomaly }) => {
  const { t } = useTranslation()

  if (anomaly.baselineExpectedValue === null && anomaly.observedValue === null) {
    return (
      <Typography variant='body2' color='text.secondary'>
        {anomaly.observedMetric ?? t('monitoring.anomalies.no_metric', 'No metric recorded')}
      </Typography>
    )
  }

  return (
    <Box>
      <Typography variant='body2'>
        {anomaly.baselineExpectedValue ?? '—'} → {anomaly.observedValue ?? '—'}
        {anomaly.deviationPercent !== null && (
          <Typography component='span' variant='body2' color='error.main'>
            {' '}
            ({anomaly.deviationPercent > 0 ? '+' : ''}
            {anomaly.deviationPercent}%)
          </Typography>
        )}
      </Typography>
      {anomaly.baselineSampleSize !== null && (
        <Typography variant='caption' color='text.secondary'>
          {t('monitoring.anomalies.baseline_from', 'baseline from {{n}} samples over {{days}}d', {
            n: anomaly.baselineSampleSize,
            days: anomaly.baselineWindowDays ?? '—',
          })}
        </Typography>
      )}
    </Box>
  )
}

export default AnomalyDashboard
