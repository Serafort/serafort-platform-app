import { apiClient, type FetchResponse } from '@cap/platform-store'
import { ENDPOINTS } from '@cap/api-contracts'

export interface DashboardLayoutResponse {
  isCustom: boolean
  scope: 'user' | 'organization' | 'default'
  id?: number
  pageId: string
  organizationId?: number
  userId?: number | null
  layoutConfig: any
  updatedAt?: string
}

export class DashboardService {
  /**
   * Get the layout for a given dashboard page (user override -> org default -> system default)
   */
  async getLayout(
    pageId: string = 'dashboard',
    orgId?: string | number
  ): Promise<FetchResponse<DashboardLayoutResponse>> {
    const headers = orgId ? { 'x-organization-id': String(orgId) } : undefined
    return apiClient.get<DashboardLayoutResponse>(ENDPOINTS.dashboards.layouts(pageId), {
      headers,
    })
  }

  /**
   * Save layout configuration for user or organization
   */
  async saveLayout(
    pageId: string = 'dashboard',
    data: {
      layoutConfig: unknown
      name?: string
      isDefault?: boolean
      scope?: 'user' | 'organization'
    },
    orgId?: string | number
  ): Promise<FetchResponse<{ success: boolean; layout: unknown }>> {
    const headers = orgId ? { 'x-organization-id': String(orgId) } : undefined
    return apiClient.put<{ success: boolean; layout: unknown }>(
      ENDPOINTS.dashboards.updateLayout(pageId),
      data,
      { headers }
    )
  }

  /**
   * Reset custom user layout to organization/system default
   */
  async resetLayout(
    pageId: string = 'dashboard',
    orgId?: string | number
  ): Promise<FetchResponse<{ success: boolean; message: string }>> {
    const headers = orgId ? { 'x-organization-id': String(orgId) } : undefined
    return apiClient.post<{ success: boolean; message: string }>(
      ENDPOINTS.dashboards.resetLayout(pageId),
      {},
      { headers }
    )
  }
}

export const dashboardService = new DashboardService()
