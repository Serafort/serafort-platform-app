/**
 * API Contracts Package
 *
 * Single source of truth for API endpoint URLs (`API_ENDPOINTS`), React Query
 * key factories (`API_QUERY_KEYS`), and typed endpoint contracts
 * (`API_CONTRACTS`). Service layers and the platform API client consume these
 * so URLs and payload shapes never drift between packages.
 *
 * No React dependencies - pure TypeScript only.
 */

export * from './endpoints'
export * from './contracts'
export * from './types/endpoint-contract'
export * from './types/module-contract'
