<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import dayjs from 'dayjs'
import { showToast } from 'vant'
import { db } from '../db'
import { profile, useQuery, updateEvent, getSetting } from '../store'
import type { BabyEvent, EventType } from '../types'
import { ageInfo, fmtMinutes, minutesInDay, nowISO } from '../utils/date'
import { SOLID_FOOD_START_MONTH } from '../data/monthly'
import FeedSheet from '../components/FeedSheet.vue'
import SleepSheet from '../components/SleepSheet.vue'
import PoopSheet from '../components/PoopSheet.vue'
import ExtraSheet from '../components/ExtraSheet.vue'
import GrowthSheet from '../components/GrowthSheet.vue'
import MilestoneSheet from '../components/MilestoneSheet.vue'
import TimelineList from '../components/TimelineList.vue'

const now = ref(dayjs())
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => (now.value = dayjs()), 30_000)
})
onUnmounted(() => clearInterval(timer))

const allEvents = useQuery(() => db.events.orderBy('time').reverse().toArray(), [] as BabyEvent[])
const lastBackupAt = useQuery(() => getSetting<string>('lastBackupAt').then((v) => v ?? null), null as string | null)

// ---------- 宝宝信息 ----------
const age = computed(() => (profile.value ? ageInfo(profile.value.birthDate, now.value) : null))

const nextMonthCountdown = computed(() => {
  if (!profile.value || !age.value) return null
  const nextMonths = age.value.months + 1
  const nextDate = dayjs(profile.value.birthDate).add(nextMonths, 'month')
  const days = nextDate.diff(now.value.startOf('day'), 'day')
  return { months: nextMonths, days }
})

const solidCountdown = computed(() => {
  if (!profile.value || !age.value) return null
  if (age.value.monthAge >= SOLID_FOOD_START_MONTH) return null
  const target = dayjs(profile.value.birthDate).add(SOLID_FOOD_START_MONTH, 'month')
  return target.diff(now.value.startOf('day'), 'day')
})

// ---------- 距上次喂奶 ----------
const lastFeed = computed(() => allEvents.value.find((e) => e.type === 'feed'))
const sinceLastFeed = computed(() => {
  if (!lastFeed.value) return null
  const mins = now.value.diff(dayjs(lastFeed.value.time), 'minute')
  if (mins < 0) return null
  return fmtMinutes(mins)
})

// ---------- 进行中的睡眠 ----------
const openSleep = computed(() => allEvents.value.find((e) => e.type === 'sleep' && !e.endTime))
const sleepingFor = computed(() => {
  if (!openSleep.value) return ''
  return fmtMinutes(now.value.diff(dayjs(openSleep.value.time), 'minute'))
})

async function recordWake() {
  if (!openSleep.value?.id) return
  await updateEvent(openSleep.value.id, { endTime: nowISO() })
  showToast('已记录醒来')
}

// ---------- 今日统计 ----------
const todayEvents = computed(() =>
  allEvents.value.filter((e) => {
    if (dayjs(e.time).isSame(now.value, 'day')) return true
    // 跨天睡眠也算进今天
    if (e.type === 'sleep' && minutesInDay(e.time, e.endTime, now.value) > 0) return true
    return false
  })
)

const totalMilk = computed(() =>
  todayEvents.value
    .filter((e) => e.type === 'feed' && dayjs(e.time).isSame(now.value, 'day'))
    .reduce((sum, e) => sum + (e.data.amount ?? 0), 0)
)

const breastCount = computed(
  () =>
    todayEvents.value.filter(
      (e) => e.type === 'feed' && e.data.method === 'breast' && dayjs(e.time).isSame(now.value, 'day')
    ).length
)

const totalSleep = computed(() =>
  todayEvents.value
    .filter((e) => e.type === 'sleep')
    .reduce((sum, e) => sum + minutesInDay(e.time, e.endTime, now.value), 0)
)

const poopCount = computed(
  () => todayEvents.value.filter((e) => e.type === 'poop' && dayjs(e.time).isSame(now.value, 'day')).length
)

