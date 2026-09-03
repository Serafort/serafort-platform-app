import React, { useState, useMemo } from 'react'
import Grid from '@mui/material/Grid'
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  alpha,
  useTheme,
  Stack,
  Switch,
  Tabs,
  Tab,
  Divider,
  Avatar,
  CircularProgress,
  Alert,
  Autocomplete,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from '@mui/material'
import Save from '@mui/icons-material/Save'
import Shield from '@mui/icons-material/Shield'
import ArrowBack from '@mui/icons-material/ArrowBack'
import Group from '@mui/icons-material/Group'
import VpnKey from '@mui/icons-material/VpnKey'
import Settings from '@mui/icons-material/Settings'
import Add from '@mui/icons-material/Add'
import Delete from '@mui/icons-material/Delete'
import ChevronRight from '@mui/icons-material/ChevronRight'
import Security from '@mui/icons-material/Security'
import Person from '@mui/icons-material/Person'
import Storage from '@mui/icons-material/Storage'
import Language from '@mui/icons-material/Language'
import Description from '@mui/icons-material/Description'
import ContentCopy from '@mui/icons-material/ContentCopy'
import HistoryIcon from '@mui/icons-material/History'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Path } from '@auth/routes/path'
import {
  useRole,
  useRoles,
  usePermissions,
  useUpdateRole,
  useSyncRolePermissions,
  useSyncRoleParents,
  useDeleteRole,
  useDuplicateRole,
} from '@auth/authorization-engine/hooks/useAdminQuery'
import ConfirmationDialog from '@auth/modules/authentication-core/components/shared/Modals/ConfirmationDialog'

// Resource Icon Mapping for better visual grouping
const RESOURCE_ICONS: Record<string, React.ReactNode> = {
  users: <Person />,
  org: <Security />,
  billing: <Storage />,
  system: <Settings />,
  api: <Language />,
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
  sx?: any
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, sx, ...other } = props
  return (
    <div role='tabpanel' hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3, ...sx }}>{children}</Box>}
    </div>
  )
}

