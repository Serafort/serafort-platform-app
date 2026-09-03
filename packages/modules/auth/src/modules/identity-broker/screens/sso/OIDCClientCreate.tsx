// FILE: packages/modules/auth/src/screens/auth/sso/OIDCClientCreate.tsx
// RULES APPLIED: mui-component-standards.md, react-component-patterns.md
// This screen uses React Hook Form and Zod to enforce valid OIDC specs and displays the returned client credentials ONCE upon creation.

import { useState } from 'react'
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
  Stack,
} from '@mui/material'
import Add from '@mui/icons-material/Add'
import ContentCopy from '@mui/icons-material/ContentCopy'
// import from '@mui/icons-material/VpnKey';
import ChevronRight from '@mui/icons-material/ChevronRight'
import ArrowBack from '@mui/icons-material/ArrowBack'
import Warning from '@mui/icons-material/Warning'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Link as RouterLink } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { Path, useCreateOIDCClient } from '@auth'
import { buildLayoutSurfaceEffect } from '@cap/layout'
import { getTenantThemeEffects } from '@cap/theme'

const createOidcSchema = z.object({
  name: z.string().min(3, 'Client Name must be at least 3 characters').max(50),
  redirectUris: z
    .string()
    .min(1, 'At least one redirect URI is required')
    .url('Must be a valid URL'),
  grantTypes: z.array(z.string()).min(1, 'Select at least one grant type'),
  responseTypes: z.array(z.string()).min(1, 'Select at least one response type'),
})

type OidcFormData = z.infer<typeof createOidcSchema>

