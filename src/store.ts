import { ref, watchEffect, type Ref } from 'vue'
import { db } from './db'
import type { BabyEvent, Profile } from './types'

/** 每次数据库变更 +1，驱动所有 useQuery 重新查询 */
export const dbTick = ref(0)
export function bump() {
  dbTick.value++
}

export async function addEvent(e: BabyEvent): Promise<number> {
  const id = await db.events.add({ ...e })
  bump()
  return id
}

export async function updateEvent(id: number, changes: Partial<BabyEvent>) {
  await db.events.update(id, changes)
  bump()
}

export async function deleteEvent(id: number) {
  await db.events.delete(id)
  bump()
}

/**
 * 响应式查询：dbTick 变化或 fn 中同步读取的响应式依赖变化时重新执行。
 * 注意：需要在 await 之前读取响应式依赖。
 */
export function useQuery<T>(fn: () => Promise<T>, initial: T): Ref<T> {
  const value = ref(initial) as Ref<T>
  watchEffect(() => {
    void dbTick.value
    const p = fn()
    p.then((v) => {
      value.value = v
    })
  })
  return value
}

// ---------- 宝宝档案 ----------

export const profile = ref<Profile | null | undefined>(undefined) // undefined = 加载中

export async function loadProfile() {
  const row = await db.settings.get('profile')
  profile.value = (row?.value as Profile) ?? null
}

export async function saveProfile(p: Profile) {
  await db.settings.put({ key: 'profile', value: { ...p } })
  profile.value = { ...p }
}

// ---------- 通用设置 ----------

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const row = await db.settings.get(key)
  return row?.value as T | undefined
}

export async function putSetting(key: string, value: any) {
  await db.settings.put({ key, value })
  bump()
}

// ---------- 撤销条 ----------

interface UndoState {
  show: boolean
  message: string
  onUndo: (() => void) | null
}

export const undoState = ref<UndoState>({ show: false, message: '', onUndo: null })
let undoTimer: ReturnType<typeof setTimeout> | undefined

export function showUndo(message: string, onUndo: () => void) {
  undoState.value = { show: true, message, onUndo }
  clearTimeout(undoTimer)
  undoTimer = setTimeout(() => {
    undoState.value = { show: false, message: '', onUndo: null }
  }, 5000)
}

export function dismissUndo() {
  clearTimeout(undoTimer)
  undoState.value = { show: false, message: '', onUndo: null }
}
