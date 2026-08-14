<script setup lang="ts">
import { ref, watch } from 'vue'
import dayjs from 'dayjs'
import { showToast } from 'vant'
import type { BabyEvent } from '../types'
import { addEvent, updateEvent, deleteEvent, showUndo } from '../store'
import { nowISO } from '../utils/date'
import DateTimeField from './DateTimeField.vue'

const props = defineProps<{ show: boolean; editing?: BabyEvent | null }>()
const emit = defineEmits<{ 'update:show': [v: boolean] }>()

const time = ref(nowISO())
const hasEnd = ref(false)
const endTime = ref(nowISO())
const note = ref('')

watch(
  () => props.show,
  (v) => {
    if (!v) return
    if (props.editing) {
      const e = props.editing
      time.value = e.time
      hasEnd.value = !!e.endTime
      endTime.value = e.endTime ?? nowISO()
      note.value = e.note ?? ''
    } else {
      time.value = nowISO()
      hasEnd.value = false
      endTime.value = nowISO()
      note.value = ''
    }
  }
)

async function save() {
  if (hasEnd.value && dayjs(endTime.value).isBefore(dayjs(time.value))) {
    showToast('醒来时间不能早于入睡时间')
    return
  }
  const payload = {
    time: time.value,
    endTime: hasEnd.value ? endTime.value : null,
    note: note.value,
  }
  if (props.editing?.id) {
    await updateEvent(props.editing.id, payload)
    showToast('已更新')
  } else {
    const id = await addEvent({ type: 'sleep', data: {}, ...payload })
    showUndo('已记录入睡', () => deleteEvent(id))
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
    <div class="sheet-title">😴 {{ editing ? '编辑睡眠记录' : '记录睡眠' }}</div>
    <div class="sheet-body">
      <DateTimeField v-model="time" label="入睡时间" />

      <div class="form-label" style="display: flex; justify-content: space-between; align-items: center">
        <span>已经醒来</span>
        <van-switch v-model="hasEnd" size="20" />
      </div>
      <DateTimeField v-if="hasEnd" v-model="endTime" label="醒来时间" />
      <p v-else class="muted" style="margin: 4px 0 0">不填醒来时间 = 宝宝还在睡，醒来后在首页点「记录醒来」即可</p>

      <div class="form-label">备注（可选）</div>
      <input v-model="note" class="dt-input" placeholder="如：抱睡、落地醒" />

      <van-button type="primary" block round style="margin-top: 20px" @click="save">保存</van-button>
    </div>
  </van-popup>
</template>
