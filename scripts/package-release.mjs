#!/usr/bin/env node
/**
 * package-release.mjs — turn a built `@cap/app` bundle into a deployable,
 * verifiable release package.
 *
 * `@cap/app` ships as a static site (analysis/production-readiness-runbook.md:
 * "Deploy `@cap/app` static build to the same edge platform intended for prod
 * ... so `app/public/_headers` is honoured"), so packaging for production means:
 * take `app/dist`, prove it is a real production build and not a mis-configured
 * one, record exactly what is in it, and emit a single checksummed tarball that
 * ops can hand to Netlify / Cloudflare Pages / S3+CloudFront / nginx.
 *
 * This is the single implementation used by both CI
 * (.github/workflows/release.yml) and a developer running it locally, so a local
 * package is comparable with a CI one.
 *
 *   pnpm --filter @cap/app run build
 *   pnpm run release:package -- --version 1.4.0
 *
 * Options:
 *   --version <v>   Release version. Falls back to $RELEASE_VERSION, then the
 *                   exact git tag (v-prefix stripped), then 0.0.0-dev+<sha>.
 *   --dist <dir>    Built site to package (default: app/dist).
 *   --out <dir>     Where the package is written (default: release/).
 *   --api-url <url> Production API origin that must appear in the bundle
 *                   (default: $VITE_API_URL). This is the check that proves the
 *                   production env actually reached the build.
 *   --strict        Promote warnings (source maps, dirty tree) to failures.
 *                   CI uses this for tagged releases.
 *   --no-inventory  Skip the production dependency/licence inventory.
 *
 * Exits non-zero when a verification check fails, so it works as a release gate.
 */

import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { gzipSync } from 'node:zlib'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

// ── Arguments ────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2)
const flag = (name) => argv.includes(`--${name}`)
const option = (name, fallback = undefined) => {
  const inline = argv.find((a) => a.startsWith(`--${name}=`))
  if (inline) return inline.slice(name.length + 3)
  const i = argv.indexOf(`--${name}`)
  return i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback
}

const distDir = path.resolve(repoRoot, option('dist', 'app/dist'))
const outDir = path.resolve(repoRoot, option('out', 'release'))
const expectedApiUrl = (option('api-url') || process.env.VITE_API_URL || '').trim()
const strict = flag('strict')
const withInventory = !flag('no-inventory')

// ── Small helpers ────────────────────────────────────────────────────────────

const problems = []
const warnings = []
const notes = []
const fail = (msg) => problems.push(msg)
const warn = (msg) => (strict ? problems : warnings).push(msg)
const note = (msg) => notes.push(msg)

const run = (cmd, args, opts = {}) => {
  const out = execFileSync(cmd, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    ...opts,
  })
  // Callers that inherit stdio (tar) get null back rather than a string.
  return typeof out === 'string' ? out.trim() : ''
}

const git = (...args) => {
  try {
    return run('git', args)
  } catch {
    return ''
  }
}

const walk = (dir, base = dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(full, base)
    if (!entry.isFile()) return []
    return [path.relative(base, full).split(path.sep).join('/')]
  })

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex')
const humanBytes = (n) =>
  n < 1024
    ? `${n} B`
    : n < 1024 ** 2
      ? `${(n / 1024).toFixed(1)} KiB`
      : `${(n / 1024 ** 2).toFixed(2)} MiB`

// ── Identity of this build ───────────────────────────────────────────────────

const commit = git('rev-parse', 'HEAD')
const shortCommit = commit.slice(0, 7) || 'unknown'
const exactTag = git('describe', '--tags', '--exact-match')
const branch = process.env.GITHUB_REF_NAME || git('rev-parse', '--abbrev-ref', 'HEAD')
const dirty = git('status', '--porcelain') !== ''

const version =
  option('version') ||
  process.env.RELEASE_VERSION ||
  (exactTag ? exactTag.replace(/^v/, '') : '') ||
  `0.0.0-dev+${shortCommit}`

const packageName = `serafort-app-${version}-${shortCommit}`

// ── 1. The build must exist ──────────────────────────────────────────────────

