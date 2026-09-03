import React, { useCallback, useRef, useMemo, useState, useEffect } from 'react'
import {
  Box,
  Button,
  Typography,
  Chip,
  Card,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Grid,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  InputAdornment,
  Skeleton,
  Stack,
  Tooltip,
  Divider,
  alpha,
  useTheme,
} from '@mui/material'
import Edit from '@mui/icons-material/Edit'
import LockReset from '@mui/icons-material/LockReset'
import Mail from '@mui/icons-material/Mail'
import Download from '@mui/icons-material/Download'
import Delete from '@mui/icons-material/Delete'
import ChevronRight from '@mui/icons-material/ChevronRight'
import Verified from '@mui/icons-material/Verified'
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import DeleteOutline from '@mui/icons-material/DeleteOutline'
import EditOutlined from '@mui/icons-material/EditOutlined'
import WarningAmber from '@mui/icons-material/WarningAmber'
import LinkIcon from '@mui/icons-material/Link'
import Person from '@mui/icons-material/Person'
import Settings from '@mui/icons-material/Settings'
import NotificationsNone from '@mui/icons-material/NotificationsNone'
import ExpandMore from '@mui/icons-material/ExpandMore'
import Check from '@mui/icons-material/Check'
import Close from '@mui/icons-material/Close'
import Lock from '@mui/icons-material/Lock'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import Send from '@mui/icons-material/Send'
import MarkEmailRead from '@mui/icons-material/MarkEmailRead'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Controller, useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Path } from '@cap/module-auth/routes/path'
import {
  useUserProfile,
  useUpdateProfile,
  useUploadAvatar,
  useDeleteAvatar,
  useChangePassword,
  useRequestEmailChange,
  useResendVerification,
  useExportMutation,
} from '../../hooks/useUserQuery'
import { useAuth, useNotifications } from '@cap/platform-core'
import { useAbility } from '@cap/authorization'
import { normalizeRole, PlatformRoles, Roles } from '@cap/shared-types'
import {
  updateProfileSchema,
  UpdateProfileFormData,
  changePasswordSchema,
  changePasswordBaseSchema,
  ChangePasswordFormData,
  requestEmailChangeSchema,
  RequestEmailChangeFormData,
} from './profile.schema'

const zIndexScale = {
  local: {
    above: 10,
    overlay: 20,
  },
}

const avatarPlaceHolder =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC4W5RRAYigwLIDhLEuhu9VmA04sosIuLA2wEgoKMlE4Yzh3xR7T6bg4g1AEiMxukr5jzTFqXnC6zJ9Hc4f_sChyHqrKLIy18UHddF2WVE-tQoBbXHG6Yq35VVQhhsEZkhVZTblhOu-QWVUtFN-3UGZTKMK6dDf_-tYtrTOLnKjb3uvm83b47AjPiRqopfR9onkbIlHxoJ1aiuY6d29bBbRyDSN73MAk3Hc7e56GwIVW485omnHQCYbfQk4vYHsbpd9iBNuFGaCXMA'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']

const formatDate = (isoString?: string) => {
  if (!isoString) return 'N/A'
  try {
    const d = new Date(isoString)
    return Number.isNaN(d.getTime())
      ? isoString
      : d.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
  } catch {
    return isoString
  }
}

interface QuickActionItem {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  primary?: boolean
  danger?: boolean
  onClick: () => void | Promise<void>
}

const LANGUAGES = [
  { label: 'auth.account.languages.en-us', title: 'English (US)', value: 'en-us' },
  { label: 'auth.account.languages.es', title: 'Spanish', value: 'es' },
  { label: 'auth.account.languages.fr', title: 'French', value: 'fr' },
  { label: 'auth.account.languages.de', title: 'German', value: 'de' },
]

const TIMEZONES = [
  { label: 'auth.account.timezones.utc', title: 'UTC (Coordinated Universal Time)', value: 'utc' },
  {
    label: 'auth.account.timezones.pst',
    title: 'PST (Pacific Standard Time, UTC-8)',
    value: 'pst',
  },
  {
    label: 'auth.account.timezones.est',
    title: 'EST (Eastern Standard Time, UTC-5)',
    value: 'est',
  },
  {
    label: 'auth.account.timezones.cet',
    title: 'CET (Central European Time, UTC+1)',
    value: 'cet',
  },
]

const DATE_FORMATS = [
  { label: 'auth.account.date_formats.mm-dd-yyyy', title: 'MM/DD/YYYY', value: 'mm-dd-yyyy' },
  { label: 'auth.account.date_formats.dd-mm-yyyy', title: 'DD/MM/YYYY', value: 'dd-mm-yyyy' },
  { label: 'auth.account.date_formats.yyyy-mm-dd', title: 'YYYY-MM-DD', value: 'yyyy-mm-dd' },
]

export interface ProfileViewProps {
  initialEditMode?: boolean
  onSave?: () => void
  onCancel?: () => void
}

