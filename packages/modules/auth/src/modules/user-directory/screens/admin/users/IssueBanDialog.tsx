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
import { useUsers, useBanUser } from "@idaas/authentication-core/hooks/useAdminQuery"
import { toast } from 'react-toastify';
import { useDebounce } from 'use-debounce'

interface IssueBanDialogProps {
  open: boolean
  onClose: () => void
}

export default function IssueBanDialog({ open, onClose }: IssueBanDialogProps) {
  const { t } = useTranslation('common')
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
      toast.success(t('auth.admin.banSuccess', 'User banned successfully'), {  })
      onClose()
      setSelectedUser(null)
      setReason('')
    },
    onError: (error: any) => {
      toast.error(error.message || t('auth.common.errorOccurred', 'An error occurred'), {  })
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
          maxWidth="sm"
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
          <DialogTitle sx={{ fontWeight: 800, color: 'info.main' }}>
            {t('auth.admin.issueNewBan', 'Issue New Ban')}
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              <Autocomplete
                options={userData?.data?.data || []}
                getOptionLabel={(option: { firstName?: string; lastName?: string; email: string }) => `${option.firstName ?? ''} ${option.lastName ?? ''} (${option.email})`}
                loading={isUsersLoading}
                onInputChange={(_, value) => setSearchTerm(value)}
                onChange={(_, value) => setSelectedUser(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('auth.admin.selectUser', 'Select User')}
                    placeholder={t('auth.admin.searchUserToBan', 'Search user by name or email')}
                    variant="outlined"
                    slotProps={{
                      input: {
                        ...params.InputProps,
                        endAdornment: (
                          <React.Fragment>
                            {isUsersLoading ? <CircularProgress color="info" size={20} /> : null}
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
                  <Alert severity="warning">{t('auth.admin.userAlreadyBanned', 'This user is already banned.')}</Alert>
                </motion.div>
              )}

              <TextField
                fullWidth
                multiline
                rows={3}
                label={t('auth.admin.banReason', 'Ban Reason')}
                placeholder={t('auth.admin.banReason_placeholder', 'Enter the reason for the ban')}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={onClose}
              color="inherit"
              sx={{ textTransform: 'none', fontWeight: 600, px: 2 }}
            >
              {t('auth.common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleIssueBan}
              variant="contained"
              color="info"
              disabled={!selectedUser || banMutation.isPending || selectedUser.status === 'SUSPENDED'}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                px: 3,
                boxShadow: (theme) => `0 4px 14px 0 ${theme.palette.info.light}`,
                '&:hover': {
                  boxShadow: (theme) => `0 6px 20px 0 ${theme.palette.info.light}`,
                },
              }}
            >
              {banMutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                t('auth.admin.issueBan', 'Issue Ban')
              )}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
