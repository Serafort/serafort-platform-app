import { describe, it, expect } from 'vitest'
import { AppPaths, UNIMPLEMENTED_PATHS } from '@cap/shared-types'
import { authRouteConfig } from '../routes/routes'

/**
 * Enforces the one rule in @cap/shared-types/routes.ts: a URL is written once,
 * in `AppPaths`, and everything else derives from it.
 *
 * WHY THIS TEST IS SHAPED THIS WAY
 * --------------------------------
 * The previous version of this file compared `AppPaths` against the auth
 * module's `Path` object key-by-dotted-key, and passed while 52 `AppPaths`
 * entries pointed at URLs no router served. It could not see them: drifted
 * entries almost never share a key name across the two objects -- `AppPaths`
 * called it `user.linkedAccounts` while the router registered
 * `user.profile.linkedAccounts` -- so the comparison silently skipped exactly
 * the pairs that had drifted, and "compares a meaningful number of keys" kept
 * that vacuum from being obvious.
 *
 * So this version ignores key names entirely and compares VALUES against the
 * set of paths the router actually registers. A path that cannot be reached is
 * a bug whatever it happens to be called.
 */

type PathTree = { [key: string]: string | PathTree }

const flatten = (tree: PathTree, prefix = '', out: Record<string, string> = {}) => {
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') out[path] = value
    else if (value && typeof value === 'object') flatten(value, path, out)
  }
  return out
}

/**
 * Namespaces owned by modules other than @cap/module-auth. This test can only
 * see the auth module's router (a tier 5 package may not import its siblings),
 * so these are out of scope here and are covered by their own modules.
 */
const FOREIGN_NAMESPACES = ['landing', 'dashboard', 'theme', 'widgetStudio']

describe('AppPaths <-> auth module route parity', () => {
  const registeredPaths = new Set(authRouteConfig.map((route) => route.path))
  const claimed = flatten(AppPaths as unknown as PathTree)

  const authOwned = Object.entries(claimed).filter(
    ([key]) => !FOREIGN_NAMESPACES.some((ns) => key === ns || key.startsWith(`${ns}.`)),
  )

  it('registers a meaningful number of routes', () => {
    // Guards the guard: if authRouteConfig came back empty, every assertion
    // below would pass vacuously.
    expect(registeredPaths.size).toBeGreaterThan(80)
    expect(authOwned.length).toBeGreaterThan(80)
  })

  it('every AppPaths entry resolves to a route the router registers', () => {
    const unreachable = authOwned
      .filter(([, value]) => !registeredPaths.has(value))
      .filter(([, value]) => !(value in UNIMPLEMENTED_PATHS))
      .map(([key, value]) => `${key} = "${value}" is in AppPaths but no route serves it`)

    expect(unreachable).toEqual([])
  })

  it('every registered route path comes from AppPaths', () => {
    // Catches a URL literal typed straight into a routes.tsx, which would
    // reintroduce a second source of truth.
    const claimedValues = new Set(Object.values(claimed))
    const undeclared = [...registeredPaths]
      .filter((path) => !claimedValues.has(path as string))
      .map((path) => `"${path}" is registered by the router but absent from AppPaths`)

    expect(undeclared).toEqual([])
  })

  it('registers each path exactly once', () => {
    // Two <Route> entries for one URL means a screen silently shadows another
    // and the guard on the losing entry never runs.
    const seen = new Map<string, number>()
    for (const route of authRouteConfig) {
      seen.set(route.path, (seen.get(route.path) ?? 0) + 1)
    }
    const duplicates = [...seen.entries()]
      .filter(([, count]) => count > 1)
      .map(([path, count]) => `"${path}" is registered ${count} times`)

    expect(duplicates).toEqual([])
  })

  it('documents every unimplemented path it excuses', () => {
    // UNIMPLEMENTED_PATHS is an allowlist, so it must not outlive the gap it
    // describes: once a screen is routed, the entry has to go.
    const stale = Object.keys(UNIMPLEMENTED_PATHS).filter((path) => registeredPaths.has(path))
    expect(stale).toEqual([])
  })
})
