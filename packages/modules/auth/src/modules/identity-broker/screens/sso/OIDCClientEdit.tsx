// FILE: packages/modules/auth/src/screens/auth/sso/OIDCClientEdit.tsx
// RULES APPLIED: mui-component-standards.md, react-component-patterns.md

import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  TextField,
  IconButton,
  alpha,
  useTheme,
  Avatar,
  Breadcrumbs,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  AlertTitle,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import Edit from '@mui/icons-material/Edit'
import ContentCopy from '@mui/icons-material/ContentCopy'
import ChevronRight from '@mui/icons-material/ChevronRight'
import ArrowBack from '@mui/icons-material/ArrowBack'
import Warning from '@mui/icons-material/Warning'

import Refresh from '@mui/icons-material/Refresh'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify';
import { Path, useOIDCClient, useUpdateOIDCClient, useRotateClientSecret } from '@auth'
import { buildLayoutSurfaceEffect } from '@cap/layout'
import { getTenantThemeEffects } from '@cap/theme'

const updateOidcSchema = z.object({
  name: z.string().min(3, 'Client Name must be at least 3 characters').max(50),
  redirectUris: z.string().min(1, 'At least one redirect URI is required').url('Must be a valid URL'),
  grantTypes: z.array(z.string()).min(1, 'Select at least one grant type'),
  responseTypes: z.array(z.string()).min(1, 'Select at least one response type'),
  description: z.string().optional(),
})

type OidcFormData = z.infer<typeof updateOidcSchema>

