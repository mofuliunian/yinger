<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import type { BabyEvent } from '../types'

const props = defineProps<{ events: BabyEvent[]; days?: number }>()

const W = 100 // viewBox 宽度百分比单位
const ROW_H = 16
const dayCount = computed(() => props.days ?? 14)

interface Row {
  label: string
  sleepSegs: { x: number; w: number }[]
  feedDots: number[]
  poopDots: number[]
}

const rows = computed<Row[]>(() => {
  const result: Row[] = []
  const today = dayjs().startOf('day')
  for (let i = dayCount.value - 1; i >= 0; i--) {
    const day = today.subtract(i, 'day')
    const dayStart = day
    const dayEnd = day.endOf('day')
    const toX = (t: dayjs.Dayjs) => (t.diff(dayStart, 'minute') / 1440) * W

    const sleepSegs: { x: number; w: number }[] = []
    const feedDots: number[] = []
    const poopDots: number[] = []

    for (const e of props.events) {
      const t = dayjs(e.time)
      if (e.type === 'sleep') {
        const end = e.endTime ? dayjs(e.endTime) : dayjs()
        if (end.isBefore(dayStart) || t.isAfter(dayEnd)) continue
        const from = t.isAfter(dayStart) ? t : dayStart
        const to = end.isBefore(dayEnd) ? end : dayEnd
        const x = toX(from)
        const w = Math.max(0.5, toX(to) - x)
        sleepSegs.push({ x, w })
      } else if (e.type === 'feed' && t.isSame(day, 'day')) {
        feedDots.push(toX(t))
      } else if (e.type === 'poop' && t.isSame(day, 'day')) {
        poopDots.push(toX(t))
      }
    }
    result.push({ label: day.format('M/D'), sleepSegs, feedDots, poopDots })
  }
  return result
})
</script>

<template>
  <div>
    <div class="legend muted">
      <span><i class="dot sleep"></i>睡眠</span>
      <span><i class="dot feed"></i>喂奶</span>
      <span><i class="dot poop"></i>排便</span>
      <span style="margin-left: auto">0点 → 24点</span>
    </div>
    <div v-for="r in rows" :key="r.label" class="rhythm-row">
      <div class="row-label muted">{{ r.label }}</div>
      <svg
        :viewBox="`0 0 ${W} ${ROW_H}`"
        preserveAspectRatio="none"
        class="row-svg"
        :style="{ height: ROW_H + 'px' }"
      >
        <rect x="0" y="0" :width="W" :height="ROW_H" rx="3" class="row-bg" />
        <rect
          v-for="(s, i) in r.sleepSegs"
          :key="'s' + i"
          :x="s.x"
          y="2"
          :width="s.w"
          :height="ROW_H - 4"
          rx="2"
          fill="#9575cd"
          opacity="0.85"
        />
        <circle v-for="(x, i) in r.feedDots" :key="'f' + i" :cx="x" :cy="ROW_H / 2" r="2.2" fill="#2196f3" />
        <circle v-for="(x, i) in r.poopDots" :key="'p' + i" :cx="x" :cy="ROW_H - 3.5" r="2" fill="#ff9800" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.legend {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  align-items: center;
}

.legend .dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}

.dot.sleep {
  background: #9575cd;
}

.dot.feed {
  background: #2196f3;
}

.dot.poop {
  background: #ff9800;
}

.rhythm-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.row-label {
  width: 34px;
  flex-shrink: 0;
  font-size: 11px;
  text-align: right;
}

.row-svg {
  flex: 1;
  display: block;
}

.row-bg {
  fill: rgba(128, 128, 128, 0.1);
}
</style>
