import React, { useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  alpha,
  useTheme,
  Stack,
  Switch,
  Tabs,
  Tab,
  IconButton,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material'
import Save from '@mui/icons-material/Save'
import ArrowBack from '@mui/icons-material/ArrowBack'
import Security from '@mui/icons-material/Security'
import ContentCopy from '@mui/icons-material/ContentCopy'
import Refresh from '@mui/icons-material/Refresh'
import Info from '@mui/icons-material/Info'
import Code from '@mui/icons-material/Code'
import Web from '@mui/icons-material/Web'
import Smartphone from '@mui/icons-material/Smartphone'
import Router from '@mui/icons-material/Router'
import Settings from '@mui/icons-material/Settings'
import VpnKey from '@mui/icons-material/VpnKey'
import Tune from '@mui/icons-material/Tune'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  useOIDCClient,
  useUpdateOIDCClient,
  useRotateClientSecret,
} from '@idaas/authentication-core/hooks/useAdminQuery'
import { Path } from '@cap/module-auth/routes/path'
import ConfirmationDialog from '@idaas/authentication-core/components/shared/Modals/ConfirmationDialog'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
  sx?: import('@mui/system').SxProps<import('@mui/material').Theme>
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, sx, ...other } = props
  return (
    <div role='tabpanel' hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3, ...(sx as any) }}>{children}</Box>}
    </div>
  )
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'spa':
      return <Web />
    case 'native':
      return <Smartphone />
    case 'service':
      return <Router />
    default:
      return <Code />
  }
}

