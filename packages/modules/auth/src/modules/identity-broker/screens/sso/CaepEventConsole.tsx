import { useMemo, useState } from 'react'
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
  Divider,
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
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import PodcastsIcon from '@mui/icons-material/Podcasts'
import SendIcon from '@mui/icons-material/Send'
import ScienceIcon from '@mui/icons-material/Science'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import { useTranslation } from 'react-i18next'
import {
  useBroadcastSSFEvent,
  useSSFConfig,
  useSSFHistory,
  useTestSSFStream,
} from '../../hooks/useSSFQuery'
import {
  SSF_EVENT_TYPES,
  historyRecipientCount,
  historyTimestamp,
  type SSFEventType,
  type SSFHistoryLog,
} from '../../types/ssf.types'

/**
 * CAEP / RISC event console.
 *
 * `/admin/identity/ssf-configuration` configures the stream; this operates it.
 * A security operator can broadcast a session-revoked, credential-change or
 * account-disabled signal to every registered client, send a test signal, and
 * read the history of what has gone out.
 *
 * Three things this screen is careful to state rather than imply:
 *
 * - **Delivery is simulated.** The backend records and audits each broadcast
 *   but marks every recipient `simulated` until live push dispatch is switched
 *   on. Rendering a green "delivered" over that would tell an operator a
 *   session was revoked at the relying party when it was not.
 * - **The history is an audit trail, not a delivery log.** It comes from
 *   `audit_logs` filtered to the SSF actions, so it says what was requested,
 *   not what arrived.
 * - **Inbound signals are not shown.** There is no receiver endpoint in the
 *   backend, so there is nothing to inspect — see the notice below.
 */

/**
 * What each signal tells a receiver. Shown next to the selector because
 * broadcasting the wrong one is not a harmless mistake: `account-disabled`
 * asks every relying party to stop accepting the subject entirely.
 */
const EVENT_HELP: Record<string, string> = {
  'session-revoked':
    "Tells receivers to end the subject's sessions. Use after a compromise or a forced sign-out.",
  'credential-change':
    'Tells receivers a credential changed — a password reset or a new authenticator.',
  'account-disabled':
    'Tells receivers the account is disabled. Broader than a session revocation: it asks them to stop accepting the subject entirely.',
  'risky-login':
    'Tells receivers a sign-in looked risky, so they can step up or re-evaluate their own session.',
}

