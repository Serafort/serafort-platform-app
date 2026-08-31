import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Chip, TextField, InputAdornment, Breadcrumbs, Link, Tooltip, useTheme, Grid, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ViewIcon from '@mui/icons-material/Visibility';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import KeyIcon from '@mui/icons-material/VpnKey';
import SecurityIcon from '@mui/icons-material/Security';
import TimerIcon from '@mui/icons-material/Timer';
import TerminalIcon from '@mui/icons-material/Terminal';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useUserTokens, useRevokeToken } from '@auth/user-directory/hooks/useUserQuery';
import { Path } from '@auth/routes/path';

interface APIToken {
  id: string | number
  name: string
  abilities: string[]
  createdAt: string
  lastUsedAt: string | null
  expiresAt: string | null
  status: 'active' | 'revoked' | 'expired'
}

const APITokensDashboard: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const theme = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedToken, setSelectedToken] = useState<APIToken | null>(null)

  const { data: tokensResponse, isLoading, refetch } = useUserTokens()
  const revokeTokenMutation = useRevokeToken({
    onSuccess: () => {
      toast.success(t('api_tokens:revoked_success', 'Token revoked successfully'), {  })
      refetch()
      handleMenuClose()
    },
    onError: (error: any) => {
      toast.error(error.message || t('api_tokens:revoked_error', 'Failed to revoke token'), {  })
    },
  })

  // Use the fetched data
  const tokens = (tokensResponse?.data || []) as APIToken[]

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, token: APIToken) => {
    setAnchorEl(event.currentTarget)
    setSelectedToken(token)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedToken(null)
  }

  const handleRevoke = () => {
    if (selectedToken) {
      revokeTokenMutation.mutate(selectedToken.id)
    }
  }

  const getStatusColor = (status: APIToken['status']) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'revoked':
        return 'error'
      case 'expired':
        return 'warning'
      default:
        return 'default'
    }
  }

  const filteredTokens = (Array.isArray(tokens) ? tokens : []).filter((token) => {
    if (!token) return false
    const tokenName = token.name || (token as any).token || (token as any).type || ''
    return String(tokenName).toLowerCase().includes((searchQuery || '').toLowerCase())
  })

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize='small' />} sx={{ mb: 3 }}>
        <Link underline='hover' color='inherit' href='/auth/account/overview'>
          {t('account:overview')}
        </Link>
        <Typography color='text.primary'>{t('api_tokens:title')}</Typography>
      </Breadcrumbs>

      {/* Header Section */}
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}
      >
        <Box>
          <Typography variant='h4' fontWeight='bold' gutterBottom>
            {t('api_tokens:dashboard_title', 'API Tokens Management')}
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            {t(
              'api_tokens:dashboard_subtitle',
              'Manage and monitor your API access tokens securely.',
            )}
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={() => navigate(Path.apiTokens.createBasic)}
          sx={{ borderRadius: 2, px: 3, py: 1 }}
        >
          {t('api_tokens:create_new_token', 'Create New Token')}
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant='outlined' sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <KeyIcon color='primary' sx={{ mr: 1 }} />
                <Typography variant='subtitle2' color='text.secondary'>
                  {t('api_tokens:total_active', 'Active Tokens')}
                </Typography>
              </Box>
              <Typography variant='h4' fontWeight='bold'>
                {tokens.filter((t) => t?.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant='outlined' sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TimerIcon color='warning' sx={{ mr: 1 }} />
                <Typography variant='subtitle2' color='text.secondary'>
                  {t('api_tokens:expiring_soon', 'Expiring Soon')}
                </Typography>
              </Box>
              <Typography variant='h4' fontWeight='bold'>
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant='outlined' sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SecurityIcon color='info' sx={{ mr: 1 }} />
                <Typography variant='subtitle2' color='text.secondary'>
                  {t('api_tokens:security_status', 'Security Status')}
                </Typography>
              </Box>
              <Typography variant='h4' fontWeight='bold' color='success.main'>
                {t('api_tokens:healthy', 'Healthy')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Card */}
      <Card variant='outlined' sx={{ borderRadius: 3, pt: 2 }}>
        <Box
          sx={{
            px: 3,
            pb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <TextField
            size='small'
            placeholder={t('api_tokens:search_placeholder', 'Search tokens...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ maxWidth: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon fontSize='small' />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {t('api_tokens:header_name', 'Token Name')}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {t('api_tokens:header_status', 'Status')}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {t('api_tokens:header_created', 'Created On')}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {t('api_tokens:header_last_used', 'Last Used')}
                </TableCell>
                <TableCell align='right'>{t('api_tokens:header_actions', 'Actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align='center' sx={{ py: 4 }}>
                    <Typography color='text.secondary'>
                      {t('common:loading', 'Loading tokens...')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredTokens.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align='center' sx={{ py: 4 }}>
                    <Typography color='text.secondary'>
                      {t('api_tokens:no_tokens_found', 'No tokens found matching your search.')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTokens.map((token) => (
                  <TableRow key={token.id} hover>
                    <TableCell>
                      <Typography variant='body2' fontWeight='medium'>
                        {token.name || (token as any).token || 'API Token'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                        {(token.abilities || []).slice(0, 2).map((scope) => (
                          <Chip
                            key={scope}
                            label={scope}
                            size='small'
                            variant='outlined'
                            sx={{ fontSize: '0.65rem', height: 20 }}
                          />
                        ))}
                        {(token.abilities || []).length > 2 && (
                          <Chip
                            label={`+${(token.abilities || []).length - 2}`}
                            size='small'
                            variant='outlined'
                            sx={{ fontSize: '0.65rem', height: 20 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={(token.status || 'ACTIVE').toUpperCase()}
                        color={getStatusColor(token.status)}
                        size='small'
                        sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      {token.createdAt ? new Date(token.createdAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      {token.lastUsedAt
                        ? new Date(token.lastUsedAt).toLocaleString()
                        : t('api_tokens:never', 'Never')}
                    </TableCell>
                    <TableCell align='right'>
                      <Tooltip title={t('common:view_details')}>
                        <IconButton
                          size='small'
                          onClick={() =>
                            navigate(Path.apiTokens.details.replace(':tokenId', String(token.id)))
                          }
                        >
                          <ViewIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                      <IconButton size='small' onClick={(e) => handleMenuOpen(e, token)}>
                        <MoreVertIcon fontSize='small' />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Actions Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem
            onClick={() => {
              if (selectedToken) {
                navigate(Path.apiTokens.details.replace(':tokenId', String(selectedToken.id)))
              }
              handleMenuClose()
            }}
          >
            <ListItemIcon>
              <ViewIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText primary={t('common:view_details', 'View Details')} />
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (selectedToken) {
                navigate(Path.apiTokens.display.replace(':tokenId', String(selectedToken.id)))
              }
              handleMenuClose()
            }}
          >
            <ListItemIcon>
              <TerminalIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText primary={t('api_tokens:usage_guide', 'Usage Guide')} />
          </MenuItem>
          <MenuItem onClick={handleRevoke} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <IconButton size='small' sx={{ color: 'error.main', p: 0 }}>
                <AddIcon sx={{ transform: 'rotate(45deg)', fontSize: 20 }} />
              </IconButton>
            </ListItemIcon>
            <ListItemText primary={t('api_tokens:revoke', 'Revoke Token')} />
          </MenuItem>
        </Menu>
      </Card>

      {/* Security Tip Banner */}
      <Box
        sx={{
          mt: 4,
          p: 2,
          bgcolor: 'info.lighter',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'info.main',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <SecurityIcon color='info' sx={{ mr: 2 }} />
        <Box>
          <Typography variant='subtitle2' color='info.contrastText'>
            {t('api_tokens:security_tip_title', 'Security Tip')}
          </Typography>
          <Typography variant='body2' color='info.contrastText'>
            {t(
              'api_tokens:security_tip_message',
              'Rotate your API tokens regularly and restrict them to specific IP addresses for maximum security.',
            )}
          </Typography>
        </Box>
        <Button
          size='small'
          onClick={() => navigate(Path.apiTokens.securityWarning)}
          sx={{ ml: 'auto', fontWeight: 'bold' }}
        >
          {t('common:learn_more', 'Learn More')}
        </Button>
      </Box>
    </Box>
  )
}

export default APITokensDashboard

