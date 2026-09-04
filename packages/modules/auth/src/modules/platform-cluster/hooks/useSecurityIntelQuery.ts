import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import adminMonitoringService from '../services/admin-monitoring.service'
import { ADMIN_MONITORING_KEYS } from './useAdminMonitoringQuery'
import type {
  Anomaly,
  AnomalyPage,
  AnomalyStats,
  AnomalyStatus,
  SecurityScore,
  TriageAction,
} from '../types/securityIntel.types'

export const SECURITY_INTEL_KEYS = {
  all: ['admin', 'security-intel'] as const,
  anomalies: (params?: Record<string, unknown>) =>
    [...SECURITY_INTEL_KEYS.all, 'anomalies', params] as const,
  anomalyById: (id: string | number) => [...SECURITY_INTEL_KEYS.all, 'anomaly', id] as const,
  anomalyStats: () => [...SECURITY_INTEL_KEYS.all, 'anomaly-stats'] as const,
  score: () => [...SECURITY_INTEL_KEYS.all, 'score'] as const,
  baseline: () => [...SECURITY_INTEL_KEYS.all, 'baseline'] as const,
}

export function useAnomaliesQuery(params?: {
  status?: AnomalyStatus
  type?: string
  limit?: number
}) {
  return useQuery({
    queryKey: SECURITY_INTEL_KEYS.anomalies(params),
    queryFn: async () => {
      const response = await adminMonitoringService.getAnomalies(params)
      return response.data as AnomalyPage
    },
    staleTime: 30_000,
  })
}

export function useAnomalyStatsQuery() {
  return useQuery({
    queryKey: SECURITY_INTEL_KEYS.anomalyStats(),
    queryFn: async () => {
      const response = await adminMonitoringService.getAnomalyStats()
      return response.data as AnomalyStats
    },
    staleTime: 60_000,
  })
}

export function useSecurityScoreQuery() {
  return useQuery({
    queryKey: SECURITY_INTEL_KEYS.score(),
    queryFn: async () => {
      const response = await adminMonitoringService.getAnomalyScore()
      return response.data as SecurityScore
    },
    staleTime: 300_000,
  })
}

export function useAnomalyBaselineQuery() {
  return useQuery({
    queryKey: SECURITY_INTEL_KEYS.baseline(),
    queryFn: async () => {
      const response = await adminMonitoringService.getAnomalyBaseline()
      return response.data
    },
    staleTime: 300_000,
  })
}

/**
 * Move an anomaly through its lifecycle. `false_positive` is routed to the
 * dedicated endpoint rather than the generic status update, because the backend
 * treats detector feedback differently from a status change.
 */
export function useUpdateAnomalyStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (vars: { id: string | number; status: AnomalyStatus }) => {
      if (vars.status === 'false_positive') {
        const response = await adminMonitoringService.markAnomalyFalsePositive(vars.id)
        return response.data
      }
      const response = await adminMonitoringService.updateAnomalyStatus(vars.id, vars.status)
      return response.data
    },
    onSuccess: () => invalidateSecurityIntel(queryClient),
  })
}

/**
 * Run the detector now rather than waiting for its schedule. Not retried: a
 * detection pass is a side effect, and a silent second run on a network blip
 * would double-write anomalies.
 */
export function useDetectAnomaliesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await adminMonitoringService.detectAnomalies()
      return response.data
    },
    retry: false,
    onSuccess: () => invalidateSecurityIntel(queryClient),
  })
}

/** Recompute the baseline the detector scores deviations against. */
export function useRefreshBaselineMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await adminMonitoringService.refreshAnomalyBaseline()
      return response.data
    },
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SECURITY_INTEL_KEYS.baseline() })
      queryClient.invalidateQueries({ queryKey: SECURITY_INTEL_KEYS.anomalyStats() })
    },
  })
}

/**
 * The four alert triage actions behind one mutation.
 *
 * They are grouped because the UI treats them as one decision — the operator
 * picks an outcome for an alert — even though they reach three different
 * endpoints, and `falsePositive` acts on the alert's *anomaly* rather than on
 * the alert itself. Keeping the routing here means the table does not have to
 * know which action goes where.
 */
export function useTriageAlertMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (vars: {
      id: string | number
      action: TriageAction
      /** Required for `falsePositive`: the detector to give feedback about. */
      anomalyId?: number | null
    }) => {
      switch (vars.action) {
        case 'acknowledge': {
          const response = await adminMonitoringService.acknowledgeAlert(vars.id)
          return response.data
        }
        case 'resolve': {
          const response = await adminMonitoringService.resolveAlert(vars.id)
          return response.data
        }
        case 'dismiss': {
          const response = await adminMonitoringService.dismissAlert(vars.id)
          return response.data
        }
        case 'falsePositive': {
          if (vars.anomalyId === undefined || vars.anomalyId === null) {
            // Fail loudly rather than silently degrading to a dismissal: the
            // two record different things, and quietly substituting one would
            // corrupt the detector's feedback signal.
            throw new Error(
              'falsePositive requires the alert to have an anomalyId — only a detector-raised alert has a detector to be wrong about.',
            )
          }
          const response = await adminMonitoringService.markAnomalyFalsePositive(vars.anomalyId)
          return response.data
        }
        default: {
          throw new Error(`Unknown triage action: ${String(vars.action)}`)
        }
      }
    },
    onSuccess: () => {
      invalidateSecurityIntel(queryClient)
      queryClient.invalidateQueries({ queryKey: [...ADMIN_MONITORING_KEYS.all, 'alerts'] })
    },
  })
}

function invalidateSecurityIntel(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: SECURITY_INTEL_KEYS.all })
  queryClient.invalidateQueries({ queryKey: [...ADMIN_MONITORING_KEYS.all, 'alerts'] })
}

export type { Anomaly }
