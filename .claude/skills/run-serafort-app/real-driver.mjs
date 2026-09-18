#!/usr/bin/env node
/*
 * real-driver.mjs — drive the Serafort app against the REAL backend.
 *
 * Unlike admin-driver.mjs (which fakes a session so AdminRoute screens render
 * with no backend), this one logs in for real: it POSTs to
 * /api/v1/auth/login through the Vite dev proxy, which sets the auth +
 * refresh_token cookies on the browser context. On navigation the app's own
 * api-client sees a 401 on /me, calls /api/v1/auth/refresh with that cookie,
 * mints an access token and authenticates — so every screen query then hits
 * the real backend and renders real, populated data.
 *
 * Prereqs: backend on :3333, Vite dev server on :5173 (it proxies /api),
 * Postgres + Redis up, DB seeded. Default creds are the seeded super admin.
 *
 * Usage:
 *   node .../real-driver.mjs shot    /admin/users out/users.png
 *   node .../real-driver.mjs probe   /admin/users
 *   node .../real-driver.mjs text    /admin/users
 *   node .../real-driver.mjs measure /admin/users "table tbody tr"
 *
 * Options: --dark --width N --height N --clip x,y,w,h --wait <sel> --full
 *          --base <url> --email <e> --password <p> --settle <ms>
 *
 * Git Bash: prefix MSYS_NO_PATHCONV=1.
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
  console.error('usage: real-driver.mjs <probe|shot|measure|text> <route> [args] [options]')
  process.exit(2)
}

const raw = positional[0] || '/'
const route = /^[A-Za-z]:[\\/]/.test(raw) ? '/' : raw.startsWith('/') ? raw : '/' + raw

const BASE = flag('base', 'http://localhost:5173')
const viewport = { width: Number(flag('width', 1440)), height: Number(flag('height', 900)) }
const SETTINGS_COOKIE = 'serafort-settings'
const MIN_PNG = 3000
const EMAIL = flag('email', 'admin@example.com')
const PASSWORD = flag('password', 'TestPassword123!')
const SETTLE = Number(flag('settle', 2500))

const clipArg = flag('clip')
const clip = clipArg
  ? (([x, y, width, height]) => ({ x, y, width, height }))(clipArg.split(',').map(Number))
  : undefined

const browser = await chromium.launch()
const errors = new Set()

async function attempt(out) {
  const context = await browser.newContext({
    viewport,
    colorScheme: has('dark') ? 'dark' : 'light',
    baseURL: BASE,
  })
  await context.addCookies([
    {
      name: SETTINGS_COOKIE,
      value: encodeURIComponent(JSON.stringify({ mode: has('dark') ? 'dark' : 'light' })),
      url: BASE,
    },
  ])

  // Real login through the Vite proxy → backend. The Set-Cookie response lands
  // in this context's cookie jar, so the page navigation below is authenticated.
  const loginRes = await context.request.post('/api/v1/auth/login', {
    data: { email: EMAIL, password: PASSWORD },
    headers: { 'content-type': 'application/json', origin: BASE },
  })
  if (!loginRes.ok()) {
    throw new Error(`login failed: HTTP ${loginRes.status()} ${(await loginRes.text()).slice(0, 200)}`)
  }

  const page = await context.newPage()
  page.on('pageerror', (e) => errors.add('PAGEERROR: ' + e.message.slice(0, 300)))
  page.on('console', (m) => {
    if (m.type() !== 'error') return
    const t = m.text()
    if (t.includes("'frame-ancestors' is ignored")) return
    errors.add('CONSOLE: ' + t.slice(0, 300))
  })

  await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 60000 })

  // Poll until the guard resolves and the real screen paints — <main> carrying
  // content and the navbar not showing the guest "Guest" chip.
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
      '.MuiBackdrop-root{display:none !important}' +
      '[style*="visibility: hidden"]{visibility:visible !important}',
  })

  const state = await page.evaluate(() => ({
    mainLen: (document.querySelector('main')?.innerText || '').trim().length,
    guest: /\bGuest\b/.test(document.body.innerText || ''),
  }))
  if (state.mainLen === 0 || state.guest)
    throw new Error('not authenticated — login/refresh did not take')

  // Let query data settle and skeletons resolve.
  await page.waitForTimeout(SETTLE)

  const extra = flag('wait')
  if (extra) await page.waitForSelector(extra, { timeout: 30000 }).catch(() => null)

  let result
  if (cmd === 'probe') {
    result = await page.evaluate(() => ({
      url: location.pathname,
      title: document.title,
      rootChars: document.getElementById('root')?.innerHTML.length ?? -1,
      mainChars: (document.querySelector('main')?.innerText || '').trim().length,
      rows: document.querySelectorAll('table tbody tr, [role="row"]').length,
      forbidden: /403|forbidden|insufficient permission/i.test(
        document.querySelector('main')?.innerText || '',
      ),
    }))
  } else if (cmd === 'text') {
    result = await page.evaluate(() => ({
      url: location.pathname,
      title: document.title,
      main: (document.querySelector('main')?.innerText || '').slice(0, 5000),
    }))
  } else if (cmd === 'shot') {
    fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true })
    await page.screenshot({ path: out, clip, fullPage: has('full') })
    result = { path: out, bytes: fs.statSync(out).size, viewport: `${viewport.width}x${viewport.height}` }
  } else {
    result = await page.evaluate((s) => {
      return [...document.querySelectorAll(s)].map((el) => {
        const r = el.getBoundingClientRect()
        return {
          tag: el.tagName,
          box: `${Math.round(r.width)}x${Math.round(r.height)} at (${Math.round(r.left)},${Math.round(r.top)})`,
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
  console.log([...errors].slice(0, 10).join('\n'))
}
await browser.close()
if (!ok) {
  console.error('FAILED: empty result after 3 attempts')
  process.exit(1)
}
