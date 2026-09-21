import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Select,
  Stack,
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
import CreditCard from '@mui/icons-material/CreditCard'
import AddCard from '@mui/icons-material/AddCard'
import Block from '@mui/icons-material/Block'
import RestartAlt from '@mui/icons-material/RestartAlt'
import { useTranslation } from 'react-i18next'
import { useActiveOrganizationId } from '../../../authentication-core/hooks/useActiveOrganizationId'
import {
  useNfcCardsQuery,
  useRegisterNfcCardMutation,
  useUpdateCardStatusMutation,
} from '../../hooks/useAccessControlQuery'
import {
  normaliseCardUid,
  type NfcCard,
  type NfcCardStatus,
} from '../../types/accessControl.types'
import { NoOrganizationNotice } from '../NoOrganizationNotice'
import { AdminDataState, AdminPageHeader, AdminStatusBadge } from '../../../authentication-core/components/shared/admin'
import { AuthConfirmDrawer } from '../../../authentication-core/components/shared/auth'

/**
 * NFC Card Inventory.
 *
 * The registry of badges that open doors: UID, holder, label, issue and
 * revocation dates, and scan counter.
 *
 * Revoking is a status flip, not a delete. A revoked card stops opening doors
 * immediately but keeps the registration its `access_logs` entries refer back
 * to — deleting it would leave the entry log pointing at a UID nobody can
 * attribute, which is the wrong thing to do to the record of who went where.
 */
export const NfcCardInventory: React.FC = () => {
  const { t } = useTranslation()
  const orgId = useActiveOrganizationId()

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<NfcCardStatus | ''>('')
  const [registerOpen, setRegisterOpen] = useState(false)
  const [pendingRevoke, setPendingRevoke] = useState<NfcCard | null>(null)

  const cardsQuery = useNfcCardsQuery(orgId, {
    page: page + 1,
    limit: rowsPerPage,
    search: search || undefined,
    status: status || undefined,
  })
  const updateStatus = useUpdateCardStatusMutation(orgId)

  if (!orgId) return <NoOrganizationNotice />

  const cards = cardsQuery.data?.data ?? []
  const total = cardsQuery.data?.meta?.total ?? 0

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <AdminPageHeader
        icon={<CreditCard />}
        title={t('accessControl.cards.title', 'NFC card inventory')}
        description={t(
          'accessControl.cards.subtitle',
          'Badges registered to members of this organization. Revoking stops a card opening doors immediately while keeping its entry history attributable.',
        )}
        actions={
          <Button
            variant='contained'
            startIcon={<AddCard />}
            onClick={() => setRegisterOpen(true)}
            sx={{
              minHeight: 44,
              borderRadius: 'var(--sf-radius-md, 8px)',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {t('accessControl.cards.register', 'Register badge')}
          </Button>
        }
      />

      {updateStatus.error && (
        <Alert severity='error' sx={{ mb: 2, borderRadius: 'var(--sf-radius-md, 8px)' }}>
          {t('accessControl.cards.update_failed', 'The card status could not be changed.')}
        </Alert>
      )}

      <Card variant='outlined' sx={{ borderRadius: 'var(--sf-radius-lg, 12px)' }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
            <TextField
              size='small'
              fullWidth
              label={t('accessControl.cards.search', 'Search UID or label')}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(0)
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 'var(--sf-radius-md, 8px)' } }}
            />
            <Select
              size='small'
              displayEmpty
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as NfcCardStatus | '')
                setPage(0)
              }}
              inputProps={{ 'aria-label': t('accessControl.cards.filter_status', 'Status') }}
              sx={{ minWidth: 160, borderRadius: 'var(--sf-radius-md, 8px)' }}
            >
              <MenuItem value=''>{t('accessControl.cards.all', 'All')}</MenuItem>
              <MenuItem value='active'>{t('accessControl.cards.active', 'Active')}</MenuItem>
              <MenuItem value='revoked'>{t('accessControl.cards.revoked', 'Revoked')}</MenuItem>
            </Select>
          </Stack>

          <AdminDataState
            loading={cardsQuery.isLoading}
            error={cardsQuery.isError || undefined}
            onRetry={() => void cardsQuery.refetch()}
            empty={cards.length === 0}
            emptyIcon={<CreditCard sx={{ fontSize: 32 }} />}
            emptyTitle={t('accessControl.cards.empty', 'No badges registered for this filter.')}
            emptyDescription={t(
              'accessControl.cards.empty_help',
              'Register a badge, or clear the filters to see the full inventory.',
            )}
          >
            <>
              <TableContainer component={Paper} variant='outlined' sx={{ borderRadius: 'var(--sf-radius-md, 8px)' }}>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('accessControl.cards.uid', 'Badge UID')}</TableCell>
                      <TableCell>{t('accessControl.cards.label', 'Label')}</TableCell>
                      <TableCell>{t('accessControl.cards.holder', 'Holder')}</TableCell>
                      <TableCell>{t('accessControl.cards.issued', 'Issued')}</TableCell>
                      <TableCell align='right'>
                        {t('accessControl.cards.scans', 'Scans')}
                      </TableCell>
                      <TableCell>{t('accessControl.cards.status', 'Status')}</TableCell>
                      <TableCell align='right'>
                        {t('accessControl.cards.actions', 'Actions')}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cards.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{card.uid}</TableCell>
                        <TableCell>{card.label ?? '—'}</TableCell>
                        <TableCell>
                          {card.user?.email ?? card.user?.fullName ?? `#${card.userId}`}
                        </TableCell>
                        <TableCell>
                          {card.issuedAt ? new Date(card.issuedAt).toLocaleDateString() : '—'}
                          {card.revokedAt && (
                            <Typography variant='caption' color='error.main' display='block'>
                              {t('accessControl.cards.revoked_on', 'revoked {{date}}', {
                                date: new Date(card.revokedAt).toLocaleDateString(),
                              })}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align='right'>{card.scanCounter}</TableCell>
                        <TableCell>
                          <AdminStatusBadge
                            tone={card.status === 'active' ? 'success' : 'neutral'}
                            label={
                              card.status === 'active'
                                ? t('accessControl.cards.active', 'Active')
                                : t('accessControl.cards.revoked', 'Revoked')
                            }
                          />
                        </TableCell>
                        <TableCell align='right'>
                          {card.status === 'active' ? (
                            <Tooltip
                              title={t(
                                'accessControl.cards.revoke_help',
                                'Stops this badge opening doors immediately. Its entry history is kept.',
                              )}
                            >
                              <Button
                                color='error'
                                startIcon={<Block />}
                                disabled={updateStatus.isPending}
                                onClick={() => setPendingRevoke(card)}
                                sx={{ minHeight: 44, textTransform: 'none' }}
                              >
                                {t('accessControl.cards.revoke', 'Revoke')}
                              </Button>
                            </Tooltip>
                          ) : (
                            <Button
                              size='small'
                              startIcon={<RestartAlt />}
                              disabled={updateStatus.isPending}
                              onClick={() =>
                                updateStatus.mutate({ cardId: card.id, status: 'active' })
                              }
                              sx={{ minHeight: 44, textTransform: 'none' }}
                            >
                              {t('accessControl.cards.restore', 'Restore')}
                            </Button>
                          )}
                        </TableCell>
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
                rowsPerPageOptions={[10, 20, 50]}
                onPageChange={(_event, next) => setPage(next)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(Number(event.target.value))
                  setPage(0)
                }}
              />
            </>
          </AdminDataState>
        </CardContent>
      </Card>

      <RegisterCardDialog
        orgId={orgId}
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
      />

      <AuthConfirmDrawer
        id='revoke-nfc-card'
        open={Boolean(pendingRevoke)}
        onClose={() => setPendingRevoke(null)}
        onConfirm={() => {
          if (!pendingRevoke) return
          updateStatus.mutate(
            { cardId: pendingRevoke.id, status: 'revoked' },
            { onSuccess: () => setPendingRevoke(null) },
          )
        }}
        loading={updateStatus.isPending}
        tone='error'
        title={t('accessControl.cards.revoke_title', 'Revoke this badge?')}
        description={t('accessControl.cards.revoke_confirm', {
          uid: pendingRevoke?.uid ?? '',
          defaultValue:
            'Badge {{uid}} stops opening doors immediately. Its entry history is kept, and it can be restored later.',
        })}
        confirmLabel={t('accessControl.cards.revoke', 'Revoke')}
      />
    </Container>
  )
}

