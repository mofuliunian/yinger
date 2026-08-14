import dayjs from 'dayjs'
import { db } from '../db'
import { bump, loadProfile, putSetting } from '../store'
import type { BabyEvent, Profile } from '../types'

export interface BackupPayload {
  version: 1
  exportedAt: string
  profile: Profile | null
  events: BabyEvent[]
}

export async function buildBackup(): Promise<BackupPayload> {
  const profileRow = await db.settings.get('profile')
  const events = await db.events.orderBy('time').toArray()
  return {
    version: 1,
    exportedAt: dayjs().format(),
    profile: (profileRow?.value as Profile) ?? null,
    events,
  }
}

export async function markBackedUp() {
  await putSetting('lastBackupAt', dayjs().format())
}

/** 导出为 JSON 文件下载 */
export async function exportToFile() {
  const payload = await buildBackup()
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `宝宝记录备份-${dayjs().format('YYYYMMDD-HHmm')}.json`
  a.click()
  URL.revokeObjectURL(url)
  await markBackedUp()
}

/** 覆盖导入 */
export async function importBackup(payload: BackupPayload) {
  if (!payload || payload.version !== 1 || !Array.isArray(payload.events)) {
    throw new Error('文件格式不正确或版本不支持')
  }
  await db.transaction('rw', db.events, db.settings, async () => {
    await db.events.clear()
    const events = payload.events.map((e) => {
      const { id, ...rest } = e
      return rest as BabyEvent
    })
    await db.events.bulkAdd(events)
    if (payload.profile) {
      await db.settings.put({ key: 'profile', value: payload.profile })
    }
  })
  await loadProfile()
  bump()
}

export async function importFromFile(file: File) {
  const text = await file.text()
  await importBackup(JSON.parse(text))
}

// ---------- 同步码：gzip + base64 ----------

const SYNC_PREFIX = 'BB1:'

async function gzip(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new CompressionStream('gzip'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function gunzip(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream('gzip'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export async function generateSyncCode(): Promise<string> {
  const payload = await buildBackup()
  const raw = new TextEncoder().encode(JSON.stringify(payload))
  const compressed = await gzip(raw)
  await markBackedUp()
  return SYNC_PREFIX + toBase64(compressed)
}

export async function importSyncCode(code: string) {
  const trimmed = code.trim()
  if (!trimmed.startsWith(SYNC_PREFIX)) {
    throw new Error('同步码格式不正确，应以 BB1: 开头')
  }
  const bytes = fromBase64(trimmed.slice(SYNC_PREFIX.length))
  const raw = await gunzip(bytes)
  const payload = JSON.parse(new TextDecoder().decode(raw))
  await importBackup(payload)
}
