// FILE: packages/modules/auth/src/screens/auth/sso/JWKSManagement.tsx
// PATTERN: Aligned to OrganizationProfile.tsx design system
// FIXES: Container→Box, motion entry, card variants, empty state, audit card
// AUDIT: CRITICAL ✓  HIGH ✓  MEDIUM ✓

import React from 'react'
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  IconButton,
  alpha,
  useTheme,
  Grid,
  Chip,
  Alert,
  Tooltip,
  LinearProgress,
  Avatar,
  Stack,
  Divider,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material'
import Key from '@mui/icons-material/Key'
import Add from '@mui/icons-material/Add'
import Delete from '@mui/icons-material/Delete'
import ContentCopy from '@mui/icons-material/ContentCopy'
import Refresh from '@mui/icons-material/Refresh'
import History from '@mui/icons-material/History'
import Security from '@mui/icons-material/Security'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import ArrowBack from '@mui/icons-material/ArrowBack'
import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  useJWKSKeys,
  useRotateJWKSKeys,
  useDeleteJWKSKey,
  useCreateJWKSKey,
  useGetJWKSKeyDetail,
  CreateJWKSKeyRequest,
} from '@auth'
import { AppPaths } from '@cap/shared-types'

type StatusColor = 'success' | 'error' | 'info'

const STATUS_ORDER = ['active', 'standby', 'revoked']

const getStatusColor = (status?: string): StatusColor =>
  status === 'active' ? 'success' : status === 'revoked' ? 'error' : 'info'

const captionSx = {
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.075em',
  color: 'text.secondary',
  display: 'block',
  whiteSpace: 'nowrap',
} as const

