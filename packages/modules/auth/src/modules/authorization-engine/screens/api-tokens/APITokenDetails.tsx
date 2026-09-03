import React, { useMemo } from 'react';
import { Box, Typography, Button, Card, CardContent, Grid, Chip, Skeleton, Alert, Avatar, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GlobeIcon from '@mui/icons-material/Language';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ShieldIcon from '@mui/icons-material/Shield';
import InfoIcon from '@mui/icons-material/Info';
import TerminalIcon from '@mui/icons-material/Terminal';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { alpha, useTheme } from '@mui/material/styles';
import { useUserTokens, useRevokeToken } from '@auth/user-directory/hooks/useUserQuery';
import { Path } from '@auth/routes/path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface TokenData {
  id: number | string
  name: string
  abilities: string[]
  lastUsedAt: string | null
  createdAt: string
  expiresAt: string | null
  status: 'active' | 'expired'
}

// ---------------------------------------------------------------------------
// Sub-components (keeps the main render < 350 lines)
// ---------------------------------------------------------------------------

/** Canonical metadata label + value pair */
const MetaRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Box sx={{ minWidth: 140 }}>
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
      {label}
    </Typography>
    <Typography variant='body2' sx={{ fontWeight: 800, color: 'text.primary' }}>
      {children}
    </Typography>
  </Box>
)

