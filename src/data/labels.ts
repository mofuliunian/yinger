import type { EventType } from '../types'

export const EVENT_META: Record<EventType, { label: string; icon: string; color: string }> = {
  feed: { label: '喝奶', icon: '🍼', color: '#4fc3f7' },
  sleep: { label: '睡眠', icon: '😴', color: '#9575cd' },
  poop: { label: '排便', icon: '💩', color: '#ffb74d' },
  spitup: { label: '吐奶', icon: '💦', color: '#4dd0e1' },
  temperature: { label: '体温', icon: '🌡️', color: '#ef5350' },
  medicine: { label: '用药', icon: '💊', color: '#66bb6a' },
  solid: { label: '辅食', icon: '🥣', color: '#ffa726' },
  growth: { label: '身高体重', icon: '📏', color: '#26a69a' },
  milestone: { label: '里程碑', icon: '⭐', color: '#ffca28' },
  vaccine: { label: '疫苗', icon: '💉', color: '#7e57c2' },
}

export const FEED_METHODS = [
  { value: 'formula', label: '配方奶' },
  { value: 'bottle', label: '瓶喂母乳' },
  { value: 'breast', label: '亲喂' },
] as const

export const FEED_METHOD_LABEL: Record<string, string> = {
  formula: '配方奶',
  bottle: '瓶喂母乳',
  breast: '亲喂',
}

export const BREAST_SIDES = [
  { value: 'left', label: '左侧' },
  { value: 'right', label: '右侧' },
  { value: 'both', label: '两侧' },
] as const

export const BREAST_SIDE_LABEL: Record<string, string> = {
  left: '左侧',
  right: '右侧',
  both: '两侧',
}

export const QUICK_AMOUNTS = [60, 90, 120, 150, 180]

export const POOP_TEXTURES = ['稀水便', '糊状', '软便', '成形', '奶瓣', '泡沫', '黏液', '干硬']

export const POOP_COLORS = ['金黄', '黄', '黄绿', '绿', '褐', '黑（就医）', '红（就医）', '灰白（就医）']

export const SPITUP_AMOUNTS = ['少量', '中量', '大量（喷射状）']

export const MEDICINE_PRESETS = ['维生素D', '维生素AD', '铁剂', '益生菌', '退烧药', '其他']

export const MILESTONE_CATEGORIES = [
  { value: '大运动', icon: '🏃' },
  { value: '精细动作', icon: '👌' },
  { value: '语言', icon: '💬' },
  { value: '社交情感', icon: '😊' },
  { value: '认知', icon: '🧠' },
  { value: '喂养', icon: '🍼' },
  { value: '睡眠', icon: '💤' },
  { value: '其他', icon: '✨' },
]
