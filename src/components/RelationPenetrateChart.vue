<script setup lang="ts">
import * as echarts from 'echarts'
import type { ECharts, EChartsOption } from 'echarts'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type {
  CompanyDetailData,
  RelationPenetrationLink,
  RelationPenetrationNode,
  RelationPenetrationSpec,
} from '../data/companyDetail'

/** 与全局 style.css 中品牌色一致（ECharts 需写死 hex） */
const COL = {
  primary: '#006c4d',
  primaryDark: '#005239',
  brand: '#1a3e4c',
  text: '#111827',
  muted: '#64748b',
  line: '#cbd5e1',
  lineMuted: '#94a3b8',
  surface: '#ffffff',
  govFill: '#f0fdf4',
  /** 自然人节点描边：略区别于企业，仍偏暖但不抢主色 */
  personBorder: '#b45309',
  captionPerson: '#b45309',
  badgeBg: 'rgba(234, 88, 12, 0.95)',
} as const

/** 固定布局整体缩放：默认视觉略小，留白更多 */
const PENETRATION_LAYOUT_SCALE = 0.86

const props = withDefaults(
  defineProps<{
    company: CompanyDetailData
    /** 与详情页 v-show 联动：隐藏时容器尺寸为 0，需可见后再 init/resize，否则图谱空白 */
    visible?: boolean
  }>(),
  { visible: true }
)

const chartRef = ref<HTMLDivElement | null>(null)
let chart: ECharts | null = null

/** 中文公司名按固定字数换行（不全称截断） */
function wrapEntityName(text: string, charsPerLine: number): string {
  const t = text.trim()
  if (t.length <= charsPerLine) return t
  const parts: string[] = []
  for (let i = 0; i < t.length; i += charsPerLine) {
    parts.push(t.slice(i, i + charsPerLine))
  }
  return parts.join('\n')
}

function scalePenetrationPositions(nodes: RelationPenetrationNode[]): RelationPenetrationNode[] {
  if (!nodes.length) return nodes
  const xs = nodes.map((n) => n.x)
  const ys = nodes.map((n) => n.y)
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2
  const s = PENETRATION_LAYOUT_SCALE
  return nodes.map((n) => ({
    ...n,
    x: cx + (n.x - cx) * s,
    y: cy + (n.y - cy) * s,
  }))
}

/**
 * layout: 'none' 时节点 x/y 为像素坐标，不会随容器自动缩放。
 * 将设计稿坐标归一化到固定逻辑画布，避免窄屏/卡片内图谱裁切、堆叠异常。
 */
