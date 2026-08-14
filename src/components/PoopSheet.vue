<script setup lang="ts">
import { ref, watch } from 'vue'
import { showToast } from 'vant'
import type { BabyEvent } from '../types'
import { addEvent, updateEvent, deleteEvent, showUndo } from '../store'
import { POOP_TEXTURES, POOP_COLORS } from '../data/labels'
import { nowISO } from '../utils/date'
import DateTimeField from './DateTimeField.vue'

const props = defineProps<{ show: boolean; editing?: BabyEvent | null }>()
const emit = defineEmits<{ 'update:show': [v: boolean] }>()

const time = ref(nowISO())
const texture = ref('')
const color = ref('')
const note = ref('')

watch(
  () => props.show,
  (v) => {
    if (!v) return
    if (props.editing) {
      const e = props.editing
      time.value = e.time
      texture.value = e.data.texture ?? ''
      color.value = e.data.color ?? ''
      note.value = e.note ?? ''
    } else {
      time.value = nowISO()
      texture.value = ''
      color.value = ''
      note.value = ''
    }
  }
)

async function save() {
  const data = { texture: texture.value, color: color.value }
  if (props.editing?.id) {
    await updateEvent(props.editing.id, { time: time.value, data, note: note.value })
    showToast('已更新')
  } else {
    const id = await addEvent({ type: 'poop', time: time.value, data, note: note.value })
    showUndo('已记录排便', () => deleteEvent(id))
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
    <div class="sheet-title">💩 {{ editing ? '编辑排便记录' : '记录排便' }}</div>
    <div class="sheet-body">
      <DateTimeField v-model="time" label="时间" />

      <div class="form-label">性状</div>
      <div class="chip-row">
        <button
          v-for="t in POOP_TEXTURES"
          :key="t"
          class="chip"
          :class="{ active: texture === t }"
          @click="texture = texture === t ? '' : t"
        >
          {{ t }}
        </button>
      </div>

      <div class="form-label">颜色</div>
      <div class="chip-row">
        <button
          v-for="c in POOP_COLORS"
          :key="c"
          class="chip"
          :class="{ active: color === c }"
          @click="color = color === c ? '' : c"
        >
          {{ c }}
        </button>
      </div>

      <div class="form-label">备注（可选）</div>
      <input v-model="note" class="dt-input" placeholder="如：量多" />

      <van-button type="primary" block round style="margin-top: 20px" @click="save">保存</van-button>
    </div>
  </van-popup>
</template>
