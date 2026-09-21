/**
 * mockshot.mjs - screenshot real (guarded) routes with NO backend.
 *
 * driver.mjs --shell only photographs the empty shell because the guards see a
 * Guest. This script answers /api/v1/auth/me with a fake admin so guarded
 * screens actually render, and answers every other /api call with an empty
 * success envelope (so screens show their empty state, not a spinner).
 *
 *   node .claude/skills/run-serafort-app/mockshot.mjs <route> <out.png> [--dark] [--rtl]
 *        [--width N] [--height N] [--full] [--mock file.json]
 *
 * --mock: JSON object { "<regex on url path>": <response body> } checked before
 * the empty fallback, to give a screen realistic data.
 * Git Bash: prefix with MSYS_NO_PATHCONV=1.
 */
import { createRequire } from 'node:module'
import { readFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const require = createRequire(import.meta.url)
const { chromium } = require(require.resolve('playwright', { paths: [repoRoot] }))

const argv = process.argv.slice(2)
const flag = n => argv.includes(`--${n}`)
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d)
const [route, out] = argv.filter(a => !a.startsWith('--') && !/^\d+$/.test(a) && !a.endsWith('.json'))
if (!route || !out) {
  console.error('usage: mockshot.mjs <route> <out.png> [--dark] [--rtl] [--width N] [--full] [--mock f.json]')
  process.exit(2)
}
const BASE = opt('base', 'http://localhost:5173')
const mocks = flag('mock') ? Object.entries(JSON.parse(readFileSync(opt('mock'), 'utf8'))) : []

const user = {
  id: 'usr_demo_001', email: 'amelia.hart@serafort.com', firstName: 'Amelia', lastName: 'Hart',
  status: 'ACTIVE', emailVerified: true, mfaEnabled: true, role: 'admin', roleName: 'admin',
  roleObject: { id: 'role_admin', name: 'admin', slug: 'admin' }, tenantId: 'org_demo_001',
  organizationId: 'org_demo_001', createdAt: '2025-01-10T09:00:00Z',
  memberships: [{ id: 'm1', organizationId: 'org_demo_001', role: 'admin', organization: { id: 'org_demo_001', name: 'Serafort', slug: 'serafort' } }],
}
const ok = body => ({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: +opt('width', 1440), height: +opt('height', 900) } })
const settings = { ...(flag('dark') ? { mode: 'dark' } : {}), ...(flag('rtl') ? { direction: 'rtl' } : {}) }
if (Object.keys(settings).length) {
  await ctx.addCookies([{ name: 'serafort-settings', value: encodeURIComponent(JSON.stringify(settings)), url: BASE }])
}
if (flag('rtl')) await ctx.addInitScript(() => { try { localStorage.setItem('i18nextLng', 'ar') } catch {} })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message))
// Anchored to the origin: an unanchored /api/ also matches Vite source URLs
// such as /@fs/.../services/api/api.client.ts and breaks module loading.
await page.route(/^https?:\/\/[^/]+\/api\//, r => {
  const url = new URL(r.request().url())
  if (url.pathname.endsWith('/auth/me')) return r.fulfill(ok({ success: true, data: { user }, user }))
  for (const [re, body] of mocks) if (new RegExp(re).test(url.pathname)) return r.fulfill(ok(body))
  if (r.request().method() !== 'GET') return r.fulfill(ok({ success: true, data: {} }))
  return r.fulfill(ok({ success: true, data: [], meta: { total: 0, per_page: 20, current_page: 1, last_page: 1 }, total: 0 }))
})
await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 90000 })
await page.addStyleTag({
  content:
    '.MuiBackdrop-root:not(.MuiModal-backdrop),.MuiCircularProgress-root{display:none !important}' +
    '[style*="visibility: hidden"]{visibility:visible !important}',
})
await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {})
await page.waitForTimeout(3500)
mkdirSync(dirname(resolve(out)), { recursive: true })
await page.screenshot({ path: out, fullPage: flag('full') })
console.log('saved', out, 'url=' + page.url())
errors.forEach(e => console.log(e))
await browser.close()
