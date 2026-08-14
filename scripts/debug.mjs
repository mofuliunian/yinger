import { chromium } from 'playwright-core'

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
page.on('pageerror', (e) => console.log('PAGEERROR:', e.message))
page.on('console', (msg) => console.log(`CONSOLE[${msg.type()}]:`, msg.text().slice(0, 300)))
await page.goto('http://localhost:4173', { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)
const body = await page.textContent('body')
console.log('BODY:', JSON.stringify(body?.slice(0, 300)))
await page.screenshot({ path: 'scripts/debug.png' })
await browser.close()
