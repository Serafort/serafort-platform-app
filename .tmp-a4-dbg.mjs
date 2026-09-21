import { chromium } from 'playwright'
const b = await chromium.launch(); const p = await b.newPage()
p.on('response', async r => { if (r.status()>=400) console.log(r.status(), r.request().method(), r.url(), (await r.text().catch(()=>'')).slice(0,300), r.request().postData()?.slice(0,200)) })
await p.goto('http://localhost:5173/auth/sign-in'); await p.waitForSelector('input[type=password]')
await p.locator('#email').fill('admin@example.com'); await p.locator('#password').fill('TestPassword123!')
await p.waitForTimeout(500)
await p.getByRole('button', { name: /^sign in$/i }).click(); await p.waitForTimeout(6000); console.log(p.url()); await p.goto('http://localhost:5173/admin/users'); await p.waitForTimeout(6000); console.log(p.url())
await b.close()
