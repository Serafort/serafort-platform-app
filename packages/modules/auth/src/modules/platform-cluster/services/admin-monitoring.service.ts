import { apiClient, FetchResponse, ENDPOINTS } from '@cap/platform-core'

export interface AdminOverviewStats {
  totalUsers: number
  activeSessions: number
  mfaAdoptionRate: number
  healthScore: number
  totalAlerts: number
  unresolvedAlerts: number
  signIns24h: number
  failedSignIns24h: number
  syncStatus?: string
  systemStatus?: 'healthy' | 'degraded' | 'critical'
}

export interface SessionStatistics {
  activeCount: number
  rememberedCount: number
  deviceBreakdown: Record<string, number>
  browserBreakdown: Record<string, number>
  osBreakdown: Record<string, number>
  geographicBreakdown: Array<{ country: string; count: number; code?: string }>
}

export interface TrendDataPoint {
  timestamp: string
  signIns: number
  failedSignIns: number
  mfaChallenges: number
  newUsers: number
}

export interface MfaAnalyticsData {
  totpCount: number
  smsCount: number
  passkeyCount: number
  recoveryCodesUsed: number
  adoptionRatePercentage: number
  enforcedUsersCount: number
  voluntaryUsersCount: number
}

export interface AuditLogItem {
  id: string | number
  action: string
  actor: string
  ipAddress?: string
  userAgent?: string
  status: 'success' | 'failure' | 'warning' | string
  severity?: 'info' | 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  metadata?: Record<string, any>
  city?: string
  country?: string
}

export interface AlertItem {
  id: string | number
  title: string
  description?: string
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'acknowledged' | 'resolved'
  createdAt: string
  acknowledgedAt?: string
  resolvedAt?: string
  actor?: string
  metadata?: Record<string, any>
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  description?: string
  variables: string[]
  updatedAt: string
}

export interface EmailPreviewResult {
  subject: string
  html: string
  text?: string
}

export interface SendTestEmailPayload {
  templateId: string
  recipientEmail: string
  variables?: Record<string, any>
}

export interface AuditLogExportRequest {
  format: 'csv' | 'json'
  startDate?: string
  endDate?: string
  actor?: string
  severity?: string
}

export interface AuditLogExportResponse {
  jobId?: string
  downloadUrl?: string
  status: 'completed' | 'processing' | 'ready'
  rowCount?: number
}