export default function ApplicationDetailView() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const theme = useTheme()
  const { id } = useParams()
  const { data: clientResponse, isLoading } = useOIDCClient(id)
  const updateMutation = useUpdateOIDCClient()
  const rotateSecretMutation = useRotateClientSecret()
  const [tab, setTab] = useState(0)
  const [showRotateConfirm, setShowRotateConfirm] = useState(false)

  const [formData, setFormData] = useState<{
    name: string
    description: string
  } | null>(null)

  const appData = clientResponse?.data

  const [lastSyncId, setLastSyncId] = useState<string | number | undefined>(undefined)
  if (appData && appData.id !== lastSyncId) {
    setLastSyncId(appData.id)
    setFormData({
      name: appData.client_name || '',
      description: appData.description || '',
    })
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!appData) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity='error'>
          {t('auth.admin.errorAppNotFound') || 'Application not found or failed to load.'}
        </Alert>
      </Box>
    )
  }

  const handleSave = () => {
    if (!id || !formData) return

    updateMutation.mutate(
      {
        id: id as any,
        data: {
          name: formData.name,
          description: formData.description,
        },
      },
      {
        onSuccess: () => {
          toast.success(t('auth.admin.successUpdateApp'))
        },
        onError: (error: any) => {
          toast.error(error.message || t('auth.admin.errorUpdateApp'))
        },
      },
    )
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} ${t('auth.admin.copied') || 'copied to clipboard'}`, {
        autoClose: 2000,
      })
    })
  }

  const handleRotateSecret = () => {
    if (!id) return
    setShowRotateConfirm(true)
  }

  const onRotateConfirm = () => {
    if (!id) return
    rotateSecretMutation.mutate(id as any, {
      onSuccess: () => {
        toast.success(
          t('auth.admin.successRotateSecret') || 'Client secret rotated successfully',
          {},
        )
        setShowRotateConfirm(false)
      },
      onError: (error: any) => {
        toast.error(
          error.message || t('auth.admin.errorRotateSecret') || 'Failed to rotate client secret',
          {},
        )
        setShowRotateConfirm(false)
      },
    })
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Hero row: avatar + title + CTA */}
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
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                width: { xs: 56, md: 80 },
                height: { xs: 56, md: 80 },
                borderRadius: '24px',
                bgcolor: 'primary.main',
                color: 'white',
                boxShadow: (theme) => `0 12px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              {getTypeIcon(appData.type ?? 'web')}
            </Avatar>
            <Box
              sx={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                width: 24,
                height: 24,
                bgcolor: 'success.main',
                borderRadius: '50%',
                border: '4px solid',
                borderColor: 'background.paper',
              }}
            />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(Path.admin.applications)}
                sx={{
                  p: 0,
                  minWidth: 'auto',
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'transparent', color: 'primary.main' },
                }}
              />
              <Typography
                variant='h4'
                sx={{
                  fontWeight: 900,
                  letterSpacing: '-0.027em',
                  fontSize: { xs: '1.5rem', md: '2.125rem' },
                }}
              >
                {appData.client_name}
              </Typography>
            </Box>
            <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap'>
              <Typography variant='body2' color='text.secondary'>
                ID: {appData.client_id}
              </Typography>
              {appData.is_fapi_compliant && (
                <Chip
                  label='FAPI 2.0'
                  size='small'
                  color='primary'
                  variant='filled'
                  sx={{ fontWeight: 900, height: 20, fontSize: '0.65rem' }}
                />
              )}
              <Chip
                label={t('auth.admin.active').toUpperCase()}
                size='small'
                color='success'
                variant='outlined'
                sx={{ fontWeight: 700, height: 20 }}
              />
            </Stack>
          </Box>
        </Box>
        <Stack
          direction='row'
          spacing={2}
          sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}
        >
          <Button
            variant='contained'
            startIcon={<Save />}
            onClick={handleSave}
            disabled={updateMutation.isPending}
            sx={{
              bgcolor: 'info.main',
              color: 'white',
              boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
              '&:hover': { bgcolor: 'info.dark' },
              textTransform: 'none',
              fontWeight: 700,
              flex: { xs: 1, sm: 'none' },
              height: 44,
              px: 3,
            }}
          >
            {updateMutation.isPending ? t('auth.common.saving') : t('auth.common.saveChanges')}
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Tabs
          value={tab}
          onChange={(_: React.SyntheticEvent, v: number) => setTab(v)}
          sx={{
            mb: 2,
            '& .MuiTab-root': {
              textTransform: 'uppercase',
              fontWeight: 700,
              minWidth: 100,
              fontSize: '0.8125rem',
              letterSpacing: '0.05em',
            },
          }}
        >
          <Tab icon={<Settings />} iconPosition='start' label={t('auth.admin.generalSettings')} />
          <Tab icon={<Security />} iconPosition='start' label={t('auth.admin.authConfig')} />
          <Tab icon={<VpnKey />} iconPosition='start' label={t('auth.admin.credentials')} />
          <Tab icon={<Tune />} iconPosition='start' label={t('auth.admin.scopes')} />
        </Tabs>
      </Box>

      <TabPanel value={tab} index={0}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Settings color='primary' sx={{ fontSize: 24 }} />
                  <Typography
                    variant='h6'
                    sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  >
                    {t('auth.admin.appProfile')}
                  </Typography>
                </Box>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label={t('auth.admin.appName')}
                    value={formData?.name || ''}
                    onChange={(e) => setFormData({ ...formData!, name: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label={t('auth.admin.description')}
                    value={formData?.description || ''}
                    onChange={(e) => setFormData({ ...formData!, description: e.target.value })}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Info sx={{ color: 'primary.main' }} />
                  <Typography variant='subtitle1' sx={{ fontWeight: 800 }}>
                    {t('auth.admin.metadata').toUpperCase()}
                  </Typography>
                </Box>
                <Stack spacing={2}>
                  <Box>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.075em',
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      {t('auth.admin.created').toUpperCase()}
                    </Typography>
                    <Typography variant='body2' sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {appData.created_at
                        ? new Date(appData.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : '-'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.075em',
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      {t('auth.admin.lastUpdated').toUpperCase()}
                    </Typography>
                    <Typography variant='body2' sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {appData.updated_at
                        ? new Date(appData.updated_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : '-'}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

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
                  mb: 1,
                  color: 'info.main',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Info fontSize='small' />
                PLATFORM TIP
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
                Native and SPA apps must use PKCE. Avoid Client Secret Basic for public clients.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Security color='primary' sx={{ fontSize: 24 }} />
                  <Typography
                    variant='h6'
                    sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  >
                    {t('auth.admin.oidcConfig')}
                  </Typography>
                </Box>
                <Stack spacing={4}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.1),
                    }}
                  >
                    <Stack direction='row' justifyContent='space-between' alignItems='center'>
                      <Box>
                        <Typography variant='subtitle1' sx={{ fontWeight: 800 }}>
                          {t('auth.admin.fapi2Compliance')}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          Require PAR, PKCE S256, and DPoP binding.
                        </Typography>
                      </Box>
                      <Switch
                        checked={appData.is_fapi_compliant}
                        onChange={(e) =>
                          updateMutation.mutate(
                            {
                              id: appData.id,
                              data: { is_fapi_compliant: e.target.checked },
                            },
                            {
                              onSuccess: () => {
                                toast.success(t('auth.admin.successUpdateApp'))
                              },
                              onError: (error: any) => {
                                toast.error(error.message || t('auth.admin.errorUpdateApp'))
                              },
                            },
                          )
                        }
                      />
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant='subtitle2' sx={{ fontWeight: 800, mb: 2 }}>
                      {t('auth.admin.redirectUris')}
                    </Typography>
                    <Stack spacing={1}>
                      {appData.redirect_uris?.map((uri: string, idx: number) => (
                        <TextField
                          key={idx}
                          fullWidth
                          defaultValue={uri}
                          slotProps={{
                            input: {
                              endAdornment: (
                                <InputAdornment position='end'>
                                  <IconButton size='small'>
                                    <Refresh fontSize='inherit' />
                                  </IconButton>
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant='subtitle2' sx={{ fontWeight: 800, mb: 2 }}>
                      {t('auth.admin.grantTypes')}
                    </Typography>
                    <Stack direction='row' spacing={2}>
                      {appData.grant_types?.map((gt: string) => (
                        <Chip
                          key={gt}
                          label={gt}
                          onClick={() => {}}
                          color='primary'
                          sx={{ fontWeight: 700 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Info sx={{ color: 'primary.main' }} />
                  <Typography variant='subtitle1' sx={{ fontWeight: 800 }}>
                    {t('auth.admin.quickReference').toUpperCase()}
                  </Typography>
                </Box>
                <Stack spacing={2}>
                  <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 700 }}>
                    {t('auth.admin.fapi2Implications')}:
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant='body2'>
                      â€¢ {t('auth.admin.fapi2MandatoryPkce')}
                    </Typography>
                    <Typography variant='body2'>â€¢ {t('auth.admin.fapi2DpopRequired')}</Typography>
                    <Typography variant='body2'>â€¢ {t('auth.admin.fapi2ParRequired')}</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

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
                  mb: 1,
                  color: 'info.main',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Info fontSize='small' />
                {t('auth.admin.securityTip').toUpperCase()}
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
                {t('auth.admin.fapi2Tip')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <VpnKey color='primary' sx={{ fontSize: 24 }} />
                  <Typography
                    variant='h6'
                    sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  >
                    {t('auth.admin.appCredentials')}
                  </Typography>
                </Box>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
                  Your client secret is an authentication key. Keep it confidential.
                </Typography>

                <Stack spacing={4}>
                  <Box>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.075em',
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      {t('auth.admin.clientId').toUpperCase()}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField fullWidth value={appData.client_id} disabled />
                      <IconButton
                        onClick={() => handleCopy(appData.client_id, t('auth.admin.clientId'))}
                      >
                        <ContentCopy />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.075em',
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      {t('auth.admin.clientSecret').toUpperCase()}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        fullWidth
                        type='password'
                        value={appData.client_secret || ''}
                        disabled
                      />
                      <IconButton
                        onClick={() =>
                          handleCopy(appData.client_secret || '', t('auth.admin.clientSecret'))
                        }
                        disabled={!appData.client_secret}
                      >
                        <ContentCopy />
                      </IconButton>
                      <IconButton
                        onClick={handleRotateSecret}
                        disabled={rotateSecretMutation.isPending}
                        color='primary'
                      >
                        {rotateSecretMutation.isPending ? (
                          <CircularProgress size={24} />
                        ) : (
                          <Refresh />
                        )}
                      </IconButton>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Security sx={{ color: 'primary.main' }} />
                  <Typography variant='subtitle1' sx={{ fontWeight: 800 }}>
                    {t('auth.admin.securityNotice').toUpperCase()}
                  </Typography>
                </Box>
                <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                  {t('auth.admin.secretExposureWarning')}
                </Typography>
                <Divider />
              </CardContent>
            </Card>

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
                  mb: 1,
                  color: 'info.main',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Info fontSize='small' />
                {t('auth.admin.credentialTip').toUpperCase()}
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
                {t('auth.admin.rotateSecretTip')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={3}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Tune color='primary' sx={{ fontSize: 24 }} />
                  <Typography
                    variant='h6'
                    sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  >
                    {t('auth.admin.requestedScopes')}
                  </Typography>
                </Box>
                <List>
                  {appData.scope?.split(' ')?.map((scope: string) => (
                    <ListItem
                      key={scope}
                      sx={{ px: 0, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}
                      secondaryAction={<Switch defaultChecked />}
                    >
                      <ListItemIcon sx={{ minWidth: 44 }}>
                        <Security color='primary' />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography sx={{ fontWeight: 800 }}>{scope}</Typography>}
                        secondary="Grants access to user's identity data."
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Tune sx={{ color: 'primary.main' }} />
                  <Typography variant='subtitle1' sx={{ fontWeight: 800 }}>
                    {t('auth.admin.scopeGuide').toUpperCase()}
                  </Typography>
                </Box>
                <Stack spacing={2}>
                  <Box>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.075em',
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      {t('auth.admin.totalScopes').toUpperCase()}
                    </Typography>
                    <Typography variant='body2' sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {appData.scope?.split(' ')?.length || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.075em',
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      {t('auth.admin.activeScopes').toUpperCase()}
                    </Typography>
                    <Typography variant='body2' sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {appData.scope?.split(' ')?.length || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.075em',
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      {t('auth.admin.activeScopes').toUpperCase()}
                    </Typography>
                    <Typography variant='body2' sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {appData.scope?.split(' ')?.length || 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.075em',
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      {t('auth.admin.activeScopes').toUpperCase()}
                    </Typography>
                    <Typography variant='body2' sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {appData.scope?.split(' ')?.length || 0}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

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
                  mb: 1,
                  color: 'info.main',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Info fontSize='small' />
                {t('auth.admin.scopeTip').toUpperCase()}
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
                {t('auth.admin.minimizeConsentTip')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </TabPanel>

      <ConfirmationDialog
        open={showRotateConfirm}
        onClose={() => setShowRotateConfirm(false)}
        onConfirm={onRotateConfirm}
        title={t('auth.admin.rotateSecretTitle') || 'Rotate Client Secret'}
        message={
          t('auth.admin.confirmRotateSecret') ||
          'Are you sure you want to rotate the client secret? This will invalidate the old one immediately and may break existing integrations.'
        }
        confirmLabel={t('auth.admin.rotateSecret') || 'Rotate Secret'}
        cancelLabel={t('auth.common.cancel') || 'Cancel'}
        isSubmitting={rotateSecretMutation.isPending}
        severity='warning'
      />
    </Box>
  )
}
