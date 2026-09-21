#!/usr/bin/env node
/*
 * audit-page.mjs — capture what a screen SHOWS next to what the API RETURNED.
 *
 * Logs in for real (same approach as run-serafort-app/real-driver.mjs:
 * POST /api/v1/auth/login through the Vite proxy), opens a route, and records:
 *   - the visible text of <main> (the numbers/labels the user sees)
 *   - every /api/* response the page made: verb, path, status, and a
 *     SHAPE SUMMARY of the body (array lengths, keys, small scalars) —
 *     token/password/secret-like values are always redacted
 *   - console errors / page errors
 *   - a full-page screenshot
 * Optionally reloads and re-captures (--reload) and follows every in-app link
 * inside <main> (--follow), capturing each target page the same way, so a
 * summary card can be compared against the detail screen it links to.
 *
 * Prereqs: backend on :3333, Vite on :5173, DB seeded.
 *
 * Usage:
 *   node .claude/skills/audit-page-data/audit-page.mjs /auth/account --out <dir> [--reload] [--follow]
 * Options: --email <e> --password <p> --base <url> --settle <ms> --max-links N
 * Git Bash: prefix MSYS_NO_PATHCONV=1.
 *
 * Output: <dir>/report.json and <dir>/report.md, screenshots <dir>/*.png.
 */
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const repoRoot = path.resolve(import.meta.dirname, '../../..')
const require = createRequire(import.meta.url)
const pwPath = require.resolve('playwright', { paths: [repoRoot] })
const { chromium } = (await import(pathToFileURL(pwPath).href)).default

const argv = process.argv.slice(2)
const flag = (n, d = null) => (argv.indexOf('--' + n) === -1 ? d : argv[argv.indexOf('--' + n) + 1])
const has = (n) => argv.includes('--' + n)
// The route is always the first argument.
const raw = argv[0]
if (!raw || raw.startsWith('--')) {
  console.error('usage: audit-page.mjs <route> --out <dir> [--reload] [--follow]')
  process.exit(2)
}
const route = /^[A-Za-z]:[\\/]/.test(raw) ? '/' : raw.startsWith('/') ? raw : '/' + raw
const BASE = flag('base', 'http://localhost:5173')
const OUT = path.resolve(flag('out', 'audit-out'))
const EMAIL = flag('email', 'admin@example.com')
const PASSWORD = flag('password', 'TestPassword123!')
const SETTLE = Number(flag('settle', 2500))
const MAX_LINKS = Number(flag('max-links', 12))
fs.mkdirSync(OUT, { recursive: true })

const SECRET_KEY =
  /token|password|secret|otp|totp|code_?verifier|private|cookie|authorization|manual_?entry|qr|recovery|backup_?codes|seed|signature|credential|public_?key/i

// --follow must be side-effect free. Links whose target looks like an action
// are not opened, and while following, every non-GET API request is aborted
// (only the auth refresh the app needs to stay logged in is let through).
const ACTION_LINK = /setup|enroll|delete|remove|revoke|disable|reset|logout|sign-?out|unlink|deactivate|suspend|impersonat|new|create|add/i
const ALLOWED_MUTATION = /\/api\/(v1\/)?auth\/refresh$/

/** Shape summary of a JSON body — enough to compare against the UI, no raw data dumps. */
function summarize(v, depth = 0) {
  if (v === null || v === undefined) return v
  if (Array.isArray(v)) {
    const first = v.find((x) => x && typeof x === 'object')
    return { array: v.length, itemKeys: first ? Object.keys(first).slice(0, 15) : undefined }
  }
  if (typeof v === 'object') {
    if (depth >= 2) return `{${Object.keys(v).length} keys}`
    const o = {}
    for (const [k, val] of Object.entries(v).slice(0, 25)) {
      if (SECRET_KEY.test(k)) o[k] = '[redacted]'
      else o[k] = summarize(val, depth + 1)
    }
    return o
  }
  if (typeof v === 'string') return v.length > 60 ? v.slice(0, 57) + '...' : v
  return v
}

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, baseURL: BASE })
const loginRes = await context.request.post('/api/v1/auth/login', {
  data: { email: EMAIL, password: PASSWORD },
  headers: { 'content-type': 'application/json', origin: BASE },
})
if (!loginRes.ok()) {
  console.error(`login failed: HTTP ${loginRes.status()}`)
  await browser.close()
  process.exit(1)
}

