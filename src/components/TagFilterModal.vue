<script setup lang="ts">
import { computed, ref } from 'vue'
import { CHINA_PROVINCE_OPTIONS } from '../data/chinaProvinces'
import { TAG_FILTER_COMPANY_INDEX, type TagFilterCompanyRow } from '../data/tagFilterCatalog'

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  select: [companyName: string]
}>()

const defaultForm = () => ({
  industry: '全部',
  enterpriseScale: '全部',
  techRecognition: '全部',
  province: '全部',
  listingStatus: '全部',
  regType: '全部',
  nationalIndustry: '全部',
  strategicEmerging: '全部',
  yearsEstablished: '不限',
  regStatus: '全部',
  regCapitalMin: '',
  paidInMin: '',
  staffScale: '全部',
  taxCredit: '全部',
  customsCredit: '全部',
  biddingActivity: '全部',
  capitalBackground: '全部',
  phone: '',
  email: '',
  website: '',
})

const form = ref(defaultForm())

const selectIndustry = ['全部', '软件和信息技术服务业', '计算机、通信和其他电子设备制造业', '互联网和相关服务', '汽车制造业', '电气机械和器材制造业'] as const
const selectScale = ['全部', '大型', '中型', '小型', '微型'] as const
const selectTech = [
  '全部',
  '高新技术企业',
  '科技型中小企业',
  '国家企业技术中心',
  '省级企业技术中心',
] as const
const selectNational = ['全部', 'C 制造业', 'I 信息传输、软件和信息技术服务业'] as const
const selectStrategic = ['全部', '新一代信息技术产业', '新能源汽车产业', '新材料产业', '新能源产业', '数字创意产业'] as const
const selectYears = ['不限', '5年以内', '5-10年', '10年以上'] as const
const selectRegStatus = ['全部', '存续（在营）', '在业', '迁出'] as const
const selectStaff = ['全部', '500人以上', '200-500人', '50-200人', '少于50人'] as const
const selectListingStatus = ['全部', '上市', '非上市'] as const
const selectRegType = ['全部', '股份有限公司', '有限责任公司'] as const
const selectTaxCredit = ['全部', 'A级', 'B级', 'M级', '未纳入近年公示'] as const
const selectCustomsCredit = ['全部', '高级认证企业', '一般信用企业', '暂无公开等级'] as const
const selectBiddingActivity = ['全部', '高', '中', '低'] as const
const selectCapitalBackground = ['全部', '民营主导', '国有控股或参股', '港澳台及外商参股'] as const

const submitted = ref(false)
const displayed = ref<TagFilterCompanyRow[]>([])
const selectedIndex = ref<number | null>(null)

function close() {
  open.value = false
  submitted.value = false
  displayed.value = []
  selectedIndex.value = null
  form.value = defaultForm()
}

function isDefault(): boolean {
  const f = form.value
  return (
    f.industry === '全部' &&
    f.enterpriseScale === '全部' &&
    f.techRecognition === '全部' &&
    f.province === '全部' &&
    f.listingStatus === '全部' &&
    f.regType === '全部' &&
    f.nationalIndustry === '全部' &&
    f.strategicEmerging === '全部' &&
    f.yearsEstablished === '不限' &&
    f.regStatus === '全部' &&
    !f.regCapitalMin.trim() &&
    !f.paidInMin.trim() &&
    f.staffScale === '全部' &&
    f.taxCredit === '全部' &&
    f.customsCredit === '全部' &&
    f.biddingActivity === '全部' &&
    f.capitalBackground === '全部' &&
    !f.phone.trim() &&
    !f.email.trim() &&
    !f.website.trim()
  )
}

function yearsMatch(row: TagFilterCompanyRow, sel: string): boolean {
  if (sel === '不限') return true
  const y = row.yearsEstablished
  if (sel === '5年以内') return y <= 5
  if (sel === '5-10年') return y > 5 && y <= 10
  if (sel === '10年以上') return y > 10
  return true
}

function capitalMatch(minStr: string, val: number): boolean {
  const t = minStr.trim()
  if (!t) return true
  const n = parseFloat(t.replace(/,/g, ''))
  if (Number.isNaN(n)) return true
  return val >= n
}

