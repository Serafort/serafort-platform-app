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
import Webhook from '@mui/icons-material/Webhook';
import Add from '@mui/icons-material/Add';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Delete from '@mui/icons-material/Delete';
import PlayArrow from '@mui/icons-material/PlayArrow';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ContentCopy from '@mui/icons-material/ContentCopy';
import Info from '@mui/icons-material/Info';
import Link from '@mui/icons-material/Link';
import Settings from '@mui/icons-material/Settings';
import NotificationsActive from '@mui/icons-material/NotificationsActive';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify';
import logger from '@idaas/authentication-core/utils/logger'
import {
  useWebhooks,
  useCreateWebhook,
  useDeleteWebhook,
  useTestWebhook,
} from '@idaas/authorization-engine/hooks'

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

// â”€â”€ Chip overflow helper: show max N chips + "+X more" badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
            fontSize: 11,
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
              fontSize: 11,
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
  const navigate = useNavigate()
  // â”€â”€ Queries & Mutations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { data: webhooksData, isLoading } = useWebhooks()
  const createWebhook = useCreateWebhook()
  const deleteWebhook = useDeleteWebhook()
  const testWebhook = useTestWebhook()

  const webhooks = (webhooksData?.data as any)?.data ?? webhooksData?.data ?? []

  // â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSecretDialogOpen, setIsSecretDialogOpen] = useState(false)
  const [selectedWebhookId, setSelectedWebhookId] = useState<string | number | null>(null)
  const [newWebhookSecret, setNewWebhookSecret] = useState<string | null>(null)

  // Create Form State
  const [url, setUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [secretVisible, setSecretVisible] = useState(false)

  // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleCreate = () => {
    if (!url || selectedEvents.length === 0) {
      toast.warning(t('admin.developer.webhooks.messages.form_error'))
      return
    }

    createWebhook.mutate(
      { url, events: selectedEvents },
      {
        onSuccess: (response: any) => {
          toast.success(t('admin.developer.webhooks.messages.create_success'))
          setIsCreateDialogOpen(false)
          setUrl('')
          setSelectedEvents([])
          if (response?.data?.secret) {
            setNewWebhookSecret(response.data.secret)
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
      onSuccess: () =>
        toast.success(t('admin.developer.webhooks.messages.test_success')),
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

  // â”€â”€ Render Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const getStatusChip = (status: string) => {
    const isFailing = status === 'failing'
    const isDisabled = status === 'disabled'
    return (
      <Chip
        label={status.toUpperCase()}
        size='small'
        sx={{
          fontWeight: 900,
          fontSize: 10,
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
      {/* â”€â”€ Rule 2: Page Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Entity avatar OR icon avatar - Strict Rule 2/34 */}
          <Avatar
            sx={{
              width: { xs: 56, md: 80 },
              height: { xs: 56, md: 80 },
              borderRadius: '24px',
              bgcolor: alpha(theme.palette.secondary.main, 0.12),
              color: 'secondary.main',
            }}
          >
            <Webhook sx={{ fontSize: { xs: 28, md: 40 } }} />
          </Avatar>
          <Box>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{
                p: 0,
                minWidth: 'auto',
                textTransform: 'none',
                color: 'text.secondary',
                '&:hover': { bgcolor: 'transparent', color: 'primary.main' },
              }}
            >
              {t('admin.developer.webhooks.back_to_dashboard')}
            </Button>
            <Typography
              variant='h4'
              sx={{
                fontWeight: 900,
                letterSpacing: '-0.027em',
                fontSize: { xs: '1.5rem', md: '2.125rem' },
              }}
            >
              {t('admin.developer.webhooks.title')}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {t('admin.developer.webhooks.subtitle')}
            </Typography>
          </Box>
        </Box>

        <Button
          variant='contained'
          startIcon={<Add />}
          onClick={() => setIsCreateDialogOpen(true)}
          sx={{
            bgcolor: 'info.main',
            color: 'white',
            boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
            height: 44,
            px: 3,
            borderRadius: 2,
            fontWeight: 700,
            textTransform: 'none',
            flex: { xs: 1, sm: 'none' },
            '&:hover': { bgcolor: 'info.dark' },
          }}
        >
          {t('admin.developer.webhooks.create_button')}
        </Button>
      </Box>

      {/* â”€â”€ Rule 7: Stats Cards Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
            value: webhooks.filter((w: any) => w.status !== 'disabled').length,
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
                borderRadius: 4,
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
                    borderRadius: 3,
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
                  <Typography variant='h5' sx={{ fontWeight: 900, lineHeight: 1.1 }}>
                    {stat.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* â”€â”€ Main Section: Configured Webhooks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Card
        sx={{
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
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
                  borderRadius: 4,
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
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
              >
                {t('admin.developer.webhooks.empty.button')}
              </Button>
            </Box>
          ) : (
            <TableContainer
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                overflow: 'hidden',
              }}
            >
              <Table size='small'>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 900, py: 2 }}>
                      {t('admin.developer.webhooks.table.url')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>
                      {t('admin.developer.webhooks.table.events')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>
                      {t('admin.developer.webhooks.table.status')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 900, display: { xs: 'none', md: 'table-cell' } }}>
                      {t('admin.developer.webhooks.table.last_triggered')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 900 }}>
                      {t('admin.developer.webhooks.table.success')}
                    </TableCell>
                    <TableCell align='right' sx={{ fontWeight: 900 }}>
                      {t('admin.developer.webhooks.table.actions')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {webhooks.map((hook: any) => (
                    <TableRow key={hook.id} hover sx={{ '& td': { py: 2 } }}>
                      {/* Rule 8/116: URL â€” long text truncation with Tooltip */}
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

                      {/* Rule 8/117: Events â€” overflow chips */}
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
                              borderRadius: 3,
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
          borderRadius: 2,
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

      {/* â”€â”€ Rule 12: Dialogs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, px: 3, pt: 3 }}>
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
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
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
                    sx={{ borderRadius: 3 }}
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
            <Alert icon={<Info fontSize='inherit' />} severity='info' sx={{ borderRadius: 3 }}>
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
              borderRadius: 2,
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
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle
          sx={{ fontWeight: 900, px: 3, pt: 3, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <CheckCircle color='success' /> {t('admin.developer.webhooks.dialogs.secret.title')}
        </DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <Alert severity='warning' sx={{ mb: 3, borderRadius: 3 }}>
            {t('admin.developer.webhooks.dialogs.secret.alert')}
          </Alert>
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
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
              {secretVisible ? newWebhookSecret : 'â€¢'.repeat(32)}
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
              borderRadius: 2,
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
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, px: 3, pt: 3 }}>
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
            sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 2, px: 3 }}
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
