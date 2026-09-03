import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  rememberMe: z.boolean().optional(),
})

export const RegisterSchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address').min(1, 'Email is required'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const ChangeEmailSchema = z.object({
  newEmail: z.string().email('Invalid email address').min(1, 'New email is required'),
  password: z.string().min(1, 'Password is required to change email'),
})

export const UpdateProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
  location: z.string().optional(),
  socialLinks: z
    .object({
      twitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
      github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
      linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
    })
    .optional(),
})

export type LoginSchemaType = z.infer<typeof LoginSchema>
export type RegisterSchemaType = z.infer<typeof RegisterSchema>
export type ChangePasswordSchemaType = z.infer<typeof ChangePasswordSchema>
export type ChangeEmailSchemaType = z.infer<typeof ChangeEmailSchema>
export type UpdateProfileSchemaType = z.infer<typeof UpdateProfileSchema>
