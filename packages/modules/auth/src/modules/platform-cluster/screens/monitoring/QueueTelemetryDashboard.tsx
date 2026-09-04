import { useState } from 'react'
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  LinearProgress,
  Paper,
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
import Layers from '@mui/icons-material/Layers'
import Replay from '@mui/icons-material/Replay'
import GppMaybe from '@mui/icons-material/GppMaybe'
import PauseCircle from '@mui/icons-material/PauseCircle'
import PowerOff from '@mui/icons-material/PowerOff'
import { useTranslation } from 'react-i18next'
import {
  useQueueTelemetryQuery,
  useQueueJobsQuery,
  useRetryQueueJobMutation,
  useRetryFailedQueueMutation,
} from '../../hooks/useQueueTelemetryQuery'
import { isPlatformScopeError } from '../../services/audit-chain.service'
import { queueSeverity, type QueueSummary } from '../../types/queue.types'

/**
 * Job Queue Telemetry.
 *
 * `/api/health/queue` answers one up/down for the directory-sync queue, which
 * cannot tell an operator whether a GDPR erasure job failed or whether SCIM
 * sync is backing up. This reads per-queue counts and offers a retry.
 *
 * Two things shape how the numbers are presented:
 *
 * - A queue whose worker is disabled still accepts jobs. Its `waiting` count is
 *   the configured state, not an incident — flagging it would make every dark
 *   subsystem look broken, so `queueSeverity` treats it as idle.
 * - Job payloads are never fetched. The backend returns id, attempts, timings
 *   and `failedReason` only, because queue data carries recipient addresses and
 *   one-time codes across every tenant. There is deliberately nothing to expand
 *   into a payload view.
 */

const SEVERITY_COLOR = {
  healthy: 'success',
  warning: 'warning',
  error: 'error',
  idle: 'default',
} as const

