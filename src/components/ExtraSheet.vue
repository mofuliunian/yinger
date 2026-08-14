<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { showToast } from 'vant'
import type { BabyEvent, EventType } from '../types'
import { addEvent, updateEvent, deleteEvent, showUndo } from '../store'
import { SPITUP_AMOUNTS, MEDICINE_PRESETS, EVENT_META } from '../data/labels'
import { nowISO } from '../utils/date'
import DateTimeField from './DateTimeField.vue'

const props = defineProps<{
  show: boolean
  type: Extract<EventType, 'temperature' | 'spitup' | 'medicine' | 'solid'>
  editing?: BabyEvent | null
}>()
const emit = defineEmits<{ 'update:show': [v: boolean] }>()

const time = ref(nowISO())
const temperature = ref<string>('37.0')
const spitAmount = ref('少量')
const medicineName = ref('维生素D')
const customMedicine = ref('')
const solidDesc = ref('')
const note = ref('')

const meta = computed(() => EVENT_META[props.type])

watch(
  () => props.show,
  (v) => {
    if (!v) return
    if (props.editing) {
      const e = props.editing
      time.value = e.time
      temperature.value = String(e.data.value ?? '37.0')
      spitAmount.value = e.data.amount ?? '少量'
      const med = e.data.name ?? '维生素D'
      if (MEDICINE_PRESETS.includes(med)) {
        medicineName.value = med
        customMedicine.value = ''
      } else {
        medicineName.value = '其他'
        customMedicine.value = med
      }
      solidDesc.value = e.data.desc ?? ''
      note.value = e.note ?? ''
    } else {
      time.value = nowISO()
      note.value = ''
      solidDesc.value = ''
    }
  }
)

async function save() {
  let data: Record<string, any> = {}
  if (props.type === 'temperature') {
    const t = parseFloat(temperature.value)
    if (isNaN(t) || t < 30 || t > 45) {
      showToast('请输入正确的体温')
      return
    }
    data = { value: t }
  } else if (props.type === 'spitup') {
    data = { amount: spitAmount.value }
  } else if (props.type === 'medicine') {
    const name = medicineName.value === '其他' ? customMedicine.value.trim() : medicineName.value
    if (!name) {
      showToast('请填写药品名称')
      return
    }
    data = { name }
  } else if (props.type === 'solid') {
    if (!solidDesc.value.trim()) {
      showToast('请填写吃了什么')
      return
    }
    data = { desc: solidDesc.value.trim() }
  }

  if (props.editing?.id) {
    await updateEvent(props.editing.id, { time: time.value, data, note: note.value })
    showToast('已更新')
  } else {
    const id = await addEvent({ type: props.type, time: time.value, data, note: note.value })
    showUndo(`已记录${meta.value.label}`, () => deleteEvent(id))
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
    <div class="sheet-title">{{ meta.icon }} {{ editing ? `编辑${meta.label}记录` : `记录${meta.label}` }}</div>
    <div class="sheet-body">
      <DateTimeField v-model="time" label="时间" />

      <template v-if="type === 'temperature'">
        <div class="form-label">体温（°C）</div>
        <input v-model="temperature" class="dt-input" type="number" step="0.1" inputmode="decimal" />
      </template>

      <template v-else-if="type === 'spitup'">
        <div class="form-label">吐奶量</div>
        <div class="chip-row">
          <button
            v-for="a in SPITUP_AMOUNTS"
            :key="a"
            class="chip"
            :class="{ active: spitAmount === a }"
            @click="spitAmount = a"
          >
            {{ a }}
          </button>
        </div>
      </template>

      <template v-else-if="type === 'medicine'">
        <div class="form-label">药品/补充剂</div>
        <div class="chip-row">
          <button
            v-for="m in MEDICINE_PRESETS"
            :key="m"
            class="chip"
            :class="{ active: medicineName === m }"
            @click="medicineName = m"
          >
            {{ m }}
          </button>
        </div>
        <template v-if="medicineName === '其他'">
          <div class="form-label">名称</div>
          <input v-model="customMedicine" class="dt-input" placeholder="填写药品名称" />
        </template>
      </template>

      <template v-else-if="type === 'solid'">
        <div class="form-label">吃了什么</div>
        <input v-model="solidDesc" class="dt-input" placeholder="如：高铁米粉 3 勺、蛋黄 1/4" />
      </template>

      <div class="form-label">备注（可选）</div>
      <input v-model="note" class="dt-input" placeholder="补充说明" />

      <van-button type="primary" block round style="margin-top: 20px" @click="save">保存</van-button>
    </div>
  </van-popup>
</template>
