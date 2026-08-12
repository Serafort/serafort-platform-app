import { describe, it, expect, vi, beforeEach } from 'vitest'
import authService from './auth.service'
import { eventBus } from '../../../domain-kernel/src/events/event-bus'
import { rbacSubscriber } from '../../authorization-engine/src/services/rbac.subscriber'
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
    },
    TenantService: {
      verifyTenantAuthFeature: vi.fn(() => true),
    },
  }
})


describe('authService EventBus Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    eventBus.clear()
    rbacSubscriber.subscribe()
  })

  it('publishes UserAuthenticated, SessionCreated, and TokenIssued events on successful signin', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      status: 200,
      data: {
        user: { id: 'usr-123', email: 'test@example.com' },
        session: { id: 'sess-456', expiresAt: '2026-12-31T23:59:59Z' },
        token: 'jwt-access-token',
      },
    } as any)

    await authService.signin({ email: 'test@example.com', password: 'password123' })

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[RbacSubscriber] User usr-123 authenticated, session: sess-456')
    )
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[RbacSubscriber] Session sess-456 created for user usr-123')
    )
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[RbacSubscriber] access token issued for user usr-123')
    )

    consoleSpy.mockRestore()
  })

  it('publishes AuthenticationFailed event on signin failure', async () => {
    const publishedEvents: any[] = []
    const handler = (evt: any) => {
      publishedEvents.push(evt)
    }
    eventBus.subscribe('AuthenticationFailed', handler)

    vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Invalid credentials'))

    await expect(
      authService.signin({ email: 'wrong@example.com', password: 'wrong' })
    ).rejects.toThrow('Invalid credentials')

    expect(publishedEvents.length).toBe(1)
    expect(publishedEvents[0].payload).toEqual({
      email: 'wrong@example.com',
      reason: 'invalid_credentials',
    })
  })

  it('publishes SessionRevoked event on signout', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.mocked(apiClient.post).mockResolvedValueOnce({ status: 200, data: { message: 'Success' } } as any)

    await authService.signout()

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[RbacSubscriber] Session current-session revoked for user current-user, reason: user_logout')
    )

    consoleSpy.mockRestore()
  })

  it('publishes SessionRevoked event when revokeSession is called', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.mocked(apiClient.delete).mockResolvedValueOnce({ status: 200, data: { message: 'Success' } } as any)

    await authService.revokeSession('sess-999')

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[RbacSubscriber] Session sess-999 revoked for user current-user, reason: admin_revoked')
    )

    consoleSpy.mockRestore()
  })

  it('publishes TokenRefreshed event when refreshToken succeeds', async () => {
    const publishedEvents: any[] = []
    eventBus.subscribe('TokenRefreshed', (evt) => {
      publishedEvents.push(evt)
    })

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      status: 200,
      data: { token: 'new-jwt-token', user: { id: 'usr-123' } },
    } as any)

    await authService.refreshToken()

    expect(publishedEvents.length).toBe(1)
    expect(publishedEvents[0].payload.newTokenId).toBe('new-jwt-token')
    expect(publishedEvents[0].payload.userId).toBe('usr-123')
  })

  it('publishes UserAuthenticated event and commits tokens when handleLoginSuccess is called', async () => {
    const publishedEvents: any[] = []
    eventBus.subscribe('UserAuthenticated', (evt) => {
      publishedEvents.push(evt)
    })

    await authService.handleLoginSuccess({
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      user: { id: 'user-789', role: 'admin' },
      tenantId: 'tenant-001',
    })

    expect(publishedEvents.length).toBe(1)
    expect(publishedEvents[0].payload.userId).toBe('user-789')
    expect(publishedEvents[0].payload.role).toBe('admin')
    expect(publishedEvents[0].payload.tenantId).toBe('tenant-001')
  })
})
