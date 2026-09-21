import { describe, it, expect } from 'vitest'
import { AppPaths } from '@cap/shared-types'
import { Path as ModulePath } from '../routes/path'

/**
 * Guards the tier 0 route registry against drift.
 *
 * `AppPaths` in @cap/shared-types is documented as the single source of truth
 * for application routes, but the router actually registers the values in this
 * module's own `Path` objects. Those two had silently diverged on 49 keys --
 * `AppPaths` claimed `/auth/login` while the router served `/auth/sign-in`, and
 * so on -- which made the "SSOT" actively misleading: anything navigating via
 * `AppPaths` landed on routes that were never registered.
 *
 * This test lives in the auth module rather than in shared-types because the
 * comparison needs both sides, and shared-types (tier 0) may not import a
 * feature module (tier 5). See scripts/check-tier-boundaries.mjs.
 *
 * If this fails, fix `AppPaths` to match the registered route -- not the other
 * way round -- unless you genuinely intend to change a live URL.
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

describe('AppPaths <-> auth module route parity', () => {
  const registered = flatten(ModulePath as unknown as PathTree)
  const claimed = flatten(AppPaths as unknown as PathTree)

  // AppPaths also carries landing/dashboard/widget-studio entries this module
  // never declares, so only keys present on both sides are comparable.
  const comparable = Object.keys(claimed).filter((key) => registered[key] !== undefined)

  it('compares a meaningful number of keys', () => {
    // Guards the guard: if the shape of either object changes such that nothing
    // lines up, the parity assertion below would vacuously pass.
    expect(comparable.length).toBeGreaterThan(90)
  })

  it('AppPaths matches every route the auth module actually registers', () => {
    const drift = comparable
      .filter((key) => claimed[key] !== registered[key])
      .map((key) => `${key}: AppPaths has "${claimed[key]}", router registers "${registered[key]}"`)

    expect(drift).toEqual([])
  })
})
