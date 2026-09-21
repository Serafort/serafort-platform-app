import { apiClient, type FetchResponse } from "@cap/platform-store";
import { ENDPOINTS } from "@cap/api-contracts";

export interface DashboardLayoutResponse {
  isCustom: boolean;
  scope: "user" | "role" | "organization" | "default";
  id?: number;
  pageId: string;
  organizationId?: number;
  userId?: number | null;
  layoutConfig: any;
  updatedAt?: string;
}

export interface DashboardStats {
  organizationName: string | null;
  roleName: string | null;
  isPlatformOwner: boolean;
  activeSessions: number;
  mfaEnabled: boolean;
  passkeyCount: number;
  lastLogin: string | null;
  recentActivity: Array<{ action: string; date: string; ip: string | null }>;
}

export interface TenantOverview {
  organizationName: string;
  memberCount: number;
  membersByRole: Array<{ role: string; count: number }>;
  activeSessions: number;
  failedLoginsToday: number;
  recentEvents: Array<{ action: string; date: string }>;
}

export type TenantRegion = "US" | "EU" | "OTHER" | "UNKNOWN";

export interface TenantJurisdiction {
  region: TenantRegion;
  countryCode: string | null;
  usState: string | null;
  /** Governing privacy regime (e.g. GDPR, CCPA / CPRA); null when none on file. */
  regulation: string | null;
  hasComprehensiveLaw: boolean;
}

export interface PlatformOverview {
  tenants: {
    total: number;
    active: number;
    newLast30Days: number;
    newPrevious30Days: number;
  };
  people: {
    members: number;
    distinctMembers: number;
    users: number;
    activeUsers: number;
    mfaAdoptionPercent: number;
    usersWithoutMfa: number;
  };
  growth: Array<{ month: string; newTenants: number; newUsers: number }>;
  geography: {
    byRegion: Array<{ region: TenantRegion; tenants: number; members: number }>;
    usStates: Array<{
      state: string;
      regulation: string | null;
      tenants: number;
      members: number;
    }>;
    regulation: {
      tenantsWithLaw: number;
      tenantsWithoutLaw: number;
      tenantsUnknown: number;
    };
  };
  risk: { failedLoginsLast7Days: number; activeSessions: number };
  topTenants: Array<{
    id: string;
    name: string;
    slug: string;
    plan: string;
    status: string;
    members: number;
    createdAt: string;
    jurisdiction: TenantJurisdiction;
  }>;
}

export class DashboardService {
  /** The signed-in user's own security posture, organization and role. */
  async getStats(signal?: AbortSignal): Promise<DashboardStats> {
    const res = await apiClient.get<DashboardStats>(ENDPOINTS.dashboard.stats, {
      signal,
    });
    return res.data;
  }

  /** Cross-tenant numbers for the platform owner (super admins only). */
  async getPlatformOverview(signal?: AbortSignal): Promise<PlatformOverview> {
    const res = await apiClient.get<PlatformOverview>(
      ENDPOINTS.dashboard.platformOverview,
      { signal },
    );
    return res.data;
  }

  /** Headline numbers for the caller's organization (organization admins only). */
  async getTenantOverview(signal?: AbortSignal): Promise<TenantOverview> {
    const res = await apiClient.get<TenantOverview>(
      ENDPOINTS.dashboard.tenantOverview,
      { signal },
    );
    return res.data;
  }

  /**
   * Get the layout for a given dashboard page (user override -> org default -> system default)
   */
  async getLayout(
    pageId: string = "dashboard",
    orgId?: string | number,
  ): Promise<FetchResponse<DashboardLayoutResponse>> {
    const headers = orgId ? { "x-organization-id": String(orgId) } : undefined;
    return apiClient.get<DashboardLayoutResponse>(
      ENDPOINTS.dashboards.layouts(pageId),
      {
        headers,
      },
    );
  }

  /**
   * Save layout configuration for user or organization
   */
  async saveLayout(
    pageId: string = "dashboard",
    data: {
      layoutConfig: unknown;
      name?: string;
      isDefault?: boolean;
      scope?: "user" | "organization";
    },
    orgId?: string | number,
  ): Promise<FetchResponse<{ success: boolean; layout: unknown }>> {
    const headers = orgId ? { "x-organization-id": String(orgId) } : undefined;
    return apiClient.put<{ success: boolean; layout: unknown }>(
      ENDPOINTS.dashboards.updateLayout(pageId),
      data,
      { headers },
    );
  }

  /**
   * Reset custom user layout to organization/system default
   */
  async resetLayout(
    pageId: string = "dashboard",
    orgId?: string | number,
  ): Promise<FetchResponse<{ success: boolean; message: string }>> {
    const headers = orgId ? { "x-organization-id": String(orgId) } : undefined;
    return apiClient.post<{ success: boolean; message: string }>(
      ENDPOINTS.dashboards.resetLayout(pageId),
      {},
      { headers },
    );
  }
}

export const dashboardService = new DashboardService();
