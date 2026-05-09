<script setup lang="ts">
import { ref } from 'vue'
import type { CompanyDetailData } from '../data/companyDetail'
import { getCompanyDetail } from '../data/companyDetail'

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  select: [companyName: string]
}>()

const defaultFilterForm = () =>
  ({
    keyword: '',
    capital: '',
    region: '',
    companyType: '全部',
    financingRound: '全部',
    industry: '全部',
    yearsEstablished: '不限',
    labels: '',
    listingStatus: '全部',
    staffSize: '全部',
  }) as const

const filterForm = ref({ ...defaultFilterForm() })

const selectOptions = {
  companyType: ['全部', '有限责任公司', '股份有限公司', '个人独资企业', '合伙企业'],
  financingRound: ['全部', '天使轮', 'A轮', 'B轮', 'C轮及以上', '已上市'],
  industry: ['全部', '软件和信息技术', '制造业', '金融业', '科学研究和技术服务'],
  yearsEstablished: ['不限', '1年内', '1-3年', '3-5年', '5-10年', '10年以上'],
  listingStatus: ['全部', '未上市', 'A股', '港股', '新三板'],
  staffSize: ['全部', '少于50人', '50-200人', '200-500人', '500人以上'],
} as const

const filterResults = [
  '安徽安大笃北信息科技有限责任公司',
  '科大讯飞股份有限公司',
  '合肥智算科技有限公司',
  '京东方科技集团股份有限公司',
  '长鑫存储技术有限公司',
  '蔚来控股有限公司',
  '阳光电源股份有限公司',
  '中科可控信息产业有限公司',
]

const selectedResultIndex = ref<number | null>(null)
const filterSearchSubmitted = ref(false)
const displayedFilterResults = ref<string[]>([])

function normalizeCompact(s: string): string {
  return s.replace(/\s+/g, '').toLowerCase()
}

/** 子串命中，或查询字符按顺序出现在目标中（适合简称、漏字） */
function fuzzyMatch(query: string, haystack: string): boolean {
  const q = query.trim()
  if (!q) return true
  const qh = normalizeCompact(q)
  const hh = normalizeCompact(haystack)
  if (hh.includes(qh)) return true
  let from = 0
  for (const ch of qh) {
    const idx = hh.indexOf(ch, from)
    if (idx === -1) return false
    from = idx + 1
  }
  return true
}

function multiTokenMatch(query: string, haystack: string): boolean {
  const parts = query.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return true
  return parts.every((p) => fuzzyMatch(p, haystack))
}

function detailHaystack(detail: CompanyDetailData): string {
  const sh = detail.shareholders.map((x) => x.name).join(' ')
  const st = detail.staff.map((x) => `${x.name} ${x.title}`).join(' ')
  return [
    detail.name,
    detail.creditCode,
    detail.legalPerson,
    sh,
    st,
    detail.tags.join(' '),
    detail.industry,
    detail.address,
    detail.scope.slice(0, 200),
  ].join(' ')
}

function parseCapitalWan(capitalStr: string): number | null {
  const s = capitalStr.replace(/,/g, '').trim()
  let m = s.match(/([\d.]+)\s*万人民币/)
  if (m) return parseFloat(m[1])
  m = s.match(/([\d.]+)\s*亿元/)
  if (m) return parseFloat(m[1]) * 10000
  m = s.match(/([\d.]+)\s*万/)
  if (m) return parseFloat(m[1])
  return null
}

/** 用于演示页：按成立年份粗算成立年限（与数据快照年份对齐） */
function establishedYears(est: string): number {
  const y = parseInt(est.slice(0, 4), 10)
  if (Number.isNaN(y)) return 0
  return Math.max(0, 2026 - y)
}

function isListedCompany(detail: CompanyDetailData): boolean {
  return detail.tags.some((t) => t.includes('上市')) || detail.companyType.includes('上市')
}