// ---------- 备份提醒 ----------
const needBackupReminder = computed(() => {
  if (allEvents.value.length < 10) return false
  if (!lastBackupAt.value) return true
  return now.value.diff(dayjs(lastBackupAt.value), 'day') >= 7
})

// ---------- 记录弹层 ----------
const feedShow = ref(false)
const sleepShow = ref(false)
const poopShow = ref(false)
const extraShow = ref(false)
const extraType = ref<'temperature' | 'spitup' | 'medicine' | 'solid'>('temperature')
const growthShow = ref(false)
const milestoneShow = ref(false)
const editing = ref<BabyEvent | null>(null)

function openSheet(type: EventType, e?: BabyEvent) {
  editing.value = e ?? null
  if (type === 'feed') feedShow.value = true
  else if (type === 'sleep') sleepShow.value = true
  else if (type === 'poop') poopShow.value = true
  else if (type === 'growth') growthShow.value = true
  else if (type === 'milestone') milestoneShow.value = true
  else if (type === 'temperature' || type === 'spitup' || type === 'medicine' || type === 'solid') {
    extraType.value = type
    extraShow.value = true
  }
}

function onEdit(e: BabyEvent) {
  if (e.type === 'vaccine') {
    showToast('疫苗记录请在「计划」页管理')
    return
  }
  openSheet(e.type, e)
}
</script>

<template>
  <div class="page">
    <!-- 宝宝信息 -->
    <div class="card baby-header" v-if="profile">
      <div class="baby-name">👶 {{ profile.name }}</div>
      <div class="baby-tags">
        <span class="tag">🎂 {{ profile.birthDate }}</span>
        <span class="tag" v-if="age">📆 {{ age.text }}</span>
        <span class="tag" v-if="nextMonthCountdown">
          距{{ nextMonthCountdown.months }}月龄还有{{ nextMonthCountdown.days }}天
        </span>
        <span class="tag highlight" v-if="solidCountdown != null">⏳ 辅食倒计时 {{ solidCountdown }} 天</span>
      </div>
    </div>

    <van-notice-bar
      v-if="needBackupReminder"
      left-icon="warning-o"
      color="#ed6a0c"
      background="#fffbe8"
      text="已超过 7 天没有备份数据，建议到「我的」页导出备份"
    />

    <!-- 距上次喂奶 -->
    <div class="card feed-timer">
      <template v-if="sinceLastFeed">
        <div class="muted">距上次喂奶已过</div>
        <div class="timer-num">{{ sinceLastFeed }}</div>
      </template>
      <template v-else>
        <div class="muted">还没有喂奶记录，点下面「记录喝奶」开始吧</div>
      </template>
    </div>

    <!-- 睡眠中提示 -->
    <div class="card sleeping" v-if="openSleep">
      <div>
        <div class="sleeping-title">😴 宝宝睡眠中</div>
        <div class="muted">已睡 {{ sleepingFor }}</div>
      </div>
      <van-button type="primary" round size="small" @click="recordWake">记录醒来</van-button>
    </div>

    <!-- 快速记录 -->
    <div class="card">
      <div class="card-title">⚡ 快速记录</div>
      <div class="quick-grid">
        <button class="quick-btn feed" @click="openSheet('feed')">
          <span class="quick-icon">🍼</span>
          <span>记录喝奶</span>
          <span class="quick-sub">时间 + 奶量</span>
        </button>
        <button class="quick-btn sleep" @click="openSleep ? recordWake() : openSheet('sleep')">
          <span class="quick-icon">😴</span>
          <span>{{ openSleep ? '记录醒来' : '记录睡眠' }}</span>
          <span class="quick-sub">{{ openSleep ? '宝宝醒了点这里' : '入睡 + 醒来' }}</span>
        </button>
        <button class="quick-btn poop" @click="openSheet('poop')">
          <span class="quick-icon">💩</span>
          <span>记录排便</span>
          <span class="quick-sub">时间 + 性状</span>
        </button>
      </div>
      <div class="mini-row">
        <button class="mini-btn" @click="openSheet('temperature')">🌡️ 体温</button>
        <button class="mini-btn" @click="openSheet('spitup')">💦 吐奶</button>
        <button class="mini-btn" @click="openSheet('medicine')">💊 用药</button>
        <button class="mini-btn" @click="openSheet('solid')">🥣 辅食</button>
      </div>
    </div>

    <!-- 今日统计 -->
    <div class="card">
      <div class="card-title">📊 今日统计 — {{ now.format('YYYY-MM-DD') }}</div>
      <div class="stats-grid">
        <div class="stat">
          <div class="stat-num" style="color: var(--app-feed)">{{ totalMilk }}<small>ml</small></div>
          <div class="muted">🍼 总奶量{{ breastCount ? `（另亲喂${breastCount}次）` : '' }}</div>
        </div>
        <div class="stat">
          <div class="stat-num" style="color: var(--app-sleep)">{{ fmtMinutes(totalSleep) }}</div>
          <div class="muted">😴 总睡眠</div>
        </div>
        <div class="stat">
          <div class="stat-num" style="color: var(--app-poop)">{{ poopCount }}<small>次</small></div>
          <div class="muted">💩 排便次数</div>
        </div>
      </div>
    </div>

    <!-- 今日时间线 -->
    <div class="card">
      <div class="card-title">🕒 今日时间线 <span class="muted" style="font-weight: 400">左滑删除 · 点击编辑</span></div>
      <TimelineList :events="todayEvents" @edit="onEdit" />
    </div>

    <!-- 各类记录弹层 -->
    <FeedSheet v-model:show="feedShow" :editing="editing?.type === 'feed' ? editing : null" />
    <SleepSheet v-model:show="sleepShow" :editing="editing?.type === 'sleep' ? editing : null" />
    <PoopSheet v-model:show="poopShow" :editing="editing?.type === 'poop' ? editing : null" />
    <ExtraSheet
      v-model:show="extraShow"
      :type="extraType"
      :editing="editing && editing.type === extraType ? editing : null"
    />
    <GrowthSheet v-model:show="growthShow" :editing="editing?.type === 'growth' ? editing : null" />
    <MilestoneSheet v-model:show="milestoneShow" :editing="editing?.type === 'milestone' ? editing : null" />
  </div>
