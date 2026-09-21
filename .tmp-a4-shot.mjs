import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
const args = process.argv.slice(2)
const flag = (n) => args.includes(`--${n}`)
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d }
const positional = args.filter((a, i) => !a.startsWith('--') && !['--width','--tag','--step'].includes(args[i - 1]))
const [outDir, ...routes] = positional
const BASE = 'http://localhost:5173'
fs.mkdirSync(outDir, { recursive: true })
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: Number(opt('width', 1440)), height: Number(opt('height', 900)) }, reducedMotion: flag('rm') ? 'reduce' : 'no-preference' })
if (flag('dark')) await ctx.addCookies([{ name: 'serafort-settings', value: encodeURIComponent(JSON.stringify({ mode: 'dark' })), url: BASE }])
const page = await ctx.newPage(); page.setDefaultNavigationTimeout(120000); page.setDefaultTimeout(60000)
for (let i = 0; i < 4; i++) {
  await page.goto(BASE + '/auth/sign-in', { waitUntil: 'load' })
  await page.waitForSelector('#email', { timeout: 40000 }).catch(() => {})
  await page.waitForTimeout(1500)
  await page.locator('#email').fill('admin@example.com'); await page.locator('#password').fill('TestPassword123!')
  const respP = page.waitForResponse((r) => /auth[/](login|sign-in)/.test(r.url()) && r.request().method() === 'POST', { timeout: 20000 }).catch(() => null)
  await page.getByRole('button', { name: /^sign in$/i }).click()
  const resp = await respP; const ok = !!resp && resp.status() < 300; await page.waitForTimeout(2500)
  if (ok) break
}
console.log('signed in ->', new URL(page.url()).pathname)
for (const route of routes) {
  const errs = []
  const onErr = (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) }
  page.on('console', onErr); page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message.slice(0, 200)))
  await page.goto(BASE + route, { waitUntil: 'load' })
  if (flag('rtl')) await page.evaluate(() => { document.documentElement.dir = 'rtl' })
  await page.waitForTimeout(3000)
  await page.waitForFunction(() => !document.querySelector('[role=progressbar]') || document.querySelectorAll('h1,h2').length > 0, null, { timeout: 25000 }).catch(() => {})
  await page.waitForTimeout(1500)
  const file = path.join(outDir, route.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') + (opt('tag','') ? '.' + opt('tag','') : '') + (flag('dark') ? '.dark' : '') + (flag('rtl') ? '.rtl' : '') + (opt('width') ? '.w' + opt('width') : '') + '.png')
  await page.screenshot({ path: file, fullPage: flag('full') })
  console.log(route, '->', new URL(page.url()).pathname, '|', errs.filter(e=>!/frame-ancestors|404|401/.test(e)).slice(0,3).join(' | ') || 'clean')
  page.removeListener('console', onErr)
}
await browser.close()
