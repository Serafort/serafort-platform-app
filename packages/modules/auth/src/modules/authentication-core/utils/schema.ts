import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  rememberMe: z.boolean().default(false).optional(),
})

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'auth.validation.emailRequired' })
    .email({ message: 'auth.validation.emailInvalid' }),
  password: z
    .string()
    .min(8, { message: 'auth.validation.passwordMinLength' })
    .max(100, { message: 'auth.validation.passwordMaxLength' }),
  rememberMe: z.boolean().default(false).optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const mfaCodeSchema = z.object({
  code: z
    .string()
    .length(6, { message: 'auth.validation.mfaInvalidLength' })
    .regex(/^\d+$/, { message: 'auth.validation.mfaNumericOnly' }),
})

export type MfaFormData = z.infer<typeof mfaCodeSchema>

export const RegisterSchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address').min(1, 'Email is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string(),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, 'You must accept the terms of service')
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

const strongPassword = z
  .string()
  .min(8, { message: 'auth.validation.passwordMinLength' })
  .regex(/[A-Z]/, { message: 'auth.validation.passwordUppercase' })
  .regex(/[a-z]/, { message: 'auth.validation.passwordLowercase' })
  .regex(/[0-9]/, { message: 'auth.validation.passwordNumber' })
  .regex(/[^A-Za-z0-9]/, { message: 'auth.validation.passwordSpecial' })

export const SignUpFormSchema = z
  .object({
    firstname: z.string().min(1, { message: 'auth.validation.firstNameRequired' }),
    lastname: z.string().min(1, { message: 'auth.validation.lastNameRequired' }),
    email: z
      .string()
      .min(1, { message: 'auth.validation.emailRequired' })
      .email({ message: 'auth.validation.emailInvalid' }),
    password: strongPassword,
    confirmPassword: z.string().min(1, { message: 'auth.validation.confirmPasswordRequired' }),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'auth.validation.acceptTerms',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth.validation.passwordsMustMatch',
    path: ['confirmPassword'],
  })

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
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

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'auth.validation.emailRequired' })
    .email({ message: 'auth.validation.emailInvalid' }),
})

export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const ChangePhoneSchema = z.object({
  phone: z.string().min(6, 'Please enter a valid phone number'),
  password: z.string().min(1, 'Password is required'),
})

export const DeactivateAccountSchema = z.object({
  desactivate: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm account deactivation' }),
  }),
})

export const SsoIdentifierSchema = z.object({
  sso_identifier: z.string().min(1, 'SSO identifier or corporate email is required'),
})

export const DetailedProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address'),
  biography: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  location: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  company: z.string().optional(),
  language: z.string().default('en-us'),
  timezone: z.string().default('pst'),
  dateFormat: z.string().default('mm-dd-yyyy'),
  emailOnComment: z.boolean().default(true),
  emailOnCommentReply: z.boolean().default(true),
  emailOnAchievement: z.boolean().default(true),
  emailOnNewDeviceLogin: z.boolean().default(true),
  emailOnWatchlist: z.boolean().default(true),
  emailOnMention: z.boolean().default(true),
})

export const normalizePhone = (phone: string): string => {
  if (!phone) return ''
  const trimmed = phone.trim()
  const hasPlus = trimmed.startsWith('+')
  const digits = trimmed.replace(/\D/g, '')
  return hasPlus ? `+${digits}` : digits
}

export const normalizeDomain = (domain: string): string => {
  if (!domain) return ''
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
}

export const normalizeCidr = (cidr: string): string => {
  if (!cidr) return ''
  return cidr.trim().replace(/[^\d.a-fA-F:/]/g, '')
}

export const DomainVerificationSchema = z.object({
  domain: z
    .string()
    .min(1, 'Domain name is required')
    .transform(normalizeDomain)
    .refine(
      (val) => /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(val),
      'Please enter a valid domain name (e.g. company.com)',
    ),
})

export const CidrBlockSchema = z.object({
  cidr: z
    .string()
    .min(1, 'IP or CIDR is required')
    .transform(normalizeCidr)
    .refine(
      (val) =>
        /^(\d{1,3}\.){3}\d{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/.test(val) ||
        /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}(\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$/.test(
          val,
        ),
      'Please enter a valid IPv4/IPv6 address or CIDR range (e.g. 192.168.1.1 or 10.0.0.0/24)',
    ),
})

export type DomainVerificationSchemaType = z.infer<typeof DomainVerificationSchema>
export type CidrBlockSchemaType = z.infer<typeof CidrBlockSchema>
export type LoginSchemaType = z.infer<typeof LoginSchema>
export type RegisterSchemaType = z.infer<typeof RegisterSchema>
export type SignUpFormSchemaType = z.infer<typeof SignUpFormSchema>
export type ChangePasswordSchemaType = z.infer<typeof ChangePasswordSchema>
export type ChangeEmailSchemaType = z.infer<typeof ChangeEmailSchema>
export type UpdateProfileSchemaType = z.infer<typeof UpdateProfileSchema>
export type DetailedProfileSchemaType = z.infer<typeof DetailedProfileSchema>
export type ForgotPasswordSchemaType = z.infer<typeof ForgotPasswordSchema>
export type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>
export type ChangePhoneSchemaType = z.infer<typeof ChangePhoneSchema>
export type DeactivateAccountSchemaType = z.infer<typeof DeactivateAccountSchema>
export type SsoIdentifierSchemaType = z.infer<typeof SsoIdentifierSchema>
