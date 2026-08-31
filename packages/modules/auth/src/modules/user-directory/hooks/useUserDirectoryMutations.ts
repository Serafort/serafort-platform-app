// useUserDirectoryMutations.ts
// TanStack React Query v5 Mutation Hooks for User Directory

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query'
import { FetchResponse, HttpError, useNotifications } from '@cap/platform-core'
import userDirectoryService from '../services/userDirectory.service'
import { userDirectoryKeys } from './useUserDirectoryQuery'
import {
  InviteUserRequestDTO,
  UpdateUserRequestDTO,
  UpdateUserStatusRequestDTO,
  AssignRolesRequestDTO,
  BulkUserActionRequestDTO,
  UserDirectoryFilterParams,
} from '../types/userDirectory.types'
import { BulkInviteUserFormData } from '../schemas/userDirectory.schema'

/**
 * Mutation hook for inviting single user
 */
export function useInviteUserMutation(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, InviteUserRequestDTO>
) {
  const queryClient = useQueryClient()
  const { addNotification } = useNotifications()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (data: InviteUserRequestDTO) => userDirectoryService.inviteUser(data),
    onSuccess: (res, vars, context) => {
      queryClient.invalidateQueries({ queryKey: userDirectoryKeys.lists() })
      addNotification?.({
        type: 'success',
        title: 'User Invited',
        message: `Invitation email sent successfully to ${vars.email}.`,
      })
      if (customOnSuccess) {
        ;(customOnSuccess as any)(res, vars, context)
      }
    },
    onError: (err: any, vars, context) => {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to invite user. Please check the details.'
      addNotification?.({
        type: 'error',
        title: 'Invitation Failed',
        message,
      })
      if (customOnError) {
        ;(customOnError as any)(err, vars, context)
      }
    },
    ...restOptions,
  })
}

/**
 * Mutation hook for bulk inviting users
 */
export function useBulkInviteUsersMutation(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, BulkInviteUserFormData>
) {
  const queryClient = useQueryClient()
  const { addNotification } = useNotifications()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (data: BulkInviteUserFormData) => {
      const emails = data.emails
        .split(/[,\n;]+/)
        .map((e) => e.trim())
        .filter(Boolean)
      return userDirectoryService.bulkInviteUsers({
        emails,
        roleIds: data.roleIds,
        department: data.department,
        sendInviteEmail: data.sendInviteEmail,
      })
    },
    onSuccess: (res, vars, context) => {
      queryClient.invalidateQueries({ queryKey: userDirectoryKeys.lists() })
      addNotification?.({
        type: 'success',
        title: 'Bulk Invitations Sent',
        message: 'All user invitations have been queued successfully.',
      })
      if (customOnSuccess) {
        ;(customOnSuccess as any)(res, vars, context)
      }
    },
    onError: (err: any, vars, context) => {
      addNotification?.({
        type: 'error',
        title: 'Bulk Invite Failed',
        message: err?.response?.data?.message || err?.message || 'Failed to send bulk invitations.',
      })
      if (customOnError) {
        ;(customOnError as any)(err, vars, context)
      }
    },
    ...restOptions,
  })
}

/**
 * Mutation hook for updating user profile
 */
export function useUpdateUserMutation(
  options?: UseMutationOptions<
    FetchResponse<any>,
    HttpError,
    { id: string | number; data: UpdateUserRequestDTO }
  >
) {
  const queryClient = useQueryClient()
  const { addNotification } = useNotifications()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}

  return useMutation({
    mutationFn: ({ id, data }) => userDirectoryService.updateUser(id, data),
    onSuccess: (res, vars, context) => {
      queryClient.invalidateQueries({ queryKey: userDirectoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userDirectoryKeys.detail(vars.id) })
      addNotification?.({
        type: 'success',
        title: 'User Updated',
        message: 'User profile updated successfully.',
      })
      if (customOnSuccess) {
        ;(customOnSuccess as any)(res, vars, context)
      }
    },
    onError: (err: any, vars, context) => {
      addNotification?.({
        type: 'error',
        title: 'Update Failed',
        message: err?.response?.data?.message || err?.message || 'Failed to update user profile.',
      })
      if (customOnError) {
        ;(customOnError as any)(err, vars, context)
      }
    },
    ...restOptions,
  })
}