function normalizePenetrationLayout(nodes: RelationPenetrationNode[]): RelationPenetrationNode[] {
  if (!nodes.length) return nodes
  const xs = nodes.map((n) => n.x)
  const ys = nodes.map((n) => n.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const spanX = Math.max(1, maxX - minX)
  const spanY = Math.max(1, maxY - minY)
  /** 与 legend 留白匹配；ECharts 会再按容器缩放整块坐标 */
  const viewW = 920
  const viewH = 480
  const padX = 72
  const padY = 52
  const innerW = viewW - padX * 2
  const innerH = viewH - padY * 2
  return nodes.map((n) => ({
    ...n,
    x: padX + ((n.x - minX) / spanX) * innerW,
    y: padY + ((n.y - minY) / spanY) * innerH,
  }))
}

function roleCategory(role: RelationPenetrationNode['role']): number {
  switch (role) {
    case 'target':
      return 0
    case 'company':
      return 1
    case 'person':
      return 2
    case 'gov':
      return 3
    default:
      return 1
  }
}

function symbolSizeForNode(n: RelationPenetrationNode, wrappedName: string): [number, number] {
  const lines = wrappedName.split('\n').length + (n.caption ? 2 : 0) + (n.badge ? 1 : 0)
  const extraH = Math.max(0, lines - 2) * 11

  if (n.role === 'target') return [122, Math.max(40, 38 + extraH)]
  if (n.role === 'gov') return [104, Math.max(36, 34 + extraH)]
  if (n.role === 'person') return [74, Math.max(30, 28 + extraH)]
  const len = n.name.length
  if (len > 18) return [118, Math.max(38, 36 + extraH)]
  if (len > 12) return [102, Math.max(36, 32 + extraH)]
  return [88, Math.max(32, 30 + extraH)]
}

function penetrationNodeToGraph(n: RelationPenetrationNode): Record<string, unknown> {
  const cat = roleCategory(n.role)
  const isTarget = n.role === 'target'
  const isPerson = n.role === 'person'
  const wrapLen = isTarget ? 8 : isPerson ? 10 : 9
  const wrappedName = wrapEntityName(n.name, wrapLen)
  const [sw, sh] = symbolSizeForNode(n, wrappedName)

  const labelRich = isTarget
    ? {
        cap: { fontSize: 9, color: 'rgba(255,255,255,0.85)', lineHeight: 13, align: 'center' as const, width: sw - 12 },
        nm: {
          fontSize: 11,
          fontWeight: 700 as const,
          color: '#ffffff',
          lineHeight: 15,
          align: 'center' as const,
          width: sw - 12,
        },
        bd: {
          fontSize: 9,
          color: '#fff7ed',
          backgroundColor: COL.badgeBg,
          padding: [2, 8] as [number, number],
          borderRadius: 4,
          align: 'center' as const,
        },
      }
    : {
        cap: {
          fontSize: 8,
          color: COL.captionPerson,
          lineHeight: 12,
          align: 'center' as const,
          width: sw - 10,
        },
        nm: {
          fontSize: isPerson ? 10 : 9,
          fontWeight: 600 as const,
          color: COL.brand,
          lineHeight: 14,
          align: 'center' as const,
          width: sw - 10,
        },
        bd: {
          fontSize: 8,
          color: '#9a3412',
          backgroundColor: '#ffedd5',
          padding: [2, 8] as [number, number],
          borderRadius: 4,
          align: 'center' as const,
        },
      }

  let formatter = ''
  if (n.caption) formatter += `{cap|${n.caption}}\n`
  formatter += `{nm|${wrappedName}}`
  if (n.badge) formatter += `\n{bd|${n.badge}}`

  return {
    id: n.id,
    name: n.name,
    x: n.x,
    y: n.y,
    fixed: true,
    category: cat,
    symbol: 'roundRect',
    symbolSize: [sw, sh],
    caption: n.caption,
    badge: n.badge,
    itemStyle: {
      color: isTarget ? COL.primary : n.role === 'gov' ? COL.govFill : COL.surface,
      borderColor: isPerson ? COL.personBorder : isTarget ? COL.primaryDark : COL.primary,
      borderWidth: isTarget ? 0 : isPerson ? 2 : 2,
      shadowBlur: isTarget ? 10 : 3,
      shadowColor: isTarget ? 'rgba(0, 108, 77, 0.28)' : 'rgba(26, 62, 76, 0.08)',
    },
    label: {
      show: true,
      position: 'inside',
      formatter,
      rich: labelRich,
      overflow: 'break',
    },
    tooltip: {
      formatter: () => {
        let html = `<div style="font-weight:600;margin-bottom:6px;color:${COL.brand}">${n.name}</div>`
        if (n.caption) html += `<div style="color:${COL.muted};font-size:12px;margin-bottom:4px;">${n.caption}</div>`
        if (n.badge) html += `<div style="font-size:12px;color:#c2410c;">状态：${n.badge}</div>`
        if (!n.caption && !n.badge)
          html += `<span style="color:${COL.muted};font-size:12px;">${isTarget ? '标的 · 本公司' : isPerson ? '自然人' : '企业或其他组织'}</span>`
        return html
      },
    },
  }
}

function penetrationLinkToGraph(l: RelationPenetrationLink): Record<string, unknown> {
  return {
    source: l.source,
    target: l.target,
    label: {
      show: true,
      formatter: l.label,
      fontSize: 9,
      fontWeight: 600,
      color: COL.primary,
    },
    lineStyle: {
      width: 1.25,
      color: COL.lineMuted,
      type: l.dashed ? 'dashed' : 'solid',
      curveness: 0.06,
    },
  }
}

function buildPenetrationSpecOption(spec: RelationPenetrationSpec): EChartsOption {
  const scaled = scalePenetrationPositions(spec.nodes)
  const laidOut = normalizePenetrationLayout(scaled)
  const nodes = laidOut.map(penetrationNodeToGraph)
  const links = spec.links.map(penetrationLinkToGraph)

  return {
    animationDuration: 600,
    animationEasingUpdate: 'cubicOut',
    tooltip: {
      trigger: 'item',
      enterable: true,
      confine: true,
      borderWidth: 0,
      padding: [10, 12],
      backgroundColor: 'rgba(255,255,255,0.96)',
      extraCssText: 'box-shadow:0 8px 24px rgba(15,23,42,0.12);border-radius:10px;',
    },
    legend: {
      bottom: 6,
      left: 'center',
      itemGap: 14,
      textStyle: { fontSize: 11, color: COL.muted },
      data: ['本公司', '企业', '自然人', '机关单位'],
    },
    series: [
      {
        type: 'graph',
        layout: 'none',
        left: 12,
        right: 12,
        top: 12,
        bottom: 52,
        data: nodes,
        links,
        categories: [
          { name: '本公司', itemStyle: { color: COL.primary } },
          { name: '企业', itemStyle: { color: COL.surface } },
          { name: '自然人', itemStyle: { color: COL.surface } },
          { name: '机关单位', itemStyle: { color: COL.govFill } },
        ],
        roam: true,
        scaleLimit: { min: 0.35, max: 2.8 },
        draggable: true,
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: [0, 10],
        label: {
          show: true,
        },
        emphasis: {
          focus: 'adjacency',
          scale: 1.04,
          itemStyle: {
            shadowBlur: 14,
            shadowColor: 'rgba(0, 108, 77, 0.22)',
          },
          lineStyle: {
            width: 2,
            color: COL.primary,
          },
        },
        blur: {
          itemStyle: { opacity: 0.22 },
          lineStyle: { opacity: 0.18 },
        },
        lineStyle: {
          opacity: 0.92,
        },
      },
    ],
  }
}

function buildLegacyOption(c: CompanyDetailData): EChartsOption {
  const centerId = '__center__'

  const nodes: Record<string, unknown>[] = []
  const links: Record<string, unknown>[] = []

  const centerWrapped = wrapEntityName(c.name, 8)
  nodes.push({
    id: centerId,
    name: c.name,
    symbolSize: [118, Math.max(36, 28 + (centerWrapped.split('\n').length - 1) * 14)],
    category: 0,
    symbol: 'roundRect',
    itemStyle: {
      color: COL.primary,
      shadowBlur: 8,
      shadowColor: 'rgba(0, 108, 77, 0.22)',
    },
    label: {
      show: true,
      position: 'inside',
      formatter: centerWrapped,
      fontSize: 11,
      fontWeight: 700,
      color: '#ffffff',
      lineHeight: 15,
      width: 106,
      overflow: 'break',
    },
    tooltip: {
      formatter: () =>
        `<div style="font-weight:600;margin-bottom:4px;color:${COL.brand}">${c.name}</div><span style="color:${COL.muted}">标的 · 本公司</span>`,
    },
  })

  c.shareholders.forEach((s, i) => {
    const id = `sh-${i}`
    const wrapped = wrapEntityName(s.name, 9)
    nodes.push({
      id,
      name: s.name,
      symbol: 'roundRect',
      symbolSize: [92, Math.max(30, 26 + (wrapped.split('\n').length - 1) * 13)],
      category: 1,
      itemStyle: {
        color: COL.surface,
        borderColor: COL.primary,
        borderWidth: 2,
      },
      label: {
        show: true,
        position: 'inside',
        formatter: wrapped,
        fontSize: 9,
        fontWeight: 600,
        color: COL.brand,
        lineHeight: 13,
        width: 82,
        overflow: 'break',
      },
      tooltip: {
        formatter: () =>
          `<div style="font-weight:600;color:${COL.brand}">${s.name}</div>` +
          `<div style="margin-top:4px;color:${COL.muted};font-size:12px">${s.type} · 持股 ${s.ratio}</div>`,
      },
    })
    links.push({
      source: id,
      target: centerId,
      label: {
        show: true,
        formatter: s.ratio,
        fontSize: 9,
        fontWeight: 600,
        color: COL.primary,
      },
      lineStyle: {
        width: 1.25,
        color: COL.line,
        curveness: 0.08,
      },
    })
  })

  c.outboundInvest.forEach((o, i) => {
    const id = `ob-${i}`
    const wrapped = wrapEntityName(o.name, 9)
    nodes.push({
      id,
      name: o.name,
      symbol: 'roundRect',
      symbolSize: [90, Math.max(30, 26 + (wrapped.split('\n').length - 1) * 13)],
      category: 2,
      itemStyle: {
        color: '#f8fafc',
        borderColor: COL.brand,
        borderWidth: 2,
      },
      label: {
        show: true,
        position: 'inside',
        formatter: wrapped + (o.status ? `\n(${o.status})` : ''),
        fontSize: 9,
        fontWeight: 600,
        color: COL.brand,
        lineHeight: 13,
        width: 80,
        overflow: 'break',
      },
      tooltip: {
        formatter: () =>
          `<div style="font-weight:600;color:${COL.brand}">${o.name}</div>` +
          `<div style="margin-top:4px;color:${COL.muted};font-size:12px">对外投资 ${o.ratio}${o.status ? ` · ${o.status}` : ''}</div>`,
      },
    })
    links.push({
      source: centerId,
      target: id,
      label: {
        show: true,
        formatter: o.ratio,
        fontSize: 9,
        fontWeight: 600,
        color: COL.primary,
      },
      lineStyle: {
        width: 1.25,
        color: COL.lineMuted,
        type: 'dashed',
        dashOffset: 2,
        curveness: 0.12,
      },
    })
  })

  return {
    animationDuration: 800,
    animationEasingUpdate: 'cubicOut',
    tooltip: {
      trigger: 'item',
      enterable: true,
      confine: true,
      borderWidth: 0,
      padding: [10, 12],
      backgroundColor: 'rgba(255,255,255,0.96)',
      extraCssText: 'box-shadow:0 8px 24px rgba(15,23,42,0.12);border-radius:10px;',
    },
    legend: {
      bottom: 8,
      left: 'center',
      itemGap: 16,
      textStyle: { fontSize: 11, color: COL.muted },
      data: ['本公司', '股东', '对外投资'],
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        data: nodes,
        links,
        categories: [
          { name: '本公司', itemStyle: { color: COL.primary } },
          { name: '股东', itemStyle: { color: COL.surface } },
          { name: '对外投资', itemStyle: { color: '#f8fafc' } },
        ],
        roam: true,
        draggable: true,
        scaleLimit: { min: 0.42, max: 2.2 },
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: [0, 9],
        label: {
          show: true,
        },
        emphasis: {
          focus: 'adjacency',
          scale: 1.06,
          itemStyle: {
            shadowBlur: 14,
            shadowColor: 'rgba(0, 108, 77, 0.2)',
          },
          lineStyle: {
            width: 2.5,
            color: COL.primary,
          },
          label: {
            fontWeight: 700,
          },
        },
        blur: {
          itemStyle: { opacity: 0.25 },
          lineStyle: { opacity: 0.2 },
        },
        lineStyle: {
          opacity: 0.85,
        },
        force: {
          repulsion: 320,
          gravity: 0.07,
          edgeLength: [76, 132],
          friction: 0.62,
          layoutAnimation: true,
        },
      },
    ],
  }
}