function matchesIndustry(detail: CompanyDetailData, sel: string): boolean {
  if (sel === '全部') return true
  const ind = detail.industry
  if (sel === '软件和信息技术') return ind.includes('软件') || ind.includes('信息技术')
  if (sel === '制造业') return ind.includes('制造')
  if (sel === '金融业') return ind.includes('金融')
  if (sel === '科学研究和技术服务') return ind.includes('科学') || ind.includes('研究') || ind.includes('技术服务')
  return fuzzyMatch(sel, ind)
}

function matchesCompanyType(detail: CompanyDetailData, sel: string): boolean {
  if (sel === '全部') return true
  return detail.companyType.includes(sel)
}

function matchesListingStatus(detail: CompanyDetailData, sel: string): boolean {
  if (sel === '全部') return true
  const listed = isListedCompany(detail)
  if (sel === '未上市') return !listed
  if (sel === 'A股') return listed
  if (sel === '港股') return listed && detail.address.includes('香港')
  if (sel === '新三板') return detail.tags.some((t) => t.includes('新三板'))
  return true
}

function matchesStaffSize(detail: CompanyDetailData, sel: string): boolean {
  if (sel === '全部') return true
  const ip = detail.insuredPersons?.trim()
  if (!ip) return true
  return ip === sel || fuzzyMatch(sel, ip)
}

function matchesYearsEstablished(detail: CompanyDetailData, sel: string): boolean {
  if (sel === '不限') return true
  const y = establishedYears(detail.established)
  if (sel === '1年内') return y <= 1
  if (sel === '1-3年') return y > 1 && y <= 3
  if (sel === '3-5年') return y > 3 && y <= 5
  if (sel === '5-10年') return y > 5 && y <= 10
  if (sel === '10年以上') return y > 10
  return true
}

function matchesCapitalMin(detail: CompanyDetailData, minStr: string): boolean {
  const t = minStr.trim()
  if (!t) return true
  const min = parseFloat(t.replace(/,/g, ''))
  if (Number.isNaN(min)) return true
  const wan = parseCapitalWan(detail.capital)
  if (wan === null) return true
  return wan >= min
}

function matchesRegion(detail: CompanyDetailData, region: string): boolean {
  const r = region.trim()
  if (!r) return true
  return multiTokenMatch(r, detail.address)
}

function matchesFinancingRound(detail: CompanyDetailData, sel: string): boolean {
  if (sel === '全部') return true
  const listed = isListedCompany(detail)
  if (sel === '已上市' || sel === 'C轮及以上') return listed
  if (sel === '天使轮') return detail.name.includes('笃北')
  if (sel === 'A轮' || sel === 'B轮') return true
  return true
}

function rowMatchesFilters(name: string): boolean {
  const detail = getCompanyDetail(name)
  const f = filterForm.value

  const hay = detailHaystack(detail)

  if (!multiTokenMatch(f.keyword, hay)) return false
  if (!multiTokenMatch(f.labels, `${detail.name} ${detail.tags.join(' ')}`)) return false
  if (!matchesCapitalMin(detail, f.capital)) return false
  if (!matchesRegion(detail, f.region)) return false
  if (!matchesIndustry(detail, f.industry)) return false
  if (!matchesCompanyType(detail, f.companyType)) return false
  if (!matchesListingStatus(detail, f.listingStatus)) return false
  if (!matchesStaffSize(detail, f.staffSize)) return false
  if (!matchesYearsEstablished(detail, f.yearsEstablished)) return false
  if (!matchesFinancingRound(detail, f.financingRound)) return false

  return true
}

function relevanceScore(keyword: string, name: string): number {
  const q = keyword.trim()
  if (!q) return 0
  const n = normalizeCompact(name)
  const qh = normalizeCompact(q)
  if (n.startsWith(qh)) return 120
  if (n.includes(qh)) return 100
  if (fuzzyMatch(q, name)) return 60
  return 0
}

function computeFilteredResults(): string[] {
  const matched = filterResults.filter(rowMatchesFilters)
  const kw = filterForm.value.keyword.trim()
  if (!kw) return matched
  return [...matched].sort((a, b) => relevanceScore(kw, b) - relevanceScore(kw, a))
}

