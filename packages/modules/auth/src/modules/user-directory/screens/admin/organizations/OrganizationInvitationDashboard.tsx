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
    <Box className='animate-scale-in' sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(Path.admin.organizationProfile.replace(':id', id))}
          sx={{ mb: 2, color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}
        >
          {t('auth.admin.backToProfile')}
        </Button>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant='h4' sx={{ fontWeight: 900, mb: 1 }}>
              {t('auth.admin.memberInvitations')}
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              {t('auth.admin.memberInvitationsSubtitle')}
            </Typography>
          </Box>
          {/* â”€â”€ SYSTEM PATTERN: cta_button (info.main variant) â”€â”€ */}
          <Button
            variant='contained'
            startIcon={<PersonAdd />}
            onClick={() => setInviteModalOpen(true)}
            sx={{
              px: 3,
              py: 1.2,
              borderRadius: 2,
              fontWeight: 700,
              textTransform: 'none',
              bgcolor: 'info.main',
              color: 'info.contrastText',
              boxShadow: '0 4px 14px 0 rgba(0, 118, 255, 0.2)',
              '&:hover': { bgcolor: 'info.dark' },
            }}
          >
            {t('auth.admin.inviteNewMember')}
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 2,
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
            sx={(theme: any) => ({
              borderRadius: 3,
              border: '1px solid ' + theme.palette.divider,
              ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
            })}
          >
            {/* ── SYSTEM PATTERN: metric_card (OrganizationProfile style) ── */}
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{ bgcolor: alpha(stat.color, 0.1), color: stat.color, width: 44, height: 44 }}
              >
                {stat.icon}
              </Avatar>
              <Box>
                <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 700 }}>
                  {stat.label}
                </Typography>
                <Typography variant='h5' sx={{ fontWeight: 800 }}>
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
          borderRadius: 4,
          border: '1px solid ' + theme.palette.divider,
          overflow: 'hidden',
          ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
        })}
      >
        <Box
          sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', gap: 2 }}
        >
          {/* â”€â”€ SYSTEM PATTERN: text_field (InputProps -> slotProps.input) â”€â”€ */}
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
            sx={{ maxWidth: 400 }}
          />
        </Box>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: alpha(theme.palette.action.hover, 0.5) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>{t('auth.admin.invitedEmail')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('auth.admin.assignedRole')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('auth.common.status')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('auth.admin.sentDate')}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t('auth.admin.expiresAt')}</TableCell>
                <TableCell align='right' sx={{ fontWeight: 700 }}>
                  {t('auth.common.actions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvitations.map((invite) => (
                <TableRow key={invite.id} hover>
                  <TableCell>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      {invite.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={invite.role}
                      size='small'
                      variant='outlined'
                      sx={{ fontWeight: 700, textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(invite.status)}
                      label={getStatusLabel(invite.status)}
                      size='small'
                      color={getStatusColor(invite.status) as any}
                      variant='filled'
                      sx={{ fontWeight: 800, px: 0.5, textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2' color='text.secondary'>
                      {invite.created_at || (invite as any).createdAt
                        ? new Date(
                            invite.created_at || (invite as any).createdAt!,
                          ).toLocaleDateString()
                        : 'â€”'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2' color='text.secondary'>
                      {invite.expires_at || (invite as any).expiresAt
                        ? new Date(
                            invite.expires_at || (invite as any).expiresAt!,
                          ).toLocaleDateString()
                        : 'â€”'}
                    </Typography>
                  </TableCell>
                  <TableCell align='right'>
                    <Tooltip title={t('auth.admin.invitationSettings')}>
                      <IconButton
                        size='small'
                        onClick={(e) => {
                          setMenuAnchor(e.currentTarget)
                          setMenuInvite(invite)
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
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
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
              borderRadius: 3,
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
        PaperProps={{
          sx: (theme: any) => ({
            borderRadius: 4,
            ...buildLayoutSurfaceEffect(getTenantThemeEffects(theme), theme),
          }),
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>{t('auth.admin.inviteMemberModalTitle')}</DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            {t('auth.admin.inviteMemberModalSubtitle')}
          </Typography>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label={t('auth.common.email')}
              placeholder={t('auth.admin.emailPlaceholder')}
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <TextField
              select
              fullWidth
              label={t('auth.admin.assignedRole')}
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
            >
              <MenuItem value='Admin'>{t('auth.common.admin')}</MenuItem>
              <MenuItem value='Member'>{t('auth.common.member')}</MenuItem>
              <MenuItem value='Auditor'>{t('auth.common.auditor')}</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setInviteModalOpen(false)}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {t('auth.common.cancel')}
          </Button>
          <Button
            variant='contained'
            onClick={handleInvite}
            disabled={inviteMutation.isPending || !inviteEmail.trim()}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              textTransform: 'none',
              px: 3,
              bgcolor: 'info.main',
              color: 'info.contrastText',
              boxShadow: '0 4px 14px 0 rgba(0, 118, 255, 0.2)',
              '&:hover': { bgcolor: 'info.dark' },
            }}
          >
            {t('auth.admin.sendInvitation')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
