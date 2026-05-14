<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AuthGuestBar from '../components/AuthGuestBar.vue'
import ChainEnterpriseTree from '../components/ChainEnterpriseTree.vue'
import ChinaRegionHeatmap from '../components/ChinaRegionHeatmap.vue'
import IndustryChainFlow from '../components/IndustryChainFlow.vue'
import IndustryPortraitRadar from '../components/IndustryPortraitRadar.vue'
import SectionHeading from '../components/SectionHeading.vue'
import UserMenuDropdown from '../components/UserMenuDropdown.vue'
import { useAuth } from '../composables/useAuth'
import { useSearchHistory } from '../composables/useSearchHistory'
import {
  formatFirmCount,
  INDUSTRY_ANALYSIS_CATALOG,
  type IndustryGroup,
  type IndustryLeaf,
} from '../data/industryAnalysisCatalog'
import {
  iaFeaturePanelLead,
  iaFinancingForLeaf,
  iaKeyEnterprisesForLeaf,
  iaPoliciesForLeaf,
  iaPortraitAxesBaseForLeaf,
} from '../data/industryLeafContent'
import { INDUSTRY_ANALYSIS_DETAIL_NAV } from '../data/industryAnalysisNav'

const faviconUrl = `${import.meta.env.BASE_URL}favicon.svg`
const { isLoggedIn } = useAuth()
const router = useRouter()
const { rememberQuery } = useSearchHistory()

type SelectedIndustryTrack = { group: IndustryGroup; leaf: IndustryLeaf }

const selectedTrack = ref<SelectedIndustryTrack | null>(null)
/** 产业概览：左侧选中的大类，右侧仅展示该大类下的子赛道（默认第一个大类） */
const selectedOverviewGroupId = ref<string | null>(
  INDUSTRY_ANALYSIS_CATALOG[0]?.id ?? null
)
const activeFeatureId = ref<string>(INDUSTRY_ANALYSIS_DETAIL_NAV[0]!.id)

const activeOverviewGroup = computed((): IndustryGroup | null => {
  const id = selectedOverviewGroupId.value
  if (!id) return null
  return INDUSTRY_ANALYSIS_CATALOG.find((g) => g.id === id) ?? null
})

function groupTotalFirms(g: IndustryGroup): number {
  return g.children.reduce((s, c) => s + c.firmCount, 0)
}

const catalogTotals = computed(() =>
  INDUSTRY_ANALYSIS_CATALOG.map((g) => ({
    id: g.id,
    title: g.title,
    total: groupTotalFirms(g),
    count: g.children.length,
  }))
)

const trackLabelShort = computed(() => {
  const t = selectedTrack.value
  if (!t) return ''
  return `${t.group.title} · ${t.leaf.name}`
})

