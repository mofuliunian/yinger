// 冒烟测试：档案设置 → 记录喝奶 → 检查统计与时间线 → 各页面无报错
import { chromium } from 'playwright-core'

const BASE = 'http://localhost:4173'
const errors = []

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`console: ${msg.text()}`)
})

await page.goto(BASE, { waitUntil: 'networkidle' })

// 1. 档案设置
await page.waitForSelector('text=欢迎使用宝宝记录', { timeout: 20000 })
await page.fill('input[placeholder="如：安崽"]', '测试宝')
await page.click('text=女宝 👧')
await page.fill('input[type="date"]', '2026-03-06')
await page.click('button:has-text("开始使用")')
await page.waitForSelector('text=快速记录', { timeout: 5000 })
console.log('✓ 档案设置完成，进入首页')

// 2. 记录喝奶
await page.click('button:has-text("记录喝奶")')
await page.waitForSelector('.van-popup--bottom', { timeout: 3000 })
await page.click('.van-popup--bottom .chip:has-text("150")')
await page.click('.van-popup--bottom button:has-text("保存")')
await page.waitForSelector('text=距上次喂奶已过', { timeout: 3000 })
console.log('✓ 喝奶记录成功，喂奶计时出现')

// 3. 统计应显示 150ml
const stat = await page.textContent('.stats-grid')
if (!stat.includes('150')) throw new Error('今日统计未显示 150ml: ' + stat)
console.log('✓ 今日统计正确显示 150ml')

// 4. 记录睡眠（入睡）→ 出现「记录醒来」
await page.click('button:has-text("记录睡眠")')
await page.click('.van-popup--bottom button:has-text("保存")')
await page.waitForSelector('text=宝宝睡眠中', { timeout: 3000 })
console.log('✓ 睡眠记录成功，显示睡眠中')
await page.click('.sleeping button:has-text("记录醒来")')
await page.waitForSelector('.sleeping', { state: 'detached', timeout: 3000 })
console.log('✓ 记录醒来成功')

// 5. 各页面遍历
for (const [path, marker] of [
  ['#/calendar', '喂养日历'],
  ['#/growth', '生长曲线'],
  ['#/plan', '疫苗'],
  ['#/mine', '数据备份'],
]) {
  await page.goto(`${BASE}/${path}`)
  await page.waitForSelector(`text=${marker}`, { timeout: 5000 })
  console.log(`✓ 页面 ${path} 正常渲染`)
}

// 6. 计划页疫苗打卡
await page.goto(`${BASE}/#/plan`)
await page.click('.vac-item >> nth=0 >> button:has-text("打卡")')
await page.click('.van-popup--bottom button:has-text("确认完成")')
await page.waitForSelector('text=实际：', { timeout: 3000 })
console.log('✓ 疫苗打卡成功')

// 7. 截图
await page.goto(`${BASE}/#/`)
await page.waitForTimeout(500)
await page.screenshot({ path: 'scripts/screenshot-home.png' })
await page.goto(`${BASE}/#/plan`)
await page.waitForTimeout(500)
await page.screenshot({ path: 'scripts/screenshot-plan.png' })

await browser.close()

if (errors.length) {
  console.log('\n⚠ 捕获到控制台错误:')
  for (const e of errors) console.log(' -', e)
  process.exit(1)
}
console.log('\n全部通过，无控制台错误')
