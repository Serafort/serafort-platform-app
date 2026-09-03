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

        const response = await apiClient.get<TenantThemeConfig>(`/api/admin/organizations/${orgId}/styles`, requestOptions);
        if (response.status === 304) return null; // Not modified
        if (!response.data) throw new Error('Failed to fetch tenant theme');
        return response.data;
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
    const response = await apiClient.post(`/api/admin/organizations/${theme.organizationId}/styles`, theme)
    // Check if the request was successful
    if (response.status >= 300) {
      throw new Error('Failed to save tenant theme')
    }
  }
}

export default themeService;
