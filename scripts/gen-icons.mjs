// 从 public/favicon.svg 生成 PWA 所需的 PNG 图标
import sharp from 'sharp'
import { readFile } from 'node:fs/promises'

const svg = await readFile(new URL('../public/favicon.svg', import.meta.url))

const tasks = [
  { file: 'public/pwa-192.png', size: 192 },
  { file: 'public/pwa-512.png', size: 512 },
  { file: 'public/apple-touch-icon.png', size: 180 },
]

for (const { file, size } of tasks) {
  await sharp(svg).resize(size, size).png().toFile(file)
  console.log('generated', file)
}

// maskable：图标缩小到 80% 居中，四周留安全区
const inner = await sharp(svg).resize(410, 410).png().toBuffer()
await sharp({
  create: { width: 512, height: 512, channels: 4, background: '#2196f3' },
})
  .composite([{ input: inner, gravity: 'center' }])
  .png()
  .toFile('public/pwa-512-maskable.png')
console.log('generated public/pwa-512-maskable.png')