if (!fs.existsSync(distDir) || !fs.statSync(distDir).isDirectory()) {
  console.error(
    `\n✗ No build found at ${path.relative(repoRoot, distDir) || distDir}.\n` +
      `  Build first:  pnpm --filter @cap/app run build\n`,
  )
  process.exit(1)
}

const files = walk(distDir).sort()
if (files.length === 0) {
  console.error(`\n✗ ${path.relative(repoRoot, distDir)} is empty — nothing to package.\n`)
  process.exit(1)
}

// ── 2. Inventory + integrity of every shipped file ───────────────────────────

const TEXT_ASSET = /\.(js|mjs|cjs|css|html|json|webmanifest|svg|txt)$/i
const MAX_SCAN_BYTES = 8 * 1024 * 1024

let totalBytes = 0
const fileEntries = files.map((rel) => {
  const buf = fs.readFileSync(path.join(distDir, rel))
  totalBytes += buf.byteLength
  const entry = { path: rel, bytes: buf.byteLength, sha256: sha256(buf) }
  // Transfer size is what a user actually waits for; record it so bundle
  // budgets can be tracked release-over-release from the manifest alone.
  if (/\.(js|mjs|css|html|json|svg)$/i.test(rel) && buf.byteLength <= MAX_SCAN_BYTES) {
    entry.gzipBytes = gzipSync(buf).byteLength
  }
  return entry
})

// ── 3. Production-readiness checks on the artifact itself ────────────────────
//
// These catch the failure mode CI's build job cannot: a bundle that compiles
// cleanly but was produced with the wrong (or no) production environment.

if (!files.includes('index.html')) {
  fail('dist/index.html is missing — this is not a usable static site.')
}

// app/public/_headers carries CSP / HSTS / frame-ancestors. Losing it in the
// package silently downgrades every security header in production.
if (!files.includes('_headers')) {
  fail('dist/_headers is missing — the production security headers would not be deployed.')
}

const sourceMaps = files.filter((f) => f.endsWith('.map'))
if (sourceMaps.length > 0) {
  warn(
    `${sourceMaps.length} source map(s) in the bundle — these publish readable first-party source.`,
  )
}

const PLACEHOLDER_API = 'api.example.com'
const placeholderHits = []
const localhostHits = []
const keyHits = []
let apiOriginFound = false

// Vite inlines import.meta.env.VITE_API_URL as a string literal, so the
// configured origin is verifiably present in a correctly-configured build.
const expectedOrigin = (() => {
  if (!expectedApiUrl) return ''
  try {
    return new URL(expectedApiUrl).origin
  } catch {
    fail(`--api-url / VITE_API_URL is not a valid URL: "${expectedApiUrl}".`)
    return ''
  }
})()

for (const rel of files) {
  if (!TEXT_ASSET.test(rel)) continue
  const full = path.join(distDir, rel)
  if (fs.statSync(full).size > MAX_SCAN_BYTES) continue
  const text = fs.readFileSync(full, 'utf8')
  if (text.includes(PLACEHOLDER_API)) placeholderHits.push(rel)
  if (/https?:\/\/(localhost|127\.0\.0\.1)/i.test(text)) localhostHits.push(rel)
  if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(text)) keyHits.push(rel)
  if (expectedOrigin && text.includes(expectedOrigin)) apiOriginFound = true
}

if (placeholderHits.length > 0) {
  fail(
    `The .env.production placeholder "${PLACEHOLDER_API}" is inlined in: ${placeholderHits.join(', ')}. ` +
      'VITE_API_URL was not set for this build.',
  )
}
if (expectedOrigin && !apiOriginFound) {
  fail(
    `The expected API origin ${expectedOrigin} does not appear anywhere in the bundle — ` +
      'the production environment did not reach this build. Rebuild with .env.production in place.',
  )
}
if (!expectedOrigin && problems.length === 0) {
  warn('No expected API origin given (--api-url / VITE_API_URL); could not confirm the bundle is configured for production.')
}
// localhost is *not* a failure signal: react-router carries an internal
// `http://localhost` base sentinel, Sentry's spotlight integration defaults to
// a localhost sidecar, and the identity-broker form ships a localhost redirect-URI
// placeholder string. Gating on it would reject every legitimate release, so it is
// reported for eyeballing only — the API-origin assertion above is the real check.
if (localhostHits.length > 0) {
  note(`localhost/127.0.0.1 string(s) present in ${localhostHits.length} asset(s): ${localhostHits.join(', ')}.`)
}
if (keyHits.length > 0) {
  fail(`A PEM private-key block is present in: ${keyHits.join(', ')}. Do not ship this bundle.`)
}