export const adminMonitoringService = {
  getOverview: (): Promise<FetchResponse<AdminOverviewStats>> => {
    return apiClient.get<AdminOverviewStats>(ENDPOINTS.admin.statistics.overview)
  },

  getSessionStatistics: (): Promise<FetchResponse<SessionStatistics>> => {
    return apiClient.get<SessionStatistics>(ENDPOINTS.admin.statistics.sessionStatistics)
  },

  getTrends: (params?: { range?: string }): Promise<FetchResponse<TrendDataPoint[]>> => {
    const query = params?.range ? `?range=${encodeURIComponent(params.range)}` : ''
    return apiClient.get<TrendDataPoint[]>(`${ENDPOINTS.admin.statistics.trends}${query}`)
  },

  getMfaStats: (): Promise<FetchResponse<MfaAnalyticsData>> => {
    return apiClient.get<MfaAnalyticsData>(ENDPOINTS.admin.statistics.mfa)
  },

  getAuditLogs: (params?: {
    page?: number
    limit?: number
    actor?: string
    action?: string
    severity?: string
    startDate?: string
    endDate?: string
  }): Promise<
    FetchResponse<
      { data: AuditLogItem[]; total: number; page: number; limit: number } | AuditLogItem[]
    >
  > => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) searchParams.append(key, String(value))
      })
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return apiClient.get(`${ENDPOINTS.admin.auditLogs.index}${query}`)
  },

  exportAuditLogs: (
    payload: AuditLogExportRequest,
  ): Promise<FetchResponse<AuditLogExportResponse>> => {
    return apiClient.post<AuditLogExportResponse>(ENDPOINTS.admin.auditLogs.export, payload)
  },

  getAlerts: (params?: {
    status?: string
    severity?: string
    limit?: number
  }): Promise<FetchResponse<{ data: AlertItem[]; count?: number } | AlertItem[]>> => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) searchParams.append(key, String(value))
      })
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return apiClient.get(`${ENDPOINTS.admin.security.alerts}${query}`)
  },

  getAlertCountsBySeverity: (): Promise<FetchResponse<Record<string, number>>> => {
    return apiClient.get<Record<string, number>>(ENDPOINTS.admin.alerts.countBySeverity)
  },

  getAlertById: (id: string | number): Promise<FetchResponse<AlertItem>> => {
    return apiClient.get<AlertItem>(ENDPOINTS.admin.alerts.byId(id))
  },

  acknowledgeAlert: (id: string | number): Promise<FetchResponse<{ message: string }>> => {
    return apiClient.post<{ message: string }>(ENDPOINTS.admin.alerts.acknowledge(id))
  },

  resolveAlert: (id: string | number): Promise<FetchResponse<{ message: string }>> => {
    return apiClient.post<{ message: string }>(ENDPOINTS.admin.alerts.resolve(id))
  },

  resolveAlerts: (ids: (string | number)[]): Promise<FetchResponse<{ message: string }>> => {
    return apiClient.post<{ message: string }>(ENDPOINTS.admin.alerts.bulkResolve, { ids })
  },

  dismissAlert: (id: string | number): Promise<FetchResponse<{ message: string }>> => {
    return apiClient.patch<{ message: string }>(ENDPOINTS.admin.security.dismissAlert(id))
  },

  deleteAlert: (id: string | number): Promise<FetchResponse<{ message: string }>> => {
    return apiClient.delete<{ message: string }>(ENDPOINTS.admin.alerts.destroy(id))
  },

  // --- Anomaly detection ---

  getAnomalies: (params?: {
    status?: string
    severity?: string
    limit?: number
  }): Promise<FetchResponse<any>> => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) searchParams.append(key, String(value))
      })
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return apiClient.get(`${ENDPOINTS.admin.anomalies.index}${query}`)
  },

  getAnomalyById: (id: string | number): Promise<FetchResponse<any>> => {
    return apiClient.get(ENDPOINTS.admin.anomalies.byId(id))
  },

  getAnomalyStats: (): Promise<FetchResponse<any>> => {
    return apiClient.get(ENDPOINTS.admin.anomalies.stats)
  },

  getAnomalyScore: (): Promise<FetchResponse<any>> => {
    return apiClient.get(ENDPOINTS.admin.anomalies.score)
  },

  updateAnomalyStatus: (
    id: string | number,
    status: string,
  ): Promise<FetchResponse<{ message: string }>> => {
    return apiClient.patch<{ message: string }>(ENDPOINTS.admin.anomalies.updateStatus(id), {
      status,
    })
  },

  markAnomalyFalsePositive: (id: string | number): Promise<FetchResponse<{ message: string }>> => {
    return apiClient.post<{ message: string }>(ENDPOINTS.admin.anomalies.falsePositive(id))
  },

  /** Run the detector now rather than waiting for its schedule. */
  detectAnomalies: (): Promise<FetchResponse<any>> => {
    return apiClient.post(ENDPOINTS.admin.anomalies.detect)
  },

  getAnomalyBaseline: (): Promise<FetchResponse<any>> => {
    return apiClient.get(ENDPOINTS.admin.anomalies.baseline)
  },

  /** Recompute the baseline the detector scores against. */
  refreshAnomalyBaseline: (): Promise<FetchResponse<any>> => {
    return apiClient.post(ENDPOINTS.admin.anomalies.refreshBaseline)
  },

  getEmailTemplates: (): Promise<FetchResponse<EmailTemplate[]>> => {
    return apiClient.get<EmailTemplate[]>(ENDPOINTS.admin.email.templates)
  },

  getEmailTemplateById: (id: string): Promise<FetchResponse<EmailTemplate>> => {
    return apiClient.get<EmailTemplate>(ENDPOINTS.admin.email.templateById(id))
  },

  previewEmailTemplate: (payload: {
    templateId: string
    variables?: Record<string, any>
  }): Promise<FetchResponse<EmailPreviewResult>> => {
    return apiClient.post<EmailPreviewResult>(ENDPOINTS.admin.email.preview, payload)
  },

  sendTestEmail: (
    payload: SendTestEmailPayload,
  ): Promise<FetchResponse<{ message: string; messageId?: string }>> => {
    return apiClient.post<{ message: string; messageId?: string }>(
      ENDPOINTS.admin.email.test,
      payload,
    )
  },
}

export default adminMonitoringService
