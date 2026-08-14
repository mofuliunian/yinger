<script setup lang="ts">
import { computed, ref } from 'vue'
import dayjs, { type Dayjs } from 'dayjs'
import { db } from '../db'
import { profile, useQuery } from '../store'
import type { BabyEvent } from '../types'
import { ageInfo, fmtMinutes, minutesInDay } from '../utils/date'
import { findFeedingTips } from '../data/monthly'
import TimelineList from '../components/TimelineList.vue'
import EventEditor from '../components/EventEditor.vue'
import RhythmChart from '../components/RhythmChart.vue'

const view = ref<'calendar' | 'rhythm'>('calendar')
const month = ref(dayjs().startOf('month'))
const selected = ref(dayjs().startOf('day'))
const editor = ref<InstanceType<typeof EventEditor>>()

const allEvents = useQuery(() => db.events.orderBy('time').reverse().toArray(), [] as BabyEvent[])

// 有记录的日期集合
const dotDates = computed(() => {
  const set = new Set<string>()
  for (const e of allEvents.value) set.add(dayjs(e.time).format('YYYY-MM-DD'))
  return set
})

// 月网格：从当月第一天所在周的周日开始，共 6 周
const weeks = computed(() => {
  const start = month.value.startOf('week')
  const result: Dayjs[][] = []
  for (let w = 0; w < 6; w++) {
    const row: Dayjs[] = []
    for (let d = 0; d < 7; d++) row.push(start.add(w * 7 + d, 'day'))
    result.push(row)
  }
  return result
})

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

function selectDay(d: Dayjs) {
  selected.value = d
  if (!d.isSame(month.value, 'month')) month.value = d.startOf('month')
}

// 选中日的记录与统计
const dayEvents = computed(() =>
  allEvents.value.filter((e) => {
    if (dayjs(e.time).isSame(selected.value, 'day')) return true
    if (e.type === 'sleep' && minutesInDay(e.time, e.endTime, selected.value) > 0) return true
    return false
  })
)

const dayStats = computed(() => {
  const milk = dayEvents.value
    .filter((e) => e.type === 'feed' && dayjs(e.time).isSame(selected.value, 'day'))
    .reduce((s, e) => s + (e.data.amount ?? 0), 0)
  const sleep = dayEvents.value
    .filter((e) => e.type === 'sleep')
    .reduce((s, e) => s + minutesInDay(e.time, e.endTime, selected.value), 0)
  const poop = dayEvents.value.filter(
    (e) => e.type === 'poop' && dayjs(e.time).isSame(selected.value, 'day')
  ).length
  return { milk, sleep, poop }
})

const feedingTips = computed(() => {
  if (!profile.value) return null
  return findFeedingTips(ageInfo(profile.value.birthDate).monthAge)
})
</script>

<template>
  <div class="page">
    <div class="card" style="padding: 8px">
      <div class="seg">
        <button class="seg-btn" :class="{ active: view === 'calendar' }" @click="view = 'calendar'">
          📅 喂养日历
        </button>
        <button class="seg-btn" :class="{ active: view === 'rhythm' }" @click="view = 'rhythm'">
          📊 作息规律
        </button>
      </div>
    </div>

    <template v-if="view === 'calendar'">
      <div class="card">
        <div class="cal-header">
          <van-button size="small" plain round @click="month = month.subtract(1, 'month')">◀ 上个月</van-button>
          <div class="cal-title">{{ month.format('YYYY年 M月') }}</div>
          <van-button size="small" plain round @click="month = month.add(1, 'month')">下个月 ▶</van-button>
        </div>
        <div class="cal-grid">
          <div v-for="w in weekdays" :key="w" class="cal-cell muted">{{ w }}</div>
          <template v-for="(row, wi) in weeks" :key="wi">
            <button
              v-for="d in row"
              :key="d.format('YYYY-MM-DD')"
              class="cal-cell cal-day"
              :class="{
                dim: !d.isSame(month, 'month'),
                today: d.isSame(dayjs(), 'day'),
                selected: d.isSame(selected, 'day'),
              }"
              @click="selectDay(d)"
            >
              {{ d.date() }}
              <i v-if="dotDates.has(d.format('YYYY-MM-DD'))" class="cal-dot"></i>
            </button>
          </template>
        </div>
      </div>

      <div class="card">
        <div class="card-title">🗓️ {{ selected.format('YYYY-MM-DD') }}</div>
        <div class="day-stats muted">
          🍼 {{ dayStats.milk }}ml · 😴 {{ fmtMinutes(dayStats.sleep) }} · 💩 {{ dayStats.poop }}次
        </div>
        <TimelineList :events="dayEvents" @edit="editor?.open($event)" />
      </div>
    </template>

    <template v-else>
      <div class="card">
        <div class="card-title">📊 近两周作息</div>
        <RhythmChart :events="allEvents" :days="14" />
        <p class="muted" style="margin: 8px 0 0">色条为睡眠时段，蓝点为喂奶，橙点为排便，可观察作息是否逐渐规律</p>
      </div>
    </template>

    <div class="card" v-if="feedingTips">
      <div class="card-title">💡 本月喂养要点（{{ feedingTips.range.label }}）</div>
      <ul class="tips">
        <li v-for="(p, i) in feedingTips.points" :key="i">{{ p }}</li>
      </ul>
    </div>

    <EventEditor ref="editor" />
  </div>
</template>

<style scoped>
.seg {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.seg-btn {
  border: none;
  background: transparent;
  padding: 8px;
  border-radius: 10px;
  font-size: 14px;
  color: var(--app-text-2);
}

.seg-btn.active {
  background: rgba(79, 195, 247, 0.15);
  color: var(--app-primary);
  font-weight: 600;
}

.cal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.cal-title {
  font-weight: 700;
  font-size: 16px;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.cal-cell {
  text-align: center;
  padding: 6px 0;
  font-size: 14px;
}

.cal-day {
  position: relative;
  border: none;
  background: transparent;
  color: var(--app-text);
  border-radius: 10px;
  height: 40px;
}

.cal-day.dim {
  color: var(--app-text-2);
  opacity: 0.4;
}

.cal-day.today {
  outline: 1px solid var(--app-primary);
}

.cal-day.selected {
  background: var(--app-primary);
  color: #fff;
  font-weight: 700;
}

.cal-dot {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--app-poop);
}

.cal-day.selected .cal-dot {
  background: #fff;
}

.day-stats {
  margin-bottom: 8px;
}

.tips {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 1.9;
}
</style>
