import { describe, it, expect, vi, beforeEach } from 'vitest'
import sessionService, { normalizeUserSession } from './session.service'
import { eventBus } from '../../../domain-kernel/src/events/event-bus'
import { apiClient } from '@cap/platform-core'

vi.mock('@cap/platform-core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
    },
    ENDPOINTS: {
      auth: {
        sessions: '/api/auth/sessions',
        revokeSession: (id: string) => `/api/auth/sessions/${id}`,
        revokeAllSessions: '/api/auth/sessions/revoke-all',
      },
      user: {
        activityTimeline: '/api/user/activity-timeline',
        securityStatus: '/api/user/security-status',
        changePassword: '/api/user/change-password',
      },
    },
  }
})

describe('sessionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    eventBus.clear()
  })

  describe('normalizeUserSession', () => {
    it('normalizes mobile User-Agent properly', () => {
      const raw = {
        id: 101,
        ipAddress: '192.168.1.50',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
        city: 'San Francisco',
        country: 'United States',
        loginAt: '2026-08-28T12:00:00Z',
        isCurrentSession: true,
      }

      const normalized = normalizeUserSession(raw)
      expect(normalized.id).toBe('101')
      expect(normalized.deviceType).toBe('mobile')
      expect(normalized.browser).toBe('Safari')
      expect(normalized.ipAddress).toBe('192.168.1.50')
      expect(normalized.location).toBe('San Francisco, United States')
      expect(normalized.current).toBe(true)
    })

    it('normalizes desktop Chrome properly', () => {
      const raw = {
        id: 'sess-abc',
        ip_address: '10.0.0.1',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        city: 'New York',
        country: 'USA',
        current: false,
      }

      const normalized = normalizeUserSession(raw)
      expect(normalized.id).toBe('sess-abc')
      expect(normalized.deviceType).toBe('desktop')
      expect(normalized.browser).toBe('Chrome')
      expect(normalized.ipAddress).toBe('10.0.0.1')
      expect(normalized.current).toBe(false)
    })
  })

  describe('API endpoints', () => {
    it('fetches and normalizes sessions array', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        status: 200,
        data: [
          {
            id: 1,
            ipAddress: '127.0.0.1',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            current: true,
          },
          {
            id: 2,
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)',
            current: false,
          },
        ],
      } as any)

      const result = await sessionService.getSessions()
      expect(apiClient.get).toHaveBeenCalledWith('/api/auth/sessions')
      expect(result.data.sessions).toHaveLength(2)
      expect(result.data.current_session_id).toBe('1')
      expect(result.data.sessions[0].current).toBe(true)
      expect(result.data.sessions[1].deviceType).toBe('mobile')
    })

    it('revokes a single session and publishes SessionRevoked domain event', async () => {
      const events: any[] = []
      eventBus.subscribe('SessionRevoked', (evt) => {
        events.push(evt)
      })

      vi.mocked(apiClient.delete).mockResolvedValueOnce({
        status: 200,
        data: { message: 'Session has been terminated' },
      } as any)

      const result = await sessionService.revokeSession('123')
      expect(apiClient.delete).toHaveBeenCalledWith('/api/auth/sessions/123')
      expect(result.data.message).toBe('Session has been terminated')
      expect(events).toHaveLength(1)
      expect(events[0].payload.sessionId).toBe('123')
    })

    it('revokes all other sessions and publishes SessionRevoked domain event', async () => {
      const events: any[] = []
      eventBus.subscribe('SessionRevoked', (evt) => {
        events.push(evt)
      })

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        status: 200,
        data: { message: 'All other sessions have been revoked' },
      } as any)

      const result = await sessionService.revokeAllSessions()
      expect(apiClient.post).toHaveBeenCalledWith('/api/auth/sessions/revoke-all')
      expect(result.data.message).toBe('All other sessions have been revoked')
      expect(events).toHaveLength(1)
      expect(events[0].payload.sessionId).toBe('all-sessions')
    })

    it('fetches activity timeline', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        status: 200,
        data: [
          { id: 1, action: 'user_login', created_at: '2026-08-28T12:00:00Z' },
        ],
      } as any)

      const result = await sessionService.getActivityTimeline()
      expect(apiClient.get).toHaveBeenCalledWith('/api/user/activity-timeline')
      expect(result.data).toHaveLength(1)
      expect(result.data[0].action).toBe('user_login')
    })

    it('fetches security status', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        status: 200,
        data: {
          mfaEnabled: true,
          emailVerified: true,
          activeSessions: 3,
          passkeys: 1,
          passwordLastChangedAt: '2026-08-01T00:00:00Z',
        },
      } as any)

      const result = await sessionService.getSecurityStatus()
      expect(apiClient.get).toHaveBeenCalledWith('/api/user/security-status')
      expect(result.data.mfaEnabled).toBe(true)
      expect(result.data.activeSessions).toBe(3)
    })

    it('changes password', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        status: 200,
        data: { message: 'Password updated successfully' },
      } as any)

      const result = await sessionService.changePassword({
        currentPassword: 'OldPassword123!',
        password: 'NewPassword123!',
      })

      expect(apiClient.post).toHaveBeenCalledWith('/api/user/change-password', {
        currentPassword: 'OldPassword123!',
        password: 'NewPassword123!',
      })
      expect(result.data.message).toBe('Password updated successfully')
    })

    it('deactivates account and emits SessionRevoked event', async () => {
      const events: any[] = []
      eventBus.subscribe('SessionRevoked', (evt) => {
        events.push(evt)
      })

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        status: 200,
        data: { message: 'Account deactivated successfully' },
      } as any)

      const result = await sessionService.deactivateAccount()
      expect(apiClient.post).toHaveBeenCalledWith('/api/user/deactivate', {})
      expect(result.data.message).toBe('Account deactivated successfully')
      expect(events).toHaveLength(1)
      expect(events[0].payload.sessionId).toBe('current-session')
    })
  })
})
