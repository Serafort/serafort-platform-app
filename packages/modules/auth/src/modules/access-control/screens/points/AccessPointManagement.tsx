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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
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
import SensorDoor from '@mui/icons-material/SensorDoor'
import AddCircleOutline from '@mui/icons-material/AddCircleOutline'
import Autorenew from '@mui/icons-material/Autorenew'
import ContentCopy from '@mui/icons-material/ContentCopy'
import { useTranslation } from 'react-i18next'
import { useActiveOrganizationId } from '../../hooks/useActiveOrganizationId'
import {
  useAccessPointsQuery,
  useCreateAccessPointMutation,
  useRegenerateReaderTokenMutation,
  useUpdateAccessPointMutation,
} from '../../hooks/useAccessControlQuery'
import {
  readerPresence,
  type AccessDirection,
  type AccessPoint,
  type AccessPointWithToken,
  type ReaderPresence,
} from '../../types/accessControl.types'
import { NoOrganizationNotice } from '../NoOrganizationNotice'

/**
 * Access Points (readers).
 *
 * Manages the physical doors and turnstiles: name, direction, presence, and the
 * bearer token each reader authenticates its scans with.
 *
 * Two things this screen has to be careful about, because both are one-way:
 *
 * - **The raw token appears exactly once.** It is stored only as a hash, so the
 *   dialog that shows it is the single opportunity to copy it. The dialog says
 *   so and requires an explicit dismissal rather than closing on a backdrop
 *   click.
 * - **Regenerating takes the reader offline.** The old token stops working the
 *   moment the new one is issued, so somebody has to physically carry the new
 *   value to the device. That is stated before the action, not after.
 */

const PRESENCE_META: Record<
  ReaderPresence,
  { color: 'success' | 'warning' | 'error' | 'default'; labelKey: string; fallback: string }
> = {
  online: { color: 'success', labelKey: 'accessControl.points.online', fallback: 'Online' },
  stale: { color: 'warning', labelKey: 'accessControl.points.stale', fallback: 'No recent scans' },
  'never-seen': {
    color: 'error',
    labelKey: 'accessControl.points.never_seen',
    fallback: 'Never seen',
  },
  disabled: {
    color: 'default',
    labelKey: 'accessControl.points.disabled',
    fallback: 'Disabled',
  },
}

const DIRECTIONS: AccessDirection[] = ['in', 'out', 'both']

