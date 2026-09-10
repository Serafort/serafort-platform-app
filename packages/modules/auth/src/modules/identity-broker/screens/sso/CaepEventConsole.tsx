import { useMemo, useState } from 'react'
import {
  Alert,
  AlertTitle,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
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
import { alpha, useTheme } from '@mui/material/styles'
import PodcastsIcon from '@mui/icons-material/Podcasts'
import SendIcon from '@mui/icons-material/Send'
import ScienceIcon from '@mui/icons-material/Science'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import ArrowBack from '@mui/icons-material/ArrowBack'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import Path from '../path'
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
  const theme = useTheme()

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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    )
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}
    >
      {/* Back button */}
      <Box sx={{ mb: 2 }}>
        <Button
          component={RouterLink}
          to={Path.ssfConfiguration}
          startIcon={<ArrowBack />}
          sx={{
            p: 1,
            minHeight: 44,
            color: 'text.secondary',
            textTransform: 'none',
            fontWeight: 700,
            '&:hover': { color: 'primary.main', bgcolor: 'transparent' },
          }}
        >
          {t('auth.common.back', 'Back to SSF Configuration')}
        </Button>
      </Box>

      {/* Header section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          mb: 4,
          gap: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              borderRadius: 'var(--sf-radius-lg, 24px)',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
            }}
          >
            <PodcastsIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography
              variant='h4'
              sx={{
                fontWeight: 900,
                letterSpacing: '-0.027em',
                mb: 0.5,
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              {t('auth.caep.title', 'Shared signals console')}
            </Typography>
            <Typography variant='body1' color='text.secondary' sx={{ fontWeight: 500 }}>
              {t(
                'auth.caep.subtitle',
                'Broadcast CAEP and RISC security events to every registered relying party, and review what has been sent.',
              )}
            </Typography>
          </Box>
        </Box>
      </Box>

      {config && !config.enabled && (
        <Alert severity='warning' sx={{ mb: 3, borderRadius: 'var(--sf-radius-md, 10px)' }}>
          <AlertTitle>{t('auth.caep.stream_off_title', 'Stream is disabled')}</AlertTitle>
          {t(
            'auth.caep.stream_off_body',
            'The shared signals stream is switched off in the SSF configuration. Broadcasts are still recorded in the audit trail but no receiver is configured to act on them.',
          )}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card
            variant='outlined'
            sx={{
              height: '100%',
              borderRadius: 'var(--sf-radius-lg, 16px)',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Typography variant='h6' sx={{ fontWeight: 800, mb: 0.5 }}>
                {t('auth.caep.broadcast_title', 'Broadcast a signal')}
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3, fontWeight: 500 }}>
                {t(
                  'auth.caep.broadcast_help',
                  'Sent to every active OIDC client. Recorded in the audit trail with the reason you give.',
                )}
              </Typography>

              <Stack spacing={2.5}>
                <Box>
                  <Select
                    fullWidth
                    size='small'
                    value={eventType}
                    onChange={(event) => setEventType(event.target.value as SSFEventType)}
                    inputProps={{ 'aria-label': t('auth.caep.event_type', 'Event type') }}
                    sx={{ borderRadius: 'var(--sf-radius-md, 8px)', fontWeight: 600 }}
                  >
                    {supported.map((value) => (
                      <MenuItem key={value} value={value} sx={{ fontWeight: 600 }}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                  {EVENT_HELP[eventType] && (
                    <Stack direction='row' spacing={0.75} sx={{ mt: 1 }} alignItems='flex-start'>
                      <InfoOutlined fontSize='small' color='action' sx={{ mt: 0.2 }} />
                      <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 500 }}>
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
                  slotProps={{
                    input: { sx: { borderRadius: 'var(--sf-radius-md, 8px)', fontWeight: 600 } },
                    inputLabel: { sx: { fontWeight: 600 } },
                  }}
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
                  slotProps={{
                    input: { sx: { borderRadius: 'var(--sf-radius-md, 8px)', fontWeight: 600 } },
                    inputLabel: { sx: { fontWeight: 600 } },
                  }}
                />

                <Stack direction='row' spacing={1.5} sx={{ pt: 1 }}>
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
                    sx={{
                      minHeight: 48,
                      px: 3,
                      borderRadius: 'var(--sf-radius-md, 8px)',
                      fontWeight: 800,
                      textTransform: 'none',
                    }}
                  >
                    {t('auth.caep.broadcast', 'Broadcast')}
                  </Button>
                  <Button
                    variant='outlined'
                    startIcon={<ScienceIcon />}
                    disabled={testStream.isPending}
                    onClick={() => testStream.mutate()}
                    sx={{
                      minHeight: 44,
                      px: 2.5,
                      borderRadius: 'var(--sf-radius-md, 8px)',
                      fontWeight: 700,
                      textTransform: 'none',
                    }}
                  >
                    {t('auth.caep.test', 'Send test signal')}
                  </Button>
                </Stack>
              </Stack>

              {broadcast.error && (
                <Alert severity='error' sx={{ mt: 2.5, borderRadius: 'var(--sf-radius-md, 10px)' }}>
                  {t(
                    'auth.caep.broadcast_failed',
                    'The signal could not be broadcast. An event type and a subject are both required.',
                  )}
                </Alert>
              )}

              {broadcastResult && (
                <Alert
                  severity={simulated ? 'info' : 'success'}
                  sx={{ mt: 2.5, borderRadius: 'var(--sf-radius-md, 10px)' }}
                >
                  <AlertTitle sx={{ fontWeight: 800 }}>
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
                <Alert severity='success' sx={{ mt: 2.5, borderRadius: 'var(--sf-radius-md, 10px)' }}>
                  {t('auth.caep.test_sent', 'Test signal recorded.')}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            variant='outlined'
            sx={{
              height: '100%',
              borderRadius: 'var(--sf-radius-lg, 16px)',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Typography variant='h6' sx={{ fontWeight: 800, mb: 0.5 }}>
                {t('auth.caep.inbound_title', 'Inbound signals')}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Alert severity='info' sx={{ borderRadius: 'var(--sf-radius-md, 10px)' }}>
                <AlertTitle sx={{ fontWeight: 800 }}>
                  {t('auth.caep.inbound_none_title', 'Not yet receiving')}
                </AlertTitle>
                {t(
                  'auth.caep.inbound_none_body',
                  'This deployment transmits shared signals but does not receive them: there is no inbound RISC/CAEP endpoint, so third-party account-compromised or account-disabled signals are not accepted or stored. An empty inspector here would read as “no incoming threats” rather than “not listening”.',
                )}
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card
        variant='outlined'
        sx={{
          borderRadius: 'var(--sf-radius-lg, 16px)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Typography variant='h6' sx={{ fontWeight: 800, mb: 0.5 }}>
            {t('auth.caep.history_title', 'Signal history')}
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3, fontWeight: 500 }}>
            {t(
              'auth.caep.history_help',
              'From the audit trail, so it records what was requested rather than what arrived.',
            )}
          </Typography>

          {historyQuery.isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} thickness={4} />
            </Box>
          ) : history.length === 0 ? (
            <Typography variant='body2' color='text.secondary' sx={{ py: 2 }}>
              {t('auth.caep.history_empty', 'No signals broadcast yet.')}
            </Typography>
          ) : (
            <TableContainer
              component={Paper}
              variant='outlined'
              sx={{ borderRadius: 'var(--sf-radius-md, 12px)', overflow: 'hidden' }}
            >
              <Table size='small'>
                <TableHead sx={{ bgcolor: alpha(theme.palette.action.hover, 0.5) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, py: 1.5 }}>
                      {t('auth.caep.when', 'When')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>
                      {t('auth.caep.kind', 'Kind')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>
                      {t('auth.caep.event_type', 'Event type')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>
                      {t('auth.caep.subject', 'Subject')}
                    </TableCell>
                    <TableCell align='right' sx={{ fontWeight: 800 }}>
                      {t('auth.caep.recipients', 'Recipients')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>
                      {t('auth.caep.reason', 'Reason')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((log) => {
                    const stamp = historyTimestamp(log)
                    return (
                      <TableRow key={log.id} hover>
                        <TableCell sx={{ py: 1.5, fontWeight: 500 }}>
                          {stamp ? new Date(stamp).toLocaleString() : '—'}
                        </TableCell>
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
                            sx={{
                              fontWeight: 800,
                              borderRadius: 'var(--sf-radius-xs, 4px)',
                              fontSize: '0.75rem',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{log.metadata?.eventType ?? '—'}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{log.metadata?.subject ?? '—'}</TableCell>
                        <TableCell align='right' sx={{ fontWeight: 700 }}>
                          {historyRecipientCount(log)}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 260 }}>
                          <Tooltip title={log.metadata?.reason ?? ''}>
                            <Typography variant='body2' noWrap sx={{ fontWeight: 500 }}>
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
    </Box>
  )
}

export default CaepEventConsole
