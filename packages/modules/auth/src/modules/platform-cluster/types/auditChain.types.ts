/**
 * Tamper-evident audit chain and blockchain anchor types.
 *
 * These mirror `AuditChainController` in the backend. Two things about that
 * surface shape every screen built on it:
 *
 * 1. It is **platform-scoped**. `audit_logs` is one global hash chain with no
 *    `organization_id`, so the backend answers 403 `E_PLATFORM_SCOPE_REQUIRED`
 *    to an organization admin — and to a platform super-admin who pinned a
 *    tenant with `X-Tenant-ID`. That is a normal outcome, not a bug, and the UI
 *    has to say so rather than render an error.
 * 2. Verification is **expensive and throttled** (5 per 5 minutes). It is a
 *    button, never a poll.
 */

/** The id of the HMAC key a row was hashed under. */
export type AuditChainKeyId = "app_key" | "audit_v1" | (string & {});

/**
 * How a chain broke. Each maps to a distinct failure an operator has to act on
 * differently — `content` means a row was edited, `link` means a row was
 * deleted or reordered, `fork` means two rows share a predecessor (a concurrent
 * append that bypassed the advisory lock), `key` means the row's HMAC key could
 * not be resolved, and `truncation` means the chain lost rows from its tail
 * between two verification runs.
 */
export type AuditChainAnomalyKind =
  | "content"
  | "link"
  | "fork"
  | "key"
  | "truncation";

export interface AuditChainAnomaly {
  id: number;
  kind: AuditChainAnomalyKind;
  detail: string;
}

export interface AuditChainHead {
  auditLogId: number;
  rowHash: string;
  prevHash: string | null;
  hashKeyId: AuditChainKeyId;
  createdAt: string;
}

export interface AuditChainCheckpoint {
  id: number;
  maxAuditId: number;
  rowHash: string;
  rowCount: number;
  /** Who ran the verification — a CLI `user@host`, or `email (admin console)`. */
  verifiedBy: string | null;
  createdAt: string;
}

export interface AuditChainStatus {
  /** Null on a brand-new deployment with no hashed rows yet. */
  head: AuditChainHead | null;
  totalRows: number;
  hashedRows: number;
  unhashedRows: number;
  genesis: string;
  activeKeyId: AuditChainKeyId;
  /**
   * False means the chain is keyed on `APP_KEY`, which is rotated for
   * cookie/session hygiene — a rotation would invalidate the entire audit
   * history. The inspector surfaces this as a standing warning.
   */
  dedicatedKeyConfigured: boolean;
  lastCheckpoint: AuditChainCheckpoint | null;
}

export interface AuditChainVerifyRequest {
  /** Verify from this audit-log id onward. Omit for a full walk. */
  from?: number;
  limit?: number;
  /** Treat unhashed rows below this id as expected (pre-control backfill). */
  allowUnhashedBefore?: number;
  /** Record a new checkpoint. Honoured only on a clean full walk. */
  recordCheckpoint?: boolean;
}

export interface AuditChainVerifyResult {
  ok: boolean;
  checked: number;
  unhashed: number;
  unhashedExempt: number;
  anomalies: AuditChainAnomaly[];
  fullWalk: boolean;
  checkpointRecorded: boolean;
  durationMs: number;
  verifiedAt: string;
}

export interface AuditChainCheckpointPage {
  data: AuditChainCheckpoint[];
  meta: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
  };
}

export type BlockchainAnchorState = "PENDING" | "CONFIRMED" | "FAILED";

export type BlockchainAnchorType =
  | "DID_ANCHOR"
  | "VC_ANCHOR"
  | "CONSENT_ANCHOR"
  | "DOC_ANCHOR";

export interface BlockchainAnchor {
  id: number;
  txHash: string;
  status: BlockchainAnchorState;
  type: BlockchainAnchorType;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * The chain the console should describe and link to. `explorerBaseUrl` comes
 * from backend configuration rather than a frontend constant, because a testnet
 * deployment must not link to mainnet Polygonscan for a transaction that only
 * exists on Amoy.
 */
export interface BlockchainAnchorNetwork {
  name: string;
  explorerBaseUrl: string;
  /**
   * False means anchoring is switched off. The widget renders "not configured"
   * rather than "no anchors yet" — an empty list means something different in
   * each case.
   */
  anchoringEnabled: boolean;
  rpcConfigured: boolean;
  anchorContract: string | null;
}

export interface BlockchainAnchorPage {
  data: BlockchainAnchor[];
  meta: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
  };
  network: BlockchainAnchorNetwork;
}

/** Build an explorer deep link for a transaction hash. */
export function anchorExplorerUrl(
  network: Pick<BlockchainAnchorNetwork, "explorerBaseUrl">,
  txHash: string,
): string {
  return `${network.explorerBaseUrl.replace(/\/+$/, "")}/tx/${txHash}`;
}
