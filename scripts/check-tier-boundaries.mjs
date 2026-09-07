#!/usr/bin/env node
/**
 * Tier boundary gate.
 *
 * Enforces the monorepo's layering rule: a package may import only packages
 * with a strictly lower tier ordinal. Same-tier imports are reported as
 * warnings (they are legal but couple siblings); upward imports are errors.
 *
 * Why this exists as a standalone script rather than only an ESLint rule:
 * only some workspace packages carry an ESLint config, `pnpm -r run lint`
 * fails repo-wide for unrelated pre-existing reasons, and this script's own
 * import scan catches bare-specifier violations directly without depending on
 * ESLint's module resolution at all. It runs safely in CI on its own.
 *
 * `eslint.config.js` imports TIERS/PACKAGE_DIRS from this file to drive
 * `eslint-plugin-boundaries`, which is a genuinely complementary second gate:
 * it resolves each import to a real file before checking the tier, so it also
 * catches a relative-path escape across a package boundary (e.g. a file in
 * packages/layout/src doing `import x from '../../../platform-core/src/foo'`
 * instead of `from '@cap/platform-core'`) - a violation this script's
 * specifier-string regex cannot see. Keep the two gates on ONE tier map by
 * always importing it here rather than copying it.
 *
 * Ordinals are derived from the real dependency DAG. To add a package, give it
 * an ordinal above everything it must import.
 */
import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs'
import { join, resolve, relative, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = resolve(import.meta.dirname, '..')

/** Canonical tier ordinals. Higher may import lower; never the reverse. */
export const TIERS = {
  '@cap/shared-types': 0,      // Tier 0  Foundation
  '@cap/api-contracts': 1,     // Tier 1  Contracts
  '@cap/platform-store': 2,    // Tier 1  Core domain (state)
  '@cap/theme': 3,             // Tier 1  Core domain (design system)
  '@cap/auth-contracts': 4,    // Tier 2  Platform services
  '@cap/authorization': 4,     // Tier 2  Platform services
  '@cap/platform-core': 5,     // Tier 3  Platform facade
  '@cap/layout': 6,            // Tier 4  Shell / layout engine
  '@cap/module-auth': 7,       // Tier 5  Feature modules
  '@cap/module-dashboard': 7,
  '@cap/module-landing': 7,
  '@cap/module-theme': 7,
  '@cap/module-widget-studio': 7,
  '@cap/app': 8,               // Tier 6  Shell app
}

/** Package name -> source directory. */
export const PACKAGE_DIRS = {
  '@cap/shared-types': 'packages/shared-types/src',
  '@cap/api-contracts': 'packages/api-contracts/src',
  '@cap/platform-store': 'packages/platform-store/src',
  '@cap/theme': 'packages/theme/src',
  '@cap/auth-contracts': 'packages/auth-contracts/src',
  '@cap/authorization': 'packages/authorization/src',
  '@cap/platform-core': 'packages/platform-core/src',
  '@cap/layout': 'packages/layout/src',
  '@cap/module-auth': 'packages/modules/auth/src',
  '@cap/module-dashboard': 'packages/modules/dashboard/src',
  '@cap/module-landing': 'packages/modules/landing/src',
  '@cap/module-theme': 'packages/modules/theme/src',
  '@cap/module-widget-studio': 'packages/modules/widget-studio/src',
  '@cap/app': 'app/src',
}

// Matches real module specifiers only - `from '@cap/x'`, `import('@cap/x')`,
// `require('@cap/x')` - so @cap names inside comments or strings are ignored.
const SPECIFIER = /(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*)["'](@cap\/[a-z0-9-]+)(?:\/[^"']*)?["']/g

function walk(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry === 'build') continue
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, out)
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full)
  }
  return out
}

/**
 * Runs the scan and prints results. Guarded below so that importing this
 * module for its TIERS/PACKAGE_DIRS data (eslint.config.js does exactly this)
 * never triggers a filesystem scan or a process.exit call as a side effect.
 */
function main() {
  const errors = []
  const warnings = []

  for (const [pkg, srcDir] of Object.entries(PACKAGE_DIRS)) {
    const ordinal = TIERS[pkg]
    for (const file of walk(join(ROOT, srcDir))) {
      const text = readFileSync(file, 'utf8')
      for (const m of text.matchAll(SPECIFIER)) {
        const target = m[1]
        if (target === pkg) continue
        const targetOrdinal = TIERS[target]
        if (targetOrdinal === undefined) continue // unknown//provisioned package
        const line = text.slice(0, m.index).split('\n').length
        const where = `${relative(ROOT, file).split(sep).join('/')}:${line}`
        if (targetOrdinal > ordinal) {
          errors.push(`  ${where}\n      ${pkg} (tier ${ordinal}) imports ${target} (tier ${targetOrdinal})`)
        } else if (targetOrdinal === ordinal) {
          warnings.push(`  ${where}  ${pkg} imports same-tier ${target}`)
        }
      }
    }
  }

  if (warnings.length) {
    console.log(`\nSame-tier imports (legal, but they couple siblings): ${warnings.length}`)
    for (const w of warnings.slice(0, 10)) console.log(w)
    if (warnings.length > 10) console.log(`  ...and ${warnings.length - 10} more`)
  }

  if (errors.length) {
    console.error(`\n✖ Tier boundary violations: ${errors.length}\n`)
    for (const e of errors) console.error(e)
    console.error('\nA package may only import packages in a lower tier.')
    console.error('See the tier table in CLAUDE.md and scripts/check-tier-boundaries.mjs.\n')
    process.exit(1)
  }

  console.log('\n✔ No tier boundary violations found.\n')
}

// Only run when executed directly (`node scripts/check-tier-boundaries.mjs`),
// not when imported as a module for its exports. pathToFileURL (rather than a
// hand-built `file://` string) is what makes this comparison work on Windows,
// where a drive-letter path needs the third slash: `file:///C:/...`.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
