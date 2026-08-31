import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@cap/platform-core'
import adminMonitoringService from './admin-monitoring.service'

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

describe('adminMonitoringService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getOverview fetches summary stats', async () => {
    const mockOverview = {
      totalUsers: 1500,
      activeSessions: 320,
      mfaAdoptionRate: 78.5,
      healthScore: 95,
      totalAlerts: 4,
      unresolvedAlerts: 1,
      signIns24h: 890,
      failedSignIns24h: 12,
    }
    vi.mocked(apiClient.get).mockResolvedValueOnce(createMockResponse(mockOverview))

    const res = await adminMonitoringService.getOverview()
    expect(apiClient.get).toHaveBeenCalledWith('/api/admin/statistics/summary')
    expect(res.data).toEqual(mockOverview)
  })

  it('getSessionStatistics fetches session distribution metrics', async () => {
    const mockSessionStats = {
      activeCount: 320,
      rememberedCount: 150,
      deviceBreakdown: { desktop: 200, mobile: 120 },
      browserBreakdown: { Chrome: 220, Safari: 100 },
      osBreakdown: { Windows: 150, macOS: 120, iOS: 50 },
      geographicBreakdown: [{ country: 'US', count: 180 }],
    }
    vi.mocked(apiClient.get).mockResolvedValueOnce(createMockResponse(mockSessionStats))

    const res = await adminMonitoringService.getSessionStatistics()
    expect(apiClient.get).toHaveBeenCalledWith('/api/admin/statistics/session-statistics')
    expect(res.data).toEqual(mockSessionStats)
  })

  it('getTrends queries trend timeline by range', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(
      createMockResponse([{ timestamp: '2026-08-28', signIns: 50, failedSignIns: 2, mfaChallenges: 48, newUsers: 5 }])
    )

    const res = await adminMonitoringService.getTrends({ range: '30d' })
    expect(apiClient.get).toHaveBeenCalledWith('/api/admin/statistics/trends?range=30d')
    expect(res.data).toHaveLength(1)
  })

  it('getMfaStats fetches adoption rate and method distribution', async () => {
    const mockMfa = {
      totpCount: 500,
      smsCount: 200,
      passkeyCount: 350,
      recoveryCodesUsed: 15,
      adoptionRatePercentage: 82.4,
      enforcedUsersCount: 400,
      voluntaryUsersCount: 650,
    }
    vi.mocked(apiClient.get).mockResolvedValueOnce(createMockResponse(mockMfa))

    const res = await adminMonitoringService.getMfaStats()
    expect(apiClient.get).toHaveBeenCalledWith('/api/admin/statistics/mfa')
    expect(res.data).toEqual(mockMfa)
  })

  it('exportAuditLogs posts export configuration', async () => {
    const mockExportRes = {
      jobId: 'job-9871',
      status: 'ready' as const,
      downloadUrl: '/api/admin/audit-logs/download/job-9871',
    }
    vi.mocked(apiClient.post).mockResolvedValueOnce(createMockResponse(mockExportRes))

    const res = await adminMonitoringService.exportAuditLogs({ format: 'csv', startDate: '2026-08-01' })
    expect(apiClient.post).toHaveBeenCalledWith('/api/admin/audit-logs/export', {
      format: 'csv',
      startDate: '2026-08-01',
    })
    expect(res.data).toEqual(mockExportRes)
  })

  it('acknowledgeAlert posts acknowledge mutation', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce(createMockResponse({ message: 'Alert acknowledged' }))

    const res = await adminMonitoringService.acknowledgeAlert(42)
    expect(apiClient.post).toHaveBeenCalledWith('/api/admin/alerts/42/acknowledge')
    expect(res.data.message).toBe('Alert acknowledged')
  })

  it('sendTestEmail dispatches transactional test email', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce(
      createMockResponse({ message: 'Email queued', messageId: 'msg-555' })
    )

    const res = await adminMonitoringService.sendTestEmail({
      templateId: 'welcome',
      recipientEmail: 'tester@cap-saas.com',
    })
    expect(apiClient.post).toHaveBeenCalledWith('/api/admin/email/test', {
      templateId: 'welcome',
      recipientEmail: 'tester@cap-saas.com',
    })
    expect(res.data.messageId).toBe('msg-555')
  })
})