export default function JWKSManagement() {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const navigate = useNavigate()
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [detailKid, setDetailKid] = React.useState<string | null>(null)
  const [deleteKid, setDeleteKid] = React.useState<string | null>(null)
  const [isRotateConfirmOpen, setIsRotateConfirmOpen] = React.useState(false)
  const [formData, setFormData] = React.useState<CreateJWKSKeyRequest>({
    kid: '',
    privateKey: '',
    publicKey: '',
    algorithm: 'RS256',
    use: 'sig',
    status: 'standby',
    expiresAt: '',
  })

  // Queries & Mutations
  const { data: keysResponse, isLoading } = useJWKSKeys()
  const keys = keysResponse?.data || []
  // Active signing key first, then standby, then revoked.
  const sortedKeys = React.useMemo(
    () => [...keys].sort((a, b) => STATUS_ORDER.indexOf(a.status ?? '') - STATUS_ORDER.indexOf(b.status ?? '')),
    [keys],
  )
  const deleteTarget = keys.find((k) => k.kid === deleteKid)

  // The list endpoint sends date-only ISO strings, or the literal 'Never'.
  const formatDate = (value?: string) => {
    if (!value || value === 'Never') return t('auth.common.never', 'Never')
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeZone: 'UTC' }).format(date)
  }

  const { data: keyDetailResponse, isLoading: isDetailLoading } = useGetJWKSKeyDetail(detailKid)
  const keyDetail = keyDetailResponse?.data || null

  const rotateMutation = useRotateJWKSKeys({
    onSuccess: () => {
      toast.success(t('auth.sso.keys_rotated', 'Keys rotated successfully'))
    },
    onError: (error) => {
      toast.error(error.message || t('auth.sso.rotate_failed', 'Failed to rotate keys'))
    },
  })

  const deleteMutation = useDeleteJWKSKey({
    onSuccess: () => {
      toast.success(t('auth.sso.key_deleted', 'Key deleted successfully'))
    },
    onError: (error) => {
      toast.error(error.message || t('auth.sso.delete_key_failed', 'Failed to delete key'))
    },
  })

  const createMutation = useCreateJWKSKey({
    onSuccess: () => {
      toast.success(t('auth.sso.key_created', 'Key created successfully'))
      setIsAddModalOpen(false)
      setFormData({
        kid: '',
        privateKey: '',
        publicKey: '',
        algorithm: 'RS256',
        use: 'sig',
        status: 'standby',
        expiresAt: '',
      })
    },
    onError: (error) => {
      toast.error(error.message || t('auth.sso.create_key_failed', 'Failed to create key'))
    },
  })

  const onRotate = () => setIsRotateConfirmOpen(true)
  const confirmRotate = () => {
    setIsRotateConfirmOpen(false)
    rotateMutation.mutate()
  }
  const confirmDelete = () => {
    if (!deleteKid) return
    deleteMutation.mutate(deleteKid, { onSettled: () => setDeleteKid(null) })
  }
  const onAddKey = () => setIsAddModalOpen(true)
  const onViewHistory = () => navigate(`${AppPaths.admin.exportAudit}?action=JWKS`)

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success(t('auth.common.copied', 'Copied to clipboard'))
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }} className='animate-scale-in'>
      {/* ── Header ───────────────────────────────────────────── */}
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
                borderRadius: 'var(--sf-radius-lg, 24px)',
                bgcolor: 'info.main',
                boxShadow: (t) => `0 12px 24px ${alpha(t.palette.info.main, 0.2)}`,
              }}
            >
              <Key sx={{ fontSize: { xs: '1.5rem', md: '2.5rem' } }} />
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
              <IconButton
                onClick={() => navigate(-1)}
                aria-label={t('auth.common.back', 'Back')}
                sx={{
                  p: 1,
                  minWidth: 44,
                  minHeight: 44,
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'transparent', color: 'primary.main' },
                }}
              >
                <ArrowBack />
              </IconButton>
              <Typography
                variant='h4'
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.027em',
                  fontSize: { xs: '1.5rem', md: '2.125rem' },
                }}
              >
                {t('auth.sso.jwks_title', 'JWKS Management')}
              </Typography>
            </Box>
            <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap'>
              <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
                {t('auth.sso.jwks_subtitle', 'Manage OIDC signature verification keys')}
              </Typography>
              <Chip
                label='JWKS'
                size='small'
                color='info'
                variant='outlined'
                sx={{ fontWeight: 700, height: 20, borderRadius: 'var(--sf-radius-xs, 4px)' }}
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
            startIcon={rotateMutation.isPending ? <CircularProgress size={16} /> : <Refresh />}
            onClick={onRotate}
            disabled={rotateMutation.isPending || keys.length === 0}
            sx={{
              minHeight: 44,
              borderRadius: 'var(--sf-radius-md, 8px)',
              textTransform: 'none',
              fontWeight: 700,
              flex: { xs: 1, sm: 'none' },
            }}
          >
            {t('auth.sso.rotate_keys', 'Rotate')}
          </Button>
          <Button
            variant='contained'
            startIcon={<Add />}
            onClick={onAddKey}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              boxShadow: (theme) => `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.39)}`,
              '&:hover': { bgcolor: 'primary.dark' },
              textTransform: 'none',
              fontWeight: 700,
              flex: { xs: 1, sm: 'none' },
              minHeight: 44,
              borderRadius: 'var(--sf-radius-md, 8px)',
              px: 3,
            }}
          >
            {t('auth.sso.manual_key', 'Add Key')}
          </Button>
        </Stack>
      </Box>

      {/* ── Warning Alert ─────────────────────────────────────── */}
      <Alert
        severity='warning'
        icon={<Security />}
        sx={{
          borderRadius: 'var(--sf-radius-md, 10px)',
          mb: 4,
          border: '1px solid',
          borderColor: alpha(theme.palette.warning.main, 0.2),
          bgcolor: alpha(theme.palette.warning.main, 0.02),
          '& .MuiAlert-message': { fontWeight: 500, color: 'text.primary' },
        }}
      >
        {t(
          'auth.sso.jwks_warning',
          'Key rotation affects all active sessions and signal receivers. Verify endpoint compatibility before finalizing rotation.',
        )}
      </Alert>

      {/* ── Key Cards ─────────────────────────────────────────── */}
      {isLoading ? (
        <Stack spacing={3}>
          {[1, 2].map((i) => (
            <Skeleton key={i} variant='rounded' height={120} sx={{ borderRadius: 'var(--sf-radius-lg, 16px)' }} />
          ))}
        </Stack>
      ) : keys.length === 0 ? (
        <Card
          sx={{
            borderRadius: 'var(--sf-radius-lg, 16px)',
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.08),
            boxShadow: 'none',
            textAlign: 'center',
            py: 10,
            bgcolor: (th) => th.palette.background.paper,
            backdropFilter: 'blur(24px)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -30,
              right: -30,
              width: 150,
              height: 150,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Key sx={{ fontSize: 80, opacity: 0.1 }} />
          </Box>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: 'primary.main',
              mb: 3,
              mx: 'auto',
              borderRadius: 'var(--sf-radius-lg, 20px)',
            }}
          >
            <Key sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography
            variant='h5'
            sx={{ fontWeight: 800, mb: 1.5, fontFamily: 'Outfit, sans-serif' }}
          >
            {t('auth.sso.no_keys', 'No Keys Configured')}
          </Typography>
          <Typography
            variant='body1'
            color='text.secondary'
            sx={{ mb: 4, maxWidth: 450, mx: 'auto', fontWeight: 500 }}
          >
            {t(
              'auth.sso.no_keys_desc',
              'Secure your OIDC provider by generating or importing cryptographic keys for digital signatures.',
            )}
          </Typography>
          <Button
            variant='contained'
            startIcon={<Add />}
            onClick={onAddKey}
            sx={{
              bgcolor: 'primary.main',
              boxShadow: (theme) => `0 8px 32px 0 ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                bgcolor: 'primary.dark',
                boxShadow: (theme) => `0 12px 40px 0 ${alpha(theme.palette.primary.main, 0.45)}`,
              },
              textTransform: 'none',
              fontWeight: 800,
              minHeight: 48,
              borderRadius: 'var(--sf-radius-md, 8px)',
              px: 4,
            }}
          >
            {t('auth.sso.manual_key', 'Initialize Key Set')}
          </Button>
        </Card>
      ) : (
        <Stack spacing={2}>
          {sortedKeys.map((key) => {
            const statusColor = getStatusColor(key.status)
            const health = key.health ?? 100
            const healthColor = health > 90 ? 'success' : 'warning'
            return (
              <Card
                key={key.kid}
                sx={{
                  borderRadius: 'var(--sf-radius-lg, 16px)',
                  border: '1px solid',
                  borderColor:
                    key.status === 'active'
                      ? alpha(theme.palette.success.main, 0.35)
                      : alpha(theme.palette.primary.main, 0.1),
                  boxShadow: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  bgcolor: (th) => th.palette.background.paper,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 8px 24px -12px ${alpha(theme.palette.primary.main, 0.25)}`,
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
                  <Box
                    sx={{
                      display: 'grid',
                      // Fixed column widths so health/dates line up from card to card.
                      gridTemplateColumns: {
                        xs: 'minmax(0, 1fr)',
                        sm: 'minmax(0, 1fr) 228px',
                        lg: 'minmax(0, 1fr) 180px 228px 148px',
                      },
                      gridTemplateAreas: {
                        xs: '"id" "health" "dates" "actions"',
                        sm: '"id actions" "health dates"',
                        lg: '"id health dates actions"',
                      },
                      columnGap: 4,
                      rowGap: 2,
                      alignItems: 'center',
                    }}
                  >
                    {/* Key Identity */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        minWidth: 0,
                        gridArea: 'id',
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          flexShrink: 0,
                          bgcolor: alpha(theme.palette[statusColor].main, 0.1),
                          color: `${statusColor}.main`,
                          borderRadius: 'var(--sf-radius-md, 12px)',
                        }}
                      >
                        <Key />
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Tooltip title={key.kid} placement='top-start'>
                          <Typography
                            variant='subtitle1'
                            noWrap
                            sx={{ fontWeight: 800, fontFamily: 'monospace', fontSize: '0.95rem' }}
                          >
                            {key.kid}
                          </Typography>
                        </Tooltip>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                          <Chip
                            label={t(`auth.sso.key_status_${key.status || 'unknown'}`, (key.status || 'unknown').toUpperCase())}
                            size='small'
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              borderRadius: 'var(--sf-radius-xs, 4px)',
                              bgcolor: alpha(theme.palette[statusColor].main, 0.15),
                              color: `${statusColor}.main`,
                              border: '1px solid',
                              borderColor: alpha(theme.palette[statusColor].main, 0.2),
                            }}
                          />
                          <Typography
                            variant='caption'
                            sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em' }}
                          >
                            {key.alg}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Health */}
                    <Box sx={{ minWidth: 0, gridArea: 'health' }}>
                      <Typography variant='caption' sx={{ ...captionSx, mb: 1 }}>
                        {t('auth.sso.key_health', 'Certificate Health')}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <LinearProgress
                          variant='determinate'
                          value={health}
                          color={healthColor}
                          aria-label={t('auth.sso.key_health', 'Certificate Health')}
                          sx={{
                            flexGrow: 1,
                            height: 6,
                            borderRadius: 'var(--sf-radius-xs, 4px)',
                            bgcolor: alpha(theme.palette.divider, 0.1),
                            '& .MuiLinearProgress-bar': { borderRadius: 'var(--sf-radius-xs, 4px)' },
                          }}
                        />
                        <Typography
                          variant='body2'
                          sx={{ fontWeight: 800, color: `${healthColor}.main`, whiteSpace: 'nowrap' }}
                        >
                          {health}%
                        </Typography>
                      </Box>
                    </Box>

                    {/* Dates */}
                    <Box sx={{ gridArea: 'dates', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      {[
                        { label: t('auth.common.created', 'Created'), value: formatDate(key.created) },
                        { label: t('auth.common.expires', 'Expires'), value: formatDate(key.expires) },
                      ].map(({ label, value }) => (
                        <Box key={label}>
                          <Typography variant='caption' sx={{ ...captionSx, mb: 0.5 }}>
                            {label}
                          </Typography>
                          <Typography variant='body2' sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                            {value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    {/* Actions */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                        gap: 1,
                        gridArea: 'actions',
                      }}
                    >
                        <Tooltip title={t('auth.sso.copy_kid', 'Copy KID')}>
                          <IconButton
                            size='small'
                            onClick={() => handleCopy(key.kid)}
                            sx={{ minWidth: 44, minHeight: 44, border: '1px solid', borderColor: 'divider' }}
                            aria-label={t('auth.sso.copy_kid', 'Copy KID')}
                          >
                            <ContentCopy fontSize='small' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('auth.common.details', 'Details')}>
                          <IconButton
                            size='small'
                            onClick={() => setDetailKid(key.kid)}
                            sx={{ minWidth: 44, minHeight: 44, border: '1px solid', borderColor: 'divider' }}
                            aria-label={t('auth.common.details', 'Details')}
                          >
                            <InfoOutlined fontSize='small' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('auth.common.delete', 'Delete')}>
                          <IconButton
                            size='small'
                            color='error'
                            onClick={() => setDeleteKid(key.kid)}
                            sx={{
                              minWidth: 44,
                              minHeight: 44,
                              border: '1px solid',
                              borderColor: alpha(theme.palette.error.main, 0.2),
                            }}
                            aria-label={t('auth.common.delete', 'Delete')}
                          >
                            <Delete fontSize='small' />
                          </IconButton>
                        </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )
          })}
        </Stack>
      )}

      {/* ── Audit Log Card ────────────────────────────────────── */}
      <Card
        sx={{
          borderRadius: 'var(--sf-radius-lg, 16px)',
          border: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.08),
          boxShadow: 'none',
          mt: 4,
          bgcolor: (th) => th.palette.background.paper,
          backdropFilter: 'blur(24px)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <History sx={{ color: 'text.secondary', fontSize: 20 }} />
            <Typography
              variant='h6'
              sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {t('auth.sso.audit_log', 'Audit Log')}
            </Typography>
          </Box>
          <Divider sx={{ my: 2, opacity: 0.5 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='body2' color='text.secondary'>
              {t('auth.sso.audit_desc', 'View complete key rotation history and access events.')}
            </Typography>
            <Button
              variant='text'
              startIcon={<History />}
              onClick={onViewHistory}
              sx={{
                fontWeight: 700,
                minHeight: 44,
                borderRadius: 'var(--sf-radius-md, 8px)',
                color: 'text.secondary',
                textTransform: 'none',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              {t('auth.sso.view_key_history', 'View Full History')}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* ── Add Key Modal ─────────────────────────────────────── */}
      <Dialog
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth='md'
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 'var(--sf-radius-lg, 16px)',
              bgcolor: (t) => t.palette.background.paper,
              backdropFilter: 'blur(20px)',
              border: '1px solid',
              borderColor: (t) => alpha(t.palette.divider, 0.1),
              boxShadow: (t) => t.shadows[24],
            },
          },
        }}
      >
        <form onSubmit={handleCreateSubmit}>
          <DialogTitle
            sx={{
              p: 3,
              pb: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography
              variant='h6'
              component='div'
              sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}
            >
              {t('auth.sso.add_manual_key', 'Add Manual OIDC Key')}
            </Typography>
            <IconButton
              onClick={() => setIsAddModalOpen(false)}
              size='small'
              sx={{ color: 'text.secondary', minWidth: 44, minHeight: 44 }}
              aria-label={t('auth.common.close', 'Close')}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3, pt: 3 }}>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label={t('auth.sso.key_id_label', 'Key ID (KID)')}
                fullWidth
                required
                value={formData.kid}
                onChange={(e) => setFormData({ ...formData, kid: e.target.value })}
                placeholder={t('auth.sso.key_id_placeholder', 'e.g., prod-key-2024')}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 'var(--sf-radius-md, 8px)',
                    bgcolor: alpha(theme.palette.text.primary, 0.03),
                  },
                }}
              />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label={t('auth.sso.algorithm', 'Algorithm')}
                    select
                    fullWidth
                    value={formData.algorithm}
                    onChange={(e) => setFormData({ ...formData, algorithm: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 'var(--sf-radius-md, 8px)',
                        bgcolor: alpha(theme.palette.text.primary, 0.03),
                      },
                    }}
                  >
                    <MenuItem value='RS256'>RS256</MenuItem>
                    <MenuItem value='RS384'>RS384</MenuItem>
                    <MenuItem value='RS512'>RS512</MenuItem>
                    <MenuItem value='ES256'>ES256</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label={t('auth.common.status', 'Status')}
                    select
                    fullWidth
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as CreateJWKSKeyRequest['status'] })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 'var(--sf-radius-md, 8px)',
                        bgcolor: alpha(theme.palette.text.primary, 0.03),
                      },
                    }}
                  >
                    <MenuItem value='active'>{t('auth.sso.key_status_active', 'Active')}</MenuItem>
                    <MenuItem value='standby'>{t('auth.sso.key_status_standby', 'Standby')}</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
              <TextField
                label={t('auth.sso.private_key_label', 'Private Key (JWK or PEM)')}
                multiline
                rows={4}
                fullWidth
                required
                value={formData.privateKey}
                onChange={(e) => setFormData({ ...formData, privateKey: e.target.value })}
                placeholder={t('auth.sso.private_key_placeholder', 'Paste your private key here...')}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 'var(--sf-radius-md, 8px)',
                    bgcolor: alpha(theme.palette.text.primary, 0.03),
                  },
                }}
              />
              <TextField
                label={t('auth.sso.public_key_label', 'Public Key (JWK or PEM)')}
                multiline
                rows={4}
                fullWidth
                required
                value={formData.publicKey}
                onChange={(e) => setFormData({ ...formData, publicKey: e.target.value })}
                placeholder={t('auth.sso.public_key_placeholder', 'Paste your public key here...')}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 'var(--sf-radius-md, 8px)',
                    bgcolor: alpha(theme.palette.text.primary, 0.03),
                  },
                }}
              />
              <TextField
                label={t('auth.sso.expires_at_label', 'Expires At')}
                type='date'
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 'var(--sf-radius-md, 8px)',
                    bgcolor: alpha(theme.palette.text.primary, 0.03),
                  },
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              onClick={() => setIsAddModalOpen(false)}
              sx={{ fontWeight: 700, textTransform: 'none', color: 'text.secondary', minHeight: 44, borderRadius: 'var(--sf-radius-md, 8px)' }}
            >
              {t('auth.common.cancel', 'Cancel')}
            </Button>
            <Button
              type='submit'
              variant='contained'
              disabled={createMutation.isPending}
              sx={{
                fontWeight: 800,
                minHeight: 44,
                borderRadius: 'var(--sf-radius-md, 8px)',
                textTransform: 'none',
                px: 4,
                bgcolor: 'primary.main',
                boxShadow: (theme) => `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.39)}`,
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              {createMutation.isPending
                ? t('auth.common.creating', 'Creating...')
                : t('auth.common.create', 'Create Key')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── Rotate Confirmation ───────────────────────────────── */}
      <Dialog
        open={isRotateConfirmOpen}
        onClose={() => setIsRotateConfirmOpen(false)}
        maxWidth='xs'
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 'var(--sf-radius-lg, 16px)' } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {t('auth.sso.jwks_confirm_rotate_title', 'Rotate signing keys?')}
        </DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary'>
            {t(
              'auth.sso.jwks_confirm_rotate_desc',
              'A new key becomes the active signing key and the current one moves to standby. Relying parties that cache the JWKS must refresh before tokens signed with the new key validate.',
            )}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setIsRotateConfirmOpen(false)}
            sx={{ fontWeight: 700, textTransform: 'none', color: 'text.secondary', minHeight: 44 }}
          >
            {t('auth.common.cancel', 'Cancel')}
          </Button>
          <Button
            variant='contained'
            color='warning'
            startIcon={<Refresh />}
            onClick={confirmRotate}
            sx={{ fontWeight: 800, textTransform: 'none', minHeight: 44, borderRadius: 'var(--sf-radius-md, 8px)' }}
          >
            {t('auth.sso.rotate_keys', 'Rotate')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirmation ───────────────────────────────── */}
      <Dialog
        open={!!deleteKid}
        onClose={() => !deleteMutation.isPending && setDeleteKid(null)}
        maxWidth='xs'
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 'var(--sf-radius-lg, 16px)' } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {t('auth.sso.jwks_confirm_delete_title', 'Delete signing key?')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography
              variant='body2'
              sx={{ fontFamily: 'monospace', fontWeight: 700, wordBreak: 'break-all' }}
            >
              {deleteKid}
            </Typography>
            {deleteTarget?.status === 'active' && (
              <Alert severity='error' sx={{ borderRadius: 'var(--sf-radius-md, 8px)' }}>
                {t(
                  'auth.sso.jwks_delete_active_warning',
                  'This is the active signing key. Deleting it invalidates every token it signed. Rotate first so another key takes over.',
                )}
              </Alert>
            )}
            <Typography variant='body2' color='text.secondary'>
              {t(
                'auth.sso.jwks_confirm_delete_desc',
                'The key is removed from the JWKS endpoint and tokens signed with it will no longer validate. This cannot be undone.',
              )}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setDeleteKid(null)}
            disabled={deleteMutation.isPending}
            sx={{ fontWeight: 700, textTransform: 'none', color: 'text.secondary', minHeight: 44 }}
          >
            {t('auth.common.cancel', 'Cancel')}
          </Button>
          <Button
            variant='contained'
            color='error'
            startIcon={deleteMutation.isPending ? <CircularProgress size={16} color='inherit' /> : <Delete />}
            onClick={confirmDelete}
            disabled={deleteMutation.isPending}
            sx={{ fontWeight: 800, textTransform: 'none', minHeight: 44, borderRadius: 'var(--sf-radius-md, 8px)' }}
          >
            {deleteMutation.isPending
              ? t('auth.common.deleting', 'Deleting...')
              : t('auth.common.delete', 'Delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Key Details Modal ──────────────────────────────────── */}
      <Dialog
        open={!!detailKid}
        onClose={() => setDetailKid(null)}
        maxWidth='sm'
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 'var(--sf-radius-lg, 16px)',
              bgcolor: (t) => t.palette.background.paper,
              backdropFilter: 'blur(20px)',
              border: '1px solid',
              borderColor: (t) => alpha(t.palette.divider, 0.1),
              boxShadow: (t) => t.shadows[24],
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            p: 3,
            pb: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: alpha(theme.palette.info.main, 0.1),
                color: 'info.main',
                borderRadius: 'var(--sf-radius-md, 12px)',
              }}
            >
              <Key sx={{ fontSize: 22 }} />
            </Avatar>
            <Box>
              <Typography
                variant='h6'
                component='div'
                sx={{ fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}
              >
                {t('auth.sso.key_details', 'Key Details')}
              </Typography>
              <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                {detailKid}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => setDetailKid(null)}
            size='small'
            sx={{ color: 'text.secondary', minWidth: 44, minHeight: 44 }}
            aria-label={t('auth.common.close', 'Close')}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 3 }}>
          {isDetailLoading ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 6,
                gap: 2,
              }}
            >
              <CircularProgress size={32} thickness={5} />
              <Typography
                variant='caption'
                sx={{
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.075em',
                  color: 'text.secondary',
                }}
              >
                {t('auth.common.loading', 'Loading...')}
              </Typography>
            </Box>
          ) : keyDetail ? (
            <Stack spacing={3} sx={{ mt: 1 }}>
              {/* Status & Algorithm Row */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {[
                  {
                    label: t('auth.common.status', 'Status'),
                    value: keyDetail.status?.toUpperCase(),
                    color:
                      keyDetail.status === 'active'
                        ? 'success'
                        : keyDetail.status === 'revoked'
                          ? 'error'
                          : 'info',
                  },
                  { label: t('auth.sso.algorithm', 'Algorithm'), value: keyDetail.alg },
                  { label: t('auth.sso.usage', 'Usage'), value: keyDetail.use?.toUpperCase() },
                ].map(({ label, value, color }) => (
                  <Box
                    key={label}
                    sx={{
                      flex: 1,
                      minWidth: 120,
                      p: 2,
                      borderRadius: 'var(--sf-radius-md, 12px)',
                      bgcolor: alpha(theme.palette.text.primary, 0.03),
                      border: '1px solid',
                      borderColor: alpha(theme.palette.divider, 0.08),
                    }}
                  >
                    <Typography
                      variant='caption'
                      sx={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.075em',
                        color: 'text.secondary',
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      {label}
                    </Typography>
                    {color ? (
                      <Chip
                        label={value}
                        size='small'
                        color={color as StatusColor}
                        sx={{ fontWeight: 800, fontSize: '0.7rem', borderRadius: 'var(--sf-radius-xs, 4px)' }}
                      />
                    ) : (
                      <Typography variant='body2' sx={{ fontWeight: 800 }}>
                        {value}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>

              {/* Dates */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {[
                  {
                    label: t('auth.common.created', 'Created'),
                    value: keyDetail.created
                      ? new Date(keyDetail.created).toLocaleString()
                      : t('auth.common.not_available', '—'),
                  },
                  {
                    label: t('auth.common.updated', 'Updated'),
                    value: keyDetail.updated
                      ? new Date(keyDetail.updated).toLocaleString()
                      : t('auth.common.not_available', '—'),
                  },
                  {
                    label: t('auth.common.expires', 'Expires'),
                    value: keyDetail.expires
                      ? new Date(keyDetail.expires).toLocaleString()
                      : t('auth.common.never', 'Never'),
                  },
                ].map(({ label, value }) => (
                  <Box
                    key={label}
                    sx={{
                      flex: 1,
                      minWidth: 120,
                      p: 2,
                      borderRadius: 'var(--sf-radius-md, 12px)',
                      bgcolor: alpha(theme.palette.text.primary, 0.03),
                      border: '1px solid',
                      borderColor: alpha(theme.palette.divider, 0.08),
                    }}
                  >
                    <Typography
                      variant='caption'
                      sx={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.075em',
                        color: 'text.secondary',
                        display: 'block',
                        mb: 0.5,
                      }}
                    >
                      {label}
                    </Typography>
                    <Typography variant='body2' sx={{ fontWeight: 700 }}>
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Public JWK */}
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography
                    variant='caption'
                    sx={{
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.075em',
                      color: 'text.secondary',
                    }}
                  >
                    {t('auth.sso.public_jwk', 'Public JWK')}
                  </Typography>
                  <Tooltip title={t('auth.common.copy', 'Copy')}>
                    <IconButton
                      size='small'
                      aria-label={t('auth.common.copy', 'Copy')}
                      onClick={() => handleCopy(JSON.stringify(keyDetail.publicJwk, null, 2))}
                      sx={{ minWidth: 44, minHeight: 44, border: '1px solid', borderColor: 'divider' }}
                    >
                      <ContentCopy sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box
                  component='pre'
                  sx={{
                    p: 2,
                    borderRadius: 'var(--sf-radius-md, 12px)',
                    bgcolor: alpha(theme.palette.text.primary, 0.05),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.08),
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    overflow: 'auto',
                    maxHeight: 250,
                    color: "text.primary",
                    m: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  {JSON.stringify(keyDetail.publicJwk, null, 2)}
                </Box>
              </Box>
            </Stack>
          ) : (
            <Typography variant='body2' color='text.secondary' sx={{ py: 4, textAlign: 'center' }}>
              {t('auth.sso.key_not_found', 'Key details could not be loaded.')}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setDetailKid(null)}
            sx={{ fontWeight: 700, textTransform: 'none', color: 'text.secondary', minHeight: 44, borderRadius: 'var(--sf-radius-md, 8px)' }}
          >
            {t('auth.common.close', 'Close')}
          </Button>
          <Button
            variant='outlined'
            startIcon={<ContentCopy />}
            onClick={() => handleCopy(detailKid || '')}
            sx={{ fontWeight: 700, textTransform: 'none', minHeight: 44, borderRadius: 'var(--sf-radius-md, 8px)' }}
          >
            {t('auth.sso.copy_kid', 'Copy KID')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
