// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RbacSubscriber } from './rbac.subscriber'
import {
  AuthEventTypes,
  SessionEventTypes,
  TokenEventTypes,
} from '../../../../domain-kernel/src/events/auth-events'

describe('RbacSubscriber - Domain Event Bus Invalidation', () => {
  let mockQueryClient: any

  beforeEach(() => {
    mockQueryClient = {
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
    }
  })

  it('invalidates rbac, user, me, and permissions caches on USER_AUTHENTICATED', async () => {
    const subscriber = new RbacSubscriber({ queryClient: mockQueryClient })

    await subscriber.handleUserAuthenticated({
      id: 'evt-auth-1',
      type: AuthEventTypes.USER_AUTHENTICATED,
      version: 'v1',
      timestamp: new Date().toISOString(),
      payload: {
        userId: 'u-101',
        email: 'admin@cap.io',
        factors: ['password'],
        method: 'password',
        sessionId: 'sess-1',
      },
    })

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['admin', 'rbac'] })
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['admin', 'users'] })
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['auth', 'me'] })
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['user', 'permissions'] })
  })

  it('invalidates session and me caches on SESSION_CREATED', async () => {
    const subscriber = new RbacSubscriber({ queryClient: mockQueryClient })

    await subscriber.handleSessionCreated({
      id: 'evt-sess-1',
      type: SessionEventTypes.SESSION_CREATED,
      version: 'v1',
      timestamp: new Date().toISOString(),
      payload: {
        sessionId: 'sess-abc',
        userId: 'u-101',
      },
    })

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['admin', 'sessions'] })
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['auth', 'me'] })
  })

  it('invalidates session, rbac, and user permissions on SESSION_REVOKED', async () => {
    const subscriber = new RbacSubscriber({ queryClient: mockQueryClient })

    await subscriber.handleSessionRevoked({
      id: 'evt-sess-2',
      type: SessionEventTypes.SESSION_REVOKED,
      version: 'v1',
      timestamp: new Date().toISOString(),
      payload: {
        sessionId: 'sess-abc',
        userId: 'u-101',
        reason: 'admin_revocation',
      },
    })

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['admin', 'sessions'] })
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['admin', 'rbac'] })
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['auth', 'me'] })
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['user', 'permissions'] })
  })

  it('invalidates developer tokens and api keys on TOKEN_ISSUED', async () => {
    const subscriber = new RbacSubscriber({ queryClient: mockQueryClient })

    await subscriber.handleTokenIssued({
      id: 'evt-tok-1',
      type: TokenEventTypes.TOKEN_ISSUED,
      version: 'v1',
      timestamp: new Date().toISOString(),
      payload: {
        tokenId: 'token-999',
        userId: 'u-101',
        tokenType: 'developer_api_key',
        expiresAt: new Date().toISOString(),
      },
    })

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['admin', 'developer', 'apiKeys'] })
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['admin', 'developer-api-keys'] })
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['admin', 'scim', 'tokens'] })
  })

  it('allows dynamic updating of queryClient and config', async () => {
    const subscriber = new RbacSubscriber()
    subscriber.setQueryClient(mockQueryClient)
    subscriber.setConfig({ tenantId: 'tenant-x' })

    await subscriber.handleUserAuthenticated({
      id: 'evt-auth-2',
      type: AuthEventTypes.USER_AUTHENTICATED,
      version: 'v1',
      timestamp: new Date().toISOString(),
      payload: {
        userId: 'u-102',
        email: 'user@tenant-x.io',
        factors: ['password'],
        method: 'password',
        sessionId: 'sess-2',
      },
    })

    expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['admin', 'rbac'] })
  })
})
