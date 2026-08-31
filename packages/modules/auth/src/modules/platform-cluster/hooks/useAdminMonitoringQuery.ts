import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import adminMonitoringService, {
  AdminOverviewStats,
  SessionStatistics,
  TrendDataPoint,
  MfaAnalyticsData,
  AuditLogItem,
  AlertItem,
  EmailTemplate,
  EmailPreviewResult,
  SendTestEmailPayload,
  AuditLogExportRequest,
  AuditLogExportResponse,
} from '../services/admin-monitoring.service'

export const ADMIN_MONITORING_KEYS = {
  all: ['admin', 'monitoring'] as const,
  overview: () => [...ADMIN_MONITORING_KEYS.all, 'overview'] as const,
  sessionStats: () => [...ADMIN_MONITORING_KEYS.all, 'session-stats'] as const,
  trends: (range?: string) => [...ADMIN_MONITORING_KEYS.all, 'trends', range] as const,
  mfaStats: () => [...ADMIN_MONITORING_KEYS.all, 'mfa-stats'] as const,
  auditLogs: (params?: Record<string, any>) => [...ADMIN_MONITORING_KEYS.all, 'audit-logs', params] as const,
  alerts: (params?: Record<string, any>) => [...ADMIN_MONITORING_KEYS.all, 'alerts', params] as const,
  emailTemplates: () => [...ADMIN_MONITORING_KEYS.all, 'email-templates'] as const,
  emailTemplateById: (id: string) => [...ADMIN_MONITORING_KEYS.all, 'email-template', id] as const,
}

export function useAdminOverviewQuery() {
  return useQuery({
    queryKey: ADMIN_MONITORING_KEYS.overview(),
    queryFn: async () => {
      const response = await adminMonitoringService.getOverview()
      return response.data as AdminOverviewStats
    },
    staleTime: 30000,
    refetchInterval: 30000,
  })
}

export function useAdminSessionStatsQuery() {
  return useQuery({
    queryKey: ADMIN_MONITORING_KEYS.sessionStats(),
    queryFn: async () => {
      const response = await adminMonitoringService.getSessionStatistics()
      return response.data as SessionStatistics
    },
    staleTime: 60000,
  })
}

export function useAdminTrendsQuery(range: string = '7d') {
  return useQuery({
    queryKey: ADMIN_MONITORING_KEYS.trends(range),
    queryFn: async () => {
      const response = await adminMonitoringService.getTrends({ range })
      return response.data as TrendDataPoint[]
    },
    staleTime: 60000,
  })
}

export function useAdminMfaStatsQuery() {
  return useQuery({
    queryKey: ADMIN_MONITORING_KEYS.mfaStats(),
    queryFn: async () => {
      const response = await adminMonitoringService.getMfaStats()
      return response.data as MfaAnalyticsData
    },
    staleTime: 60000,
  })
}

export function useAdminAuditLogsQuery(params?: {
  page?: number
  limit?: number
  actor?: string
  action?: string
  severity?: string
  startDate?: string
  endDate?: string
}) {
  return useQuery({
    queryKey: ADMIN_MONITORING_KEYS.auditLogs(params),
    queryFn: async () => {
      const response = await adminMonitoringService.getAuditLogs(params)
      const data = response.data
      if (Array.isArray(data)) {
        return { logs: data, total: data.length, page: params?.page ?? 1, limit: params?.limit ?? 50 }
      }
      return {
        logs: (data as any)?.data || [],
        total: (data as any)?.total || 0,
        page: (data as any)?.page || 1,
        limit: (data as any)?.limit || 50,
      }
    },
    staleTime: 15000,
  })
}

export function useAdminAlertsQuery(params?: {
  status?: string
  severity?: string
  limit?: number
}) {
  return useQuery({
    queryKey: ADMIN_MONITORING_KEYS.alerts(params),
    queryFn: async () => {
      const response = await adminMonitoringService.getAlerts(params)
      const data = response.data
      if (Array.isArray(data)) {
        return data as AlertItem[]
      }
      return ((data as any)?.data || []) as AlertItem[]
    },
    staleTime: 30000,
    refetchInterval: 30000,
  })
}

export function useAcknowledgeAlertMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string | number) => adminMonitoringService.acknowledgeAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_MONITORING_KEYS.alerts() })
      queryClient.invalidateQueries({ queryKey: ADMIN_MONITORING_KEYS.overview() })
    },
  })
}

export function useResolveAlertMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string | number) => adminMonitoringService.resolveAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_MONITORING_KEYS.alerts() })
      queryClient.invalidateQueries({ queryKey: ADMIN_MONITORING_KEYS.overview() })
    },
  })
}

export function useEmailTemplatesQuery() {
  return useQuery({
    queryKey: ADMIN_MONITORING_KEYS.emailTemplates(),
    queryFn: async () => {
      const response = await adminMonitoringService.getEmailTemplates()
      return (Array.isArray(response.data) ? response.data : []) as EmailTemplate[]
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useEmailTemplateByIdQuery(id: string) {
  return useQuery({
    queryKey: ADMIN_MONITORING_KEYS.emailTemplateById(id),
    queryFn: async () => {
      const response = await adminMonitoringService.getEmailTemplateById(id)
      return response.data as EmailTemplate
    },
    enabled: !!id,
  })
}

export function useEmailTemplatePreviewMutation() {
  return useMutation({
    mutationFn: (payload: { templateId: string; variables?: Record<string, any> }) =>
      adminMonitoringService.previewEmailTemplate(payload),
  })
}

export function useSendTestEmailMutation() {
  return useMutation({
    mutationFn: (payload: SendTestEmailPayload) => adminMonitoringService.sendTestEmail(payload),
  })
}

export function useExportAuditTrailMutation() {
  return useMutation({
    mutationFn: (payload: AuditLogExportRequest) => adminMonitoringService.exportAuditLogs(payload),
  })
}
