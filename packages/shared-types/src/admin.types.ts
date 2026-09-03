import type { UserDto, UserStatus, AnyRole } from './auth';

export interface AdminOrganization {
  id: number
  name: string
  slug: string
  status: string
  createdAt: string
  updatedAt: string
  ownerId: number
  domain?: string
  members?: unknown[]
  members_count?: number
  domainVerifications?: unknown[]
  brandingConfig?: Record<string, unknown>
  securityPolicies?: Record<string, unknown>
}

export interface BanAppeal {
  id: number
  userId: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  resolvedAt?: string
}

export interface DataExport {
  id: number
  userId: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  created_at: string
  expires_at?: string
  download_url?: string
}

export interface DataExportRequest {
  userId: number
  format?: 'json' | 'csv'
  includeActivity?: boolean
  includeProfile?: boolean
}

export interface AuditLog {
  id: number
  actor_id: number
  user_id: number
  action: string
  resource_type: string
  resource_id: number
  metadata: unknown
  travel_logs?: unknown[]
  created_at: string
}

export interface ActivityTimelineResponse {
  logs: AuditLog[]
}

export interface ExportParams {
  format?: string
  type?: string
  startDate?: string
  endDate?: string
}

export interface AdminUserDto extends Omit<UserDto, 'role' | 'status'> {
  role?: AnyRole | number
  status?: UserStatus | string
}

export type User = AdminUserDto

export interface UserQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  role?: string
}

export interface UserMfa {
  enabled: boolean
  factors?: unknown[]
  verified_at?: string
}

export interface MemberOverride {
  id: number
  memberId: number
  permissionId: number
  grant: boolean
  permission?: {
    id: number
    name: string
    resource: string
  }
}

export interface CreateUserRequest {
  email: string
  firstName?: string
  lastName?: string
  password?: string
  role?: number
  status?: string
  orgId?: number
}

export interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  email?: string
  role?: number
  status?: string
  phone?: string
  mfaEnabled?: boolean
  apiAccessEnabled?: boolean
  maintenanceModeBypass?: boolean
}