/**
 * Mutation hook for updating user status
 */
export function useUpdateUserStatusMutation(
  options?: UseMutationOptions<
    FetchResponse<any>,
    HttpError,
    { id: string | number; data: UpdateUserStatusRequestDTO }
  >
) {
  const queryClient = useQueryClient()
  const { addNotification } = useNotifications()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}

  return useMutation({
    mutationFn: ({ id, data }) => userDirectoryService.updateUserStatus(id, data),
    onSuccess: (res, vars, context) => {
      queryClient.invalidateQueries({ queryKey: userDirectoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userDirectoryKeys.detail(vars.id) })
      addNotification?.({
        type: 'success',
        title: 'Status Updated',
        message: `User status changed to ${vars.data.status}.`,
      })
      if (customOnSuccess) {
        ;(customOnSuccess as any)(res, vars, context)
      }
    },
    onError: (err: any, vars, context) => {
      addNotification?.({
        type: 'error',
        title: 'Status Change Failed',
        message: err?.response?.data?.message || err?.message || 'Failed to update user status.',
      })
      if (customOnError) {
        ;(customOnError as any)(err, vars, context)
      }
    },
    ...restOptions,
  })
}

/**
 * Mutation hook for deleting user
 */
export function useDeleteUserMutation(
  options?: UseMutationOptions<
    FetchResponse<any>,
    HttpError,
    { id: string | number; reason?: string }
  >
) {
  const queryClient = useQueryClient()
  const { addNotification } = useNotifications()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}

  return useMutation({
    mutationFn: ({ id, reason }) => userDirectoryService.deleteUser(id, reason),
    onSuccess: (res, vars, context) => {
      queryClient.invalidateQueries({ queryKey: userDirectoryKeys.lists() })
      queryClient.removeQueries({ queryKey: userDirectoryKeys.detail(vars.id) })
      addNotification?.({
        type: 'success',
        title: 'User Deleted',
        message: 'The user account has been removed successfully.',
      })
      if (customOnSuccess) {
        ;(customOnSuccess as any)(res, vars, context)
      }
    },
    onError: (err: any, vars, context) => {
      addNotification?.({
        type: 'error',
        title: 'Deletion Failed',
        message: err?.response?.data?.message || err?.message || 'Failed to delete user.',
      })
      if (customOnError) {
        ;(customOnError as any)(err, vars, context)
      }
    },
    ...restOptions,
  })
}

/**
 * Mutation hook for assigning roles
 */
export function useAssignRolesMutation(
  options?: UseMutationOptions<
    FetchResponse<any>,
    HttpError,
    { id: string | number; data: AssignRolesRequestDTO }
  >
) {
  const queryClient = useQueryClient()
  const { addNotification } = useNotifications()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}

  return useMutation({
    mutationFn: ({ id, data }) =>
      userDirectoryService.syncUserRoles(id, data.roleIds, data.reason),
    onSuccess: (res, vars, context) => {
      queryClient.invalidateQueries({ queryKey: userDirectoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: userDirectoryKeys.detail(vars.id) })
      addNotification?.({
        type: 'success',
        title: 'Roles Updated',
        message: 'User roles and permissions have been updated.',
      })
      if (customOnSuccess) {
        ;(customOnSuccess as any)(res, vars, context)
      }
    },
    onError: (err: any, vars, context) => {
      addNotification?.({
        type: 'error',
        title: 'Role Assignment Failed',
        message: err?.response?.data?.message || err?.message || 'Failed to update user roles.',
      })
      if (customOnError) {
        ;(customOnError as any)(err, vars, context)
      }
    },
    ...restOptions,
  })
}

/**
 * Mutation hook for bulk operations (status, delete)
 */
