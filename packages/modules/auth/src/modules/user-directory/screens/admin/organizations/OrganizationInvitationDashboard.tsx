import { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  alpha,
  useTheme,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  Container,
} from '@mui/material'
import Search from '@mui/icons-material/Search'
import MoreVert from '@mui/icons-material/MoreVert'
import Email from '@mui/icons-material/Email'
import PersonAdd from '@mui/icons-material/PersonAdd'
import Timer from '@mui/icons-material/Timer'
import CheckCircle from '@mui/icons-material/CheckCircle'
import Cancel from '@mui/icons-material/Cancel'
import ArrowBack from '@mui/icons-material/ArrowBack'
import ContentCopy from '@mui/icons-material/ContentCopy'
import Replay from '@mui/icons-material/Replay'
import BlockOutlined from '@mui/icons-material/BlockOutlined'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { Path } from '@cap/module-auth/routes/path'
import {
  useOrganizationInvitations,
  useInviteOrganizationMember,
  useRevokeOrganizationInvitation,
} from '@idaas/authentication-core/hooks/useAdminQuery'
import { toast } from 'react-toastify'
import { buildLayoutSurfaceEffect } from '@cap/layout'
import { getTenantThemeEffects } from '@cap/theme'

interface Invitation {
  id: string | number
  email: string
  role: string
  status: 'pending' | 'accepted' | 'expired' | 'revoked'
  created_at?: string
  createdAt?: string
  expires_at?: string
  expiresAt?: string
}

