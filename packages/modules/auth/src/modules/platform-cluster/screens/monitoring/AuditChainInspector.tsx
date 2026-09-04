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
  Divider,
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
import LinkIcon from '@mui/icons-material/Link'
import VerifiedUser from '@mui/icons-material/VerifiedUser'
import GppMaybe from '@mui/icons-material/GppMaybe'
import ErrorIcon from '@mui/icons-material/Error'
import PlayArrow from '@mui/icons-material/PlayArrow'
import VpnKey from '@mui/icons-material/VpnKey'
import { useTranslation } from 'react-i18next'
import {
  useAuditChainStatusQuery,
  useAuditChainCheckpointsQuery,
  useVerifyAuditChainMutation,
} from '../../hooks/useAuditChainQuery'
import { isPlatformScopeError } from '../../services/audit-chain.service'
import type { AuditChainAnomalyKind } from '../../types/auditChain.types'

/**
 * Tamper-Evidence Chain Inspector.
 *
 * The audit log's integrity control had no interface: hash chaining,
 * checkpointing and verification all existed behind `node ace audit:verify`, so
 * the evidence that log integrity is monitored was only visible to whoever had
 * shell access. This screen is that evidence — the live head, the checkpoint
 * history, and an on-demand verification.
 *
 * Two behaviours are deliberate and worth not "fixing" later:
 *
 * - Verification is a button, never a poll. A full walk reads every audit row
 *   and the backend throttles it to 5 per 5 minutes.
 * - A 403 is rendered as an explanation, not an error. The chain is global and
 *   has no per-tenant view, so an organization admin legitimately cannot read
 *   it; showing them a red failure would send them hunting a broken backend.
 */

/** What each break means, in the terms an operator has to act on. */
const ANOMALY_EXPLANATION: Record<AuditChainAnomalyKind, string> = {
  content: 'A row was modified after it was written.',
  link: 'A preceding row was deleted or reordered.',
  fork: 'Two rows share a predecessor — a concurrent append bypassed the write lock.',
  key: 'The HMAC key for this row could not be resolved, so it cannot be verified.',
  truncation: 'Rows were removed from the tail since the last checkpoint.',
}

const shortHash = (hash?: string | null) => (hash ? `${hash.slice(0, 16)}…` : '—')