const chartOption = computed((): EChartsOption => {
  const c = props.company
  if (c.relationPenetration?.nodes?.length) {
    return buildPenetrationSpecOption(c.relationPenetration)
  }
  return buildLegacyOption(c)
})

const chartWrapClass = computed(() =>
  props.company.relationPenetration?.nodes?.length ? 'relation-penetrate-chart is-penetration-spec' : 'relation-penetrate-chart'
)

const isPenetrationSpec = computed(() => !!props.company.relationPenetration?.nodes?.length)

function applyInitialRoam() {
  /** 固定坐标穿透图：graphRoam 缩放易导致裁切/错位，仅对力导向自动布局略缩小 */
  if (isPenetrationSpec.value) return
  chart?.dispatchAction({
    type: 'graphRoam',
    seriesIndex: 0,
    zoom: 0.88,
  })
}

function mountChart() {
  const el = chartRef.value
  if (!el || chart) return

  chart = echarts.init(el, undefined, { renderer: 'canvas' })
  chart.setOption(chartOption.value, true)

  ro = new ResizeObserver(() => resizeChart())
  ro.observe(el)

  nextTick(() => {
    applyInitialRoam()
    resizeChart()
    requestAnimationFrame(() => {
      resizeChart()
    })
  })
}

function resizeChart() {
  chart?.resize()
}

function activateChart() {
  nextTick(() => {
    if (!chartRef.value) return
    if (!chart) {
      mountChart()
    } else {
      nextTick(() => {
        applyInitialRoam()
        resizeChart()
        requestAnimationFrame(() => resizeChart())
      })
    }
  })
}

let ro: ResizeObserver | null = null

watch(
  () => props.visible,
  (visible) => {
    if (!visible) return
    activateChart()
  },
  { immediate: true }
)

watch(chartOption, (opt) => {
  if (!chart) return
  chart.setOption(opt, true)
  nextTick(() => {
    applyInitialRoam()
    resizeChart()
    requestAnimationFrame(() => resizeChart())
  })
})

onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
  chart?.dispose()
  chart = null
})

defineExpose({ resizeChart })
</script>

<template>
  <div ref="chartRef" :class="chartWrapClass" />
</template>

<style scoped>
.relation-penetrate-chart {
  width: 100%;
  height: min(400px, 52vh);
  min-height: 280px;
}

.relation-penetrate-chart.is-penetration-spec {
  height: min(500px, 58vh);
  min-height: 400px;
}
</style>
