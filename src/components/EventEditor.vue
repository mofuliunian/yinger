<script setup lang="ts">
import { ref } from 'vue'
import { showToast } from 'vant'
import type { BabyEvent } from '../types'
import FeedSheet from './FeedSheet.vue'
import SleepSheet from './SleepSheet.vue'
import PoopSheet from './PoopSheet.vue'
import ExtraSheet from './ExtraSheet.vue'
import GrowthSheet from './GrowthSheet.vue'
import MilestoneSheet from './MilestoneSheet.vue'

const feedShow = ref(false)
const sleepShow = ref(false)
const poopShow = ref(false)
const extraShow = ref(false)
const extraType = ref<'temperature' | 'spitup' | 'medicine' | 'solid'>('temperature')
const growthShow = ref(false)
const milestoneShow = ref(false)
const editing = ref<BabyEvent | null>(null)

function open(e: BabyEvent) {
  editing.value = e
  switch (e.type) {
    case 'feed':
      feedShow.value = true
      break
    case 'sleep':
      sleepShow.value = true
      break
    case 'poop':
      poopShow.value = true
      break
    case 'growth':
      growthShow.value = true
      break
    case 'milestone':
      milestoneShow.value = true
      break
    case 'temperature':
    case 'spitup':
    case 'medicine':
    case 'solid':
      extraType.value = e.type
      extraShow.value = true
      break
    default:
      showToast('该类型记录请在对应页面管理')
  }
}

defineExpose({ open })
</script>

<template>
  <div>
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
