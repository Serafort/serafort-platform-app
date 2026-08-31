// AssignRolesModal.tsx
// Modal for assigning/syncing user roles with dynamic permission preview

import React, { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  TextField,
  IconButton,
  alpha,
  useTheme,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useRolesQuery } from '../hooks/useUserDirectoryQuery'
import { useAssignRolesMutation } from '../hooks/useUserDirectoryMutations'
import { UserRoleDTO } from '../types/userDirectory.types'

export interface AssignRolesModalProps {
  open: boolean
  userId: string | number | null
  userName?: string
  currentRoles?: Array<UserRoleDTO | { id: number; name: string }>
  onClose: () => void
  onSuccess?: () => void
}

export default function AssignRolesModal({
  open,
  userId,
  userName,
  currentRoles = [],
  onClose,
  onSuccess,
}: AssignRolesModalProps) {
  const theme = useTheme()
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])
  const [reason, setReason] = useState<string>('')

  const { data: rolesResponse, isLoading: isRolesLoading } = useRolesQuery()

  const availableRoles = useMemo(() => {
    return (
      rolesResponse?.data || [
        {
          id: 1,
          name: 'User',
          slug: 'user',
          description: 'Basic access to application features',
          permissions: [{ id: 1, name: 'Read Profile', slug: 'profile:read' }],
        },
        {
          id: 2,
          name: 'Administrator',
          slug: 'admin',
          description: 'Full tenant-level access and configuration capabilities',
          permissions: [
            { id: 2, name: 'Manage Users', slug: 'users:manage' },
            { id: 3, name: 'Manage Roles', slug: 'roles:manage' },
            { id: 4, name: 'View Audit', slug: 'audit:read' },
          ],
        },
        {
          id: 3,
          name: 'Manager',
          slug: 'manager',
          description: 'Team management and reporting capabilities',
          permissions: [{ id: 5, name: 'Team Manage', slug: 'team:manage' }],
        },
        {
          id: 4,
          name: 'Auditor',
          slug: 'auditor',
          description: 'Security & compliance log viewer',
          permissions: [{ id: 4, name: 'View Audit', slug: 'audit:read' }],
        },
      ]
    )
  }, [rolesResponse])

  useEffect(() => {
    if (open) {
      const initialIds = currentRoles.map((r) => r.id)
      setSelectedRoleIds(initialIds.length > 0 ? initialIds : [1])
      setReason('')
    }
  }, [open, currentRoles])

  const assignRolesMutation = useAssignRolesMutation({
    onSuccess: () => {
      onSuccess?.()
      onClose()
    },
  })

  const toggleRole = (roleId: number) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    )
  }

  const handleSave = () => {
    if (!userId || selectedRoleIds.length === 0) return
    assignRolesMutation.mutate({
      id: userId,
      data: {
        roleIds: selectedRoleIds,
        reason: reason.trim() || undefined,
      },
    })
  }

  const selectedRolesDetails = useMemo(() => {
    return availableRoles.filter((r) => selectedRoleIds.includes(r.id))
  }, [availableRoles, selectedRoleIds])

  return (
    <Dialog
      open={open}
      onClose={assignRolesMutation.isPending ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
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
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              display: 'flex',
            }}
          >
            <AdminPanelSettingsIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Assign Roles & Permissions
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {userName ? `Modifying role assignments for ${userName}` : 'Update user security roles'}
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small" disabled={assignRolesMutation.isPending}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Typography variant="subtitle2" fontWeight={600}>
            Available Tenant Roles:
          </Typography>

          {isRolesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <List sx={{ p: 0, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, borderRadius: 2 }}>
              {availableRoles.map((role, idx) => {
                const isSelected = selectedRoleIds.includes(role.id)
                return (
                  <React.Fragment key={role.id}>
                    {idx > 0 && <Box sx={{ borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}` }} />}
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => toggleRole(role.id)}
                        sx={{
                          p: 1.75,
                          bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Checkbox
                            edge="start"
                            checked={isSelected}
                            tabIndex={-1}
                            disableRipple
                            color="primary"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2" fontWeight={700}>
                                {role.name}
                              </Typography>
                              {role.slug === 'admin' && (
                                <Chip label="Admin" size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
                              )}
                            </Stack>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {role.description || 'Provides standard tenant capabilities'}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  </React.Fragment>
                )
              })}
            </List>
          )}

          {/* Dynamic Capability Preview */}
          {selectedRolesDetails.length > 0 && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Typography variant="caption" color="primary.main" fontWeight={700} display="block" mb={1}>
                Effective Granted Capabilities:
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.75}>
                {selectedRolesDetails.map((r) => (
                  <Chip
                    key={r.id}
                    icon={<CheckCircleIcon fontSize="small" />}
                    label={r.name}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          <TextField
            fullWidth
            label="Audit Reason (Optional)"
            placeholder="e.g. Promoted to team lead, Security audit adjustment"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
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
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={assignRolesMutation.isPending || selectedRoleIds.length === 0}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            px: 3,
            borderRadius: 2,
            minWidth: 120,
          }}
        >
          {assignRolesMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Save Roles'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
