import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TextField, Button, Box } from '@mui/material'
import { useChangePassword } from '../../../user-directory/hooks/useUserQuery'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AuthActionButton } from '../shared/auth/AuthActionButton'
import { Path } from '@cap/module-auth/routes'

const schema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  })

type FormData = z.infer<typeof schema>

export function ChangePasswordForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const changePasswordMutation = useChangePassword()

  const onSubmit = (data: FormData) => {
    const requestData = {
      currentPassword: data.current_password,
      password: data.new_password,
      confirmPassword: data.confirm_password,
    }
    changePasswordMutation.mutate(requestData, {
      onSuccess: () => {
        alert('Password changed successfully! Please login again.')
        reset()
        // Redirect to login
        navigate(Path.auth.login)
      },
      onError: (error: any) => {
        alert(error.response?.data?.detail || 'Failed to change password')
      },
    })
  }

  return (
    <Box component='form' onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        type='password'
        label={t('auth.account.current_password')}
        {...register('current_password')}
        error={!!errors.current_password}
        helperText={errors.current_password?.message}
        margin='normal'
      />

      <TextField
        fullWidth
        type='password'
        label={t('auth.account.new_password')}
        {...register('new_password')}
        error={!!errors.new_password}
        helperText={errors.new_password?.message}
        margin='normal'
      />

      <TextField
        fullWidth
        type='password'
        label={t('auth.account.confirm_password_label')}
        {...register('confirm_password')}
        error={!!errors.confirm_password}
        helperText={errors.confirm_password?.message}
        margin='normal'
      />

      <AuthActionButton
        type='submit'
        data-testid='change-password-submit'
        isLoading={changePasswordMutation.isPending}
        label={
          changePasswordMutation.isPending
            ? t('auth.common.saving')
            : t('auth.account.update_password')
        }
        sx={{ mt: 3 }}
      />
    </Box>
  )
}


