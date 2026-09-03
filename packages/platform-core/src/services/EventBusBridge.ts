import { useAppStore, type AppStore } from '@cap/platform-store'
import { EventBus } from './EventBus'

/**
 * Wires Zustand store state changes to the platform EventBus.
 *
 * This bridge exists at the platform-core tier (Tier 3) so that
 * lower-tier packages (@cap/platform-store at Tier 1) don't need
 * to know about the EventBus — the subscription runs here.
 *
 * Call this once during app bootstrap (e.g. in Providers.tsx or AppAssembly).
 */
let bridgeInitialized = false

export function initEventBusBridge(): void {
  if (bridgeInitialized) return
  bridgeInitialized = true

  // Track auth state transitions to emit events
  let wasAuthenticated = useAppStore.getState().isAuthenticated

  useAppStore.subscribe((state: AppStore) => {
    const isNowAuthenticated = state.isAuthenticated

    if (wasAuthenticated && !isNowAuthenticated) {
      EventBus.emit('auth:signout', { reason: 'state-transition' })
    }

    if (!wasAuthenticated && isNowAuthenticated) {
      EventBus.emit('auth:signin', { userId: state.user?.id || (state.user as any)?._id || 'unknown' })
    }

    wasAuthenticated = isNowAuthenticated
  })
}