if (dirty) {
  warn('Packaged from a dirty working tree — the tarball does not match any commit.')
}

// ── 4. Production dependency + licence inventory ─────────────────────────────
//
// Not a full CycloneDX SBOM: pnpm's own output is authoritative for this
// workspace and needs no extra tooling in the pipeline. It answers the two
// audit questions that matter — what shipped, and under what licence.

let inventory = null
if (withInventory) {
  try {
    inventory = JSON.parse(
      run('pnpm', ['--filter', '@cap/app', 'licenses', 'list', '--prod', '--json']),
    )
  } catch {
    warnings.push('Could not build the dependency/licence inventory (pnpm licenses list failed).')
  }
}

// ── 5. Manifest ──────────────────────────────────────────────────────────────

const manifest = {
  name: '@cap/app',
  package: packageName,
  version,
  packagedAt: new Date().toISOString(),
  git: { commit, shortCommit, branch, tag: exactTag || null, dirty },
  build: {
    node: process.version,
    pnpm: (() => {
      try {
        return run('pnpm', ['--version'])
      } catch {
        return null
      }
    })(),
    ci: Boolean(process.env.GITHUB_ACTIONS),
    runId: process.env.GITHUB_RUN_ID || null,
  },
  totals: {
    fileCount: fileEntries.length,
    bytes: totalBytes,
    gzipBytes: fileEntries.reduce((sum, f) => sum + (f.gzipBytes ?? 0), 0),
  },
  checks: {
    strict,
    expectedApiOrigin: expectedOrigin || null,
    failures: problems,
    warnings,
    notes,
  },
  files: fileEntries,
}

// ── 6. Stage, archive, checksum ──────────────────────────────────────────────

const stageRoot = path.join(outDir, '.stage')
fs.rmSync(stageRoot, { recursive: true, force: true })
const stageDir = path.join(stageRoot, packageName)
fs.mkdirSync(stageDir, { recursive: true })

