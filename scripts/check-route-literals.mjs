#!/usr/bin/env node
/**
 * Route literal gate.
 *
 * Fails the build when a navigation target is written as a bare URL string
 * instead of being read from the Tier 0 registry (`AppPaths` in
 * @cap/shared-types).
 *
 * WHY THIS EXISTS
 * ---------------
 * `appPathsParity.test.ts` guards the registry: every path in `AppPaths`
 * resolves to a route the router serves, and every registered route is declared
 * in `AppPaths`. What it cannot see is a URL that was never put in `AppPaths` at
 * all -- a literal typed straight into a `navigate()` call. Those bypass the
 * parity guard completely, and they are exactly how the dead links in this
 * codebase survived: `resolveRedirectPathForUser` returned a hardcoded
 * '/provider' that no module registers, so every participant sign-in landed on
 * the not-found screen, and the registry guard had no way to notice.
 *
 * So this check comes at it from the other side. It scans for path-shaped
 * string literals used as destinations and requires each one to correspond to a
 * declared path. Together the two guards close the loop: the parity test proves
 * declared paths are real, and this proves real navigation only uses declared
 * paths.
 *
 * Run:
 *   node scripts/check-route-literals.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const SCAN_ROOTS = ['packages', 'app/src']
const SKIP_DIRS = new Set(['node_modules', 'dist', '.vite', 'coverage', '__fixtures__', '__mocks__'])

/**
 * Files that legitimately contain path literals:
 * - the registry itself, which is where they are supposed to be written
 * - the API endpoint map, whose strings are server routes, not app routes
 * - tests/stories/benchmarks, which assert on or fixture concrete URLs
 */
const SKIP_FILE =
  /(shared-types[\\/]src[\\/]routes\.ts|endpoints\.ts|\.test\.|\.spec\.|\.bench\.|\.stories\.|[\\/]__tests__[\\/])/

/**
 * Prefixes that are not app routes: API calls, static assets, and the SCIM
 * surface the backend serves directly.
 */
const NON_ROUTE_PREFIX =
  /^\/(api|assets|images|icons|locales|fonts|scim|static|public|@|uploads)(\/|$)/

/** A literal only matters when the line uses it as somewhere to go. */
const DESTINATION_CONTEXT =
  /(navigate|href|\bto=|\bto:|redirect|Navigate|path:|window\.location|linkTo)/i

const PATH_LITERAL = /['"`](\/[a-zA-Z0-9][a-zA-Z0-9\-_/:.?=]*)['"`]/g

const readRegistryPaths = () => {
  const src = fs.readFileSync(
    path.join(ROOT, 'packages/shared-types/src/routes.ts'),
    'utf8',
  )
  // The registry is plain string literals, so a lexical scan is enough here and
  // avoids making this gate depend on a TypeScript build of tier 0.
  const declared = new Set()
  for (const m of src.matchAll(/['"`](\/[^'"`]*)['"`]/g)) declared.add(m[1])
  return declared
}

const collectFiles = (dir, out = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      collectFiles(full, out)
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(full)
    }
  }
  return out
}

function main() {
  const declared = readRegistryPaths()

  // `/admin/user/:id` must accept `/admin/user/42`.
  const patterns = [...declared].map(
    (p) => new RegExp('^' + p.replace(/:[A-Za-z0-9_]+\??/g, '[^/]+').replace(/\/$/, '') + '/?$'),
  )
  const isDeclared = (url) => declared.has(url) || patterns.some((re) => re.test(url))

  const files = []
  for (const root of SCAN_ROOTS) {
    const full = path.join(ROOT, root)
    if (fs.existsSync(full)) collectFiles(full, files)
  }

  const violations = []
  for (const file of files) {
    if (SKIP_FILE.test(file)) continue
    const lines = fs.readFileSync(file, 'utf8').split('\n')
    lines.forEach((line, index) => {
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) return // comments
      if (!DESTINATION_CONTEXT.test(line)) return
      for (const match of line.matchAll(PATH_LITERAL)) {
        const url = match[1]
        if (url === '/') continue
        if (NON_ROUTE_PREFIX.test(url)) continue
        if (isDeclared(url.split('?')[0])) continue
        violations.push({
          file: path.relative(ROOT, file),
          line: index + 1,
          url,
          text: line.trim().slice(0, 100),
        })
      }
    })
  }

  if (violations.length) {
    console.error(`\n✖ Navigation targets not declared in AppPaths: ${violations.length}\n`)
    for (const v of violations) {
      console.error(`  ${v.file}:${v.line}`)
      console.error(`    ${v.url}`)
      console.error(`    ${v.text}\n`)
    }
    console.error('Every navigation target must come from `AppPaths` in')
    console.error('packages/shared-types/src/routes.ts, so that changing a path')
    console.error('changes it everywhere and a dead link cannot be typed by hand.')
    console.error('If the destination is real, declare it there and use it from there.\n')
    process.exit(1)
  }

  console.log('\n✔ No undeclared navigation targets found.\n')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
