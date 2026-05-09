<script setup lang="ts">
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

export interface PortraitAxis {
  label: string
  value: number
}

const props = withDefaults(
  defineProps<{
    visible?: boolean
    axes?: PortraitAxis[]
    /** 系列名称（tooltip 标题） */
    seriesName?: string
  }>(),
  {
    visible: true,
    axes: () => [
      { label: '产业规模', value: 80 },
      { label: '人才浓度', value: 80 },
      { label: '政策支持', value: 80 },
      { label: '资本热度', value: 60 },
      { label: '创新活力', value: 80 },
    ],
    seriesName: '综合竞争力',
  }
)

const chartRef = ref<HTMLDivElement | null>(null)
let chart: ECharts | null = null
let resizeObs: ResizeObserver | null = null

const chartOption = computed((): EChartsOption => {
  const axes = props.axes
  const indicators = axes.map((a) => ({
    name: a.label,
    max: 100,
  }))

  return {
    animation: true,
    animationDuration: 800,
    animationEasing: 'cubicOut',
    tooltip: {
      trigger: 'item',
      confine: true,
      backgroundColor: 'rgba(255, 255, 255, 0.97)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: [10, 14],
      textStyle: { color: '#0f172a', fontSize: 13 },
      formatter: (p: unknown) => {
        const x = p as { name?: string; value: number | number[]; dataIndex?: number }
        const vals = Array.isArray(x.value) ? x.value : [x.value]
        const name = x.name ?? props.seriesName
        const lines = axes.map((a, i) => {
          const v = vals[i] ?? '—'
          return `<div style="display:flex;justify-content:space-between;gap:20px;min-width:200px"><span style="color:#64748b">${a.label}</span><span style="font-weight:600;color:#006c4d">${v}</span></div>`
        })
        return `<div style="font-weight:600;margin-bottom:8px;border-bottom:1px solid #f1f5f9;padding-bottom:6px">${name}</div>${lines.join('')}`
      },
    },
    radar: {
      indicator: indicators,
      center: ['50%', '52%'],
      radius: '64%',
      startAngle: 90,
      splitNumber: 5,
      shape: 'polygon',
      scale: true,
      axisName: {
        color: '#475569',
        fontSize: 12,
        fontWeight: 500,
        padding: [2, 2],
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(248, 250, 252, 0.9)', 'rgba(241, 245, 249, 0.75)'],
        },
      },
      splitLine: {
        lineStyle: { color: '#e2e8f0' },
      },
      axisLine: {
        lineStyle: { color: '#cbd5e1' },
      },
    },
    series: [
      {
        name: props.seriesName,
        type: 'radar',
        symbol: 'circle',
        symbolSize: 9,
        emphasis: {
          focus: 'self',
          lineStyle: { width: 3, color: '#005239' },
          areaStyle: { opacity: 0.45, color: 'rgba(0, 108, 77, 0.25)' },
          itemStyle: {
            color: '#006c4d',
            borderColor: '#fff',
            borderWidth: 2,
            shadowBlur: 12,
            shadowColor: 'rgba(0, 108, 77, 0.35)',
          },
        },
        data: [
          {
            name: props.seriesName,
            value: axes.map((a) => a.value),
            lineStyle: {
              width: 2.5,
              color: '#006c4d',
            },
            itemStyle: {
              color: '#006c4d',
              borderColor: '#fff',
              borderWidth: 2,
            },
            areaStyle: {
              color: new echarts.graphic.RadialGradient(0.5, 0.5, 0.9, [
                { offset: 0, color: 'rgba(0, 108, 77, 0.32)' },
                { offset: 1, color: 'rgba(0, 108, 77, 0.05)' },
              ]),
            },
          },
        ],
      },
    ],
  }
})

function disposeChart() {
  resizeObs?.disconnect()
  resizeObs = null
  chart?.dispose()
  chart = null
}

function initChart() {
  const el = chartRef.value
  if (!el || chart) return
  chart = echarts.init(el, undefined, { renderer: 'canvas' })
  chart.setOption(chartOption.value)
  resizeObs = new ResizeObserver(() => chart?.resize())
  resizeObs.observe(el)
}

watch(chartOption, (opt) => {
  chart?.setOption(opt, true)
})

watch(
  () => props.visible,
  async (visible) => {
    if (!visible) return
    await nextTick()
    if (!chartRef.value) return
    if (!chart) initChart()
    else chart.resize()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  disposeChart()
})
</script>

<template>
  <div class="industry-portrait-radar">
    <div
      ref="chartRef"
      class="industry-portrait-radar__canvas"
      role="img"
      aria-label="产业画像雷达图，悬停查看各维度分值"
    />
  </div>
</template>

<style scoped>
.industry-portrait-radar {
  width: 100%;
}

.industry-portrait-radar__canvas {
  width: 100%;
  height: min(52vh, 420px);
  min-height: 320px;
}
</style>
