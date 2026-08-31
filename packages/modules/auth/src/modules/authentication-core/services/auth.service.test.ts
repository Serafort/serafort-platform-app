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
    const userAuthenticated: any[] = []
    const sessionCreated: any[] = []
    const tokenIssued: any[] = []
    eventBus.subscribe('UserAuthenticated', (evt) => { userAuthenticated.push(evt) })
    eventBus.subscribe('SessionCreated', (evt) => { sessionCreated.push(evt) })
    eventBus.subscribe('TokenIssued', (evt) => { tokenIssued.push(evt) })

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      status: 200,
      data: {
        user: { id: 'usr-123', email: 'test@example.com' },
        session: { id: 'sess-456', expiresAt: '2026-12-31T23:59:59Z' },
        token: 'jwt-access-token',
      },
    } as any)

    await authService.signin({ email: 'test@example.com', password: 'password123' })

    expect(userAuthenticated).toHaveLength(1)
    expect(userAuthenticated[0].payload).toMatchObject({
      userId: 'usr-123',
      email: 'test@example.com',
      method: 'password',
      sessionId: 'sess-456',
    })

    expect(sessionCreated).toHaveLength(1)
    expect(sessionCreated[0].payload).toMatchObject({
      sessionId: 'sess-456',
      userId: 'usr-123',
      expiresAt: '2026-12-31T23:59:59Z',
    })

    expect(tokenIssued).toHaveLength(1)
    expect(tokenIssued[0].payload).toMatchObject({
      tokenId: 'access-token',
      userId: 'usr-123',
      tokenType: 'access',
    })
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
    const sessionRevoked: any[] = []
    eventBus.subscribe('SessionRevoked', (evt) => { sessionRevoked.push(evt) })
    vi.mocked(apiClient.post).mockResolvedValueOnce({ status: 200, data: { message: 'Success' } } as any)

    await authService.signout()

    expect(sessionRevoked).toHaveLength(1)
    expect(sessionRevoked[0].payload).toMatchObject({
      sessionId: 'current-session',
      userId: 'current-user',
      reason: 'user_logout',
    })
  })

  it('publishes SessionRevoked event when revokeSession is called', async () => {
    const sessionRevoked: any[] = []
    eventBus.subscribe('SessionRevoked', (evt) => { sessionRevoked.push(evt) })
    vi.mocked(apiClient.delete).mockResolvedValueOnce({ status: 200, data: { message: 'Success' } } as any)

    await authService.revokeSession('sess-999')

    expect(sessionRevoked).toHaveLength(1)
    expect(sessionRevoked[0].payload).toMatchObject({
      sessionId: 'sess-999',
      userId: 'current-user',
      reason: 'admin_revoked',
    })
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