const page = await context.newPage()
let calls = []
let errors = []
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message.slice(0, 300)))
page.on('console', (m) => {
  if (m.type() === 'error' && !m.text().includes("'frame-ancestors'")) errors.push('CONSOLE: ' + m.text().slice(0, 300))
})
page.on('response', async (r) => {
  const u = new URL(r.url())
  if (!u.pathname.startsWith('/api/')) return
  const entry = { method: r.request().method(), path: u.pathname + u.search, status: r.status() }
  try {
    if ((r.headers()['content-type'] || '').includes('json')) entry.body = summarize(await r.json())
  } catch {}
  calls.push(entry)
})

async function capture(label) {
  await page
    .waitForFunction(() => (document.querySelector('main')?.innerText || '').trim().length > 0, undefined, {
      timeout: 35000,
      polling: 400,
    })
    .catch(() => null)
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.waitForTimeout(SETTLE)
  const text = await page.evaluate(() => (document.querySelector('main')?.innerText || document.body.innerText || '').replace(/\n{2,}/g, '\n'))
  const file = `${label.replace(/[^a-z0-9-]+/gi, '_')}.png`
  await page.screenshot({ path: path.join(OUT, file), fullPage: true })
  const snap = { label, url: page.url().replace(BASE, ''), screenshot: file, text: text.slice(0, 6000), api: calls, errors }
  calls = []
  errors = []
  return snap
}

const report = { route, user: EMAIL, at: new Date().toISOString(), pages: [] }

await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 90000 })
report.pages.push(await capture('initial'))

if (has('reload')) {
  await page.reload({ waitUntil: 'domcontentloaded' })
  report.pages.push(await capture('reload'))
}

if (has('follow')) {
  const blocked = []
  await page.route('**/api/**', (r) => {
    const req = r.request()
    const p = new URL(req.url()).pathname
    if (req.method() === 'GET' || ALLOWED_MUTATION.test(p)) return r.continue()
    blocked.push(`${req.method()} ${p}`)
    return r.abort()
  })
  report.blockedMutations = blocked
  const allLinks = await page.evaluate(() => {
    const seen = new Set()
    return [...document.querySelectorAll('main a[href]')]
      .map((a) => ({ href: a.getAttribute('href'), text: (a.innerText || a.getAttribute('aria-label') || '').trim() }))
      .filter((l) => l.href.startsWith('/') && !seen.has(l.href) && seen.add(l.href))
  })
  const links = allLinks.filter((l) => !ACTION_LINK.test(l.href))
  report.skippedLinks = allLinks.filter((l) => ACTION_LINK.test(l.href))
  for (const link of links.slice(0, MAX_LINKS)) {
    try {
      await page.goto(BASE + route, { waitUntil: 'domcontentloaded' })
      await page.waitForLoadState('networkidle').catch(() => {})
      calls = []
      await page.locator(`main a[href="${link.href}"]`).first().click({ timeout: 15000 })
      report.pages.push(await capture(`link ${link.text || link.href}`))
    } catch (e) {
      report.pages.push({ label: `link ${link.text || link.href}`, url: link.href, failed: e.message.split('\n')[0] })
    }
  }
}

await browser.close()

fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2))
const md = [`# Page audit: ${route}`, `User: ${EMAIL} · ${report.at}`, '']
if (report.skippedLinks?.length)
  md.push(`Skipped action links (not opened): ${report.skippedLinks.map((l) => `\`${l.href}\``).join(', ')}`, '')
if (report.blockedMutations?.length)
  md.push(`Blocked non-GET requests while following: ${[...new Set(report.blockedMutations)].map((m) => `\`${m}\``).join(', ')}`, '')
for (const p of report.pages) {
  md.push(`## ${p.label} — \`${p.url}\``)
  if (p.failed) {
    md.push(`**Could not open:** ${p.failed}`, '')
    continue
  }
  md.push(`Screenshot: ${p.screenshot}`, '', '### Visible text', '```', p.text.slice(0, 2500), '```', '### API calls')
  for (const c of p.api) md.push(`- \`${c.status} ${c.method} ${c.path}\`` + (c.body !== undefined ? ` → \`${JSON.stringify(c.body).slice(0, 400)}\`` : ''))
  if (p.errors.length) md.push('### Errors', ...p.errors.map((e) => `- ${e}`))
  md.push('')
}
fs.writeFileSync(path.join(OUT, 'report.md'), md.join('\n'))
console.log(`wrote ${path.join(OUT, 'report.md')} (${report.pages.length} page captures)`)
