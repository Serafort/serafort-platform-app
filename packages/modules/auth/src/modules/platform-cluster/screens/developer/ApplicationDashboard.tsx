import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, TextField, InputAdornment, Avatar, alpha, useTheme, Stack, Chip, IconButton, Menu, MenuItem, ListItemIcon, Paper, Divider, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, OutlinedInput, SelectChangeEvent, CircularProgress } from '@mui/material';
import Search from '@mui/icons-material/Search';
import Add from '@mui/icons-material/Add';
import MoreVert from '@mui/icons-material/MoreVert';
import AppRegistration from '@mui/icons-material/AppRegistration';
import VpnKey from '@mui/icons-material/VpnKey';
import Launch from '@mui/icons-material/Launch';
import History from '@mui/icons-material/History';
import Code from '@mui/icons-material/Code';
import Web from '@mui/icons-material/Web';
import Smartphone from '@mui/icons-material/Smartphone';
import Router from '@mui/icons-material/Router';
import Security from '@mui/icons-material/Security';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import Refresh from '@mui/icons-material/Refresh';
import ContentCopy from '@mui/icons-material/ContentCopy';
import Warning from '@mui/icons-material/Warning';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useOIDCClients, useCreateOIDCClient, useUpdateOIDCClient, useDeleteOIDCClient, useRotateClientSecret } from '@idaas/authentication-core/hooks/useAdminQuery';
import { Path } from '@auth/routes/path';
import { CreateOIDCClientRequest } from '@auth/modules/authentication-core/types/api.types';
import logger from '@idaas/authentication-core/utils/logger';

// Seed new OAuth clients with a redirect URI on the current origin rather than a
// hardcoded dev port, so the suggestion is sensible in every environment.
const DEFAULT_REDIRECT_URI =
  typeof window !== 'undefined' && window.location?.origin
    ? `${window.location.origin}/callback`
    : 'http://localhost:5173/callback';

