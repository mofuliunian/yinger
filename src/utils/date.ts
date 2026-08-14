import dayjs, { type Dayjs } from 'dayjs'

/** 当前时间的 ISO 字符串（带本地时区偏移） */
export function nowISO(): string {
  return dayjs().format()
}

/** ISO -> datetime-local 输入框值 */
export function toLocalInput(iso: string): string {
  return dayjs(iso).format('YYYY-MM-DDTHH:mm')
}

/** datetime-local 输入框值 -> ISO */
export function fromLocalInput(v: string): string {
  return dayjs(v).format()
}

export function fmtTime(iso: string): string {
  return dayjs(iso).format('HH:mm')
}

export function fmtDate(iso: string): string {
  return dayjs(iso).format('YYYY-MM-DD')
}

export function fmtDateCN(iso: string): string {
  return dayjs(iso).format('M月D日')
}

/** 分钟 -> 「X小时Y分」 */
export function fmtMinutes(mins: number): string {
  const m = Math.round(mins)
  const h = Math.floor(m / 60)
  const r = m % 60
  if (h <= 0) return `${r}分钟`
  if (r === 0) return `${h}小时`
  return `${h}小时${r}分`
}

export interface AgeInfo {
  months: number
  days: number
  totalDays: number
  /** 小数月龄，用于生长曲线 */
  monthAge: number
  text: string // 如「4个月23天」
}

export function ageInfo(birthDate: string, at?: string | Dayjs): AgeInfo {
  const birth = dayjs(birthDate).startOf('day')
  const now = (at ? dayjs(at) : dayjs()).startOf('day')
  const totalDays = now.diff(birth, 'day')
  const months = now.diff(birth, 'month')
  const days = now.diff(birth.add(months, 'month'), 'day')
  const monthAge = totalDays / 30.4375
  let text: string
  if (totalDays < 0) {
    text = '还未出生'
  } else if (months <= 0) {
    text = `${totalDays}天`
  } else if (months < 24) {
    text = days > 0 ? `${months}个月${days}天` : `${months}个月`
  } else {
    const years = Math.floor(months / 12)
    const rm = months % 12
    text = rm > 0 ? `${years}岁${rm}个月` : `${years}岁`
  }
  return { months, days, totalDays, monthAge, text }
}

/** 事件在指定自然日内的时长（分钟），用于睡眠跨天统计 */
export function minutesInDay(startISO: string, endISO: string | null | undefined, day: Dayjs): number {
  const dayStart = day.startOf('day')
  const dayEnd = day.endOf('day')
  const s = dayjs(startISO)
  const e = endISO ? dayjs(endISO) : dayjs()
  const from = s.isAfter(dayStart) ? s : dayStart
  const to = e.isBefore(dayEnd) ? e : dayEnd
  return Math.max(0, to.diff(from, 'minute'))
}
