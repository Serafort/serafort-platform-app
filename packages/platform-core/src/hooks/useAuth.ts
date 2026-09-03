import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '../services/auth/auth.service'
import { USER_KEYS } from './useUser'
import { useAuthStore } from '@cap/platform-store'

export const useAuth = () => {
  const queryClient = useQueryClient()
  const authState = useAuthStore()

  const loginMutation = useMutation({
    mutationFn: () => {
      authService.loginWithIdaas()
      return Promise.resolve()
    },
  })

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.clear()
      queryClient.setQueryData(USER_KEYS.me, null)
    },
  })

  return {
    ...authState,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  }
}
