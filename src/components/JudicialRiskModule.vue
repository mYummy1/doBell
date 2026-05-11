<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  optionsForJudicialFilter,
  type JudicialRiskModuleDef,
  type JudicialTableSpec,
} from '../data/judicialRiskCatalog'

const props = defineProps<{
  config: JudicialRiskModuleDef
  /** 有数据时渲染表格 */
  table?: JudicialTableSpec | null
}>()

const activeTabIndex = ref(0)
const keyword = ref('')
/** 与各筛选项一一对应，默认「全部」 */
const filterSelections = ref<string[]>([])

watch(
  () => props.config.filters,
  (filters) => {
    filterSelections.value = filters.map(() => '全部')
  },
  { immediate: true }
)

const showEmpty = computed(() => !props.table?.rows?.length)

const displayTable = computed(() =>
  props.table?.rows?.length ? props.table : null
)

function tabCount(i: number): number {
  return props.config.tabs[i]?.count ?? 0
}
</script>

<template>
  <article class="jr-mod" :aria-labelledby="`jr-title-${config.key}`">
    <div class="jr-shell">
      <header class="jr-head">
        <div class="jr-head-main">
          <span class="jr-head-accent" aria-hidden="true" />
          <div class="jr-head-text">
            <h3 :id="`jr-title-${config.key}`" class="jr-title">{{ config.title }}</h3>
            <span class="jr-count-chip" aria-label="条数">{{ config.headerCount }}</span>
          </div>
        </div>
      </header>

      <div class="jr-toolbar">
        <nav class="jr-tabs" aria-label="子分类">
          <button
            v-for="(tab, i) in config.tabs"
            :key="tab.id"
            type="button"
            class="jr-tab"
            :class="{ 'jr-tab--on': activeTabIndex === i }"
            @click="activeTabIndex = i"
          >
            <span class="jr-tab-label">{{ tab.label }}</span>
            <span class="jr-tab-num">{{ tabCount(i) }}</span>
          </button>
        </nav>
        <div class="jr-controls">
          <div v-for="(ph, fi) in config.filters" :key="fi" class="jr-field">
            <label class="jr-field-label" :for="`jr-${config.key}-filter-${fi}`">{{ ph }}</label>
            <select
              :id="`jr-${config.key}-filter-${fi}`"
              v-model="filterSelections[fi]"
              class="jr-select"
              :aria-label="`${ph}筛选`"
            >
              <option v-for="opt in optionsForJudicialFilter(ph)" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>
          <div class="jr-search">
            <input v-model="keyword" type="search" class="jr-search-input" placeholder="请输入关键词" enterkeyhint="search" />
            <button type="button" class="jr-search-btn" aria-label="搜索">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
                <path d="M20 20l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="jr-panel">
      <div v-if="showEmpty" class="jr-empty">
        <div class="jr-empty-visual" aria-hidden="true">
          <svg class="jr-empty-graphic" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient :id="`jr-empty-${config.key}`" x1="24" y1="20" x2="96" y2="92" gradientUnits="userSpaceOnUse">
                <stop stop-color="#ecfdf5" />
                <stop offset="1" stop-color="#d1fae5" />
              </linearGradient>
            </defs>
            <path
              d="M24 38l36-18 36 18v36l-36 18-36-18V38z"
              :fill="`url(#jr-empty-${config.key})`"
              stroke="rgba(0,108,77,0.28)"
              stroke-width="1.5"
            />
            <path d="M60 20v38M42 32l36 18" stroke="rgba(0,82,57,0.2)" stroke-width="1.25" />
            <path d="M34 52l52 26" stroke="rgba(0,108,77,0.22)" stroke-width="1" stroke-dasharray="4 3" />
          </svg>
        </div>
        <p class="jr-empty-txt">暂无相关数据</p>
      </div>
      <div v-else-if="displayTable" class="jr-table-wrap">
        <table class="jr-table">
          <thead>
            <tr>
              <th v-for="col in displayTable.columns" :key="col">{{ col }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, ri) in displayTable.rows" :key="ri">
              <td v-for="col in displayTable.columns" :key="col">{{ row[col] ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </div>
  </article>
</template>

<style scoped>
.jr-mod {
  --jr-accent: var(--db-primary-dark, #005239);
  --jr-accent-mid: var(--db-primary, #006c4d);
  --jr-muted: #64748b;
  --jr-line: rgba(26, 62, 76, 0.1);
  --jr-tint: rgba(0, 108, 77, 0.06);
  margin-bottom: 20px;
}

.jr-mod:last-child {
  margin-bottom: 0;
}

.jr-shell {
  border-radius: 14px;
  border: 1px solid var(--jr-line);
  background: linear-gradient(165deg, #ffffff 0%, #fafcfb 48%, #f6faf8 100%);
  box-shadow:
    0 1px 2px rgba(15, 45, 56, 0.04),
    0 12px 36px rgba(0, 82, 57, 0.05);
  overflow: hidden;
}

.jr-head {
  display: flex;
  align-items: center;
  padding: 18px 20px 14px;
  border-bottom: 1px solid rgba(232, 238, 240, 0.9);
}

.jr-head-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.jr-head-accent {
  width: 4px;
  height: 40px;
  border-radius: 4px;
  background: linear-gradient(180deg, var(--jr-accent-mid) 0%, var(--jr-accent) 100%);
  flex-shrink: 0;
}

.jr-head-text {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
  min-width: 0;
}

.jr-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--db-brand, #1a3e4c);
  letter-spacing: 0.03em;
  line-height: 1.25;
}

.jr-count-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 24px;
  padding: 0 8px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--jr-muted);
  background: rgba(100, 116, 139, 0.09);
}

.jr-toolbar {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 14px 18px;
  flex-wrap: wrap;
  padding: 14px 16px 16px;
  background: linear-gradient(180deg, rgba(248, 250, 249, 0.9) 0%, rgba(255, 255, 255, 0.35) 100%);
}

.jr-tabs {
  display: inline-flex;
  align-self: flex-start;
  padding: 4px;
  gap: 4px;
  border-radius: 11px;
  background: rgba(26, 62, 76, 0.06);
  border: 1px solid rgba(26, 62, 76, 0.06);
}

.jr-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  margin: 0;
  border: none;
  border-radius: 9px;
  background: transparent;
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  color: var(--jr-muted);
  cursor: pointer;
  transition:
    color 0.18s,
    background 0.18s,
    box-shadow 0.18s;
}

.jr-tab:hover {
  color: var(--db-text);
  background: rgba(255, 255, 255, 0.55);
}

.jr-tab--on {
  color: var(--jr-accent);
  font-weight: 700;
  background: #fff;
  box-shadow:
    0 1px 3px rgba(15, 45, 56, 0.06),
    0 0 0 1px rgba(0, 108, 77, 0.12);
}

.jr-tab-num {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  opacity: 0.85;
}

.jr-tab--on .jr-tab-num {
  opacity: 1;
}

.jr-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 12px;
  justify-content: flex-end;
  flex: 1;
  min-width: min(100%, 320px);
}