export const CaepEventConsole: React.FC = () => {
  const { t } = useTranslation()

  const configQuery = useSSFConfig()
  const historyQuery = useSSFHistory()
  const broadcast = useBroadcastSSFEvent()
  const testStream = useTestSSFStream()

  const [eventType, setEventType] = useState<SSFEventType>('session-revoked')
  const [subject, setSubject] = useState('')
  const [reason, setReason] = useState('')

  const config = configQuery.data?.data
  const history: SSFHistoryLog[] = useMemo(() => {
    const payload = historyQuery.data?.data
    return Array.isArray(payload) ? payload : []
  }, [historyQuery.data])

  const supported = config?.events_supported?.length
    ? config.events_supported
    : [...SSF_EVENT_TYPES]

  const broadcastResult = broadcast.data?.data
  const simulated = broadcastResult?.results?.some((entry) => entry.status === 'simulated')

  if (configQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Stack direction='row' alignItems='center' spacing={1.5} sx={{ mb: 1 }}>
        <PodcastsIcon color='primary' />
        <Typography variant='h4'>
          {t('auth.caep.title', 'Shared signals console')}
        </Typography>
      </Stack>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        {t(
          'auth.caep.subtitle',
          'Broadcast CAEP and RISC security events to every registered relying party, and review what has been sent.',
        )}
      </Typography>

      {config && !config.enabled && (
        <Alert severity='warning' sx={{ mb: 3 }}>
          <AlertTitle>{t('auth.caep.stream_off_title', 'Stream is disabled')}</AlertTitle>
          {t(
            'auth.caep.stream_off_body',
            'The shared signals stream is switched off in the SSF configuration. Broadcasts are still recorded in the audit trail but no receiver is configured to act on them.',
          )}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant='outlined' sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 0.5 }}>
                {t('auth.caep.broadcast_title', 'Broadcast a signal')}
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                {t(
                  'auth.caep.broadcast_help',
                  'Sent to every active OIDC client. Recorded in the audit trail with the reason you give.',
                )}
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Select
                    fullWidth
                    size='small'
                    value={eventType}
                    onChange={(event) => setEventType(event.target.value as SSFEventType)}
                    inputProps={{ 'aria-label': t('auth.caep.event_type', 'Event type') }}
                  >
                    {supported.map((value) => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                  {EVENT_HELP[eventType] && (
                    <Stack direction='row' spacing={0.5} sx={{ mt: 0.75 }} alignItems='flex-start'>
                      <InfoOutlined fontSize='inherit' color='action' sx={{ mt: 0.3 }} />
                      <Typography variant='caption' color='text.secondary'>
                        {t(`auth.caep.help.${eventType}`, EVENT_HELP[eventType])}
                      </Typography>
                    </Stack>
                  )}
                </Box>

                <TextField
                  fullWidth
                  size='small'
                  required
                  label={t('auth.caep.subject', 'Subject')}
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  helperText={t(
                    'auth.caep.subject_help',
                    'Who the signal is about — an identifier the receivers can resolve, such as the email or subject id.',
                  )}
                />

                <TextField
                  fullWidth
                  size='small'
                  multiline
                  minRows={2}
                  label={t('auth.caep.reason', 'Reason')}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  helperText={t(
                    'auth.caep.reason_help',
                    'Recorded in the audit trail. Write what a colleague reading this in six months would need.',
                  )}
                />

                <Stack direction='row' spacing={1}>
                  <Button
                    variant='contained'
                    startIcon={<SendIcon />}
                    disabled={!subject.trim() || broadcast.isPending}
                    onClick={() =>
                      broadcast.mutate(
                        { eventType, subject: subject.trim(), reason: reason.trim() || undefined },
                        { onSuccess: () => setReason('') },
                      )
                    }
                  >
                    {t('auth.caep.broadcast', 'Broadcast')}
                  </Button>
                  <Button
                    startIcon={<ScienceIcon />}
                    disabled={testStream.isPending}
                    onClick={() => testStream.mutate()}
                  >
                    {t('auth.caep.test', 'Send test signal')}
                  </Button>
                </Stack>
              </Stack>

              {broadcast.error && (
                <Alert severity='error' sx={{ mt: 2 }}>
                  {t(
                    'auth.caep.broadcast_failed',
                    'The signal could not be broadcast. An event type and a subject are both required.',
                  )}
                </Alert>
              )}

              {broadcastResult && (
                <Alert severity={simulated ? 'info' : 'success'} sx={{ mt: 2 }}>
                  <AlertTitle>
                    {simulated
                      ? t('auth.caep.recorded_not_delivered', 'Recorded — delivery simulated')
                      : t('auth.caep.broadcast_sent', 'Signal broadcast')}
                  </AlertTitle>
                  {simulated
                    ? t(
                        'auth.caep.simulated_body',
                        'The backend recorded and audited this signal, but marks each recipient as simulated: live push dispatch is not switched on, so no relying party has acted on it.',
                      )
                    : t('auth.caep.sent_body', 'Sent to {{count}} registered clients.', {
                        count: broadcastResult.clientCount ?? broadcastResult.results?.length ?? 0,
                      })}
                </Alert>
              )}

              {testStream.data && (
                <Alert severity='success' sx={{ mt: 2 }}>
                  {t('auth.caep.test_sent', 'Test signal recorded.')}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card variant='outlined' sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant='h6' sx={{ mb: 0.5 }}>
                {t('auth.caep.inbound_title', 'Inbound signals')}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {/* Deliberately empty rather than a placeholder table. An
                  inspector showing nothing looks like "no attacks"; this says
                  "not receiving", which is the true and more useful state. */}
              <Alert severity='info'>
                <AlertTitle>{t('auth.caep.inbound_none_title', 'Not yet receiving')}</AlertTitle>
                {t(
                  'auth.caep.inbound_none_body',
                  'This deployment transmits shared signals but does not receive them: there is no inbound RISC/CAEP endpoint, so third-party account-compromised or account-disabled signals are not accepted or stored. An empty inspector here would read as “no incoming threats” rather than “not listening”.',
                )}
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card variant='outlined'>
        <CardContent>
          <Typography variant='h6' sx={{ mb: 0.5 }}>
            {t('auth.caep.history_title', 'Signal history')}
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            {t(
              'auth.caep.history_help',
              'From the audit trail, so it records what was requested rather than what arrived.',
            )}
          </Typography>

          {historyQuery.isLoading ? (
            <CircularProgress size={24} />
          ) : history.length === 0 ? (
            <Typography variant='body2' color='text.secondary'>
              {t('auth.caep.history_empty', 'No signals broadcast yet.')}
            </Typography>
          ) : (
            <TableContainer component={Paper} variant='outlined'>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('auth.caep.when', 'When')}</TableCell>
                    <TableCell>{t('auth.caep.kind', 'Kind')}</TableCell>
                    <TableCell>{t('auth.caep.event_type', 'Event type')}</TableCell>
                    <TableCell>{t('auth.caep.subject', 'Subject')}</TableCell>
                    <TableCell align='right'>
                      {t('auth.caep.recipients', 'Recipients')}
                    </TableCell>
                    <TableCell>{t('auth.caep.reason', 'Reason')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((log) => {
                    const stamp = historyTimestamp(log)
                    return (
                      <TableRow key={log.id}>
                        <TableCell>{stamp ? new Date(stamp).toLocaleString() : '—'}</TableCell>
                        <TableCell>
                          <Chip
                            size='small'
                            variant='outlined'
                            color={log.action === 'SSF_SIGNAL_BROADCAST' ? 'primary' : 'default'}
                            label={
                              log.action === 'SSF_SIGNAL_BROADCAST'
                                ? t('auth.caep.kind_broadcast', 'Broadcast')
                                : t('auth.caep.kind_test', 'Test')
                            }
                          />
                        </TableCell>
                        <TableCell>{log.metadata?.eventType ?? '—'}</TableCell>
                        <TableCell>{log.metadata?.subject ?? '—'}</TableCell>
                        <TableCell align='right'>{historyRecipientCount(log)}</TableCell>
                        <TableCell sx={{ maxWidth: 260 }}>
                          <Tooltip title={log.metadata?.reason ?? ''}>
                            <Typography variant='body2' noWrap>
                              {log.metadata?.reason ?? '—'}
                            </Typography>
                          </Tooltip>
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

export default CaepEventConsole
