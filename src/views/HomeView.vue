<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AdvancedFilterModal from '../components/AdvancedFilterModal.vue'
import CompanySearchInput from '../components/CompanySearchInput.vue'
import TagFilterModal from '../components/TagFilterModal.vue'
import AuthGuestBar from '../components/AuthGuestBar.vue'
import UserMenuDropdown from '../components/UserMenuDropdown.vue'
import { useAuth } from '../composables/useAuth'
import { useSearchHistory } from '../composables/useSearchHistory'

const router = useRouter()
const route = useRoute()
const { isLoggedIn } = useAuth()
const { rememberQuery } = useSearchHistory()

const faviconUrl = `${import.meta.env.BASE_URL}favicon.svg`

/** 首页主标题（拆字做入场动画） */
const HEADLINE_TEXT = '洞察企业万象 · 赋能产业决策'
const headlineChars = [...HEADLINE_TEXT]

/** 标题周围装饰粒子（位置与漂移由脚本固定，避免 hydration 差异） */
const headlineParticles = Array.from({ length: 28 }, (_, i) => {
  const angle = (i * 2.17) % (Math.PI * 2)
  const r = 10 + (i % 6) * 5
  return {
    key: i,
    x: 3 + ((i * 37) % 94),
    y: 2 + ((i * 59) % 90),
    delay: (i * 0.11) % 4.2,
    size: 1.8 + (i % 5) * 1.15,
    duration: 3.2 + (i % 8) * 0.42,
    dx: Math.round(Math.cos(angle) * r),
    dy: Math.round(Math.sin(angle) * r * -1),
  }
})

const query = ref('')

const filterOpen = ref(false)
const tagFilterOpen = ref(false)

function openTagFilter() {
  tagFilterOpen.value = true
}

function goToCompanyDetail(companyName: string) {
  const q = companyName.trim()
  if (!q) return
  rememberQuery(q)
  router.push({ name: 'company-detail', query: { q }, hash: '' })
}

function onSearch() {
  const q = query.value.trim()
  if (!q) return
  goToCompanyDetail(q)
}

function openFilter() {
  filterOpen.value = true
}

function consumeOpenFilterQuery() {
  if (route.query.openFilter === '1') {
    filterOpen.value = true
    router.replace({ path: '/', query: {} })
  }
}

onMounted(consumeOpenFilterQuery)
watch(() => route.query.openFilter, consumeOpenFilterQuery)
</script>

