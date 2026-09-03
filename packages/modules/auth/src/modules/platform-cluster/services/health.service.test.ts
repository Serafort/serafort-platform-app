import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@cap/platform-core'
import healthService from './health.service'

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

describe('healthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getDetailed fetches detailed health breakdown', async () => {
    const mockHealth = {
      status: 'healthy' as const,
      uptime: 3600,
      services: {
        database: { status: 'healthy' as const, latencyMs: 3 },
        redis: { status: 'healthy' as const, latencyMs: 1 },
      },
    }
    vi.mocked(apiClient.get).mockResolvedValueOnce(createMockResponse(mockHealth))

    const res = await healthService.getDetailed()
    expect(apiClient.get).toHaveBeenCalledWith('/api/health/detailed')
    expect(res.data.status).toBe('healthy')
  })

  it('getQueueStatus fetches queue metrics', async () => {
    const mockQueue = {
      status: 'healthy' as const,
      waitingCount: 2,
      activeCount: 1,
      failedCount: 0,
      completedCount: 500,
    }
    vi.mocked(apiClient.get).mockResolvedValueOnce(createMockResponse(mockQueue))

    const res = await healthService.getQueueStatus()
    expect(apiClient.get).toHaveBeenCalledWith('/api/health/queue')
    expect(res.data.waitingCount).toBe(2)
  })

  it('getSecurityHealth fetches security compliance checks', async () => {
    const mockSecurity = {
      status: 'healthy' as const,
      score: 92,
      checks: [{ name: 'MFA Enforced', passed: true, severity: 'high' as const }],
    }
    vi.mocked(apiClient.get).mockResolvedValueOnce(createMockResponse(mockSecurity))

    const res = await healthService.getSecurityHealth()
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/security/health')
    expect(res.data.score).toBe(92)
  })
})
