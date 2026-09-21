/**
 * Persisted enable/disable state for assembled CAP modules.
 *
 * Disabling a module removes its routes, navigation entries and
 * command-palette entries from the assembled shell on the next render; the
 * module itself stays in the registry so the Module Management screen can
 * still list it and switch it back on.
 */

const STORAGE_KEY = 'serafort.modules.disabled'

/**
 * Modules the shell cannot boot without. `auth-module` owns sign-in and the
 * whole admin surface, `landing-module` owns the public entry point, and
 * `dashboard-module` owns the post-login home route, so none of the three can
 * be switched off from the UI.
 */
export const CORE_MODULE_IDS: readonly string[] = [
  'auth-module',
  'landing-module',
  'dashboard-module',
]

export const isCoreModule = (moduleId: string): boolean => CORE_MODULE_IDS.includes(moduleId)

type Listener = () => void

class ModuleEnablementService {
  private disabled: Set<string> | null = null
  private listeners = new Set<Listener>()
  private storageBound = false

  private readStorage(): Set<string> {
    if (typeof window === 'undefined' || !window.localStorage) return new Set()
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return new Set()
      const parsed: unknown = JSON.parse(raw)
      if (!Array.isArray(parsed)) return new Set()
      return new Set(parsed.filter((id): id is string => typeof id === 'string'))
    } catch {
      // Private mode, blocked site data or corrupt payload: treat as "nothing disabled".
      return new Set()
    }
  }

  private writeStorage(ids: Set<string>): void {
    if (typeof window === 'undefined' || !window.localStorage) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
    } catch {
      // Persisting is best-effort; the in-memory state still applies for this session.
    }
  }

  /** Keeps two tabs of the same app in agreement about what is switched off. */
  private bindStorageSync(): void {
    if (this.storageBound || typeof window === 'undefined') return
    this.storageBound = true
    window.addEventListener('storage', (event) => {
      if (event.key !== STORAGE_KEY) return
      this.disabled = this.readStorage()
      this.notify()
    })
  }

  private get state(): Set<string> {
    if (!this.disabled) {
      this.disabled = this.readStorage()
      this.bindStorageSync()
    }
    return this.disabled
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener()
      } catch (err) {
        console.error('Module enablement listener failed:', err)
      }
    })
  }

  public isEnabled(moduleId: string): boolean {
    if (isCoreModule(moduleId)) return true
    return !this.state.has(moduleId)
  }

  public getDisabledIds(): string[] {
    return [...this.state]
  }

  /**
   * Switches a module on or off and persists the choice.
   * Throws for core modules rather than silently reporting success.
   */
  public setEnabled(moduleId: string, enabled: boolean): void {
    if (!enabled && isCoreModule(moduleId)) {
      throw new Error(`"${moduleId}" is a core platform module and cannot be disabled.`)
    }

    const next = new Set(this.state)
    if (enabled) {
      if (!next.delete(moduleId)) return
    } else {
      if (next.has(moduleId)) return
      next.add(moduleId)
    }

    this.disabled = next
    this.writeStorage(next)
    this.notify()
  }

  /** Subscribe to enablement changes. Returns an unsubscribe function. */
  public subscribe(listener: Listener): () => void {
    this.bindStorageSync()
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /** Test helper: drops persisted and in-memory state. */
  public reset(): void {
    this.disabled = new Set()
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(STORAGE_KEY)
      } catch {
        // ignore
      }
    }
    this.notify()
  }
}

export const moduleEnablementService = new ModuleEnablementService()
