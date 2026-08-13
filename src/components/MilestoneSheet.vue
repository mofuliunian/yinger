<script setup lang="ts">
import { ref, watch } from 'vue'
import { showToast } from 'vant'
import type { BabyEvent } from '../types'
import { addEvent, updateEvent, deleteEvent, showUndo } from '../store'
import { MILESTONE_CATEGORIES } from '../data/labels'
import { nowISO } from '../utils/date'
import DateTimeField from './DateTimeField.vue'

const props = defineProps<{ show: boolean; editing?: BabyEvent | null }>()
const emit = defineEmits<{ 'update:show': [v: boolean] }>()

const time = ref(nowISO())
const category = ref('大运动')
const title = ref('')
const note = ref('')

watch(
  () => props.show,
  (v) => {
    if (!v) return
    if (props.editing) {
      const e = props.editing
      time.value = e.time
      category.value = e.data.category ?? '大运动'
      title.value = e.data.title ?? ''
      note.value = e.note ?? ''
    } else {
      time.value = nowISO()
      title.value = ''
      note.value = ''
    }
  }
)

async function save() {
  if (!title.value.trim()) {
    showToast('写一下宝宝学会了什么吧')
    return
  }
  const data = { category: category.value, title: title.value.trim() }
  if (props.editing?.id) {
    await updateEvent(props.editing.id, { time: time.value, data, note: note.value })
    showToast('已更新')
  } else {
    const id = await addEvent({ type: 'milestone', time: time.value, data, note: note.value })
    showUndo('已记录新技能', () => deleteEvent(id))
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
    <div class="sheet-title">⭐ {{ editing ? '编辑里程碑' : '记录新技能' }}</div>
    <div class="sheet-body">
      <DateTimeField v-model="time" label="日期" />

      <div class="form-label">分类</div>
      <div class="chip-row">
        <button
          v-for="c in MILESTONE_CATEGORIES"
          :key="c.value"
          class="chip"
          :class="{ active: category === c.value }"
          @click="category = c.value"
        >
          {{ c.icon }} {{ c.value }}
        </button>
      </div>

      <div class="form-label">学会了什么</div>
      <input v-model="title" class="dt-input" placeholder="如：第一次翻身" maxlength="40" />

      <div class="form-label">备注（可选）</div>
      <input v-model="note" class="dt-input" placeholder="记录当时的情景" />

      <van-button type="primary" block round style="margin-top: 20px" @click="save">保存</van-button>
    </div>
  </van-popup>
</template>
