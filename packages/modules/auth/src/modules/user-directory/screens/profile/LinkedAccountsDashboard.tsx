import React, { useMemo, useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Container,
  ListItemButton,
  useTheme,
  alpha,
  CircularProgress,
  Grid,
} from '@mui/material'
import { buildLayoutSurfaceEffect } from '@cap/layout'
import { getTenantThemeEffects } from '@cap/theme'

import GoogleIcon from '@mui/icons-material/Google'
import GitHubIcon from '@mui/icons-material/GitHub'
import MicrosoftIcon from '@mui/icons-material/Microsoft'
import TwitterIcon from '@mui/icons-material/Twitter'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HistoryIcon from '@mui/icons-material/History'
import WarningIcon from '@mui/icons-material/Warning'
import SecurityIcon from '@mui/icons-material/Security'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import LinkIcon from '@mui/icons-material/Link'

import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotifications, API_CONFIG } from '@cap/platform-core'
import userService from "../../services/user.service"
import { QUERY_KEYS } from "@idaas/authentication-core/services/query"
import { ENDPOINTS } from '@cap/platform-core'

const BRAND_COLORS = {
  google: '#EA4335',
  microsoft: '#00A4EF',
  twitter: '#1DA1F2',
  github: (mode: 'light' | 'dark') => (mode === 'dark' ? '#FFFFFF' : '#333333'),
}

interface LinkedAccount {
  id: number
  provider: string
  providerId: string
  email: string | null
  metadata: any
  linkedAt: string
}

const buildProviders = (t: any, mode: 'light' | 'dark', accounts: LinkedAccount[]) => [
  {
    id: 'google',
    name: 'Google',
    icon: <GoogleIcon sx={{ color: BRAND_COLORS.google }} />,
    account: accounts.find((a) => a.provider === 'google'),
    details: {
      method: 'OAuth2 API',
      permissions: [
        t('auth.account.perm_profile'),
        t('auth.account.perm_email'),
      ],
      recentActivity: [
        { date: 'Recent', action: t('auth.account.authorized') },
      ],
    },
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: <GitHubIcon sx={{ color: BRAND_COLORS.github(mode) }} />,
    account: accounts.find((a) => a.provider === 'github'),
    details: {
      method: 'OAuth2 API',
      permissions: [
        t('auth.account.perm_profile'),
        t('auth.account.perm_repos'),
        t('auth.account.perm_email'),
      ],
      recentActivity: [
        { date: 'Recent', action: t('auth.account.authorized') },
      ],
    },
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    icon: <MicrosoftIcon sx={{ color: BRAND_COLORS.microsoft }} />,
    account: accounts.find((a) => a.provider === 'microsoft'),
    details: {
      method: 'OAuth2 API',
      permissions: [
        t('auth.account.perm_profile'),
        t('auth.account.perm_email'),
      ],
      recentActivity: [
        { date: 'Recent', action: t('auth.account.authorized') },
      ],
    },
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: <TwitterIcon sx={{ color: BRAND_COLORS.twitter }} />,
    account: accounts.find((a) => a.provider === 'twitter'),
    details: {
      method: 'OAuth2 API',
      permissions: [
        t('auth.account.perm_profile'),
        t('auth.account.perm_email'),
      ],
      recentActivity: [
        { date: 'Recent', action: t('auth.account.authorized') },
      ],
    },
  },
]

