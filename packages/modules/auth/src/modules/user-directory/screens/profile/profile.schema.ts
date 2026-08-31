import { z } from 'zod'

/**
 * Phone number regex supporting international formats (E.164 and standard notation)
 */
const phoneRegex = /^([+]?[\s0-9().-]{7,25})?$/

/**
 * Zod validation schema matching UpdateProfileRequestDTO
 */
export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(50, 'First name cannot exceed 50 characters'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(50, 'Last name cannot exceed 50 characters'),
  displayName: z
    .string()
    .trim()
    .max(100, 'Display name cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  phoneNumber: z
    .string()
    .trim()
    .regex(phoneRegex, 'Please enter a valid phone number')
    .max(25, 'Phone number cannot exceed 25 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  jobTitle: z
    .string()
    .trim()
    .max(100, 'Job title cannot exceed 100 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  department: z
    .string()
    .trim()
    .max(100, 'Department cannot exceed 100 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  company: z
    .string()
    .trim()
    .max(100, 'Company cannot exceed 100 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  location: z
    .string()
    .trim()
    .max(150, 'Location cannot exceed 150 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  website: z
    .string()
    .trim()
    .url('Please enter a valid URL (e.g. https://example.com)')
    .optional()
    .nullable()
    .or(z.literal('')),
  timezone: z.string(),
  locale: z.string(),
  dateFormat: z.string(),
  bio: z
    .string()
    .trim()
    .max(500, 'Bio cannot exceed 500 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  emailOnNewDeviceLogin: z.boolean(),
  emailOnComment: z.boolean(),
  emailOnCommentReply: z.boolean(),
  emailOnAchievement: z.boolean(),
  emailOnWatchlist: z.boolean(),
  emailOnMention: z.boolean(),
})

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>

/**
 * Base Zod validation schema for Change Password
 */
export const changePasswordBaseSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters long')
    .max(128, 'New password cannot exceed 128 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
})

/**
 * Zod validation schema for Change Password with refinements
 */
export const changePasswordSchema = changePasswordBaseSchema
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })

export type ChangePasswordFormData = z.infer<typeof changePasswordBaseSchema>

/**
 * Zod validation schema for Request Email Change
 */
export const requestEmailChangeSchema = z.object({
  newEmail: z
    .string()
    .trim()
    .min(1, 'New email address is required')
    .email('Please enter a valid email address'),
})

export type RequestEmailChangeFormData = z.infer<typeof requestEmailChangeSchema>
