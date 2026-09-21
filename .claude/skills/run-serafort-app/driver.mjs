#!/usr/bin/env node
/**
 * Serafort web app driver.
 *
 * Drives the running Vite dev server with Playwright: navigate, screenshot,
 * measure DOM geometry, and surface console/page errors. For seeing a change
 * work in the real app rather than in a test.
 *
 * Usage (from the repo root, dev server already up on :5173):
 *
 *   node .claude/skills/run-serafort-app/driver.mjs probe /
 *   node .claude/skills/run-serafort-app/driver.mjs shot / out/landing.png
 *   node .claude/skills/run-serafort-app/driver.mjs shot /dashboard out/nav.png --shell
 *   node .claude/skills/run-serafort-app/driver.mjs measure /dashboard ".vertical-nav-header img" --shell
 *
 * Options:
 *   --shell          render an authenticated route (see THE SHELL RACE below)
 *   --width N        viewport width  (default 1440; use 1024 to collapse the nav)
 *   --height N       viewport height (default 900)
 *   --dark           dark mode (seeds the settings cookie - the app ignores
 *                    prefers-color-scheme)
 *   --clip x,y,w,h   crop the screenshot
 *   --wait <sel>     extra selector to wait for before acting
 *   --base URL       dev server origin (default http://localhost:5173)
 *
 * THE SHELL RACE
 * With no backend (VITE_API_URL empty), /dashboard and friends do mount the
 * whole authenticated shell - but LayoutWrapper holds it behind a
 * `visibility: hidden` veil plus an opaque white MuiBackdrop (z-index 1400)
 * while it "hydrates", and the auth guard then swaps it for the public layout.
 * --shell handles all three parts:
 *   1. holds /api/v1/auth/* open so the guard never resolves, which stretches
 *      the window from ~2.5s to ~10s,
 *   2. strips veil and backdrop with an injected stylesheet - a stylesheet,
 *      not inline styles, because React re-renders the backdrop and would wipe
 *      anything set inline,
 *   3. acts immediately with no sleeps, and retries the whole navigation if
 *      the result came out empty.
 */
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

// Playwright is hoisted to the workspace root and is CommonJS: a bare
// `import { chromium } from 'playwright'` fails from outside the root, and the
// named import fails even from inside it.
const repoRoot = path.resolve(import.meta.dirname, '../../..')
const require = createRequire(import.meta.url)
const pwPath = require.resolve('playwright', { paths: [repoRoot] })
const { chromium } = (await import(pathToFileURL(pwPath).href)).default

const argv = process.argv.slice(2)
const cmd = argv[0]
const positional = argv.slice(1).filter((a) => !a.startsWith('--'))
const flag = (n, d = null) => (argv.indexOf('--' + n) === -1 ? d : argv[argv.indexOf('--' + n) + 1])
const has = (n) => argv.includes('--' + n)

if (!['probe', 'shot', 'measure'].includes(cmd)) {
  console.error('usage: driver.mjs <probe|shot|measure> <route> [args] [options]')
  process.exit(2)
}

// Git Bash / MSYS rewrites a bare "/" argument into a Windows path. Callers
// should prefix with MSYS_NO_PATHCONV=1; normalise defensively regardless.
const raw = positional[0] || '/'
const route = /^[A-Za-z]:[\\/]/.test(raw) ? '/' : raw.startsWith('/') ? raw : '/' + raw

const BASE = flag('base', 'http://localhost:5173')
const viewport = { width: Number(flag('width', 1440)), height: Number(flag('height', 900)) }
const SHELL = '.vertical-nav-header'
// themeConfig.settingsCookieName in packages/theme/src/config/themeConfig.ts
const SETTINGS_COOKIE = 'serafort-settings'
const MIN_PNG = 3000 // below this a clipped screenshot is almost certainly blank

const clipArg = flag('clip')
const clip = clipArg
  ? (([x, y, width, height]) => ({ x, y, width, height }))(clipArg.split(',').map(Number))
  : undefined

const browser = await chromium.launch()
const errors = new Set()

async function attempt(out) {
  // --dark: the app does NOT follow prefers-color-scheme. index.html's
  // anti-flash script and the settings store both read the settings cookie
  // (themeConfig.settingsCookieName), so the mode has to be seeded there.
  const context = await browser.newContext({
    viewport,
    colorScheme: has('dark') ? 'dark' : 'light',
  })
  if (has('dark')) {
    await context.addCookies([
      {
        name: SETTINGS_COOKIE,
        value: encodeURIComponent(JSON.stringify({ mode: 'dark' })),
        url: BASE,
      },
    ])
  }
  const page = await context.newPage()
  page.on('pageerror', (e) => errors.add('PAGEERROR: ' + e.message.slice(0, 300)))
  page.on('console', (m) => {
    if (m.type() !== 'error') return
    const t = m.text()
    // Benign: index.html's CSP <meta> fallback cannot carry frame-ancestors.
    if (t.includes("'frame-ancestors' is ignored")) return
    errors.add('CONSOLE: ' + t.slice(0, 300))
  })

  // Hold auth open so the guard never decides we are logged out.
  if (has('shell')) await page.route('**/api/v1/auth/**', () => {})

  await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 60000 })

  if (has('shell')) {
    await page.waitForSelector(SHELL + ' img', { state: 'attached', timeout: 60000 })
    // Wait only for the shell's own image - waiting on every image on the page
    // burns the window.
    await page
      .waitForFunction(
        (s) => {
          const i = document.querySelector(s + ' img')
          return !!i && i.complete && i.naturalWidth > 0
        },
        SHELL,
        { timeout: 15000 },
      )
      .catch(() => null)
    await page.addStyleTag({
      content:
        '.MuiBackdrop-root,.MuiCircularProgress-root{display:none !important}' +
        '[style*="visibility: hidden"]{visibility:visible !important}',
    })
  } else {
    await page.waitForTimeout(3000)
  }

  const extra = flag('wait')
  if (extra) await page.waitForSelector(extra, { timeout: 30000 }).catch(() => null)

  let result
  if (cmd === 'probe') {
    result = await page.evaluate(() => ({
      url: location.pathname,
      title: document.title,
      rootChars: document.getElementById('root')?.innerHTML.length ?? -1,
      images: [...document.images].map((i) => ({
        src: i.getAttribute('src'),
        loaded: i.complete && i.naturalWidth > 0,
        box:
          Math.round(i.getBoundingClientRect().width) +
          'x' +
          Math.round(i.getBoundingClientRect().height),
      })),
    }))
  } else if (cmd === 'shot') {
    fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true })
    await page.screenshot({ path: out, clip })
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
          src: el.getAttribute?.('src') ?? undefined,
          box:
            Math.round(r.width) +
            'x' +
            Math.round(r.height) +
            ' at (' +
            Math.round(r.left) +
            ',' +
            Math.round(r.top) +
            ')',
          parent: p ? Math.round(p.width) + 'x' + Math.round(p.height) : null,
          rightGap: p ? Math.round(p.right - r.right) : null,
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
