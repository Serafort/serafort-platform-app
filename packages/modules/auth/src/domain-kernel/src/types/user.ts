import type { UserId, OrganizationId, RoleId } from './identifiers';
import type { Role } from './authorization';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'SUSPENDED' | 'PENDING'

export interface User {
  id: UserId
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string
  status: UserStatus
  emailVerified: boolean
  mfaEnabled: boolean
  mfaEnrolledAt?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt?: string
  roleId?: RoleId
  role?: Role
  organizationId?: OrganizationId
}

export interface UserProfile {
  userId: UserId
  phone?: string
  sexe?: string
  locale?: string
  timezone?: string
  preferences?: Record<string, unknown>
}

export interface Organization {
  id: OrganizationId
  name: string
  slug: string
  domain?: string
  logoUrl?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt?: string
  membersCount?: number
}

export interface OrganizationMember {
  id: string
  userId: UserId
  organizationId: OrganizationId
  role: string
  user: {
    id: UserId
    email: string
    firstName: string
    lastName: string
    avatarUrl?: string
  }
  joinedAt: string
}

export interface OrganizationInvitation {
  id: string
  email: string
  role: string
  organizationId: OrganizationId
  status: 'pending' | 'accepted' | 'expired'
  expiresAt: string
  createdAt: string
}