export default function ApplicationDashboard() {
  const navigate = useNavigate()
  const theme = useTheme()
  const { t } = useTranslation('auth')
  const { data: clientsResponse, isLoading, refetch } = useOIDCClients()
  const createMutation = useCreateOIDCClient()
  const updateMutation = useUpdateOIDCClient()
  const deleteMutation = useDeleteOIDCClient()
  const rotateMutation = useRotateClientSecret()

  const [searchTerm, setSearchTerm] = useState('')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null)

  // Dialog States
  const [appDialogOpen, setAppDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [secretDialogOpen, setSecretDialogOpen] = useState(false)
  const [newSecret, setNewSecret] = useState('')

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    content: string
    onConfirm: () => void
  }>({
    open: false,
    title: '',
    content: '',
    onConfirm: () => {},
  })

  const [formData, setFormData] = useState<CreateOIDCClientRequest>({
    name: '',
    redirectUris: [DEFAULT_REDIRECT_URI],
    grantTypes: ['authorization_code', 'refresh_token'],
    responseTypes: ['code'],
  })

  // Handlers
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, appId: number) => {
    event.stopPropagation()
    setSelectedAppId(appId)
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    setSelectedAppId(null)
  }

  const handleOpenAppDialog = (app?: Record<string, any>) => {
    if (app) {
      setIsEditMode(true)
      setSelectedAppId(app.id)
      setFormData({
        name: app.name || app.client_name,
        redirectUris: app.redirectUris || app.redirect_uris || [DEFAULT_REDIRECT_URI],
        grantTypes: app.grantTypes || app.grant_types || ['authorization_code'],
        responseTypes: app.responseTypes || app.response_types || ['code'],
      })
    } else {
      setIsEditMode(false)
      setSelectedAppId(null)
      setFormData({
        name: '',
        redirectUris: [DEFAULT_REDIRECT_URI],
        grantTypes: ['authorization_code', 'refresh_token'],
        responseTypes: ['code'],
      })
    }
    setAppDialogOpen(true)
    handleCloseMenu()
  }

  const handleSaveApp = () => {
    if (isEditMode && selectedAppId) {
      updateMutation.mutate(
        { id: selectedAppId, data: formData },
        {
          onSuccess: () => {
            setAppDialogOpen(false)
            toast.success(t('admin.developer.applications.messages.update_success'))
          },
          onError: (err: any) => {
            logger.error('Failed to update application', { error: err })
            toast.error(err?.message || t('admin.developer.applications.messages.error_generic'), { },
            )
          },
        },
      )
    } else {
      createMutation.mutate(formData, {
        onSuccess: (res: any) => {
          setAppDialogOpen(false)
          toast.success(t('admin.developer.applications.messages.create_success'), {  })
          if (res.data?.clientSecret || res.data?.client_secret) {
            setNewSecret(res.data.clientSecret || res.data.client_secret)
            setSecretDialogOpen(true)
          }
        },
        onError: (err: any) => {
          logger.error('Failed to create application', { error: err })
          toast.error(err?.message || t('admin.developer.applications.messages.error_generic'), { },
          )
        }, })
    }
  }

  const handleDeleteClient = () => {
    if (selectedAppId) {
      setConfirmDialog({
        open: true,
        title: t('admin.developer.applications.dialogs.confirm.delete_title'),
        content: t('admin.developer.applications.dialogs.confirm.delete_desc'),
        onConfirm: () => {
          deleteMutation.mutate(String(selectedAppId), {
            onSuccess: () => {
              toast.success(t('admin.developer.applications.messages.delete_success'))
            },
            onError: (err: any) => {
              logger.error('Failed to delete application', { error: err })
              toast.error(err?.message || t('admin.developer.applications.messages.error_generic'), { },
              )
            }, })
          setConfirmDialog((prev: any) => ({ ...prev, open: false }))
        },
      })
    }
    handleCloseMenu()
  }

  const handleRotateSecret = () => {
    if (selectedAppId) {
      setConfirmDialog({
        open: true,
        title: t('admin.developer.applications.dialogs.confirm.rotate_title'),
        content: t('admin.developer.applications.dialogs.confirm.rotate_desc'),
        onConfirm: () => {
          rotateMutation.mutate(String(selectedAppId), {
            onSuccess: (res) => {
              toast.success(t('admin.developer.applications.messages.rotate_success'))
              if (res.data?.client_secret) {
                setNewSecret(res.data.client_secret)
                setSecretDialogOpen(true)
              }
            },
            onError: (err: any) => {
              logger.error('Failed to rotate secret', { error: err })
              toast.error(err?.message || t('admin.developer.applications.messages.error_generic'), { },
              )
            }, })
          setConfirmDialog((prev: any) => ({ ...prev, open: false }))
        },
      })
    }
    handleCloseMenu()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.info(t('admin.developer.applications.messages.copied'))
  }

  if (isLoading)
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )

  const clients = clientsResponse?.data || []

  const filteredClients = clients.filter((app: any) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      (app.client_name || '').toLowerCase().includes(searchLower) ||
      (app.client_id || '').toLowerCase().includes(searchLower)
    )
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'spa':
        return <Web />
      case 'native':
        return <Smartphone />
      case 'service':
        return <Router />
      case 'web':
        return <Code />
      case 'saml':
        return <Security />
      default:
        return <AppRegistration />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'suspended':
        return 'error'
      case 'development':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      {/* â”€â”€ Pattern 1: Page Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Avatar
            sx={{
              width: 72,
              height: 72,
              borderRadius: '20px',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
            }}
          >
            <AppRegistration sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant='h4' sx={{ fontWeight: 900, letterSpacing: '-0.027em', mb: 0.5 }}>
              {t('admin.developer.applications.title')}
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              {t('admin.developer.applications.subtitle')}
            </Typography>
          </Box>
        </Box>
        <Button
          variant='contained'
          startIcon={<Add />}
          onClick={() => handleOpenAppDialog()}
          sx={{
            bgcolor: 'info.main',
            boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
            height: 44,
            px: 3,
            borderRadius: 2,
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': { bgcolor: 'info.dark' },
          }}
        >
          {t('admin.developer.applications.new_app')}
        </Button>
      </Box>

      {/* â”€â”€ Search & Filter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Card
        sx={{
          p: 2.5,
          mb: 4,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems='center'>
          <TextField
            fullWidth
            placeholder={t('admin.developer.applications.search_placeholder')}
            size='small'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 3 },
            }}
            sx={{ maxWidth: 500 }}
          />
          <Stack direction='row' spacing={1.5} sx={{ ml: { sm: 'auto' } }}>
            <Button
              startIcon={<History />}
              onClick={() =>
                toast.info('Audit logs feature is not enabled for this application.')
              }
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                color: 'text.secondary',
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
              }}
            >
              {t('admin.developer.applications.logs')}
            </Button>
            <Button
              startIcon={<Refresh />}
              onClick={() => refetch()}
              disabled={isLoading}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                color: 'text.secondary',
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
              }}
            >
              {t('admin.developer.applications.refresh')}
            </Button>
          </Stack>
        </Stack>
      </Card>

      <Grid container spacing={3}>
        {filteredClients.map((app: any) => (
          <Grid key={app.id} size={{ xs: 12, md: 6, lg: 4 }}>
            <Card
              sx={{
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.01),
                  transform: 'translateY(-4px)',
                  boxShadow: `0 12px 24px -10px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main',
                      borderRadius: 2.5,
                      width: 52,
                      height: 52,
                    }}
                  >
                    {getTypeIcon(app.type)}
                  </Avatar>
                  <IconButton
                    size='small'
                    onClick={(e) => handleOpenMenu(e, Number(app.id))}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>

                <Typography variant='h6' sx={{ fontWeight: 900, mb: 0.5 }}>
                  {app.client_name}
                </Typography>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2.5, fontWeight: 700 }}
                >
                  <Code sx={{ fontSize: 14 }} /> {app.client_id}
                </Typography>

                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{
                    mb: 3,
                    lineClamp: 2,
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2,
                    height: 40,
                    overflow: 'hidden',
                  }}
                >
                  {app.description || 'No description provided.'}
                </Typography>

                <Stack direction='row' spacing={1} sx={{ mb: 3 }}>
                  <Chip
                    label={app.status}
                    size='small'
                    color={getStatusColor(app.status) as any}
                    sx={{
                      fontWeight: 900,
                      borderRadius: 1.5,
                      height: 22,
                      fontSize: '0.65rem',
                      textTransform: 'uppercase',
                    }}
                  />
                  {app.is_fapi_compliant && (
                    <Chip
                      label='FAPI 2.0'
                      size='small'
                      sx={{
                        fontWeight: 900,
                        borderRadius: 1.5,
                        height: 22,
                        fontSize: '0.65rem',
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        color: 'info.main',
                      }}
                    />
                  )}
                </Stack>

                <Divider sx={{ mb: 3, opacity: 0.6 }} />

                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Box>
                    <Typography
                      variant='caption'
                      color='text.disabled'
                      sx={{
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'block',
                        mb: 0.25,
                      }}
                    >
                      {t('admin.developer.applications.card.secret_label')}
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        fontWeight: 700,
                        color: app.client_secret ? 'text.primary' : 'text.disabled',
                      }}
                    >
                      {app.client_secret
                        ? 'â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ ab2c'
                        : t('admin.developer.applications.card.pkce_protected')}
                    </Typography>
                  </Box>
                  <Button
                    size='small'
                    variant='contained'
                    endIcon={<Launch />}
                    onClick={() => navigate(Path.admin.appDetail.replace(':id', String(app.id)))}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 800,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                      boxShadow: 'none',
                    }}
                  >
                    {t('admin.developer.applications.card.details')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Box
            onClick={() => handleOpenAppDialog()}
            sx={{
              height: '100%',
              minHeight: 250,
              borderRadius: 4,
              border: '2px dashed',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              bgcolor: alpha(theme.palette.background.paper, 0.5),
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.02),
                '& .MuiAvatar-root': { bgcolor: 'primary.main', color: 'white' },
              },
            }}
          >
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.action.hover, 0.8),
                color: 'text.secondary',
                mb: 2.5,
                transition: 'all 0.2s',
                width: 56,
                height: 56,
              }}
            >
              <Add sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant='subtitle1' sx={{ fontWeight: 900 }}>
              {t('admin.developer.applications.empty.title')}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
              {t('admin.developer.applications.empty.desc')}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* App Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 200,
            mt: 1,
            boxShadow: '0px 10px 40px rgba(0,0,0,0.12)',
            border: '1px solid',
            borderColor: 'divider',
            p: 1,
          },
        }}
      >
        <MenuItem
          onClick={() => handleOpenAppDialog(clients.find((c: any) => c.id === selectedAppId))}
          sx={{ borderRadius: 2, py: 1.25 }}
        >
          <ListItemIcon>
            <Edit fontSize='small' />
          </ListItemIcon>
          <Typography variant='body2' sx={{ fontWeight: 700 }}>
            {t('admin.developer.applications.menu.edit')}
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleRotateSecret} sx={{ borderRadius: 2, py: 1.25 }}>
          <ListItemIcon>
            <VpnKey fontSize='small' />
          </ListItemIcon>
          <Typography variant='body2' sx={{ fontWeight: 700 }}>
            {t('admin.developer.applications.menu.rotate')}
          </Typography>
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem
          onClick={handleDeleteClient}
          sx={{ color: 'error.main', borderRadius: 2, py: 1.25 }}
        >
          <ListItemIcon>
            <Delete fontSize='small' color='error' />
          </ListItemIcon>
          <Typography variant='body2' sx={{ fontWeight: 700 }}>
            {t('admin.developer.applications.menu.delete')}
          </Typography>
        </MenuItem>
      </Menu>

      {/* Add / Edit App Dialog */}
      <Dialog
        open={appDialogOpen}
        onClose={() => setAppDialogOpen(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, px: 3, pt: 3 }}>
          {isEditMode
            ? t('admin.developer.applications.dialogs.create.title_edit')
            : t('admin.developer.applications.dialogs.create.title_new')}
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label={t('admin.developer.applications.dialogs.create.name_label')}
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('admin.developer.applications.dialogs.create.name_placeholder')}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <TextField
              label={t('admin.developer.applications.dialogs.create.redirect_label')}
              fullWidth
              required
              multiline
              rows={2}
              value={formData.redirectUris?.join(', ')}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  redirectUris: e.target.value.split(',').map((u) => u.trim()),
                })
              }
              placeholder={t('admin.developer.applications.dialogs.create.redirect_placeholder')}
              helperText={t('admin.developer.applications.dialogs.create.redirect_helper')}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <FormControl fullWidth>
              <InputLabel>
                {t('admin.developer.applications.dialogs.create.grant_label')}
              </InputLabel>
              <Select<string[]>
                multiple
                value={formData.grantTypes || []}
                onChange={(e: SelectChangeEvent<string[]>) => {
                  const value = e.target.value
                  setFormData({
                    ...formData,
                    grantTypes: typeof value === 'string' ? value.split(',') : value,
                  })
                }}
                input={
                  <OutlinedInput
                    label={t('admin.developer.applications.dialogs.create.grant_label')}
                    sx={{ borderRadius: 3 }}
                  />
                }
                renderValue={(selected: string[]) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        size='small'
                        sx={{ fontWeight: 700, borderRadius: 1.5 }}
                      />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value='authorization_code'>Authorization Code</MenuItem>
                <MenuItem value='implicit'>Implicit</MenuItem>
                <MenuItem value='password'>Resource Owner Password</MenuItem>
                <MenuItem value='client_credentials'>Client Credentials</MenuItem>
                <MenuItem value='refresh_token'>Refresh Token</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setAppDialogOpen(false)}
            sx={{ fontWeight: 700, textTransform: 'none', color: 'text.secondary' }}
          >
            {t('admin.developer.applications.dialogs.create.cancel')}
          </Button>
          <Button
            variant='contained'
            onClick={handleSaveApp}
            disabled={
              createMutation.isPending ||
              updateMutation.isPending ||
              !formData.name ||
              !formData.redirectUris?.length
            }
            sx={{
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              bgcolor: 'info.main',
            }}
          >
            {createMutation.isPending || updateMutation.isPending
              ? t('admin.developer.applications.dialogs.create.saving')
              : isEditMode
                ? t('admin.developer.applications.dialogs.create.submit_edit')
                : t('admin.developer.applications.dialogs.create.submit_new')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Secret Display Dialog */}
      <Dialog
        open={secretDialogOpen}
        onClose={() => setSecretDialogOpen(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle
          sx={{
            fontWeight: 900,
            color: 'warning.main',
            display: 'flex',
            gap: 1.5,
            alignItems: 'center',
            px: 3,
            pt: 3,
          }}
        >
          <Security /> {t('admin.developer.applications.dialogs.secret.title')}
        </DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3, lineHeight: 1.6 }}>
            {t('admin.developer.applications.dialogs.secret.desc')}
          </Typography>
          <Paper
            variant='outlined'
            sx={{
              p: 2.5,
              bgcolor: alpha(theme.palette.warning.main, 0.05),
              borderColor: alpha(theme.palette.warning.main, 0.2),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 3,
            }}
          >
            <Typography
              variant='body2'
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                wordBreak: 'break-all',
                mr: 2,
                fontSize: '0.95rem',
              }}
            >
              {newSecret}
            </Typography>
            <IconButton color='primary' onClick={() => copyToClipboard(newSecret)}>
              <ContentCopy />
            </IconButton>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            variant='contained'
            fullWidth
            onClick={() => setSecretDialogOpen(false)}
            sx={{
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: 2.5,
              py: 1.25,
              bgcolor: 'text.primary',
            }}
          >
            {t('admin.developer.applications.dialogs.secret.submit')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modern Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog((prev: any) => ({ ...prev, open: false }))}
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle
          sx={{ fontWeight: 900, display: 'flex', gap: 1.5, alignItems: 'center', px: 3, pt: 3 }}
        >
          <Warning color='warning' /> {confirmDialog.title}
        </DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
            {confirmDialog.content}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setConfirmDialog((prev: any) => ({ ...prev, open: false }))}
            sx={{ fontWeight: 700, textTransform: 'none', color: 'text.secondary' }}
          >
            {t('admin.developer.applications.dialogs.confirm.cancel')}
          </Button>
          <Button
            variant='contained'
            color='error'
            onClick={confirmDialog.onConfirm}
            sx={{ fontWeight: 800, textTransform: 'none', borderRadius: 2, px: 3 }}
          >
            {t('admin.developer.applications.dialogs.confirm.confirm_button')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

