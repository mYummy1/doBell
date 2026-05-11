<script setup lang="ts">
import { computed } from 'vue'
import { NEV_BATTERY_LEAF_ID } from '../data/industryLeafContent'

const props = withDefaults(
  defineProps<{
    /** 产业分析子赛道 id */
    industryLeafId?: string
  }>(),
  {}
)

type Step = { id: string; label: string; desc: string; x: number; y: number }

/** 产业链环节（从左至右流动），坐标与 AI 版式通用 */
const STEPS_AI: Step[] = [
  { id: 'chip', label: 'AI芯片', desc: '算力底座', x: 68, y: 46 },
  { id: 'algo', label: '算法框架', desc: '训练与推理', x: 68, y: 196 },
  { id: 'llm', label: '大模型', desc: '通用智能核心', x: 378, y: 46 },
  { id: 'app', label: '行业应用', desc: '场景落地', x: 548, y: 196 },
  { id: 'device', label: '终端设备', desc: '边缘与终端', x: 718, y: 46 },
]

const STEPS_BATTERY: Step[] = [
  { id: 'mat', label: '锂电材料', desc: '正负极·隔膜·电解液', x: 68, y: 46 },
  { id: 'cell-mfg', label: '电芯制造', desc: '涂布·卷绕·化成', x: 68, y: 196 },
  { id: 'pack', label: '电池系统', desc: '模组·PACK·BMS', x: 378, y: 46 },
  { id: 'market', label: '应用市场', desc: '整车·储能·消费', x: 548, y: 196 },
  { id: 'cycle', label: '回收梯次', desc: '拆解·再生利用', x: 718, y: 46 },
]

const steps = computed(() =>
  props.industryLeafId === NEV_BATTERY_LEAF_ID ? STEPS_BATTERY : STEPS_AI
)

const hubId = computed(() => (props.industryLeafId === NEV_BATTERY_LEAF_ID ? 'pack' : 'llm'))

const ariaLabel = computed(() =>
  props.industryLeafId === NEV_BATTERY_LEAF_ID ? '锂电池产业链环节流向' : 'AI 产业链环节流向'
)

const W = 124
const H = 58
const RX = 14

function cx(s: Step) {
  return s.x + W / 2
}
function cy(s: Step) {
  return s.y + H / 2
}

const edgePaths = computed(() => {
  const s = steps.value
  const chip = s[0]
  const algo = s[1]
  const hub = s[2]
  const app = s[3]
  const device = s[4]
  const p: { d: string; key: string }[] = []

  p.push({
    key: 'e1',
    d: `M ${cx(chip)} ${chip.y + H} L ${cx(algo)} ${algo.y}`,
  })

  const x1 = chip.x + W
  const y1 = cy(algo)
  const x2 = hub.x
  const y2 = cy(hub)
  p.push({
    key: 'e2',
    d: `M ${x1} ${y1} C ${x1 + 120} ${y1}, ${x2 - 120} ${y2}, ${x2} ${y2}`,
  })

  p.push({
    key: 'e3',
    d: `M ${cx(hub)} ${hub.y + H} C ${cx(hub) + 48} ${hub.y + H + 56}, ${cx(app) - 48} ${app.y - 56}, ${cx(app)} ${app.y}`,
  })

  const x3 = app.x + W
  const y3 = cy(app)
  const x4 = device.x
  const y4 = cy(device)
  p.push({
    key: 'e4',
    d: `M ${x3} ${y3} C ${x3 + 110} ${y3}, ${x4 - 110} ${y4}, ${x4} ${y4}`,
  })

  return p
})
</script>

<template>
  <div class="industry-chain-flow">
    <svg
      class="icf-svg"
      viewBox="0 0 920 300"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      :aria-label="ariaLabel"
    >
      <defs>
        <linearGradient id="icf-edge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#34d399" />
          <stop offset="100%" stop-color="#006c4d" />
        </linearGradient>
        <linearGradient id="icf-node-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#f0fdf4" />
          <stop offset="100%" stop-color="#ffffff" />
        </linearGradient>
        <linearGradient id="icf-node-hub" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ecfdf5" />
          <stop offset="100%" stop-color="#d1fae5" />
        </linearGradient>
        <filter id="icf-shadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#0f172a" flood-opacity="0.07" />
        </filter>
        <marker
          id="icf-arrow"
          markerWidth="11"
          markerHeight="11"
          refX="10"
          refY="3.5"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M0,0 L0,7 L10,3.5 z" fill="#006c4d" />
        </marker>
      </defs>

      <rect width="920" height="300" class="icf-bg" rx="12" />

      <g class="icf-edges" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <path
          v-for="e in edgePaths"
          :key="`${e.key}-shadow`"
          :d="e.d"
          stroke="#cbd5e1"
          stroke-width="4"
          stroke-opacity="0.35"
        />
        <path
          v-for="e in edgePaths"
          :key="`${e.key}-line`"
          :d="e.d"
          stroke="url(#icf-edge-grad)"
          stroke-width="2.5"
          marker-end="url(#icf-arrow)"
        />
      </g>

      <g
        v-for="s in steps"
        :key="s.id"
        class="icf-node"
        :class="{ 'icf-node--hub': s.id === hubId }"
      >
        <title>{{ s.label }} · {{ s.desc }}</title>
        <rect
          :x="s.x"
          :y="s.y"
          :width="W"
          :height="H"
          :rx="RX"
          :fill="s.id === hubId ? 'url(#icf-node-hub)' : 'url(#icf-node-fill)'"
          :stroke="s.id === hubId ? '#006c4d' : '#a7f3d0'"
          :stroke-width="s.id === hubId ? 2.5 : 1.6"
          filter="url(#icf-shadow)"
        />
        <text :x="cx(s)" :y="s.y + 28" text-anchor="middle" class="icf-label">{{ s.label }}</text>
        <text :x="cx(s)" :y="s.y + 46" text-anchor="middle" class="icf-desc">{{ s.desc }}</text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.industry-chain-flow {
  width: 100%;
}

.icf-bg {
  fill: #f8fafc;
}

.icf-svg {
  width: 100%;
  height: auto;
  display: block;
  min-height: 268px;
  max-height: 360px;
}

.icf-node {
  cursor: default;
  transition: transform 0.2s ease;
}

.icf-node:hover {
  transform: translateY(-3px);
}

.icf-node:hover rect {
  stroke: #006c4d !important;
  stroke-width: 2.5px !important;
}

.icf-node--hub rect {
  stroke-width: 2.5px;
}

.icf-label {
  font-size: 14px;
  font-weight: 700;
  fill: #0f172a;
  pointer-events: none;
}

.icf-desc {
  font-size: 11px;
  fill: #64748b;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .icf-node {
    transition: none;
  }
  .icf-node:hover {
    transform: none;
  }
}
</style>