function isFilterFormEmpty(): boolean {
  const f = filterForm.value
  const textEmpty =
    !f.keyword.trim() &&
    !f.capital.trim() &&
    !f.region.trim() &&
    !f.labels.trim()
  const selectsDefault =
    f.companyType === '全部' &&
    f.financingRound === '全部' &&
    f.industry === '全部' &&
    f.yearsEstablished === '不限' &&
    f.listingStatus === '全部' &&
    f.staffSize === '全部'
  return textEmpty && selectsDefault
}

function closeFilter() {
  open.value = false
  selectedResultIndex.value = null
  filterSearchSubmitted.value = false
  displayedFilterResults.value = []
  filterForm.value = { ...defaultFilterForm() }
}

function onResultClick(index: number) {
  selectedResultIndex.value = index
  const name = displayedFilterResults.value[index]
  emit('select', name)
  closeFilter()
}

function onFilterSearch() {
  filterSearchSubmitted.value = true
  selectedResultIndex.value = null
  if (isFilterFormEmpty()) {
    displayedFilterResults.value = []
  } else {
    displayedFilterResults.value = computeFilteredResults()
  }
}

function clearAllFilterConditions() {
  filterForm.value = { ...defaultFilterForm() }
  filterSearchSubmitted.value = false
  displayedFilterResults.value = []
  selectedResultIndex.value = null
}

function onViewMore() {
  const first = displayedFilterResults.value[0]
  if (first) {
    emit('select', first)
    closeFilter()
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-backdrop" @click.self="closeFilter">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="filter-modal-title">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-title-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 5h16l-6.2 7.4V20l-3.6 1.8v-9.4L4 5z"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <h2 id="filter-modal-title" class="modal-title">多字段高级筛选</h2>
          </div>
          <button type="button" class="modal-close" aria-label="关闭" @click="closeFilter">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="filter-grid">
            <label class="field">
              <span class="field-label">企业名称/关键字</span>
              <input v-model="filterForm.keyword" type="text" class="field-input" placeholder="名称/高管/股东" />
            </label>
            <label class="field">
              <span class="field-label">所属行业</span>
              <select v-model="filterForm.industry" class="field-select">
                <option v-for="opt in selectOptions.industry" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field-label">注册资本(万)</span>
              <input v-model="filterForm.capital" type="text" class="field-input" placeholder="≥ 金额" inputmode="decimal" />
            </label>
            <label class="field">
              <span class="field-label">成立年限</span>
              <select v-model="filterForm.yearsEstablished" class="field-select">
                <option v-for="opt in selectOptions.yearsEstablished" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field-label">地区</span>
              <input v-model="filterForm.region" type="text" class="field-input" placeholder="省份/城市" />
            </label>
            <label class="field">
              <span class="field-label">企业标签</span>
              <input v-model="filterForm.labels" type="text" class="field-input" placeholder="高新/专精特新/独角兽" />
            </label>

            <label class="field">
              <span class="field-label">企业类型</span>
              <select v-model="filterForm.companyType" class="field-select">
                <option v-for="opt in selectOptions.companyType" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </label>
            <label class="field">
              <span class="field-label">上市状态</span>
              <select v-model="filterForm.listingStatus" class="field-select">
                <option v-for="opt in selectOptions.listingStatus" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field-label">融资轮次</span>
              <select v-model="filterForm.financingRound" class="field-select">
                <option v-for="opt in selectOptions.financingRound" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </label>
            <label class="field">
              <span class="field-label">人员规模</span>
              <select v-model="filterForm.staffSize" class="field-select">
                <option v-for="opt in selectOptions.staffSize" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </label>
          </div>

          <div class="modal-actions">
            <div class="modal-action-btns">
              <button
                v-if="filterSearchSubmitted"
                type="button"
                class="modal-clear-btn"
                @click="clearAllFilterConditions"
              >
                清空所有条件
              </button>
              <button type="button" class="modal-primary-btn" @click="onFilterSearch">检索企业</button>
            </div>
          </div>

          <div v-if="filterSearchSubmitted" class="results-block">
            <p class="results-label">筛选结果</p>
            <div class="results-scroll">
              <ul v-if="displayedFilterResults.length > 0" class="results-list">
                <li v-for="(name, i) in displayedFilterResults" :key="`${name}-${i}`" class="results-row">
                  <button
                    type="button"
                    class="results-item-btn"
                    :class="{ 'is-selected': selectedResultIndex === i }"
                    @click="onResultClick(i)"
                  >
                    {{ name }}
                  </button>
                </li>
              </ul>
              <p v-else class="results-empty">暂无符合条件的企业</p>
            </div>
            <button v-if="displayedFilterResults.length > 0" type="button" class="results-more" @click="onViewMore">
              查看更多
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: rgba(55, 65, 75, 0.45);
  backdrop-filter: blur(6px);
}

.modal {
  width: min(920px, 100%);
  max-height: min(92vh, 900px);
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  box-shadow:
    0 24px 80px rgba(15, 45, 56, 0.18),
    0 8px 24px rgba(15, 45, 56, 0.08);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  border-bottom: 1px solid var(--db-border);
  flex-shrink: 0;
}

.modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.modal-title-icon {
  display: flex;
  color: var(--db-text);
  flex-shrink: 0;
}

.modal-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--db-text);
  letter-spacing: 0.02em;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--db-muted);
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
}

