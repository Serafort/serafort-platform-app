import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  useTheme,
  alpha,
  Alert,
  Stack,
  LinearProgress,
} from '@mui/material'
import { AdminPageHeader } from '@auth/modules/authentication-core/components/shared/admin'
import Webhook from '@mui/icons-material/Webhook'
import Add from '@mui/icons-material/Add'
import Delete from '@mui/icons-material/Delete'
import PlayArrow from '@mui/icons-material/PlayArrow'
import CheckCircle from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import ContentCopy from '@mui/icons-material/ContentCopy'
import Info from '@mui/icons-material/Info'
import Link from '@mui/icons-material/Link'
import Settings from '@mui/icons-material/Settings'
import NotificationsActive from '@mui/icons-material/NotificationsActive'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { buildLayoutSurfaceEffect } from '@cap/layout'
import { getTenantThemeEffects } from '@cap/theme'
import logger from '@idaas/authentication-core/utils/logger'
import {
  useWebhooks,
  useCreateWebhook,
  useDeleteWebhook,
  useTestWebhook,
} from '@idaas/authorization-engine/hooks'
import { extractRows } from '../../utils/errors'

/** A webhook as the list endpoint returns it (snake_case columns). */
interface WebhookRow {
  id: string | number
  url: string
  events?: string[]
  status?: string
  last_triggered_at?: string | null
  success_rate?: number | null
}

const AVAILABLE_EVENTS = [
  'user.created',
  'user.updated',
  'user.deleted',
  'org.created',
  'org.updated',
  'auth.login',
  'auth.mfa_enabled',
  'auth.password_reset',
  'provisioning.sync',
]

// ── Chip overflow helper: show max N chips + "+X more" badge ─────────────────
function EventChips({ events, max = 2 }: { events: string[]; max?: number }) {
  const theme = useTheme()
  const visible = events.slice(0, max)
  const overflow = events.length - max
  return (
    <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 0.5, alignItems: 'center' }}>
      {visible.map((e) => (
        <Chip
          key={e}
          label={e}
          size='small'
          sx={{
            height: 20,
            fontSize: 12,
            fontWeight: 700,
            bgcolor: alpha(theme.palette.primary.main, 0.06),
            maxWidth: 120,
            '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
          }}
        />
      ))}
      {overflow > 0 && (
        <Tooltip title={events.slice(max).join(', ')}>
          <Chip
            label={`+${overflow}`}
            size='small'
            sx={{
              height: 20,
              fontSize: 12,
              fontWeight: 800,
              bgcolor: alpha(theme.palette.text.secondary, 0.08),
              color: 'text.secondary',
              cursor: 'default',
            }}
          />
        </Tooltip>
      )}
    </Box>
  )
}