.jr-field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.jr-field-label {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
}

.jr-select {
  height: 36px;
  min-width: 100px;
  padding: 0 30px 0 12px;
  border: 1px solid var(--jr-line);
  border-radius: 10px;
  font-size: 13px;
  color: var(--db-text);
  background-color: #fff;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none'%3E%3Cpath d='M3 5l3 3 3-3' stroke='%2364748b' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  appearance: none;
  cursor: pointer;
  transition:
    border-color 0.18s,
    box-shadow 0.18s;
}

.jr-select:hover {
  border-color: rgba(0, 108, 77, 0.22);
}

.jr-select:focus {
  outline: none;
  border-color: rgba(0, 108, 77, 0.45);
  box-shadow: 0 0 0 3px rgba(0, 108, 77, 0.12);
}

.jr-search {
  display: flex;
  align-items: stretch;
  border: 1px solid var(--jr-line);
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  transition: box-shadow 0.18s;
}

.jr-search:focus-within {
  border-color: rgba(0, 108, 77, 0.35);
  box-shadow: 0 0 0 3px rgba(0, 108, 77, 0.1);
}

.jr-search-input {
  width: 128px;
  border: none;
  padding: 0 12px;
  font-size: 13px;
  outline: none;
  color: var(--db-text);
  background: transparent;
}

.jr-search-input::placeholder {
  color: var(--db-placeholder, #9ca3af);
}

@media (min-width: 720px) {
  .jr-search-input {
    width: 176px;
  }
}

.jr-search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  border: none;
  background: linear-gradient(145deg, var(--jr-accent-mid) 0%, var(--jr-accent) 100%);
  color: #fff;
  cursor: pointer;
  transition:
    filter 0.18s,
    transform 0.12s;
}

.jr-search-btn:hover {
  filter: brightness(1.06);
}

.jr-search-btn:active {
  transform: scale(0.97);
}

.jr-panel {
  margin: 0 16px 16px;
  min-height: 188px;
  border-radius: 12px;
  border: 1px dashed rgba(100, 116, 139, 0.22);
  background: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.jr-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px 44px;
  text-align: center;
}

.jr-empty-visual {
  margin-bottom: 14px;
}

.jr-empty-graphic {
  width: 108px;
  height: auto;
  display: block;
  opacity: 0.92;
}

.jr-empty-txt {
  margin: 0;
  font-size: 14px;
  color: var(--jr-muted);
}

.jr-table-wrap {
  overflow-x: auto;
  border-radius: 12px;
}

.jr-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.jr-table th,
.jr-table td {
  padding: 13px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(232, 238, 240, 0.95);
}

.jr-table th {
  font-weight: 600;
  color: #475569;
  background: linear-gradient(180deg, #f8faf9 0%, #f1f5f4 100%);
}

.jr-table tbody tr:last-child td {
  border-bottom: none;
}

.jr-table tbody tr:hover td {
  background: rgba(0, 108, 77, 0.03);
}

.jr-table td {
  color: var(--db-text);
}

@media (max-width: 640px) {
  .jr-head {
    padding: 16px 14px 12px;
  }

  .jr-toolbar {
    padding: 12px 12px 14px;
  }

  .jr-tabs {
    width: 100%;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .jr-controls {
    min-width: 100%;
    justify-content: stretch;
  }

  .jr-panel {
    margin: 0 12px 14px;
  }
}
</style>
