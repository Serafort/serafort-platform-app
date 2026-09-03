import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNotifications } from '@cap/platform-core'
import { useUsers, useBanUser } from '../../authorization-engine/hooks/useAdminQuery'
import { useDebounce } from 'use-debounce'

interface IssueBanDialogProps {
  open: boolean
  onClose: () => void
}

export default function IssueBanDialog({ open, onClose }: IssueBanDialogProps) {
  const { t } = useTranslation('common')
  const { addNotification } = useNotifications()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch] = useDebounce(searchTerm, 300)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [reason, setReason] = useState('')

  const { data: userData, isLoading: isUsersLoading } = useUsers({
    search: debouncedSearch,
    limit: 10,
  })

  const banMutation = useBanUser({
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: t('auth.admin.banSuccessTitle', 'User Banned'),
        message: t('auth.admin.banSuccess', 'User banned successfully'),
      })
      onClose()
      setSelectedUser(null)
      setReason('')
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: t('common.error', 'Error'),
        message: error.message || t('auth.common.errorOccurred', 'An error occurred'),
      })
    },
  })

  const handleIssueBan = () => {
    if (selectedUser) {
      banMutation.mutate({ id: selectedUser.id, reason })
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <Dialog
          open={open}
          onClose={onClose}
          maxWidth='sm'
          fullWidth
          PaperComponent={(props) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
            >
              <Box {...props} sx={{ ...props.sx, m: 0 }} />
            </motion.div>
          )}
        >
          <DialogTitle
            sx={{
              fontWeight: 800,
              color: 'error.main',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {t('auth.admin.issueNewBan', 'Issue Account Suspension / Ban')}
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              <Alert severity='warning' sx={{ borderRadius: 2 }}>
                {t(
                  'auth.admin.banWarning',
                  'Suspending an account revokes all active sessions, API keys, and access tokens.',
                )}
              </Alert>

              <Autocomplete
                options={userData?.data?.data || []}
                getOptionLabel={(option: {
                  firstName?: string
                  lastName?: string
                  email: string
                }) => `${option.firstName ?? ''} ${option.lastName ?? ''} (${option.email})`}
                loading={isUsersLoading}
                onInputChange={(_, value) => setSearchTerm(value)}
                onChange={(_, value) => setSelectedUser(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('auth.admin.selectUser', 'Select User')}
                    placeholder={t('auth.admin.searchUserToBan', 'Search user by name or email')}
                    variant='outlined'
                    slotProps={{
                      input: {
                        ...params.InputProps,
                        endAdornment: (
                          <React.Fragment>
                            {isUsersLoading ? <CircularProgress color='error' size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      },
                    }}
                  />
                )}
              />

              {selectedUser && selectedUser.status === 'SUSPENDED' && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                  <Alert severity='error'>
                    {t('auth.admin.userAlreadyBanned', 'This user is already banned.')}
                  </Alert>
                </motion.div>
              )}

              <TextField
                fullWidth
                multiline
                rows={3}
                label={t('auth.admin.banReason', 'Ban / Suspension Reason')}
                placeholder={t(
                  'auth.admin.banReason_placeholder',
                  'Enter the security or compliance reason for the ban',
                )}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button
              onClick={onClose}
              color='inherit'
              sx={{ textTransform: 'none', fontWeight: 600, px: 2 }}
            >
              {t('auth.common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleIssueBan}
              variant='contained'
              color='error'
              disabled={
                !selectedUser ||
                !reason.trim() ||
                banMutation.isPending ||
                selectedUser.status === 'SUSPENDED'
              }
              sx={{
                textTransform: 'none',
                fontWeight: 800,
                px: 3,
                boxShadow: (theme) => `0 4px 14px 0 ${theme.palette.error.main}40`,
                '&:hover': {
                  boxShadow: (theme) => `0 6px 20px 0 ${theme.palette.error.main}60`,
                },
              }}
            >
              {banMutation.isPending ? (
                <CircularProgress size={24} color='inherit' />
              ) : (
                t('auth.admin.issueBan', 'Confirm Ban & Revoke Access')
              )}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