const WebhookManagement: React.FC = () => {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const effects = getTenantThemeEffects(theme)
  const surfaceEffect = buildLayoutSurfaceEffect(effects, theme)
  // ── Queries & Mutations ──────────────────────────────────────────
  const { data: webhooksData, isLoading } = useWebhooks()
  const createWebhook = useCreateWebhook()
  const deleteWebhook = useDeleteWebhook()
  const testWebhook = useTestWebhook()

  const webhooks = extractRows<WebhookRow>(webhooksData?.data)

  // ── State ────────────────────────────────────────────────────────
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSecretDialogOpen, setIsSecretDialogOpen] = useState(false)
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | number | null>(null)
  const [newWebhookSecret, setNewWebhookSecret] = useState<string | null>(null)

  // Create Form State
  const [url, setUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [secretVisible, setSecretVisible] = useState(false)

  // ── Handlers ─────────────────────────────────────────────────────
  const handleCreate = () => {
    if (!url || selectedEvents.length === 0) {
      toast.warning(t('admin.developer.webhooks.messages.form_error'))
      return
    }

    createWebhook.mutate(
      { url, events: selectedEvents },
      {
        onSuccess: (response) => {
          toast.success(t('admin.developer.webhooks.messages.create_success'))
          setIsCreateDialogOpen(false)
          setUrl('')
          setSelectedEvents([])
          const created = response?.data as { secret?: string } | undefined
          if (created?.secret) {
            setNewWebhookSecret(created.secret)
            setIsSecretDialogOpen(true)
          }
        },
        onError: (err) => {
          logger.error('Failed to create webhook', { error: err })
          toast.error(t('admin.developer.webhooks.messages.create_error'))
        },
      },
    )
  }

  const handleDelete = () => {
    if (!selectedWebhookId) return
    deleteWebhook.mutate(selectedWebhookId, {
      onSuccess: () => {
        toast.success(t('admin.developer.webhooks.messages.delete_success'))
        setIsDeleteDialogOpen(false)
        setSelectedWebhookId(null)
      },
      onError: (err) => {
        logger.error('Failed to delete webhook', { error: err })
        toast.error(t('admin.developer.webhooks.messages.delete_error'))
      },
    })
  }

  const handleTest = (id: string | number) => {
    testWebhook.mutate(id, {
      onSuccess: () => toast.success(t('admin.developer.webhooks.messages.test_success')),
      onError: (err) => {
        logger.error('Failed to test webhook', { error: err })
        toast.error(t('admin.developer.webhooks.messages.test_error'))
      },
    })
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.info(t('admin.developer.webhooks.messages.copied', { label }))
  }

  // ── Render Helpers ───────────────────────────────────────────────
  const getStatusChip = (status: string) => {
    const isFailing = status === 'failing'
    const isDisabled = status === 'disabled'
    return (
      <Chip
        label={status.toUpperCase()}
        size='small'
        sx={{
          fontWeight: 800,
          fontSize: 12,
          bgcolor: isFailing
            ? alpha(theme.palette.error.main, 0.1)
            : isDisabled
              ? alpha(theme.palette.text.disabled, 0.1)
              : alpha(theme.palette.success.main, 0.1),
          color: isFailing ? 'error.main' : isDisabled ? 'text.disabled' : 'success.main',
          border: '1px solid',
          borderColor: isFailing ? 'error.light' : isDisabled ? 'divider' : 'success.light',
        }}
      />
    )
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <AdminPageHeader
        icon={<Webhook />}
        title={t('admin.developer.webhooks.title', 'Webhooks')}
        description={t(
          'admin.developer.webhooks.subtitle',
          'Deliver signed platform events to your own endpoints in real time.',
        )}
        actions={
          <Button
            variant='contained'
            startIcon={<Add />}
            onClick={() => setIsCreateDialogOpen(true)}
            sx={{
              minHeight: 48,
              px: 3,
              borderRadius: 'var(--sf-radius-md, 8px)',
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            {t('admin.developer.webhooks.create_button', 'Create webhook')}
          </Button>
        }
      />

      {/* ── Rule 7: Stats Cards Row ───────────────────────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            label: t('admin.developer.webhooks.stats.total'),
            value: webhooks.length,
            icon: <Webhook />,
            color: 'primary',
          },
          {
            label: t('admin.developer.webhooks.stats.active'),
            value: webhooks.filter((w) => w.status !== 'disabled').length,
            icon: <NotificationsActive />,
            color: 'success',
          },
          {
            label: t('admin.developer.webhooks.stats.failed'),
            value: 0,
            icon: <ErrorIcon />,
            color: 'error',
          },
        ].map((stat, i) => (
          <Grid key={i} size={{ xs: 12, sm: 4 }}>
            <Card
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
                borderRadius: 'var(--sf-radius-lg, 16px)',
                ...surfaceEffect,
              }}
            >
              <CardContent
                sx={{
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  '&:last-child': { pb: 3 },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: alpha(
                      theme.palette[stat.color as 'primary' | 'success' | 'error'].main,
                      0.1,
                    ),
                    color: `${stat.color}.main`,
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--sf-radius-lg, 12px)',
                    flexShrink: 0,
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography
                    variant='caption'
                    sx={{
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.075em',
                      color: 'text.secondary',
                      display: 'block',
                      mb: 0.25,
                    }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography variant='h5' sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                    {stat.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Main Section: Configured Webhooks ─────────────────────── */}
      <Card
        sx={{
          borderRadius: 'var(--sf-radius-lg, 16px)',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
          ...surfaceEffect,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Rule 4: Section Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Settings color='primary' sx={{ fontSize: 24 }} />
            <Typography
              variant='h6'
              sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {t('admin.developer.webhooks.configured_title')}
            </Typography>
          </Box>

          {webhooks.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 'var(--sf-radius-lg, 12px)',
                }}
              >
                <Link sx={{ color: 'primary.main' }} />
              </Avatar>
              <Typography variant='h6' sx={{ fontWeight: 800, mb: 0.5 }}>
                {t('admin.developer.webhooks.empty.title')}
              </Typography>
              <Typography color='text.secondary' sx={{ mb: 3 }}>
                {t('admin.developer.webhooks.empty.desc')}
              </Typography>
              <Button
                variant='outlined'
                startIcon={<Add />}
                onClick={() => setIsCreateDialogOpen(true)}
                sx={{
                  borderRadius: 'var(--sf-radius-md, 8px)',
                  textTransform: 'none',
                  fontWeight: 700,
                  minHeight: 44,
                }}
              >
                {t('admin.developer.webhooks.empty.button')}
              </Button>
            </Box>
          ) : (
            <TableContainer
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 'var(--sf-radius-lg, 12px)',
                overflow: 'hidden',
              }}
            >
              <Table size='small'>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, py: 2 }}>
                      {t('admin.developer.webhooks.table.url')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>
                      {t('admin.developer.webhooks.table.events')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>
                      {t('admin.developer.webhooks.table.status')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, display: { xs: 'none', md: 'table-cell' } }}>
                      {t('admin.developer.webhooks.table.last_triggered')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>
                      {t('admin.developer.webhooks.table.success')}
                    </TableCell>
                    <TableCell align='right' sx={{ fontWeight: 800 }}>
                      {t('admin.developer.webhooks.table.actions')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {webhooks.map((hook) => (
                    <TableRow key={hook.id} hover sx={{ '& td': { py: 2 } }}>
                      {/* Rule 8/116: URL — long text truncation with Tooltip */}
                      <TableCell sx={{ maxWidth: { xs: 120, md: 220 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Tooltip title={hook.url} placement='top'>
                            <Typography
                              variant='body2'
                              sx={{
                                fontWeight: 700,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: { xs: 90, md: 180 },
                                display: 'block',
                              }}
                            >
                              {hook.url}
                            </Typography>
                          </Tooltip>
                          <Tooltip
                            title={t('admin.developer.webhooks.table.copy_url')}
                            sx={{ flexShrink: 0 }}
                          >
                            <IconButton
                              size='small'
                              onClick={() =>
                                handleCopy(
                                  hook.url,
                                  t('admin.developer.webhooks.dialogs.create.url_label'),
                                )
                              }
                            >
                              <ContentCopy sx={{ fontSize: 13 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>

                      {/* Rule 8/117: Events — overflow chips */}
                      <TableCell sx={{ maxWidth: 160 }}>
                        <EventChips events={hook.events ?? []} max={2} />
                      </TableCell>

                      <TableCell>{getStatusChip(hook.status || 'active')}</TableCell>

                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
                          {hook.last_triggered_at
                            ? new Date(hook.last_triggered_at).toLocaleString()
                            : t('admin.developer.webhooks.table.never')}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ minWidth: 100 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant='determinate'
                            value={hook.success_rate ?? 100}
                            sx={{
                              width: 56,
                              height: 6,
                              borderRadius: 'var(--sf-radius-lg, 12px)',
                              bgcolor: alpha(theme.palette.success.main, 0.1),
                              '& .MuiLinearProgress-bar': { bgcolor: 'success.main' },
                            }}
                          />
                          <Typography variant='caption' sx={{ fontWeight: 800 }}>
                            {hook.success_rate ?? 100}%
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell align='right'>
                        <Stack direction='row' spacing={0.5} justifyContent='flex-end'>
                          <Tooltip title={t('admin.developer.webhooks.table.test_connection')}>
                            <IconButton
                              size='small'
                              onClick={() => handleTest(hook.id)}
                              sx={{
                                color: 'info.main',
                                bgcolor: alpha(theme.palette.info.main, 0.05),
                                '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.12) },
                              }}
                            >
                              <PlayArrow fontSize='small' />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('admin.developer.webhooks.table.delete_webhook')}>
                            <IconButton
                              size='small'
                              onClick={() => {
                                setSelectedWebhookId(hook.id)
                                setIsDeleteDialogOpen(true)
                              }}
                              sx={{
                                color: 'error.main',
                                bgcolor: alpha(theme.palette.error.main, 0.05),
                                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.12) },
                              }}
                            >
                              <Delete fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Rule 11: Info Tip Box */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          borderRadius: 'var(--sf-radius-md, 8px)',
          bgcolor: alpha(theme.palette.info.main, 0.05),
          border: '1px solid',
          borderColor: alpha(theme.palette.info.main, 0.1),
        }}
      >
        <Typography
          variant='subtitle2'
          sx={{
            fontWeight: 800,
            mb: 0.5,
            color: 'info.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            textTransform: 'uppercase',
          }}
        >
          <Info fontSize='small' />
          {t('admin.developer.webhooks.platform_tip.title')}
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
          {t('admin.developer.webhooks.platform_tip.desc')}
        </Typography>
      </Box>

      {/* ── Rule 12: Dialogs ────────────────────────────────────────── */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{ sx: { borderRadius: 'var(--sf-radius-lg, 12px)' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, px: 3, pt: 3 }}>
          {t('admin.developer.webhooks.dialogs.create.title')}
        </DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            {t('admin.developer.webhooks.dialogs.create.desc')}
          </Typography>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Rule 5: Form Fields */}
            <TextField
              fullWidth
              label={t('admin.developer.webhooks.dialogs.create.url_label')}
              placeholder={t('admin.developer.webhooks.dialogs.create.url_placeholder')}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <Link sx={{ mr: 1, color: 'text.disabled', fontSize: 20 }} />,
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 'var(--sf-radius-lg, 12px)' } }}
            />
            <FormControl fullWidth>
              <InputLabel id='events-label'>
                {t('admin.developer.webhooks.dialogs.create.events_label')}
              </InputLabel>
              <Select
                labelId='events-label'
                multiple
                value={selectedEvents}
                onChange={(e) =>
                  setSelectedEvents(
                    typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value,
                  )
                }
                input={
                  <OutlinedInput
                    label={t('admin.developer.webhooks.dialogs.create.events_label')}
                    sx={{ borderRadius: 'var(--sf-radius-lg, 12px)' }}
                  />
                }
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        size='small'
                        sx={{ fontWeight: 700, height: 24 }}
                      />
                    ))}
                  </Box>
                )}
              >
                {AVAILABLE_EVENTS.map((event) => (
                  <MenuItem key={event} value={event}>
                    <Checkbox checked={selectedEvents.indexOf(event) > -1} />
                    <ListItemText
                      primary={event}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Alert
              icon={<Info fontSize='inherit' />}
              severity='info'
              sx={{ borderRadius: 'var(--sf-radius-lg, 12px)' }}
            >
              {t('admin.developer.webhooks.dialogs.create.info_alert')}
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setIsCreateDialogOpen(false)}
            sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'none' }}
          >
            {t('admin.developer.webhooks.dialogs.create.cancel')}
          </Button>
          <Button
            variant='contained'
            onClick={handleCreate}
            disabled={createWebhook.isPending}
            sx={{
              bgcolor: 'info.main',
              borderRadius: 'var(--sf-radius-md, 8px)',
              fontWeight: 700,
              px: 3,
              textTransform: 'none',
              '&:hover': { bgcolor: 'info.dark' },
            }}
          >
            {createWebhook.isPending ? (
              <CircularProgress size={20} color='inherit' />
            ) : (
              t('admin.developer.webhooks.dialogs.create.submit')
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Secret Reveal Dialog */}
      <Dialog
        open={isSecretDialogOpen}
        onClose={() => setIsSecretDialogOpen(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{ sx: { borderRadius: 'var(--sf-radius-lg, 12px)' } }}
      >
        <DialogTitle
          sx={{ fontWeight: 800, px: 3, pt: 3, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <CheckCircle color='success' /> {t('admin.developer.webhooks.dialogs.secret.title')}
        </DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <Alert severity='warning' sx={{ mb: 3, borderRadius: 'var(--sf-radius-lg, 12px)' }}>
            {t('admin.developer.webhooks.dialogs.secret.alert')}
          </Alert>
          <Box
            sx={{
              p: 2.5,
              borderRadius: 'var(--sf-radius-lg, 12px)',
              bgcolor: alpha(theme.palette.text.primary, 0.04),
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'monospace',
            }}
          >
            <Typography
              variant='body2'
              sx={{ fontWeight: 700, letterSpacing: 1, wordBreak: 'break-all' }}
            >
              {secretVisible ? newWebhookSecret : '•'.repeat(32)}
            </Typography>
            <Box sx={{ display: 'flex', flexShrink: 0, ml: 1 }}>
              <IconButton size='small' onClick={() => setSecretVisible(!secretVisible)}>
                {secretVisible ? (
                  <VisibilityOff fontSize='small' />
                ) : (
                  <Visibility fontSize='small' />
                )}
              </IconButton>
              <IconButton
                size='small'
                onClick={() =>
                  handleCopy(
                    newWebhookSecret || '',
                    t('admin.developer.webhooks.dialogs.secret.copy_label'),
                  )
                }
              >
                <ContentCopy fontSize='small' />
              </IconButton>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            variant='contained'
            fullWidth
            onClick={() => setIsSecretDialogOpen(false)}
            sx={{
              borderRadius: 'var(--sf-radius-md, 8px)',
              fontWeight: 700,
              bgcolor: 'text.primary',
              textTransform: 'none',
            }}
          >
            {t('admin.developer.webhooks.dialogs.secret.submit')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{ sx: { borderRadius: 'var(--sf-radius-lg, 12px)' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, px: 3, pt: 3 }}>
          {t('admin.developer.webhooks.dialogs.delete.title')}
        </DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <Typography color='text.secondary'>
            {t('admin.developer.webhooks.dialogs.delete.desc')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setIsDeleteDialogOpen(false)}
            sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'none' }}
          >
            {t('admin.developer.webhooks.dialogs.delete.cancel')}
          </Button>
          <Button
            variant='contained'
            color='error'
            onClick={handleDelete}
            disabled={deleteWebhook.isPending}
            sx={{
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 'var(--sf-radius-md, 8px)',
              px: 3,
            }}
          >
            {deleteWebhook.isPending ? (
              <CircularProgress size={18} color='inherit' />
            ) : (
              t('admin.developer.webhooks.dialogs.delete.submit')
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default WebhookManagement
