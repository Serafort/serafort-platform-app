/**
 * Auto-generated / synchronized from Authentication backend.
 * Source: Authentication/app/contracts/dtos/organization_dto.ts
 * DO NOT EDIT DIRECTLY - Use scripts/sync-contracts.mjs
 */

/**
 * Organization & Tenant DTOs
 * Aligned with @cap/shared-types and @cap/auth-contracts.
 */

export interface DomainVerificationDTO {
  id: string
  domain: string
  status: 'pending' | 'verified' | 'failed'
  verificationToken?: string
  verifiedAt?: string | null
}

export interface OrganizationMemberDTO {
  id: string
  userId: string
  organizationId: string
  role: string
  user?: {
    id: string
    email: string
    fullName?: string
    firstName?: string
    lastName?: string
    avatarUrl?: string | null
  }
  joinedAt?: string
}

export interface OrganizationMembershipDTO {
  id: string
  user_id: string
  organization_id: string
  role_id: string
  organization?: {
    id: string
    name: string
    slug: string
  }
}

export interface OrganizationInvitationDTO {
  id: string | string
  email: string
  role: string
  organizationId: string
  status: 'pending' | 'accepted' | 'expired' | 'declined'
  expiresAt: string
  createdAt: string
}

export interface OrganizationDTO {
  id: string
  name: string
  slug: string
  domain?: string | null
  status?: string
  supportEmail?: string | null
  support_email?: string | null
  logoUrl?: string | null
  logo_url?: string | null
  membersCount?: number
  members_count?: number
  domainVerifications?: DomainVerificationDTO[]
  createdAt?: string
  updatedAt?: string
  members?: OrganizationMemberDTO[]
}

export interface CreateOrganizationDTO {
  name: string
  slug: string
  domain?: string
}

export interface UpdateOrganizationDTO {
  name?: string
  slug?: string
  domain?: string
  supportEmail?: string
}

export interface InviteOrganizationMemberDTO {
  email: string
  role: string
  message?: string
}
