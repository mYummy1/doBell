<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AdvancedFilterModal from '../components/AdvancedFilterModal.vue'
import TagFilterModal from '../components/TagFilterModal.vue'
import AuthGuestBar from '../components/AuthGuestBar.vue'
import UserMenuDropdown from '../components/UserMenuDropdown.vue'
import { useAuth } from '../composables/useAuth'
import { SEARCH_HISTORY_DATALIST_ID, useSearchHistory } from '../composables/useSearchHistory'

const router = useRouter()
const route = useRoute()
const { isLoggedIn } = useAuth()
const { history: searchHistory, rememberQuery } = useSearchHistory()

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
        <span class="brand-title">笃北科技-企业AI智能体数据平台</span>
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
        输入企业名称，获取工商信息、司法风险、产业链深度分析
      </p>

      <form class="search-form" @submit.prevent="onSearch">
        <div class="search-shell">
          <input
            v-model="query"
            type="search"
            class="search-input"
            :list="SEARCH_HISTORY_DATALIST_ID"
            placeholder="企业名称/统一社会信用代码/股东姓名"
            autocomplete="organization"
            enterkeyhint="search"
          />
          <datalist :id="SEARCH_HISTORY_DATALIST_ID">
            <option v-for="(item, idx) in searchHistory" :key="idx" :value="item" />
          </datalist>
          <button type="submit" class="search-btn">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
              <path d="M20 20l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            查询
          </button>
        </div>
      </form>

      <div class="hero-actions" role="navigation">
        <div class="hero-actions-grid">
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

          <button type="button" class="hero-action-card" @click="openFilter">
            <span class="hero-action-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 5h16l-6.2 7.4V20l-3.6 1.8v-9.4L4 5z"
                  stroke="currentColor"
                  stroke-width="1.85"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <span class="hero-action-main">
              <span class="hero-action-title">高级筛选</span>
              <span class="hero-action-desc">多条件组合检索企业</span>
            </span>
            <svg class="hero-action-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          <button type="button" class="hero-action-card" @click="openTagFilter">
            <span class="hero-action-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 5.5h7l2 3 2-3h5a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1v-12a1 1 0 011-1z"
                  stroke="currentColor"
                  stroke-width="1.85"
                  stroke-linejoin="round"
                />
                <path d="M9 11h6M9 15h4" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" />
              </svg>
            </span>
            <span class="hero-action-main">
              <span class="hero-action-title">企业标签管理</span>
              <span class="hero-action-desc">行业 · 认定 · 纳税与海关 · 招投标 · 资本背景</span>
            </span>
            <svg class="hero-action-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

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
              <span class="hero-action-title">供应链分析</span>
              <span class="hero-action-desc">上下游与集中度洞察</span>
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
  margin: 0 0 40px;
  max-width: 520px;
  font-size: 15px;
  color: var(--db-muted);
  line-height: 1.65;
}

.search-form {
  width: 100%;
  max-width: 720px;
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

.search-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  font-size: 15px;
  color: var(--db-text);
  outline: none;
  padding: 12px 0;
  user-select: text;
  -webkit-user-select: text;
}

.search-input::placeholder {
  color: var(--db-placeholder);
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