const LinkedAccountsDashboard = () => {
  const { t } = useTranslation('common')
  const theme = useTheme()
  const { addNotification } = useNotifications()
  const queryClient = useQueryClient()

  const [selectedProviderId, setSelectedProviderId] = useState<string>('google')

  const { data: accountsResponse, isLoading } = useQuery({
    queryKey: QUERY_KEYS.auth.linkedAccounts,
    queryFn: () => userService.getLinkedAccounts(),
  })

  // Extract linked accounts from response
  const accounts: LinkedAccount[] = useMemo(() => {
    return (accountsResponse?.data as LinkedAccount[]) || []
  }, [accountsResponse])

  const providers = useMemo(
    () => buildProviders(t, theme.palette.mode, accounts),
    [t, theme.palette.mode, accounts]
  )

  const selectedProvider = providers.find((p) => p.id === selectedProviderId) || providers[0]
  const isSelectedConnected = !!selectedProvider?.account

  const revokeMutation = useMutation({
    mutationFn: (accountId: number) => userService.unlinkAccount(accountId),
    onSuccess: () => {
      addNotification({ title: t('auth.account.success'), message: t('auth.account.unlink_success'), type: 'success' })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.linkedAccounts })
    },
    onError: () => {
      addNotification({ title: t('auth.account.error'), message: t('auth.account.unlink_error'), type: 'error' })
    },
  })

  const darkCaptionColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.9)' : 'text.secondary'

  const handleConnect = (providerId: string) => {
    // Standard OAuth flow redirect API
    window.location.href = `${API_CONFIG.baseURL}${ENDPOINTS.auth.social.redirect(providerId)}?interaction=linked-accounts`
  }

  const handleRevoke = () => {
    if (selectedProvider?.account?.id) {
      revokeMutation.mutate(selectedProvider.account.id)
    }
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.027em', mb: 1 }}>
          {t('auth.account.linked_accounts_title')}
        </Typography>
        <Typography variant="body1" sx={{ color: darkCaptionColor }}>
          {t('auth.account.linked_accounts_desc')}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Providers List */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={(theme: any) => ({
              borderRadius: 4,
              border: '1px solid ' + theme.palette.divider,
              ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
            })}
          >
            <List disablePadding>
              {providers.map((provider, index) => {
                const isSelected = provider.id === selectedProviderId
                const isConnected = !!provider.account
                return (
                  <React.Fragment key={provider.id}>
                    <ListItemButton
                      role="button"
                      selected={isSelected}
                      onClick={() => setSelectedProviderId(provider.id)}
                      tabIndex={0}
                      aria-label={t('auth.account.view_provider', {
                        provider: provider.name,
                      })}
                      sx={{
                        py: 2,
                        bgcolor: isSelected
                          ? alpha(theme.palette.action.selected, theme.palette.mode === 'dark' ? 0.3 : 0.15)
                          : isConnected
                          ? alpha(theme.palette.action.selected, theme.palette.mode === 'dark' ? 0.2 : 0.08)
                          : 'transparent',
                      }}
                    >
                      <ListItemIcon>
                        <Avatar
                          aria-hidden="true"
                          sx={{
                            bgcolor: 'transparent',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          {provider.icon}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: 800, color: 'text.primary' }}>
                            {provider.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ color: darkCaptionColor }}>
                            {isConnected
                              ? t('auth.account.connected')
                              : t('auth.account.not_connected')}
                          </Typography>
                        }
                      />
                      <ChevronRightIcon color="action" />
                    </ListItemButton>
                    {index < providers.length - 1 && <Divider />}
                  </React.Fragment>
                )
              })}
            </List>
          </Card>
        </Grid>

        {/* Selected Provider Details */}
        <Grid size={{ xs: 12, md: 8 }}>
          {selectedProvider && (
            <Card
              sx={{
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    aria-hidden="true"
                    sx={{
                      bgcolor: 'transparent',
                      border: '1px solid',
                      borderColor: 'divider',
                      mr: 2,
                    }}
                  >
                    {selectedProvider.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      {t('auth.account.provider_details', {
                        provider: selectedProvider.name,
                      })}
                    </Typography>
                    <Typography variant="body2" sx={{ color: darkCaptionColor }}>
                      {isSelectedConnected
                        ? t('auth.account.connected_via', {
                            method: selectedProvider.details?.method,
                          })
                        : t('auth.account.unconnected_method', {
                            method: selectedProvider.details?.method,
                          })}
                    </Typography>
                  </Box>
                  {isSelectedConnected && (
                    <Chip
                      label={t('auth.account.connected').toUpperCase()}
                      color="success"
                      variant="outlined"
                      size="small"
                      sx={{
                        ml: 'auto',
                        fontWeight: 700,
                        height: 20,
                        textTransform: 'uppercase',
                        letterSpacing: '0.075em',
                      }}
                    />
                  )}
                </Box>

                <Divider sx={{ my: 4, opacity: 0.5 }} />

                <Typography
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: '0.8125rem',
                  }}
                >
                  <SecurityIcon sx={{ mr: 1, fontSize: 20, color: isSelectedConnected ? 'warning.main' : 'text.disabled' }} />
                  {t('auth.account.granted_permissions')}
                </Typography>
                <List dense>
                  {selectedProvider.details?.permissions.map((permission, i) => (
                    <ListItem key={i} disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon
                          aria-hidden="true"
                          sx={{ fontSize: 18, color: isSelectedConnected ? 'success.main' : 'text.disabled' }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={permission}
                        primaryTypographyProps={{
                          sx: { color: isSelectedConnected ? 'text.primary' : 'text.disabled', fontWeight: 500 },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>

                {isSelectedConnected && (
                  <>
                    <Divider sx={{ my: 4, opacity: 0.5 }} />
                    <Typography
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontSize: '0.8125rem',
                      }}
                    >
                      <HistoryIcon sx={{ mr: 1, fontSize: 20, color: 'warning.main' }} />
                      {t('auth.account.recent_activity')}
                    </Typography>
                    <List dense>
                      {selectedProvider.details?.recentActivity.map((activity, i) => (
                        <ListItem key={i} disableGutters>
                          <ListItemText
                            primary={activity.action}
                            secondary={activity.date}
                            primaryTypographyProps={{ variant: 'body2', fontWeight: 800, color: 'text.primary' }}
                            secondaryTypographyProps={{ sx: { color: darkCaptionColor } }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {isSelectedConnected ? (
                  <Box
                    sx={{
                      mt: 4,
                      p: 2,
                      bgcolor: alpha(theme.palette.error.main, 0.05),
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.error.main, 0.2),
                    }}
                  >
                    <Typography
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontSize: '0.8125rem',
                        color: theme.palette.mode === 'dark' ? '#ff8a80' : 'error.main',
                      }}
                    >
                      <WarningIcon sx={{ mr: 1, fontSize: 20 }} />
                      {t('auth.account.danger_zone')}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: darkCaptionColor }}>
                      {t('auth.account.revoke_warning', { provider: selectedProvider.name })}
                    </Typography>
                    <Button
                      variant="contained"
                      disableElevation
                      onClick={handleRevoke}
                      disabled={revokeMutation.isPending}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                        color: theme.palette.error.main,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.error.main, 0.2),
                        '&:hover': {
                          bgcolor: alpha(theme.palette.error.main, 0.2),
                        },
                      }}
                    >
                      {revokeMutation.isPending
                        ? t('auth.account.revoking')
                        : t('auth.account.revoke_access')}
                    </Button>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      mt: 4,
                      p: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                    }}
                  >
                    <Typography
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontSize: '0.8125rem',
                        color: theme.palette.primary.main,
                      }}
                    >
                      <LinkIcon sx={{ mr: 1, fontSize: 20 }} />
                      {t('auth.account.link_provider')}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: darkCaptionColor }}>
                      {t('auth.account.link_description', { provider: selectedProvider.name })}
                    </Typography>
                    <Button
                      variant="contained"
                      disableElevation
                      onClick={() => handleConnect(selectedProvider.id)}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        border: '1px solid',
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.2),
                        },
                      }}
                    >
                      {t('auth.account.connect_access')}
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  )
}

export default LinkedAccountsDashboard





