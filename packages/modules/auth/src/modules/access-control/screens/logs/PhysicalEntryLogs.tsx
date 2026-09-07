import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import History from '@mui/icons-material/History'
import CheckCircle from '@mui/icons-material/CheckCircle'
import DoNotDisturb from '@mui/icons-material/DoNotDisturb'
import PersonOff from '@mui/icons-material/PersonOff'
import { useTranslation } from 'react-i18next'
import { useActiveOrganizationId } from '../../hooks/useActiveOrganizationId'
import { useAccessLogsQuery, useAccessPointsQuery } from '../../hooks/useAccessControlQuery'
import type { AccessDecision, AccessLogDirection } from '../../types/accessControl.types'
import { NoOrganizationNotice } from '../NoOrganizationNotice'

/**
 * Physical Entry Logs.
 *
 * Every reader scan: which badge, which door, which way, and whether it opened.
 *
 * The screen leans on one distinction the backend already makes and that
 * matters during an incident — a denied scan whose `userId` is null is an
 * **unknown badge**, not a known person being turned away. Those are different
 * events: one is somebody presenting a card the system has never seen, the
 * other is a revoked or out-of-hours holder. Rendering them the same way would
 * hide the first inside the second.
 *
 * Live polling is opt-in. The log is watched continuously while an incident is
 * open and ignored the rest of the time, so a default of "off" keeps the
 * endpoint quiet without taking the capability away.
 */

const DECISION_META: Record<
  AccessDecision,
  { color: 'success' | 'error'; icon: React.ReactNode }
> = {
  granted: { color: 'success', icon: <CheckCircle fontSize='small' /> },
  denied: { color: 'error', icon: <DoNotDisturb fontSize='small' /> },
}

export const PhysicalEntryLogs: React.FC = () => {
  const { t } = useTranslation()
  const orgId = useActiveOrganizationId()

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [status, setStatus] = useState<AccessDecision | ''>('')
  const [direction, setDirection] = useState<AccessLogDirection | ''>('')
  const [accessPointId, setAccessPointId] = useState<string>('')
  const [from, setFrom] = useState('')
  const [live, setLive] = useState(false)

  const pointsQuery = useAccessPointsQuery(orgId)
  const logsQuery = useAccessLogsQuery(
    orgId,
    {
      page: page + 1,
      limit: rowsPerPage,
      status: status || undefined,
      direction: direction || undefined,
      accessPointId: accessPointId || undefined,
      from: from || undefined,
    },
    { live },
  )

  if (!orgId) return <NoOrganizationNotice />

  const logs = logsQuery.data?.data ?? []
  const total = logsQuery.data?.meta?.total ?? 0
  const points = pointsQuery.data ?? []

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
          <History color='primary' />
          <Typography variant='h4'>{t('accessControl.logs.title', 'Entry logs')}</Typography>
        </Stack>
        <FormControlLabel
          control={<Switch checked={live} onChange={(event) => setLive(event.target.checked)} />}
          label={t('accessControl.logs.live', 'Live')}
        />
      </Stack>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        {t(
          'accessControl.logs.subtitle',
          'Every badge presented at a reader, granted or denied. A denial with no holder is an unknown badge rather than a refused member.',
        )}
      </Typography>

      <Card variant='outlined'>
        <CardContent>
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Select
                fullWidth
                size='small'
                displayEmpty
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as AccessDecision | '')
                  setPage(0)
                }}
                inputProps={{ 'aria-label': t('accessControl.logs.decision', 'Decision') }}
              >
                <MenuItem value=''>{t('accessControl.logs.all_decisions', 'All')}</MenuItem>
                <MenuItem value='granted'>{t('accessControl.logs.granted', 'Granted')}</MenuItem>
                <MenuItem value='denied'>{t('accessControl.logs.denied', 'Denied')}</MenuItem>
              </Select>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Select
                fullWidth
                size='small'
                displayEmpty
                value={direction}
                onChange={(event) => {
                  setDirection(event.target.value as AccessLogDirection | '')
                  setPage(0)
                }}
                inputProps={{ 'aria-label': t('accessControl.logs.direction', 'Direction') }}
              >
                <MenuItem value=''>{t('accessControl.logs.all_directions', 'Both ways')}</MenuItem>
                <MenuItem value='in'>{t('accessControl.logs.in', 'In')}</MenuItem>
                <MenuItem value='out'>{t('accessControl.logs.out', 'Out')}</MenuItem>
              </Select>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Select
                fullWidth
                size='small'
                displayEmpty
                value={accessPointId}
                onChange={(event) => {
                  setAccessPointId(event.target.value)
                  setPage(0)
                }}
                inputProps={{ 'aria-label': t('accessControl.logs.reader', 'Reader') }}
              >
                <MenuItem value=''>{t('accessControl.logs.all_readers', 'All readers')}</MenuItem>
                {points.map((point) => (
                  <MenuItem key={point.id} value={String(point.id)}>
                    {point.name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                size='small'
                type='datetime-local'
                label={t('accessControl.logs.from', 'From')}
                value={from}
                onChange={(event) => {
                  setFrom(event.target.value)
                  setPage(0)
                }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
          </Grid>

          {logsQuery.isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : logs.length === 0 ? (
            <Typography variant='body2' color='text.secondary'>
              {t('accessControl.logs.empty', 'No scans recorded for this filter.')}
            </Typography>
          ) : (
            <>
              <TableContainer component={Paper} variant='outlined'>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('accessControl.logs.time', 'Time')}</TableCell>
                      <TableCell>{t('accessControl.logs.reader', 'Reader')}</TableCell>
                      <TableCell>{t('accessControl.logs.uid', 'Badge UID')}</TableCell>
                      <TableCell>{t('accessControl.logs.holder', 'Holder')}</TableCell>
                      <TableCell>{t('accessControl.logs.direction', 'Direction')}</TableCell>
                      <TableCell>{t('accessControl.logs.decision', 'Decision')}</TableCell>
                      <TableCell>{t('accessControl.logs.reason', 'Reason')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{new Date(log.scannedAt).toLocaleString()}</TableCell>
                        <TableCell>{log.accessPoint?.name ?? `#${log.accessPointId}`}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{log.nfcUid}</TableCell>
                        <TableCell>
                          {log.userId === null ? (
                            <Tooltip
                              title={t(
                                'accessControl.logs.unknown_help',
                                'This UID matched no registered badge — an unknown card was presented, not a member being turned away.',
                              )}
                            >
                              <Stack direction='row' spacing={0.5} alignItems='center'>
                                <PersonOff fontSize='small' color='error' />
                                <Typography variant='body2' color='error.main'>
                                  {t('accessControl.logs.unknown', 'Unknown badge')}
                                </Typography>
                              </Stack>
                            </Tooltip>
                          ) : (
                            (log.user?.email ?? log.user?.fullName ?? `#${log.userId}`)
                          )}
                        </TableCell>
                        <TableCell>{log.direction}</TableCell>
                        <TableCell>
                          <Chip
                            size='small'
                            color={DECISION_META[log.status]?.color ?? 'default'}
                            icon={DECISION_META[log.status]?.icon as any}
                            label={log.status}
                          />
                        </TableCell>
                        <TableCell>{log.reason ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component='div'
                count={total}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[25, 50, 100]}
                onPageChange={(_event, next) => setPage(next)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(Number(event.target.value))
                  setPage(0)
                }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}

export default PhysicalEntryLogs
