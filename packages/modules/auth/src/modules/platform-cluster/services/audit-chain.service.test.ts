import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@cap/platform-core'
import auditChainService, { isPlatformScopeError } from './audit-chain.service'

vi.mock('@cap/platform-core', async () => {
  const actual = await vi.importActual('@cap/platform-core')
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  }
})

const createMockResponse = (data: any) => ({
  data,
  status: 200,
  statusText: 'OK',
  ok: true,
  headers: new Headers(),
  config: {} as any,
})

describe('auditChainService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reads chain status from the registry endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(
      createMockResponse({ head: null, totalRows: 0, hashedRows: 0 }),
    )

    await auditChainService.getStatus()

    expect(apiClient.get).toHaveBeenCalledWith('/api/admin/audit/chain/status')
  })

  it('paginates checkpoints through the query string', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(createMockResponse({ data: [], meta: {} }))

    await auditChainService.getCheckpoints({ page: 3, limit: 10 })

    expect(apiClient.get).toHaveBeenCalledWith(
      '/api/admin/audit/chain/checkpoints?page=3&limit=10',
    )
  })

  it('omits empty parameters rather than sending blank filters', async () => {
    // A blank `status` from an unset dropdown must not become `?status=`, which
    // the backend would compare against its allow-list and silently ignore —
    // masking a filter that quietly does nothing.
    vi.mocked(apiClient.get).mockResolvedValueOnce(
      createMockResponse({ data: [], meta: {}, network: {} }),
    )

    await auditChainService.getAnchors({ page: 1, status: undefined })

    expect(apiClient.get).toHaveBeenCalledWith('/api/admin/audit/chain/anchors?page=1')
  })

  it('sends verification flags under the names the backend reads', async () => {
    // The controller reads these with `request.input()` using the same names as
    // the ace command's flags. Sending camelCase would be silently ignored, and
    // a "record checkpoint" that never records is worse than no button at all.
    vi.mocked(apiClient.post).mockResolvedValueOnce(
      createMockResponse({ ok: true, checked: 10, anomalies: [] }),
    )

    await auditChainService.verify({
      from: 100,
      limit: 50,
      allowUnhashedBefore: 20,
      recordCheckpoint: true,
    })

    expect(apiClient.post).toHaveBeenCalledWith('/api/admin/audit/chain/verify', {
      from: 100,
      limit: 50,
      allow_unhashed_before: 20,
      record_checkpoint: true,
    })
  })

  it('defaults record_checkpoint to false', async () => {
    // Recording a checkpoint writes an append-only row that later runs compare
    // against. It must be an explicit choice, never an accident of calling
    // verify with no arguments.
    vi.mocked(apiClient.post).mockResolvedValueOnce(createMockResponse({ ok: true }))

    await auditChainService.verify()

    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/admin/audit/chain/verify',
      expect.objectContaining({ record_checkpoint: false }),
    )
  })
})

describe('isPlatformScopeError', () => {
  it('recognises the backend refusal on the response body', () => {
    expect(isPlatformScopeError({ data: { code: 'E_PLATFORM_SCOPE_REQUIRED' } })).toBe(true)
  })

  it('recognises the refusal on a flattened error', () => {
    expect(isPlatformScopeError({ code: 'E_PLATFORM_SCOPE_REQUIRED' })).toBe(true)
  })

  it('does not treat an ordinary failure as a scope refusal', () => {
    // A 500 must keep rendering as an error. Mistaking it for a scope refusal
    // would tell an operator the chain is "not for them" while it is actually
    // broken — the one message that must never be wrong here.
    expect(isPlatformScopeError({ status: 500, data: { code: 'E_INTERNAL' } })).toBe(false)
    expect(isPlatformScopeError(null)).toBe(false)
    expect(isPlatformScopeError(undefined)).toBe(false)
  })
})