function filterRows(): TagFilterCompanyRow[] {
  if (isDefault()) return []
  const f = form.value
  return TAG_FILTER_COMPANY_INDEX.filter((row) => {
    if (f.industry !== '全部' && row.industry !== f.industry) return false
    if (f.enterpriseScale !== '全部' && row.enterpriseScale !== f.enterpriseScale) return false
    if (f.techRecognition !== '全部' && row.techRecognition !== f.techRecognition) return false
    if (f.province !== '全部' && row.province !== f.province) return false
    if (f.listingStatus !== '全部' && row.listingStatus !== f.listingStatus) return false
    if (f.regType !== '全部' && row.regType !== f.regType) return false
    if (f.nationalIndustry !== '全部' && row.nationalIndustry !== f.nationalIndustry) return false
    if (f.strategicEmerging !== '全部' && row.strategicEmerging !== f.strategicEmerging) return false
    if (!yearsMatch(row, f.yearsEstablished)) return false
    if (f.regStatus !== '全部' && row.regStatus !== f.regStatus) return false
    if (!capitalMatch(f.regCapitalMin, row.regCapitalWan)) return false
    if (!capitalMatch(f.paidInMin, row.paidInWan)) return false
    if (f.staffScale !== '全部' && row.staffScale !== f.staffScale) return false
    if (f.taxCredit !== '全部' && row.taxCredit !== f.taxCredit) return false
    if (f.customsCredit !== '全部' && row.customsCredit !== f.customsCredit) return false
    if (f.biddingActivity !== '全部' && row.biddingActivity !== f.biddingActivity) return false
    if (f.capitalBackground !== '全部' && row.capitalBackground !== f.capitalBackground) return false
    if (f.phone.trim() && !row.phone.includes(f.phone.trim())) return false
    if (f.email.trim() && !row.email.toLowerCase().includes(f.email.trim().toLowerCase())) return false
    if (f.website.trim() && !row.website.toLowerCase().includes(f.website.trim().toLowerCase())) return false
    return true
  })
}

function onSearch() {
  submitted.value = true
  selectedIndex.value = null
  displayed.value = isDefault() ? [] : filterRows()
}

function clearAll() {
  form.value = defaultForm()
  submitted.value = false
  displayed.value = []
  selectedIndex.value = null
}

function onPick(i: number) {
  selectedIndex.value = i
  const row = displayed.value[i]
  if (row) {
    emit('select', row.name)
    close()
  }
}

