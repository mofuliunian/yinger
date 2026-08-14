<script setup lang="ts">
import { computed } from 'vue'
import { fromLocalInput, toLocalInput } from '../utils/date'

const props = defineProps<{
  modelValue: string // ISO
  label?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const local = computed({
  get: () => (props.modelValue ? toLocalInput(props.modelValue) : ''),
  set: (v: string) => {
    if (v) emit('update:modelValue', fromLocalInput(v))
  },
})
</script>

<template>
  <div>
    <div v-if="label" class="form-label">{{ label }}</div>
    <input v-model="local" class="dt-input" type="datetime-local" />
  </div>
</template>
