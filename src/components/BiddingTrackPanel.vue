<script setup lang="ts">
import { computed, ref } from 'vue'

export type BiddingRow = {
  project: string
  role: string
  amount: string
  purchaser: string
  date: string
}

const props = defineProps<{
  items: BiddingRow[]
}>()

const trackSubscribe = ref(true)
const roleFilter = ref('全部')
const trackedProjects = ref<Set<string>>(new Set(props.items.slice(0, 2).map((r) => r.project)))

const roleOptions = ['全部', '中标', '投标'] as const

const filteredItems = computed(() => {
  if (roleFilter.value === '全部') return props.items
  return props.items.filter((r) => r.role === roleFilter.value)
})

const trackedCount = computed(() => trackedProjects.value.size)

function toggleTrack(project: string) {
  const next = new Set(trackedProjects.value)
  if (next.has(project)) next.delete(project)
  else next.add(project)
  trackedProjects.value = next
}

function isTracked(project: string) {
  return trackedProjects.value.has(project)
}
</script>

<template>
  <div class="btp">
    <div class="btp-toolbar" role="toolbar" aria-label="招投标追踪控制">
      <div class="btp-summary">
        <span class="btp-chip">公开记录 {{ items.length }} 条</span>
        <span class="btp-chip btp-chip--accent">追踪中 {{ trackedCount }} 条</span>
      </div>
      <div class="btp-controls">
        <label class="btp-filter">
          <span class="btp-filter-label">角色</span>
          <select v-model="roleFilter" class="btp-select" aria-label="按角色筛选">
            <option v-for="opt in roleOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </label>
        <button
          type="button"
          class="btp-sub-btn"
          :class="{ 'btp-sub-btn--on': trackSubscribe }"
          :aria-pressed="trackSubscribe"
          @click="trackSubscribe = !trackSubscribe"
        >
          {{ trackSubscribe ? '追踪订阅已开启' : '开启追踪订阅' }}
        </button>
      </div>
    </div>

    <p v-if="trackSubscribe" class="btp-hint">
      已订阅本企业招投标公告更新；新项目发布、中标结果变更时将推送提醒。
    </p>

    <div class="tbl-scroll">
      <table class="plain-table bidding-table">
        <thead>
          <tr>
            <th>项目名称</th>
            <th>角色</th>
            <th>金额（含税）</th>
            <th>采购方 / 业主</th>
            <th>日期</th>
            <th>追踪状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in filteredItems" :key="i">
            <td class="bidding-cell-project">{{ row.project }}</td>
            <td>
              <span class="bidding-role" :class="row.role === '中标' ? 'is-win' : 'is-bid'">{{ row.role }}</span>
            </td>
            <td>{{ row.amount }}</td>
            <td>{{ row.purchaser }}</td>
            <td class="muted">{{ row.date }}</td>
            <td>
              <span class="btp-status" :class="isTracked(row.project) ? 'is-active' : ''">
                {{ isTracked(row.project) ? '追踪中' : '未追踪' }}
              </span>
            </td>
            <td>
              <button
                type="button"
                class="btp-track-btn"
                :class="{ 'btp-track-btn--on': isTracked(row.project) }"
                @click="toggleTrack(row.project)"
              >
                {{ isTracked(row.project) ? '取消追踪' : '加入追踪' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.btp-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.btp-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btp-chip {
  padding: 4px 10px;
  border-radius: 6px;
  background: #f1f5f9;
  font-size: 0.8125rem;
  color: #475569;
}

.btp-chip--accent {
  background: rgba(0, 108, 77, 0.1);
  color: #006c4d;
  font-weight: 600;
}

.btp-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btp-filter {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btp-filter-label {
  font-size: 0.8125rem;
  color: #64748b;
}

.btp-select {
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.8125rem;
  background: #fff;
}

.btp-sub-btn {
  padding: 7px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #fff;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
}

.btp-sub-btn--on {
  border-color: #006c4d;
  background: rgba(0, 108, 77, 0.08);
  color: #006c4d;
}

.btp-hint {
  margin: 0 0 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(37, 99, 235, 0.06);
  font-size: 0.8125rem;
  color: #334155;
}

.bidding-table td {
  vertical-align: middle;
}

.bidding-cell-project {
  max-width: 220px;
  font-weight: 500;
}

.bidding-role {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.bidding-role.is-win {
  background: rgba(0, 108, 77, 0.12);
  color: #006c4d;
}

.bidding-role.is-bid {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
}

.muted {
  color: #64748b;
}

.btp-status {
  font-size: 0.8125rem;
  color: #94a3b8;
}

.btp-status.is-active {
  color: #006c4d;
  font-weight: 600;
}

.btp-track-btn {
  padding: 4px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #fff;
  font-size: 0.75rem;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;
}

.btp-track-btn--on {
  border-color: #fca5a5;
  color: #dc2626;
}
</style>
