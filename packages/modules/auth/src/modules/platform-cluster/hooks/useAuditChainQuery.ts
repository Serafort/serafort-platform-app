import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import auditChainService from '../services/audit-chain.service'
import type {
  AuditChainStatus,
  AuditChainCheckpointPage,
  AuditChainVerifyRequest,
  AuditChainVerifyResult,
  BlockchainAnchorPage,
  BlockchainAnchorState,
  BlockchainAnchorType,
} from '../types/auditChain.types'

export const AUDIT_CHAIN_KEYS = {
  all: ['admin', 'audit-chain'] as const,
  status: () => [...AUDIT_CHAIN_KEYS.all, 'status'] as const,
  checkpoints: (params?: Record<string, unknown>) =>
    [...AUDIT_CHAIN_KEYS.all, 'checkpoints', params] as const,
  anchors: (params?: Record<string, unknown>) =>
    [...AUDIT_CHAIN_KEYS.all, 'anchors', params] as const,
}

/**
 * The live chain head.
 *
 * Polled on a slow interval: the head advances with every audited action, and a
 * stale head would make the inspector's "verified head matches current head"
 * comparison read as a truncation when it is only staleness.
 *
 * `retry: false` because the two ways this fails — 403 for a tenant-scoped
 * admin, and a genuine chain fault — are both states to show the operator
 * immediately, not transient errors to sit behind a retry backoff.
 */
export function useAuditChainStatusQuery(enabled = true) {
  return useQuery({
    queryKey: AUDIT_CHAIN_KEYS.status(),
    queryFn: async () => {
      const response = await auditChainService.getStatus()
      return response.data as AuditChainStatus
    },
    enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: false,
  })
}

export function useAuditChainCheckpointsQuery(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: AUDIT_CHAIN_KEYS.checkpoints(params),
    queryFn: async () => {
      const response = await auditChainService.getCheckpoints(params)
      return response.data as AuditChainCheckpointPage
    },
    staleTime: 60_000,
    retry: false,
  })
}

/**
 * Run a verification walk.
 *
 * A mutation rather than a query on purpose: a full walk reads every audit row
 * and the backend throttles it to 5 per 5 minutes, so it must never be
 * refetched automatically, deduplicated against a cache, or retried.
 *
 * On success the status and checkpoint list are invalidated — a clean full walk
 * with `recordCheckpoint` writes a new head, and the screen should show it.
 */
export function useVerifyAuditChainMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: AuditChainVerifyRequest = {}) => {
      const response = await auditChainService.verify(payload)
      return response.data as AuditChainVerifyResult
    },
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUDIT_CHAIN_KEYS.status() })
      queryClient.invalidateQueries({ queryKey: [...AUDIT_CHAIN_KEYS.all, 'checkpoints'] })
    },
  })
}

export function useBlockchainAnchorsQuery(params?: {
  page?: number
  limit?: number
  status?: BlockchainAnchorState
  type?: BlockchainAnchorType
}) {
  return useQuery({
    queryKey: AUDIT_CHAIN_KEYS.anchors(params),
    queryFn: async () => {
      const response = await auditChainService.getAnchors(params)
      return response.data as BlockchainAnchorPage
    },
    staleTime: 30_000,
    retry: false,
  })
}
