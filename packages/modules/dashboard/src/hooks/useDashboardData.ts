import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@cap/api-contracts";
import { dashboardService } from "@cap/auth-contracts";

/** The signed-in user's security posture, organization and role. */
export const useDashboardStats = () =>
  useQuery({
    queryKey: QUERY_KEYS.dashboard.stats,
    queryFn: ({ signal }) => dashboardService.getStats(signal),
  });

/** Numbers for the caller's own organization (organization admins only). */
export const useTenantOverview = () =>
  useQuery({
    queryKey: QUERY_KEYS.dashboard.tenantOverview,
    queryFn: ({ signal }) => dashboardService.getTenantOverview(signal),
    retry: false,
  });

/** Cross-tenant numbers for the platform owner; shared by all platform widgets. */
export const usePlatformOverview = () =>
  useQuery({
    queryKey: QUERY_KEYS.dashboard.platformOverview,
    queryFn: ({ signal }) => dashboardService.getPlatformOverview(signal),
    retry: false,
  });
