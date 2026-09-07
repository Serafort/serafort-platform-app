import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import complianceService from '../services/compliance.service'
import type {
  ConsentStatus,
  ErasureRequestPayload,
  ErasureRequestResponse,
  ProcessingActivitiesResponse,
  RetentionReport,
  UpdateConsentPayload,
  UserConsent,
} from '../types/compliance.types'

export const COMPLIANCE_KEYS = {
  all: ['gdpr'] as const,
  consents: () => [...COMPLIANCE_KEYS.all, 'consents'] as const,
  consentStatus: () => [...COMPLIANCE_KEYS.all, 'consent-status'] as const,
  processingActivities: () => [...COMPLIANCE_KEYS.all, 'processing-activities'] as const,
  retentionReport: () => [...COMPLIANCE_KEYS.all, 'retention-report'] as const,
}

export function useConsentsQuery() {
  return useQuery({
    queryKey: COMPLIANCE_KEYS.consents(),
    queryFn: async () => {
      const response = await complianceService.getConsents()
      return response.data as UserConsent[]
    },
    staleTime: 60_000,
  })
}

export function useConsentStatusQuery() {
  return useQuery({
    queryKey: COMPLIANCE_KEYS.consentStatus(),
    queryFn: async () => {
      const response = await complianceService.getConsentStatus()
      return response.data as ConsentStatus
    },
    staleTime: 60_000,
  })
}

/**
 * Record a consent decision.
 *
 * Not retried. Each call writes an audit row stamped with the request IP and
 * user agent; a silent retry on a network blip would record the same decision
 * twice from what looks like two separate acts of consent.
 */
export function useUpdateConsentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: UpdateConsentPayload) => {
      const response = await complianceService.updateConsent(payload)
      return response.data
    },
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPLIANCE_KEYS.consents() })
      queryClient.invalidateQueries({ queryKey: COMPLIANCE_KEYS.consentStatus() })
    },
  })
}

export function useRequestDataExportMutation() {
  return useMutation({
    mutationFn: async () => {
      const response = await complianceService.requestDataExport()
      return response.data
    },
    retry: false,
  })
}

/**
 * Request permanent erasure.
 *
 * Never retried, for two reasons that both matter: the request enqueues an
 * irreversible job, and the backend throttles the endpoint precisely because
 * repeated calls are also password guesses. An automatic retry would spend the
 * user's throttle budget on their behalf.
 */
export function useRequestErasureMutation() {
  return useMutation({
    mutationFn: async (payload: ErasureRequestPayload) => {
      const response = await complianceService.requestErasure(payload)
      return response.data as ErasureRequestResponse
    },
    retry: false,
  })
}

export function useProcessingActivitiesQuery() {
  return useQuery({
    queryKey: COMPLIANCE_KEYS.processingActivities(),
    queryFn: async () => {
      const response = await complianceService.getProcessingActivities()
      return response.data as ProcessingActivitiesResponse
    },
    staleTime: 300_000,
  })
}

export function useRetentionReportQuery() {
  return useQuery({
    queryKey: COMPLIANCE_KEYS.retentionReport(),
    queryFn: async () => {
      const response = await complianceService.getRetentionReport()
      return response.data as RetentionReport
    },
    staleTime: 300_000,
  })
}
