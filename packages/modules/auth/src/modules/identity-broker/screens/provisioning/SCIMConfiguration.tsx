import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  alpha,
  useTheme,
  Stack,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Tooltip,
  Alert,
  Grid,
} from '@mui/material'
import ContentCopy from '@mui/icons-material/ContentCopy'
import VpnKey from '@mui/icons-material/VpnKey'
import Save from '@mui/icons-material/Save'
import Refresh from '@mui/icons-material/Refresh'
import Security from '@mui/icons-material/Security'
import Code from '@mui/icons-material/Code'
import SwapHoriz from '@mui/icons-material/SwapHoriz'
import ArrowBack from '@mui/icons-material/ArrowBack'
import CloudSync from '@mui/icons-material/CloudSync'
import People from '@mui/icons-material/People'
import Info from '@mui/icons-material/Info'
import OpenInNew from '@mui/icons-material/OpenInNew'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import Path from '../path'
import {
  useSCIMTokens,
  useCreateSCIMToken,
  useRevokeSCIMToken,
  useOrganizationScimConfig,
  useUpdateOrganizationScimConfig,
  useTestSCIMConnection,
} from '../../hooks'
import type { SCIMToken, SCIMConfig, CreateSCIMTokenResponse } from '../../types'
import { unwrapList } from '../../utils/unwrapList'
import logger from '@cap/module-auth/modules/authentication-core/utils/logger'

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string
  icon: React.ReactElement
  color: 'success' | 'primary' | 'info' | 'warning'
}) {
  const theme = useTheme()
  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 'var(--sf-radius-lg, 16px)',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 2.5,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px -10px ${alpha(theme.palette[color].main, 0.2)}`,
          borderColor: alpha(theme.palette[color].main, 0.5),
        },
      }}
    >
      <Avatar
        sx={{
          bgcolor: alpha(theme.palette[color].main, 0.1),
          color: `${color}.main`,
          width: 56,
          height: 56,
          borderRadius: 'var(--sf-radius-md, 12px)',
        }}
      >
        {icon}
      </Avatar>
      <Box>
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.075em',
            display: 'block',
            mb: 0.5,
          }}
        >
          {label}
        </Typography>
        <Typography variant='h5' sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>
          {value}
        </Typography>
      </Box>
    </Card>
  )
}

export default function SCIMConfiguration() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { t } = useTranslation('auth')

  const [scimEnabled, setScimEnabled] = useState(true)
  const [tokenVisible, setTokenVisible] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<string | null>(null)
  const scimUrl = `${window.location.origin}/scim/v2`

  const { data: tokensData } = useSCIMTokens()
  const tokens: SCIMToken[] = unwrapList<SCIMToken>(tokensData?.data)
  const activeToken = tokens.find((t) => !t.revokedAt) ?? tokens[0] ?? null
  const displayToken = newlyCreatedToken ?? (activeToken ? `scim_live_${'•'.repeat(24)}` : null)

  const createTokenMutation = useCreateSCIMToken({
    onSuccess: (resp) => {
      const payload: unknown = resp?.data
      const created: Partial<CreateSCIMTokenResponse> | undefined =
        payload && typeof payload === 'object' && 'data' in payload
          ? (payload as { data: Partial<CreateSCIMTokenResponse> }).data
          : (payload as Partial<CreateSCIMTokenResponse> | undefined)
      if (created?.token) {
        setNewlyCreatedToken(created.token)
        setTokenVisible(true)
      }
      toast.success(t('auth.admin.provisioning.scim.messages.token_generated'))
    },
    onError: (error: unknown) => {
      logger.error('Failed to create SCIM token', { error })
      toast.error(t('auth.admin.provisioning.scim.messages.error_generic'))
    },
  })

  const revokeTokenMutation = useRevokeSCIMToken({
    onSuccess: () => {
      toast.info(t('auth.admin.provisioning.scim.messages.token_revoked'))
    },
    onError: (error: unknown) => {
      logger.error('Failed to revoke SCIM token', { error })
      toast.error(t('auth.admin.provisioning.scim.messages.error_generic'))
    },
  })

  const [mappings, setMappings] = useState([
    { scim: 'userName', internal: 'email', required: true },
    { scim: 'name.givenName', internal: 'firstName', required: true },
    { scim: 'name.familyName', internal: 'lastName', required: true },
    { scim: 'displayName', internal: 'fullName', required: false },
    { scim: 'emails[type eq "work"].value', internal: 'secondaryEmail', required: false },
    { scim: 'active', internal: 'status', required: true },
    { scim: 'title', internal: 'jobTitle', required: false },
    { scim: 'department', internal: 'department', required: false },
  ])

  // Track the last seen config to sync state during render
  const [prevConfig, setPrevConfig] = useState<SCIMConfig | null>(null)

  const { data: configResp } = useOrganizationScimConfig()
  const scimConfig = configResp?.data

  // Sync state during render when scimConfig changes from the server
  if (scimConfig && scimConfig !== prevConfig) {
    setPrevConfig(scimConfig)
    setScimEnabled(scimConfig.enabled ?? false)
    const attributeMapping = scimConfig.attributeMapping
    if (attributeMapping && Object.keys(attributeMapping).length > 0) {
      setMappings((prev) =>
        prev.map((m) => ({
          ...m,
          internal: attributeMapping[m.scim] || m.internal,
        })),
      )
    }
  }

  const updateConfigMutation = useUpdateOrganizationScimConfig({
    onSuccess: () => {
      toast.success(t('auth.admin.provisioning.scim.messages.config_saved'))
      setIsSaving(false)
    },
    onError: (error: unknown) => {
      logger.error('Failed to save SCIM config', { error })
      toast.error(t('auth.admin.provisioning.scim.messages.error_generic'))
      setIsSaving(false)
    },
  })

  const testConnectionMutation = useTestSCIMConnection({
    onSuccess: (resp) => {
      const data = resp.data
      if (data.status === 'success') {
        toast.success(data.message, { autoClose: 5000 })
      } else {
        toast.warning(data.message, { autoClose: 5000 })
      }
    },
    onError: (error: unknown) => {
      logger.error('SCIM test connection failed', { error })
      toast.error(t('auth.admin.provisioning.scim.messages.test_failed'))
    },
  })

  const internalFields = [
    'email',
    'firstName',
    'lastName',
    'fullName',
    'secondaryEmail',
    'status',
    'jobTitle',
    'department',
    'phoneNumber',
    'timezone',
    'locale',
    'custom_1',
  ]

  const handleCopy = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text)
      toast.success(`${label} ${t('auth.admin.provisioning.scim.messages.copied')}`)
    } catch (err: unknown) {
      logger.error('Clipboard write failed', { error: err })
      toast.error(t('auth.admin.provisioning.scim.messages.error_generic'))
    }
  }

  const handleSave = () => {
    setIsSaving(true)
    const attributeMapping = mappings.reduce(
      (acc, m) => {
        acc[m.scim] = m.internal
        return acc
      },
      {} as Record<string, string>,
    )

    updateConfigMutation.mutate({
      enabled: scimEnabled,
      attributeMapping,
    })
  }

  const handleRotateToken = () => {
    if (activeToken) {
      revokeTokenMutation.mutate(activeToken.id)
    }
    setNewlyCreatedToken(null)
    // `ScimTokensController.store` reads `request.only(['label', 'expiresAt'])`
    // and 400s with "Token label is required" when the field is missing — the
    // previous `{ name: ... }` payload never satisfied that check.
    createTokenMutation.mutate({ label: 'SCIM Bearer Token' })
  }

  const handleGenerateToken = () => {
    setNewlyCreatedToken(null)
    createTokenMutation.mutate({ label: 'SCIM Bearer Token' })
  }

  const handleMappingChange = (index: number, value: string) => {
    setMappings((prev) => prev.map((m, i) => (i === index ? { ...m, internal: value } : m)))
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}
    >
      {/* ── Back button ────────────────────────────────────────────── */}
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(Path.provisioning)}
          sx={{
            p: 1,
            minHeight: 44,
            color: 'text.secondary',
            textTransform: 'none',
            fontWeight: 700,
            '&:hover': { color: 'primary.main', bgcolor: 'transparent' },
          }}
        >
          {t('auth.common.back', 'Back to Provisioning')}
        </Button>
      </Box>

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
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                borderRadius: 'var(--sf-radius-lg, 24px)',
                bgcolor: alpha(theme.palette.secondary.main, 0.12),
                color: 'secondary.main',
                boxShadow: `0 12px 24px ${alpha(theme.palette.secondary.main, 0.18)}`,
              }}
            >
              <CloudSync sx={{ fontSize: 32 }} />
            </Avatar>
            <Box
              sx={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 20,
                height: 20,
                bgcolor: scimEnabled ? 'success.main' : 'action.disabled',
                borderRadius: '50%',
                border: '3px solid',
                borderColor: 'background.paper',
                transition: 'background-color 0.3s',
              }}
            />
          </Box>
          <Box>
            <Typography
              variant='h4'
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.027em',
                fontFamily: 'Outfit, sans-serif',
                mb: 0.5,
              }}
            >
              {t('auth.admin.provisioning.scim.title')}
            </Typography>
            <Stack direction='row' spacing={1.5} alignItems='center' flexWrap='wrap'>
              <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
                {t('auth.admin.provisioning.scim.subtitle')}
              </Typography>
              <Chip
                label={
                  scimEnabled
                    ? t('auth.admin.provisioning.scim.status_active')
                    : t('auth.admin.provisioning.scim.status_inactive')
                }
                size='small'
                color={scimEnabled ? 'success' : 'default'}
                sx={{
                  fontWeight: 800,
                  height: 22,
                  borderRadius: 'var(--sf-radius-xs, 4px)',
                }}
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
            variant='outlined'
            startIcon={<Security />}
            onClick={() => testConnectionMutation.mutate()}
            disabled={testConnectionMutation.isPending}
            sx={{
              height: 44,
              minHeight: 44,
              px: 3,
              borderRadius: 'var(--sf-radius-md, 8px)',
              fontWeight: 800,
              textTransform: 'none',
              flex: { xs: 1, sm: 'none' },
              borderColor: 'divider',
              color: 'text.primary',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            {testConnectionMutation.isPending
              ? t('auth.admin.provisioning.scim.testing')
              : t('auth.admin.provisioning.scim.test_connection')}
          </Button>
          <Button
            variant='contained'
            startIcon={<Save />}
            onClick={handleSave}
            disabled={isSaving}
            sx={{
              bgcolor: 'info.main',
              boxShadow: (th) => `0 4px 14px 0 ${alpha(th.palette.info.main, 0.35)}`,
              '&:hover': { bgcolor: 'info.dark' },
              textTransform: 'none',
              fontWeight: 800,
              height: 44,
              minHeight: 44,
              px: 3,
              borderRadius: 'var(--sf-radius-md, 8px)',
              flex: { xs: 1, sm: 'none' },
            }}
          >
            {isSaving
              ? t('auth.admin.provisioning.scim.saving')
              : t('auth.admin.provisioning.scim.save_config')}
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            label={t('auth.admin.provisioning.scim.stats.users')}
            value='1,284'
            icon={<People />}
            color='primary'
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            label={t('auth.admin.provisioning.scim.stats.sync')}
            value='4m ago'
            icon={<CloudSync />}
            color='success'
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            label={t('auth.admin.provisioning.scim.stats.errors')}
            value='0.3%'
            icon={<Security />}
            color='info'
          />
        </Grid>
      </Grid>

      <Stack spacing={4}>
        <Card
          sx={{
            borderRadius: 'var(--sf-radius-lg, 16px)',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
          }}
        >
          <CardContent sx={{ p: 3.5 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CloudSync color='primary' sx={{ fontSize: 24 }} />
                <Typography
                  variant='h6'
                  sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  {t('auth.admin.provisioning.scim.protocol_status')}
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={scimEnabled}
                    onChange={(e) => setScimEnabled(e.target.checked)}
                    color='primary'
                  />
                }
                label={
                  <Typography
                    sx={{ fontWeight: 800, color: scimEnabled ? 'success.main' : 'text.secondary' }}
                  >
                    {scimEnabled
                      ? t('auth.admin.provisioning.scim.enabled')
                      : t('auth.admin.provisioning.scim.disabled')}
                  </Typography>
                }
              />
            </Box>

            {!scimEnabled && (
              <Alert severity='warning' sx={{ mb: 4, borderRadius: 'var(--sf-radius-md, 10px)', fontWeight: 600 }}>
                {t('auth.admin.provisioning.scim.messages.disabled_warning')}
              </Alert>
            )}

            <Box
              sx={{
                opacity: scimEnabled ? 1 : 0.5,
                transition: 'opacity 0.25s',
                pointerEvents: scimEnabled ? 'auto' : 'none',
              }}
            >
              {/* SCIM Base URL */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant='subtitle2'
                  sx={{
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    mb: 1.5,
                    color: 'text.secondary',
                  }}
                >
                  {t('auth.admin.provisioning.scim.base_url')}
                </Typography>
                <TextField
                  fullWidth
                  value={scimUrl}
                  disabled
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position='start'>
                          <Code sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position='end'>
                          <Stack direction='row' spacing={1}>
                            <Tooltip title={t('auth.admin.provisioning.scim.tooltips.copy_url')}>
                              <IconButton
                                size='small'
                                onClick={() => handleCopy(scimUrl, 'SCIM URL')}
                                sx={{ width: 44, height: 44 }}
                              >
                                <ContentCopy fontSize='small' />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('auth.admin.provisioning.scim.tooltips.open')}>
                              <IconButton
                                size='small'
                                component='a'
                                href={scimUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                sx={{ width: 44, height: 44 }}
                              >
                                <OpenInNew fontSize='small' />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 'var(--sf-radius-md, 8px)', fontWeight: 600, fontFamily: 'monospace' },
                    },
                  }}
                />
              </Box>

              {/* Auth Token */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Typography
                    variant='subtitle2'
                    sx={{
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'text.secondary',
                    }}
                  >
                    {t('auth.admin.provisioning.scim.tokens_title')}
                  </Typography>
                  <Tooltip title={t('auth.admin.provisioning.scim.tooltips.token_desc')}>
                    <Info sx={{ fontSize: 16, color: 'text.disabled' }} />
                  </Tooltip>
                </Box>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 2.5, fontWeight: 500 }}
                >
                  {t('auth.admin.provisioning.scim.token_help')}
                </Typography>

                <Card
                  variant='outlined'
                  sx={{
                    p: 2.5,
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    borderRadius: 'var(--sf-radius-md, 12px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px dashed',
                    borderColor: 'divider',
                    gap: 2.5,
                  }}
                >
                  <Stack direction='row' spacing={2} alignItems='center' sx={{ minWidth: 0 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                        width: 44,
                        height: 44,
                        borderRadius: 'var(--sf-radius-md, 8px)',
                      }}
                    >
                      <VpnKey />
                    </Avatar>
                    <Typography
                      variant='body2'
                      component='code'
                      sx={{
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        letterSpacing: tokenVisible ? 'normal' : '0.15em',
                        fontSize: '1rem',
                        color: displayToken ? 'text.primary' : 'text.disabled',
                      }}
                    >
                      {displayToken
                        ? tokenVisible
                          ? displayToken
                          : '•'.repeat(32)
                        : t('auth.admin.provisioning.scim.no_token')}
                    </Typography>
                  </Stack>
                  <Stack direction='row' spacing={1.5} sx={{ flexShrink: 0 }}>
                    <Tooltip
                      title={
                        tokenVisible
                          ? t('auth.admin.provisioning.scim.tooltips.hide')
                          : t('auth.admin.provisioning.scim.tooltips.show')
                      }
                    >
                      <IconButton
                        size='small'
                        onClick={() => setTokenVisible((v) => !v)}
                        sx={{
                          width: 44,
                          height: 44,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 'var(--sf-radius-md, 8px)',
                        }}
                      >
                        {tokenVisible ? (
                          <VisibilityOff fontSize='small' />
                        ) : (
                          <Visibility fontSize='small' />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('auth.admin.provisioning.scim.tooltips.copy')}>
                      <span>
                        <IconButton
                          size='small'
                          disabled={!displayToken}
                          onClick={() => displayToken && handleCopy(displayToken, 'Bearer token')}
                          sx={{
                            width: 44,
                            height: 44,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 'var(--sf-radius-md, 8px)',
                          }}
                        >
                          <ContentCopy fontSize='small' />
                        </IconButton>
                      </span>
                    </Tooltip>
                    {displayToken ? (
                      <Button
                        size='small'
                        variant='outlined'
                        startIcon={<Refresh />}
                        onClick={handleRotateToken}
                        disabled={createTokenMutation.isPending || revokeTokenMutation.isPending}
                        color='warning'
                        sx={{
                          textTransform: 'none',
                          fontWeight: 800,
                          borderRadius: 'var(--sf-radius-md, 8px)',
                          minHeight: 44,
                          px: 2.5,
                        }}
                      >
                        {createTokenMutation.isPending
                          ? t('auth.admin.provisioning.scim.rotating')
                          : t('auth.admin.provisioning.scim.rotate')}
                      </Button>
                    ) : (
                      <Button
                        size='small'
                        variant='contained'
                        onClick={handleGenerateToken}
                        disabled={createTokenMutation.isPending}
                        sx={{
                          bgcolor: 'info.main',
                          boxShadow: (th) => `0 4px 12px ${alpha(th.palette.info.main, 0.3)}`,
                          textTransform: 'none',
                          fontWeight: 800,
                          borderRadius: 'var(--sf-radius-md, 8px)',
                          minHeight: 44,
                          px: 2.5,
                          '&:hover': { bgcolor: 'info.dark' },
                        }}
                      >
                        {createTokenMutation.isPending
                          ? t('auth.admin.provisioning.scim.generating')
                          : t('auth.admin.provisioning.scim.create_token')}
                      </Button>
                    )}
                  </Stack>
                </Card>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: 'var(--sf-radius-lg, 16px)',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
          }}
        >
          <CardContent sx={{ p: 3.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
              <Security color='primary' sx={{ fontSize: 24 }} />
              <Typography
                variant='h6'
                sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                {t('auth.admin.provisioning.scim.supported_ops')}
              </Typography>
            </Box>

            <Grid container spacing={2.5}>
              {[
                {
                  resource: '/Users',
                  ops: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                  note: t('auth.admin.provisioning.scim.ops_notes.users'),
                },
                {
                  resource: '/Groups',
                  ops: ['GET', 'POST', 'PUT', 'PATCH'],
                  note: t('auth.admin.provisioning.scim.ops_notes.groups'),
                },
                {
                  resource: '/Schemas',
                  ops: ['GET'],
                  note: t('auth.admin.provisioning.scim.ops_notes.schemas'),
                },
                {
                  resource: '/ServiceProviderConfig',
                  ops: ['GET'],
                  note: t('auth.admin.provisioning.scim.ops_notes.config'),
                },
              ].map((row) => (
                <Grid key={row.resource} size={{ xs: 12, sm: 6 }}>
                  <Card
                    variant='outlined'
                    sx={{
                      p: 2.5,
                      borderRadius: 'var(--sf-radius-md, 12px)',
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: alpha(theme.palette.action.hover, 0.3),
                      height: '100%',
                    }}
                  >
                    <Typography
                      variant='body2'
                      sx={{
                        fontWeight: 800,
                        fontFamily: 'monospace',
                        mb: 1.5,
                        color: 'primary.main',
                        fontSize: '1rem',
                      }}
                    >
                      {row.resource}
                    </Typography>
                    <Stack direction='row' spacing={1} flexWrap='wrap' sx={{ mb: 2 }}>
                      {row.ops.map((op) => (
                        <Chip
                          key={op}
                          label={op}
                          size='small'
                          color={op === 'DELETE' ? 'error' : op === 'GET' ? 'info' : 'success'}
                          sx={{
                            height: 22,
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            borderRadius: 'var(--sf-radius-xs, 4px)',
                          }}
                        />
                      ))}
                    </Stack>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ fontWeight: 700, lineHeight: 1.5 }}
                    >
                      {row.note}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: 'var(--sf-radius-lg, 16px)',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
          }}
        >
          <CardContent sx={{ p: 3.5 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 4,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <SwapHoriz color='primary' sx={{ fontSize: 24 }} />
                <Box>
                  <Typography
                    variant='h6'
                    sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  >
                    {t('auth.admin.provisioning.scim.attribute_mapping')}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
                    {t('auth.admin.provisioning.scim.mapping_subtitle')}
                  </Typography>
                </Box>
              </Box>
              <Button
                startIcon={<Refresh />}
                size='small'
                sx={{
                  fontWeight: 800,
                  textTransform: 'none',
                  borderRadius: 'var(--sf-radius-md, 8px)',
                  minHeight: 44,
                  px: 2.5,
                  color: 'text.secondary',
                }}
              >
                {t('auth.admin.provisioning.scim.reset_defaults')}
              </Button>
            </Box>

            <TableContainer
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 'var(--sf-radius-md, 12px)',
                overflow: 'hidden',
              }}
            >
              <Table>
                <TableHead sx={{ bgcolor: alpha(theme.palette.action.hover, 0.6) }}>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        py: 2,
                        letterSpacing: '0.05em',
                        color: 'text.secondary',
                      }}
                    >
                      {t('auth.admin.provisioning.scim.table.scim_attr').toUpperCase()}
                    </TableCell>
                    <TableCell
                      align='center'
                      sx={{ fontWeight: 800, width: 60, color: 'text.secondary' }}
                    >
                      <SwapHoriz fontSize='small' />
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        py: 2,
                        letterSpacing: '0.05em',
                        color: 'text.secondary',
                      }}
                    >
                      {t('auth.admin.provisioning.scim.table.internal_field').toUpperCase()}
                    </TableCell>
                    <TableCell
                      align='center'
                      sx={{
                        fontWeight: 800,
                        width: 100,
                        letterSpacing: '0.05em',
                        color: 'text.secondary',
                      }}
                    >
                      {t('auth.admin.provisioning.scim.table.required').toUpperCase()}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mappings.map((row, i) => (
                    <TableRow
                      key={i}
                      sx={{
                        '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.3) },
                        transition: 'background 0.15s',
                        '& td': { borderBottom: i === mappings.length - 1 ? 'none' : '1px solid' },
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Typography
                          variant='body2'
                          sx={{
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            color: 'text.primary',
                            fontSize: '0.9rem',
                          }}
                        >
                          {row.scim}
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <SwapHoriz sx={{ color: 'text.disabled', fontSize: 18 }} />
                      </TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <TextField
                          select
                          fullWidth
                          size='small'
                          value={row.internal}
                          onChange={(e) => handleMappingChange(i, e.target.value)}
                          disabled={row.required}
                          slotProps={{ select: { native: true } }}
                          sx={{
                            '& select': {
                              py: 1,
                              fontWeight: 700,
                              fontSize: '0.875rem',
                              fontFamily: 'monospace',
                            },
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 'var(--sf-radius-md, 8px)',
                            },
                          }}
                        >
                          {internalFields.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell align='center'>
                        {row.required ? (
                          <Chip
                            label={t('auth.common.yes') || 'YES'}
                            size='small'
                            color='primary'
                            sx={{
                              fontWeight: 800,
                              height: 22,
                              fontSize: '0.65rem',
                              borderRadius: 'var(--sf-radius-xs, 4px)',
                            }}
                          />
                        ) : (
                          <Typography
                            variant='caption'
                            sx={{ fontWeight: 700, color: 'text.disabled' }}
                          >
                            {t('auth.common.optional') || 'OPTIONAL'}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  )
}