/** Canonical card section heading */
const SectionHeading = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
    {icon}
    <Typography
      variant='h6'
      sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}
    >
      {title}
    </Typography>
  </Box>
)

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
const APITokenDetails: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { tokenId } = useParams<{ tokenId: string }>()
  const theme = useTheme()

  const { data: tokensResponse, isLoading, isError } = useUserTokens()

  const token = useMemo<TokenData | undefined>(() => {
    if (!tokensResponse?.data) return undefined
    const tokens = Array.isArray(tokensResponse.data) ? tokensResponse.data : []
    return tokens.find((tk: TokenData) => String(tk.id) === tokenId)
  }, [tokensResponse, tokenId])

  const revokeTokenMutation = useRevokeToken({
    onSuccess: () => {
      toast.success(t('api_tokens:revoke_success', 'Token revoked successfully'), {  })
      navigate(Path.apiTokens.dashboard)
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : t('api_tokens:revoke_error', 'Failed to revoke')
      toast.error(message)
    },
  })

  const handleRevoke = () => {
    if (token) {
      revokeTokenMutation.mutate(token.id)
    }
  }

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return t('common:never', 'Never')
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  const getExpiryStatus = () => {
    if (!token?.expiresAt)
      return { label: t('api_tokens:no_expiry', 'No Expiry'), color: 'info' as const }
    const expiresAt = new Date(token.expiresAt)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry <= 0)
      return { label: t('api_tokens:expired', 'Expired'), color: 'error' as const }
    if (daysUntilExpiry <= 7)
      return { label: t('api_tokens:expiring_soon', 'Expiring Soon'), color: 'warning' as const }
    return {
      label: `${daysUntilExpiry} ${t('common:days_remaining', 'days remaining')}`,
      color: 'success' as const,
    }
  }

  // â”€â”€ Loading State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        <Skeleton variant='text' width={300} height={32} sx={{ mb: 2 }} />
        <Skeleton variant='text' width={200} height={48} sx={{ mb: 4 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton variant='rounded' height={320} sx={{ borderRadius: 2, mb: 3 }} />
            <Skeleton variant='rounded' height={200} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant='rounded' height={260} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Box>
    )
  }

  // â”€â”€ Error / Not Found State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (isError || !token) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        <Alert
          severity='error'
          action={
            <Button
              color='inherit'
              size='small'
              onClick={() => navigate(Path.apiTokens.dashboard)}
              sx={{ fontWeight: 700, textTransform: 'none' }}
            >
              {t('common:go_back', 'Go Back')}
            </Button>
          }
        >
          {t('api_tokens:token_not_found', 'Token not found or you do not have access to it.')}
        </Alert>
      </Box>
    )
  }

  const expiryStatus = getExpiryStatus()

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* â”€â”€ Top Banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
          {/* Avatar with status dot */}
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                width: { xs: 56, md: 80 },
                height: { xs: 56, md: 80 },
                borderRadius: '24px',
                bgcolor: 'primary.main',
                boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <VpnKeyIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box
              sx={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                width: 24,
                height: 24,
                bgcolor: token.status === 'active' ? 'success.main' : 'error.main',
                borderRadius: '50%',
                border: '4px solid',
                borderColor: 'background.paper',
              }}
            />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(Path.apiTokens.dashboard)}
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
                {token.name}
              </Typography>
            </Box>
            <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap'>
              <Typography variant='body2' color='text.secondary'>
                ID: {token.id}
              </Typography>
              <Chip
                label={
                  token.status === 'active'
                    ? t('common:active', 'Active')
                    : t('common:expired', 'Expired')
                }
                size='small'
                color={token.status === 'active' ? 'success' : 'error'}
                variant='outlined'
                sx={{ fontWeight: 700, height: 20 }}
              />
              <Chip
                label={expiryStatus.label}
                size='small'
                color={expiryStatus.color}
                variant='outlined'
                sx={{ fontWeight: 700, height: 20 }}
              />
            </Stack>
          </Box>
        </Box>

        {/* Primary CTA â€” Revoke (single location, no duplicate) */}
        <Stack
          direction='row'
          spacing={2}
          sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}
        >
          <Button
            variant='contained'
            startIcon={<DeleteIcon />}
            onClick={handleRevoke}
            disabled={revokeTokenMutation.isPending}
            sx={{
              bgcolor: 'error.main',
              color: 'white',
              boxShadow: `0 4px 14px 0 ${alpha(theme.palette.error.main, 0.39)}`,
              '&:hover': { bgcolor: 'error.dark' },
              textTransform: 'none',
              fontWeight: 700,
              flex: { xs: 1, sm: 'none' },
              height: 44,
              px: 3,
            }}
          >
            {revokeTokenMutation.isPending
              ? t('common:revoking', 'Revoking...')
              : t('common:revoke', 'Revoke Token')}
          </Button>
        </Stack>
      </Box>

      {/* â”€â”€ Main Grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Grid container spacing={3}>
        {/* Main Column */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Overview Card */}
          <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <SectionHeading
                icon={<VpnKeyIcon color='primary' sx={{ fontSize: 24 }} />}
                title={t('api_tokens:overview', 'Overview')}
              />

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <MetaRow label={t('api_tokens:created_at', 'Created')}>
                  {formatDate(token.createdAt)}
                </MetaRow>
                <MetaRow label={t('api_tokens:expires_at', 'Expires')}>
                  {formatDate(token.expiresAt)}
                </MetaRow>
                <MetaRow label={t('api_tokens:last_used', 'Last Used')}>
                  {formatDate(token.lastUsedAt)}
                </MetaRow>
              </Box>
            </CardContent>
          </Card>

          {/* Permissions Card */}
          <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <SectionHeading
                icon={<ShieldIcon color='primary' sx={{ fontSize: 24 }} />}
                title={t('api_tokens:permissions', 'Permissions & Scopes')}
              />

              {token.abilities && token.abilities.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {token.abilities.map((ability) => (
                    <Chip
                      key={ability}
                      label={ability}
                      size='small'
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        height: 20,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: 'primary.main',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.action.hover, 0.3),
                    border: '1px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <GlobeIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
                  <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
                    {t('api_tokens:full_access', 'Full access â€” no scope restrictions')}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Side Panel */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Quick Actions Card */}
          <Card
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              bgcolor: alpha(theme.palette.primary.main, 0.02),
              mb: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <VpnKeyIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                <Typography variant='subtitle1' sx={{ fontWeight: 800 }}>
                  {t('api_tokens:quick_actions', 'Quick Actions')}
                </Typography>
              </Box>

              <Stack spacing={1.5}>
                <Button
                  variant='outlined'
                  fullWidth
                  startIcon={<TerminalIcon />}
                  onClick={() =>
                    navigate(Path.apiTokens.display.replace(':tokenId', String(token.id)))
                  }
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontWeight: 700,
                  }}
                >
                  {t('api_tokens:usage_guide', 'Usage Guide')}
                </Button>
                <Button
                  variant='outlined'
                  fullWidth
                  color='error'
                  startIcon={<DeleteIcon />}
                  onClick={handleRevoke}
                  disabled={revokeTokenMutation.isPending}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontWeight: 700,
                  }}
                >
                  {revokeTokenMutation.isPending
                    ? t('common:revoking', 'Revoking...')
                    : t('api_tokens:revoke_this_token', 'Revoke This Token')}
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Info Tip Box */}
          <Box
            sx={{
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
              <InfoIcon fontSize='small' />
              {t('api_tokens:security_tip_title', 'Security Reminder')}
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
              {t(
                'api_tokens:revoke_warning',
                'Once revoked, this token will immediately stop working. Any applications using this token will lose access.',
              )}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

export default APITokenDetails