export const AccessPointManagement: React.FC = () => {
  const { t } = useTranslation()
  const orgId = useActiveOrganizationId()

  const [createOpen, setCreateOpen] = useState(false)
  const [issuedToken, setIssuedToken] = useState<AccessPointWithToken | null>(null)
  const [confirmRegenerate, setConfirmRegenerate] = useState<AccessPoint | null>(null)

  const pointsQuery = useAccessPointsQuery(orgId)
  const updatePoint = useUpdateAccessPointMutation(orgId)
  const regenerate = useRegenerateReaderTokenMutation(orgId)

  if (!orgId) return <NoOrganizationNotice />

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
          <SensorDoor color='primary' />
          <Typography variant='h4'>
            {t('accessControl.points.title', 'Access points')}
          </Typography>
        </Stack>
        <Button
          variant='contained'
          startIcon={<AddCircleOutline />}
          onClick={() => setCreateOpen(true)}
        >
          {t('accessControl.points.add', 'Add reader')}
        </Button>
      </Stack>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        {t(
          'accessControl.points.subtitle',
          'Doors and turnstiles. A reader has no heartbeat — presence is inferred from when it last submitted a scan.',
        )}
      </Typography>

      {pointsQuery.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card variant='outlined'>
          <CardContent>
            {points.length === 0 ? (
              <Typography variant='body2' color='text.secondary'>
                {t('accessControl.points.empty', 'No readers configured yet.')}
              </Typography>
            ) : (
              <TableContainer component={Paper} variant='outlined'>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('accessControl.points.name', 'Location')}</TableCell>
                      <TableCell>{t('accessControl.points.direction', 'Direction')}</TableCell>
                      <TableCell>{t('accessControl.points.token', 'Token')}</TableCell>
                      <TableCell>{t('accessControl.points.last_seen', 'Last scan')}</TableCell>
                      <TableCell>{t('accessControl.points.presence', 'Presence')}</TableCell>
                      <TableCell align='right'>
                        {t('accessControl.points.actions', 'Actions')}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {points.map((point) => {
                      const presence = readerPresence(point)
                      const meta = PRESENCE_META[presence]
                      return (
                        <TableRow key={point.id}>
                          <TableCell>{point.name}</TableCell>
                          <TableCell>
                            <Select
                              size='small'
                              value={point.direction}
                              disabled={updatePoint.isPending}
                              onChange={(event) =>
                                updatePoint.mutate({
                                  pointId: point.id,
                                  payload: { direction: event.target.value as AccessDirection },
                                })
                              }
                              inputProps={{
                                'aria-label': t('accessControl.points.direction', 'Direction'),
                              }}
                            >
                              {DIRECTIONS.map((value) => (
                                <MenuItem key={value} value={value}>
                                  {value}
                                </MenuItem>
                              ))}
                            </Select>
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace' }}>
                            {point.apiTokenPrefix}…
                          </TableCell>
                          <TableCell>
                            {point.lastSeenAt
                              ? new Date(point.lastSeenAt).toLocaleString()
                              : t('accessControl.points.never', 'Never')}
                          </TableCell>
                          <TableCell>
                            <Chip size='small' color={meta.color} label={t(meta.labelKey, meta.fallback)} />
                          </TableCell>
                          <TableCell align='right'>
                            <Stack direction='row' spacing={1} justifyContent='flex-end'>
                              <Button
                                size='small'
                                onClick={() =>
                                  updatePoint.mutate({
                                    pointId: point.id,
                                    payload: {
                                      status: point.status === 'active' ? 'inactive' : 'active',
                                    },
                                  })
                                }
                                disabled={updatePoint.isPending}
                              >
                                {point.status === 'active'
                                  ? t('accessControl.points.disable', 'Disable')
                                  : t('accessControl.points.enable', 'Enable')}
                              </Button>
                              <Tooltip
                                title={t(
                                  'accessControl.points.regenerate_help',
                                  'Issues a new token and invalidates the current one immediately.',
                                )}
                              >
                                <Button
                                  size='small'
                                  color='warning'
                                  startIcon={<Autorenew />}
                                  onClick={() => setConfirmRegenerate(point)}
                                >
                                  {t('accessControl.points.regenerate', 'Regenerate token')}
                                </Button>
                              </Tooltip>
                            </Stack>
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
      )}

      <CreateReaderDialog
        orgId={orgId}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(point) => {
          setCreateOpen(false)
          setIssuedToken(point)
        }}
      />

      {/* Regeneration takes a live reader offline until somebody walks the new
          token to it, so it is confirmed rather than fired from the table. */}
      <Dialog open={Boolean(confirmRegenerate)} onClose={() => setConfirmRegenerate(null)}>
        <DialogTitle>
          {t('accessControl.points.regenerate_title', 'Regenerate reader token?')}
        </DialogTitle>
        <DialogContent>
          <Alert severity='warning'>
            {t(
              'accessControl.points.regenerate_warning',
              '{{name}} will stop accepting badges the moment the new token is issued. It will not work again until the new token is installed on the device.',
              { name: confirmRegenerate?.name ?? '' },
            )}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRegenerate(null)}>
            {t('accessControl.common.cancel', 'Cancel')}
          </Button>
          <Button
            color='warning'
            variant='contained'
            disabled={regenerate.isPending}
            onClick={() => {
              const point = confirmRegenerate
              if (!point) return
              regenerate.mutate(point.id, {
                onSuccess: (issued) => {
                  setConfirmRegenerate(null)
                  setIssuedToken(issued)
                },
              })
            }}
          >
            {t('accessControl.points.regenerate', 'Regenerate token')}
          </Button>
        </DialogActions>
      </Dialog>

      <IssuedTokenDialog point={issuedToken} onClose={() => setIssuedToken(null)} />
    </Container>
  )
}

const CreateReaderDialog: React.FC<{
  orgId: string | number
  open: boolean
  onClose: () => void
  onCreated: (point: AccessPointWithToken) => void
}> = ({ orgId, open, onClose, onCreated }) => {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [direction, setDirection] = useState<AccessDirection>('both')
  const create = useCreateAccessPointMutation(orgId)

  const close = () => {
    setName('')
    setDirection('both')
    create.reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth='sm'>
      <DialogTitle>{t('accessControl.points.add_title', 'Add access point')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {create.error && (
            <Alert severity='error'>
              {t('accessControl.points.create_failed', 'The reader could not be created.')}
            </Alert>
          )}
          <TextField
            autoFocus
            fullWidth
            required
            label={t('accessControl.points.name', 'Location')}
            value={name}
            onChange={(event) => setName(event.target.value)}
            helperText={t(
              'accessControl.points.name_help',
              'Where the reader is, in the words someone standing next to it would use.',
            )}
          />
          <Select
            fullWidth
            value={direction}
            onChange={(event) => setDirection(event.target.value as AccessDirection)}
            inputProps={{ 'aria-label': t('accessControl.points.direction', 'Direction') }}
          >
            {DIRECTIONS.map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>{t('accessControl.common.cancel', 'Cancel')}</Button>
        <Button
          variant='contained'
          disabled={!name.trim() || create.isPending}
          onClick={() => create.mutate({ name, direction }, { onSuccess: onCreated })}
        >
          {t('accessControl.points.create', 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

/**
 * The one and only sighting of a reader's plaintext token.
 *
 * `disableEscapeKeyDown` and no backdrop close are deliberate: an accidental
 * dismissal here means the token is gone and the reader has to be regenerated
 * again, taking it offline a second time.
 */
const IssuedTokenDialog: React.FC<{
  point: AccessPointWithToken | null
  onClose: () => void
}> = ({ point, onClose }) => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!point) return
    try {
      await navigator.clipboard.writeText(point.api_token)
      setCopied(true)
    } catch {
      // Clipboard access can be refused (insecure context, permission denied).
      // The value is on screen and selectable, so this is not a dead end.
      setCopied(false)
    }
  }

  return (
    <Dialog
      open={Boolean(point)}
      onClose={(_event, reason) => {
        if (reason === 'backdropClick') return
        onClose()
      }}
      disableEscapeKeyDown
      fullWidth
      maxWidth='sm'
    >
      <DialogTitle>{t('accessControl.points.token_title', 'Reader token')}</DialogTitle>
      <DialogContent>
        <Alert severity='warning' sx={{ mb: 2 }}>
          <AlertTitle>{t('accessControl.points.token_once', 'Shown once')}</AlertTitle>
          {t(
            'accessControl.points.token_once_body',
            'Only a hash of this token is stored. Copy it into the reader now — if you close this dialog without it, the token has to be regenerated, taking the reader offline again.',
          )}
        </Alert>
        <Stack direction='row' spacing={1} alignItems='center'>
          <TextField
            fullWidth
            value={point?.api_token ?? ''}
            slotProps={{ input: { readOnly: true, sx: { fontFamily: 'monospace' } } }}
            label={point?.name}
          />
          <IconButton onClick={copy} aria-label={t('accessControl.common.copy', 'Copy')}>
            <ContentCopy />
          </IconButton>
        </Stack>
        {copied && (
          <Typography variant='caption' color='success.main'>
            {t('accessControl.common.copied', 'Copied to clipboard')}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant='contained' onClick={onClose}>
          {t('accessControl.points.token_done', 'I have saved it')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AccessPointManagement
