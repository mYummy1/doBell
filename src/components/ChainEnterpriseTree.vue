<script setup lang="ts">
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    visible?: boolean
  }>(),
  { visible: true }
)

const chartRef = ref<HTMLDivElement | null>(null)
let chart: ECharts | null = null
let resizeObs: ResizeObserver | null = null

const TREE_ROOT = {
  name: 'AI产业链',
  symbolSize: 18,
  itemStyle: {
    color: '#006c4d',
    borderColor: '#005239',
    borderWidth: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: 700,
    color: '#0f172a',
  },
  children: [
    {
      name: '上游',
      symbolSize: 12,
      itemStyle: { color: '#ecfdf5', borderColor: '#059669', borderWidth: 1.5 },
      label: { fontWeight: 600 },
      children: [
        { name: 'AI芯片商', symbolSize: 8, itemStyle: { color: '#fff', borderColor: '#006c4d' } },
        { name: '算力服务商', symbolSize: 8, itemStyle: { color: '#fff', borderColor: '#006c4d' } },
      ],
    },
    {
      name: '中游',
      symbolSize: 12,
      itemStyle: { color: '#ecfdf5', borderColor: '#059669', borderWidth: 1.5 },
      label: { fontWeight: 600 },
      children: [
        { name: '算法框架', symbolSize: 8, itemStyle: { color: '#fff', borderColor: '#006c4d' } },
        { name: '平台公司', symbolSize: 8, itemStyle: { color: '#fff', borderColor: '#006c4d' } },
      ],
    },
    {
      name: '下游',
      symbolSize: 12,
      itemStyle: { color: '#ecfdf5', borderColor: '#059669', borderWidth: 1.5 },
      label: { fontWeight: 600 },
      children: [{ name: '行业解决方案商', symbolSize: 8, itemStyle: { color: '#fff', borderColor: '#006c4d' } }],
    },
  ],
}

function buildOption(): EChartsOption {
  return {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: '#0f172a', fontSize: 13 },
      formatter: (p: unknown) => {
        const x = p as { name?: string }
        return x.name ?? ''
      },
    },
    series: [
      {
        type: 'tree',
        name: '产业链',
        data: [TREE_ROOT],
        roam: true,
        layout: 'orthogonal',
        orient: 'TB',
        symbol: 'emptyCircle',
        edgeShape: 'curve',
        expandAndCollapse: true,
        initialTreeDepth: -1,
        animationDuration: 380,
        animationDurationUpdate: 260,
        top: '6%',
        left: '8%',
        bottom: '8%',
        right: '8%',
        zoom: 0.88,
        emphasis: {
          focus: 'descendant',
          blurScope: 'coordinateSystem',
          itemStyle: {
            shadowBlur: 12,
            shadowColor: 'rgba(0, 108, 77, 0.25)',
          },
        },
        label: {
          position: 'top',
          distance: 6,
          fontSize: 11,
          color: '#334155',
        },
        leaves: {
          label: {
            position: 'bottom',
            distance: 5,
            fontSize: 11,
          },
        },
        lineStyle: {
          color: '#94a3b8',
          width: 1.5,
          curveness: 0.35,
        },
      },
    ],
  }
}

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
  chart.setOption(buildOption())
  resizeObs = new ResizeObserver(() => chart?.resize())
  resizeObs.observe(el)
}

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
  <div class="chain-enterprise-tree">
    <div
      ref="chartRef"
      class="chain-enterprise-tree__canvas"
      role="img"
      aria-label="AI 产业链树形结构"
    />
  </div>
</template>

<style scoped>
.chain-enterprise-tree {
  width: 100%;
}
.chain-enterprise-tree__canvas {
  width: 100%;
  height: min(56vh, 420px);
  min-height: 300px;
}
</style>