<template>
  <div class="page">
    <header class="header">
      <div class="brand">
        <img
          class="brand-logo"
          :src="faviconUrl"
          alt=""
          width="40"
          height="40"
        />
        <span class="brand-title">灵枢数据一体化平台</span>
      </div>

      <AuthGuestBar v-if="!isLoggedIn" />
      <UserMenuDropdown v-else />
    </header>

    <main class="hero">
      <h1 class="headline" :aria-label="HEADLINE_TEXT">
        <span class="headline__wrap">
          <span class="headline__particles" aria-hidden="true">
            <span
              v-for="p in headlineParticles"
              :key="p.key"
              class="headline__particle"
              :style="{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                '--dx': `${p.dx}px`,
                '--dy': `${p.dy}px`,
                animationDelay: `${p.delay}s, ${(p.delay * 0.65).toFixed(2)}s`,
                animationDuration: `${p.duration}s, ${(p.duration * 0.72).toFixed(2)}s`,
              }"
            />
          </span>
          <span class="headline__track">
            <span
              v-for="(ch, i) in headlineChars"
              :key="i"
              class="headline__ch"
              :style="{ '--i': String(i) }"
            >{{ ch }}</span>
          </span>
        </span>
      </h1>
      <p class="subhead">
        一查主体脉络 · 纵观产业纵深
      </p>

      <div class="search-hub" aria-label="企业检索">
        <form class="search-form search-form--hub" @submit.prevent="onSearch">
          <div class="search-shell">
            <CompanySearchInput v-model="query" variant="hero" />
            <button type="submit" class="search-btn">
              <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
                <path d="M20 20l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
              查询
            </button>
          </div>
        </form>
        <div class="search-hub-tools" role="toolbar" aria-label="更多检索方式">
          <button
            type="button"
            class="search-hub-chip"
            title="多条件组合定位企业"
            @click="openFilter"
          >
            <svg class="search-hub-chip-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 5h14l-5.4 6.5V19l-3.2 1.6v-8.1L5 5z"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linejoin="round"
              />
            </svg>
            <span class="search-hub-chip-label">高级筛选</span>
          </button>
          <button
            type="button"
            class="search-hub-chip"
            title="行业 · 资质 · 资本与招投标等多维标签"
            @click="openTagFilter"
          >
            <svg class="search-hub-chip-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 6h6l1.5 2.5L13 6h7a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z"
                stroke="currentColor"
                stroke-width="1.65"
                stroke-linejoin="round"
              />
              <path d="M9 11h6M9 14.5h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            <span class="search-hub-chip-label">企业标签管理</span>
          </button>
        </div>
      </div>

      <div class="hero-actions" role="navigation">
        <div class="hero-actions-grid">
          <RouterLink :to="{ name: 'enterprise-graph' }" class="hero-action-card">
            <span class="hero-action-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="7" cy="10" r="2.5" stroke="currentColor" stroke-width="1.75" />
                <circle cx="17" cy="7" r="2.5" stroke="currentColor" stroke-width="1.75" />
                <circle cx="15" cy="17" r="2.5" stroke="currentColor" stroke-width="1.75" />
                <path
                  d="M9.1 11.4l5.8-3M12.2 11.6l1.8 4.2M9.4 11.8l4.6 4.4"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <span class="hero-action-main">
              <span class="hero-action-title">企业图谱</span>
              <span class="hero-action-desc">投资任职与多源关系可视化</span>
            </span>
            <svg class="hero-action-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </RouterLink>

          <RouterLink :to="{ name: 'park-map' }" class="hero-action-card">
            <span class="hero-action-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5.5 9.5l6.5-4 6.5 4v9.5a1.5 1.5 0 01-1.5 1.5H7a1.5 1.5 0 01-1.5-1.5V9.5z"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linejoin="round"
                />
                <path
                  d="M10 21V12h4v9M8 8.2L12 5.5l4 2.7"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <span class="hero-action-main">
              <span class="hero-action-title">园区地图</span>
              <span class="hero-action-desc">片区边界与企业空间分布</span>
            </span>
            <svg class="hero-action-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </RouterLink>

          <RouterLink :to="{ name: 'related-party-screening' }" class="hero-action-card">
            <span class="hero-action-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="8" cy="9" r="3.25" stroke="currentColor" stroke-width="1.75" />
                <circle cx="16" cy="8" r="2.75" stroke="currentColor" stroke-width="1.75" />
                <circle cx="14" cy="16" r="2.75" stroke="currentColor" stroke-width="1.75" />
                <path
                  d="M10.2 11.1l3.6 2.1M15.1 10.3l-1.1 4.2M9.4 11.8l3.2 3.4"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <span class="hero-action-main">
              <span class="hero-action-title">关联方排查</span>
              <span class="hero-action-desc">股权穿透与人员、交易关联网络</span>
            </span>
            <svg class="hero-action-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </RouterLink>

          <RouterLink :to="{ name: 'business-anomaly-alert' }" class="hero-action-card">
            <span class="hero-action-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 4.5L4 19h16L12 4.5z"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linejoin="round"
                />
                <path d="M12 9v5M12 16.5v.01" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" />
              </svg>
            </span>
            <span class="hero-action-main">
              <span class="hero-action-title">经营异常预警</span>
              <span class="hero-action-desc">公示异常、处罚与司法信号归集</span>
            </span>
            <svg class="hero-action-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </RouterLink>

          <RouterLink :to="{ name: 'historical-change-trace' }" class="hero-action-card">
            <span class="hero-action-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 5v4h4M19 19v-4h-4"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M5 9a7 7 0 0112.9-3.1M19 15a7 7 0 01-12.9 3.1"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                />
                <circle cx="12" cy="12" r="1.6" fill="currentColor" />
              </svg>
            </span>
            <span class="hero-action-main">
              <span class="hero-action-title">历史变更追溯</span>
              <span class="hero-action-desc">工商与证照变更时间线还原</span>
            </span>
            <svg class="hero-action-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </RouterLink>

          <RouterLink :to="{ name: 'financing-event-track' }" class="hero-action-card">
            <span class="hero-action-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 17V7h16v10H4z"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linejoin="round"
                />
                <path d="M8 11h8M8 14h5" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" />
                <path
                  d="M15 4.5v3M13.5 6h3"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <span class="hero-action-main">
              <span class="hero-action-title">融资事件追踪</span>
              <span class="hero-action-desc">股权融资、并购与债券公开披露</span>
            </span>
            <svg class="hero-action-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </RouterLink>

          <RouterLink :to="{ name: 'industry-analysis' }" class="hero-action-card">
            <span class="hero-action-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 19V5M12 19V9M20 19v-7" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" />
                <path d="M2 21h20" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" />
              </svg>
            </span>
            <span class="hero-action-main">
              <span class="hero-action-title">产业分析</span>
              <span class="hero-action-desc">战略新兴产业与赛道分布</span>
            </span>
            <svg class="hero-action-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </RouterLink>

          <RouterLink :to="{ name: 'supply-chain-analysis' }" class="hero-action-card">
            <span class="hero-action-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14 18V8H4v10M14 18h4l3-4v-4h-4M14 18H4M8 18a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <span class="hero-action-main">
              <span class="hero-action-title">供应链洞察</span>
              <span class="hero-action-desc">上下游与集中度透视</span>
            </span>
            <svg class="hero-action-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </RouterLink>
        </div>
      </div>
    </main>

    <AdvancedFilterModal v-model:open="filterOpen" @select="goToCompanyDetail" />
    <TagFilterModal v-model:open="tagFilterOpen" @select="goToCompanyDetail" />
  </div>
