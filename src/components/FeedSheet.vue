<script setup lang="ts">
import { ref, watch } from 'vue'
import { showToast } from 'vant'
import type { BabyEvent } from '../types'
import { addEvent, updateEvent, deleteEvent, showUndo } from '../store'
import { FEED_METHODS, BREAST_SIDES, QUICK_AMOUNTS } from '../data/labels'
import { nowISO } from '../utils/date'
import DateTimeField from './DateTimeField.vue'

const props = defineProps<{ show: boolean; editing?: BabyEvent | null }>()
const emit = defineEmits<{ 'update:show': [v: boolean] }>()

const time = ref(nowISO())
const method = ref<'formula' | 'bottle' | 'breast'>('formula')
const amount = ref<number>(120)
const side = ref<'left' | 'right' | 'both'>('both')
const duration = ref<number>(15)
const note = ref('')

watch(
  () => props.show,
  (v) => {
    if (!v) return
    if (props.editing) {
      const e = props.editing
      time.value = e.time
      method.value = e.data.method ?? 'formula'
      amount.value = e.data.amount ?? 120
      side.value = e.data.side ?? 'both'
      duration.value = e.data.duration ?? 15
      note.value = e.note ?? ''
    } else {
      time.value = nowISO()
      note.value = ''
    }
  }
)

async function save() {
  const data: BabyEvent['data'] = { method: method.value }
  if (method.value === 'breast') {
    data.side = side.value
    data.duration = duration.value
  } else {
    if (!amount.value || amount.value <= 0) {
      showToast('请填写奶量')
      return
    }
    data.amount = amount.value
  }
  if (props.editing?.id) {
    await updateEvent(props.editing.id, { time: time.value, data, note: note.value })
    showToast('已更新')
  } else {
    const id = await addEvent({ type: 'feed', time: time.value, data, note: note.value })
    showUndo('已记录喝奶', () => deleteEvent(id))
  }
  emit('update:show', false)
}
</script>

<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    closeable
    @update:show="emit('update:show', $event)"
  >
    <div class="sheet-title">🍼 {{ editing ? '编辑喝奶记录' : '记录喝奶' }}</div>
    <div class="sheet-body">
      <DateTimeField v-model="time" label="时间" />

      <div class="form-label">方式</div>
      <div class="chip-row">
        <button
          v-for="m in FEED_METHODS"
          :key="m.value"
          class="chip"
          :class="{ active: method === m.value }"
          @click="method = m.value"
        >
          {{ m.label }}
        </button>
      </div>

      <template v-if="method !== 'breast'">
        <div class="form-label">奶量（ml）</div>
        <div class="chip-row" style="margin-bottom: 10px">
          <button
            v-for="a in QUICK_AMOUNTS"
            :key="a"
            class="chip"
            :class="{ active: amount === a }"
            @click="amount = a"
          >
            {{ a }}
          </button>
        </div>
        <van-stepper v-model="amount" :min="10" :max="500" :step="10" input-width="56px" button-size="28px" />
      </template>

      <template v-else>
        <div class="form-label">侧别</div>
        <div class="chip-row">
          <button
            v-for="s in BREAST_SIDES"
            :key="s.value"
            class="chip"
            :class="{ active: side === s.value }"
            @click="side = s.value"
          >
            {{ s.label }}
          </button>
        </div>
        <div class="form-label">时长（分钟）</div>
        <van-stepper v-model="duration" :min="1" :max="120" input-width="56px" button-size="28px" />
      </template>

      <div class="form-label">备注（可选）</div>
      <input v-model="note" class="dt-input" placeholder="如：喝得很急" />

      <van-button type="primary" block round style="margin-top: 20px" @click="save">保存</van-button>
    </div>
  </van-popup>
</template>
