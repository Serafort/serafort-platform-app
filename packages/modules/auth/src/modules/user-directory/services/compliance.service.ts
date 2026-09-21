import { apiClient, FetchResponse, ENDPOINTS } from '@cap/platform-core'
import type {
  ConsentStatus,
  ErasureRequestPayload,
  ErasureRequestResponse,
  ProcessingActivitiesResponse,
  RetentionReport,
  UpdateConsentPayload,
  UserConsent,
} from '../types/compliance.types'

/**
 * GDPR self-service and compliance reporting.
 *
 * Split out from `user.service` because these are the data-subject rights
 * endpoints rather than profile management, and because two of them are
 * destructive or evidentiary and warrant being findable in one place.
 */
const complianceService = {
  /** The user's stored consent decisions, with the IP and agent behind each. */
  getConsents: (): Promise<FetchResponse<UserConsent[]>> => {
    return apiClient.get<UserConsent[]>(ENDPOINTS.gdpr.consent)
  },

  /** Aggregate view: how many decisions exist and whether all are granted. */
  getConsentStatus: (): Promise<FetchResponse<ConsentStatus>> => {
    return apiClient.get<ConsentStatus>(ENDPOINTS.gdpr.consentStatus)
  },

  /**
   * Record a consent decision.
   *
   * PATCH with the purpose in the body — the backend upserts on
   * `(userId, purpose)` and stamps the request IP and user agent, which is the
   * evidence half of Article 7(1).
   */
  updateConsent: (
    payload: UpdateConsentPayload,
  ): Promise<FetchResponse<{ message: string; consent: UserConsent }>> => {
    return apiClient.patch(ENDPOINTS.gdpr.consent, payload)
  },

  /** Queue an export of everything held about the caller. */
  requestDataExport: (): Promise<FetchResponse<{ message: string }>> => {
    return apiClient.post(ENDPOINTS.gdpr.dataExport)
  },

  /**
   * Request permanent erasure.
   *
   * The password is verified server-side before `ErasureUserDataJob` is
   * dispatched — it is the confirmation factor, not a formality, so it is never
   * cached or pre-filled. `hardDelete` distinguishes full removal from
   * anonymisation.
   *
   * Until serafort-auth-service #40 lands, this path reaches a handler that
   * answers 202 and does nothing; the request looks accepted and is discarded.
   */
  requestErasure: (
    payload: ErasureRequestPayload,
  ): Promise<FetchResponse<ErasureRequestResponse>> => {
    return apiClient.post<ErasureRequestResponse>(ENDPOINTS.gdpr.erasure, payload)
  },

  /** Article 30 records of processing activities. */
  getProcessingActivities: (): Promise<FetchResponse<ProcessingActivitiesResponse>> => {
    return apiClient.get<ProcessingActivitiesResponse>(ENDPOINTS.gdpr.processingActivities)
  },

  /** Data-retention figures. Placeholder values on the backend today. */
  getRetentionReport: (): Promise<FetchResponse<RetentionReport>> => {
    return apiClient.get<RetentionReport>(ENDPOINTS.gdpr.retentionReport)
  },
}

export default complianceService
