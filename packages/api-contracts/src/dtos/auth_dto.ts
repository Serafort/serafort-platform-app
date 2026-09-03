/**
 * Auto-generated / synchronized from Authentication backend.
 * Source: Authentication/app/contracts/dtos/auth_dto.ts
 * DO NOT EDIT DIRECTLY - Use scripts/sync-contracts.mjs
 */

/**
 * Authentication DTOs
 * Aligned with @cap/shared-types and @cap/module-auth.
 */

export interface LoginRequestDTO {
  email?: string;
  username?: string;
  password?: string;
  remember?: boolean;
  tenantId?: string | number;
  twoFactorCode?: string;
  turnstileToken?: string;
  recaptchaToken?: string;
}

export interface RegisterRequestDTO {
  email: string;
  password?: string;
  firstName?: string;
  firstname?: string;
  lastName?: string;
  lastname?: string;
  username?: string;
  phone?: string;
  tenantId?: string | number;
  isTermsSign?: boolean;
}

export interface ForgotPasswordRequestDTO {
  email: string;
}

export interface ResetPasswordRequestDTO {
  email: string;
  token: string;
  password?: string;
  newPassword?: string;
}

export interface VerifyEmailRequestDTO {
  email: string;
  token: string;
}

export interface ResendVerificationRequestDTO {
  email: string;
}

export interface PasswordlessSendDTO {
  email: string;
  tenantId?: string | number;
  redirectUrl?: string;
}

export interface PasswordlessVerifyDTO {
  token: string;
}

export interface PasskeyRegisterStartDTO {
  userId?: number;
}

export interface PasskeyRegisterFinishDTO {
  userId?: number;
  credential: unknown;
}

export interface PasskeyLoginStartDTO {
  email?: string;
  tenantId?: string | number;
}

export interface PasskeyLoginFinishDTO {
  response: unknown;
}

export interface RefreshTokenRequestDTO {
  refreshToken?: string;
}

export interface AuthSessionDTO {
  id: number;
  userId: number;
  ipAddress?: string | null;
  userAgent?: string | null;
  browser?: string;
  device?: string;
  location?: string;
  isActive: boolean;
  loginAt?: string | null;
  lastTouchedAt?: string | null;
}