export function useBulkActionMutation(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, BulkUserActionRequestDTO>
) {
  const queryClient = useQueryClient()
  const { addNotification } = useNotifications()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}

  return useMutation({
    mutationFn: async (payload: BulkUserActionRequestDTO) => {
      if (payload.action === 'DELETE') {
        return userDirectoryService.bulkDelete(payload.userIds, payload.reason)
      } else if (payload.status) {
        return userDirectoryService.bulkUpdateStatus(
          payload.userIds,
          payload.status,
          payload.reason
        )
      } else {
        return userDirectoryService.bulkUpdateStatus(
          payload.userIds,
          payload.action,
          payload.reason
        )
      }
    },
    onSuccess: (res, vars, context) => {
      queryClient.invalidateQueries({ queryKey: userDirectoryKeys.lists() })
      addNotification?.({
        type: 'success',
        title: 'Bulk Action Completed',
        message: `Action successfully applied to ${vars.userIds.length} users.`,
      })
      if (customOnSuccess) {
        ;(customOnSuccess as any)(res, vars, context)
      }
    },
    onError: (err: any, vars, context) => {
      addNotification?.({
        type: 'error',
        title: 'Bulk Action Failed',
        message: err?.response?.data?.message || err?.message || 'Failed to complete bulk action.',
      })
      if (customOnError) {
        ;(customOnError as any)(err, vars, context)
      }
    },
    ...restOptions,
  })
}

/**
 * Mutation hook for sending admin password reset
 */
export function useSendPasswordResetMutation(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, string | number>
) {
  const { addNotification } = useNotifications()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (id: string | number) => userDirectoryService.sendPasswordReset(id),
    onSuccess: (res, vars, context) => {
      addNotification?.({
        type: 'success',
        title: 'Password Reset Sent',
        message: 'Password reset instructions have been dispatched to the user.',
      })
      if (customOnSuccess) {
        ;(customOnSuccess as any)(res, vars, context)
      }
    },
    onError: (err: any, vars, context) => {
      addNotification?.({
        type: 'error',
        title: 'Failed to Send Reset',
        message: err?.response?.data?.message || err?.message || 'Could not send password reset.',
      })
      if (customOnError) {
        ;(customOnError as any)(err, vars, context)
      }
    },
    ...restOptions,
  })
}

/**
 * Mutation hook for resetting user MFA
 */
export function useResetMfaMutation(
  options?: UseMutationOptions<FetchResponse<any>, HttpError, string | number>
) {
  const queryClient = useQueryClient()
  const { addNotification } = useNotifications()
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options || {}

  return useMutation({
    mutationFn: (id: string | number) => userDirectoryService.resetMfa(id),
    onSuccess: (res, vars, context) => {
      queryClient.invalidateQueries({ queryKey: userDirectoryKeys.detail(vars) })
      addNotification?.({
        type: 'success',
        title: 'MFA Reset',
        message: 'Two-factor authentication has been reset for this user.',
      })
      if (customOnSuccess) {
        ;(customOnSuccess as any)(res, vars, context)
      }
    },
    onError: (err: any, vars, context) => {
      addNotification?.({
        type: 'error',
        title: 'MFA Reset Failed',
        message: err?.response?.data?.message || err?.message || 'Could not reset MFA.',
      })
      if (customOnError) {
        ;(customOnError as any)(err, vars, context)
      }
    },
    ...restOptions,
  })
}

/**
 * Mutation hook for export
 */
export function useExportUsersMutation() {
  const { addNotification } = useNotifications()

  return useMutation({
    mutationFn: ({
      filters,
      fallbackData,
    }: {
      filters: UserDirectoryFilterParams
      fallbackData?: any[]
    }) => userDirectoryService.exportUsers(filters, fallbackData),
    onSuccess: () => {
      addNotification?.({
        type: 'success',
        title: 'Export Complete',
        message: 'User directory CSV export has been downloaded.',
      })
    },
    onError: (err: any) => {
      addNotification?.({
        type: 'error',
        title: 'Export Failed',
        message: err?.message || 'Failed to export user directory.',
      })
    },
  })
}
