/**
 * Authenticated screenshots against the real local backend.
 *
 *   node .claude/skills/run-serafort-app/authshot.mjs <outDir> <route> [<route>...] [--dark] [--rtl] [--width N]
 *
 * Signs in through the real sign-in form with the seeded LOCAL dev admin
 * (Authentication/database/seeders/01_core_starter_seeder.ts), then visits every
 * route, waits for the shell to settle, writes <outDir>/<route-slug>.png and
 * prints the final URL, visible heading, and console/network errors per route.
 *
 * Needs: dev server on :5173 and the Authentication backend on :3333.
 * On Git Bash run with MSYS_NO_PATHCONV=1 or "/route" is rewritten to
 * "C:/Program Files/Git/route" and you silently screenshot the landing page.
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const flag = (n) => args.includes(`--${n}`)
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d }
const positional = args.filter((a, i) => !a.startsWith('--') && !(args[i - 1] === '--width'))
const [outDir, ...routes] = positional
if (!outDir || routes.length === 0) { console.error('usage: authshot.mjs <outDir> <route>... [--dark] [--rtl] [--width N]'); process.exit(2) }

const BASE = process.env.BASE_URL ?? 'http://localhost:5173'
const EMAIL = process.env.SF_EMAIL ?? 'admin@example.com'
const PASSWORD = process.env.SF_PASSWORD ?? 'TestPassword123!'
fs.mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: Number(opt('width', 1440)), height: 900 } })
if (flag('dark')) await ctx.addCookies([{ name: 'serafort-settings', value: encodeURIComponent(JSON.stringify({ mode: 'dark' })), url: BASE }])
const page = await ctx.newPage()

for (let attempt=0; attempt<4 && !flag('public'); attempt++) {
await page.goto(`${BASE}/auth/sign-in`, { waitUntil: 'load' })
await page.waitForSelector('input[type=password]', { timeout: 120000 })
const emailInput = page.locator('form input:not([type=password]):not([type=checkbox]):visible').first()
await emailInput.fill(EMAIL)
const pw = page.locator('input[type=password]').first()
await pw.fill(PASSWORD)
await page.locator('button[type=submit]').click()
await page.waitForURL((u) => !u.pathname.startsWith('/auth/sign-in'), { timeout: 20000 }).catch(() => {})
  if (!new URL(page.url()).pathname.startsWith('/auth/sign-in')) break
  console.log('  sign-in retry', attempt+1); await page.waitForTimeout(6000)
}
if (!flag('public')) console.log('signed in ->', new URL(page.url()).pathname)

for (const route of routes) {
  const errs = []
  const onErr = (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)) }
  const onResp = (r) => { if (r.status() >= 500) errs.push(`${r.status()} ${new URL(r.url()).pathname}`) }
  page.on('console', onErr); page.on('response', onResp); page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message.slice(0, 140)))
  await page.goto(BASE + route, { waitUntil: 'load' })
  if (flag('rtl')) await page.evaluate(() => { document.documentElement.dir = 'rtl' })
  await page.waitForSelector('h1, h2', { timeout: 45000 }).catch(()=>console.log('  (no heading after 45s)'))
  await page.waitForTimeout(1500)
  const heading = await page.locator('h1,h2').first().innerText({ timeout: 1500 }).catch(() => '(no heading)')
  const file = path.join(outDir, route.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') + (flag('dark') ? '.dark' : '') + '.png')
  await page.screenshot({ path: file })
  console.log(`${route}\n  landed: ${new URL(page.url()).pathname}\n  heading: ${heading.replace(/\s+/g, ' ')}\n  shot: ${file}\n  errors: ${errs.length ? errs.slice(0, 4).join(' | ') : 'none'}`)
  page.removeListener('console', onErr); page.removeListener('response', onResp)
}
await browser.close()
