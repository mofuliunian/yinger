<script setup lang="ts">
import { showConfirmDialog } from 'vant'
import dayjs from 'dayjs'
import type { BabyEvent } from '../types'
import { deleteEvent } from '../store'
import { EVENT_META, FEED_METHOD_LABEL, BREAST_SIDE_LABEL } from '../data/labels'
import { fmtTime, fmtMinutes } from '../utils/date'

defineProps<{ events: BabyEvent[]; showDate?: boolean }>()

const emit = defineEmits<{ edit: [e: BabyEvent] }>()

function describe(e: BabyEvent): string {
  switch (e.type) {
    case 'feed': {
      const m = FEED_METHOD_LABEL[e.data.method] ?? ''
      if (e.data.method === 'breast') {
        return `${m} · ${BREAST_SIDE_LABEL[e.data.side] ?? ''} ${e.data.duration ?? '?'}分钟`
      }
      return `${m} ${e.data.amount ?? '?'}ml`
    }
    case 'sleep': {
      if (!e.endTime) return '睡眠中...'
      const mins = dayjs(e.endTime).diff(dayjs(e.time), 'minute')
      return `${fmtTime(e.time)} - ${fmtTime(e.endTime)}（${fmtMinutes(mins)}）`
    }
    case 'poop':
      return [e.data.texture, e.data.color].filter(Boolean).join(' · ') || '排便一次'
    case 'temperature':
      return `${e.data.value}°C`
    case 'spitup':
      return e.data.amount ?? '吐奶'
    case 'medicine':
      return e.data.name ?? ''
    case 'solid':
      return e.data.desc ?? ''
    case 'growth':
      return [
        e.data.height != null ? `身高 ${e.data.height}cm` : '',
        e.data.weight != null ? `体重 ${e.data.weight}kg` : '',
      ]
        .filter(Boolean)
        .join(' · ')
    case 'milestone':
      return `${e.data.category}：${e.data.title}`
    case 'vaccine':
      return e.data.name ?? '疫苗接种'
    default:
      return ''
  }
}

async function remove(e: BabyEvent) {
  await showConfirmDialog({ title: '删除记录', message: '确定删除这条记录吗？' })
  if (e.id != null) await deleteEvent(e.id)
}
</script>

<template>
  <div>
    <van-empty v-if="events.length === 0" description="还没有记录" image-size="80" />
    <van-swipe-cell v-for="e in events" :key="e.id">
      <div class="tl-item" @click="emit('edit', e)">
        <div class="tl-icon" :style="{ background: EVENT_META[e.type].color + '22' }">
          {{ EVENT_META[e.type].icon }}
        </div>
        <div class="tl-main">
          <div class="tl-title">
            {{ EVENT_META[e.type].label }}
            <span class="tl-desc">{{ describe(e) }}</span>
          </div>
          <div v-if="e.note" class="muted">{{ e.note }}</div>
        </div>
        <div class="tl-time">
          <template v-if="showDate">{{ dayjs(e.time).format('M/D') }}<br /></template>
          {{ fmtTime(e.time) }}
        </div>
      </div>
      <template #right>
        <van-button square type="danger" text="删除" style="height: 100%" @click="remove(e)" />
      </template>
    </van-swipe-cell>
  </div>
</template>

<style scoped>
.tl-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 4px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.1);
  background: var(--app-card-bg);
}

.tl-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.tl-main {
  flex: 1;
  min-width: 0;
}

.tl-title {
  font-size: 14px;
  font-weight: 600;
}

.tl-desc {
  font-weight: 400;
  color: var(--app-text-2);
  margin-left: 6px;
  font-size: 13px;
}

.tl-time {
  font-size: 12px;
  color: var(--app-text-2);
  text-align: right;
  flex-shrink: 0;
}
</style>