export default function RoleDetailView() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const theme = useTheme()
  const { id } = useParams()
  const [tab, setTab] = useState(0)

  // â”€â”€ Data Fetching â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const roleId = Number(id)
  const isNew = id === 'new'
  const {
    data: roleResponse,
    isLoading: isLoadingRole,
    error: roleError,
  } = useRole(isNew ? 0 : roleId)
  const { data: permissionsResponse, isLoading: isLoadingPerms } = usePermissions()
  const { data: allRolesResponse } = useRoles({ limit: 100 })

  const role = roleResponse?.data
  const allPermissions = useMemo(() => permissionsResponse?.data || [], [permissionsResponse])

  // â”€â”€ Mutations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const updateRole = useUpdateRole({
    onSuccess: () => toast.success(t('auth.admin.roleUpdated')),
    onError: (err: any) => toast.error(err.message || t('auth.admin.errorUpdateRole')),
  })

  const syncPermissions = useSyncRolePermissions({
    onSuccess: () => toast.success(t('auth.admin.permissionsUpdated')),
    onError: (err: any) => toast.error(err.message || t('auth.admin.errorSyncPermissions')),
  })

  const syncRoleParents = useSyncRoleParents({
    onSuccess: () => toast.success(t('auth.admin.roleParentsUpdated')),
    onError: (err: any) => toast.error(err.message || t('auth.admin.errorSyncRoleParents')),
  })

  const duplicateRoleMutation = useDuplicateRole({
    onSuccess: (response) => {
      toast.success(t('auth.admin.successDuplicate'))
      const newId = (response.data as any).id
      if (newId) navigate(Path.admin.roleDetail.replace(':id', newId.toString()))
    },
  })

  const deleteRoleMutation = useDeleteRole({
    onSuccess: () => {
      toast.success(t('auth.admin.roleDeleted'))
      navigate(Path.admin.roles)
    },
    onError: (err: any) => toast.error(err.message || t('auth.admin.errorDeleteRole')),
  })

  // â”€â”€ Local State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [editData, setEditData] = useState({ name: '', description: '' })
  const [lastRoleId, setLastRoleId] = useState<number | null>(null)
  const [openParentDialog, setOpenParentDialog] = useState(false)
  const [selectedParentIds, setSelectedParentIds] = useState<number[]>([])
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  // Sync editData when role changes
  if (role && role.id !== lastRoleId) {
    setEditData({ name: role.name, description: role.description || '' })
    setLastRoleId(role.id)
  }

  // â”€â”€ Helper Logic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const getResource = (p: { name: string; resource?: string }) => {
    return p.resource || (p.name.includes(':') ? p.name.split(':')[0] : 'general')
  }

  const inheritedPermissionIds = useMemo(() => {
    const ids = new Set<number>()
    role?.parents?.forEach((parent) => {
      parent.permissions?.forEach((p) => ids.add(p.id))
    })
    return ids
  }, [role?.parents])

  const resources = useMemo(() => {
    const res = new Set<string>()
    allPermissions.forEach((p) => {
      res.add(getResource(p))
    })
    return Array.from(res)
  }, [allPermissions])

  // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleTogglePermission = (permissionId: number) => {
    if (!role) return
    const currentPermissionIds = (role.permissions ?? []).map((p) => p.id)
    const isAssigned = currentPermissionIds.includes(permissionId)
    const newPermissionIds = isAssigned
      ? currentPermissionIds.filter((pid) => pid !== permissionId)
      : [...currentPermissionIds, permissionId]

    syncPermissions.mutate({ roleId: role.id, permissionIds: newPermissionIds })
  }

  const handleSaveMetadata = () => {
    if (!role) return
    updateRole.mutate({ id: role.id, data: editData })
  }

  const handleDuplicate = () => {
    if (!role) return
    duplicateRoleMutation.mutate({
      role,
      newName: `${role.name} (${t('auth.common.copy')})`,
    })
  }

  const handleSyncParents = () => {
    if (!role) return
    syncRoleParents.mutate({ roleId: role.id, parentIds: selectedParentIds })
    setOpenParentDialog(false)
  }

  // â”€â”€ Final Render Checks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (isLoadingRole || isLoadingPerms) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (roleError || !role) {
    return (
      <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Alert
          severity='error'
          variant='filled'
          sx={{ borderRadius: 3, fontWeight: 700 }}
          action={
            <Button color='inherit' onClick={() => navigate(Path.admin.roles)}>
              {t('auth.admin.backToList') || 'Back to List'}
            </Button>
          }
        >
          {t('auth.admin.roleNotFound')}
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
      {/* â”€â”€ Premium Banner Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                borderRadius: '24px',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
              }}
            >
              <Shield sx={{ fontSize: 40 }} />
            </Avatar>
            <Box
              sx={{
                position: 'absolute',
                bottom: -2,
                right: -2,
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Tooltip title={t('auth.admin.goBack') || 'Go back'}>
                <IconButton onClick={() => navigate(Path.admin.roles)} sx={{ ml: -1 }}>
                  <ArrowBack fontSize='small' />
                </IconButton>
              </Tooltip>
              <Typography
                variant='h4'
                sx={{ fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}
              >
                {role.name}
              </Typography>
            </Box>
            <Stack direction='row' spacing={1.5} alignItems='center'>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ fontWeight: 700, opacity: 0.7 }}
              >
                {t('auth.admin.internalId') || 'Internal ID'}: {role.id}
              </Typography>
              <Divider
                orientation='vertical'
                flexItem
                sx={{ height: 14, alignSelf: 'center', opacity: 0.3 }}
              />
              <Typography variant='body2' color='primary.main' sx={{ fontWeight: 800 }}>
                {role.users_count || 0} {t('auth.admin.members_lowercase') || 'Members'}
              </Typography>
              <Chip
                label={(role.guard_name || 'web').toUpperCase()}
                size='small'
                sx={{ height: 20, fontSize: '0.6rem', fontWeight: 900, borderRadius: 1 }}
              />
            </Stack>
          </Box>
        </Box>

        <Stack direction='row' spacing={2}>
          <Button
            variant='outlined'
            startIcon={<ContentCopy />}
            onClick={handleDuplicate}
            disabled={duplicateRoleMutation.isPending}
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              height: 48,
              borderRadius: 3,
              borderColor: 'divider',
              color: 'text.primary',
            }}
          >
            {t('auth.common.duplicate') || 'Duplicate'}
          </Button>
          <Button
            variant='contained'
            startIcon={<Save />}
            onClick={handleSaveMetadata}
            disabled={updateRole.isPending}
            sx={{
              bgcolor: 'info.main',
              boxShadow: `0 4px 14px 0 ${alpha(theme.palette.info.main, 0.4)}`,
              '&:hover': { bgcolor: 'info.dark' },
              textTransform: 'none',
              fontWeight: 800,
              height: 48,
              px: 3,
              borderRadius: 3,
            }}
          >
            {updateRole.isPending
              ? t('auth.common.saving') || 'Savingâ€¦'
              : t('auth.common.saveChanges') || 'Save Changes'}
          </Button>
        </Stack>
      </Box>

      {/* â”€â”€ Tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'uppercase',
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              minWidth: 120,
            },
          }}
        >
          <Tab
            icon={<VpnKey sx={{ fontSize: 20 }} />}
            iconPosition='start'
            label={t('auth.admin.permissions') || 'Permissions'}
          />
          <Tab
            icon={<Group sx={{ fontSize: 20 }} />}
            iconPosition='start'
            label={t('auth.admin.activeMembers') || 'Active Members'}
          />
          <Tab
            icon={<Settings sx={{ fontSize: 20 }} />}
            iconPosition='start'
            label={t('auth.admin.roleSettings') || 'Role Settings'}
          />
        </Tabs>
      </Box>

      {/* â”€â”€ Content Grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={3}>
              {resources.map((resource) => (
                <Card
                  key={resource}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 'none',
                    borderRadius: 4,
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Stack direction='row' alignItems='center' spacing={2.5} sx={{ mb: 4 }}>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '14px',
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          color: 'primary.main',
                        }}
                      >
                        {RESOURCE_ICONS[resource] || <Security />}
                      </Avatar>
                      <Box>
                        <Typography
                          variant='h6'
                          sx={{
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {resource} {t('auth.admin.controls') || 'Controls'}
                        </Typography>
                        <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
                          {t('auth.admin.manageFineGrainedAccess') ||
                            'Manage fine-grained access to'}{' '}
                          {resource} {t('auth.admin.resources') || 'resources'}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack spacing={1} divider={<Divider sx={{ opacity: 0.5, my: 1 }} />}>
                      {allPermissions
                        .filter((p) => getResource(p) === resource)
                        .map((perm) => {
                          const isAssigned = (role.permissions ?? []).some(
                            (rp) => rp.id === perm.id,
                          )
                          const isInherited = inheritedPermissionIds.has(perm.id)
                          return (
                            <Box
                              key={perm.id}
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                py: 1,
                              }}
                            >
                              <Box>
                                <Typography
                                  component='span'
                                  variant='body2'
                                  sx={{ fontWeight: 700, mb: 0.25 }}
                                >
                                  {perm.name.split(':').pop()?.replace(/_/g, ' ')}
                                  {isInherited && (
                                    <Chip
                                      label={t('auth.admin.inherited') || 'Inherited'}
                                      size='small'
                                      color='primary'
                                      variant='outlined'
                                      sx={{
                                        ml: 1.5,
                                        height: 18,
                                        fontSize: '0.6rem',
                                        fontWeight: 900,
                                      }}
                                    />
                                  )}
                                </Typography>
                                <Typography
                                  variant='caption'
                                  color='text.secondary'
                                  sx={{ opacity: 0.7 }}
                                >
                                  {t('auth.admin.grantsAbility') || 'Grants ability to perform'}{' '}
                                  &quot;{perm.name}&quot;{' '}
                                  {t('auth.admin.onThisResource') || 'on this resource.'}
                                </Typography>
                              </Box>
                              <Switch
                                checked={isAssigned || isInherited}
                                disabled={isInherited}
                                onChange={() => handleTogglePermission(perm.id)}
                              />
                            </Box>
                          )
                        })}
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ position: 'sticky', top: 88 }}>
              <Card
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 'none',
                  borderRadius: 4,
                  mb: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant='subtitle2'
                    sx={{
                      fontWeight: 900,
                      mb: 3,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Security fontSize='small' color='primary' />{' '}
                    {t('auth.admin.inheritancePolicy')}
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{ mb: 4, color: 'text.secondary', lineHeight: 1.6, fontWeight: 500 }}
                  >
                    {t('auth.admin.inheritancePolicyDesc')}
                  </Typography>

                  {role.parents && role.parents.length > 0 && (
                    <Stack spacing={1} sx={{ mb: 4 }}>
                      {role.parents.map((p) => (
                        <Paper
                          key={p.id}
                          variant='outlined'
                          sx={{
                            p: 1.5,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderRadius: 2,
                            borderStyle: 'dashed',
                          }}
                        >
                          <Typography variant='body2' sx={{ fontWeight: 800 }}>
                            {p.name}
                          </Typography>
                          <IconButton
                            size='small'
                            color='error'
                            onClick={() => {
                              const newIds = role
                                .parents!.map((parent) => parent.id)
                                .filter((id) => id !== p.id)
                              syncRoleParents.mutate({ roleId: role.id, parentIds: newIds })
                            }}
                          >
                            <Delete fontSize='small' />
                          </IconButton>
                        </Paper>
                      ))}
                    </Stack>
                  )}

                  <Button
                    fullWidth
                    variant='outlined'
                    startIcon={<Add />}
                    onClick={() => setOpenParentDialog(true)}
                    sx={{ borderRadius: 2.5, fontWeight: 800, textTransform: 'none', height: 44 }}
                  >
                    {t('auth.admin.addParentRole')}
                  </Button>
                </CardContent>
              </Card>

              <Card
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 'none',
                  borderRadius: 4,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant='subtitle2'
                    sx={{
                      fontWeight: 900,
                      mb: 2,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {t('auth.admin.quickInsights')}
                  </Typography>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
                        {t('auth.admin.activeUsers')}
                      </Typography>
                      <Typography variant='body2' sx={{ fontWeight: 800 }}>
                        {role.users_count || 0}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
                        {t('auth.admin.directPermissions')}
                      </Typography>
                      <Typography variant='body2' sx={{ fontWeight: 800 }}>
                        {role.permissions?.length ?? 0}
                      </Typography>
                    </Box>
                    <Divider />
                    <Button
                      fullWidth
                      endIcon={<ChevronRight />}
                      onClick={() => setTab(1)}
                      sx={{ justifyContent: 'space-between', fontWeight: 800, fontSize: '0.8rem' }}
                    >
                      {t('auth.admin.exploreAuditHistory')}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Card
          sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 4 }}
        >
          <Box
            sx={{
              p: 4,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box>
              <Typography variant='h6' sx={{ fontWeight: 900, textTransform: 'uppercase' }}>
                {t('auth.admin.equippedMembers')}
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
                {t('auth.admin.equippedMembersDesc')}
              </Typography>
            </Box>
            <Button
              variant='contained'
              startIcon={<Add />}
              onClick={() => navigate(Path.admin.users)}
              sx={{ borderRadius: 2.5, fontWeight: 800, textTransform: 'none', height: 44 }}
            >
              {t('auth.admin.assignNewUser')}
            </Button>
          </Box>
          <Box sx={{ p: 10, textAlign: 'center' }}>
            <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'action.hover' }}>
              <Group sx={{ fontSize: 32, color: 'text.disabled' }} />
            </Avatar>
            <Typography variant='subtitle1' sx={{ fontWeight: 800 }}>
              {t('auth.admin.noMembersFound')}
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ maxWidth: 300, mx: 'auto', mt: 1 }}
            >
              {t('auth.admin.noMembersHint')}
            </Typography>
          </Box>
        </Card>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={4}>
              <Card
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 'none',
                  borderRadius: 4,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant='subtitle2'
                    sx={{
                      fontWeight: 900,
                      mb: 4,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {t('auth.admin.roleSpecification')}
                  </Typography>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label={t('auth.admin.displayName')}
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      variant='filled'
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label={t('auth.admin.businessDescription')}
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      variant='filled'
                      placeholder={t('auth.admin.descriptionHint')}
                    />
                  </Stack>
                </CardContent>
              </Card>

              <Card
                sx={{
                  border: '1px solid',
                  borderColor: 'error.main',
                  boxShadow: 'none',
                  borderRadius: 4,
                  bgcolor: alpha(theme.palette.error.main, 0.02),
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant='h6'
                    color='error'
                    sx={{
                      fontWeight: 900,
                      mb: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Delete /> {t('auth.admin.dangerZone')}
                  </Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 4, fontWeight: 600, lineHeight: 1.6 }}
                  >
                    {t('auth.admin.deleteRoleWarning1')} {role.users_count || 0}{' '}
                    {t('auth.admin.deleteRoleWarning2')}
                  </Typography>
                  <Button
                    variant='contained'
                    color='error'
                    onClick={() => setConfirmDeleteOpen(true)}
                    sx={{
                      borderRadius: 3,
                      fontWeight: 800,
                      textTransform: 'none',
                      height: 44,
                      px: 3,
                    }}
                  >
                    {t('auth.admin.permanentDeletion')}
                  </Button>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ position: 'sticky', top: 88 }}>
              <Card
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 'none',
                  borderRadius: 4,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant='subtitle2'
                    sx={{
                      fontWeight: 900,
                      mb: 3,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {t('auth.admin.administrativeActions')}
                  </Typography>
                  <Stack spacing={1}>
                    <Button
                      fullWidth
                      startIcon={<HistoryIcon />}
                      sx={{ justifyContent: 'flex-start', fontWeight: 700, borderRadius: 2 }}
                    >
                      {t('auth.admin.systemAuditData')}
                    </Button>
                    <Button
                      fullWidth
                      startIcon={<Description />}
                      sx={{ justifyContent: 'flex-start', fontWeight: 700, borderRadius: 2 }}
                    >
                      {t('auth.admin.exportAccessLogs')}
                    </Button>
                    <Button
                      fullWidth
                      startIcon={<Security />}
                      sx={{ justifyContent: 'flex-start', fontWeight: 700, borderRadius: 2 }}
                    >
                      {t('auth.admin.securityBaseline')}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </TabPanel>

      {/* â”€â”€ Dialogs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AutocompleteDialog
        open={openParentDialog}
        onClose={() => setOpenParentDialog(false)}
        title={t('auth.admin.modifyRoleInheritance')}
        role={role}
        allRoles={allRolesResponse?.data?.data || []}
        selectedIds={selectedParentIds}
        onChange={setSelectedParentIds}
        onConfirm={handleSyncParents}
        isPending={syncRoleParents.isPending}
      />

      <ConfirmationDialog
        open={confirmDeleteOpen}
        title={`${t('auth.admin.deleteRoleTitle')} ${role.name}?`}
        message={t('auth.admin.deleteRoleConfirm')}
        onConfirm={() => deleteRoleMutation.mutate(role.id)}
        onClose={() => setConfirmDeleteOpen(false)}
        isSubmitting={deleteRoleMutation.isPending}
        severity='error'
      />
    </Box>
  )
}

// â”€â”€ Sub-components for cleaner structure â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function AutocompleteDialog({
  open,
  onClose,
  title,
  role,
  allRoles,
  selectedIds,
  onChange,
  onConfirm,
  isPending,
}: any) {
  const { t } = useTranslation('common')
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth='xs'
      PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
    >
      <DialogTitle sx={{ fontWeight: 900, fontSize: '1.4rem' }}>{title}</DialogTitle>
      <DialogContent>
        <Typography variant='body2' sx={{ mb: 3, mt: 1, color: 'text.secondary', fontWeight: 500 }}>
          {t('auth.admin.assignedParentsDesc')}
        </Typography>
        <Autocomplete
          multiple
          options={allRoles.filter((r: any) => r.id !== role.id)}
          getOptionLabel={(option: any) => option.name}
          value={allRoles.filter((r: any) => selectedIds.includes(r.id))}
          onChange={(_, newValue) => onChange(newValue.map((v: any) => v.id))}
          renderInput={(params) => (
            <TextField {...params} variant='filled' label={t('auth.admin.selectRoles')} />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                variant='outlined'
                label={option.name}
                {...getTagProps({ index })}
                key={option.id}
                sx={{ fontWeight: 700 }}
              />
            ))
          }
        />
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} sx={{ fontWeight: 700, color: 'text.secondary' }}>
          {t('auth.common.cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          variant='contained'
          disabled={isPending}
          sx={{ fontWeight: 800, borderRadius: 2, px: 3 }}
        >
          {t('auth.common.saveConfiguration')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
