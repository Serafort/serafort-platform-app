import { apiClient, FetchResponse, ENDPOINTS } from '@cap/platform-core'
import type {
  AuditChainStatus,
  AuditChainCheckpointPage,
  AuditChainVerifyRequest,
  AuditChainVerifyResult,
  BlockchainAnchorPage,
  BlockchainAnchorState,
  BlockchainAnchorType,
} from '../types/auditChain.types'

/**
 * Reads the tamper-evident audit chain and the blockchain anchor ledger.
 *
 * Every call here is platform-scoped on the backend and answers 403
 * `E_PLATFORM_SCOPE_REQUIRED` to an organization admin, or to a platform
 * super-admin who has pinned a tenant. Callers should treat that as a state to
 * render, not an error to retry — see `isPlatformScopeError`.
 */
const auditChainService = {
  /**
   * The live chain head plus the last checkpoint. Cheap enough to poll.
   */
  getStatus: (): Promise<FetchResponse<AuditChainStatus>> => {
    return apiClient.get<AuditChainStatus>(ENDPOINTS.admin.auditChain.status)
  },

  /**
   * The checkpoint history — the artefact that evidences integrity monitoring
   * over time, rather than at one moment.
   */
  getCheckpoints: (params?: {
    page?: number
    limit?: number
  }): Promise<FetchResponse<AuditChainCheckpointPage>> => {
    const query = buildQuery(params)
    return apiClient.get<AuditChainCheckpointPage>(
      `${ENDPOINTS.admin.auditChain.checkpoints}${query}`,
    )
  },

  /**
   * Run a verification walk. This is the UI equivalent of `node ace
   * audit:verify` and it reads every audit row on a full walk, so the backend
   * throttles it to 5 per 5 minutes. Never call it on an interval.
   *
   * The request is snake_cased here because the backend reads the flags with
   * `request.input()` under the same names the ace command uses.
   */
  verify: (
    payload: AuditChainVerifyRequest = {},
  ): Promise<FetchResponse<AuditChainVerifyResult>> => {
    return apiClient.post<AuditChainVerifyResult>(ENDPOINTS.admin.auditChain.verify, {
      from: payload.from,
      limit: payload.limit,
      allow_unhashed_before: payload.allowUnhashedBefore,
      record_checkpoint: payload.recordCheckpoint ?? false,
    })
  },

  /**
   * The blockchain anchor ledger, with the network descriptor the UI needs to
   * build explorer links and to tell "anchoring is off" apart from "nothing
   * anchored yet".
   */
  getAnchors: (params?: {
    page?: number
    limit?: number
    status?: BlockchainAnchorState
    type?: BlockchainAnchorType
  }): Promise<FetchResponse<BlockchainAnchorPage>> => {
    const query = buildQuery(params)
    return apiClient.get<BlockchainAnchorPage>(`${ENDPOINTS.admin.auditChain.anchors}${query}`)
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

/**
 * True when a request failed because the caller is not a platform super-admin
 * operating unpinned.
 *
 * This is a legitimate outcome for an organization admin, not a fault: the
 * audit chain is one global chain with no per-tenant view. Screens use this to
 * explain *why* the data is unavailable rather than showing a generic error,
 * which would send an org admin looking for a broken backend.
 */
export function isPlatformScopeError(error: unknown): boolean {
  const candidate = error as { status?: number; data?: { code?: string }; code?: string } | null
  if (!candidate) return false
  if (candidate.code === 'E_PLATFORM_SCOPE_REQUIRED') return true
  return candidate.data?.code === 'E_PLATFORM_SCOPE_REQUIRED'
}

export default auditChainService
