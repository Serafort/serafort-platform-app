// DeleteUserDialog.tsx
// Standardized confirmation dialog for removing / soft-deleting user accounts

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
  Avatar,
  Alert,
  CircularProgress,
  IconButton,
  alpha,
  useTheme,
} from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import CloseIcon from '@mui/icons-material/Close'
import { useDeleteUserMutation } from '../hooks/useUserDirectoryMutations'
import { UserDirectoryItemDTO, UserDetailDTO } from '../types/userDirectory.types'

export interface DeleteUserDialogProps {
  open: boolean
  user: UserDirectoryItemDTO | UserDetailDTO | null
  onClose: () => void
  onSuccess?: () => void
}

export default function DeleteUserDialog({
  open,
  user,
  onClose,
  onSuccess,
}: DeleteUserDialogProps) {
  const theme = useTheme()
  const [reason, setReason] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')

  const deleteUserMutation = useDeleteUserMutation({
    onSuccess: () => {
      setReason('')
      setConfirmEmail('')
      onSuccess?.()
      onClose()
    },
  })

  const handleDelete = () => {
    if (!user) return
    deleteUserMutation.mutate({
      id: user.id,
      reason: reason.trim() || 'Admin deletion',
    })
  }

  const isEmailMatch =
    !user?.email || confirmEmail.trim().toLowerCase() === user.email.toLowerCase()

  return (
    <Dialog
      open={open}
      onClose={deleteUserMutation.isPending ? undefined : onClose}
      maxWidth='xs'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
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
            <WarningAmberIcon />
          </Box>
          <Box>
            <Typography variant='h6' fontWeight={700} color='error.main'>
              Delete User Account
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              This action soft-deletes the user profile
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size='small' disabled={deleteUserMutation.isPending}>
          <CloseIcon fontSize='small' />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 1 }}>
        <Stack spacing={2.5}>
          {user && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.background.default, 0.6),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Avatar
                src={user.avatarUrl || undefined}
                sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
              >
                {user.firstName?.[0] || 'U'}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant='subtitle2' fontWeight={700} noWrap>
                  {user.fullName || `${user.firstName} ${user.lastName}`}
                </Typography>
                <Typography variant='caption' color='text.secondary' noWrap display='block'>
                  {user.email}
                </Typography>
              </Box>
            </Box>
          )}

          <Alert severity='error' sx={{ '& .MuiAlert-message': { fontSize: '0.8125rem' } }}>
            Deleting this account will immediately revoke all access tokens, active sessions, and
            permissions. Associated data will be archived according to tenant retention policies.
          </Alert>

          <Box>
            <Typography variant='caption' color='text.secondary' display='block' mb={0.75}>
              Type <strong>{user?.email}</strong> to confirm:
            </Typography>
            <TextField
              fullWidth
              size='small'
              placeholder={user?.email}
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
            />
          </Box>

          <TextField
            fullWidth
            size='small'
            label='Reason for deletion (Optional)'
            placeholder='e.g. Employee offboarding, GDPR request'
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
        <Button onClick={onClose} color='inherit' sx={{ textTransform: 'none', fontWeight: 600 }}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          variant='contained'
          color='error'
          disabled={deleteUserMutation.isPending || !isEmailMatch}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            px: 3,
            borderRadius: 2,
            minWidth: 120,
          }}
        >
          {deleteUserMutation.isPending ? (
            <CircularProgress size={20} color='inherit' />
          ) : (
            'Delete User'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
