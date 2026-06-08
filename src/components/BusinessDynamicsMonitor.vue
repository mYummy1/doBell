<script setup lang="ts">
import { computed, ref } from 'vue'

export type BizDynamicsRow = {
  date: string
  type: string
  title: string
  detail?: string
  fields?: { label: string; value: string }[]
}

const props = defineProps<{
  items: BizDynamicsRow[]
}>()

const monitorEnabled = ref(true)
const activeCategory = ref('全部')
const keyword = ref('')

const categories = computed(() => {
  const types = new Set(props.items.map((r) => r.type))
  return ['全部', ...types]
})

const filteredItems = computed(() => {
  let rows = props.items
  if (activeCategory.value !== '全部') {
    rows = rows.filter((r) => r.type === activeCategory.value)
  }
  const kw = keyword.value.trim().toLowerCase()
  if (kw) {
    rows = rows.filter(
      (r) =>
        r.title.toLowerCase().includes(kw) ||
        r.type.toLowerCase().includes(kw) ||
        r.detail?.toLowerCase().includes(kw)
    )
  }
  return rows
})

const stats = computed(() => ({
  total: props.items.length,
  recent30: props.items.filter((r) => {
    const d = new Date(r.date)
    const now = new Date('2026-06-08')
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    return diff <= 30
  }).length,
  alert: props.items.filter((r) => r.type === '抽查检查' || r.fields?.some((f) => f.value === '撤销')).length,
}))
</script>

<template>
  <div class="bdm">
    <div class="bdm-toolbar" role="toolbar" aria-label="经营动态监控控制">
      <div class="bdm-stats">
        <span class="bdm-stat">
          <span class="bdm-stat-val">{{ stats.total }}</span>
          <span class="bdm-stat-label">累计动态</span>
        </span>
        <span class="bdm-stat">
          <span class="bdm-stat-val">{{ stats.recent30 }}</span>
          <span class="bdm-stat-label">近 30 天</span>
        </span>
        <span class="bdm-stat bdm-stat--warn">
          <span class="bdm-stat-val">{{ stats.alert }}</span>
          <span class="bdm-stat-label">需关注</span>
        </span>
      </div>
      <div class="bdm-actions">
        <input
          v-model="keyword"
          type="search"
          class="bdm-search"
          placeholder="搜索动态标题或类型"
          aria-label="搜索经营动态"
        />
        <button
          type="button"
          class="bdm-monitor-btn"
          :class="{ 'bdm-monitor-btn--on': monitorEnabled }"
          :aria-pressed="monitorEnabled"
          @click="monitorEnabled = !monitorEnabled"
        >
          <span class="bdm-monitor-dot" aria-hidden="true" />
          {{ monitorEnabled ? '监控中' : '开启监控' }}
        </button>
      </div>
    </div>

    <nav class="bdm-tabs" aria-label="动态类型筛选">
      <button
        v-for="cat in categories"
        :key="cat"
        type="button"
        class="bdm-tab"
        :class="{ 'bdm-tab--on': activeCategory === cat }"
        @click="activeCategory = cat"
      >
        {{ cat }}
      </button>
    </nav>

    <p v-if="monitorEnabled" class="bdm-hint">
      已订阅工商变更、行政许可、抽查检查等公开信号；新动态将推送至工作台消息中心。
    </p>

    <ul class="biz-timeline">
      <li v-for="(row, i) in filteredItems" :key="`${row.date}-${i}`" class="biz-timeline-item">
        <div class="biz-timeline-axis" aria-hidden="true">
          <span class="biz-timeline-dot" :class="{ 'is-alert': row.type === '抽查检查' }" />
          <span v-if="i < filteredItems.length - 1" class="biz-timeline-line" aria-hidden="true" />
        </div>
        <div class="biz-timeline-body">
          <div class="biz-timeline-head">
            <time class="biz-timeline-date" :datetime="row.date">{{ row.date }}</time>
            <span class="biz-timeline-type">{{ row.type }}</span>
            <span v-if="monitorEnabled" class="bdm-track-badge">已监控</span>
          </div>
          <h4 class="biz-timeline-title">{{ row.title }}</h4>
          <ul v-if="row.fields?.length" class="biz-timeline-fields">
            <li v-for="(f, j) in row.fields" :key="`${f.label}-${j}`" class="biz-timeline-field">
              <span class="biz-timeline-field-label">{{ f.label }}</span>
              <span
                class="biz-timeline-field-value"
                :class="{ 'is-warn': f.label.includes('状态') && f.value === '撤销' }"
              >{{ f.value }}</span>
            </li>
          </ul>
          <p v-else-if="row.detail" class="biz-timeline-detail">{{ row.detail }}</p>
        </div>
      </li>
    </ul>
    <p v-if="!filteredItems.length" class="bdm-empty">暂无符合条件的经营动态</p>
  </div>
