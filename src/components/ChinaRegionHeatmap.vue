<script setup lang="ts">
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 与详情页 v-show 联动，进入区块后再初始化并 resize，避免尺寸为 0 */
    visible?: boolean
  }>(),
  { visible: true }
)

const chartRef = ref<HTMLDivElement | null>(null)
const status = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
const errorMsg = ref('')

let chart: ECharts | null = null
let resizeObs: ResizeObserver | null = null
let mapRegistered = false

/** 随构建置于站点根目录（public/geo/china.json），离线可用 */
const GEO_URL = `${import.meta.env.BASE_URL}geo/china.json`

interface GeoFeature {
  properties?: { name?: string }
}

interface GeoJsonLike {
  features: GeoFeature[]
}

/** 由省级名称映射为稳定热度指标 */
function heatFromRegionName(name: string): number {
  let h = 2166136261
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const u = (h >>> 0) % 10000
  return Math.round(22 + (u / 10000) * 76)
}

function buildSeriesData(geoJson: GeoJsonLike) {
  return geoJson.features
    .map((f) => {
      const name = f.properties?.name
      if (!name) return null
      return { name, value: heatFromRegionName(name) }
    })
    .filter((x): x is { name: string; value: number } => x !== null)
}

function disposeChart() {
  resizeObs?.disconnect()
  resizeObs = null
  chart?.dispose()
  chart = null
}

async function initChart() {
  const el = chartRef.value
  if (!el || chart) return

  status.value = 'loading'
  errorMsg.value = ''
  try {
    const res = await fetch(GEO_URL)
    if (!res.ok) throw new Error(`地图数据加载失败（${res.status}）`)
    const geoJson = (await res.json()) as GeoJsonLike

    if (!mapRegistered) {
      echarts.registerMap('china', geoJson as Parameters<typeof echarts.registerMap>[1])
      mapRegistered = true
    }

    const data = buildSeriesData(geoJson)

    chart = echarts.init(el, undefined, { renderer: 'canvas' })

    const option: EChartsOption = {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: '#0f172a', fontSize: 13 },
        formatter(p: unknown) {
          const params = p as { name?: string; value?: number; data?: { value?: number } }
          const name = params.name ?? '—'
          const v = params.data?.value ?? params.value
          if (v === undefined || v === null || Number.isNaN(Number(v))) {
            return `${name}<br/><span style="color:#64748b">暂无数值</span>`
          }
          return `${name}<br/>产业热度指数：<b>${v}</b>`
        },
      },
      visualMap: {
        type: 'continuous',
        min: 0,
        max: 100,
        left: 16,
        bottom: 28,
        calculable: true,
        realtime: true,
        text: ['高', '低'],
        inRange: {
          color: ['#dbeafe', '#86efac', '#34d399', '#059669', '#047857'],
        },
        textStyle: { color: '#475569', fontSize: 11 },
      },
      series: [
        {
          name: '产业热度',
          type: 'map',
          map: 'china',
          roam: true,
          scaleLimit: { min: 0.75, max: 10 },
          zoom: 1.05,
          selectedMode: false,
          label: {
            show: false,
            fontSize: 10,
            color: '#334155',
          },
          emphasis: {
            disabled: false,
            label: { show: true, fontSize: 11, fontWeight: 600, color: '#0f172a' },
            itemStyle: {
              areaColor: '#fde68a',
              borderColor: '#0f172a',
              borderWidth: 1,
            },
          },
          itemStyle: {
            borderColor: '#94a3b8',
            borderWidth: 0.5,
          },
          data,
        },
      ],
    }

    chart.setOption(option)
    status.value = 'ready'

    resizeObs = new ResizeObserver(() => {
      chart?.resize()
    })
    resizeObs.observe(el)
  } catch (e) {
    disposeChart()
    status.value = 'error'
    errorMsg.value = e instanceof Error ? e.message : '加载失败'
  }
}

watch(
  () => props.visible,
  async (visible) => {
    if (!visible) return
    await nextTick()
    if (!chartRef.value) return
    if (!chart) await initChart()
    else chart.resize()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  disposeChart()
})
</script>

<template>
  <div class="china-region-heatmap">
    <div
      ref="chartRef"
      class="heatmap-chart"
      role="img"
      aria-label="中国省级区域产业热度示意图"
    />
    <div v-if="status === 'loading'" class="heatmap-overlay">地图加载中…</div>
    <div v-else-if="status === 'error'" class="heatmap-overlay heatmap-overlay--error">
      {{ errorMsg }}
    </div>
  </div>
</template>

<style scoped>
.china-region-heatmap {
  position: relative;
  width: 100%;
  min-height: 440px;
}

.heatmap-chart {
  width: 100%;
  height: 440px;
}

.heatmap-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(250, 251, 252, 0.94);
  font-size: 14px;
  color: #64748b;
  pointer-events: none;
}

.heatmap-overlay--error {
  color: #b91c1c;
  padding: 0 20px;
  text-align: center;
}
</style>
