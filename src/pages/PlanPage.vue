<script setup lang="ts">
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import { showConfirmDialog, showToast } from 'vant'
import { db } from '../db'
import { profile, useQuery, addEvent, deleteEvent, getSetting, putSetting } from '../store'
import type { BabyEvent } from '../types'
import { VACCINE_SCHEDULE, type VaccineDose } from '../data/vaccines'
import { FEEDING_TIPS, PLAY_PLANS, findPlayPlanIndex, SOLID_FOOD_START_MONTH } from '../data/monthly'
import { ageInfo, fmtDate } from '../utils/date'

const tab = ref(0)

const age = computed(() => (profile.value ? ageInfo(profile.value.birthDate) : null))

// ---------- 疫苗 ----------
const vaccineFilter = ref<'all' | 'free' | 'paid'>('all')

const vaccineEvents = useQuery(
  () => db.events.where('type').equals('vaccine').toArray(),
  [] as BabyEvent[]
)

const doneMap = computed(() => {
  const map = new Map<string, BabyEvent>()
  for (const e of vaccineEvents.value) map.set(e.data.key, e)
  return map
})

interface VaccineRow extends VaccineDose {
  planDate: string
  done?: BabyEvent
  overdue: boolean
}

const vaccineRows = computed<VaccineRow[]>(() => {
  if (!profile.value) return []
  const birth = dayjs(profile.value.birthDate)
  return VACCINE_SCHEDULE.filter((v) => {
    if (vaccineFilter.value === 'free') return !v.selfPaid
    if (vaccineFilter.value === 'paid') return !!v.selfPaid
    return true
  })
    .map((v) => {
      const planDate = birth.add(v.month, 'month').format('YYYY-MM-DD')
      const done = doneMap.value.get(v.key)
      return {
        ...v,
        planDate,
        done,
        overdue: !done && dayjs(planDate).isBefore(dayjs(), 'day'),
      }
    })
    .sort((a, b) => a.month - b.month)
})

const checkinTarget = ref<VaccineRow | null>(null)
const checkinDate = ref(dayjs().format('YYYY-MM-DD'))
const checkinShow = ref(false)

function openCheckin(row: VaccineRow) {
  checkinTarget.value = row
  checkinDate.value = dayjs().format('YYYY-MM-DD')
  checkinShow.value = true
}

async function confirmCheckin() {
  const row = checkinTarget.value
  if (!row) return
  await addEvent({
    type: 'vaccine',
    time: dayjs(checkinDate.value).format(),
    data: { key: row.key, name: `${row.vaccine} ${row.doseLabel}` },
  })
  checkinShow.value = false
  showToast('已完成打卡')
}

async function undoCheckin(row: VaccineRow) {
  if (!row.done?.id) return
  await showConfirmDialog({ title: '撤销打卡', message: `撤销「${row.vaccine} ${row.doseLabel}」的完成记录？` })
  await deleteEvent(row.done.id)
}

// ---------- 辅食 ----------
const solidCountdown = computed(() => {
  if (!profile.value || !age.value) return null
  if (age.value.monthAge >= SOLID_FOOD_START_MONTH) return null
  const target = dayjs(profile.value.birthDate).add(SOLID_FOOD_START_MONTH, 'month')
  return { days: target.diff(dayjs().startOf('day'), 'day'), date: target.format('YYYY-MM-DD') }
})

const currentTipIndex = computed(() => {
  if (!age.value) return 0
  const idx = FEEDING_TIPS.findIndex(
    (t) => age.value!.monthAge >= t.range.from && age.value!.monthAge < t.range.to
  )
  return idx === -1 ? FEEDING_TIPS.length - 1 : idx
})

const openedTips = ref<number[]>([])

// ---------- 早教 ----------
const planIndex = ref(-1) // -1 = 跟随当前月龄
const effectivePlanIndex = computed(() =>
  planIndex.value >= 0 ? planIndex.value : age.value ? findPlayPlanIndex(age.value.monthAge) : 0
)
const currentPlan = computed(() => PLAY_PLANS[effectivePlanIndex.value])

const playChecked = useQuery(
  () => getSetting<string[]>('playChecked').then((v) => v ?? []),
  [] as string[]
)

function activityKey(catIdx: number, actIdx: number) {
  return `${effectivePlanIndex.value}:${catIdx}:${actIdx}`
}

async function toggleActivity(catIdx: number, actIdx: number) {
  const key = activityKey(catIdx, actIdx)
  const list = new Set(playChecked.value)
  if (list.has(key)) list.delete(key)
  else list.add(key)
  await putSetting('playChecked', [...list])
}
</script>

