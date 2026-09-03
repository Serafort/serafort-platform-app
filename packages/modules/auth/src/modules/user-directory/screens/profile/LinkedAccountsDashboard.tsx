// LinkedAccountsDashboard.tsx
// High-fidelity Linked Accounts & Social OAuth Integration Dashboard matching profile.tsx

import React, { useMemo, useState, useEffect } from 'react'
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
  Stack,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Paper,
  Tooltip,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import GoogleIcon from '@mui/icons-material/Google'
import GitHubIcon from '@mui/icons-material/GitHub'
import TwitterIcon from '@mui/icons-material/Twitter'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HistoryIcon from '@mui/icons-material/History'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import SecurityIcon from '@mui/icons-material/Security'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import LinkIcon from '@mui/icons-material/Link'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import CloseIcon from '@mui/icons-material/Close'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import RefreshIcon from '@mui/icons-material/Refresh'

import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useNotifications, API_CONFIG, ENDPOINTS } from '@cap/platform-core'
import { useLinkedAccounts, useUnlinkAccount, useGetUser } from '../../hooks/useUserQuery'
import { LinkedAccountDTO } from '@idaas/authentication-core/types/api.types'

const BRAND_COLORS = {
  google: '#EA4335',
  microsoft: '#00A4EF',
  twitter: '#1DA1F2',
  github: (mode: 'light' | 'dark') => (mode === 'dark' ? '#FFFFFF' : '#24292F'),
}

// Custom Microsoft SVG Icon
function MicrosoftIconSvg(props: any) {
  return (
    <svg width='20' height='20' viewBox='0 0 21 21' fill='none' {...props}>
      <rect x='1' y='1' width='9' height='9' fill='#F25022' />
      <rect x='11' y='1' width='9' height='9' fill='#7FBA00' />
      <rect x='1' y='11' width='9' height='9' fill='#00A4EF' />
      <rect x='11' y='11' width='9' height='9' fill='#FFB900' />
    </svg>
  )
}

interface ProviderMeta {
  id: string
  name: string
  icon: React.ReactNode
  account?: LinkedAccountDTO | null
  description: string
  permissions: string[]
}

