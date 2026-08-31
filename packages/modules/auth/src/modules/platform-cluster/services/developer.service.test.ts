import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@cap/platform-core'
import developerService from './developer.service'

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

describe('developerService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getClients fetches client applications', async () => {
    const mockClients = [{ id: 'app_1', name: 'Mobile App' }]
    vi.mocked(apiClient.get).mockResolvedValueOnce(createMockResponse(mockClients))

    const res = await developerService.getClients()
    expect(apiClient.get).toHaveBeenCalledWith('/api/admin/clients')
    expect(res.data).toEqual(mockClients)
  })

  it('rotateClientSecret triggers secret rotation', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce(createMockResponse({ clientSecret: 'sec_new_12345' }))

    const res = await developerService.rotateClientSecret('app_1')
    expect(apiClient.post).toHaveBeenCalledWith('/api/admin/clients/app_1/rotate-secret')
    expect(res.data.clientSecret).toBe('sec_new_12345')
  })

  it('getScopes fetches permission scopes', async () => {
    const mockScopes = [{ id: 1, name: 'openid' }, { id: 2, name: 'profile' }]
    vi.mocked(apiClient.get).mockResolvedValueOnce(createMockResponse(mockScopes))

    const res = await developerService.getScopes()
    expect(apiClient.get).toHaveBeenCalledWith('/api/admin/scopes')
    expect(res.data).toHaveLength(2)
  })

  it('testWebhook posts test webhook ping', async () => {
    const mockResult = { success: true, statusCode: 200, responseTimeMs: 45 }
    vi.mocked(apiClient.post).mockResolvedValueOnce(createMockResponse(mockResult))

    const res = await developerService.testWebhook(12)
    expect(apiClient.post).toHaveBeenCalledWith('/api/admin/webhooks/12/test')
    expect(res.data.success).toBe(true)
  })
})
