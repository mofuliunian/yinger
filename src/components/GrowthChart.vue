<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Legend,
  Tooltip,
  type ChartDataset,
} from 'chart.js'
import { WHO_STANDARDS } from '../data/who'

Chart.register(LineController, LineElement, PointElement, LinearScale, Legend, Tooltip)

const props = defineProps<{
  metric: 'height' | 'weight'
  gender: 'boy' | 'girl'
  points: { x: number; y: number }[] // x = 月龄
  babyName: string
}>()

const canvas = ref<HTMLCanvasElement>()
let chart: Chart | undefined

const PERCENTILE_STYLE: { key: 'p3' | 'p15' | 'p50' | 'p85' | 'p97'; label: string; color: string; dash?: number[] }[] = [
  { key: 'p97', label: 'P97', color: '#ef9a9a', dash: [4, 4] },
  { key: 'p85', label: 'P85', color: '#ffcc80', dash: [4, 4] },
  { key: 'p50', label: 'P50', color: '#a5d6a7' },
  { key: 'p15', label: 'P15', color: '#ffcc80', dash: [4, 4] },
  { key: 'p3', label: 'P3', color: '#ef9a9a', dash: [4, 4] },
]

function buildDatasets(): ChartDataset<'line'>[] {
  const std = WHO_STANDARDS[props.metric][props.gender]
  const curves: ChartDataset<'line'>[] = PERCENTILE_STYLE.map((p) => ({
    label: p.label,
    data: std[p.key].map((y, m) => ({ x: m, y })),
    borderColor: p.color,
    borderWidth: 1.5,
    borderDash: p.dash,
    pointRadius: 0,
    fill: false,
    tension: 0.3,
  }))
  curves.push({
    label: props.babyName,
    data: [...props.points].sort((a, b) => a.x - b.x),
    borderColor: '#2196f3',
    backgroundColor: '#2196f3',
    borderWidth: 2.5,
    pointRadius: 4,
    fill: false,
    tension: 0.2,
  })
  return curves
}

function render() {
  if (!canvas.value) return
  chart?.destroy()
  chart = new Chart(canvas.value, {
    type: 'line',
    data: { datasets: buildDatasets() },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        x: {
          type: 'linear',
          min: 0,
          max: 24,
          title: { display: true, text: '月龄' },
          ticks: { stepSize: 2 },
        },
        y: {
          title: { display: true, text: props.metric === 'weight' ? '体重 (kg)' : '身高 (cm)' },
        },
      },
      plugins: {
        legend: { labels: { boxWidth: 16, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${ctx.dataset.label}: ${ctx.parsed.y}${props.metric === 'weight' ? 'kg' : 'cm'}（${(ctx.parsed.x ?? 0).toFixed(1)}月龄）`,
          },
        },
      },
    },
  })
}

onMounted(render)
watch(() => [props.metric, props.gender, props.points], render, { deep: true })
onUnmounted(() => chart?.destroy())
</script>

<template>
  <div style="height: 300px; position: relative">
    <canvas ref="canvas"></canvas>
  </div>
</template>
