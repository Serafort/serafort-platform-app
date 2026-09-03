import { eventBus, type DomainEvent } from '../../../../domain-kernel/src/events/event-bus'
import {
  AuthEventTypes,
  SessionEventTypes,
  TokenEventTypes,
  UserAuthenticatedPayload,
  SessionCreatedPayload,
  SessionRevokedPayload,
  TokenIssuedPayload,
} from '../../../../domain-kernel/src/events/auth-events'
import type { QueryClient } from '@tanstack/react-query'

export interface RbacSubscriberConfig {
  tenantId?: string
  queryClient?: QueryClient
}

export class RbacSubscriber {
  private queryClient: QueryClient | null = null
  private config: RbacSubscriberConfig = {}

  constructor(config?: RbacSubscriberConfig) {
    if (config) {
      this.config = config
      if (config.queryClient) {
        this.queryClient = config.queryClient
      }
    }
  }

  setQueryClient(client: QueryClient): void {
    this.queryClient = client
  }

  setConfig(config: Partial<RbacSubscriberConfig>): void {
    this.config = { ...this.config, ...config }
    if (config.queryClient) {
      this.queryClient = config.queryClient
    }
  }

  async handleUserAuthenticated(_event: DomainEvent<unknown>): Promise<void> {
    if (this.queryClient) {
      await Promise.all([
        this.queryClient.invalidateQueries({ queryKey: ['admin', 'rbac'] }),
        this.queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
        this.queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }),
        this.queryClient.invalidateQueries({ queryKey: ['user', 'permissions'] }),
      ])
    }
  }

  async handleSessionCreated(_event: DomainEvent<unknown>): Promise<void> {
    if (this.queryClient) {
      await Promise.all([
        this.queryClient.invalidateQueries({ queryKey: ['admin', 'sessions'] }),
        this.queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }),
      ])
    }
  }

  async handleSessionRevoked(_event: DomainEvent<unknown>): Promise<void> {
    if (this.queryClient) {
      await Promise.all([
        this.queryClient.invalidateQueries({ queryKey: ['admin', 'sessions'] }),
        this.queryClient.invalidateQueries({ queryKey: ['admin', 'rbac'] }),
        this.queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }),
        this.queryClient.invalidateQueries({ queryKey: ['user', 'permissions'] }),
      ])
    }
  }

  async handleTokenIssued(_event: DomainEvent<unknown>): Promise<void> {
    if (this.queryClient) {
      await Promise.all([
        this.queryClient.invalidateQueries({ queryKey: ['admin', 'developer', 'apiKeys'] }),
        this.queryClient.invalidateQueries({ queryKey: ['admin', 'developer-api-keys'] }),
        this.queryClient.invalidateQueries({ queryKey: ['admin', 'scim', 'tokens'] }),
      ])
    }
  }

  subscribe(): void {
    eventBus.subscribe(AuthEventTypes.USER_AUTHENTICATED, this.handleUserAuthenticated.bind(this))
    eventBus.subscribe(SessionEventTypes.SESSION_CREATED, this.handleSessionCreated.bind(this))
    eventBus.subscribe(SessionEventTypes.SESSION_REVOKED, this.handleSessionRevoked.bind(this))
    eventBus.subscribe(TokenEventTypes.TOKEN_ISSUED, this.handleTokenIssued.bind(this))
  }

  unsubscribe(): void {
    eventBus.unsubscribe(AuthEventTypes.USER_AUTHENTICATED, this.handleUserAuthenticated.bind(this))
    eventBus.unsubscribe(SessionEventTypes.SESSION_CREATED, this.handleSessionCreated.bind(this))
    eventBus.unsubscribe(SessionEventTypes.SESSION_REVOKED, this.handleSessionRevoked.bind(this))
    eventBus.unsubscribe(TokenEventTypes.TOKEN_ISSUED, this.handleTokenIssued.bind(this))
  }
}

export const rbacSubscriber = new RbacSubscriber()
rbacSubscriber.subscribe()
