// @vitest-environment jsdom
import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import adminMonitoringService from '../services/admin-monitoring.service'
import {
  useAdminOverviewQuery,
  useAdminMfaStatsQuery,
  useAdminAuditLogsQuery,
  useAcknowledgeAlertMutation,
} from './useAdminMonitoringQuery'

vi.mock('../services/admin-monitoring.service', () => ({
  default: {
    getOverview: vi.fn(),
    getMfaStats: vi.fn(),
    getAuditLogs: vi.fn(),
    getAlerts: vi.fn(),
    acknowledgeAlert: vi.fn(),
  },
}))

const createMockResponse = (data: any) => ({
  data,
  status: 200,
  statusText: 'OK',
  ok: true,
  headers: new Headers(),
  config: {} as any,
})

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useAdminMonitoringQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('useAdminOverviewQuery returns overview data', async () => {
    const mockData = {
      totalUsers: 100,
      activeSessions: 20,
      mfaAdoptionRate: 80,
      healthScore: 99,
      totalAlerts: 2,
      unresolvedAlerts: 0,
      signIns24h: 50,
      failedSignIns24h: 1,
    }
    vi.mocked(adminMonitoringService.getOverview).mockResolvedValueOnce(
      createMockResponse(mockData),
    )

    const { result } = renderHook(() => useAdminOverviewQuery(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockData)
  })

  it('useAdminMfaStatsQuery returns MFA metrics', async () => {
    // Snake_case, matching what StatsController.mfaStats actually returns.
    // The previous fixture asserted a camelCase shape the endpoint has never
    // produced, so it passed while the real screen read `undefined` from every
    // field and fell back to placeholder numbers.
    const mockMfa = {
      total_users: 100,
      total_enabled: 80,
      totp_count: 50,
      passkey_count: 30,
      sms_count: 20,
      recovery_codes_used: 5,
      adoption_rate: 80,
      daily_challenges: [{ date: '2026-08-28', count: 12 }],
    }
    vi.mocked(adminMonitoringService.getMfaStats).mockResolvedValueOnce(createMockResponse(mockMfa))

    const { result } = renderHook(() => useAdminMfaStatsQuery(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.adoption_rate).toBe(80)
    expect(result.current.data?.totp_count).toBe(50)
    expect(result.current.data?.daily_challenges).toHaveLength(1)
  })

  it('useAdminAuditLogsQuery handles array and object payloads', async () => {
    const mockLogs = [
      {
        id: 1,
        action: 'login',
        actor: 'user@test.com',
        status: 'success' as const,
        timestamp: '2026-08-28',
      },
    ]
    vi.mocked(adminMonitoringService.getAuditLogs).mockResolvedValueOnce(
      createMockResponse(mockLogs),
    )

    const { result } = renderHook(() => useAdminAuditLogsQuery({ limit: 10 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.logs).toHaveLength(1)
    expect(result.current.data?.logs[0].actor).toBe('user@test.com')
  })

  it('useAcknowledgeAlertMutation calls service and triggers success', async () => {
    vi.mocked(adminMonitoringService.acknowledgeAlert).mockResolvedValueOnce(
      createMockResponse({ message: 'Alert acknowledged' }),
    )

    const { result } = renderHook(() => useAcknowledgeAlertMutation(), {
      wrapper: createWrapper(),
    })
    await result.current.mutateAsync(5)

    expect(adminMonitoringService.acknowledgeAlert).toHaveBeenCalledWith(5)
  })
})