export default function OrganizationInvitationDashboard() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const theme = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Member')
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [menuInvite, setMenuInvite] = useState<Invitation | null>(null)

  const { data: response, isLoading } = useOrganizationInvitations(Number(id))
  const inviteMutation = useInviteOrganizationMember()
  const revokeMutation = useRevokeOrganizationInvitation()

  if (!id || isNaN(Number(id))) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color='error'>{t('auth.admin.invalidOrgId')}</Typography>
        <Button onClick={() => navigate(Path.admin.organizations)} sx={{ textTransform: 'none' }}>
          {t('auth.admin.backToOrgs')}
        </Button>
      </Box>
    )
  }

  const invitations: Invitation[] = (response?.data as any) || []

  // Derived stats
  const totalSent = invitations.length
  const pending = invitations.filter((i) => i.status === 'pending').length
  const accepted = invitations.filter((i) => i.status === 'accepted').length
  const acceptanceRate = totalSent > 0 ? `${Math.round((accepted / totalSent) * 100)}%` : '0%'

  const filteredInvitations = invitations.filter((inv) =>
    inv.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      toast.error(t('auth.admin.errorEmailRequired'))
      return
    }
    inviteMutation.mutate(
      { orgId: Number(id), email: inviteEmail, role: inviteRole },
      {
        onSuccess: () => {
          toast.success(t('auth.admin.successInvitationSent'))
          setInviteModalOpen(false)
          setInviteEmail('')
          setInviteRole('Member')
        },
        onError: (err: any) => {
          toast.error(err.message || t('auth.admin.errorSendInvitation'))
        },
      },
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'success'
      case 'pending':
        return 'warning'
      case 'expired':
        return 'error'
      case 'revoked':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return <CheckCircle sx={{ fontSize: 14 }} />
      case 'pending':
        return <Timer sx={{ fontSize: 14 }} />
      case 'expired':
      case 'revoked':
        return <Cancel sx={{ fontSize: 14 }} />
      default:
        return undefined
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return t('auth.admin.statusAccepted')
      case 'pending':
        return t('auth.admin.statusPending')
      case 'expired':
        return t('auth.admin.statusExpired')
      case 'revoked':
        return t('auth.admin.statusRevoked')
      default:
        return status
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Container maxWidth='xl' sx={{ py: 4 }}>
        {/* Navigation & Back Action */}
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(Path.admin.organizationProfile.replace(':id', id))}
            sx={{
              minHeight: 44,
              px: 2,
              borderRadius: 'var(--sf-radius-md, 8px)',
              textTransform: 'none',
              fontWeight: 600,
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary',
                bgcolor: 'action.hover',
              },
            }}
          >
            {t('auth.admin.backToProfile')}
          </Button>
        </Box>

        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2.5,
            mb: 4,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 'var(--sf-radius-lg, 24px)',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <PersonAdd sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant='h4' sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>
                {t('auth.admin.memberInvitations')}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {t('auth.admin.memberInvitationsSubtitle')}
              </Typography>
            </Box>
          </Box>
          <Button
            variant='contained'
            startIcon={<PersonAdd />}
            onClick={() => setInviteModalOpen(true)}
            sx={{
              minHeight: 48,
              px: 3,
              borderRadius: 'var(--sf-radius-md, 8px)',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: 'none',
            }}
          >
            {t('auth.admin.inviteNewMember')}
          </Button>
        </Box>

        {/* Stats */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 2.5,
            mb: 4,
          }}
        >
          {[
            {
              label: t('auth.admin.totalSent'),
              count: totalSent,
              icon: <Email />,
              color: theme.palette.primary.main,
            },
            {
              label: t('auth.admin.pendingAcceptance'),
              count: pending,
              icon: <Timer />,
              color: theme.palette.warning.main,
            },
            {
              label: t('auth.admin.acceptanceRate'),
              count: acceptanceRate,
              icon: <CheckCircle />,
              color: theme.palette.success.main,
            },
          ].map((stat, i) => (
            <Card
              key={i}
              variant='outlined'
              sx={(theme: any) => ({
                borderRadius: 'var(--sf-radius-lg, 16px)',
                borderColor: theme.palette.divider,
                ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
              })}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 2.5 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(stat.color, 0.1),
                    color: stat.color,
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--sf-radius-md, 8px)',
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography variant='h4' sx={{ fontWeight: 800, letterSpacing: '-0.02em', mt: 0.25 }}>
                    {stat.count}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Table */}
        <Paper
        sx={(theme: any) => ({
          borderRadius: 'var(--sf-radius-lg, 16px)',
          border: '1px solid ' + theme.palette.divider,
          overflow: 'hidden',
          ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
        })}
      >
        <Box
          sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', gap: 2 }}
        >
          <TextField
            fullWidth
            placeholder={t('auth.common.searchUsers')}
            size='small'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              maxWidth: 400,
              '& .MuiOutlinedInput-root': {
                minHeight: 44,
                borderRadius: 'var(--sf-radius-md, 8px)',
              },
            }}
          />
        </Box>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: alpha(theme.palette.action.hover, 0.4) }}>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {t('auth.admin.invitedEmail')}
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {t('auth.admin.assignedRole')}
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {t('auth.common.status')}
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {t('auth.admin.sentDate')}
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {t('auth.admin.expiresAt')}
                </TableCell>
                <TableCell
                  align='right'
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {t('auth.common.actions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvitations.map((invite) => (
                <TableRow key={invite.id} hover>
                  <TableCell sx={{ py: 1.75 }}>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      {invite.email}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.75 }}>
                    <Chip
                      label={invite.role}
                      size='small'
                      variant='outlined'
                      sx={{ fontWeight: 700, textTransform: 'capitalize', borderRadius: 'var(--sf-radius-xs, 4px)' }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 1.75 }}>
                    <Chip
                      icon={getStatusIcon(invite.status)}
                      label={getStatusLabel(invite.status)}
                      size='small'
                      color={getStatusColor(invite.status) as any}
                      variant='filled'
                      sx={{
                        fontWeight: 800,
                        px: 0.5,
                        textTransform: 'capitalize',
                        borderRadius: 'var(--sf-radius-xs, 4px)',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 1.75 }}>
                    <Typography variant='body2' color='text.secondary'>
                      {invite.created_at || (invite as any).createdAt
                        ? new Date(
                            invite.created_at || (invite as any).createdAt!,
                          ).toLocaleDateString()
                        : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 1.75 }}>
                    <Typography variant='body2' color='text.secondary'>
                      {invite.expires_at || (invite as any).expiresAt
                        ? new Date(
                            invite.expires_at || (invite as any).expiresAt!,
                          ).toLocaleDateString()
                        : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align='right' sx={{ py: 1.75 }}>
                    <Tooltip title={t('auth.admin.invitationSettings')}>
                      <IconButton
                        size='small'
                        onClick={(e) => {
                          setMenuAnchor(e.currentTarget)
                          setMenuInvite(invite)
                        }}
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 'var(--sf-radius-md, 8px)',
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInvitations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant='body2' color='text.secondary'>
                      {isLoading ? t('auth.common.loading') : t('auth.admin.noInvitationsFound')}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Row Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: (theme: any) => ({
              borderRadius: 'var(--sf-radius-md, 8px)',
              minWidth: 200,
              ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
            }),
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (menuInvite) {
              inviteMutation.mutate(
                { orgId: Number(id), email: menuInvite.email, role: menuInvite.role },
                {
                  onSuccess: () => toast.success(t('auth.admin.successInvitationSent')),
                  onError: () => toast.error(t('auth.admin.errorSendInvitation')),
                },
              )
            }
            setMenuAnchor(null)
          }}
        >
          <ListItemIcon>
            <Replay fontSize='small' />
          </ListItemIcon>
          <ListItemText sx={{ '& .MuiTypography-root': { fontWeight: 600 } }}>
            {t('auth.admin.resendInvitation')}
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuInvite) {
              const baseUrl = window.location.origin
              const link = `${baseUrl}/auth/join-organization?token=${(menuInvite as any).token || ''}&email=${menuInvite.email}`
              navigator.clipboard.writeText(link)
              toast.info(t('auth.admin.linkCopied'))
            }
            setMenuAnchor(null)
          }}
        >
          <ListItemIcon>
            <ContentCopy fontSize='small' />
          </ListItemIcon>
          <ListItemText sx={{ '& .MuiTypography-root': { fontWeight: 600 } }}>
            {t('auth.admin.copyInviteLink')}
          </ListItemText>
        </MenuItem>
        {menuInvite?.status === 'pending' && (
          <MenuItem
            sx={{ color: 'error.main' }}
            onClick={() => {
              if (menuInvite) {
                revokeMutation.mutate(
                  { orgId: Number(id), invitationId: menuInvite.id },
                  {
                    onSuccess: () => toast.warning(t('auth.admin.revokeInvitation')),
                    onError: () => toast.error(t('auth.admin.errorSendInvitation')),
                  },
                )
              }
              setMenuAnchor(null)
            }}
          >
            <ListItemIcon>
              <BlockOutlined fontSize='small' color='error' />
            </ListItemIcon>
            <ListItemText sx={{ '& .MuiTypography-root': { fontWeight: 600 } }}>
              {t('auth.admin.revokeInvitation')}
            </ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Invite Modal */}
      <Dialog
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        fullWidth
        maxWidth='xs'
        slotProps={{
          paper: {
            sx: (theme: any) => ({
              borderRadius: 'var(--sf-radius-lg, 16px)',
              p: 1,
              ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
            }),
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem' }}>{t('auth.admin.inviteMemberModalTitle')}</DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            {t('auth.admin.inviteMemberModalSubtitle')}
          </Typography>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label={t('auth.common.email')}
              placeholder={t('auth.admin.emailPlaceholder')}
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  minHeight: 44,
                  borderRadius: 'var(--sf-radius-md, 8px)',
                },
              }}
            />
            <TextField
              select
              fullWidth
              label={t('auth.admin.assignedRole')}
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  minHeight: 44,
                  borderRadius: 'var(--sf-radius-md, 8px)',
                },
              }}
            >
              <MenuItem value='Admin'>{t('auth.common.admin')}</MenuItem>
              <MenuItem value='Member'>{t('auth.common.member')}</MenuItem>
              <MenuItem value='Auditor'>{t('auth.common.auditor')}</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setInviteModalOpen(false)}
            sx={{
              minHeight: 44,
              px: 2.5,
              borderRadius: 'var(--sf-radius-md, 8px)',
              textTransform: 'none',
              fontWeight: 600,
              color: 'text.secondary',
            }}
          >
            {t('auth.common.cancel')}
          </Button>
          <Button
            variant='contained'
            onClick={handleInvite}
            disabled={inviteMutation.isPending || !inviteEmail.trim()}
            sx={{
              minHeight: 44,
              px: 3,
              borderRadius: 'var(--sf-radius-md, 8px)',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: 'none',
            }}
          >
            {t('auth.admin.sendInvitation')}
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </motion.div>
  )
}