export default function OIDCClientEdit() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const theme = useTheme()
  const navigate = useNavigate()
  const { data: clientResponse, isLoading, isError } = useOIDCClient(id)
  const updateMutation = useUpdateOIDCClient()
  const rotateMutation = useRotateClientSecret()

  const [rotateDialogOpen, setRotateDialogOpen] = useState(false)
  const [newSecret, setNewSecret] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<OidcFormData>({
    resolver: zodResolver(updateOidcSchema),
    defaultValues: {
      name: '',
      redirectUris: '',
      grantTypes: [],
      responseTypes: [],
      description: '',
    },
  })

  useEffect(() => {
    if (clientResponse?.data) {
      const client = clientResponse.data as any
      setValue('name', client.client_name || client.name || '')
      setValue('redirectUris', (client.redirect_uris || client.redirectUris || []).join('\\n'))
      setValue('grantTypes', client.grant_types || client.grantTypes || [])
      setValue('responseTypes', client.response_types || client.responseTypes || [])
      setValue('description', client.description || '')
    }
  }, [clientResponse, setValue])

  const onSubmit = (data: OidcFormData) => {
    if (!id) return

    const redirectUrisList = data.redirectUris
      .split(/[,\n]+/)
      .map((uri) => uri.trim())
      .filter((uri) => uri.length > 0)

    const payload = {
      ...data,
      redirectUris: redirectUrisList,
    }

    updateMutation.mutate({ id, data: payload }, {
      onSuccess: () => {
        toast.success(t('auth.sso.client_updated', 'OIDC Client updated successfully'))
        navigate(Path.identity.oidcConfigBrowser)
      },
      onError: (err: any) => {
        toast.error(err.message || t('common.error', 'An error occurred'))
      },
    })
  }

  const handleRotateSecret = () => {
    if (!id) return
    rotateMutation.mutate(id, {
      onSuccess: (res) => {
        setRotateDialogOpen(false)
        setNewSecret(res.data.client_secret)
        toast.success(t('auth.sso.secret_rotated', 'Client secret rotated successfully'))
      },
      onError: (err: any) => {
        setRotateDialogOpen(false)
        toast.error(err.message || t('common.error', 'Failed to rotate secret'))
      }
    })
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(t('common.copied_item', { item: label, defaultValue: `${label} copied to clipboard` }))
  }

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (isError || !clientResponse?.data) {
    return (
      <Container maxWidth="md" sx={{ py: 10 }}>
        <Alert severity="error">
          <AlertTitle>{t('common.error', 'Error')}</AlertTitle>
          {t('auth.sso.client_load_error', 'Failed to load client details.')}
        </Alert>
        <Button
          component={RouterLink}
          to={Path.identity.oidcConfigBrowser}
          startIcon={<ArrowBack />}
          sx={{ mt: 3 }}
        >
          {t('common.back_to_list', 'Back to OIDC Clients')}
        </Button>
      </Container>
    )
  }

  return (
    <Container
      maxWidth="md"
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      sx={{ py: 6 }}
      className='animate-scale-in'
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          component={RouterLink}
          to={Path.identity.oidcConfigBrowser}
          startIcon={<ArrowBack />}
          sx={{ mb: 2, color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'transparent' } }}
        >
          {t('common.back_to_list', 'Back to OIDC Clients')}
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              borderRadius: '20px',
              bgcolor: 'primary.main',
              boxShadow: (theme) => `0 12px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <Edit sx={{ fontSize: '2rem' }} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.027em' }}>
              {t('auth.sso.edit_oidc_client', 'Edit Client Details')}
            </Typography>
            <Breadcrumbs separator={<ChevronRight sx={{ fontSize: 12, color: 'text.disabled' }} />}>
              <Typography variant="body2" color="text.secondary">
                OIDC Configuration
              </Typography>
              <Typography variant="body2" color="text.primary" fontWeight={600}>
                Edit Client
              </Typography>
            </Breadcrumbs>
          </Box>
        </Box>
      </Box>

      {/* Secret Rotation Alert (if rotated) */}
      {newSecret && (
        <Card
          sx={(theme: any) => ({
            p: 4,
            mb: 4,
            borderRadius: 4,
            border: '1px solid ' + theme.palette.warning.main,
            ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
          })}
          component={motion.div}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Alert severity="warning" icon={false} sx={{ mb: 4, bgcolor: 'transparent', p: 0 }}>
            <AlertTitle sx={{ typography: 'h6', fontWeight: 800 }}>
              {t('auth.sso.client_secret_rotated', 'Client Secret Rotated')}
            </AlertTitle>
            <Typography variant="body2" color="text.secondary">
              {t('auth.sso.client_secret_warning', 'Please copy your new Client Secret now. For security reasons, it cannot be retrieved again.')}
            </Typography>
          </Alert>
          <Box>
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>
              NEW CLIENT SECRET
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 600,
                  color: 'error.main',
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  p: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.error.main, 0.3),
                  flexGrow: 1,
                  wordBreak: 'break-all',
                }}
              >
                {newSecret}
              </Typography>
              <Tooltip title="Copy Secret">
                <IconButton onClick={() => handleCopy(newSecret, 'Client Secret')} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                  <ContentCopy />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Card>
      )}

      <Card
        sx={(theme: any) => ({
          borderRadius: 4,
          mb: 4,
          border: '1px solid ' + theme.palette.divider,
          ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
        })}
      >
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 4 }}>
          {/* Client ID readonly display */}
          <Box sx={{ mb: 4, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.02), borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1) }}>
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>
              CLIENT ID
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Typography variant="body2" sx={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'text.primary' }}>
                {(clientResponse.data as any).client_id || (clientResponse.data as any).clientId}
              </Typography>
              <Tooltip title="Copy Client ID">
                <IconButton size="small" onClick={() => handleCopy((clientResponse.data as any).client_id || (clientResponse.data as any).clientId, 'Client ID')}>
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
            {t('auth.sso.basic_information', 'Basic Information')}
          </Typography>

          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('auth.sso.app_name', 'Application Name')}
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name?.message}
                sx={{ mb: 4 }}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('common.description', 'Description')}
                fullWidth
                multiline
                rows={2}
                error={!!errors.description}
                helperText={errors.description?.message}
                sx={{ mb: 4 }}
              />
            )}
          />

          <Controller
            name="redirectUris"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('auth.sso.redirect_uris', 'Authorized Redirect URIs')}
                fullWidth
                required
                multiline
                rows={3}
                error={!!errors.redirectUris}
                helperText={errors.redirectUris?.message || t('auth.sso.redirect_uris_help', 'Enter one valid URL per line.')}
                sx={{ mb: 4 }}
              />
            )}
          />

          <Typography variant="h6" sx={{ fontWeight: 800, mt: 2, mb: 3 }}>
            {t('auth.sso.oauth_configuration', 'OAuth Configuration')}
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
            <Controller
              name="grantTypes"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.grantTypes}>
                  <InputLabel>{t('auth.sso.grant_types', 'Grant Types')}</InputLabel>
                  <Select {...field} multiple label={t('auth.sso.grant_types', 'Grant Types')}>
                    <MenuItem value="authorization_code">Authorization Code (Standard)</MenuItem>
                    <MenuItem value="client_credentials">Client Credentials (Machine to Machine)</MenuItem>
                    <MenuItem value="implicit">Implicit (Legacy)</MenuItem>
                    <MenuItem value="refresh_token">Refresh Token</MenuItem>
                  </Select>
                  <FormHelperText>{errors.grantTypes?.message}</FormHelperText>
                </FormControl>
              )}
            />

            <Controller
              name="responseTypes"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.responseTypes}>
                  <InputLabel>{t('auth.sso.response_types', 'Response Types')}</InputLabel>
                  <Select {...field} multiple label={t('auth.sso.response_types', 'Response Types')}>
                    <MenuItem value="code">Code</MenuItem>
                    <MenuItem value="token">Token</MenuItem>
                    <MenuItem value="id_token">ID Token</MenuItem>
                  </Select>
                  <FormHelperText>{errors.responseTypes?.message}</FormHelperText>
                </FormControl>
              )}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button component={RouterLink} to={Path.identity.oidcConfigBrowser} color="inherit" sx={{ fontWeight: 600 }}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" variant="contained" disabled={!isDirty || isSubmitting} sx={{ fontWeight: 700, px: 4, borderRadius: 2, boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)' }}>
              {isSubmitting ? t('common.saving', 'Saving...') : t('common.save_changes', 'Save Changes')}
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Danger Zone */}
      <Card
        sx={(theme: any) => ({
          borderRadius: 4,
          border: '1px solid ' + theme.palette.error.main,
          ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
        })}
      >
        <Box sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: 'error.main' }}>
            {t('auth.sso.danger_zone', 'Danger Zone')}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {t('auth.sso.rotate_secret', 'Rotate Client Secret')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('auth.sso.rotate_secret_desc', 'Invalidates the current client secret and generates a new one. Applications using the old secret will lose access.')}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Refresh />}
              onClick={() => setRotateDialogOpen(true)}
              disabled={rotateMutation.isPending}
            >
              {t('auth.sso.rotate_secret', 'Rotate Secret')}
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Rotate Confirmation Dialog */}
      <Dialog open={rotateDialogOpen} onClose={() => setRotateDialogOpen(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <Warning /> {t('auth.sso.confirm_rotate_title', 'Rotate Client Secret?')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('auth.sso.confirm_rotate_desc', 'Are you sure you want to rotate the client secret? The current secret will immediately become invalid, which could cause brief downtime for any application actively using it until updated. You will only be shown the new secret once.')}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setRotateDialogOpen(false)} color="inherit">
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleRotateSecret} color="error" variant="contained" disabled={rotateMutation.isPending} autoFocus>
            {rotateMutation.isPending ? t('common.processing', 'Processing...') : t('common.confirm', 'Confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}