const resultCount = computed(() => displayed.value.length)
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-backdrop" @click.self="close">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="tag-modal-title">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-title-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 5.5h7l2 3 2-3h5a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1v-12a1 1 0 011-1z"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linejoin="round"
                />
                <path d="M9 11h6M9 15h4" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" />
              </svg>
            </span>
            <h2 id="tag-modal-title" class="modal-title">企业标签管理 · 多维筛选</h2>
          </div>
          <button type="button" class="modal-close" aria-label="关闭" @click="close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <p class="modal-lead">
            按行业、规模、科技认定、地区、上市状态、登记类型、纳税信用、海关企业信用、招投标活跃档、资本背景与国标/战略新兴分类等条件组合筛选，结果展示企业名称与对应标签。
          </p>

          <div class="filter-grid">
            <label class="field">
              <span class="field-label">行业</span>
              <select v-model="form.industry" class="field-select">
                <option v-for="opt in selectIndustry" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </label>
            <label class="field">
              <span class="field-label">规模</span>
              <select v-model="form.enterpriseScale" class="field-select">
                <option v-for="opt in selectScale" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field-label">科技认定</span>
              <select v-model="form.techRecognition" class="field-select">
                <option v-for="opt in selectTech" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </label>
            <label class="field">
              <span class="field-label">省份地区</span>
              <select v-model="form.province" class="field-select">
                <option v-for="opt in CHINA_PROVINCE_OPTIONS" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field-label">国标行业</span>
              <select v-model="form.nationalIndustry" class="field-select">
                <option v-for="opt in selectNational" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </label>
            <label class="field">
              <span class="field-label">战略新兴产业</span>
              <select v-model="form.strategicEmerging" class="field-select">
                <option v-for="opt in selectStrategic" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field-label">成立年限</span>
              <select v-model="form.yearsEstablished" class="field-select">
                <option v-for="opt in selectYears" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </label>
            <label class="field">
              <span class="field-label">登记状态</span>
              <select v-model="form.regStatus" class="field-select">
                <option v-for="opt in selectRegStatus" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </label>
            <label class="field">
              <span class="field-label">上市状态</span>
              <select v-model="form.listingStatus" class="field-select">
                <option v-for="opt in selectListingStatus" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field-label">登记类型</span>
              <select v-model="form.regType" class="field-select">
                <option v-for="opt in selectRegType" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field-label">纳税信用等级</span>
              <select v-model="form.taxCredit" class="field-select">
                <option v-for="opt in selectTaxCredit" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </label>
            <label class="field">
              <span class="field-label">海关企业信用</span>
              <select v-model="form.customsCredit" class="field-select">
                <option v-for="opt in selectCustomsCredit" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field-label">招投标活跃档</span>
              <select v-model="form.biddingActivity" class="field-select">
                <option v-for="opt in selectBiddingActivity" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </label>
            <label class="field">
              <span class="field-label">资本背景</span>
              <select v-model="form.capitalBackground" class="field-select">
                <option v-for="opt in selectCapitalBackground" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </label>

            <label class="field">
              <span class="field-label">注册资本（万）≥</span>
              <input v-model="form.regCapitalMin" type="text" class="field-input" placeholder="如：5000" inputmode="decimal" />
            </label>
            <label class="field">
              <span class="field-label">实缴资本（万）≥</span>
              <input v-model="form.paidInMin" type="text" class="field-input" placeholder="如：3000" inputmode="decimal" />
            </label>

            <label class="field">
              <span class="field-label">企业规模（人员）</span>
              <select v-model="form.staffScale" class="field-select">
                <option v-for="opt in selectStaff" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </label>
            <label class="field">
              <span class="field-label">联系电话</span>
              <input v-model="form.phone" type="text" class="field-input" placeholder="号码片段" />
            </label>

            <label class="field">
              <span class="field-label">电子邮件</span>
              <input v-model="form.email" type="text" class="field-input" placeholder="邮箱片段" />
            </label>
            <label class="field">
              <span class="field-label">公司官网</span>
              <input v-model="form.website" type="text" class="field-input" placeholder="域名片段" />
            </label>
          </div>

          <div class="modal-actions">
            <div class="modal-action-btns">
              <button v-if="submitted" type="button" class="modal-clear-btn" @click="clearAll">清空所有条件</button>
              <button type="button" class="modal-primary-btn" @click="onSearch">检索企业</button>
            </div>
          </div>

          <div v-if="submitted" class="results-block">
            <p class="results-label">筛选结果（{{ resultCount }}）</p>
            <div v-if="displayed.length > 0" class="tag-results">
              <button
                v-for="(row, i) in displayed"
                :key="row.name"
                type="button"
                class="tag-result-card"
                :class="{ 'is-selected': selectedIndex === i }"
                @click="onPick(i)"
              >
                <span class="tag-result-name">{{ row.name }}</span>
                <div class="tag-result-tags" aria-label="企业标签">
                  <span
                    v-for="(tag, ti) in row.tags"
                    :key="tag"
                    class="pill"
                    :class="`pill--${ti % 6}`"
                  >{{ tag }}</span>
                </div>
                <span class="tag-result-meta">{{ row.province }} · {{ row.industry }}</span>
              </button>
            </div>
            <p v-else class="results-empty">暂无符合条件的企业，请调整筛选项后重新检索。</p>
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
  width: min(960px, 100%);
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

.modal-lead {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--db-muted);
  text-align: left;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 20px;
}

@media (max-width: 720px) {
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
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--db-muted);
}

.results-empty {
  margin: 0;
  padding: 20px 14px;
  font-size: 14px;
  color: var(--db-muted);
  text-align: center;
  line-height: 1.5;
}

.tag-results {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: min(48vh, 420px);
  overflow-y: auto;
}

.tag-result-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 14px 16px;
  border: 1px solid var(--db-border);
  border-radius: 10px;
  background: #fafcfb;
  text-align: left;
  cursor: pointer;
  font: inherit;
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    background 0.2s;
}

.tag-result-card:hover {
  border-color: rgba(0, 108, 77, 0.28);
  box-shadow: 0 4px 14px rgba(0, 82, 57, 0.08);
  background: #fff;
}

.tag-result-card.is-selected {
  border-color: #a5d6a7;
  background: #e8f5e9;
}

.tag-result-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--db-text);
}

.tag-result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-result-meta {
  font-size: 12px;
  color: var(--db-muted);
}
</style>
