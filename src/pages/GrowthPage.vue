<script setup lang="ts">
import { computed, ref } from 'vue'
import { db } from '../db'
import { profile, useQuery } from '../store'
import type { BabyEvent } from '../types'
import { ageInfo } from '../utils/date'
import { MILESTONE_CATEGORIES } from '../data/labels'
import GrowthChart from '../components/GrowthChart.vue'
import GrowthSheet from '../components/GrowthSheet.vue'
import MilestoneSheet from '../components/MilestoneSheet.vue'
import TimelineList from '../components/TimelineList.vue'
import EventEditor from '../components/EventEditor.vue'

const metric = ref<'height' | 'weight'>('weight')
const growthShow = ref(false)
const milestoneShow = ref(false)
const editor = ref<InstanceType<typeof EventEditor>>()

const growthEvents = useQuery(
  () => db.events.where('type').equals('growth').reverse().sortBy('time').then((a) => a.reverse()),
  [] as BabyEvent[]
)

const milestoneEvents = useQuery(
  () => db.events.where('type').equals('milestone').sortBy('time').then((a) => a.reverse()),
  [] as BabyEvent[]
)

const chartPoints = computed(() => {
  if (!profile.value) return []
  const birth = profile.value.birthDate
  return growthEvents.value
    .filter((e) => e.data[metric.value] != null)
    .map((e) => ({
      x: +ageInfo(birth, e.time).monthAge.toFixed(2),
      y: e.data[metric.value] as number,
    }))
})

const sortedGrowthDesc = computed(() => [...growthEvents.value].reverse())

const milestoneFilter = ref('全部')
const filteredMilestones = computed(() =>
  milestoneFilter.value === '全部'
    ? milestoneEvents.value
    : milestoneEvents.value.filter((e) => e.data.category === milestoneFilter.value)
)
</script>

<template>
  <div class="page">
    <!-- 生长曲线 -->
    <div class="card" v-if="profile">
      <div class="card-title" style="justify-content: space-between">
        <span>📈 生长曲线（WHO 标准对照）</span>
      </div>
      <div class="chip-row" style="margin-bottom: 12px">
        <button class="chip" :class="{ active: metric === 'weight' }" @click="metric = 'weight'">体重</button>
        <button class="chip" :class="{ active: metric === 'height' }" @click="metric = 'height'">身高</button>
      </div>
      <GrowthChart :metric="metric" :gender="profile.gender" :points="chartPoints" :baby-name="profile.name" />
      <p class="muted" style="margin: 8px 0 0">
        P50 为中位数，P3-P97 之间都属正常范围；数据为 WHO 标准近似值，仅供参考
      </p>
    </div>

    <!-- 身高体重记录 -->
    <div class="card">
      <div class="card-title" style="justify-content: space-between">
        <span>📏 身高体重记录</span>
        <van-button size="small" type="primary" round @click="growthShow = true">+ 记录</van-button>
      </div>
      <TimelineList :events="sortedGrowthDesc" show-date @edit="editor?.open($event)" />
    </div>

    <!-- 里程碑 -->
    <div class="card">
      <div class="card-title" style="justify-content: space-between">
        <span>⭐ 成长里程碑</span>
        <van-button size="small" type="primary" round @click="milestoneShow = true">+ 记录新技能</van-button>
      </div>
      <div class="chip-row" style="margin-bottom: 10px">
        <button
          class="chip"
          :class="{ active: milestoneFilter === '全部' }"
          @click="milestoneFilter = '全部'"
        >
          全部
        </button>
        <button
          v-for="c in MILESTONE_CATEGORIES"
          :key="c.value"
          class="chip"
          :class="{ active: milestoneFilter === c.value }"
          @click="milestoneFilter = c.value"
        >
          {{ c.icon }} {{ c.value }}
        </button>
      </div>
      <TimelineList :events="filteredMilestones" show-date @edit="editor?.open($event)" />
    </div>

    <GrowthSheet v-model:show="growthShow" :editing="null" />
    <MilestoneSheet v-model:show="milestoneShow" :editing="null" />
    <EventEditor ref="editor" />
  </div>
</template>
