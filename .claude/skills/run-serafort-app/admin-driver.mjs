#!/usr/bin/env node
/*
 * admin-driver.mjs — drive AUTHENTICATED ADMIN routes of the Serafort app.
 *
 * The sibling driver.mjs `--shell` mode holds /api/v1/auth/* open so the auth
 * guard never resolves. That works for AuthRoute/LayoutWrapper screens, but
 * every screen behind AdminRoute (packages/.../authorization-engine/middlewares/
 * AdminRoute.tsx) renders ONLY a white loading <Backdrop> until
 * useSessionGuard() resolves — so with auth held open you photograph a blank
 * <main>.
 *
 * This driver instead SEEDS a super_admin session two ways (belt and braces):
 *   1. addInitScript writes the Zustand persist blob to localStorage under
 *      `serafort-storage` BEFORE app code runs. secureStorage.getItem() fails to
 *      decrypt the plaintext and falls back to the raw value (see
 *      packages/platform-store/src/store/index.ts), so hydration yields an
 *      authenticated store with no async — deterministic in light and dark.
 *   2. As a fallback, `GET /api/v1/auth/me` is fulfilled with the same user, so
 *      refreshAuth() also succeeds if hydration ever ignores the blob.
 * buildSubject() + the default policy set (`platform-owner-bypass`, priority
 * 100, roles [platform_owner, super_admin, superadmin], actions ["*"],
 * resources ["*"]) then grant `access` on `admin_route`, and the real screen
 * mounts. Every other API call still 404s (there is no backend), so screens
 * render their genuine empty / error states.
 *
 * Usage (Git Bash — MSYS_NO_PATHCONV=1 is REQUIRED):
 *
 *   MSYS_NO_PATHCONV=1 node .claude/skills/run-serafort-app/admin-driver.mjs probe   /auth/sso/jwks
 *   MSYS_NO_PATHCONV=1 node .claude/skills/run-serafort-app/admin-driver.mjs shot    /admin/provisioning out/prov.png
 *   MSYS_NO_PATHCONV=1 node .claude/skills/run-serafort-app/admin-driver.mjs measure /auth/sso/jwks "main h4"
 *   MSYS_NO_PATHCONV=1 node .claude/skills/run-serafort-app/admin-driver.mjs text    /auth/sso/jwks
 *
 * PowerShell / cmd (no prefix needed):
 *
 *   node .claude/skills/run-serafort-app/admin-driver.mjs shot /admin/provisioning out/prov.png
 *
 * WHY MSYS_NO_PATHCONV=1: Git Bash rewrites every bare route argument that
 * starts with "/" into a Windows absolute path (e.g. /admin/provisioning →
 * C:/Program Files/Git/admin/provisioning). Without this flag, every admin/*
 * screenshot navigates to the landing page instead and returns a blank image.
 *
 * Options: --dark  --width N  --height N  --clip x,y,w,h  --wait <selector>
 *          --base <url>  --role <super_admin|admin|...>
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
const cmd = argv[0]
const positional = argv.slice(1).filter((a) => !a.startsWith('--'))
const flag = (n, d = null) => (argv.indexOf('--' + n) === -1 ? d : argv[argv.indexOf('--' + n) + 1])
const has = (n) => argv.includes('--' + n)

if (!['probe', 'shot', 'measure', 'text'].includes(cmd)) {
  console.error('usage: admin-driver.mjs <probe|shot|measure|text> <route> [args] [options]')
  process.exit(2)
}

function normalizeRoute(rawInput) {
  if (!rawInput || rawInput === '/') return '/'
  let clean = rawInput.replace(/\\/g, '/')
  if (/^[A-Za-z]:/i.test(clean)) {
    clean = clean.replace(/^[A-Za-z]:/i, '')
    clean = clean.replace(/^\/(?:Program\s+Files(?:\s+\(x86\))?\/)?(?:Git\/|msys(?:64)?\/|cygwin(?:64)?\/)?/i, '/')
  }
  return clean.startsWith('/') ? clean : '/' + clean
}

const raw = positional[0] || '/'
const route = normalizeRoute(raw)

const BASE = flag('base', 'http://localhost:5173')
const viewport = { width: Number(flag('width', 1440)), height: Number(flag('height', 900)) }
const SETTINGS_COOKIE = 'serafort-settings'
const MIN_PNG = 3000
const ROLE = flag('role', 'super_admin')

const clipArg = flag('clip')
const clip = clipArg
  ? (([x, y, width, height]) => ({ x, y, width, height }))(clipArg.split(',').map(Number))
  : undefined

// The seeded identity. Shape follows what normalizeUserData() / buildSubject()
// read: `role` (string, normalised), `roles` (array — /api/v1/auth/* form),
// `permissions`, `memberships`, verified + mfa flags so no secondary guard trips.
const NOW = Date.now()
const ADMIN_USER = {
  id: 1,
  email: 'admin.driver@serafort.test',
  firstName: 'Admin',
  lastName: 'Driver',
  name: 'Admin Driver',
  username: 'admin.driver',
  role: ROLE,
  roles: [ROLE],
  roleName: ROLE,
  permissions: ['*'],
  status: 'active',
  isActive: true,
  emailVerified: true,
  isEmailVerified: true,
  mfaEnabled: true,
  mfaVerified: true,
  isMfaVerified: true,
  plane: 'platform',
  organizationId: 1,
  orgId: 1,
  tenantId: 1,
  activeTenantId: 1,
  memberships: [
    {
      orgId: 1,
      organizationId: 1,
      organizationName: 'Serafort Platform',
      role: ROLE,
      isOwner: true,
      permissions: ['*'],
    },
  ],
  createdAt: new Date(NOW - 86400000 * 90).toISOString(),
  updatedAt: new Date(NOW).toISOString(),
}

// refreshAuth() reads response.data.data ?? response.data, then payload.user ?? payload.
const ME_BODY = JSON.stringify({
  success: true,
  data: { user: ADMIN_USER, ...ADMIN_USER, access_token: 'driver-fake-token', expires_in: 86400 },
  ...ADMIN_USER,
})

// Primary seed: pre-populate the Zustand persist blob so hydration itself yields
// an authenticated session with NO async — useSessionGuard() then short-circuits
// (isAuthenticated && user) and AdminRoute mounts the screen immediately, the
// same in light and dark. The store's secureStorage.getItem() tries to decrypt
// this key and, on failure, falls back to the raw value (see
// packages/platform-store/src/store/index.ts) — so plaintext JSON hydrates fine
// without the encryption key. Shape is zustand-persist's { state, version }, and
// `merge` spreads persistedState.auth / .settings onto the store.
const persistBlob = (mode) =>
  JSON.stringify({
    version: 0,
    state: {
      auth: { user: ADMIN_USER, isAuthenticated: true, isAdmin: true },
      settings: { mode },
      preferences: { mode },
    },
  })

const browser = await chromium.launch()
const errors = new Set()

async function attempt(out) {
  const context = await browser.newContext({
    viewport,
    colorScheme: has('dark') ? 'dark' : 'light',
  })
  await context.addCookies([
    {
      name: SETTINGS_COOKIE,
      value: encodeURIComponent(JSON.stringify({ mode: has('dark') ? 'dark' : 'light' })),
      url: BASE,
    },
  ])
  const page = await context.newPage()
  page.on('pageerror', (e) => errors.add('PAGEERROR: ' + e.message.slice(0, 300)))
  page.on('console', (m) => {
    if (m.type() !== 'error') return
    const t = m.text()
    if (t.includes("'frame-ancestors' is ignored")) return
    if (t.includes('Failed to load resource')) return // no backend — expected
    errors.add('CONSOLE: ' + t.slice(0, 300))
  })

  // Primary seed — runs before any app script on every navigation.
  await page.addInitScript(
    ({ blob, key }) => {
      try {
        localStorage.setItem(key, blob)
      } catch {
        /* private mode / disabled storage — the route fallback still covers it */
      }
    },
    { blob: persistBlob(has('dark') ? 'dark' : 'light'), key: 'serafort-storage' },
  )

  // Fallback seed: if hydration ever ignores the blob, refreshAuth() still gets
  // a valid user from this.
  await page.route('**/api/v1/auth/me**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: ME_BODY }),
  )
  // Quieten the two other boot-time auth calls; everything else still 404s.
  await page.route('**/api/auth/csrf-token**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: '{"csrfToken":"driver"}' }),
  )
  await page.route('**/api/v1/auth/check-permission**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: '{"allowed":true}' }),
  )

  await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 60000 })

  // Poll until the seeded session has taken effect — <main> carrying real
  // content and the navbar no longer showing the guest "Guest" chip.
  await page
    .waitForFunction(
      () => {
        const m = document.querySelector('main')
        const mainReady = !!m && (m.innerText || '').trim().length > 0
        const isGuest = /\bGuest\b/.test(document.body.innerText || '')
        return mainReady && !isGuest
      },
      undefined,
      { timeout: 35000, polling: 400 },
    )
    .catch(() => null)
  await page.addStyleTag({
    content:
      '.MuiBackdrop-root,.MuiCircularProgress-root{display:none !important}' +
      '[style*="visibility: hidden"]{visibility:visible !important}',
  })

  // If the seed lost the race with the app's first refreshAuth(), the navbar
  // still shows "Guest" and/or <main> is empty — throw so the outer loop
  // re-attempts with a fresh context rather than capturing the guest shell.
  const state = await page.evaluate(() => ({
    mainLen: (document.querySelector('main')?.innerText || '').trim().length,
    guest: /\bGuest\b/.test(document.body.innerText || ''),
  }))
  if (state.mainLen === 0 || state.guest)
    throw new Error('auth guard did not resolve — seed lost the hydration race')

  // A beat for the freshly-mounted screen to settle before the pixel capture.
  await page.waitForTimeout(600)

  const extra = flag('wait')
  if (extra) await page.waitForSelector(extra, { timeout: 30000 }).catch(() => null)

  let result
  if (cmd === 'probe') {
    result = await page.evaluate(() => ({
      url: location.pathname,
      title: document.title,
      rootChars: document.getElementById('root')?.innerHTML.length ?? -1,
      mainChars: (document.querySelector('main')?.innerText || '').trim().length,
      forbidden: /403|forbidden|insufficient permission/i.test(
        document.querySelector('main')?.innerText || '',
      ),
      images: [...document.images].map((i) => ({
        src: i.getAttribute('src'),
        loaded: i.complete && i.naturalWidth > 0,
        box:
          Math.round(i.getBoundingClientRect().width) +
          'x' +
          Math.round(i.getBoundingClientRect().height),
      })),
    }))
  } else if (cmd === 'text') {
    result = await page.evaluate(() => ({
      url: location.pathname,
      title: document.title,
      main: (document.querySelector('main')?.innerText || '').slice(0, 4000),
    }))
  } else if (cmd === 'shot') {
    fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true })
    await page.screenshot({ path: out, clip, fullPage: has('full') })
    result = {
      path: out,
      bytes: fs.statSync(out).size,
      viewport: viewport.width + 'x' + viewport.height,
    }
  } else {
    result = await page.evaluate((s) => {
      return [...document.querySelectorAll(s)].map((el) => {
        const r = el.getBoundingClientRect()
        const p = el.parentElement?.getBoundingClientRect()
        return {
          tag: el.tagName,
          box:
            Math.round(r.width) + 'x' + Math.round(r.height) +
            ' at (' + Math.round(r.left) + ',' + Math.round(r.top) + ')',
          parent: p ? Math.round(p.width) + 'x' + Math.round(p.height) : null,
          visibility: getComputedStyle(el).visibility,
        }
      })
    }, positional[1])
  }
  await page.close()
  await context.close()
  return result
}

const out = cmd === 'shot' ? positional[1] : null
if (cmd === 'shot' && !out) {
  console.error('shot needs an output path')
  process.exit(2)
}
if (cmd === 'measure' && !positional[1]) {
  console.error('measure needs a selector')
  process.exit(2)
}

let result
let ok = false
for (let i = 1; i <= 3 && !ok; i++) {
  try {
    result = await attempt(out)
    ok =
      cmd === 'shot'
        ? result.bytes >= MIN_PNG
        : cmd === 'measure'
          ? result.length > 0
          : cmd === 'text'
            ? result.main.trim().length > 0
            : result.rootChars > 100
    if (!ok && i < 3) console.error('attempt ' + i + ' produced an empty result - retrying')
  } catch (e) {
    if (i === 3) {
      await browser.close()
      throw e
    }
    console.error('attempt ' + i + ' failed (' + e.message.split('\n')[0] + ') - retrying')
  }
}

console.log(JSON.stringify(result, null, 2))
if (errors.size) {
  console.log('--- page errors ---')
  console.log([...errors].slice(0, 8).join('\n'))
}
await browser.close()
if (!ok) {
  console.error('FAILED: empty result after 3 attempts')
  process.exit(1)
}