<template>
  <div class="page">
    <van-tabs v-model:active="tab" sticky animated>
      <!-- 疫苗 -->
      <van-tab title="💉 疫苗接种">
        <div class="card" style="margin-top: 12px">
          <div class="chip-row" style="margin-bottom: 12px">
            <button class="chip" :class="{ active: vaccineFilter === 'all' }" @click="vaccineFilter = 'all'">全部</button>
            <button class="chip" :class="{ active: vaccineFilter === 'free' }" @click="vaccineFilter = 'free'">免费</button>
            <button class="chip" :class="{ active: vaccineFilter === 'paid' }" @click="vaccineFilter = 'paid'">自费</button>
          </div>

          <div v-for="row in vaccineRows" :key="row.key" class="vac-item" :class="{ done: row.done }">
            <div class="vac-main">
              <div class="vac-name">
                {{ row.vaccine }} <b>{{ row.doseLabel }}</b>
                <span v-if="row.selfPaid" class="vac-badge paid">自费</span>
                <span v-if="row.overdue" class="vac-badge overdue">已过计划日期</span>
              </div>
              <div class="muted">
                📅 计划：{{ row.planDate }}<template v-if="row.note">｜{{ row.note }}</template>
              </div>
              <div v-if="row.done" class="vac-done-date">✅ 实际：{{ fmtDate(row.done.time) }}</div>
            </div>
            <van-button
              v-if="!row.done"
              size="small"
              round
              type="primary"
              plain
              @click="openCheckin(row)"
            >
              打卡
            </van-button>
            <van-button v-else size="small" round plain @click="undoCheckin(row)">撤销</van-button>
          </div>

          <p class="muted" style="margin: 10px 0 0">
            接种程序基于国家免疫规划（含常见自费疫苗），实际安排以社区接种门诊为准
          </p>
        </div>
      </van-tab>

      <!-- 辅食 -->
      <van-tab title="🥣 辅食计划">
        <div class="card countdown-card" v-if="solidCountdown" style="margin-top: 12px">
          <div class="countdown-num">⏳ 辅食倒计时 {{ solidCountdown.days }} 天</div>
          <div class="muted">预计 {{ solidCountdown.date }}（满 6 月龄）开始添加辅食</div>
        </div>

        <div class="card" style="margin-top: 12px">
          <div class="card-title">📖 分阶段喂养/辅食指引</div>
          <van-collapse v-model="openedTips">
            <van-collapse-item
              v-for="(t, i) in FEEDING_TIPS"
              :key="i"
              :name="i"
              :title="(i === currentTipIndex ? '📍 ' : '') + t.range.label + (i === currentTipIndex ? '（当前阶段）' : '')"
            >
              <ul class="tips">
                <li v-for="(p, j) in t.points" :key="j">{{ p }}</li>
              </ul>
            </van-collapse-item>
          </van-collapse>
        </div>
      </van-tab>

      <!-- 早教 -->
      <van-tab title="🎨 早教陪玩">
        <div class="card" style="margin-top: 12px">
          <div class="card-title">按月龄早教陪玩计划</div>
          <div class="chip-row" style="margin-bottom: 12px">
            <button
              v-for="(p, i) in PLAY_PLANS"
              :key="i"
              class="chip"
              :class="{ active: effectivePlanIndex === i }"
              @click="planIndex = i"
            >
              {{ p.range.label }}
            </button>
          </div>

          <div class="plan-current muted" v-if="age && findPlayPlanIndex(age.monthAge) === effectivePlanIndex">
            ✨ {{ currentPlan.range.label }} · 当前月龄
          </div>

          <div v-for="(item, ci) in currentPlan.items" :key="item.category" class="play-cat">
            <div class="play-cat-title">{{ item.icon }} {{ item.category }}</div>
            <div
              v-for="(act, ai) in item.activities"
              :key="ai"
              class="play-item"
              @click="toggleActivity(ci, ai)"
            >
              <van-icon
                :name="playChecked.includes(activityKey(ci, ai)) ? 'checked' : 'circle'"
                :color="playChecked.includes(activityKey(ci, ai)) ? '#4fc3f7' : '#c8c9cc'"
                size="18"
              />
              <span :class="{ done: playChecked.includes(activityKey(ci, ai)) }">{{ act }}</span>
            </div>
          </div>
        </div>
      </van-tab>
    </van-tabs>

    <!-- 疫苗打卡弹窗 -->
    <van-popup v-model:show="checkinShow" position="bottom" round closeable>
      <div class="sheet-title">💉 疫苗打卡</div>
      <div class="sheet-body" v-if="checkinTarget">
        <p style="margin: 0 0 4px">{{ checkinTarget.vaccine }} {{ checkinTarget.doseLabel }}</p>
        <div class="form-label">实际接种日期</div>
        <input v-model="checkinDate" class="dt-input" type="date" :max="dayjs().format('YYYY-MM-DD')" />
        <van-button type="primary" block round style="margin-top: 20px" @click="confirmCheckin">
          确认完成
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.vac-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(128, 128, 128, 0.1);
}

.vac-item.done {
  opacity: 0.75;
}

.vac-main {
  flex: 1;
  min-width: 0;
}

.vac-name {
  font-size: 14px;
  margin-bottom: 2px;
}

.vac-badge {
  font-size: 10px;
  border-radius: 8px;
  padding: 1px 6px;
  margin-left: 4px;
  vertical-align: middle;
}

.vac-badge.paid {
  background: rgba(255, 183, 77, 0.2);
  color: #e65100;
}

.vac-badge.overdue {
  background: rgba(239, 83, 80, 0.15);
  color: #d32f2f;
}

.vac-done-date {
  font-size: 12px;
  color: #43a047;
  margin-top: 2px;
}

.countdown-card {
  text-align: center;
  background: linear-gradient(135deg, rgba(255, 204, 128, 0.25), rgba(255, 183, 77, 0.15));
}

.countdown-num {
  font-size: 20px;
  font-weight: 700;
  color: #e65100;
  margin-bottom: 4px;
}

.tips {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 1.9;
}

.plan-current {
  margin-bottom: 8px;
}

.play-cat {
  margin-bottom: 12px;
}

.play-cat-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 6px;
}

.play-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 0 7px 6px;
  font-size: 14px;
}

.play-item .done {
  text-decoration: line-through;
  color: var(--app-text-2);
}
</style>
