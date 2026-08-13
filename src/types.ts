export type EventType =
  | 'feed'
  | 'poop'
  | 'sleep'
  | 'spitup'
  | 'temperature'
  | 'medicine'
  | 'solid'
  | 'growth'
  | 'milestone'
  | 'vaccine'

export interface FeedData {
  method: 'formula' | 'bottle' | 'breast'
  amount?: number // ml，配方奶/瓶喂母乳
  side?: 'left' | 'right' | 'both' // 亲喂
  duration?: number // 分钟，亲喂
}

export interface PoopData {
  texture?: string
  color?: string
}

export interface GrowthData {
  height?: number // cm
  weight?: number // kg
}

export interface MilestoneData {
  category: string
  title: string
}

export interface BabyEvent {
  id?: number
  type: EventType
  time: string // ISO 字符串（带时区）
  endTime?: string | null // 睡眠结束时间
  data: Record<string, any>
  note?: string
}

export interface Profile {
  name: string
  gender: 'boy' | 'girl'
  birthDate: string // YYYY-MM-DD
}