export default function ProfileView({
  initialEditMode = false,
  onSave,
  onCancel,
}: ProfileViewProps) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const theme = useTheme()
  const { t } = useTranslation()
  const { user: authUser } = useAuth()
  const {
    data: profileResponse,
    isLoading: isProfileLoading,
    isError: isProfileError,
    refetch: refetchProfile,
  } = useUserProfile()
  const { addNotification } = useNotifications()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { can } = useAbility()

  // Local state
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [unsavedChangesDialogOpen, setUnsavedChangesDialogOpen] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Edit Mode state
  const [isEditing, setIsEditing] = useState<boolean>(() => {
    return initialEditMode || searchParams.get('edit') === 'true'
  })

  useEffect(() => {
    if (initialEditMode || searchParams.get('edit') === 'true') {
      setIsEditing(true)
    }
  }, [initialEditMode, searchParams])

  // Merge TanStack Query user data with authUser fallback
  const user = useMemo(() => {
    return profileResponse?.data || authUser
  }, [profileResponse, authUser])

  // Determine if current user is superadmin / platform owner
  const normalizedRole = useMemo(() => {
    const rawRole = (user as any)?.role || (user as any)?.roleName || (user as any)?.roleObject
    return normalizeRole(rawRole)
  }, [user])

  const isSuperAdmin = useMemo(() => {
    return (
      normalizedRole === 'platform_owner' ||
      normalizedRole === 'super_admin' ||
      normalizedRole === 'superadmin' ||
      normalizedRole === PlatformRoles.PLATFORM_OWNER ||
      normalizedRole === PlatformRoles.SUPER_ADMIN ||
      normalizedRole === Roles.SUPERADMIN ||
      (user as any)?.plane === 'platform' ||
      can('update', 'user:email' as any) ||
      can('manage', 'all' as any)
    )
  }, [normalizedRole, user, can])

  // Form Management with React Hook Form & Zod
  const profileForm = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      displayName: '',
      email: '',
      phoneNumber: '',
      jobTitle: '',
      department: '',
      company: '',
      location: '',
      website: '',
      timezone: 'utc',
      locale: 'en-us',
      dateFormat: 'mm-dd-yyyy',
      bio: '',
      emailOnNewDeviceLogin: true,
      emailOnComment: true,
      emailOnCommentReply: true,
      emailOnAchievement: true,
      emailOnWatchlist: true,
      emailOnMention: true,
    },
  })

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    reset: resetProfileForm,
    setError: setProfileError,
    formState: {
      isDirty: isProfileDirty,
      isSubmitting: isProfileSubmitting,
      errors: profileErrors,
    },
  } = profileForm

  // Change Password Form
  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onBlur',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  // Email Change Form
  const emailForm = useForm<RequestEmailChangeFormData>({
    resolver: zodResolver(requestEmailChangeSchema),
    mode: 'onBlur',
    defaultValues: {
      newEmail: '',
    },
  })

  // Populate form with user profile once resolved
  useEffect(() => {
    if (user) {
      const userAny = user as any
      const profile = userAny?.profile || userAny
      resetProfileForm({
        firstName: user?.firstName || userAny?.firstname || '',
        lastName: user?.lastName || userAny?.lastname || '',
        displayName:
          userAny?.displayName ||
          userAny?.name ||
          `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
        email: user?.email || '',
        phoneNumber: user?.phone || userAny?.phoneNumber || '',
        jobTitle: profile?.jobTitle || '',
        department: profile?.department || '',
        company: profile?.company || '',
        location: profile?.location || '',
        website: profile?.website || '',
        timezone: profile?.timezone || 'utc',
        locale: profile?.locale || profile?.language || 'en-us',
        dateFormat: profile?.dateFormat || 'mm-dd-yyyy',
        bio: profile?.bio || profile?.biography || '',
        emailOnNewDeviceLogin: profile?.emailOnNewDeviceLogin ?? true,
        emailOnComment: profile?.emailOnComment ?? true,
        emailOnCommentReply: profile?.emailOnCommentReply ?? true,
        emailOnAchievement: profile?.emailOnAchievement ?? true,
        emailOnWatchlist: profile?.emailOnWatchlist ?? true,
        emailOnMention: profile?.emailOnMention ?? true,
      })
    }
  }, [user, resetProfileForm])

  // Cleanup object URL preview
  useEffect(() => {
    return () => {
      if (previewAvatarUrl) {
        URL.revokeObjectURL(previewAvatarUrl)
      }
    }
  }, [previewAvatarUrl])

  // TanStack React Query Mutations
  const updateProfileMutation = useUpdateProfile({
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: t('user.profile.success', 'Success'),
        message: t('user.profile.update_success', 'Profile updated successfully.'),
      })
      setIsEditing(false)
      if (searchParams.get('edit')) {
        const nextParams = new URLSearchParams(searchParams)
        nextParams.delete('edit')
        setSearchParams(nextParams, { replace: true })
      }
      onSave?.()
    },
    onError: (error: any) => {
      // Backend validation error mapping (e.g., 422 Unprocessable Entity or field errors)
      const fieldErrors = error?.data?.errors || error?.response?.data?.errors
      if (fieldErrors && typeof fieldErrors === 'object') {
        Object.entries(fieldErrors).forEach(([field, msg]: [string, any]) => {
          const messageStr = Array.isArray(msg) ? msg[0] : String(msg)
          if (field in updateProfileSchema.shape) {
            setProfileError(field as keyof UpdateProfileFormData, {
              type: 'server',
              message: messageStr,
            })
          }
        })
      }

      addNotification({
        type: 'error',
        title: t('user.profile.error', 'Update Failed'),
        message:
          error?.message ||
          error?.data?.message ||
          t('user.profile.update_error', 'Failed to update profile details.'),
      })
    },
  })

  const uploadAvatarMutation = useUploadAvatar({
    onSuccess: (res) => {
      setPreviewAvatarUrl(null)
      addNotification({
        type: 'success',
        title: t('user.profile.success', 'Success'),
        message: t('user.profile.avatar_updated', 'Profile photo updated successfully.'),
      })
    },
    onError: (err: any) => {
      setPreviewAvatarUrl(null)
      addNotification({
        type: 'error',
        title: t('user.profile.error', 'Upload Failed'),
        message:
          err?.message ||
          t('user.profile.avatar_update_error', 'Failed to upload new profile photo.'),
      })
    },
  })

  const deleteAvatarMutation = useDeleteAvatar({
    onSuccess: () => {
      setPreviewAvatarUrl(null)
      addNotification({
        type: 'success',
        title: t('user.profile.success', 'Success'),
        message: t('user.profile.avatar_removed', 'Profile photo removed successfully.'),
      })
    },
    onError: (err: any) => {
      addNotification({
        type: 'error',
        title: t('user.profile.error', 'Error'),
        message: err?.message || t('user.profile.avatar_remove_error', 'Failed to remove avatar.'),
      })
    },
  })

  const changePasswordMutation = useChangePassword({
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: t('user.profile.success', 'Success'),
        message: t('user.profile.password_changed', 'Password has been updated successfully.'),
      })
      setPasswordDialogOpen(false)
      passwordForm.reset()
    },
    onError: (error: any) => {
      const fieldErrors = error?.data?.errors || error?.response?.data?.errors
      if (fieldErrors && typeof fieldErrors === 'object') {
        Object.entries(fieldErrors).forEach(([field, msg]: [string, any]) => {
          const messageStr = Array.isArray(msg) ? msg[0] : String(msg)
          if (field in changePasswordBaseSchema.shape) {
            passwordForm.setError(field as keyof ChangePasswordFormData, {
              type: 'server',
              message: messageStr,
            })
          }
        })
      }
      addNotification({
        type: 'error',
        title: t('user.profile.error', 'Error'),
        message:
          error?.message || t('user.profile.password_change_failed', 'Failed to change password.'),
      })
    },
  })

  const requestEmailChangeMutation = useRequestEmailChange({
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: t('user.profile.success', 'Verification Sent'),
        message: t(
          'user.profile.email_change_requested',
          'A confirmation link has been sent to the requested email.',
        ),
      })
      setEmailDialogOpen(false)
      emailForm.reset()
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: t('user.profile.error', 'Request Failed'),
        message:
          error?.message ||
          t('user.profile.email_change_failed', 'Failed to request email change.'),
      })
    },
  })

  const resendVerificationMutation = useResendVerification({
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: t('user.profile.success', 'Email Sent'),
        message: t('user.profile.verification_resent', 'Verification email sent successfully.'),
      })
    },
    onError: (error: any) => {
      addNotification({
        type: 'error',
        title: t('user.profile.error', 'Error'),
        message:
          error?.message ||
          t('user.profile.verification_resend_failed', 'Failed to resend verification email.'),
      })
    },
  })

  // Avatar Event Handlers
  const handleAvatarClick = useCallback(() => {
    if (!uploadAvatarMutation.isPending) {
      fileInputRef.current?.click()
    }
  }, [uploadAvatarMutation.isPending])

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      // Client-side image validation
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        addNotification({
          type: 'error',
          title: t('user.profile.invalid_file', 'Invalid File Type'),
          message: t(
            'user.profile.image_format_hint',
            'Please select a valid image (.png, .jpg, .jpeg, .webp).',
          ),
        })
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        addNotification({
          type: 'error',
          title: t('user.profile.file_too_large', 'File Too Large'),
          message: t('user.profile.file_size_hint', 'Avatar image size must be less than 5MB.'),
        })
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }

      // Show instantaneous local preview
      const previewUrl = URL.createObjectURL(file)
      setPreviewAvatarUrl(previewUrl)

      // Execute upload mutation
      uploadAvatarMutation.mutate(file, {
        onSettled: () => {
          if (fileInputRef.current) fileInputRef.current.value = ''
        },
      })
    },
    [uploadAvatarMutation, addNotification, t],
  )

  const handleRemoveAvatar = useCallback(() => {
    deleteAvatarMutation.mutate()
  }, [deleteAvatarMutation])

  // Edit Mode Toggles & Unsaved Changes Guard
  const handleStartEdit = useCallback(() => {
    setIsEditing(true)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('edit', 'true')
    setSearchParams(nextParams, { replace: true })
  }, [searchParams, setSearchParams])

  const handleDiscardChanges = useCallback(() => {
    setIsEditing(false)
    if (searchParams.get('edit')) {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('edit')
      setSearchParams(nextParams, { replace: true })
    }
    // Revert form values to existing user data
    if (user) {
      const userAny = user as any
      const profile = userAny?.profile || userAny
      resetProfileForm({
        firstName: user?.firstName || userAny?.firstname || '',
        lastName: user?.lastName || userAny?.lastname || '',
        displayName:
          userAny?.displayName ||
          userAny?.name ||
          `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
        email: user?.email || '',
        phoneNumber: user?.phone || userAny?.phoneNumber || '',
        jobTitle: profile?.jobTitle || '',
        department: profile?.department || '',
        company: profile?.company || '',
        location: profile?.location || '',
        website: profile?.website || '',
        timezone: profile?.timezone || 'utc',
        locale: profile?.locale || profile?.language || 'en-us',
        dateFormat: profile?.dateFormat || 'mm-dd-yyyy',
        bio: profile?.bio || profile?.biography || '',
        emailOnNewDeviceLogin: profile?.emailOnNewDeviceLogin ?? true,
        emailOnComment: profile?.emailOnComment ?? true,
        emailOnCommentReply: profile?.emailOnCommentReply ?? true,
        emailOnAchievement: profile?.emailOnAchievement ?? true,
        emailOnWatchlist: profile?.emailOnWatchlist ?? true,
        emailOnMention: profile?.emailOnMention ?? true,
      })
    }
    setUnsavedChangesDialogOpen(false)
    onCancel?.()
  }, [searchParams, setSearchParams, user, resetProfileForm, onCancel])

  const handleCancelEditClick = useCallback(() => {
    if (isProfileDirty) {
      setUnsavedChangesDialogOpen(true)
    } else {
      handleDiscardChanges()
    }
  }, [isProfileDirty, handleDiscardChanges])

  // Form Submit Handler
  const onFormSubmit: SubmitHandler<UpdateProfileFormData> = async (values) => {
    const payload = {
      firstname: values.firstName,
      lastname: values.lastName,
      firstName: values.firstName,
      lastName: values.lastName,
      displayName: values.displayName || `${values.firstName} ${values.lastName}`.trim(),
      phone: values.phoneNumber,
      phoneNumber: values.phoneNumber,
      jobTitle: values.jobTitle,
      department: values.department,
      company: values.company,
      location: values.location,
      website: values.website,
      timezone: values.timezone,
      locale: values.locale,
      language: values.locale,
      dateFormat: values.dateFormat,
      bio: values.bio,
      biography: values.bio,
      emailOnNewDeviceLogin: values.emailOnNewDeviceLogin,
      emailOnComment: values.emailOnComment,
      emailOnCommentReply: values.emailOnCommentReply,
      emailOnAchievement: values.emailOnAchievement,
      emailOnWatchlist: values.emailOnWatchlist,
      emailOnMention: values.emailOnMention,
      ...(isSuperAdmin ? { email: values.email } : {}),
    }

    updateProfileMutation.mutate(payload as any)
  }

  // Quick Action: Export Data — queues a full GDPR data-export job on the
  // backend (the package is prepared server-side and made available on the
  // dedicated Data Export page); this is not a client-side dump of the fields
  // already loaded in the profile view.
  const exportMutation = useExportMutation({
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: t('user.profile.export_data', 'Export Data'),
        message: t(
          'user.profile.export_queued',
          'Your data export has been requested. You can track and download it from the Data Export page.',
        ),
      })
      navigate(Path.account.dataExport)
    },
    onError: (err) => {
      addNotification({
        type: 'error',
        title: t('user.profile.error', 'Error'),
        message: err?.message || t('user.profile.export_failed', 'Failed to request data export.'),
      })
    },
  })
  const isExporting = exportMutation.isPending

  const handleExportData = useCallback(() => {
    if (exportMutation.isPending) return
    exportMutation.mutate()
  }, [exportMutation])

  const displayName = useMemo(() => {
    const userAny = user as any
    if (userAny?.displayName) return userAny.displayName
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`
    if (user?.name) return user.name
    if (user?.email) return user.email.split('@')[0]
    return t('user.profile.user', 'User')
  }, [user, t])

  const currentAvatarSrc = useMemo(() => {
    if (previewAvatarUrl) return previewAvatarUrl
    const userAny = user as any
    return userAny?.avatarUrl || userAny?.avatar || avatarPlaceHolder
  }, [previewAvatarUrl, user])

  const hasCustomAvatar = useMemo(() => {
    const userAny = user as any
    const src = userAny?.avatarUrl || userAny?.avatar
    return Boolean(src && src !== avatarPlaceHolder)
  }, [user])

  const quickActions: QuickActionItem[] = useMemo(() => {
    const actions: QuickActionItem[] = [
      {
        id: 'edit-profile',
        label: isEditing
          ? t('user.profile.cancel_edit', 'Cancel Editing')
          : t('user.profile.edit_profile', 'Edit Profile'),
        description: isEditing
          ? t('user.profile.cancel_edit_desc', 'Discard unsaved changes')
          : t('user.profile.edit_profile_desc', 'Change name, avatar, and personal details'),
        icon: isEditing ? <Close /> : <Edit />,
        primary: !isEditing,
        onClick: isEditing ? handleCancelEditClick : handleStartEdit,
      },
      {
        id: 'change-password',
        label: t('user.profile.change_password', 'Change Password'),
        description: t('user.profile.change_password_desc', 'Update your account credentials'),
        icon: <LockReset />,
        onClick: () => setPasswordDialogOpen(true),
      },
      {
        id: 'change-email',
        label: t('user.profile.change_email', 'Change Email / Verification'),
        description: t('user.profile.change_email_desc', 'Update email or resend verification'),
        icon: <Mail />,
        onClick: () => setEmailDialogOpen(true),
      },
      {
        id: 'linked-accounts',
        label: t('user.profile.linked_accounts', 'Linked Accounts'),
        description: t(
          'user.profile.linked_accounts_desc',
          'Manage Google, GitHub, and SAML SSO connections',
        ),
        icon: <LinkIcon />,
        onClick: () => navigate(Path.account.linkedAccounts),
      },
      {
        id: 'export-data',
        label: t('user.profile.export_data', 'Export Data'),
        description: t(
          'user.profile.export_data_desc',
          'Download a secure JSON copy of your profile',
        ),
        icon: isExporting ? <CircularProgress size={18} color='inherit' /> : <Download />,
        onClick: handleExportData,
      },
      {
        id: 'delete-account',
        label: t('user.profile.delete_account', 'Delete Account'),
        description: t(
          'user.profile.delete_account_desc',
          'Permanently erase your account and all records',
        ),
        icon: <Delete />,
        danger: true,
        onClick: () => setDeleteDialogOpen(true),
      },
    ]

    return actions
  }, [
    isEditing,
    t,
    handleCancelEditClick,
    handleStartEdit,
    navigate,
    isExporting,
    handleExportData,
  ])

  const personalDetailsFields = useMemo(() => {
    const userAny = user as any
    const profile = userAny?.profile || userAny
    const fields = [
      {
        id: 'full-name',
        label: t('user.profile.full_name', 'Full Name'),
        value: displayName,
      },
      {
        id: 'email-address',
        label: t('user.profile.email', 'Email Address'),
        value: user?.email || t('user.profile.not_provided', 'Not provided'),
      },
      {
        id: 'phone',
        label: t('user.profile.phone', 'Phone Number'),
        value:
          user?.phone || userAny?.phoneNumber || t('user.profile.not_provided', 'Not provided'),
      },
      {
        id: 'role',
        label: t('user.profile.role', 'Role'),
        value: user?.role ? String(user.role).replace(/_/g, ' ').toUpperCase() : 'USER',
      },
      {
        id: 'job-title',
        label: t('user.profile.job_title', 'Job Title'),
        value: profile?.jobTitle || t('user.profile.not_provided', 'Not provided'),
      },
      {
        id: 'department',
        label: t('user.profile.department', 'Department'),
        value: profile?.department || t('user.profile.not_provided', 'Not provided'),
      },
      {
        id: 'company',
        label: t('user.profile.company', 'Company'),
        value: profile?.company || t('user.profile.not_provided', 'Not provided'),
      },
      {
        id: 'location',
        label: t('user.profile.location', 'Location'),
        value: profile?.location || t('user.profile.not_provided', 'Not provided'),
      },
      {
        id: 'website',
        label: t('user.profile.website', 'Website'),
        value: profile?.website || t('user.profile.not_provided', 'Not provided'),
      },
      {
        id: 'timezone',
        label: t('user.profile.timezone', 'Timezone'),
        value: String(profile?.timezone || 'UTC').toUpperCase(),
      },
      {
        id: 'created-on',
        label: t('user.profile.created_at', 'Created On'),
        value: formatDate(user?.createdAt),
      },
    ]

    if (profile?.bio || profile?.biography) {
      fields.push({
        id: 'biography',
        label: t('user.profile.bio', 'Biography'),
        value: profile.bio || profile.biography,
      })
    }

    return fields
  }, [t, displayName, user])

  // Loading Skeleton View
  if (isProfileLoading && !user) {
    return (
      <Box
        sx={{
          width: '100%',
          maxWidth: 1280,
          mx: 'auto',
          py: { xs: 2.5, md: 4 },
          px: { xs: 2, sm: 3, md: 4 },
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3.5 }}>
          <Box>
            <Skeleton variant='text' width={220} height={40} />
            <Skeleton variant='text' width={340} height={20} />
          </Box>
          <Skeleton variant='rounded' width={120} height={40} sx={{ borderRadius: '10px' }} />
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card variant='outlined' sx={{ p: 3.5, borderRadius: '16px', mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                <Skeleton variant='circular' width={120} height={120} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant='text' width={180} height={32} />
                  <Skeleton variant='text' width={240} height={20} sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 4 }}>
                      <Skeleton variant='rounded' height={60} sx={{ borderRadius: '12px' }} />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Skeleton variant='rounded' height={60} sx={{ borderRadius: '12px' }} />
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Skeleton variant='rounded' height={60} sx={{ borderRadius: '12px' }} />
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Card>
            <Card variant='outlined' sx={{ p: 3, borderRadius: '16px' }}>
              <Grid container spacing={2.5}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6 }}>
                    <Skeleton variant='rounded' height={56} sx={{ borderRadius: '12px' }} />
                  </Grid>
                ))}
              </Grid>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Card variant='outlined' sx={{ borderRadius: '16px', p: 2 }}>
              <Skeleton variant='text' width={120} height={28} sx={{ m: 1 }} />
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton
                  key={i}
                  variant='rounded'
                  height={52}
                  sx={{ borderRadius: '12px', mb: 1.5 }}
                />
              ))}
            </Card>
          </Grid>
        </Grid>
      </Box>
    )
  }

  return (
    <Box
      component='form'
      onSubmit={handleProfileSubmit(onFormSubmit)}
      noValidate
      sx={{
        width: '100%',
        maxWidth: 1280,
        mx: 'auto',
        py: { xs: 2.5, md: 4 },
        px: { xs: 2, sm: 3, md: 4 },
        boxSizing: 'border-box',
      }}
    >
      {/* ── Page Header ── */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3.5,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant='h4'
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              fontSize: { xs: '1.5rem', sm: '1.875rem' },
              letterSpacing: '-0.025em',
            }}
          >
            {isEditing
              ? t('user.profile.update_profile_title', 'Update Profile')
              : t('user.profile.profile_settings', 'Profile Settings')}
          </Typography>

          <Typography
            variant='body2'
            sx={{
              color: 'text.secondary',
              fontSize: '0.875rem',
              mt: 0.5,
            }}
          >
            {isEditing
              ? t(
                  'user.profile.update_profile_subtitle',
                  'Manage your personal details, preferences, and notification settings.',
                )
              : t(
                  'user.profile.profile_settings_subtitle',
                  'Manage your personal details, preferences, and account controls.',
                )}
          </Typography>
        </Box>

        {/* Top Header Actions */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {isEditing ? (
            <>
              <Button
                onClick={handleCancelEditClick}
                variant='outlined'
                startIcon={<Close sx={{ fontSize: 16 }} />}
                sx={{
                  borderColor: 'divider',
                  color: 'text.primary',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  borderRadius: '10px',
                  px: 2,
                  py: 0.8,
                  backgroundColor: 'background.paper',
                  '&:hover': {
                    borderColor: 'text.secondary',
                    backgroundColor: alpha(theme.palette.action.hover, 0.06),
                  },
                }}
              >
                {t('user.profile.cancel', 'Cancel')}
              </Button>

              <Button
                type='submit'
                variant='contained'
                disabled={updateProfileMutation.isPending || isProfileSubmitting || !isProfileDirty}
                startIcon={
                  updateProfileMutation.isPending || isProfileSubmitting ? (
                    <CircularProgress size={16} color='inherit' />
                  ) : (
                    <Check sx={{ fontSize: 16 }} />
                  )
                }
                sx={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  borderRadius: '10px',
                  px: 2.5,
                  py: 0.8,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
                }}
              >
                {updateProfileMutation.isPending || isProfileSubmitting
                  ? t('user.profile.updating', 'Saving...')
                  : t('user.profile.save_changes', 'Save Changes')}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleStartEdit}
              variant='outlined'
              startIcon={<EditOutlined sx={{ fontSize: 16 }} />}
              sx={{
                borderColor: 'divider',
                color: 'text.primary',
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'none',
                borderRadius: '10px',
                px: 2,
                py: 0.8,
                backgroundColor: 'background.paper',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: 'text.secondary',
                  backgroundColor: alpha(theme.palette.action.hover, 0.06),
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                },
              }}
            >
              {t('user.profile.edit_profile', 'Edit Profile')}
            </Button>
          )}
        </Box>
      </Box>

      {/* ── Dashboard Grid ── */}
      <Grid container spacing={3}>
        {/* Left Column - Identity & Details */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Identity Card */}
            <Card
              variant='outlined'
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: '16px',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'center', sm: 'flex-start' },
                gap: 3,
              }}
            >
              {/* Avatar with Edit Overlay & Remove option */}
              <Box sx={{ position: 'relative', flexShrink: 0, textAlign: 'center' }}>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept={ALLOWED_IMAGE_TYPES.join(',')}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                <Tooltip
                  title={t('user.profile.upload_avatar_hint', 'Click to upload photo (< 5MB)')}
                  arrow
                >
                  <Box
                    sx={{
                      position: 'relative',
                      cursor: uploadAvatarMutation.isPending ? 'wait' : 'pointer',
                      borderRadius: '50%',
                      '&:hover .avatar-overlay': {
                        opacity: 1,
                      },
                    }}
                    onClick={handleAvatarClick}
                  >
                    <Avatar
                      alt={displayName}
                      src={currentAvatarSrc}
                      sx={{
                        width: 120,
                        height: 120,
                        border: 3,
                        borderColor: 'divider',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                      }}
                    />

                    <Box
                      className='avatar-overlay'
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(0, 0, 0, 0.55)',
                        borderRadius: '50%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: uploadAvatarMutation.isPending ? 1 : 0,
                        transition: 'opacity 0.2s ease-in-out',
                        zIndex: zIndexScale.local.above,
                      }}
                    >
                      {uploadAvatarMutation.isPending ? (
                        <CircularProgress size={28} sx={{ color: 'white' }} />
                      ) : (
                        <>
                          <PhotoCamera sx={{ color: 'white', fontSize: 26 }} />
                          <Typography
                            variant='caption'
                            sx={{ color: 'white', fontWeight: 600, fontSize: '0.6875rem', mt: 0.5 }}
                          >
                            {t('user.profile.change', 'Change')}
                          </Typography>
                        </>
                      )}
                    </Box>

                    <IconButton
                      size='small'
                      aria-label={t('user.profile.edit_profile_photo', 'Edit Profile Photo')}
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'primary.main',
                        color: 'white',
                        border: 2,
                        borderColor: 'background.paper',
                        zIndex: zIndexScale.local.overlay,
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                      }}
                    >
                      <Edit sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Tooltip>

                {hasCustomAvatar && (
                  <Button
                    size='small'
                    color='error'
                    onClick={handleRemoveAvatar}
                    disabled={deleteAvatarMutation.isPending}
                    startIcon={
                      deleteAvatarMutation.isPending ? (
                        <CircularProgress size={12} />
                      ) : (
                        <DeleteOutline sx={{ fontSize: 14 }} />
                      )
                    }
                    sx={{
                      mt: 1.5,
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      py: 0.25,
                      px: 1,
                    }}
                  >
                    {t('user.profile.remove_avatar', 'Remove Photo')}
                  </Button>
                )}
              </Box>

              {/* User Info & Stat Pills */}
              <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' }, width: '100%' }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'center', sm: 'center' },
                    justifyContent: 'space-between',
                    mb: 0.5,
                    gap: 1,
                  }}
                >
                  <Typography
                    variant='h5'
                    sx={{
                      fontWeight: 800,
                      color: 'text.primary',
                      letterSpacing: '-0.02em',
                      textTransform: 'capitalize',
                    }}
                  >
                    {displayName}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { xs: 'center', sm: 'flex-start' },
                    gap: 1.5,
                    mb: 2.5,
                    flexWrap: 'wrap',
                  }}
                >
                  <Typography color='text.secondary' variant='body2'>
                    {user?.email || '---'}
                  </Typography>

                  <Chip
                    icon={<Verified sx={{ fontSize: 14 }} />}
                    label={
                      (user as any)?.emailVerified !== false &&
                      (user as any)?.isEmailVerified !== false
                        ? t('user.profile.verified', 'Verified')
                        : t('user.profile.unverified', 'Unverified')
                    }
                    size='small'
                    color={
                      (user as any)?.emailVerified !== false &&
                      (user as any)?.isEmailVerified !== false
                        ? 'success'
                        : 'default'
                    }
                    variant='outlined'
                    sx={{
                      height: 22,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderColor: alpha(theme.palette.success.main, 0.4),
                      bgcolor: alpha(theme.palette.success.main, 0.08),
                      color: 'success.main',
                      '& .MuiChip-icon': {
                        color: 'success.main',
                        ml: 1,
                      },
                    }}
                  />
                </Box>

                {/* Quick Stats Grid */}
                <Grid container spacing={1.5}>
                  {/* Status Column */}
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box
                      sx={{
                        borderRadius: '12px',
                        backgroundColor: alpha(theme.palette.action.hover, 0.04),
                        border: '1px solid',
                        borderColor: 'divider',
                        textAlign: { xs: 'center', sm: 'left' },
                        p: 1.5,
                      }}
                    >
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        fontWeight={700}
                        sx={{
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          display: 'block',
                          mb: 0.5,
                          fontSize: '0.6875rem',
                        }}
                      >
                        {t('user.profile.status', 'Account Status')}
                      </Typography>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          justifyContent: { xs: 'center', sm: 'flex-start' },
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor:
                              user?.status === 'inactive' ||
                              user?.status === 'INACTIVE' ||
                              user?.status === 'suspended' ||
                              user?.status === 'SUSPENDED'
                                ? 'error.main'
                                : 'success.main',
                          }}
                        />

                        <Typography variant='body2' fontWeight={600}>
                          {user?.status === 'inactive' ||
                          user?.status === 'INACTIVE' ||
                          user?.status === 'suspended' ||
                          user?.status === 'SUSPENDED'
                            ? t('user.profile.inactive', 'Inactive')
                            : t('user.profile.active', 'Active')}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Last Activity Column */}
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box
                      sx={{
                        borderRadius: '12px',
                        backgroundColor: alpha(theme.palette.action.hover, 0.04),
                        border: '1px solid',
                        borderColor: 'divider',
                        textAlign: { xs: 'center', sm: 'left' },
                        p: 1.5,
                      }}
                    >
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        fontWeight={700}
                        sx={{
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          display: 'block',
                          mb: 0.5,
                          fontSize: '0.6875rem',
                        }}
                      >
                        {t('user.profile.last_activity', 'Last Active')}
                      </Typography>

                      <Typography variant='body2' fontWeight={600} noWrap>
                        {formatDate(
                          user?.updatedAt || (user as any)?.lastLoginAt || new Date().toISOString(),
                        )}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Created At Column */}
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        backgroundColor: alpha(theme.palette.action.hover, 0.04),
                        border: '1px solid',
                        borderColor: 'divider',
                        textAlign: { xs: 'center', sm: 'left' },
                      }}
                    >
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        fontWeight={700}
                        sx={{
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          display: 'block',
                          mb: 0.5,
                          fontSize: '0.6875rem',
                        }}
                      >
                        {t('user.profile.created_at', 'Member Since')}
                      </Typography>

                      <Typography variant='body2' fontWeight={600} noWrap>
                        {formatDate(user?.createdAt)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Card>

            {/* ── Personal Details Section ── */}
            {isEditing ? (
              /* EDIT MODE: Form Inputs */
              <>
                <Card
                  variant='outlined'
                  sx={{
                    borderRadius: '16px',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                    p: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Person sx={{ color: 'primary.main', fontSize: 22 }} />
                    <Typography variant='subtitle1' fontWeight={700} sx={{ fontSize: '1.0625rem' }}>
                      {t('user.profile.personal_details', 'Personal Details')}
                    </Typography>
                  </Box>

                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name='firstName'
                        control={profileControl}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            fullWidth
                            required
                            label={t('user.profile.first_name', 'First Name')}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name='lastName'
                        control={profileControl}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            fullWidth
                            required
                            label={t('user.profile.last_name', 'Last Name')}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name='displayName'
                        control={profileControl}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            value={field.value || ''}
                            fullWidth
                            label={t('user.profile.display_name', 'Display Name')}
                            placeholder='e.g. Alex Morgan'
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name='phoneNumber'
                        control={profileControl}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            value={field.value || ''}
                            fullWidth
                            label={t('user.profile.phone', 'Phone Number')}
                            placeholder='+1 (555) 000-0000'
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name='email'
                        control={profileControl}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            fullWidth
                            disabled={!isSuperAdmin}
                            label={t('user.profile.email', 'Email Address')}
                            type='email'
                            error={!!fieldState.error}
                            helperText={
                              !isSuperAdmin
                                ? t(
                                    'user.profile.email_change_restricted',
                                    'To change your email address, use the Change Email quick action.',
                                  )
                                : fieldState.error?.message
                            }
                            slotProps={{
                              input: {
                                endAdornment: !isSuperAdmin ? (
                                  <InputAdornment position='end'>
                                    <Lock sx={{ color: 'text.disabled', fontSize: 18 }} />
                                  </InputAdornment>
                                ) : undefined,
                              },
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                bgcolor: !isSuperAdmin
                                  ? alpha(theme.palette.action.disabledBackground, 0.04)
                                  : 'transparent',
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name='jobTitle'
                        control={profileControl}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            value={field.value || ''}
                            fullWidth
                            label={t('user.profile.job_title', 'Job Title')}
                            placeholder='e.g. Lead Platform Engineer'
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name='department'
                        control={profileControl}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            value={field.value || ''}
                            fullWidth
                            label={t('user.profile.department', 'Department')}
                            placeholder='e.g. Engineering / Security'
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name='company'
                        control={profileControl}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            value={field.value || ''}
                            fullWidth
                            label={t('user.profile.company', 'Company')}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name='location'
                        control={profileControl}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            value={field.value || ''}
                            fullWidth
                            label={t('user.profile.location', 'Location')}
                            placeholder='e.g. San Francisco, CA'
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name='website'
                        control={profileControl}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            value={field.value || ''}
                            fullWidth
                            label={t('user.profile.website', 'Website')}
                            placeholder='https://example.com'
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Controller
                        name='bio'
                        control={profileControl}
                        render={({ field, fieldState }) => (
                          <TextField
                            {...field}
                            value={field.value || ''}
                            fullWidth
                            multiline
                            rows={3}
                            label={t('user.profile.bio', 'Biography')}
                            placeholder={t(
                              'user.profile.bio_placeholder',
                              'Tell us a little about your role and background...',
                            )}
                            error={!!fieldState.error}
                            helperText={
                              fieldState.error?.message || `${(field.value || '').length}/500`
                            }
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Card>

                {/* Regional & Preferences Card in Edit Mode */}
                <Card
                  variant='outlined'
                  sx={{
                    borderRadius: '16px',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                    p: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Settings sx={{ color: 'primary.main', fontSize: 22 }} />
                    <Typography variant='subtitle1' fontWeight={700} sx={{ fontSize: '1.0625rem' }}>
                      {t('user.profile.regional_preferences', 'Regional & Preferences')}
                    </Typography>
                  </Box>

                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Controller
                        name='locale'
                        control={profileControl}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel id='profile-lang-label'>
                              {t('user.profile.language', 'Language')}
                            </InputLabel>
                            <Select
                              {...field}
                              labelId='profile-lang-label'
                              label={t('user.profile.language', 'Language')}
                              IconComponent={ExpandMore}
                              sx={{ borderRadius: '12px' }}
                            >
                              {LANGUAGES.map((lang) => (
                                <MenuItem key={lang.value} value={lang.value}>
                                  {lang.title}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Controller
                        name='timezone'
                        control={profileControl}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel id='profile-tz-label'>
                              {t('user.profile.timezone', 'Timezone')}
                            </InputLabel>
                            <Select
                              {...field}
                              labelId='profile-tz-label'
                              label={t('user.profile.timezone', 'Timezone')}
                              IconComponent={ExpandMore}
                              sx={{ borderRadius: '12px' }}
                            >
                              {TIMEZONES.map((tz) => (
                                <MenuItem key={tz.value} value={tz.value}>
                                  {tz.title}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Controller
                        name='dateFormat'
                        control={profileControl}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel id='profile-date-label'>
                              {t('user.profile.date_format', 'Date Format')}
                            </InputLabel>
                            <Select
                              {...field}
                              labelId='profile-date-label'
                              label={t('user.profile.date_format', 'Date Format')}
                              IconComponent={ExpandMore}
                              sx={{ borderRadius: '12px' }}
                            >
                              {DATE_FORMATS.map((df) => (
                                <MenuItem key={df.value} value={df.value}>
                                  {df.title}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                </Card>

                {/* Notifications & Privacy in Edit Mode */}
                <Card
                  variant='outlined'
                  sx={{
                    borderRadius: '16px',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                    p: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <NotificationsNone sx={{ color: 'primary.main', fontSize: 22 }} />
                    <Typography variant='subtitle1' fontWeight={700} sx={{ fontSize: '1.0625rem' }}>
                      {t('user.profile.notifications_privacy', 'Notifications & Preferences')}
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name='emailOnNewDeviceLogin'
                        control={profileControl}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Switch checked={!!field.value} onChange={field.onChange} />}
                            label={
                              <Box>
                                <Typography variant='body2' fontWeight={600}>
                                  {t('user.profile.new_device_alerts', 'New Device Login Alerts')}
                                </Typography>
                                <Typography variant='caption' color='text.secondary'>
                                  {t(
                                    'user.profile.new_device_alerts_desc',
                                    'Receive security alerts whenever an unrecognized device signs in.',
                                  )}
                                </Typography>
                              </Box>
                            }
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name='emailOnComment'
                        control={profileControl}
                        render={({ field }) => (
                          <FormControlLabel
                            control={<Switch checked={!!field.value} onChange={field.onChange} />}
                            label={
                              <Box>
                                <Typography variant='body2' fontWeight={600}>
                                  {t('user.profile.email_notifications', 'System Notifications')}
                                </Typography>
                                <Typography variant='caption' color='text.secondary'>
                                  {t(
                                    'user.profile.email_notifications_desc',
                                    'Receive emails regarding system events, audits, and mentions.',
                                  )}
                                </Typography>
                              </Box>
                            }
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Card>

                {/* Bottom Action Save Bar in Edit Mode */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 1.5,
                    mt: 1,
                  }}
                >
                  <Button
                    onClick={handleCancelEditClick}
                    variant='outlined'
                    sx={{
                      borderColor: 'divider',
                      color: 'text.primary',
                      fontWeight: 600,
                      borderRadius: '10px',
                      px: 3,
                      py: 1,
                      textTransform: 'none',
                    }}
                  >
                    {t('user.profile.cancel', 'Cancel')}
                  </Button>

                  <Button
                    type='submit'
                    variant='contained'
                    disabled={
                      updateProfileMutation.isPending || isProfileSubmitting || !isProfileDirty
                    }
                    startIcon={
                      updateProfileMutation.isPending || isProfileSubmitting ? (
                        <CircularProgress size={16} color='inherit' />
                      ) : (
                        <Check sx={{ fontSize: 16 }} />
                      )
                    }
                    sx={{
                      fontWeight: 600,
                      borderRadius: '10px',
                      px: 3.5,
                      py: 1,
                      textTransform: 'none',
                    }}
                  >
                    {updateProfileMutation.isPending || isProfileSubmitting
                      ? t('user.profile.updating', 'Saving...')
                      : t('user.profile.save_changes', 'Save Changes')}
                  </Button>
                </Box>
              </>
            ) : (
              /* VIEW MODE: Read-Only Grid Cards */
              <Box>
                <Typography
                  variant='subtitle1'
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    fontSize: '1rem',
                    mb: 2,
                  }}
                >
                  {t('user.profile.personal_details', 'Personal Details')}
                </Typography>

                <Grid container spacing={2}>
                  {personalDetailsFields.map((field) => (
                    <Grid key={field.id} size={{ xs: 12, sm: 6 }}>
                      <Card
                        variant='outlined'
                        sx={{
                          p: 2.5,
                          borderRadius: '12px',
                          borderColor: 'divider',
                          backgroundColor: 'background.paper',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                          transition: 'all 0.15s ease-in-out',
                          '&:hover': {
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                          },
                        }}
                      >
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          fontWeight={600}
                          sx={{
                            display: 'block',
                            fontSize: '0.75rem',
                            letterSpacing: 0.2,
                            mb: 0.5,
                          }}
                        >
                          {field.label}
                        </Typography>

                        <Typography
                          variant='body1'
                          fontWeight={600}
                          sx={{
                            color: 'text.primary',
                            fontSize: '0.9375rem',
                            wordBreak: 'break-word',
                          }}
                        >
                          {field.value}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        </Grid>

        {/* Right Column - Quick Actions */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card
            variant='outlined'
            sx={{
              borderRadius: '16px',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                p: 3,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography
                variant='subtitle1'
                sx={{ fontWeight: 700, color: 'text.primary', mb: 0.25 }}
              >
                {t('user.profile.quick_actions', 'Quick Actions')}
              </Typography>

              <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                {t(
                  'user.profile.quick_actions_desc',
                  'Frequently used account controls and updates.',
                )}
              </Typography>
            </Box>

            <List sx={{ p: 1.5 }}>
              {quickActions.map((action, index) => (
                <Box key={action.id}>
                  <ListItem
                    disablePadding
                    sx={{
                      mb: index === quickActions.length - 1 ? 0 : 1,
                    }}
                  >
                    <ListItemButton
                      onClick={action.onClick}
                      sx={{
                        borderRadius: '12px',
                        py: 1.25,
                        px: 1.5,
                        bgcolor: action.danger
                          ? alpha(theme.palette.error.main, 0.04)
                          : 'transparent',
                        border: '1px solid',
                        borderColor: action.danger
                          ? alpha(theme.palette.error.main, 0.18)
                          : 'divider',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          bgcolor: action.danger
                            ? alpha(theme.palette.error.main, 0.1)
                            : alpha(theme.palette.action.hover, 0.06),
                          borderColor: action.danger
                            ? alpha(theme.palette.error.main, 0.35)
                            : 'text.secondary',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 44,
                          color: action.danger
                            ? 'error.main'
                            : action.primary
                              ? 'primary.main'
                              : 'text.secondary',
                        }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '9px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: action.danger
                              ? alpha(theme.palette.error.main, 0.1)
                              : alpha(theme.palette.action.hover, 0.08),
                            '& .MuiSvgIcon-root': {
                              fontSize: 19,
                            },
                          }}
                        >
                          {action.icon}
                        </Box>
                      </ListItemIcon>

                      <ListItemText
                        primary={action.label}
                        secondary={action.description}
                        primaryTypographyProps={{
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: action.danger ? 'error.main' : 'text.primary',
                        }}
                        secondaryTypographyProps={{
                          fontSize: '0.75rem',
                          color: action.danger ? 'error.dark' : 'text.secondary',
                          sx: { mt: 0.25 },
                        }}
                      />

                      {!action.danger && (
                        <ChevronRight sx={{ color: 'text.disabled', fontSize: 18 }} />
                      )}
                    </ListItemButton>
                  </ListItem>

                  {action.id === 'export-data' && (
                    <Box sx={{ height: 1, bgcolor: 'divider', my: 1.5, mx: 1 }} />
                  )}
                </Box>
              ))}
            </List>
          </Card>
        </Grid>
      </Grid>

      {/* ── Change Password Dialog ── */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => {
          if (!changePasswordMutation.isPending) {
            setPasswordDialogOpen(false)
            passwordForm.reset()
          }
        }}
        maxWidth='xs'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 1.5,
            backgroundColor: 'background.paper',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockReset sx={{ color: 'primary.main' }} />
          {t('user.profile.change_password_title', 'Change Password')}
        </DialogTitle>

        <Box
          component='form'
          onSubmit={passwordForm.handleSubmit((values) => changePasswordMutation.mutate(values))}
          noValidate
        >
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <DialogContentText sx={{ fontSize: '0.875rem' }}>
              {t(
                'user.profile.change_password_intro',
                'Ensure your new password contains uppercase, lowercase, numbers, and special symbols.',
              )}
            </DialogContentText>

            <Controller
              name='currentPassword'
              control={passwordForm.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  required
                  type={showCurrentPassword ? 'text' : 'password'}
                  label={t('user.profile.current_password', 'Current Password')}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            size='small'
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            edge='end'
                          >
                            {showCurrentPassword ? (
                              <VisibilityOff fontSize='small' />
                            ) : (
                              <Visibility fontSize='small' />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              )}
            />

            <Controller
              name='newPassword'
              control={passwordForm.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  required
                  type={showNewPassword ? 'text' : 'password'}
                  label={t('user.profile.new_password', 'New Password')}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            size='small'
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            edge='end'
                          >
                            {showNewPassword ? (
                              <VisibilityOff fontSize='small' />
                            ) : (
                              <Visibility fontSize='small' />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              )}
            />

            <Controller
              name='confirmPassword'
              control={passwordForm.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  required
                  type={showConfirmPassword ? 'text' : 'password'}
                  label={t('user.profile.confirm_password', 'Confirm New Password')}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            size='small'
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge='end'
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff fontSize='small' />
                            ) : (
                              <Visibility fontSize='small' />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              )}
            />
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
            <Button
              onClick={() => {
                setPasswordDialogOpen(false)
                passwordForm.reset()
              }}
              variant='outlined'
              disabled={changePasswordMutation.isPending}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
            >
              {t('user.profile.cancel', 'Cancel')}
            </Button>

            <Button
              type='submit'
              variant='contained'
              disabled={changePasswordMutation.isPending}
              startIcon={
                changePasswordMutation.isPending ? (
                  <CircularProgress size={16} color='inherit' />
                ) : (
                  <Check />
                )
              }
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
            >
              {changePasswordMutation.isPending
                ? t('user.profile.updating', 'Updating...')
                : t('user.profile.update_password', 'Update Password')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ── Change Email / Resend Verification Dialog ── */}
      <Dialog
        open={emailDialogOpen}
        onClose={() => {
          if (!requestEmailChangeMutation.isPending && !resendVerificationMutation.isPending) {
            setEmailDialogOpen(false)
            emailForm.reset()
          }
        }}
        maxWidth='xs'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 1.5,
            backgroundColor: 'background.paper',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Mail sx={{ color: 'primary.main' }} />
          {t('user.profile.email_management_title', 'Email & Verification')}
        </DialogTitle>

        <Box
          component='form'
          onSubmit={emailForm.handleSubmit((values) => requestEmailChangeMutation.mutate(values))}
          noValidate
        >
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <Box
              sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: '12px' }}
            >
              <Typography variant='caption' color='text.secondary' fontWeight={600} display='block'>
                {t('user.profile.current_email', 'Current Email')}
              </Typography>
              <Typography variant='body2' fontWeight={700}>
                {user?.email}
              </Typography>
              <Button
                size='small'
                variant='text'
                disabled={resendVerificationMutation.isPending}
                onClick={() => resendVerificationMutation.mutate({ email: user?.email })}
                startIcon={
                  resendVerificationMutation.isPending ? (
                    <CircularProgress size={12} />
                  ) : (
                    <MarkEmailRead sx={{ fontSize: 14 }} />
                  )
                }
                sx={{ mt: 1, textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, p: 0 }}
              >
                {resendVerificationMutation.isPending
                  ? t('user.profile.resending', 'Resending...')
                  : t('user.profile.resend_verification', 'Resend verification link')}
              </Button>
            </Box>

            <Divider />

            <DialogContentText sx={{ fontSize: '0.875rem' }}>
              {t(
                'user.profile.request_new_email_desc',
                'Enter a new email address below. A confirmation email will be sent to complete the update.',
              )}
            </DialogContentText>

            <Controller
              name='newEmail'
              control={emailForm.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  required
                  type='email'
                  label={t('user.profile.new_email_address', 'New Email Address')}
                  placeholder='alex@company.com'
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              )}
            />
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
            <Button
              onClick={() => {
                setEmailDialogOpen(false)
                emailForm.reset()
              }}
              variant='outlined'
              disabled={requestEmailChangeMutation.isPending}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
            >
              {t('user.profile.cancel', 'Cancel')}
            </Button>

            <Button
              type='submit'
              variant='contained'
              disabled={requestEmailChangeMutation.isPending}
              startIcon={
                requestEmailChangeMutation.isPending ? (
                  <CircularProgress size={16} color='inherit' />
                ) : (
                  <Send sx={{ fontSize: 16 }} />
                )
              }
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
            >
              {requestEmailChangeMutation.isPending
                ? t('user.profile.sending', 'Sending...')
                : t('user.profile.send_request', 'Send Request')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ── Unsaved Changes Guard Dialog ── */}
      <Dialog
        open={unsavedChangesDialogOpen}
        onClose={() => setUnsavedChangesDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 1,
            maxWidth: 420,
            backgroundColor: 'background.paper',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            fontWeight: 700,
            color: 'warning.main',
          }}
        >
          <WarningAmber color='warning' />
          {t('user.profile.unsaved_changes_title', 'Unsaved Changes')}
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            {t(
              'user.profile.unsaved_changes_desc',
              'You have modified profile fields that have not been saved yet. If you cancel now, your changes will be discarded.',
            )}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setUnsavedChangesDialogOpen(false)}
            variant='outlined'
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
          >
            {t('user.profile.keep_editing', 'Keep Editing')}
          </Button>

          <Button
            onClick={handleDiscardChanges}
            variant='contained'
            color='warning'
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
          >
            {t('user.profile.discard_changes', 'Discard Changes')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Account Confirmation Dialog ── */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby='delete-account-dialog-title'
        aria-describedby='delete-account-dialog-description'
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 1,
            maxWidth: 440,
            backgroundColor: 'background.paper',
          },
        }}
      >
        <DialogTitle
          id='delete-account-dialog-title'
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            fontWeight: 700,
            color: 'error.main',
          }}
        >
          <WarningAmber color='error' />
          {t('user.profile.delete_account_confirm_title', 'Delete Account Confirmation')}
        </DialogTitle>

        <DialogContent>
          <DialogContentText
            id='delete-account-dialog-description'
            sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
          >
            {t(
              'user.profile.delete_account_confirm_desc',
              'Are you sure you want to proceed to the account deletion page? This action will permanently erase your profile and all associated records.',
            )}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant='outlined'
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}
          >
            {t('user.profile.cancel', 'Cancel')}
          </Button>

          <Button
            onClick={() => {
              setDeleteDialogOpen(false)
              navigate(Path.account.delete)
            }}
            variant='contained'
            color='error'
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
          >
            {t('user.profile.proceed_to_delete', 'Proceed to Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
