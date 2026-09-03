/**
 * Typed Event Bus for decoupled cross-module communication.
 *
 * Modules should emit and subscribe to domain events (e.g. 'auth:signout',
 * 'notification:received') without importing each other directly.
 *
 * This sits at the platform-core tier (Tier 3) so both feature modules
 * and platform services can access it without violating layer rules.
 */

export type EventHandler<T = unknown> = (payload: T) => void

/**
 * Platform Event Map — extend this interface in module augmentation
 * to add strongly-typed events per module.
 *
 * @example
 * declare module '@cap/platform-core' {
 *   interface PlatformEventMap {
 *     'billing:invoice-paid': { invoiceId: string; amount: number }
 *   }
 * }
 */
export interface PlatformEventMap {
  'auth:signout': { reason?: string }
  'auth:session-expired': { userId?: string }
  'auth:signin': { userId: string }
  'theme:mode-changed': { mode: 'light' | 'dark' | 'system' }
  'navigation:route-changed': { path: string; layout?: string }
  'module:registered': { moduleId: string }
  'module:unregistered': { moduleId: string }
}

type EventName = keyof PlatformEventMap | (string & {})
type PayloadFor<E extends EventName> = E extends keyof PlatformEventMap ? PlatformEventMap[E] : unknown

class EventBusImpl {
  private listeners = new Map<string, Set<EventHandler<any>>>()

  /**
   * Subscribe to a platform event. Returns an unsubscribe function.
   */
  on<E extends EventName>(event: E, handler: EventHandler<PayloadFor<E>>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)

    return () => {
      this.listeners.get(event)?.delete(handler)
      if (this.listeners.get(event)?.size === 0) {
        this.listeners.delete(event)
      }
    }
  }

  /**
   * Subscribe to a platform event for a single invocation, then auto-unsubscribe.
   */
  once<E extends EventName>(event: E, handler: EventHandler<PayloadFor<E>>): () => void {
    const wrappedHandler: EventHandler<PayloadFor<E>> = (payload) => {
      unsubscribe()
      handler(payload)
    }
    const unsubscribe = this.on(event, wrappedHandler)
    return unsubscribe
  }

  /**
   * Emit a platform event to all registered listeners.
   */
  emit<E extends EventName>(event: E, payload: PayloadFor<E>): void {
    const handlers = this.listeners.get(event)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(payload)
        } catch (error) {
          console.error(`[EventBus] Error in handler for event "${event}":`, error)
        }
      })
    }
  }

  /**
   * Remove all listeners for a specific event, or all events if none specified.
   */
  clear(event?: EventName): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }

  /**
   * Returns the count of listeners for a given event (useful for testing/debugging).
   */
  listenerCount(event: EventName): number {
    return this.listeners.get(event)?.size ?? 0
  }
}

/**
 * Singleton EventBus instance for the platform.
 */
export const EventBus = new EventBusImpl()
