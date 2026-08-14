<script setup lang="ts">
import { ref, watch } from 'vue'
import { showToast } from 'vant'
import type { BabyEvent } from '../types'
import { addEvent, updateEvent, deleteEvent, showUndo } from '../store'
import { nowISO } from '../utils/date'
import DateTimeField from './DateTimeField.vue'

const props = defineProps<{ show: boolean; editing?: BabyEvent | null }>()
const emit = defineEmits<{ 'update:show': [v: boolean] }>()

const time = ref(nowISO())
const height = ref('')
const weight = ref('')
const note = ref('')

watch(
  () => props.show,
  (v) => {
    if (!v) return
    if (props.editing) {
      const e = props.editing
      time.value = e.time
      height.value = e.data.height != null ? String(e.data.height) : ''
      weight.value = e.data.weight != null ? String(e.data.weight) : ''
      note.value = e.note ?? ''
    } else {
      time.value = nowISO()
      height.value = ''
      weight.value = ''
      note.value = ''
    }
  }
)

async function save() {
  const h = height.value ? parseFloat(height.value) : undefined
  const w = weight.value ? parseFloat(weight.value) : undefined
  if (h == null && w == null) {
    showToast('身高体重至少填一项')
    return
  }
  if ((h != null && (isNaN(h) || h < 30 || h > 150)) || (w != null && (isNaN(w) || w < 1 || w > 40))) {
    showToast('请检查数值是否正确')
    return
  }
  const data = { height: h, weight: w }
  if (props.editing?.id) {
    await updateEvent(props.editing.id, { time: time.value, data, note: note.value })
    showToast('已更新')
  } else {
    const id = await addEvent({ type: 'growth', time: time.value, data, note: note.value })
    showUndo('已记录身高体重', () => deleteEvent(id))
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
    <div class="sheet-title">📏 {{ editing ? '编辑身高体重' : '记录身高体重' }}</div>
    <div class="sheet-body">
      <DateTimeField v-model="time" label="日期" />

      <div class="form-label">身高（cm）</div>
      <input v-model="height" class="dt-input" type="number" step="0.1" inputmode="decimal" placeholder="如 65.5" />

      <div class="form-label">体重（kg）</div>
      <input v-model="weight" class="dt-input" type="number" step="0.01" inputmode="decimal" placeholder="如 7.20" />

      <div class="form-label">备注（可选）</div>
      <input v-model="note" class="dt-input" placeholder="如：社区体检" />

      <van-button type="primary" block round style="margin-top: 20px" @click="save">保存记录</van-button>
    </div>
  </van-popup>
</template>