export const QueueTelemetryDashboard: React.FC = () => {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<string | null>(null)

  const { data, isLoading, error } = useQueueTelemetryQuery()
  const jobsQuery = useQueueJobsQuery(selected, 'failed', 25)
  const retryJob = useRetryQueueJobMutation()
  const retryFailed = useRetryFailedQueueMutation()

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error && isPlatformScopeError(error)) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert severity='info' icon={<GppMaybe />}>
          <AlertTitle>{t('monitoring.queues.scope_title', 'Platform administrators only')}</AlertTitle>
          {t(
            'monitoring.queues.scope_body',
            'Background queues are shared infrastructure: one queue carries jobs for every organization, so there is no per-organization view of them.',
          )}
        </Alert>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert severity='error'>
          {t('monitoring.queues.error', 'Queue telemetry could not be read. Redis may be down.')}
        </Alert>
      </Container>
    )
  }

  const queues = data?.queues ?? []
  const totals = data?.totals
  const selectedQueue = queues.find((queue) => queue.name === selected) ?? null

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Stack direction='row' alignItems='center' spacing={1.5} sx={{ mb: 1 }}>
        <Layers color='primary' />
        <Typography variant='h4'>{t('monitoring.queues.title', 'Background queues')}</Typography>
      </Stack>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        {t(
          'monitoring.queues.subtitle',
          'Per-queue job counts across the whole worker registry. A failed erasure or provisioning job is an obligation that has silently not been met.',
        )}
      </Typography>

      {data && data.unreachable > 0 && (
        <Alert severity='warning' sx={{ mb: 3 }}>
          {t(
            'monitoring.queues.unreachable',
            '{{count}} queues could not be reached. The figures below cover the rest.',
            { count: data.unreachable },
          )}
        </Alert>
      )}

      {totals && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Total label={t('monitoring.queues.waiting', 'Waiting')} value={totals.waiting} />
          <Total label={t('monitoring.queues.active', 'Active')} value={totals.active} />
          <Total
            label={t('monitoring.queues.failed', 'Failed')}
            value={totals.failed}
            emphasise={totals.failed > 0}
          />
          <Total label={t('monitoring.queues.delayed', 'Delayed')} value={totals.delayed} />
        </Grid>
      )}

      <Card variant='outlined' sx={{ mb: 3 }}>
        <CardContent>
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>{t('monitoring.queues.queue', 'Queue')}</TableCell>
                  <TableCell align='right'>{t('monitoring.queues.waiting', 'Waiting')}</TableCell>
                  <TableCell align='right'>{t('monitoring.queues.active', 'Active')}</TableCell>
                  <TableCell align='right'>{t('monitoring.queues.failed', 'Failed')}</TableCell>
                  <TableCell align='right'>
                    {t('monitoring.queues.completed', 'Completed')}
                  </TableCell>
                  <TableCell>{t('monitoring.queues.state', 'State')}</TableCell>
                  <TableCell align='right'>{t('monitoring.queues.actions', 'Actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {queues.map((queue) => (
                  <QueueRow
                    key={queue.name}
                    queue={queue}
                    selected={queue.name === selected}
                    onSelect={() =>
                      setSelected((current) => (current === queue.name ? null : queue.name))
                    }
                    onRetryAll={() => retryFailed.mutate({ queue: queue.name })}
                    retryPending={retryFailed.isPending}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {retryFailed.data && (
        <Alert severity={retryFailed.data.truncated ? 'warning' : 'success'} sx={{ mb: 3 }}>
          {retryFailed.data.truncated
            ? t(
                'monitoring.queues.retry_truncated',
                'Requeued {{retried}} jobs on {{queue}}; {{remaining}} still failed. Bulk retry is capped per call — run it again.',
                {
                  retried: retryFailed.data.retried,
                  queue: retryFailed.data.queue,
                  remaining: retryFailed.data.remaining,
                },
              )
            : t('monitoring.queues.retry_done', 'Requeued {{retried}} jobs on {{queue}}.', {
                retried: retryFailed.data.retried,
                queue: retryFailed.data.queue,
              })}
        </Alert>
      )}

      {selectedQueue && (
        <Card variant='outlined'>
          <CardContent>
            <Typography variant='h6' sx={{ mb: 0.5 }}>
              {t('monitoring.queues.failed_jobs', 'Failed jobs — {{queue}}', {
                queue: selectedQueue.name,
              })}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              {t(
                'monitoring.queues.no_payload',
                'Job payloads are not shown. Queue data carries recipient addresses and one-time codes across every tenant, so only the failure is returned.',
              )}
            </Typography>

            {jobsQuery.isLoading ? (
              <LinearProgress />
            ) : (jobsQuery.data?.data.length ?? 0) === 0 ? (
              <Typography variant='body2' color='text.secondary'>
                {t('monitoring.queues.no_failed', 'No failed jobs on this queue.')}
              </Typography>
            ) : (
              <TableContainer component={Paper} variant='outlined'>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('monitoring.queues.job', 'Job')}</TableCell>
                      <TableCell align='right'>
                        {t('monitoring.queues.attempts', 'Attempts')}
                      </TableCell>
                      <TableCell>{t('monitoring.queues.failed_at', 'Failed')}</TableCell>
                      <TableCell>{t('monitoring.queues.reason', 'Reason')}</TableCell>
                      <TableCell align='right' />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {jobsQuery.data?.data.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          {job.name} <Typography component='span' color='text.secondary'>#{job.id}</Typography>
                        </TableCell>
                        <TableCell align='right'>{job.attemptsMade}</TableCell>
                        <TableCell>
                          {job.finishedOn ? new Date(job.finishedOn).toLocaleString() : '—'}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 360 }}>
                          <Tooltip title={job.failedReason ?? ''}>
                            <Typography variant='body2' noWrap>
                              {job.failedReason ?? '—'}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell align='right'>
                          <Button
                            size='small'
                            startIcon={<Replay />}
                            disabled={retryJob.isPending}
                            onClick={() =>
                              retryJob.mutate({ queue: selectedQueue.name, jobId: job.id })
                            }
                          >
                            {t('monitoring.queues.retry', 'Retry')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  )
}

const QueueRow: React.FC<{
  queue: QueueSummary
  selected: boolean
  onSelect: () => void
  onRetryAll: () => void
  retryPending: boolean
}> = ({ queue, selected, onSelect, onRetryAll, retryPending }) => {
  const { t } = useTranslation()
  const severity = queueSeverity(queue)
  const counts = queue.counts

  return (
    <TableRow
      hover
      selected={selected}
      onClick={onSelect}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell>
        <Stack direction='row' spacing={1} alignItems='center'>
          <Box>
            <Typography variant='body2'>{queue.name}</Typography>
            <Typography variant='caption' color='text.secondary'>
              {queue.description}
            </Typography>
          </Box>
          {!queue.workerEnabled && (
            <Tooltip
              title={t(
                'monitoring.queues.worker_off',
                'This subsystem is switched off, so nothing drains this queue. A backlog here is expected.',
              )}
            >
              <PowerOff fontSize='small' color='disabled' />
            </Tooltip>
          )}
          {queue.paused && (
            <Tooltip title={t('monitoring.queues.paused', 'Queue is paused')}>
              <PauseCircle fontSize='small' color='warning' />
            </Tooltip>
          )}
        </Stack>
      </TableCell>
      <TableCell align='right'>{counts?.waiting ?? '—'}</TableCell>
      <TableCell align='right'>{counts?.active ?? '—'}</TableCell>
      <TableCell align='right'>
        <Typography
          variant='body2'
          color={counts && counts.failed > 0 ? 'error.main' : 'text.primary'}
        >
          {counts?.failed ?? '—'}
        </Typography>
      </TableCell>
      <TableCell align='right'>{counts?.completed ?? '—'}</TableCell>
      <TableCell>
        <Chip
          size='small'
          color={SEVERITY_COLOR[severity]}
          label={
            queue.reachable
              ? severity
              : t('monitoring.queues.unreachable_label', 'unreachable')
          }
        />
      </TableCell>
      <TableCell align='right'>
        <Button
          size='small'
          startIcon={<Replay />}
          disabled={retryPending || !counts || counts.failed === 0}
          onClick={(event) => {
            event.stopPropagation()
            onRetryAll()
          }}
        >
          {t('monitoring.queues.retry_all', 'Retry failed')}
        </Button>
      </TableCell>
    </TableRow>
  )
}

const Total: React.FC<{ label: string; value: number; emphasise?: boolean }> = ({
  label,
  value,
  emphasise,
}) => (
  <Grid size={{ xs: 6, md: 3 }}>
    <Card variant='outlined'>
      <CardContent>
        <Typography variant='overline' color='text.secondary'>
          {label}
        </Typography>
        <Typography variant='h4' color={emphasise ? 'error.main' : 'text.primary'}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  </Grid>
)

export default QueueTelemetryDashboard