</template>

<style scoped>
.bdm-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 16px;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.bdm-stats {
  display: flex;
  gap: 20px;
}

.bdm-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bdm-stat-val {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.bdm-stat-label {
  font-size: 0.75rem;
  color: #64748b;
}

.bdm-stat--warn .bdm-stat-val {
  color: #dc2626;
}

.bdm-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bdm-search {
  width: min(220px, 100%);
  padding: 7px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.875rem;
  background: #fff;
}

.bdm-monitor-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #fff;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
}

.bdm-monitor-btn--on {
  border-color: #006c4d;
  background: rgba(0, 108, 77, 0.08);
  color: #006c4d;
}

.bdm-monitor-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #94a3b8;
}

.bdm-monitor-btn--on .bdm-monitor-dot {
  background: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.25);
}

.bdm-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.bdm-tab {
  padding: 5px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #fff;
  font-size: 0.8125rem;
  color: #475569;
  cursor: pointer;
}

.bdm-tab--on {
  border-color: #006c4d;
  background: #006c4d;
  color: #fff;
}

.bdm-hint {
  margin: 0 0 14px;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(0, 108, 77, 0.06);
  font-size: 0.8125rem;
  color: #334155;
}

.bdm-track-badge {
  margin-left: auto;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(0, 108, 77, 0.1);
  font-size: 0.6875rem;
  font-weight: 600;
  color: #006c4d;
}

.bdm-empty {
  margin: 16px 0 0;
  text-align: center;
  color: #94a3b8;
  font-size: 0.875rem;
}

.biz-timeline {
  list-style: none;
  margin: 0;
  padding: 0;
}

.biz-timeline-item {
  display: flex;
  gap: 14px;
}

.biz-timeline-item + .biz-timeline-item {
  margin-top: 0;
}

.biz-timeline-axis {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 14px;
  flex-shrink: 0;
}

.biz-timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #006c4d;
  flex-shrink: 0;
}

.biz-timeline-dot.is-alert {
  background: #f59e0b;
}

.biz-timeline-line {
  flex: 1;
  width: 2px;
  min-height: 24px;
  margin: 4px 0;
  background: #e2e8f0;
}

.biz-timeline-body {
  flex: 1;
  min-width: 0;
  padding-bottom: 22px;
}

.biz-timeline-item:last-child .biz-timeline-body {
  padding-bottom: 0;
}

.biz-timeline-head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 6px;
}

.biz-timeline-date {
  font-size: 0.8125rem;
  color: #64748b;
}

.biz-timeline-type {
  padding: 2px 8px;
  border-radius: 4px;
  background: #f1f5f9;
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
}

.biz-timeline-title {
  margin: 0 0 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #0f172a;
}

.biz-timeline-fields {
  list-style: none;
  margin: 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f8fafc;
  display: grid;
  gap: 6px;
}

.biz-timeline-field {
  display: flex;
  gap: 8px;
  font-size: 0.8125rem;
}

.biz-timeline-field-label {
  flex-shrink: 0;
  color: #64748b;
  min-width: 5em;
}

.biz-timeline-field-value {
  color: #0f172a;
}

.biz-timeline-field-value.is-warn {
  color: #dc2626;
  font-weight: 600;
}

.biz-timeline-detail {
  margin: 0;
  font-size: 0.8125rem;
  color: #475569;
  line-height: 1.55;
}
</style>
