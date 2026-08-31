// userDirectory.schema.ts
// Zod Validation Schemas for User Directory Module

import { z } from 'zod'

const phoneRegex = /^([+]?[\s0-9().-]{7,25})?$/

/**
 * Invite / Create Single User Schema
 */
export const inviteUserSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
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
  roleIds: z.array(z.number()).min(1, 'At least one role must be assigned'),
  department: z
    .string()
    .trim()
    .max(100, 'Department cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  jobTitle: z
    .string()
    .trim()
    .max(100, 'Job title cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  sendInviteEmail: z.boolean(),
  temporaryPassword: z
    .string()
    .min(8, 'Temporary password must be at least 8 characters')
    .optional()
    .or(z.literal('')),
})

export type InviteUserFormData = z.infer<typeof inviteUserSchema>

/**
 * Bulk Invite Users Schema
 */
export const bulkInviteUserSchema = z.object({
  emails: z
    .string()
    .trim()
    .min(1, 'Please enter at least one email address')
    .refine((val) => {
      const emailList = val
        .split(/[,\n;]+/)
        .map((e) => e.trim())
        .filter(Boolean)
      if (emailList.length === 0) return false
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailList.every((e) => emailRegex.test(e))
    }, 'One or more email addresses are invalid'),
  roleIds: z.array(z.number()).min(1, 'At least one role must be assigned to invited users'),
  department: z.string().trim().optional().or(z.literal('')),
  sendInviteEmail: z.boolean(),
})

export type BulkInviteUserFormData = z.infer<typeof bulkInviteUserSchema>

/**
 * Edit User Schema
 */
export const editUserSchema = z.object({
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
    .url('Please enter a valid URL')
    .optional()
    .nullable()
    .or(z.literal('')),
  bio: z
    .string()
    .trim()
    .max(500, 'Bio cannot exceed 500 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  timezone: z.string(),
  locale: z.string(),
  dateFormat: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED']),
  roleIds: z.array(z.number()).optional(),
})

export type EditUserFormData = z.infer<typeof editUserSchema>

/**
 * Assign Roles Schema
 */
export const assignRolesSchema = z.object({
  roleIds: z.array(z.number()).min(1, 'Select at least one role to assign'),
  reason: z
    .string()
    .trim()
    .max(250, 'Reason cannot exceed 250 characters')
    .optional()
    .or(z.literal('')),
  effectiveDate: z.string().optional(),
})

export type AssignRolesFormData = z.infer<typeof assignRolesSchema>

/**
 * Update User Status Schema
 */
export const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED']),
  reason: z
    .string()
    .trim()
    .min(3, 'A reason is required for status changes')
    .max(300, 'Reason cannot exceed 300 characters'),
})

export type UpdateUserStatusFormData = z.infer<typeof updateUserStatusSchema>

/**
 * Delete User Schema
 */
export const deleteUserSchema = z.object({
  confirmationPhrase: z.string().optional(),
  reason: z
    .string()
    .trim()
    .max(300, 'Reason cannot exceed 300 characters')
    .optional()
    .or(z.literal('')),
  hardDelete: z.boolean().optional(),
})

export type DeleteUserFormData = z.infer<typeof deleteUserSchema>

/**
 * Bulk Action Schema
 */
export const bulkActionSchema = z.object({
  action: z.enum(['ACTIVATE', 'DEACTIVATE', 'SUSPEND', 'DELETE', 'RESEND_INVITE', 'ASSIGN_ROLE']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED']).optional(),
  roleId: z.number().optional(),
  reason: z
    .string()
    .trim()
    .max(300, 'Reason cannot exceed 300 characters')
    .optional()
    .or(z.literal('')),
})

export type BulkActionFormData = z.infer<typeof bulkActionSchema>

/**
 * Filter Params Validation Schema
 */
export const userFiltersSchema = z.object({
  page: z.number().int().positive(),
  perPage: z.number().int().positive(),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED', 'ALL', '']).optional(),
  role: z.union([z.string(), z.number()]).optional(),
  tenantId: z.union([z.string(), z.number()]).optional(),
  department: z.string().optional(),
  sortBy: z.string(),
  sortOrder: z.enum(['asc', 'desc']),
})

export type UserFiltersFormData = z.infer<typeof userFiltersSchema>