</template>

<style scoped>
.page {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100svh;
  background: #fff;
  user-select: none;
  -webkit-user-select: none;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 40px;
  gap: 24px;
}

@media (max-width: 768px) {
  .header {
    padding: 12px 16px;
  }

  .brand-title {
    font-size: 13px;
    max-width: min(55vw, 220px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.brand-logo {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: block;
}

.brand-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--db-brand);
  letter-spacing: 0.02em;
}

.hero {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 24px 80px;
  text-align: center;
}

.headline {
  margin: 0 0 16px;
  font-size: clamp(26px, 4.2vw, 40px);
  font-weight: 800;
  line-height: 1.45;
  perspective: 900px;
}

.headline__wrap {
  position: relative;
  display: inline-block;
  padding: 0.35em 0.5em 0.45em;
  max-width: 100%;
  isolation: isolate;
}

.headline__particles {
  position: absolute;
  inset: -28% -8% -32% -8%;
  z-index: 0;
  pointer-events: none;
  overflow: visible;
}

.headline__particle {
  position: absolute;
  margin: 0;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    circle at 32% 28%,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(200, 255, 240, 0.55) 22%,
    rgba(0, 108, 77, 0.65) 48%,
    rgba(26, 62, 76, 0.2) 72%,
    transparent 78%
  );
  box-shadow:
    0 0 10px rgba(18, 163, 130, 0.55),
    0 0 22px rgba(0, 108, 77, 0.25);
  animation-name: headline-pt-drift, headline-pt-pulse;
  animation-timing-function: ease-in-out, ease-in-out;
  animation-iteration-count: infinite, infinite;
  opacity: 0.75;
}

