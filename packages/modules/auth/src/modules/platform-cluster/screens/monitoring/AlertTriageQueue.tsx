import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
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
import NotificationsActive from '@mui/icons-material/NotificationsActive'
import CheckCircle from '@mui/icons-material/CheckCircle'
import DoneAll from '@mui/icons-material/DoneAll'
import Block from '@mui/icons-material/Block'
import ThumbDown from '@mui/icons-material/ThumbDown'
import { useTranslation } from 'react-i18next'
import { useAdminAlertsQuery } from '../../hooks/useAdminMonitoringQuery'
import { useTriageAlertMutation } from '../../hooks/useSecurityIntelQuery'
import {
  ALERT_SEVERITY_ORDER,
  availableTriageActions,
  type AlertSeverity,
  type AlertStatus,
  type SecurityAlert,
  type TriageAction,
} from '../../types/securityIntel.types'

/**
 * Alert Triage Queue.
 *
 * The alerts table previously listed alerts without offering any way to act on
 * them, so the backend's lifecycle — acknowledge, resolve, suppress, and
 * detector feedback — was reachable only through the API.
 *
 * The four actions are not interchangeable, and the UI keeps them distinct:
 *
 * - **Acknowledge** claims the alert. It stays open.
 * - **Resolve** closes it: the thing it warned about was handled.
 * - **Dismiss** suppresses it: real signal, no action warranted. Stored as
 *   `suppressed`.
 * - **False positive** is feedback about the *detector*, not the incident, so it
 *   is applied to the alert's underlying anomaly and is offered only for
 *   detector-raised alerts. Collapsing it into "dismiss" would quietly corrupt
 *   the signal the detector is tuned on.
 *
 * `availableTriageActions` owns which actions apply in which state, so this
 * table and its tests cannot drift apart on that question.
 */

const SEVERITY_COLOR: Record<AlertSeverity, 'error' | 'warning' | 'info' | 'default'> = {
  critical: 'error',
  high: 'error',
  medium: 'warning',
  low: 'info',
  info: 'default',
}

const STATUS_COLOR: Record<AlertStatus, 'error' | 'warning' | 'success' | 'default'> = {
  open: 'error',
  acknowledged: 'warning',
  resolved: 'success',
  suppressed: 'default',
  expired: 'default',
}

const ACTION_META: Record<
  TriageAction,
  { labelKey: string; fallback: string; icon: React.ReactNode; help: string }
> = {
  acknowledge: {
    labelKey: 'monitoring.triage.acknowledge',
    fallback: 'Acknowledge',
    icon: <CheckCircle fontSize='small' />,
    help: 'Claim this alert. It stays open.',
  },
  resolve: {
    labelKey: 'monitoring.triage.resolve',
    fallback: 'Resolve',
    icon: <DoneAll fontSize='small' />,
    help: 'Close it — what it warned about was handled.',
  },
  dismiss: {
    labelKey: 'monitoring.triage.dismiss',
    fallback: 'Dismiss',
    icon: <Block fontSize='small' />,
    help: 'Suppress it — real signal, no action warranted.',
  },
  falsePositive: {
    labelKey: 'monitoring.triage.false_positive',
    fallback: 'False positive',
    icon: <ThumbDown fontSize='small' />,
    help: 'Tell the detector it was wrong. Applies to the underlying anomaly.',
  },
}

