// FILE: packages/modules/auth/src/screens/auth/sso/JWKSManagement.tsx
// PATTERN: Aligned to OrganizationProfile.tsx design system
// FIXES: Containerâ†’Box, motion entry, card variants, empty state, audit card
// AUDIT: CRITICAL âœ“  HIGH âœ“  MEDIUM âœ“

import React from 'react';
import { Box, Button, Typography, Card, CardContent, IconButton, alpha, useTheme, Grid, Chip, Alert, Tooltip, LinearProgress, Avatar, Stack, Divider, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, CircularProgress } from '@mui/material';
import Key from '@mui/icons-material/Key';
import Add from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/Delete';
import ContentCopy from '@mui/icons-material/ContentCopy';
import Refresh from '@mui/icons-material/Refresh';
import History from '@mui/icons-material/History';
import Security from '@mui/icons-material/Security';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import ArrowBack from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useJWKSKeys, useRotateJWKSKeys, useDeleteJWKSKey, useCreateJWKSKey, useGetJWKSKeyDetail, CreateJWKSKeyRequest } from '@auth';





export default function JWKSManagement() {
  const { t } = useTranslation()
  const theme = useTheme()
  const navigate = useNavigate()
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [detailKid, setDetailKid] = React.useState<string | null>(null)
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

  const { data: keyDetailResponse, isLoading: isDetailLoading } = useGetJWKSKeyDetail(detailKid)
  const keyDetail = keyDetailResponse?.data || null

  const rotateMutation = useRotateJWKSKeys({
    onSuccess: () => {
      toast.success(t('auth.sso.keys_rotated', 'Keys rotated successfully'))
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to rotate keys')
    }
  })

  const deleteMutation = useDeleteJWKSKey({
    onSuccess: () => {
      toast.success(t('auth.sso.key_deleted', 'Key deleted successfully'))
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete key')
    }
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
      toast.error(error.message || 'Failed to create key')
    }
  })

  const onRotate = () => rotateMutation.mutate()
  const onDeleteKey = (kid: string) => deleteMutation.mutate(kid)
  const onAddKey = () => setIsAddModalOpen(true)
  const onViewHistory = () => navigate('/admin/audit-logs?action=JWKS')

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success(t('common.copied', 'Copied to clipboard'))
  }

  return (
    <Box
      sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}
      className='animate-scale-in'
    >
      {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                bgcolor: 'info.main',
                boxShadow: (t) => `0 12px 24px ${alpha(t.palette.info.main, 0.2)}`,
              }}
            >
              <Key sx={{ fontSize: { xs: '1.5rem', md: '2.5rem' } }} />
            </Avatar>
            <Box
              sx={{
                position: 'absolute', bottom: -4, right: -4,
                width: 24, height: 24,
                bgcolor: 'success.main', borderRadius: '50%',
                border: '4px solid', borderColor: 'background.paper',
              }}
            />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Button
                onClick={() => navigate(-1)}
                sx={{
                  p: 0, minWidth: 'auto', color: 'text.secondary',
                  '&:hover': { bgcolor: 'transparent', color: 'primary.main' },
                }}
              >
                <ArrowBack />
              </Button>
              <Typography
                variant='h4'
                sx={{
                  fontWeight: 900,
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
            variant='outlined'
            startIcon={<Refresh />}
            onClick={onRotate}
            sx={{
              height: 44, borderRadius: '12px',
              textTransform: 'none', fontWeight: 700,
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
              bgcolor: 'info.main', color: 'white',
              boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
              '&:hover': { bgcolor: 'info.dark' },
              textTransform: 'none', fontWeight: 700,
              flex: { xs: 1, sm: 'none' },
              height: 44, borderRadius: '12px', px: 3,
            }}
          >
            {t('auth.sso.manual_key', 'Add Key')}
          </Button>
        </Stack>
      </Box>

      {/* â”€â”€ Warning Alert â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Alert
        severity='warning'
        icon={<Security />}
        sx={{
          borderRadius: 4, mb: 4,
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

      {/* â”€â”€ Key Cards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {isLoading ? (
        <Stack spacing={3}>
          {[1, 2].map((i) => (
            <Skeleton key={i} variant='rounded' height={120} sx={{ borderRadius: 4 }} />
          ))}
        </Stack>
      ) : keys.length === 0 ? (
        <Card
          sx={{
            borderRadius: '24px',
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.08),
            boxShadow: 'none',
            textAlign: 'center',
            py: 10,
            background: alpha('#000', 0.2),
            backdropFilter: 'blur(24px)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Key sx={{ fontSize: 80, opacity: 0.1 }} />
          </Box>
          <Avatar
            sx={{
              width: 80, height: 80,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: 'primary.main', mb: 3, mx: 'auto',
              borderRadius: '20px'
            }}
          >
            <Key sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant='h5' sx={{ fontWeight: 900, mb: 1.5, fontFamily: 'Outfit, sans-serif' }}>
            {t('auth.sso.no_keys', 'No Keys Configured')}
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 4, maxWidth: 450, mx: 'auto', fontWeight: 500 }}>
            {t('auth.sso.no_keys_desc', 'Secure your OIDC provider by generating or importing cryptographic keys for digital signatures.')}
          </Typography>
          <Button
            variant='contained'
            startIcon={<Add />}
            onClick={onAddKey}
            sx={{
              bgcolor: 'info.main',
              boxShadow: `0 8px 32px 0 ${alpha(theme.palette.info.main, 0.3)}`,
              '&:hover': {
                bgcolor: 'info.dark',
                boxShadow: `0 12px 40px 0 ${alpha(theme.palette.info.main, 0.45)}`,
              },
              textTransform: 'none', fontWeight: 800,
              height: 48, borderRadius: '14px', px: 4,
            }}
          >
            {t('auth.sso.manual_key', 'Initialize Key Set')}
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {keys.map((key) => (
            <Grid key={key.kid} size={{ xs: 12, xl: 6 }}>
              <Card
                sx={{
                  borderRadius: '24px',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.1),
                  boxShadow: 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.05)} 0%, ${alpha('#000', 0.2)} 100%)`,
                  backdropFilter: 'blur(24px)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 40px -12px ${alpha(theme.palette.primary.main, 0.25)}`,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3} alignItems='center'>
                    {/* Key Identity */}
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            width: 48, height: 48,
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            color: 'primary.main', borderRadius: '14px',
                          }}
                        >
                          <Key />
                        </Avatar>
                        <Box>
                          <Typography variant='subtitle1' sx={{ fontWeight: 800 }}>
                            {key.kid}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                            <Chip
                              label={(key.status || 'unknown').toUpperCase()}
                              size='small'
                              sx={{
                                height: 20, fontSize: '0.65rem', fontWeight: 900, borderRadius: '6px',
                                bgcolor: alpha(
                                  key.status === 'active' ? theme.palette.success.main :
                                    key.status === 'revoked' ? theme.palette.error.main :
                                      theme.palette.info.main,
                                  0.15
                                ),
                                color: key.status === 'active' ? 'success.main' :
                                  key.status === 'revoked' ? 'error.main' : 'info.main',
                                border: '1px solid',
                                borderColor: alpha(
                                  key.status === 'active' ? theme.palette.success.main :
                                    key.status === 'revoked' ? theme.palette.error.main :
                                      theme.palette.info.main,
                                  0.2
                                ),
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
                    </Grid>

                    {/* Health */}
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <Typography
                        variant='caption'
                        sx={{
                          fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: '0.075em', color: 'text.secondary',
                          display: 'block', mb: 1,
                        }}
                      >
                        {t('auth.sso.key_health', 'Certificate Health')}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <LinearProgress
                          variant='determinate'
                          value={key.health ?? 100}
                          sx={{
                            flexGrow: 1, height: 6, borderRadius: 3,
                            bgcolor: alpha(theme.palette.divider, 0.1),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              background: (key.health ?? 100) > 90
                                ? `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${alpha(theme.palette.success.main, 0.7)} 100%)`
                                : `linear-gradient(90deg, ${theme.palette.warning.main} 0%, ${alpha(theme.palette.warning.main, 0.7)} 100%)`,
                              boxShadow: (key.health ?? 100) > 90
                                ? `0 0 10px ${alpha(theme.palette.success.main, 0.5)}`
                                : `0 0 10px ${alpha(theme.palette.warning.main, 0.5)}`,
                            }
                          }}
                        />
                        <Typography variant='body2' sx={{ fontWeight: 900, minWidth: 40, color: (key.health ?? 100) > 90 ? 'success.main' : 'warning.main' }}>
                          {key.health ?? 100}%
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Dates */}
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <Box sx={{ display: 'flex', gap: 4 }}>
                        {[
                          { label: t('common.created', 'Created'), value: key.created },
                          { label: t('common.expires', 'Expires'), value: key.expires },
                        ].map(({ label, value }) => (
                          <Box key={label}>
                            <Typography
                              variant='caption'
                              sx={{
                                fontWeight: 700, textTransform: 'uppercase',
                                letterSpacing: '0.075em', color: 'text.secondary',
                                display: 'block', mb: 0.5,
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
                    </Grid>

                    {/* Actions */}
                    <Grid size={{ xs: 12, sm: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, gap: 1 }}>
                        <Tooltip title={t('auth.sso.copy_kid', 'Copy KID')}>
                          <IconButton
                            size='small'
                            onClick={() => handleCopy(key.kid)}
                            sx={{ border: '1px solid', borderColor: 'divider' }}
                            aria-label={t('auth.sso.copy_kid', 'Copy KID')}
                          >
                            <ContentCopy fontSize='small' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.details', 'Details')}>
                          <IconButton
                            size='small'
                            onClick={() => setDetailKid(key.kid)}
                            sx={{ border: '1px solid', borderColor: 'divider' }}
                            aria-label={t('common.details', 'Details')}
                          >
                            <InfoOutlined fontSize='small' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.delete', 'Delete')}>
                          <IconButton
                            size='small'
                            color='error'
                            onClick={() => onDeleteKey?.(key.kid)}
                            sx={{ border: '1px solid', borderColor: alpha(theme.palette.error.main, 0.2) }}
                            aria-label={t('common.delete', 'Delete')}
                          >
                            <Delete fontSize='small' />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* â”€â”€ Audit Log Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Card
        sx={{
          borderRadius: '24px',
          border: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.08),
          boxShadow: 'none',
          mt: 4,
          background: alpha('#000', 0.2),
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
                fontWeight: 700, color: 'text.secondary',
                textTransform: 'none',
                '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.04) },
              }}
            >
              {t('auth.sso.view_key_history', 'View Full History')}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* â”€â”€ Add Key Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Dialog
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth='md'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: alpha('#111', 0.95),
            backdropFilter: 'blur(20px)',
            border: '1px solid',
            borderColor: (t) => alpha(t.palette.divider, 0.1),
            boxShadow: (t) => t.shadows[24],
          }
        }}
      >
        <form onSubmit={handleCreateSubmit}>
          <DialogTitle sx={{ p: 3, pb: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 900, fontFamily: 'Outfit, sans-serif' }}>
              {t('auth.sso.add_manual_key', 'Add Manual OIDC Key')}
            </Typography>
            <IconButton onClick={() => setIsAddModalOpen(false)} size="small" sx={{ color: 'text.secondary' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3, pt: 3 }}>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label='Key ID (KID)'
                fullWidth
                required
                value={formData.kid}
                onChange={(e) => setFormData({ ...formData, kid: e.target.value })}
                placeholder='e.g., prod-key-2024'
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: alpha('#000', 0.3),
                  }
                }}
              />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label='Algorithm'
                    select
                    fullWidth
                    value={formData.algorithm}
                    onChange={(e) => setFormData({ ...formData, algorithm: e.target.value })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        bgcolor: alpha('#000', 0.3),
                      }
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
                    label='Status'
                    select
                    fullWidth
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        bgcolor: alpha('#000', 0.3),
                      }
                    }}
                  >
                    <MenuItem value='active'>Active</MenuItem>
                    <MenuItem value='standby'>Standby</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
              <TextField
                label='Private Key (JWK or PEM)'
                multiline
                rows={4}
                fullWidth
                required
                value={formData.privateKey}
                onChange={(e) => setFormData({ ...formData, privateKey: e.target.value })}
                placeholder='Paste your private key here...'
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: alpha('#000', 0.3),
                  }
                }}
              />
              <TextField
                label='Public Key (JWK or PEM)'
                multiline
                rows={4}
                fullWidth
                required
                value={formData.publicKey}
                onChange={(e) => setFormData({ ...formData, publicKey: e.target.value })}
                placeholder='Paste your public key here...'
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: alpha('#000', 0.3),
                  }
                }}
              />
              <TextField
                label='Expires At'
                type='date'
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: alpha('#000', 0.3),
                  }
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setIsAddModalOpen(false)} sx={{ fontWeight: 700, textTransform: 'none', color: 'text.secondary' }}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              type='submit'
              variant='contained'
              disabled={createMutation.isPending}
              sx={{
                fontWeight: 800,
                borderRadius: '12px',
                textTransform: 'none',
                px: 4,
                bgcolor: 'info.main',
                '&:hover': { bgcolor: 'info.dark' },
              }}
            >
              {createMutation.isPending ? t('common.creating', 'Creating...') : t('common.create', 'Create Key')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* â”€â”€ Key Details Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Dialog
        open={!!detailKid}
        onClose={() => setDetailKid(null)}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: alpha('#111', 0.95),
            backdropFilter: 'blur(20px)',
            border: '1px solid',
            borderColor: (t) => alpha(t.palette.divider, 0.1),
            boxShadow: (t) => t.shadows[24],
          }
        }}
      >
        <DialogTitle sx={{ p: 3, pb: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 40, height: 40,
                bgcolor: alpha(theme.palette.info.main, 0.1),
                color: 'info.main', borderRadius: '12px'
              }}
            >
              <Key sx={{ fontSize: 22 }} />
            </Avatar>
            <Box>
              <Typography variant='h6' component='div' sx={{ fontWeight: 900, fontFamily: 'Outfit, sans-serif' }}>
                {t('auth.sso.key_details', 'Key Details')}
              </Typography>
              <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                {detailKid}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setDetailKid(null)} size='small' sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 3 }}>
          {isDetailLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, gap: 2 }}>
              <CircularProgress size={32} thickness={5} />
              <Typography variant='caption' sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.075em', color: 'text.secondary' }}>
                {t('common.loading', 'Loading...')}
              </Typography>
            </Box>
          ) : keyDetail ? (
            <Stack spacing={3} sx={{ mt: 1 }}>
              {/* Status & Algorithm Row */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {[
                  { label: t('common.status', 'Status'), value: keyDetail.status?.toUpperCase(), color: keyDetail.status === 'active' ? 'success' : keyDetail.status === 'revoked' ? 'error' : 'info' },
                  { label: t('auth.sso.algorithm', 'Algorithm'), value: keyDetail.alg },
                  { label: t('auth.sso.usage', 'Usage'), value: keyDetail.use?.toUpperCase() },
                ].map(({ label, value, color }) => (
                  <Box key={label} sx={{ flex: 1, minWidth: 120, p: 2, borderRadius: '14px', bgcolor: alpha('#000', 0.3), border: '1px solid', borderColor: alpha(theme.palette.divider, 0.08) }}>
                    <Typography variant='caption' sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.075em', color: 'text.secondary', display: 'block', mb: 0.5 }}>
                      {label}
                    </Typography>
                    {color ? (
                      <Chip
                        label={value}
                        size='small'
                        color={color as any}
                        sx={{ fontWeight: 900, fontSize: '0.7rem', borderRadius: '6px' }}
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
                  { label: t('common.created', 'Created'), value: keyDetail.created ? new Date(keyDetail.created).toLocaleString() : 'N/A' },
                  { label: t('common.updated', 'Updated'), value: keyDetail.updated ? new Date(keyDetail.updated).toLocaleString() : 'N/A' },
                  { label: t('common.expires', 'Expires'), value: keyDetail.expires ? new Date(keyDetail.expires).toLocaleString() : 'Never' },
                ].map(({ label, value }) => (
                  <Box key={label} sx={{ flex: 1, minWidth: 120, p: 2, borderRadius: '14px', bgcolor: alpha('#000', 0.3), border: '1px solid', borderColor: alpha(theme.palette.divider, 0.08) }}>
                    <Typography variant='caption' sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.075em', color: 'text.secondary', display: 'block', mb: 0.5 }}>
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant='caption' sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.075em', color: 'text.secondary' }}>
                    {t('auth.sso.public_jwk', 'Public JWK')}
                  </Typography>
                  <Tooltip title={t('common.copy', 'Copy')}>
                    <IconButton
                      size='small'
                      onClick={() => handleCopy(JSON.stringify(keyDetail.publicJwk, null, 2))}
                      sx={{ border: '1px solid', borderColor: 'divider' }}
                    >
                      <ContentCopy sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box
                  component='pre'
                  sx={{
                    p: 2, borderRadius: '14px',
                    bgcolor: alpha('#000', 0.4),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.08),
                    fontSize: '0.75rem', fontFamily: 'monospace',
                    overflow: 'auto', maxHeight: 250,
                    color: alpha('#fff', 0.85),
                    m: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
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
            sx={{ fontWeight: 700, textTransform: 'none', color: 'text.secondary' }}
          >
            {t('common.close', 'Close')}
          </Button>
          <Button
            variant='outlined'
            startIcon={<ContentCopy />}
            onClick={() => handleCopy(detailKid || '')}
            sx={{ fontWeight: 700, textTransform: 'none', borderRadius: '12px' }}
          >
            {t('auth.sso.copy_kid', 'Copy KID')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