/**
 * Registration dialog.
 *
 * The UID is normalised as it is typed, using the same rule the backend applies
 * before its duplicate check — otherwise `04:a2:2f` and `04:A2:2F` look like two
 * different cards right up until the server rejects the second with a 409.
 */
const RegisterCardDialog: React.FC<{
  orgId: string | number
  open: boolean
  onClose: () => void
}> = ({ orgId, open, onClose }) => {
  const { t } = useTranslation()
  const [uid, setUid] = useState('')
  const [userId, setUserId] = useState('')
  const [label, setLabel] = useState('')
  const register = useRegisterNfcCardMutation(orgId)

  const close = () => {
    setUid('')
    setUserId('')
    setLabel('')
    register.reset()
    onClose()
  }

  const submit = () => {
    register.mutate(
      { uid, userId: userId || undefined, label: label || undefined },
      { onSuccess: close },
    )
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth='sm'
      slotProps={{
        paper: {
          sx: {
            borderRadius: 'var(--sf-radius-lg, 16px)',
          },
        },
      }}
    >
      <DialogTitle>{t('accessControl.cards.register_title', 'Register NFC badge')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {register.error && (
            <Alert severity='error' sx={{ borderRadius: 'var(--sf-radius-md, 8px)' }}>
              {t(
                'accessControl.cards.register_failed',
                'The badge could not be registered. A UID that is already in this organization is rejected.',
              )}
            </Alert>
          )}
          <TextField
            autoFocus
            fullWidth
            required
            label={t('accessControl.cards.uid', 'Badge UID')}
            value={uid}
            onChange={(event) => setUid(normaliseCardUid(event.target.value))}
            helperText={t(
              'accessControl.cards.uid_help',
              'Read from the badge. Stored upper-cased, so casing does not create a duplicate.',
            )}
            inputProps={{ style: { fontFamily: 'monospace' } }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 'var(--sf-radius-md, 8px)' } }}
          />
          <TextField
            fullWidth
            label={t('accessControl.cards.assign_user', 'Assign to member (user id)')}
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            helperText={t(
              'accessControl.cards.assign_help',
              'Leave blank to assign the badge to yourself.',
            )}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 'var(--sf-radius-md, 8px)' } }}
          />
          <TextField
            fullWidth
            label={t('accessControl.cards.label', 'Label')}
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            helperText={t(
              'accessControl.cards.label_help',
              'Optional. What is written on the badge, so a physical card can be matched to this row.',
            )}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 'var(--sf-radius-md, 8px)' } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={close} sx={{ minHeight: 44, textTransform: 'none' }}>
          {t('accessControl.common.cancel', 'Cancel')}
        </Button>
        <Button
          variant='contained'
          disabled={!uid.trim() || register.isPending}
          onClick={submit}
          sx={{
            minHeight: 44,
            borderRadius: 'var(--sf-radius-md, 8px)',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          {t('accessControl.cards.register', 'Register badge')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default NfcCardInventory