export default function LinkedAccountsDashboard() {
  const { t } = useTranslation('common')
  const theme = useTheme()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { addNotification } = useNotifications()

  const [selectedProviderId, setSelectedProviderId] = useState<string>('google')
  const [isUnlinkDialogOpen, setIsUnlinkDialogOpen] = useState<boolean>(false)

  // Queries
  const {
    data: accountsResponse,
    isLoading: isAccountsLoading,
    isFetching: isAccountsFetching,
    isError: isAccountsError,
    error: accountsError,
    refetch: refetchAccounts,
  } = useLinkedAccounts()

  const { data: userResponse } = useGetUser()
  const currentUser = userResponse?.data

  // Unlink Mutation
  const unlinkMutation = useUnlinkAccount({
    onSuccess: () => {
      setIsUnlinkDialogOpen(false)
      addNotification?.({
        type: 'success',
        title: 'Account Unlinked',
        message: 'The identity provider has been disconnected from your profile.',
      })
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || err?.message || 'Failed to disconnect account.'
      addNotification?.({
        type: 'error',
        title: 'Unlink Failed',
        message,
      })
    },
  })

  // Handle URL query parameters from OAuth redirects
  useEffect(() => {
    const linkedStatus = searchParams.get('linked')
    const errorParam = searchParams.get('error')
    const providerParam = searchParams.get('provider')

    if (linkedStatus === 'success') {
      addNotification?.({
        type: 'success',
        title: 'Account Linked',
        message: `Successfully connected ${providerParam ? providerParam.toUpperCase() : 'account'} to your profile.`,
      })
      refetchAccounts()
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('linked')
      nextParams.delete('provider')
      setSearchParams(nextParams, { replace: true })
    } else if (errorParam) {
      addNotification?.({
        type: 'error',
        title: 'Linking Failed',
        message: decodeURIComponent(errorParam).replace(/_/g, ' '),
      })
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('error')
      setSearchParams(nextParams, { replace: true })
    }
  }, [searchParams, setSearchParams, addNotification, refetchAccounts])

  // Extract linked accounts
  const accounts: LinkedAccountDTO[] = useMemo(() => {
    return (accountsResponse?.data as LinkedAccountDTO[]) || []
  }, [accountsResponse])

  // Map providers list
  const providers: ProviderMeta[] = useMemo(() => {
    return [
      {
        id: 'google',
        name: 'Google',
        icon: <GoogleIcon sx={{ color: BRAND_COLORS.google, fontSize: 22 }} />,
        account: accounts.find((a) => a.provider?.toLowerCase() === 'google') || null,
        description: 'Sign in with your Google Workspace or Personal Account',
        permissions: ['Email Address', 'Basic Profile', 'OpenID Connect'],
      },
      {
        id: 'github',
        name: 'GitHub',
        icon: <GitHubIcon sx={{ color: BRAND_COLORS.github(theme.palette.mode), fontSize: 22 }} />,
        account: accounts.find((a) => a.provider?.toLowerCase() === 'github') || null,
        description: 'Authenticate and sync with your GitHub developer identity',
        permissions: ['Public Profile', 'User Email', 'Organization Read'],
      },
      {
        id: 'microsoft',
        name: 'Microsoft',
        icon: <MicrosoftIconSvg />,
        account: accounts.find((a) => a.provider?.toLowerCase() === 'microsoft') || null,
        description: 'Connect with Microsoft Azure AD / Office 365 Account',
        permissions: ['User.Read', 'Profile', 'Email'],
      },
      {
        id: 'twitter',
        name: 'Twitter (X)',
        icon: <TwitterIcon sx={{ color: BRAND_COLORS.twitter, fontSize: 22 }} />,
        account: accounts.find((a) => a.provider?.toLowerCase() === 'twitter') || null,
        description: 'Sign in with your verified X / Twitter account',
        permissions: ['Read Profile', 'Email Address'],
      },
    ]
  }, [accounts, theme.palette.mode])

  const selectedProvider = providers.find((p) => p.id === selectedProviderId) || providers[0]
  const isSelectedConnected = Boolean(selectedProvider?.account)

  // Safeguard: Check if user has a password or other accounts
  const hasLocalPassword = Boolean(
    (currentUser as any)?.hasPassword !== false && (currentUser as any)?.password !== '',
  )
  const isOnlyLoginMethod = !hasLocalPassword && accounts.length <= 1

  const handleConnect = (providerId: string) => {
    // Initiate OAuth flow with interaction=linked-accounts
    const baseUrl = API_CONFIG.baseURL || ''
    const redirectUrl = `${baseUrl}/api/auth/${providerId}/redirect?interaction=linked-accounts`
    window.location.href = redirectUrl
  }

  const handleOpenUnlinkDialog = () => {
    setIsUnlinkDialogOpen(true)
  }

  const handleConfirmUnlink = () => {
    if (selectedProvider?.account?.id) {
      unlinkMutation.mutate(selectedProvider.account.id)
    }
  }

  return (
    <Container maxWidth='lg' sx={{ py: { xs: 2.5, md: 4 } }}>
      {/* Navigation Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent='space-between'
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        mb={3.5}
      >
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/profile')}
            sx={{
              mb: 1,
              textTransform: 'none',
              fontWeight: 600,
              color: 'text.secondary',
              p: 0,
              minWidth: 0,
              '&:hover': { bgcolor: 'transparent', color: 'text.primary' },
            }}
          >
            Back to Profile
          </Button>
          <Stack direction='row' spacing={1.5} alignItems='center'>
            <Typography variant='h4' fontWeight={800} letterSpacing='-0.02em'>
              Linked Accounts
            </Typography>
            {isAccountsFetching && !isAccountsLoading && (
              <CircularProgress size={16} sx={{ color: 'text.secondary' }} />
            )}
          </Stack>
          <Typography variant='body2' color='text.secondary'>
            Connect third-party identity providers to enable frictionless single sign-on (SSO).
          </Typography>
        </Box>

        <Tooltip title='Refresh Connected Accounts'>
          <IconButton
            onClick={() => refetchAccounts()}
            size='small'
            sx={{
              border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
              borderRadius: 2,
              p: 1,
            }}
          >
            <RefreshIcon fontSize='small' />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Error Alert */}
      {isAccountsError && (
        <Alert
          severity='error'
          sx={{ mb: 3 }}
          action={
            <Button color='inherit' size='small' onClick={() => refetchAccounts()}>
              Retry
            </Button>
          }
        >
          {(accountsError as any)?.message || 'Failed to load linked accounts. Please try again.'}
        </Alert>
      )}

      {/* Main Container Grid */}
      <Grid container spacing={3}>
        {/* Left Column: Providers List */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.04)',
              overflow: 'hidden',
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ p: 2.5, pb: 1.5 }}>
              <Typography variant='subtitle2' fontWeight={700}>
                Identity Providers
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Select a provider to view status & permissions
              </Typography>
            </Box>

            <Divider sx={{ opacity: 0.6 }} />

            <List disablePadding>
              {isAccountsLoading
                ? Array.from({ length: 4 }).map((_, idx) => (
                    <ListItem key={idx} sx={{ p: 2 }}>
                      <ListItemIcon>
                        <Skeleton variant='circular' width={36} height={36} />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Skeleton variant='text' width={80} />}
                        secondary={<Skeleton variant='text' width={110} />}
                      />
                    </ListItem>
                  ))
                : providers.map((provider, index) => {
                    const isSelected = provider.id === selectedProviderId
                    const isConnected = Boolean(provider.account)

                    return (
                      <React.Fragment key={provider.id}>
                        <ListItemButton
                          selected={isSelected}
                          onClick={() => setSelectedProviderId(provider.id)}
                          sx={{
                            py: 2,
                            px: 2.5,
                            transition: 'all 0.15s ease',
                            bgcolor: isSelected
                              ? alpha(theme.palette.primary.main, 0.08)
                              : 'transparent',
                            '&:hover': {
                              bgcolor: isSelected
                                ? alpha(theme.palette.primary.main, 0.12)
                                : alpha(theme.palette.text.primary, 0.04),
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 44 }}>
                            <Avatar
                              sx={{
                                width: 36,
                                height: 36,
                                bgcolor: alpha(theme.palette.background.default, 0.8),
                                border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                              }}
                            >
                              {provider.icon}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Stack direction='row' spacing={1} alignItems='center'>
                                <Typography variant='body2' fontWeight={700}>
                                  {provider.name}
                                </Typography>
                                {isConnected && (
                                  <Chip
                                    label='Connected'
                                    size='small'
                                    color='success'
                                    sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                                  />
                                )}
                              </Stack>
                            }
                            secondary={
                              <Typography
                                variant='caption'
                                color='text.secondary'
                                noWrap
                                display='block'
                              >
                                {isConnected
                                  ? provider.account?.email || 'Linked Account'
                                  : 'Not connected'}
                              </Typography>
                            }
                          />
                          <ChevronRightIcon
                            fontSize='small'
                            sx={{
                              color: isSelected ? 'primary.main' : 'text.disabled',
                              transition: 'transform 0.15s',
                              transform: isSelected ? 'translateX(2px)' : 'none',
                            }}
                          />
                        </ListItemButton>
                        {index < providers.length - 1 && <Divider sx={{ opacity: 0.4 }} />}
                      </React.Fragment>
                    )
                  })}
            </List>
          </Card>
        </Grid>

        {/* Right Column: Provider Details Pane */}
        <Grid size={{ xs: 12, md: 8 }}>
          {isAccountsLoading ? (
            <Card sx={{ p: 4, borderRadius: 3 }}>
              <Skeleton variant='rectangular' height={280} sx={{ borderRadius: 2 }} />
            </Card>
          ) : selectedProvider ? (
            <Card
              sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.04)',
                bgcolor: 'background.paper',
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                {/* Provider Detail Header */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2.5}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  justifyContent='space-between'
                  mb={3}
                >
                  <Stack direction='row' spacing={2} alignItems='center'>
                    <Avatar
                      sx={{
                        width: 52,
                        height: 52,
                        bgcolor: alpha(theme.palette.background.default, 0.8),
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                      }}
                    >
                      {selectedProvider.icon}
                    </Avatar>
                    <Box>
                      <Stack direction='row' spacing={1} alignItems='center'>
                        <Typography variant='h6' fontWeight={800}>
                          {selectedProvider.name}
                        </Typography>
                        {isSelectedConnected ? (
                          <Chip
                            icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                            label='Connected'
                            color='success'
                            size='small'
                            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                          />
                        ) : (
                          <Chip
                            label='Not Connected'
                            size='small'
                            variant='outlined'
                            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                          />
                        )}
                      </Stack>
                      <Typography variant='body2' color='text.secondary'>
                        {selectedProvider.description}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Top Action Button */}
                  {isSelectedConnected ? (
                    <Button
                      variant='outlined'
                      color='error'
                      startIcon={<LinkOffIcon />}
                      onClick={handleOpenUnlinkDialog}
                      disabled={unlinkMutation.isPending}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                        borderColor: alpha(theme.palette.error.main, 0.3),
                      }}
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      variant='contained'
                      startIcon={<LinkIcon />}
                      onClick={() => handleConnect(selectedProvider.id)}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: 2,
                        px: 2.5,
                      }}
                    >
                      Connect {selectedProvider.name}
                    </Button>
                  )}
                </Stack>

                <Divider sx={{ my: 3, opacity: 0.6 }} />

                {/* Connected Account Metadata */}
                {isSelectedConnected && selectedProvider.account && (
                  <Box mb={3.5}>
                    <Typography variant='subtitle2' fontWeight={700} mb={1.5}>
                      Linked Account Details
                    </Typography>
                    <Paper
                      variant='outlined'
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.background.default, 0.4),
                        borderColor: alpha(theme.palette.divider, 0.12),
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant='caption' color='text.secondary' display='block'>
                            Connected Identity Email
                          </Typography>
                          <Typography variant='body2' fontWeight={600}>
                            {selectedProvider.account.email || 'Primary Account Email'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant='caption' color='text.secondary' display='block'>
                            Connected On
                          </Typography>
                          <Typography variant='body2' fontWeight={600}>
                            {(selectedProvider.account as any)?.linkedAt ||
                            (selectedProvider.account as any)?.created_at ||
                            (selectedProvider.account as any)?.createdAt
                              ? new Date(
                                  (selectedProvider.account as any)?.linkedAt ||
                                    (selectedProvider.account as any)?.created_at ||
                                    (selectedProvider.account as any)?.createdAt,
                                ).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'Recently'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Box>
                )}

                {/* Granted Permissions Scopes */}
                <Box mb={3.5}>
                  <Stack direction='row' spacing={1} alignItems='center' mb={1.5}>
                    <SecurityIcon fontSize='small' color='action' />
                    <Typography variant='subtitle2' fontWeight={700}>
                      Permissions & Scopes
                    </Typography>
                  </Stack>
                  <Typography variant='caption' color='text.secondary' display='block' mb={1.5}>
                    {isSelectedConnected
                      ? 'The following OAuth permissions have been authorized for this service:'
                      : 'Connecting this account will request authorization for the following scopes:'}
                  </Typography>
                  <Stack direction='row' flexWrap='wrap' gap={1}>
                    {selectedProvider.permissions.map((perm, idx) => (
                      <Chip
                        key={idx}
                        icon={
                          isSelectedConnected ? (
                            <CheckCircleIcon
                              sx={{ fontSize: '14px !important', color: 'success.main' }}
                            />
                          ) : undefined
                        }
                        label={perm}
                        size='small'
                        variant={isSelectedConnected ? 'filled' : 'outlined'}
                        sx={{
                          fontWeight: 600,
                          bgcolor: isSelectedConnected
                            ? alpha(theme.palette.success.main, 0.08)
                            : undefined,
                          borderColor: isSelectedConnected
                            ? alpha(theme.palette.success.main, 0.2)
                            : alpha(theme.palette.divider, 0.2),
                        }}
                      />
                    ))}
                  </Stack>
                </Box>

                {/* Activity & History */}
                {isSelectedConnected && (
                  <Box mb={3.5}>
                    <Stack direction='row' spacing={1} alignItems='center' mb={1.5}>
                      <HistoryIcon fontSize='small' color='action' />
                      <Typography variant='subtitle2' fontWeight={700}>
                        Authentication Activity
                      </Typography>
                    </Stack>
                    <List dense sx={{ p: 0 }}>
                      <ListItem disableGutters>
                        <ListItemText
                          primary='Last Authorized Session'
                          secondary='Active token valid for Single Sign-On'
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                          secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                        />
                      </ListItem>
                    </List>
                  </Box>
                )}

                {/* Bottom Callout / Action Card */}
                {isSelectedConnected ? (
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.error.main, 0.04),
                      border: `1px solid ${alpha(theme.palette.error.main, 0.15)}`,
                    }}
                  >
                    <Stack direction='row' spacing={1.5} alignItems='flex-start'>
                      <WarningAmberIcon color='error' sx={{ mt: 0.25 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant='subtitle2'
                          fontWeight={700}
                          color='error.main'
                          gutterBottom
                        >
                          Disconnect {selectedProvider.name} Account
                        </Typography>
                        <Typography variant='body2' color='text.secondary' mb={2}>
                          Disconnecting will remove {selectedProvider.name} as a single sign-on
                          method. You will need to use your password or another connected provider
                          to log in.
                        </Typography>
                        <Button
                          variant='contained'
                          color='error'
                          onClick={handleOpenUnlinkDialog}
                          disabled={unlinkMutation.isPending}
                          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                        >
                          Disconnect Account
                        </Button>
                      </Box>
                    </Stack>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                    }}
                  >
                    <Stack direction='row' spacing={1.5} alignItems='flex-start'>
                      <LinkIcon color='primary' sx={{ mt: 0.25 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant='subtitle2'
                          fontWeight={700}
                          color='primary.main'
                          gutterBottom
                        >
                          Enable 1-Click Login with {selectedProvider.name}
                        </Typography>
                        <Typography variant='body2' color='text.secondary' mb={2}>
                          Link your {selectedProvider.name} account to securely log in with a single
                          click without having to enter your password each time.
                        </Typography>
                        <Button
                          variant='contained'
                          onClick={() => handleConnect(selectedProvider.id)}
                          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                        >
                          Connect {selectedProvider.name}
                        </Button>
                      </Box>
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
          ) : null}
        </Grid>
      </Grid>

      {/* Unlink Confirmation Dialog */}
      <Dialog
        open={isUnlinkDialogOpen}
        onClose={unlinkMutation.isPending ? undefined : () => setIsUnlinkDialogOpen(false)}
        maxWidth='xs'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.25)',
            border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            p: 3,
            pb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction='row' spacing={1.5} alignItems='center'>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
                display: 'flex',
              }}
            >
              <LinkOffIcon />
            </Box>
            <Box>
              <Typography variant='h6' fontWeight={700}>
                Disconnect Account
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {selectedProvider?.name} Identity Link
              </Typography>
            </Box>
          </Stack>
          <IconButton
            onClick={() => setIsUnlinkDialogOpen(false)}
            size='small'
            disabled={unlinkMutation.isPending}
          >
            <CloseIcon fontSize='small' />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 1 }}>
          <Stack spacing={2}>
            {isOnlyLoginMethod ? (
              <Alert severity='error'>
                <strong>Lockout Prevention Warning:</strong> This is currently your only connected
                login method and you do not have a local password configured. Disconnecting this
                account will lock you out of your profile. Please set a password first.
              </Alert>
            ) : (
              <Typography variant='body2' color='text.secondary'>
                Are you sure you want to disconnect your <strong>{selectedProvider?.name}</strong>{' '}
                account ({selectedProvider?.account?.email})? You can reconnect it at any time.
              </Typography>
            )}
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            pt: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            justifyContent: 'space-between',
          }}
        >
          <Button
            onClick={() => setIsUnlinkDialogOpen(false)}
            color='inherit'
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>

          {isOnlyLoginMethod ? (
            <Button
              variant='contained'
              startIcon={<VpnKeyIcon />}
              onClick={() => {
                setIsUnlinkDialogOpen(false)
                navigate('/profile?edit=true')
              }}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Set Password First
            </Button>
          ) : (
            <Button
              onClick={handleConfirmUnlink}
              variant='contained'
              color='error'
              disabled={unlinkMutation.isPending}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, minWidth: 120 }}
            >
              {unlinkMutation.isPending ? (
                <CircularProgress size={20} color='inherit' />
              ) : (
                'Disconnect'
              )}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  )
}
