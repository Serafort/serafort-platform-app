import { apiClient, FetchResponse } from '@cap/platform-store'
import { API_ENDPOINTS } from '@cap/api-contracts'

export interface DIDDocument {
  id: string
  controller?: string
  verificationMethod?: Array<{
    id: string
    type: string
    controller: string
    publicKeyMultibase?: string
  }>
  authentication?: string[]
  assertionMethod?: string[]
}

export interface VerifiableCredential {
  id: string | number
  issuerDid: string
  subjectDid: string
  type: string
  claims: Record<string, unknown>
  issuanceDate?: string
  expirationDate?: string
  proof?: {
    type: string
    created: string
    verificationMethod: string
    proofValue: string
  }
}

export interface BlockchainAuditLog {
  id: number
  txHash: string
  blockNumber?: number
  action: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export class BlockchainService {
  /**
   * Generates a new DID for the authenticated user.
   */
  async generateDID(): Promise<FetchResponse<DIDDocument>> {
    return apiClient.post<DIDDocument>(API_ENDPOINTS.blockchain.generateDid)
  }

  /**
   * Resolves a DID identifier into its DID Document.
   */
  async resolveDID(did: string): Promise<FetchResponse<DIDDocument>> {
    return apiClient.get<DIDDocument>(API_ENDPOINTS.blockchain.resolveDid(did))
  }

  /**
   * Issues a Verifiable Credential to a subject DID.
   */
  async issueCredential(payload: {
    issuerDid: string
    subjectDid: string
    claims: Record<string, unknown>
    type: string
  }): Promise<FetchResponse<VerifiableCredential>> {
    return apiClient.post<VerifiableCredential>(API_ENDPOINTS.blockchain.issueCredential, payload)
  }

  /**
   * Lists Verifiable Credentials issued to or by the user.
   */
  async listCredentials(): Promise<FetchResponse<VerifiableCredential[]>> {
    return apiClient.get<VerifiableCredential[]>(API_ENDPOINTS.blockchain.credentials)
  }

  /**
   * Retrieves immutable blockchain transaction audit logs.
   */
  async getAuditLogs(): Promise<FetchResponse<BlockchainAuditLog[]>> {
    return apiClient.get<BlockchainAuditLog[]>(API_ENDPOINTS.blockchain.auditLogs)
  }
}

export const blockchainService = new BlockchainService()
