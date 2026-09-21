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
  Chip,
  alpha,
  useTheme,
} from '@mui/material'
import LayersIcon from '@mui/icons-material/Layers'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { useTranslation } from 'react-i18next'
import { useBulkActionMutation } from '../hooks/useUserDirectoryMutations'
import { BulkUserActionRequestDTO } from '../types/userDirectory.types'
import DialogCloseButton from './DialogCloseButton'

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
  const { t } = useTranslation('common')
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

  const count = selectedUserIds.length

  const actionTitle = {
    ACTIVATE: t('auth.userDirectory.dialogs.bulk.title.ACTIVATE', 'Bulk activate users'),
    DEACTIVATE: t('auth.userDirectory.dialogs.bulk.title.DEACTIVATE', 'Bulk deactivate users'),
    SUSPEND: t('auth.userDirectory.dialogs.bulk.title.SUSPEND', 'Bulk suspend users'),
    DELETE: t('auth.userDirectory.dialogs.bulk.title.DELETE', 'Bulk delete users'),
  }[action]

  const actionDescription = {
    ACTIVATE: t(
      'auth.userDirectory.dialogs.bulk.description.ACTIVATE',
      'You are about to activate {{count}} user accounts, restoring full login access.',
      { count },
    ),
    DEACTIVATE: t(
      'auth.userDirectory.dialogs.bulk.description.DEACTIVATE',
      'You are about to deactivate {{count}} user accounts. Users will not be able to log in until reactivated.',
      { count },
    ),
    SUSPEND: t(
      'auth.userDirectory.dialogs.bulk.description.SUSPEND',
      'You are about to suspend {{count}} user accounts. All ongoing sessions and tokens will be terminated immediately.',
      { count },
    ),
    DELETE: t(
      'auth.userDirectory.dialogs.bulk.description.DELETE',
      'You are about to remove {{count}} user accounts. This action soft-deletes their directory profiles.',
      { count },
    ),
  }[action]

  const handleExecute = () => {
    const payload: BulkUserActionRequestDTO = {
      userIds: selectedUserIds,
      action: action === 'DELETE' ? 'DELETE' : 'ASSIGN_ROLE',
      // NOTE: the UI action verbs (ACTIVATE/DEACTIVATE/SUSPEND) are forwarded as-is; they
      // do not overlap UserStatus, hence the double cast. Behaviour unchanged.
      status:
        action !== 'DELETE' ? (action as unknown as BulkUserActionRequestDTO['status']) : undefined,
      reason: reason.trim() || undefined,
    }
    bulkMutation.mutate(payload)
  }

  return (
    <Dialog
      open={open}
      onClose={bulkMutation.isPending ? undefined : onClose}
      maxWidth='xs'
      fullWidth
      aria-labelledby='bulk-action-dialog-title'
      PaperProps={{
        sx: {
          borderRadius: 'var(--sf-radius-lg, 12px)',
          boxShadow: `0 24px 48px -12px ${alpha(theme.palette.common.black, 0.25)}`,
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
        component='div'
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
              borderRadius: 'var(--sf-radius-md, 8px)',
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
            <Typography id='bulk-action-dialog-title' variant='h6' component='h2' fontWeight={700}>
              {actionTitle}
            </Typography>
            <Chip
              label={t('auth.userDirectory.dialogs.bulk.selected', '{{count}} users selected', { count })}
              size='small'
              sx={{ height: 20, fontSize: '0.7rem', mt: 0.25 }}
            />
          </Box>
        </Stack>
        <DialogCloseButton onClick={onClose} disabled={bulkMutation.isPending} />
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 1 }}>
        <Stack spacing={2.5}>
          <Typography variant='body2' color='text.secondary'>
            {actionDescription}
          </Typography>

          {(isDelete || isSuspend) && (
            <Alert severity={isDelete ? 'error' : 'warning'}>
              {t(
                'auth.userDirectory.dialogs.bulk.compliance',
                "Please ensure this action is compliant with your organization's administrative guidelines.",
              )}
            </Alert>
          )}

          <TextField
            fullWidth
            label={t('auth.userDirectory.dialogs.bulk.reason', 'Audit reason')}
            placeholder={t(
              'auth.userDirectory.dialogs.bulk.reasonPlaceholder',
              'e.g. Quarterly access review, department restructuring',
            )}
            InputProps={{ sx: { minHeight: 48 } }}
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
        <Button
          onClick={onClose}
          color='inherit'
          sx={{ textTransform: 'none', fontWeight: 600, minHeight: 44 }}
        >
          {t('auth.common.cancel', 'Cancel')}
        </Button>
        <Button
          onClick={handleExecute}
          variant='contained'
          color={isDelete ? 'error' : isSuspend ? 'warning' : 'primary'}
          disabled={bulkMutation.isPending}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            px: 3,
            borderRadius: 'var(--sf-radius-md, 8px)',
            minWidth: 120,
            minHeight: 44,
          }}
        >
          {bulkMutation.isPending ? (
            <CircularProgress size={20} color='inherit' />
          ) : (
            t('auth.userDirectory.dialogs.bulk.confirm', 'Confirm action')
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