function portraitAxesFromBase(leafId: string, base: readonly { label: string; value: number }[]) {
  let h = 2166136261
  for (let i = 0; i < leafId.length; i++) {
    h ^= leafId.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const u = h >>> 0
  return base.map((a, i) => {
    const jitter = ((u >> (i * 2)) & 15) - 7
    return {
      label: a.label,
      value: Math.min(100, Math.max(38, a.value + jitter)),
    }
  })
}

const activeLeafId = computed(() => selectedTrack.value?.leaf.id)

const portraitAxesForSelected = computed(() => {
  const id = activeLeafId.value
  const base = iaPortraitAxesBaseForLeaf(id)
  if (!id) return [...base]
  return portraitAxesFromBase(id, [...base])
})

const policyRowsForTrack = computed(() => iaPoliciesForLeaf(activeLeafId.value))

const keyEnterprisesForTrack = computed(() => iaKeyEnterprisesForLeaf(activeLeafId.value))

const financingRowsForTrack = computed(() => iaFinancingForLeaf(activeLeafId.value))

const portraitSeriesName = computed(() =>
  selectedTrack.value ? `${selectedTrack.value.leaf.name} · 产业竞争力` : '产业竞争力'
)

const selectedLeafFirmCount = computed(() => selectedTrack.value?.leaf.firmCount ?? 0)

/** 已进入赛道详情时保持图表挂载，避免侧栏切换时 ECharts 反复 init/dispose 闪烁 */
const detailChartsVisible = computed(() => !!selectedTrack.value)

/** 点击侧栏滚动后一段时间内忽略 IntersectionObserver，防止与 smooth 滚动抢 active */
let featureSpyLockUntil = 0

function lockFeatureScrollSpy(ms: number) {
  featureSpyLockUntil = Date.now() + ms
}

function selectTrack(group: IndustryGroup, leaf: IndustryLeaf) {
  selectedTrack.value = { group, leaf }
  activeFeatureId.value = INDUSTRY_ANALYSIS_DETAIL_NAV[0]!.id
  lockFeatureScrollSpy(900)
  nextTick(() => {
    document.getElementById('ia-feature-portrait')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function backToOverview() {
  selectedTrack.value = null
  teardownFeatureObserver()
  nextTick(() => {
    document.getElementById('ia-overview-main')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function selectOverviewGroup(id: string) {
  selectedOverviewGroupId.value = id
  nextTick(() => {
    document.getElementById('ia-overview-main')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function scrollToFeature(id: string) {
  if (!selectedTrack.value) return
  activeFeatureId.value = id
  lockFeatureScrollSpy(900)
  nextTick(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function openKeyEnterprise(queryName: string) {
  const trimmed = queryName.trim()
  if (!trimmed) return
  rememberQuery(trimmed)
  router.push({ name: 'company-detail', query: { q: trimmed }, hash: '' })
}

let io: IntersectionObserver | null = null

function teardownFeatureObserver() {
  io?.disconnect()
  io = null
}

function setupFeatureObserver() {
  teardownFeatureObserver()
  if (!selectedTrack.value) return
  const ids = INDUSTRY_ANALYSIS_DETAIL_NAV.map((n) => n.id)
  io = new IntersectionObserver(
    (entries) => {
      if (Date.now() < featureSpyLockUntil) return
      const visible = entries
        .filter((e) => e.isIntersecting && e.target.id && e.intersectionRatio >= 0.12)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      const id = visible[0]?.target.id
      if (id && id !== activeFeatureId.value) activeFeatureId.value = id
    },
    { root: null, rootMargin: '-8% 0px -42% 0px', threshold: [0, 0.12, 0.25, 0.45] }
  )
  for (const id of ids) {
    const el = document.getElementById(id)
    if (el) io.observe(el)
  }
}

watch(selectedTrack, () => {
  nextTick(setupFeatureObserver)
})

onMounted(() => {
  nextTick(setupFeatureObserver)
})

onBeforeUnmount(() => {
  teardownFeatureObserver()
})
</script>

<template>
  <div class="ia2">
    <header class="ia2-top">
      <RouterLink to="/" class="ia2-brand">
        <img class="ia2-logo" :src="faviconUrl" alt="" width="40" height="40" />
        <span class="ia2-brand-txt">灵枢数据一体化平台</span>
      </RouterLink>
      <div class="ia2-top-meta">
        <AuthGuestBar v-if="!isLoggedIn" />
        <UserMenuDropdown v-else />
      </div>
    </header>

    <div class="ia2-page-head">
      <div class="ia2-page-head-inner">
        <span class="ia2-page-head-accent" aria-hidden="true" />
        <div class="ia2-page-head-text">
          <h1 class="ia2-page-head-title">产业分析</h1>
          <p class="ia2-page-head-sub">战略性新兴产业监测与赛道分析</p>
        </div>
      </div>
    </div>

    <div class="ia2-body">
      <aside class="ia2-aside" aria-label="产业分析导航">
        <div class="ia2-aside-scroll">
          <template v-if="!selectedTrack">
            <div class="ia2-nav-card">
              <p class="ia2-nav-group-title">产业概览</p>
              <nav class="ia2-overview-flat ia2-overview-flat--sidebar" aria-label="产业大类">
                <button
                  v-for="row in catalogTotals"
                  :key="row.id"
                  type="button"
                  class="ia2-overview-flat-item"
                  :class="{ 'is-active': selectedOverviewGroupId === row.id }"
                  @click="selectOverviewGroup(row.id)"
                >
                  <span class="ia2-overview-flat-name">{{ row.title }}</span>
                  <span class="ia2-overview-flat-stat">{{ row.count }} 项 · {{ formatFirmCount(row.total) }}</span>
                </button>
              </nav>
            </div>
          </template>

          <template v-else>
            <div class="ia2-nav-card">
              <button type="button" class="ia2-back-overview" @click="backToOverview">
                ← 返回产业概览
              </button>
              <p class="ia2-current-track" title="当前分析赛道">{{ trackLabelShort }}</p>
              <p class="ia2-nav-group-title">赛道分析</p>
              <nav class="ia2-feature-nav" aria-label="赛道分析模块">
                <button
                  v-for="item in INDUSTRY_ANALYSIS_DETAIL_NAV"
                  :key="item.id"
                  type="button"
                  class="ia2-feature-link"
                  :class="{ 'is-active': activeFeatureId === item.id }"
                  @click="scrollToFeature(item.id)"
                >
                  <span class="ia2-feature-indicator" aria-hidden="true" />
                  <span class="ia2-feature-text">
                    <span class="ia2-feature-label">{{ item.label }}</span>
                    <span class="ia2-feature-desc">{{ item.description }}</span>
                  </span>
                </button>
              </nav>
            </div>
          </template>
        </div>

        <RouterLink to="/" class="ia2-back-home">
          <span class="ia2-back-ico" aria-hidden="true">←</span>
          返回首页
        </RouterLink>
      </aside>

      <div class="ia2-main">
        <section
          v-show="!selectedTrack"
          id="ia-overview-main"
          class="ia2-panel anchor-target"
        >
          <SectionHeading title="产业概览">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M4 18V11M12 18V7M20 18v-5"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
              />
              <path d="M2 21h20" stroke="currentColor" stroke-width="1.75" />
            </svg>
          </SectionHeading>

          <div class="ia2-overview-groups">
            <p v-if="!activeOverviewGroup" class="ia2-overview-placeholder">
              请从左侧选择产业大类，查看该大类下的子赛道列表。
            </p>
            <section
              v-else
              :id="`ia-overview-group-${activeOverviewGroup.id}`"
              class="ia2-stream-block anchor-target"
            >
              <header class="ia2-stream-head">
                <div class="ia2-stream-title-row">
                  <h3 class="ia2-stream-title">{{ activeOverviewGroup.title }}</h3>
                  <span class="ia2-stream-chip">共 {{ activeOverviewGroup.children.length }} 个子赛道</span>
                </div>
                <p class="ia2-stream-sum">
                  合计企业约 <strong>{{ formatFirmCount(groupTotalFirms(activeOverviewGroup)) }}</strong> 家
                </p>
              </header>

              <div class="ia2-table" role="list">
                <button
                  v-for="leaf in activeOverviewGroup.children"
                  :key="leaf.id"
                  type="button"
                  class="ia2-row ia2-row--pick"
                  role="listitem"
                  @click="selectTrack(activeOverviewGroup, leaf)"
                >
                  <span class="ia2-row-name">{{ leaf.name }}</span>
                  <span class="ia2-row-num" aria-label="企业户数">
                    <span class="ia2-row-value">{{ formatFirmCount(leaf.firmCount) }}</span>
                    <span class="ia2-row-unit">家</span>
                  </span>
                  <span class="ia2-row-action">进入分析</span>
                </button>
              </div>
            </section>
          </div>
        </section>

        <div v-show="selectedTrack" class="ia2-detail-wrap">
          <div class="ia2-track-strip">
            <div class="ia2-track-strip-main">
              <span class="ia2-track-strip-label">当前分析赛道</span>
              <p class="ia2-track-strip-title">{{ trackLabelShort }}</p>
            </div>
            <p class="ia2-track-strip-meta">
              <strong>{{ formatFirmCount(selectedLeafFirmCount) }}</strong> 家
            </p>
          </div>

          <section id="ia-feature-portrait" class="ia2-panel anchor-target">
            <SectionHeading :title="`产业画像 · ${trackLabelShort}`">
              <svg viewBox="0 0 24 24" fill="none">
                <ellipse cx="12" cy="7" rx="5" ry="3" stroke="currentColor" stroke-width="1.75" />
                <path d="M7 21c0-3 3-6 8-6h2" stroke="currentColor" stroke-width="1.75" />
              </svg>
            </SectionHeading>
            <p class="ia2-panel-lead">{{ iaFeaturePanelLead('ia-feature-portrait', activeLeafId) }}</p>
            <div class="ia2-viz">
              <IndustryPortraitRadar
                :visible="detailChartsVisible"
                :axes="portraitAxesForSelected"
                :series-name="portraitSeriesName"
              />
            </div>
          </section>

          <section id="ia-feature-chain" class="ia2-panel anchor-target">
            <SectionHeading :title="`链上企业 · ${trackLabelShort}`">
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="6" cy="12" r="2.5" stroke="currentColor" stroke-width="1.75" />
                <circle cx="18" cy="8" r="2.5" stroke="currentColor" stroke-width="1.75" />
                <circle cx="18" cy="16" r="2.5" stroke="currentColor" stroke-width="1.75" />
                <path d="M8.5 12h5M13 10l4-4M13 14l4 4" stroke="currentColor" stroke-width="1.5" />
              </svg>
            </SectionHeading>
            <p class="ia2-panel-lead">{{ iaFeaturePanelLead('ia-feature-chain', activeLeafId) }}</p>
            <div class="ia2-viz ia2-viz--tall">
              <ChainEnterpriseTree :visible="detailChartsVisible" :industry-leaf-id="activeLeafId" />
            </div>
          </section>

          <section id="ia-feature-key" class="ia2-panel anchor-target">
            <SectionHeading :title="`重点企业 · ${trackLabelShort}`">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2l3 6 6 .5-4.5 4 1 6L12 16l-5.5 2.5 1-6L3 8.5 9 8l3-6z"
                  stroke="currentColor"
                  stroke-width="1.75"
                />
              </svg>
            </SectionHeading>
            <p class="ia2-panel-lead">{{ iaFeaturePanelLead('ia-feature-key', activeLeafId) }}</p>
            <div class="ia2-key-chips" role="list">
              <button
                v-for="(row, i) in keyEnterprisesForTrack"
                :key="i"
                type="button"
                class="ia2-key-chip"
                role="listitem"
                @click="openKeyEnterprise(row.queryName)"
              >
                {{ row.displayName }}
              </button>
            </div>
          </section>

          <section id="ia-feature-graph" class="ia2-panel anchor-target">
            <SectionHeading :title="`产业图谱 · ${trackLabelShort}`">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="3" y="10" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.75" />
                <rect x="15" y="4" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.75" />
                <rect x="15" y="16" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.75" />
                <path d="M9 13h6m0-5v13" stroke="currentColor" stroke-width="1.5" />
              </svg>
            </SectionHeading>
            <p class="ia2-panel-lead">{{ iaFeaturePanelLead('ia-feature-graph', activeLeafId) }}</p>
            <div class="ia2-viz">
              <IndustryChainFlow :industry-leaf-id="activeLeafId" />
            </div>
          </section>

          <section id="ia-feature-region" class="ia2-panel anchor-target">
            <SectionHeading :title="`区域热力 · ${trackLabelShort}`">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 17l6-10 5 8 6-13v15H4z"
                  stroke="currentColor"
                  stroke-width="1.75"
                  fill="rgba(239,68,68,0.12)"
                />
              </svg>
            </SectionHeading>
            <p class="ia2-panel-lead">{{ iaFeaturePanelLead('ia-feature-region', activeLeafId) }}</p>
            <div class="ia2-viz ia2-viz--heatmap">
              <ChinaRegionHeatmap :visible="detailChartsVisible" :industry-leaf-id="activeLeafId" />
            </div>
          </section>

          <section id="ia-feature-policy" class="ia2-panel anchor-target">
            <SectionHeading :title="`产业政策 · ${trackLabelShort}`">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M6 4h11v14H9l-5 5V4zM9 9h8M9 13h8" stroke="currentColor" stroke-width="1.75" />
              </svg>
            </SectionHeading>
            <p class="ia2-panel-lead">{{ iaFeaturePanelLead('ia-feature-policy', activeLeafId) }}</p>
            <ul class="ia2-policy-list">
              <li v-for="(row, i) in policyRowsForTrack" :key="i" class="ia2-policy-row">
                <a class="ia2-policy-link" :href="row.url" target="_blank" rel="noopener noreferrer">{{
                  row.title
                }}</a>
                <div class="ia2-policy-meta">
                  <span class="ia2-policy-src">{{ row.source }}</span>
                  <time class="ia2-policy-date" :datetime="row.date">{{ row.date }}</time>
                </div>
              </li>
            </ul>
          </section>

          <section id="ia-feature-finance" class="ia2-panel anchor-target">
            <SectionHeading :title="`投融资 · ${trackLabelShort}`">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  stroke="currentColor"
                  stroke-width="1.75"
                />
              </svg>
            </SectionHeading>
            <p class="ia2-panel-lead">{{ iaFeaturePanelLead('ia-feature-finance', activeLeafId) }}</p>
            <div class="ia2-finance-wrap">
              <ul class="ia2-finance-list">
                <li v-for="(row, i) in financingRowsForTrack" :key="i" class="ia2-finance-card">
                  <div class="ia2-finance-top">
                    <span class="ia2-finance-round">{{ row.round }}</span>
                    <time class="ia2-finance-date" :datetime="row.date">{{ row.date }}</time>
                  </div>
                  <p class="ia2-finance-amount">{{ row.amount }}</p>
                  <p class="ia2-finance-investors">{{ row.investors }}</p>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ia2 {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  background: #eef2f6;
  color: var(--db-text);
}

.ia2-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 20px 12px 22px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.8) inset;
}

.ia2-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
  min-width: 0;
}

.ia2-logo {
  border-radius: 10px;
  flex-shrink: 0;
}

.ia2-brand-txt {
  font-size: 15px;
  font-weight: 600;
  color: var(--db-brand);
  letter-spacing: 0.02em;
}

.ia2-top-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}

.ia2-page-head {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid #e2e8f0;
}

.ia2-page-head-inner {
  display: flex;
  align-items: stretch;
  gap: 16px;
  padding: 18px 22px 20px;
  max-width: 1600px;
  margin: 0 auto;
}

.ia2-page-head-accent {
  width: 4px;
  flex-shrink: 0;
  border-radius: 4px;
  background: linear-gradient(180deg, #059669 0%, #006c4d 55%, #0f766e 100%);
  box-shadow: 0 2px 8px rgba(0, 108, 77, 0.28);
}

.ia2-page-head-text {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.ia2-page-head-title {
  margin: 0;
  font-size: clamp(20px, 2.4vw, 26px);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #0f172a;
  line-height: 1.2;
}

.ia2-page-head-sub {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  letter-spacing: 0.01em;
}

.ia2-body {
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  width: 100%;
  max-width: none;
  margin: 0;
  gap: 0;
  align-items: stretch;
  min-height: 0;
}

@media (min-width: 1024px) {
  .ia2-body {
    grid-template-columns: 280px minmax(0, 1fr);
  }
}

.ia2-aside {
  position: sticky;
  top: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 12px 16px;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
  box-sizing: border-box;
  min-height: 0;
}

.ia2-aside-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
  padding-right: 2px;
}

.ia2-aside-scroll::-webkit-scrollbar {
  width: 6px;
}

.ia2-aside-scroll::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.35);
  border-radius: 999px;
}

.ia2-aside-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(71, 85, 105, 0.5);
}

@media (max-width: 1023px) {
  .ia2-aside-scroll {
    max-height: min(52vh, 460px);
  }
}

@media (min-width: 1024px) {
  .ia2-aside {
    position: sticky;
    top: 0;
    align-self: stretch;
    min-height: calc(100svh - 168px);
    max-height: calc(100svh - 168px);
    overflow: hidden;
    border-bottom: none;
    border-right: 1px solid #e2e8f0;
    padding: 18px 10px 16px 14px;
  }

  .ia2-aside-scroll {
    flex: 1 1 auto;
    max-height: none;
  }
}

.ia2-nav-card {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 12px;
  padding: 14px 10px 12px;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 8px 24px -12px rgba(15, 23, 42, 0.08);
}

.ia2-back-overview {
  display: block;
  width: 100%;
  margin: 0 0 12px;
  padding: 8px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  font-size: 13px;
  font-weight: 600;
  color: #006c4d;
  cursor: pointer;
  text-align: left;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.ia2-back-overview:hover {
  background: #ecfdf5;
  border-color: #a7f3d0;
}

.ia2-current-track {
  margin: 0 4px 14px;
  padding: 10px 12px;
  border-radius: 10px;
  background: linear-gradient(90deg, rgba(0, 108, 77, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%);
  border: 1px solid rgba(0, 108, 77, 0.12);
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.4;
}

.ia2-nav-group-title {
  margin: 0 0 10px;
  padding: 0 4px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #64748b;
}

.ia2-nav-hint {
  margin: -4px 4px 10px;
  font-size: 11px;
  line-height: 1.45;
  color: #94a3b8;
}

.ia2-feature-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ia2-feature-link {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 10px 10px;
  border: none;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: inherit;
  transition:
    background 0.15s ease,
    box-shadow 0.15s ease;
}

.ia2-feature-link:hover {
  background: #f8fafc;
}

.ia2-feature-link.is-active {
  background: linear-gradient(90deg, rgba(0, 108, 77, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%);
  box-shadow: inset 3px 0 0 #006c4d;
}

.ia2-feature-indicator {
  width: 6px;
  height: 6px;
  margin-top: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  background: #cbd5e1;
  transition: background 0.15s ease;
}

.ia2-feature-link.is-active .ia2-feature-indicator {
  background: #006c4d;
  box-shadow: 0 0 0 3px rgba(0, 108, 77, 0.2);
}

.ia2-feature-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ia2-feature-label {
  font-size: 13px;
  font-weight: 650;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.ia2-feature-desc {
  font-size: 11px;
  color: #64748b;
  line-height: 1.35;
}

.ia2-back-home {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 4px 2px 0;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  text-decoration: none;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.ia2-back-home:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #006c4d;
}

@media (min-width: 1024px) {
  .ia2-aside .ia2-back-home {
    display: flex;
    align-self: stretch;
    margin-top: auto;
    margin-left: 4px;
    margin-right: 4px;
    margin-bottom: 0;
  }
}

.ia2-back-ico {
  opacity: 0.85;
}

.ia2-main {
  padding: 18px 16px 48px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: #eef2f6;
}

@media (min-width: 1024px) {
  .ia2-main {
    padding: 24px 28px 56px 24px;
    gap: 22px;
  }
}

.anchor-target {
  scroll-margin-top: 20px;
}

.ia2-detail-wrap > .ia2-panel.anchor-target {
  scroll-margin-top: 28px;
  scroll-margin-bottom: 12px;
}

.ia2-panel {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 14px;
  padding: 20px 20px 22px;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 12px 40px -20px rgba(15, 23, 42, 0.1);
}

.ia2-detail-wrap {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ia2-track-strip {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px 20px;
  padding: 16px 20px;
  border-radius: 14px;
  border: 1px solid rgba(0, 108, 77, 0.18);
  background: linear-gradient(105deg, #ffffff 0%, #ecfdf5 55%, #f0fdf4 100%);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}

.ia2-track-strip-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #047857;
  margin-bottom: 4px;
}

.ia2-track-strip-title {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.02em;
  line-height: 1.35;
}

.ia2-track-strip-meta {
  margin: 0;
  font-size: 13px;
  color: #475569;
  line-height: 1.45;
}

.ia2-track-strip-meta strong {
  color: #006c4d;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.ia2-panel-lead {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.55;
  color: #64748b;
}

/* 预留：主内容区若复用平铺网格时的默认栅格 */
.ia2-overview-flat:not(.ia2-overview-flat--sidebar) {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(158px, 1fr));
  gap: 10px;
  margin: 0 0 24px;
}

/** 左侧栏：单列通栏列表（非双列网格） */
.ia2-overview-flat--sidebar {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
}

.ia2-overview-flat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fafbfc;
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: inherit;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}

.ia2-overview-flat--sidebar .ia2-overview-flat-item {
  padding: 11px 12px 11px 13px;
  border-radius: 10px;
  border-color: #e8ecf0;
  background: #ffffff;
}

.ia2-overview-flat-item:hover {
  border-color: #a7f3d0;
  background: #ffffff;
}

.ia2-overview-flat--sidebar .ia2-overview-flat-item:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.ia2-overview-flat-item.is-active {
  border-color: #059669;
  background: linear-gradient(165deg, #ecfdf5 0%, #ffffff 65%);
  box-shadow: 0 0 0 1px rgba(5, 150, 105, 0.22);
}

.ia2-overview-flat--sidebar .ia2-overview-flat-item.is-active {
  border-color: rgba(0, 108, 77, 0.35);
  background: linear-gradient(90deg, rgba(0, 108, 77, 0.09) 0%, #ffffff 72%);
  box-shadow: inset 3px 0 0 #006c4d;
}

.ia2-overview-flat-name {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.35;
}

.ia2-overview-flat--sidebar .ia2-overview-flat-name {
  font-size: 13px;
  font-weight: 650;
  line-height: 1.4;
}

.ia2-overview-flat-stat {
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  font-variant-numeric: tabular-nums;
}

.ia2-overview-flat--sidebar .ia2-overview-flat-stat {
  font-size: 11px;
  line-height: 1.4;
  color: #94a3b8;
}

.ia2-overview-groups {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.ia2-overview-placeholder {
  margin: 8px 0 0;
  padding: 28px 20px;
  text-align: center;
  font-size: 14px;
  line-height: 1.6;
  color: #94a3b8;
  background: #f8fafc;
  border: 1px dashed #e2e8f0;
  border-radius: 12px;
}

.ia2-viz {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fafbfc;
  padding: 8px;
  min-height: 280px;
}

.ia2-viz--tall {
  min-height: 360px;
}

.ia2-viz--heatmap {
  min-height: 420px;
}

.ia2-key-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.ia2-key-chip {
  appearance: none;
  margin: 0;
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid #a7f3d0;
  background: linear-gradient(180deg, #ffffff 0%, #ecfdf5 100%);
  color: #065f46;
  box-shadow: 0 1px 2px rgba(0, 108, 77, 0.06);
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease;
}

.ia2-key-chip:hover {
  border-color: #006c4d;
  background: #d1fae5;
  color: #064e3b;
  transform: translateY(-1px);
}

.ia2-policy-list {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
}

.ia2-policy-row {
  padding: 14px 0;
  border-bottom: 1px solid #f1f5f9;
}

.ia2-policy-row:last-child {
  border-bottom: none;
}

.ia2-policy-link {
  display: inline-block;
  font-size: 14px;
  font-weight: 600;
  color: #006c4d;
  text-decoration: none;
  line-height: 1.5;
}

.ia2-policy-link:hover {
  text-decoration: underline;
  color: #005239;
}

.ia2-policy-meta {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 12px;
  color: #64748b;
}

.ia2-policy-date {
  flex-shrink: 0;
  color: #94a3b8;
}

.ia2-finance-wrap {
  padding: 4px 0 2px;
}

.ia2-finance-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ia2-finance-card {
  margin: 0;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #eef2f6;
  border-left: 4px solid #006c4d;
  background: linear-gradient(105deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.ia2-finance-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.ia2-finance-round {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #006c4d;
}

.ia2-finance-date {
  font-size: 11px;
  color: #94a3b8;
}

.ia2-finance-amount {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
  margin: 0 0 8px;
}

.ia2-finance-investors {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: #475569;
}

.ia2-stream-block {
  margin-bottom: 28px;
  scroll-margin-top: 24px;
}

.ia2-stream-block:last-child {
  margin-bottom: 0;
}

.ia2-stream-head {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(0, 108, 77, 0.18);
}

.ia2-stream-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 10px 14px;
  margin-bottom: 6px;
}

.ia2-stream-title {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: var(--db-brand);
}

.ia2-stream-chip {
  font-size: 11px;
  font-weight: 600;
  color: var(--db-primary-dark);
  padding: 3px 10px;
  background: rgba(0, 108, 77, 0.08);
  border: 1px solid rgba(0, 108, 77, 0.12);
  border-radius: 999px;
}

.ia2-stream-sum {
  margin: 0;
  font-size: 13px;
  color: var(--db-muted);
}

.ia2-stream-sum strong {
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.ia2-table {
  display: flex;
  flex-direction: column;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1px 4px rgba(15, 45, 56, 0.05);
}

.ia2-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 12px 16px;
  padding: 12px 16px;
  border: none;
  border-bottom: 1px solid #f1f5f9;
  background: transparent;
  font: inherit;
  color: inherit;
  text-align: left;
  transition: background 0.12s ease;
}

.ia2-row:last-child {
  border-bottom: none;
}

.ia2-row--pick {
  cursor: pointer;
}

.ia2-row--pick:hover {
  background: #f8fcfa;
}

.ia2-row--pick:focus-visible {
  outline: 2px solid #006c4d;
  outline-offset: -2px;
  z-index: 1;
}

.ia2-row-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--db-text);
}

.ia2-row-num {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}

.ia2-row-value {
  font-size: 18px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  color: var(--db-primary);
}

.ia2-row-unit {
  font-size: 12px;
  font-weight: 600;
  color: var(--db-muted);
}

.ia2-row-action {
  font-size: 12px;
  font-weight: 700;
  color: #006c4d;
  white-space: nowrap;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .ia2-row {
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
  }

  .ia2-row-action {
    grid-column: 1 / -1;
    justify-self: end;
    margin-top: -4px;
  }
}
</style>
