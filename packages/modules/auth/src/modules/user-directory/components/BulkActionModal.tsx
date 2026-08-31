// BulkActionModal.tsx
// Modal for executing batch operations (Status, Suspend, Delete) across selected users

import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  alpha,
  useTheme,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import LayersIcon from '@mui/icons-material/Layers'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { useBulkActionMutation } from '../hooks/useUserDirectoryMutations'
import { BulkUserActionRequestDTO } from '../types/userDirectory.types'

export interface BulkActionModalProps {
  open: boolean
  action: 'ACTIVATE' | 'DEACTIVATE' | 'SUSPEND' | 'DELETE' | null
  selectedUserIds: number[]
  onClose: () => void
  onSuccess?: () => void
}

export default function BulkActionModal({
  open,
  action,
  selectedUserIds,
  onClose,
  onSuccess,
}: BulkActionModalProps) {
  const theme = useTheme()
  const [reason, setReason] = useState('')

  const bulkMutation = useBulkActionMutation({
    onSuccess: () => {
      setReason('')
      onSuccess?.()
      onClose()
    },
  })

  if (!action) return null

  const isDelete = action === 'DELETE'
  const isSuspend = action === 'SUSPEND'

  const actionTitle = {
    ACTIVATE: 'Bulk Activate Users',
    DEACTIVATE: 'Bulk Deactivate Users',
    SUSPEND: 'Bulk Suspend Users',
    DELETE: 'Bulk Delete Users',
  }[action]

  const actionDescription = {
    ACTIVATE: `You are about to activate ${selectedUserIds.length} user accounts, restoring full login access.`,
    DEACTIVATE: `You are about to deactivate ${selectedUserIds.length} user accounts. Users will not be able to log in until reactivated.`,
    SUSPEND: `You are about to suspend ${selectedUserIds.length} user accounts. All ongoing sessions and tokens will be terminated immediately.`,
    DELETE: `You are about to remove ${selectedUserIds.length} user accounts. This action soft-deletes their directory profiles.`,
  }[action]

  const handleExecute = () => {
    const payload: BulkUserActionRequestDTO = {
      userIds: selectedUserIds,
      action: action === 'DELETE' ? 'DELETE' : 'ASSIGN_ROLE',
      status: action !== 'DELETE' ? (action as any) : undefined,
      reason: reason.trim() || undefined,
    }
    bulkMutation.mutate(payload)
  }

  return (
    <Dialog
      open={open}
      onClose={bulkMutation.isPending ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: `1px solid ${
            isDelete
              ? alpha(theme.palette.error.main, 0.2)
              : isSuspend
              ? alpha(theme.palette.warning.main, 0.2)
              : alpha(theme.palette.divider, 0.15)
          }`,
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
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: isDelete
                ? alpha(theme.palette.error.main, 0.1)
                : isSuspend
                ? alpha(theme.palette.warning.main, 0.1)
                : alpha(theme.palette.primary.main, 0.1),
              color: isDelete
                ? theme.palette.error.main
                : isSuspend
                ? theme.palette.warning.main
                : theme.palette.primary.main,
              display: 'flex',
            }}
          >
            {isDelete || isSuspend ? <WarningAmberIcon /> : <LayersIcon />}
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {actionTitle}
            </Typography>
            <Chip
              label={`${selectedUserIds.length} users selected`}
              size="small"
              sx={{ height: 20, fontSize: '0.7rem', mt: 0.25 }}
            />
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small" disabled={bulkMutation.isPending}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 1 }}>
        <Stack spacing={2.5}>
          <Typography variant="body2" color="text.secondary">
            {actionDescription}
          </Typography>

          {(isDelete || isSuspend) && (
            <Alert severity={isDelete ? 'error' : 'warning'}>
              Please ensure this action is compliant with your organization's administrative guidelines.
            </Alert>
          )}

          <TextField
            fullWidth
            size="small"
            label="Audit Reason"
            placeholder="e.g. Quarterly access review, Department restructuring"
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
          onClick={handleExecute}
          variant="contained"
          color={isDelete ? 'error' : isSuspend ? 'warning' : 'primary'}
          disabled={bulkMutation.isPending}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            px: 3,
            borderRadius: 2,
            minWidth: 120,
          }}
        >
          {bulkMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Confirm Action'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
