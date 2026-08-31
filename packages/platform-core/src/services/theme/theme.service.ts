import { apiClient } from '@cap/platform-store'
import type { TenantThemeConfig } from '@cap/theme'

const pendingRequests = new Map<string, Promise<TenantThemeConfig | null>>();

export const themeService = {
  /**
   * Fetches the styles (theme configuration) for a given organization.
   */
  getTheme: async (orgId: string, currentVersion?: string): Promise<TenantThemeConfig | null> => {
    const cacheKey = `${orgId}-${currentVersion || 'newest'}`;
    
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey)!;
    }

    const requestPromise = (async () => {
      try {
        const requestOptions: any = {};
        if (currentVersion) {
          requestOptions.headers = { 'If-None-Match': `W/"${currentVersion}"` };
        }
        
        const orgQuery = orgId && orgId !== 'default' && orgId !== 'current' ? `?orgId=${orgId}` : '';
        try {
          const response = await apiClient.get<any>(`/api/v1/themes/tenant${orgQuery}`, requestOptions);
          if (response.status === 304) return null;
          if (response.data) {
            return response.data.themeConfig || response.data;
          }
        } catch {
          // Fallback to legacy organization styles endpoint
          const response = await apiClient.get<TenantThemeConfig>(`/api/admin/organizations/${orgId}/styles`, requestOptions);
          if (response.status === 304) return null;
          if (!response.data) throw new Error('Failed to fetch tenant theme');
          return response.data;
        }
        return null;
      } catch (err: any) {
        if (err.response?.status === 304) return null;
        throw err;
      } finally {
        pendingRequests.delete(cacheKey);
      }
    })();

    pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  },

  /**
   * Saves or updates the theme configuration for an organization.
   */
  saveTheme: async (theme: TenantThemeConfig): Promise<void> => {
    const orgQuery = theme.organizationId && theme.organizationId !== 'default' && theme.organizationId !== 'current'
      ? `?orgId=${theme.organizationId}`
      : '';
    try {
      const response = await apiClient.put(`/api/v1/themes/tenant${orgQuery}`, {
        themeConfig: theme,
        isDark: theme.metadata?.mode === 'dark',
      });
      if (response.status < 300) return;
    } catch {
      // Fallback to legacy organization styles endpoint
      const response = await apiClient.post(`/api/admin/organizations/${theme.organizationId || 'default'}/styles`, theme);
      if (response.status >= 300) {
        throw new Error('Failed to save tenant theme');
      }
    }
  }
}

export default themeService;