</template>

<style scoped>
.baby-header .baby-name {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}

.baby-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background: var(--app-bg);
  border-radius: 12px;
  padding: 4px 10px;
  font-size: 12px;
}

.tag.highlight {
  background: rgba(255, 183, 77, 0.18);
  color: #e65100;
}

.feed-timer {
  text-align: center;
  padding: 18px 14px;
}

.timer-num {
  font-size: 32px;
  font-weight: 700;
  color: var(--app-feed);
  margin-top: 4px;
}

.sleeping {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(149, 117, 205, 0.12);
}

.sleeping-title {
  font-weight: 600;
  margin-bottom: 2px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.quick-btn {
  border: none;
  border-radius: 14px;
  padding: 16px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
}

.quick-btn.feed {
  background: linear-gradient(135deg, #4fc3f7, #2196f3);
}

.quick-btn.sleep {
  background: linear-gradient(135deg, #b39ddb, #7e57c2);
}

.quick-btn.poop {
  background: linear-gradient(135deg, #ffcc80, #ff9800);
}

.quick-icon {
  font-size: 28px;
}

.quick-sub {
  font-size: 11px;
  font-weight: 400;
  opacity: 0.9;
}

.mini-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 10px;
}

.mini-btn {
  border: none;
  background: var(--app-bg);
  color: var(--app-text);
  border-radius: 10px;
  padding: 10px 4px;
  font-size: 13px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  text-align: center;
  gap: 8px;
}

.stat-num {
  font-size: 22px;
  font-weight: 700;
}

.stat-num small {
  font-size: 12px;
  font-weight: 400;
  margin-left: 2px;
}
</style>
