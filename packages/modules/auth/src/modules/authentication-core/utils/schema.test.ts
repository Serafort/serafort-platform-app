import { describe, it, expect } from 'vitest'
import {
  LoginSchema,
  RegisterSchema,
  ChangePasswordSchema,
  ChangeEmailSchema,
  UpdateProfileSchema,
} from '../utils/schema'

// ---------------------------------------------------------------------------
// LoginSchema
// ---------------------------------------------------------------------------
describe('LoginSchema', () => {
  it('passes with valid email and password', () => {
    const result = LoginSchema.safeParse({ email: 'user@example.com', password: 'Password123!' })
    expect(result.success).toBe(true)
  })

  it('passes with rememberMe flag', () => {
    const result = LoginSchema.safeParse({
      email: 'user@example.com',
      password: 'Password123!',
      rememberMe: true,
    })
    expect(result.success).toBe(true)
  })

  it('fails with invalid email format', () => {
    const result = LoginSchema.safeParse({ email: 'not-an-email', password: 'Password123!' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('email')
  })

  it('fails with empty email', () => {
    const result = LoginSchema.safeParse({ email: '', password: 'Password123!' })
    expect(result.success).toBe(false)
  })

  it('fails with password shorter than 8 characters', () => {
    const result = LoginSchema.safeParse({ email: 'user@example.com', password: 'short' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('password')
  })

  it('fails when required fields are missing', () => {
    const result = LoginSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// RegisterSchema
// ---------------------------------------------------------------------------
describe('RegisterSchema', () => {
  const validPayload = {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    password: 'SecurePass1!',
    confirmPassword: 'SecurePass1!',
  }

  it('passes with valid registration data', () => {
    const result = RegisterSchema.safeParse(validPayload)
    expect(result.success).toBe(true)
  })

  it('fails when passwords do not match', () => {
    const result = RegisterSchema.safeParse({ ...validPayload, confirmPassword: 'different' })
    expect(result.success).toBe(false)
    const confirmError = result.error?.issues.find((i) => i.path.includes('confirmPassword'))
    expect(confirmError?.message).toBe("Passwords don't match")
  })

  it('fails with fullName shorter than 2 characters', () => {
    const result = RegisterSchema.safeParse({ ...validPayload, fullName: 'J' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('fullName')
  })

  it('fails with invalid email', () => {
    const result = RegisterSchema.safeParse({ ...validPayload, email: 'bad' })
    expect(result.success).toBe(false)
  })

  it('fails with password shorter than 8 characters', () => {
    const result = RegisterSchema.safeParse({
      ...validPayload,
      password: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// ChangePasswordSchema
// ---------------------------------------------------------------------------
describe('ChangePasswordSchema', () => {
  const validPayload = {
    currentPassword: 'OldPassword1!',
    newPassword: 'NewPassword1!',
    confirmPassword: 'NewPassword1!',
  }

  it('passes with valid password change data', () => {
    const result = ChangePasswordSchema.safeParse(validPayload)
    expect(result.success).toBe(true)
  })

  it('fails when new passwords do not match', () => {
    const result = ChangePasswordSchema.safeParse({ ...validPayload, confirmPassword: 'mismatch' })
    expect(result.success).toBe(false)
    const confirmError = result.error?.issues.find((i) => i.path.includes('confirmPassword'))
    expect(confirmError?.message).toBe("Passwords don't match")
  })

  it('fails with empty currentPassword', () => {
    const result = ChangePasswordSchema.safeParse({ ...validPayload, currentPassword: '' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('currentPassword')
  })

  it('fails with newPassword shorter than 8 characters', () => {
    const result = ChangePasswordSchema.safeParse({
      ...validPayload,
      newPassword: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// ChangeEmailSchema
// ---------------------------------------------------------------------------
describe('ChangeEmailSchema', () => {
  it('passes with valid data', () => {
    const result = ChangeEmailSchema.safeParse({
      newEmail: 'new@example.com',
      password: 'Password123!',
    })
    expect(result.success).toBe(true)
  })

  it('fails with invalid newEmail', () => {
    const result = ChangeEmailSchema.safeParse({
      newEmail: 'invalid-email',
      password: 'Password123!',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('newEmail')
  })

  it('fails with empty password', () => {
    const result = ChangeEmailSchema.safeParse({
      newEmail: 'new@example.com',
      password: '',
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toContain('password')
  })
})

// ---------------------------------------------------------------------------
// UpdateProfileSchema
// ---------------------------------------------------------------------------
describe('UpdateProfileSchema', () => {
  it('passes with valid name and optional avatar', () => {
    const result = UpdateProfileSchema.safeParse({
      fullName: 'John Smith',
      avatarUrl: 'https://example.com/avatar.jpg',
    })
    expect(result.success).toBe(true)
  })

  it('passes without avatarUrl', () => {
    const result = UpdateProfileSchema.safeParse({
      fullName: 'John Smith',
    })
    expect(result.success).toBe(true)
  })

  it('fails with empty fullName', () => {
    const result = UpdateProfileSchema.safeParse({
      fullName: '',
    })
    expect(result.success).toBe(false)
  })
})