.headline__track {
  position: relative;
  z-index: 2;
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0;
  letter-spacing: 0.06em;
  animation:
    headline-track-float 5.5s ease-in-out infinite,
    headline-track-glow 3.8s ease-in-out infinite;
  animation-delay: 0.85s, 0.85s;
}

.headline__ch {
  display: inline-block;
  transform-origin: 50% 80%;
  background: linear-gradient(118deg, #1a3e4c 0%, #0d5c48 32%, #006c4d 55%, #12a382 78%, #0a8f6a 100%);
  background-size: 220% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  will-change: transform, opacity, filter;
  animation:
    headline-char-in 0.85s cubic-bezier(0.22, 0.95, 0.36, 1) both,
    headline-shimmer 9s ease-in-out infinite;
  animation-delay:
    calc(0.06s + var(--i) * 0.045s),
    calc(0.35s + var(--i) * 0.035s);
}

@keyframes headline-char-in {
  0% {
    opacity: 0;
    transform: translate3d(0, 0.65em, 0) rotateX(-82deg) scale(0.72);
    filter: blur(10px);
  }
  55% {
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) rotateX(0deg) scale(1);
    filter: blur(0);
  }
}

@keyframes headline-shimmer {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes headline-track-float {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, -3px, 0);
  }
}

@keyframes headline-track-glow {
  0%,
  100% {
    filter: drop-shadow(0 2px 14px rgba(0, 108, 77, 0.18)) drop-shadow(0 0 0 transparent);
  }
  50% {
    filter: drop-shadow(0 4px 22px rgba(0, 108, 77, 0.32)) drop-shadow(0 0 28px rgba(18, 163, 130, 0.15));
  }
}

@keyframes headline-pt-drift {
  0%,
  100% {
    transform: translate(-50%, -50%) translate(0, 0);
  }
  50% {
    transform: translate(-50%, -50%) translate(var(--dx, 6px), var(--dy, -10px));
  }
}

@keyframes headline-pt-pulse {
  0%,
  100% {
    opacity: 0.35;
    filter: blur(0.2px);
    box-shadow:
      0 0 6px rgba(18, 163, 130, 0.35),
      0 0 14px rgba(0, 108, 77, 0.15);
  }
  45% {
    opacity: 1;
    filter: blur(0);
    box-shadow:
      0 0 14px rgba(18, 163, 130, 0.75),
      0 0 28px rgba(0, 108, 77, 0.35);
  }
  70% {
    opacity: 0.65;
  }
}

@media (prefers-reduced-motion: reduce) {
  .headline__particles {
    display: none;
  }

  .headline__track {
    animation: none;
  }

  .headline__ch {
    animation: none;
    opacity: 1;
    transform: none;
    filter: none;
    background-position: 50% 50%;
  }
}

.subhead {
  margin: 0 0 28px;
  max-width: 560px;
  font-size: 15px;
  color: var(--db-muted);
  line-height: 1.7;
}

.search-hub {
  width: 100%;
  max-width: 720px;
  border-radius: 18px;
  background: #fff;
  border: 1px solid rgba(26, 62, 76, 0.08);
  box-shadow: var(--db-shadow);
  overflow: hidden;
}

.search-form {
  width: 100%;
  max-width: 720px;
}

.search-form--hub {
  max-width: none;
  padding: 10px 10px 6px;
}

.search-shell {
  display: flex;
  align-items: stretch;
  background: #fff;
  border-radius: 999px;
  box-shadow: var(--db-shadow);
  padding: 6px 6px 6px 22px;
  gap: 8px;
  border: 1px solid rgba(26, 62, 76, 0.06);
}

.search-hub .search-shell {
  box-shadow: none;
  border-color: rgba(26, 62, 76, 0.07);
  background: #f9fbfa;
}

.search-hub-tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px 14px;
  padding: 6px 10px 8px;
}

.search-hub-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px 8px 12px;
  border: 1px solid rgba(26, 62, 76, 0.16);
  border-radius: 999px;
  background: transparent;
  color: rgba(26, 62, 76, 0.88);
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.01em;
  cursor: pointer;
  box-shadow: none;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
}

