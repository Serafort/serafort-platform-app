import { apiClient, FetchResponse, ENDPOINTS } from '@cap/platform-core'
import type {
  AccessLogFilters,
  AccessLogPage,
  AccessPoint,
  AccessPointWithToken,
  CreateAccessPointPayload,
  NfcCardPage,
  NfcCardStatus,
  RegisterNfcCardPayload,
  UpdateAccessPointPayload,
} from '../types/accessControl.types'
import { normaliseCardUid } from '../types/accessControl.types'

/**
 * Physical NFC access control.
 *
 * Every route is organization-scoped and admin-gated. The reader-facing
 * `/api/v1/access-control/scan` endpoint is intentionally not wrapped here:
 * it is called by the door hardware with its own bearer token and no user
 * session, so the browser has no business calling it.
 */
const accessControlService = {
  // ── NFC cards ────────────────────────────────────────────────────────────

  listCards: (
    orgId: string | number,
    params?: { page?: number; limit?: number; search?: string; status?: NfcCardStatus },
  ): Promise<FetchResponse<NfcCardPage>> => {
    const query = buildQuery(params)
    return apiClient.get<NfcCardPage>(`${ENDPOINTS.accessControl.nfc.cards(orgId)}${query}`)
  },

  /**
   * Register a badge. The UID is normalised the same way the backend does, so
   * the duplicate the server rejects is the same one the operator was warned
   * about in the form.
   */
  registerCard: (
    orgId: string | number,
    payload: RegisterNfcCardPayload,
  ): Promise<FetchResponse<{ message?: string }>> => {
    return apiClient.post(ENDPOINTS.accessControl.nfc.cards(orgId), {
      ...payload,
      uid: normaliseCardUid(payload.uid),
    })
  },

  /**
   * Revoke or restore a card.
   *
   * Revocation is the fast path in an access-control incident — a lost badge
   * has to stop opening doors now — which is why it is a status flip rather
   * than a delete: the card keeps its history in `access_logs`.
   */
  updateCardStatus: (
    orgId: string | number,
    cardId: string | number,
    status: NfcCardStatus,
  ): Promise<FetchResponse<{ message?: string }>> => {
    return apiClient.patch(ENDPOINTS.accessControl.nfc.cardStatus(orgId, cardId), { status })
  },

  /**
   * Permanently delete a card record. Prefer `updateCardStatus('revoked')`:
   * deleting removes the registration an access log entry refers back to.
   */
  deleteCard: (
    orgId: string | number,
    cardId: string | number,
  ): Promise<FetchResponse<{ message?: string }>> => {
    return apiClient.delete(ENDPOINTS.accessControl.nfc.cardById(orgId, cardId))
  },

  // ── Access points (readers) ──────────────────────────────────────────────

  listAccessPoints: (orgId: string | number): Promise<FetchResponse<AccessPoint[]>> => {
    return apiClient.get<AccessPoint[]>(ENDPOINTS.accessControl.nfc.accessPoints(orgId))
  },

  /**
   * Create a reader. The response carries `api_token` — the plaintext bearer
   * token — exactly once; it is stored only as a hash, so a caller that does
   * not show it to the operator has lost it for good.
   */
  createAccessPoint: (
    orgId: string | number,
    payload: CreateAccessPointPayload,
  ): Promise<FetchResponse<AccessPointWithToken>> => {
    return apiClient.post<AccessPointWithToken>(
      ENDPOINTS.accessControl.nfc.accessPoints(orgId),
      payload,
    )
  },

  updateAccessPoint: (
    orgId: string | number,
    pointId: string | number,
    payload: UpdateAccessPointPayload,
  ): Promise<FetchResponse<AccessPoint>> => {
    return apiClient.patch<AccessPoint>(
      ENDPOINTS.accessControl.nfc.accessPointById(orgId, pointId),
      payload,
    )
  },

  deleteAccessPoint: (
    orgId: string | number,
    pointId: string | number,
  ): Promise<FetchResponse<{ message?: string }>> => {
    return apiClient.delete(ENDPOINTS.accessControl.nfc.accessPointById(orgId, pointId))
  },

  /**
   * Issue a new bearer token for a reader.
   *
   * The old token stops working the moment this returns, so the physical reader
   * is offline until somebody carries the new value to it. Same one-shot rule
   * as creation: `api_token` is in this response and nowhere else.
   */
  regenerateAccessPointToken: (
    orgId: string | number,
    pointId: string | number,
  ): Promise<FetchResponse<AccessPointWithToken>> => {
    return apiClient.post<AccessPointWithToken>(
      ENDPOINTS.accessControl.nfc.regenerateAccessPointToken(orgId, pointId),
    )
  },

  // ── Entry logs ───────────────────────────────────────────────────────────

  listLogs: (
    orgId: string | number,
    filters?: AccessLogFilters,
  ): Promise<FetchResponse<AccessLogPage>> => {
    // The backend reads this one as a snake_cased input; the rest match.
    const { accessPointId, ...rest } = filters ?? {}
    const query = buildQuery({ ...rest, access_point_id: accessPointId })
    return apiClient.get<AccessLogPage>(`${ENDPOINTS.accessControl.nfc.logs(orgId)}${query}`)
  },
}

function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return ''
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.append(key, String(value))
  }
  const serialised = search.toString()
  return serialised ? `?${serialised}` : ''
}

export default accessControlService