export const AlertTriageQueue: React.FC = () => {
  const { t } = useTranslation()
  const [severity, setSeverity] = useState<AlertSeverity | ''>('')
  const [status, setStatus] = useState<AlertStatus | ''>('open')

  const alertsQuery = useAdminAlertsQuery({
    severity: severity || undefined,
    status: status || undefined,
    limit: 100,
  })
  const triage = useTriageAlertMutation()

  const alerts: SecurityAlert[] = useMemo(() => {
    const payload = alertsQuery.data as any
    if (!payload) return []
    const rows = Array.isArray(payload) ? payload : (payload.data ?? [])
    // Highest severity first — the queue is worked from the top, so ordering by
    // creation date would bury a critical under a morning of info alerts.
    return [...rows].sort(
      (a: SecurityAlert, b: SecurityAlert) =>
        ALERT_SEVERITY_ORDER.indexOf(a.severity) - ALERT_SEVERITY_ORDER.indexOf(b.severity),
    )
  }, [alertsQuery.data])

  const counts = useMemo(() => {
    const summary: Record<string, number> = {}
    for (const alert of alerts) {
      summary[alert.severity] = (summary[alert.severity] ?? 0) + 1
    }
    return summary
  }, [alerts])

  if (alertsQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Stack direction='row' alignItems='center' spacing={1.5} sx={{ mb: 1 }}>
        <NotificationsActive color='primary' />
        <Typography variant='h4'>{t('monitoring.triage.title', 'Alert triage')}</Typography>
      </Stack>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        {t(
          'monitoring.triage.subtitle',
          'Work the queue from the top. Dismissing suppresses one alert; marking a false positive tells the detector it was wrong.',
        )}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {ALERT_SEVERITY_ORDER.map((level) => (
          <Grid key={level} size={{ xs: 6, md: 12 / 5 }}>
            <Card variant='outlined'>
              <CardContent>
                <Typography variant='overline' color='text.secondary'>
                  {level}
                </Typography>
                <Typography
                  variant='h4'
                  color={level === 'critical' && counts[level] ? 'error.main' : 'text.primary'}
                >
                  {counts[level] ?? 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {triage.error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {(triage.error as Error).message ||
            t('monitoring.triage.failed', 'The triage action could not be applied.')}
        </Alert>
      )}

      <Card variant='outlined'>
        <CardContent>
          <Stack direction='row' spacing={1} sx={{ mb: 2 }} justifyContent='flex-end'>
            <Select
              size='small'
              displayEmpty
              value={status}
              onChange={(event) => setStatus(event.target.value as AlertStatus | '')}
              inputProps={{ 'aria-label': t('monitoring.triage.filter_status', 'Status') }}
            >
              <MenuItem value=''>{t('monitoring.triage.all_statuses', 'All statuses')}</MenuItem>
              {(Object.keys(STATUS_COLOR) as AlertStatus[]).map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
            <Select
              size='small'
              displayEmpty
              value={severity}
              onChange={(event) => setSeverity(event.target.value as AlertSeverity | '')}
              inputProps={{ 'aria-label': t('monitoring.triage.filter_severity', 'Severity') }}
            >
              <MenuItem value=''>
                {t('monitoring.triage.all_severities', 'All severities')}
              </MenuItem>
              {ALERT_SEVERITY_ORDER.map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </Stack>

          {alerts.length === 0 ? (
            <Typography variant='body2' color='text.secondary'>
              {t('monitoring.triage.empty', 'Nothing in the queue for this filter.')}
            </Typography>
          ) : (
            <TableContainer component={Paper} variant='outlined'>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('monitoring.triage.severity', 'Severity')}</TableCell>
                    <TableCell>{t('monitoring.triage.alert', 'Alert')}</TableCell>
                    <TableCell>{t('monitoring.triage.source', 'Source')}</TableCell>
                    <TableCell>{t('monitoring.triage.raised', 'Raised')}</TableCell>
                    <TableCell>{t('monitoring.triage.status', 'Status')}</TableCell>
                    <TableCell align='right'>{t('monitoring.triage.actions', 'Actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alerts.map((alert) => {
                    const actions = availableTriageActions(alert)
                    return (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <Chip
                            size='small'
                            color={SEVERITY_COLOR[alert.severity] ?? 'default'}
                            label={alert.severity}
                          />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 320 }}>
                          <Typography variant='body2'>{alert.title}</Typography>
                          <Tooltip title={alert.description ?? ''}>
                            <Typography variant='caption' color='text.secondary' noWrap>
                              {alert.description}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>{alert.sourceDetector}</Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {alert.sourceModule}
                          </Typography>
                        </TableCell>
                        <TableCell>{new Date(alert.createdAt).toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip
                            size='small'
                            color={STATUS_COLOR[alert.status] ?? 'default'}
                            label={alert.status}
                          />
                          {alert.acknowledgedBy && (
                            <Typography variant='caption' color='text.secondary' display='block'>
                              {alert.acknowledgedBy}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align='right'>
                          {actions.length === 0 ? (
                            <Typography variant='caption' color='text.secondary'>
                              {t('monitoring.triage.closed', 'Closed')}
                            </Typography>
                          ) : (
                            <ButtonGroup size='small' variant='outlined'>
                              {actions.map((action) => (
                                <Tooltip key={action} title={ACTION_META[action].help}>
                                  <Button
                                    startIcon={ACTION_META[action].icon}
                                    disabled={triage.isPending}
                                    onClick={() =>
                                      triage.mutate({
                                        id: alert.id,
                                        action,
                                        anomalyId: alert.anomalyId,
                                      })
                                    }
                                  >
                                    {t(
                                      ACTION_META[action].labelKey,
                                      ACTION_META[action].fallback,
                                    )}
                                  </Button>
                                </Tooltip>
                              ))}
                            </ButtonGroup>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}

export default AlertTriageQueue