.search-hub-chip:hover {
  color: var(--db-brand);
  border-color: rgba(0, 108, 77, 0.38);
}

.search-hub-chip:active {
  transform: scale(0.99);
}

.search-hub-chip:focus-visible {
  outline: 2px solid var(--db-primary);
  outline-offset: 2px;
}

.search-hub-chip-icon {
  flex-shrink: 0;
  color: rgba(0, 108, 77, 0.52);
  transition: color 0.2s ease;
}

.search-hub-chip:hover .search-hub-chip-icon {
  color: var(--db-primary);
}

.search-hub-chip-label {
  line-height: 1.25;
}

@media (max-width: 560px) {
  .search-hub-tools {
    padding: 6px 8px 7px;
    gap: 6px 12px;
  }

  .search-hub-chip {
    padding: 7px 12px 7px 10px;
    font-size: 14px;
  }
}

.search-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 22px;
  border: none;
  border-radius: 999px;
  background: var(--db-primary-dark);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s,
    transform 0.15s;
}

.search-btn:hover {
  background: var(--db-primary-darker);
}

.search-btn:active {
  transform: scale(0.98);
}

.search-icon {
  flex-shrink: 0;
}

.hero-actions {
  margin-top: 22px;
  width: 100%;
  max-width: 1000px;
  padding: 0 8px;
}

.hero-actions-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.hero-actions-head-title {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(26, 62, 76, 0.45);
}

.hero-actions-head-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(0, 108, 77, 0.18) 0%,
    rgba(26, 62, 76, 0.06) 55%,
    transparent 100%
  );
}

.hero-actions-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  padding: 14px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(26, 62, 76, 0.08);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.9) inset,
    0 8px 28px rgba(26, 62, 76, 0.06);
}

.hero-action-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  min-height: 72px;
  padding: 12px 12px 12px 10px;
  border-radius: 12px;
  border: 1px solid rgba(26, 62, 76, 0.08);
  background: linear-gradient(165deg, #ffffff 0%, #f7faf9 100%);
  color: var(--db-text);
  text-decoration: none;
  text-align: left;
  font: inherit;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease,
    background 0.2s ease;
}

button.hero-action-card {
  width: 100%;
}

.hero-action-card:hover {
  border-color: rgba(0, 108, 77, 0.22);
  box-shadow: 0 6px 20px rgba(0, 82, 57, 0.1);
  transform: translateY(-1px);
  background: linear-gradient(165deg, #ffffff 0%, #f0f7f4 100%);
}

.hero-action-card:active {
  transform: translateY(0);
}

.hero-action-card:focus-visible {
  outline: 2px solid var(--db-primary);
  outline-offset: 2px;
}

.hero-action-icon {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(145deg, var(--db-brand) 0%, var(--db-primary) 72%, #0a8f6a 100%);
  box-shadow: 0 4px 12px rgba(0, 108, 77, 0.28);
}

.hero-action-icon svg {
  display: block;
}

.hero-action-main {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.hero-action-title {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--db-brand);
}

.hero-action-desc {
  font-size: 12px;
  font-weight: 500;
  color: var(--db-muted);
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero-action-arrow {
  flex-shrink: 0;
  color: rgba(26, 62, 76, 0.28);
  transition: color 0.2s ease, transform 0.2s ease;
}

.hero-action-card:hover .hero-action-arrow {
  color: var(--db-primary);
  transform: translateX(2px);
}

@media (max-width: 960px) {
  .hero-actions-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .hero-actions {
    margin-top: 18px;
  }

  .hero-actions-grid {
    padding: 12px;
    gap: 8px;
  }

  .hero-action-card {
    min-height: 64px;
    gap: 10px;
    padding: 10px 10px 10px 8px;
  }

  .hero-action-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
  }

  .hero-action-desc {
    display: none;
  }
}
</style>