fs.cpSync(distDir, path.join(stageDir, 'dist'), { recursive: true })
fs.writeFileSync(
  path.join(stageDir, 'build-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
)
if (inventory) {
  fs.writeFileSync(
    path.join(stageDir, 'dependency-inventory.json'),
    `${JSON.stringify(inventory, null, 2)}\n`,
  )
}
fs.writeFileSync(
  path.join(stageDir, 'DEPLOY.txt'),
  [
    `Serafort platform app — ${version} (${shortCommit})`,
    '',
    'Contents',
    '  dist/                      Static site root. Publish this directory as-is.',
    '  build-manifest.json        Version, commit, per-file sha256 and gzip sizes.',
    '  dependency-inventory.json  Production dependency + licence list.',
    '',
    'Deploy',
    '  1. Publish dist/ to the static host (Netlify / Cloudflare Pages / S3+CloudFront).',
    '  2. dist/_headers is honoured by Netlify and Cloudflare Pages. On any other host',
    '     replicate that header set in the platform config — CSP, HSTS and',
    '     frame-ancestors must be sent as real HTTP headers, not meta tags.',
    '  3. Serve index.html as the SPA fallback for unknown paths, never for /api/*.',
    '  4. Cache /assets/* immutably (content-hashed filenames); serve index.html,',
    '     sw.js and manifest.webmanifest with no-cache.',
    '',
    'Verify before publishing',
    '  sha256sum -c <package>.SHA256SUMS   (checksum file ships beside the tarball)',
    '  Compare the unpacked dist/ file hashes against build-manifest.json.',
    '',
    'Roll back',
    '  Re-publish the previous release tarball; each one is a complete, self-contained site.',
    '',
  ].join('\n'),
)

fs.mkdirSync(outDir, { recursive: true })
const tarballName = `${packageName}.tar.gz`
const tarballPath = path.join(outDir, tarballName)
fs.rmSync(tarballPath, { force: true })

// Run tar from inside the output directory with relative paths only: GNU tar
// reads a Windows `C:\...` argument as a remote host ("Cannot connect to C")
// and `--force-local` is not portable to the bsdtar on macOS.
run('tar', ['-czf', tarballName, '-C', '.stage', packageName], {
  cwd: outDir,
  stdio: ['ignore', 'inherit', 'inherit'],
})
fs.rmSync(stageRoot, { recursive: true, force: true })

const tarball = fs.readFileSync(tarballPath)
const tarballSha = sha256(tarball)
const checksumPath = path.join(outDir, `${packageName}.SHA256SUMS`)
fs.writeFileSync(checksumPath, `${tarballSha}  ${tarballName}\n`)
// The manifest is also written beside the tarball so CI (and a reviewer) can
// read it without unpacking the archive.
const manifestPath = path.join(outDir, `${packageName}.manifest.json`)
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

// ── 7. Report ────────────────────────────────────────────────────────────────

const rel = (p) => path.relative(repoRoot, p).split(path.sep).join('/')
const lines = [
  '',
  `  package    ${tarballName}`,
  `  version    ${version}${exactTag ? ` (tag ${exactTag})` : ''}`,
  `  commit     ${shortCommit}${dirty ? ' (dirty)' : ''} on ${branch || 'unknown'}`,
  `  contents   ${manifest.totals.fileCount} files, ${humanBytes(manifest.totals.bytes)} raw / ${humanBytes(manifest.totals.gzipBytes)} gzip`,
  `  archive    ${humanBytes(tarball.byteLength)}`,
  `  sha256     ${tarballSha}`,
  `  written to ${rel(outDir)}/`,
  '',
]
if (expectedOrigin) {
  lines.push(`  api origin ${expectedOrigin} ${apiOriginFound ? '(found in bundle)' : '(NOT FOUND)'}`, '')
}
for (const n of notes) lines.push(`  - ${n}`)
for (const w of warnings) lines.push(`  ! ${w}`)
for (const p of problems) lines.push(`  x ${p}`)
if (notes.length || warnings.length || problems.length) lines.push('')
console.log(lines.join('\n'))

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(
    process.env.GITHUB_OUTPUT,
    [
      `version=${version}`,
      `package-name=${packageName}`,
      `tarball=${rel(tarballPath)}`,
      `checksums=${rel(checksumPath)}`,
      `manifest=${rel(manifestPath)}`,
      `sha256=${tarballSha}`,
      '',
    ].join('\n'),
  )
}
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    [
      `### Production package \`${tarballName}\``,
      '',
      '| | |',
      '| --- | --- |',
      `| Version | \`${version}\` |`,
      `| Commit | \`${commit}\` |`,
      `| Files | ${manifest.totals.fileCount} |`,
      `| Size | ${humanBytes(manifest.totals.bytes)} raw / ${humanBytes(manifest.totals.gzipBytes)} gzip |`,
      `| Archive sha256 | \`${tarballSha}\` |`,
      ...(expectedOrigin ? [`| API origin | \`${expectedOrigin}\` ${apiOriginFound ? '✓' : '✗'} |`] : []),
      '',
      ...(notes.length ? ['**Notes**', '', ...notes.map((n) => `- ${n}`), ''] : []),
      ...(warnings.length ? ['**Warnings**', '', ...warnings.map((w) => `- ${w}`), ''] : []),
      ...(problems.length ? ['**Failures**', '', ...problems.map((p) => `- ${p}`), ''] : []),
    ].join('\n'),
  )
}

if (problems.length > 0) {
  console.error(`✗ Release package rejected: ${problems.length} check(s) failed.\n`)
  process.exit(1)
}
console.log('✓ Production package ready.\n')