export default function OIDCClientCreate() {
  const { t } = useTranslation()
  const theme = useTheme()

  const createMutation = useCreateOIDCClient()

  // State to hold the newly created client credentials (shown only once)
  const [newCredentials, setNewCredentials] = useState<{
    clientId: string
    clientSecret: string
  } | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OidcFormData>({
    resolver: zodResolver(createOidcSchema),
    defaultValues: {
      name: '',
      redirectUris: '',
      grantTypes: ['authorization_code'],
      responseTypes: ['code'],
    },
  })

  const onSubmit = (data: OidcFormData) => {
    // Split the comma-separated or newline-separated URIs into an array
    const redirectUrisList = data.redirectUris
      .split(/[,\n]+/)
      .map((uri) => uri.trim())
      .filter((uri) => uri.length > 0)

    const payload = {
      ...data,
      redirectUris: redirectUrisList,
    }

    createMutation.mutate(payload as any, {
      onSuccess: (res) => {
        if (res.data) {
          toast.success(t('auth.sso.client_created', 'OIDC Client registered successfully'))
          setNewCredentials({
            clientId: res.data.client_id,
            clientSecret: res.data.client_secret || '',
          })
        }
      },
      onError: (err: any) => {
        toast.error(err.message || t('auth.sso.client_create_error', 'Failed to create client'))
      },
    })
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(
      t('common.copied_item', { item: label, defaultValue: `${label} copied to clipboard` }),
    )
  }

  return (
    <Container
      maxWidth='md'
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      sx={{ py: 6 }}
      className='animate-scale-in'
    >
      {/* Header aligned with Premium Admin Guidelines */}
      <Box sx={{ mb: 4 }}>
        <Button
          component={RouterLink}
          to={Path.identity.oidcConfigBrowser}
          startIcon={<ArrowBack />}
          sx={{
            mb: 2,
            color: 'text.secondary',
            '&:hover': { color: 'primary.main', bgcolor: 'transparent' },
          }}
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
            <Add sx={{ fontSize: '2rem' }} />
          </Avatar>
          <Box>
            <Typography variant='h4' sx={{ fontWeight: 900, letterSpacing: '-0.027em' }}>
              {t('auth.sso.create_oidc_client', 'Register New Client')}
            </Typography>
            <Breadcrumbs separator={<ChevronRight sx={{ fontSize: 12, color: 'text.disabled' }} />}>
              <Typography variant='body2' color='text.secondary'>
                OIDC Configuration
              </Typography>
              <Typography variant='body2' color='text.primary' fontWeight={600}>
                New Client
              </Typography>
            </Breadcrumbs>
          </Box>
        </Box>
      </Box>

      {/* SUCCESS STATE - Show Credentials */}
      {newCredentials ? (
        <Card
          sx={(theme: any) => ({
            p: 4,
            borderRadius: 4,
            border: '1px solid ' + theme.palette.success.main,
            ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
          })}
          component={motion.div}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette.success.main, 0.15),
                color: 'success.main',
                width: 48,
                height: 48,
              }}
            >
              <Add />
            </Avatar>
            <Box>
              <Typography variant='h5' sx={{ fontWeight: 800, color: 'success.main' }}>
                {t('auth.sso.client_created_successfully', 'Client Created Successfully')}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {t(
                  'auth.sso.copy_client_secret_warning',
                  'Make sure to copy your Client Secret now. You will not be able to see it again!',
                )}
              </Typography>
            </Box>
          </Box>

          <Alert severity='warning' icon={<Warning />} sx={{ mb: 4, borderRadius: 2 }}>
            <AlertTitle sx={{ fontWeight: 700 }}>
              {t('auth.sso.important_notice', 'Important Notice')}
            </AlertTitle>
            {t(
              'auth.sso.secret_storage_warning',
              'Store the client secret securely in your application configuration or environment variables.',
            )}
          </Alert>

          <Stack spacing={3}>
            <Box>
              <Typography variant='overline' sx={{ fontWeight: 800, color: 'text.secondary' }}>
                CLIENT ID
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Typography
                  variant='body1'
                  sx={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 600,
                    bgcolor: 'background.paper',
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    flexGrow: 1,
                  }}
                >
                  {newCredentials.clientId}
                </Typography>
                <Tooltip title='Copy Client ID'>
                  <IconButton
                    onClick={() => handleCopy(newCredentials.clientId, 'Client ID')}
                    sx={{
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <ContentCopy />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Box>
              <Typography variant='overline' sx={{ fontWeight: 800, color: 'text.secondary' }}>
                CLIENT SECRET
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Typography
                  variant='body1'
                  sx={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 600,
                    color: 'error.main',
                    bgcolor: alpha(theme.palette.error.main, 0.05),
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.error.main, 0.2),
                    flexGrow: 1,
                  }}
                >
                  {newCredentials.clientSecret}
                </Typography>
                <Tooltip title='Copy Client Secret'>
                  <IconButton
                    onClick={() => handleCopy(newCredentials.clientSecret, 'Client Secret')}
                    sx={{
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <ContentCopy />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Stack>

          <Box sx={{ mt: 5, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant='outlined' component={RouterLink} to={Path.identity.oidcConfigBrowser}>
              {t('common.done', 'Done')}
            </Button>
          </Box>
        </Card>
      ) : (
        /* CREATION FORM */
        <Card
          sx={(theme: any) => ({
            borderRadius: 4,
            border: '1px solid ' + theme.palette.divider,
            ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
          })}
        >
          <Box component='form' onSubmit={handleSubmit(onSubmit)} sx={{ p: 4 }}>
            <Typography variant='h6' sx={{ fontWeight: 800, mb: 3 }}>
              {t('auth.sso.basic_information', 'Basic Information')}
            </Typography>

            <Controller
              name='name'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('auth.sso.app_name', 'Application Name')}
                  fullWidth
                  required
                  error={!!errors.name}
                  helperText={
                    errors.name?.message ||
                    t('auth.sso.app_name_help', 'A recognizable name for this client application.')
                  }
                  sx={{ mb: 4 }}
                />
              )}
            />

            <Controller
              name='redirectUris'
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
                  helperText={
                    errors.redirectUris?.message ||
                    t(
                      'auth.sso.redirect_uris_help',
                      'Enter one valid URL per line or separate by commas. Users will be redirected here after login.',
                    )
                  }
                  sx={{ mb: 4 }}
                />
              )}
            />

            <Typography variant='h6' sx={{ fontWeight: 800, mt: 2, mb: 3 }}>
              {t('auth.sso.oauth_configuration', 'OAuth Configuration')}
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 3,
                mb: 4,
              }}
            >
              <Controller
                name='grantTypes'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.grantTypes}>
                    <InputLabel>{t('auth.sso.grant_types', 'Grant Types')}</InputLabel>
                    <Select {...field} multiple label={t('auth.sso.grant_types', 'Grant Types')}>
                      <MenuItem value='authorization_code'>Authorization Code (Standard)</MenuItem>
                      <MenuItem value='client_credentials'>
                        Client Credentials (Machine to Machine)
                      </MenuItem>
                      <MenuItem value='implicit'>Implicit (Legacy)</MenuItem>
                      <MenuItem value='refresh_token'>Refresh Token</MenuItem>
                    </Select>
                    <FormHelperText>{errors.grantTypes?.message}</FormHelperText>
                  </FormControl>
                )}
              />

              <Controller
                name='responseTypes'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.responseTypes}>
                    <InputLabel>{t('auth.sso.response_types', 'Response Types')}</InputLabel>
                    <Select
                      {...field}
                      multiple
                      label={t('auth.sso.response_types', 'Response Types')}
                    >
                      <MenuItem value='code'>Code</MenuItem>
                      <MenuItem value='token'>Token</MenuItem>
                      <MenuItem value='id_token'>ID Token</MenuItem>
                    </Select>
                    <FormHelperText>{errors.responseTypes?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </Box>

            <Alert severity='info' icon={<Warning />} sx={{ mb: 4, borderRadius: 2 }}>
              <AlertTitle sx={{ fontWeight: 700 }}>
                {t('auth.sso.security_notice', 'Security Notice')}
              </AlertTitle>
              {t(
                'auth.sso.secret_generation_notice',
                'A secure Client Secret will be generated upon creation. Ensure you store it securely, as it cannot be recovered later.',
              )}
            </Alert>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
                pt: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Button
                component={RouterLink}
                to={Path.identity.oidcConfigBrowser}
                color='inherit'
                sx={{ fontWeight: 600 }}
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                type='submit'
                variant='contained'
                disabled={isSubmitting}
                sx={{
                  fontWeight: 700,
                  px: 4,
                  borderRadius: 2,
                  boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                }}
              >
                {isSubmitting
                  ? t('common.creating', 'Creating...')
                  : t('auth.sso.register_client', 'Register Client')}
              </Button>
            </Box>
          </Box>
        </Card>
      )}
    </Container>
  )
}
