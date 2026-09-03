import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify';
import { useCreateUser } from "@idaas/authentication-core/hooks/useAdminQuery"

interface CreateUserRequest {
  email: string
  password: string
  firstname: string
  lastname: string
  role_id: number
}

interface CreateUserDialogProps {
  open: boolean
  onClose: () => void
}

export default function CreateUserDialog({ open, onClose }: CreateUserDialogProps) {
  const { t } = useTranslation('common')
  const [formData, setFormData] = useState<CreateUserRequest>({
    email: '',
    password: '',
    firstname: '',
    lastname: '',
    role_id: 1, // Default role
  })

  const createUserMutation = useCreateUser({
    onSuccess: () => {
      onClose()
      setFormData({
        email: '',
        password: '',
        firstname: '',
        lastname: '',
        role_id: 1,
      })
      toast.success(t('auth.admin.successCreate'))
    },
    onError: (error: any) => {
      toast.error(error.message || t('auth.admin.errorCreate'))
    },
  })

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createUserMutation.mutate(formData)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 800 }}>{t('auth.admin.addUser_title')}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t('auth.common.firstName')}
                name='firstname'
                value={formData.firstname}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t('auth.common.lastName')}
                name='lastname'
                value={formData.lastname}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t('auth.common.email')}
                name='email'
                type='email'
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t('auth.login.password_label')}
                name='password'
                type='password'
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>{t('auth.common.roleLabel')}</InputLabel>
                <Select
                  name='role_id'
                  value={formData.role_id}
                  label={t('auth.common.roleLabel')}
                  onChange={(e) =>
                    setFormData((prev: CreateUserRequest) => ({ ...prev, role_id: e.target.value as number }))
                  }
                >
                  <MenuItem value={1}>{t('auth.common.user')}</MenuItem>
                  <MenuItem value={2}>{t('auth.admin.administrator')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} color='inherit' sx={{ textTransform: 'none', fontWeight: 600 }}>
            {t('auth.common.cancel')}
          </Button>
          <Button
            type='submit'
            variant='contained'
            disabled={createUserMutation.isPending}
            sx={{ textTransform: 'none', fontWeight: 600, minWidth: 100 }}
          >
            {createUserMutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              t('auth.admin.addUser')
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