export const AuditChainInspector: React.FC = () => {
  const { t } = useTranslation()
  const [recordCheckpoint, setRecordCheckpoint] = useState(true)

  const statusQuery = useAuditChainStatusQuery()
  const checkpointsQuery = useAuditChainCheckpointsQuery({ page: 1, limit: 25 })
  const verifyMutation = useVerifyAuditChainMutation()

  const status = statusQuery.data
  const checkpoints = checkpointsQuery.data?.data ?? []
  const result = verifyMutation.data

  if (statusQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  // A tenant-scoped admin is not entitled to a global chain view. Say that
  // plainly instead of rendering a failure.
  if (statusQuery.error && isPlatformScopeError(statusQuery.error)) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert severity='info' icon={<GppMaybe />}>
          <AlertTitle>
            {t('monitoring.auditChain.scope_title', 'Platform administrators only')}
          </AlertTitle>
          {t(
            'monitoring.auditChain.scope_body',
            'The audit log is a single hash chain shared by every organization, so it has no per-tenant view. Only a platform administrator with no organization selected can inspect it.',
          )}
        </Alert>
      </Container>
    )
  }

  if (statusQuery.error) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert severity='error'>
          <AlertTitle>
            {t('monitoring.auditChain.error_title', 'Chain status unavailable')}
          </AlertTitle>
          {t(
            'monitoring.auditChain.error_body',
            'The audit chain status could not be read. This is itself worth investigating — the endpoint is a read over the audit log.',
          )}
        </Alert>
      </Container>
    )
  }

  const headMatchesCheckpoint =
    status?.head && status.lastCheckpoint
      ? status.lastCheckpoint.maxAuditId <= status.head.auditLogId
      : null

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Stack direction='row' alignItems='center' spacing={1.5} sx={{ mb: 1 }}>
        <LinkIcon color='primary' />
        <Typography variant='h4'>
          {t('monitoring.auditChain.title', 'Audit chain integrity')}
        </Typography>
      </Stack>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        {t(
          'monitoring.auditChain.subtitle',
          'Every audit row carries an HMAC over its own content and the previous row’s hash. Editing or deleting a row breaks verification from that point onward.',
        )}
      </Typography>

      {status && !status.dedicatedKeyConfigured && (
        <Alert severity='warning' icon={<VpnKey />} sx={{ mb: 3 }}>
          <AlertTitle>
            {t('monitoring.auditChain.no_dedicated_key_title', 'No dedicated chain key')}
          </AlertTitle>
          {t(
            'monitoring.auditChain.no_dedicated_key_body',
            'The chain is keyed on APP_KEY, which is rotated for cookie and session hygiene. Rotating it would invalidate the entire audit history. Set AUDIT_CHAIN_HMAC_KEY.',
          )}
        </Alert>
      )}

      {status && status.unhashedRows > 0 && (
        <Alert severity='warning' sx={{ mb: 3 }}>
          <AlertTitle>
            {t('monitoring.auditChain.unhashed_title', 'Unhashed rows present')}
          </AlertTitle>
          {t(
            'monitoring.auditChain.unhashed_body',
            '{{count}} audit rows carry no hash and cannot be verified. These normally predate the control; a verification run will fail unless they are exempted.',
            { count: status.unhashedRows },
          )}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant='outlined' sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant='overline' color='text.secondary'>
                {t('monitoring.auditChain.head', 'Current head')}
              </Typography>
              {status?.head ? (
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <Row
                    label={t('monitoring.auditChain.head_row', 'Audit row')}
                    value={`#${status.head.auditLogId}`}
                  />
                  <Row
                    label={t('monitoring.auditChain.row_hash', 'Row hash')}
                    value={shortHash(status.head.rowHash)}
                    title={status.head.rowHash}
                  />
                  <Row
                    label={t('monitoring.auditChain.prev_hash', 'Previous hash')}
                    value={shortHash(status.head.prevHash)}
                    title={status.head.prevHash ?? undefined}
                  />
                  <Row
                    label={t('monitoring.auditChain.key_id', 'Hash key')}
                    value={status.head.hashKeyId}
                  />
                </Stack>
              ) : (
                <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                  {t(
                    'monitoring.auditChain.no_head',
                    'No hashed rows yet — the chain starts at genesis.',
                  )}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant='outlined' sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant='overline' color='text.secondary'>
                {t('monitoring.auditChain.last_checkpoint', 'Last checkpoint')}
              </Typography>
              {status?.lastCheckpoint ? (
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <Row
                    label={t('monitoring.auditChain.checkpoint_head', 'Recorded head')}
                    value={`#${status.lastCheckpoint.maxAuditId}`}
                  />
                  <Row
                    label={t('monitoring.auditChain.checkpoint_rows', 'Rows counted')}
                    value={String(status.lastCheckpoint.rowCount)}
                  />
                  <Row
                    label={t('monitoring.auditChain.checkpoint_by', 'Verified by')}
                    value={status.lastCheckpoint.verifiedBy ?? '—'}
                  />
                  <Row
                    label={t('monitoring.auditChain.checkpoint_at', 'Recorded')}
                    value={new Date(status.lastCheckpoint.createdAt).toLocaleString()}
                  />
                  {headMatchesCheckpoint === false && (
                    <Alert severity='error' sx={{ mt: 1 }}>
                      {t(
                        'monitoring.auditChain.head_behind_checkpoint',
                        'The current head is behind the last recorded checkpoint — rows were deleted from the tail.',
                      )}
                    </Alert>
                  )}
                </Stack>
              ) : (
                <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                  {t(
                    'monitoring.auditChain.no_checkpoint',
                    'No checkpoint recorded yet. Without one, deletion of the most recent rows cannot be detected — run a full verification to establish the first head.',
                  )}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card variant='outlined' sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ sm: 'center' }}
            justifyContent='space-between'
          >
            <Box>
              <Typography variant='h6'>
                {t('monitoring.auditChain.verify_title', 'Verify audit log integrity')}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {t(
                  'monitoring.auditChain.verify_help',
                  'Walks the whole chain and recomputes every hash. Limited to 5 runs per 5 minutes.',
                )}
              </Typography>
            </Box>
            <Stack direction='row' spacing={1} alignItems='center'>
              <Chip
                size='small'
                clickable
                color={recordCheckpoint ? 'primary' : 'default'}
                variant={recordCheckpoint ? 'filled' : 'outlined'}
                label={t('monitoring.auditChain.record_checkpoint', 'Record checkpoint')}
                onClick={() => setRecordCheckpoint((value) => !value)}
              />
              <Button
                variant='contained'
                startIcon={<PlayArrow />}
                disabled={verifyMutation.isPending}
                onClick={() => verifyMutation.mutate({ recordCheckpoint })}
              >
                {t('monitoring.auditChain.verify_action', 'Verify now')}
              </Button>
            </Stack>
          </Stack>

          {verifyMutation.isPending && <LinearProgress sx={{ mt: 2 }} />}

          {verifyMutation.error && (
            <Alert severity='error' sx={{ mt: 2 }}>
              {isPlatformScopeError(verifyMutation.error)
                ? t(
                    'monitoring.auditChain.verify_scope',
                    'Verification is restricted to platform administrators with no organization selected.',
                  )
                : t(
                    'monitoring.auditChain.verify_failed',
                    'The verification run could not be started. If this persists it may be the throttle — the endpoint allows 5 runs per 5 minutes.',
                  )}
            </Alert>
          )}

          {result && (
            <Box sx={{ mt: 2 }}>
              <Alert
                severity={result.ok ? 'success' : 'error'}
                icon={result.ok ? <VerifiedUser /> : <ErrorIcon />}
              >
                <AlertTitle>
                  {result.ok
                    ? t('monitoring.auditChain.intact', 'Chain intact — no tampering detected')
                    : t('monitoring.auditChain.broken', 'Chain BROKEN')}
                </AlertTitle>
                {t(
                  'monitoring.auditChain.verify_summary',
                  '{{checked}} rows verified in {{ms}}ms ({{scope}}).',
                  {
                    checked: result.checked,
                    ms: result.durationMs,
                    scope: result.fullWalk
                      ? t('monitoring.auditChain.full_walk', 'full walk')
                      : t('monitoring.auditChain.bounded_walk', 'bounded scan'),
                  },
                )}
                {result.checkpointRecorded && (
                  <Box component='span'>
                    {' '}
                    {t('monitoring.auditChain.checkpoint_written', 'A new checkpoint was recorded.')}
                  </Box>
                )}
              </Alert>

              {result.anomalies.length > 0 && (
                <TableContainer component={Paper} variant='outlined' sx={{ mt: 2 }}>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('monitoring.auditChain.anomaly_row', 'Row')}</TableCell>
                        <TableCell>{t('monitoring.auditChain.anomaly_kind', 'Kind')}</TableCell>
                        <TableCell>{t('monitoring.auditChain.anomaly_detail', 'Detail')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.anomalies.map((anomaly, index) => (
                        <TableRow key={`${anomaly.id}-${anomaly.kind}-${index}`}>
                          <TableCell>#{anomaly.id}</TableCell>
                          <TableCell>
                            <Tooltip title={ANOMALY_EXPLANATION[anomaly.kind] ?? ''}>
                              <Chip size='small' color='error' label={anomaly.kind} />
                            </Tooltip>
                          </TableCell>
                          <TableCell>{anomaly.detail}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      <Card variant='outlined'>
        <CardContent>
          <Typography variant='h6' sx={{ mb: 0.5 }}>
            {t('monitoring.auditChain.history_title', 'Checkpoint history')}
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            {t(
              'monitoring.auditChain.history_help',
              'Each entry is the chain head after a clean verification. A regular cadence here is the evidence that log integrity is monitored.',
            )}
          </Typography>
          <Divider sx={{ mb: 1 }} />

          {checkpointsQuery.isLoading ? (
            <LinearProgress />
          ) : checkpoints.length === 0 ? (
            <Typography variant='body2' color='text.secondary'>
              {t('monitoring.auditChain.history_empty', 'No verification has been recorded yet.')}
            </Typography>
          ) : (
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('monitoring.auditChain.checkpoint_at', 'Recorded')}</TableCell>
                    <TableCell>{t('monitoring.auditChain.checkpoint_head', 'Head')}</TableCell>
                    <TableCell>{t('monitoring.auditChain.checkpoint_rows', 'Rows')}</TableCell>
                    <TableCell>{t('monitoring.auditChain.row_hash', 'Row hash')}</TableCell>
                    <TableCell>{t('monitoring.auditChain.checkpoint_by', 'Verified by')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {checkpoints.map((checkpoint) => (
                    <TableRow key={checkpoint.id}>
                      <TableCell>{new Date(checkpoint.createdAt).toLocaleString()}</TableCell>
                      <TableCell>#{checkpoint.maxAuditId}</TableCell>
                      <TableCell>{checkpoint.rowCount}</TableCell>
                      <TableCell>
                        <Tooltip title={checkpoint.rowHash}>
                          <span>{shortHash(checkpoint.rowHash)}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{checkpoint.verifiedBy ?? '—'}</TableCell>
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

const Row: React.FC<{ label: string; value: string; title?: string }> = ({
  label,
  value,
  title,
}) => (
  <Stack direction='row' justifyContent='space-between' spacing={2}>
    <Typography variant='body2' color='text.secondary'>
      {label}
    </Typography>
    <Tooltip title={title ?? ''}>
      <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
        {value}
      </Typography>
    </Tooltip>
  </Stack>
)

export default AuditChainInspector