.modal-close:hover {
  background: #f0f4f5;
  color: var(--db-text);
}

.modal-body {
  padding: 20px 22px 22px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 20px;
}

@media (max-width: 640px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--db-text);
}

.field-input,
.field-select {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--db-border);
  border-radius: 8px;
  font-size: 14px;
  color: var(--db-text);
  background: #fafbfb;
  outline: none;
  transition:
    border-color 0.2s,
    background 0.2s;
}

.field-input::placeholder {
  color: var(--db-placeholder);
}

.field-input:focus,
.field-select:focus {
  border-color: #9eb4bc;
  background: #fff;
}

.field-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none'%3E%3Cpath d='M4 6l4 4 4-4' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 32px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.modal-action-btns {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.modal-clear-btn {
  padding: 10px 20px;
  border: 1px solid var(--db-border);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--db-muted);
  background: #fff;
  cursor: pointer;
  transition:
    color 0.2s,
    border-color 0.2s,
    background 0.2s;
}

.modal-clear-btn:hover {
  color: var(--db-text);
  border-color: #cfd9dc;
  background: #fafbfb;
}

.modal-primary-btn {
  padding: 10px 28px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: var(--db-primary-dark);
  cursor: pointer;
  transition: background 0.2s;
}

.modal-primary-btn:hover {
  background: var(--db-primary-darker);
}

.results-block {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--db-border);
  text-align: left;
}

.results-label {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--db-muted);
}

.results-scroll {
  max-height: calc(3 * 44px);
  overflow-y: auto;
  border: 1px solid var(--db-border);
  border-radius: 8px;
  background: #fff;
}

.results-empty {
  margin: 0;
  padding: 20px 14px;
  font-size: 14px;
  color: var(--db-muted);
  text-align: center;
  line-height: 1.5;
}

.results-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.results-row {
  border-bottom: 1px solid #f0f4f5;
}

.results-row:last-child {
  border-bottom: none;
}

.results-item-btn {
  display: block;
  width: 100%;
  margin: 0;
  padding: 11px 14px;
  border: none;
  font: inherit;
  font-size: 14px;
  line-height: 1.45;
  text-align: left;
  color: var(--db-text);
  background: transparent;
  cursor: pointer;
  transition:
    color 0.15s,
    background 0.15s,
    font-weight 0.1s;
}

.results-item-btn:hover {
  font-weight: 700;
}

.results-item-btn.is-selected {
  color: var(--db-text);
  font-weight: 600;
  background: rgba(0, 108, 77, 0.08);
}

.results-item-btn.is-selected:hover {
  font-weight: 700;
}

.results-item-btn:focus-visible {
  outline: 2px solid rgba(0, 108, 77, 0.45);
  outline-offset: -2px;
}

.results-more {
  display: block;
  width: 100%;
  margin-top: 10px;
  padding: 8px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: var(--db-text);
  cursor: pointer;
  text-align: center;
  transition: background 0.2s;
}

.results-more:hover {
  background: #f0f4f5;
}
</style>
