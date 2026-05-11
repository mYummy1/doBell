<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AdvancedFilterModal from '../components/AdvancedFilterModal.vue'
import CompanySearchInput from '../components/CompanySearchInput.vue'
import ChainEnterpriseTree from '../components/ChainEnterpriseTree.vue'
import ChinaRegionHeatmap from '../components/ChinaRegionHeatmap.vue'
import IndustryChainFlow from '../components/IndustryChainFlow.vue'
import IndustryPortraitRadar from '../components/IndustryPortraitRadar.vue'
import JudicialRiskModule from '../components/JudicialRiskModule.vue'
import SentimentMonitorDashboard from '../components/SentimentMonitorDashboard.vue'
import NavMenuIcon from '../components/NavMenuIcon.vue'
import RelationPenetrateChart from '../components/RelationPenetrateChart.vue'
import SectionHeading from '../components/SectionHeading.vue'
import AuthGuestBar from '../components/AuthGuestBar.vue'
import UserMenuDropdown from '../components/UserMenuDropdown.vue'
import { useAuth } from '../composables/useAuth'
import { useSearchHistory } from '../composables/useSearchHistory'
import { getCompanyDetail } from '../data/companyDetail'
import { JUDICIAL_RISK_MODULE_DEFS, getJudicialTableDemo } from '../data/judicialRiskCatalog'

const route = useRoute()
const router = useRouter()
const { isLoggedIn } = useAuth()
const { rememberQuery } = useSearchHistory()

const faviconUrl = `${import.meta.env.BASE_URL}favicon.svg`

const companyName = computed(() => {
  const q = route.query.q
  const raw = Array.isArray(q) ? q[0] : q
  return String(raw ?? '').trim()
})

const company = computed(() =>
  companyName.value ? getCompanyDetail(companyName.value) : null
)

const headerQuery = ref('')
const activeNavAnchor = ref('sec-basic-info')
const filterOpen = ref(false)

watch(
  companyName,
  (name) => {
    if (!name) router.replace({ name: 'home' })
  },
  { immediate: true }
)

/** 产业概览标题与指标展示 */
const overviewHeadline = '产业概览·人工智能'

const overviewIndustryMetrics = [
  { label: '产业规模', displayValue: '2.3万亿', weight: 23 },
  { label: '企业数量', displayValue: '4.2万家', weight: 42 },
  { label: '专利授权', displayValue: '18.3k', weight: 18.3 },
] as const

/** 环形分段色：蓝 / 青绿 / 石板灰 */
const overviewDonutColors = ['#2563eb', '#84cc16', '#475569'] as const

function donutStrokeArcPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const x0 = cx + r * Math.cos(a0)
  const y0 = cy + r * Math.sin(a0)
  const x1 = cx + r * Math.cos(a1)
  const y1 = cy + r * Math.sin(a1)
  const largeArc = a1 - a0 > Math.PI ? 1 : 0
  return `M ${x0} ${y0} A ${r} ${r} 0 ${largeArc} 1 ${x1} ${y1}`
}

/** 圆角分段环形图路径（粗描边弧 + 段间留白） */
const overviewDonutArcs = computed(() => {
  const metrics = overviewIndustryMetrics
  const sum = metrics.reduce((s, m) => s + m.weight, 0) || 1
  const cx = 140
  const cy = 140
  const r = 92
  const gap = 0.11
  const totalSweep = 2 * Math.PI - metrics.length * gap
  let cursor = -Math.PI / 2
  return metrics.map((m, i) => {
    const sweep = (m.weight / sum) * totalSweep
    const a0 = cursor
    const a1 = cursor + sweep
    cursor = a1 + gap
    return {
      d: donutStrokeArcPath(cx, cy, r, a0, a1),
      midAngle: (a0 + a1) / 2,
      color: overviewDonutColors[i % overviewDonutColors.length],
      label: m.label,
      displayValue: m.displayValue,
      percent: Math.round((m.weight / sum) * 1000) / 10,
    }
  })
})

const overviewDonutSelectedIndex = ref<number | null>(null)
/** 悬停优先，否则沿用选中（用于中心文案与 tooltip） */
const overviewDonutHoverIndex = ref<number | null>(null)

const overviewDonutFocusIndex = computed(
  () => overviewDonutHoverIndex.value ?? overviewDonutSelectedIndex.value
)

const overviewDonutFocus = computed(() => {
  const i = overviewDonutFocusIndex.value
  if (i === null) return null
  return overviewDonutArcs.value[i] ?? null
})

const overviewDonutTooltipStyle = computed(() => {
  const i = overviewDonutFocusIndex.value
  if (i === null) return {}
  const arc = overviewDonutArcs.value[i]
  if (!arc) return {}
  const mid = arc.midAngle
  const dist = 108
  const x = Math.cos(mid) * dist
  const y = Math.sin(mid) * dist
    return {
    left: `calc(50% + ${x}px)`,
    top: `calc(50% + ${y}px)`,
    transform: 'translate(-50%, -50%)',
  }
})

function onOverviewDonutSelect(index: number) {
  overviewDonutSelectedIndex.value = overviewDonutSelectedIndex.value === index ? null : index
}

function onOverviewDonutChartLeave() {
  overviewDonutHoverIndex.value = null
}

/** 产业画像：优先使用企业数据中的雷达维度，缺省为通用五维 */
const portraitFallbackAxes = [
  { label: '产业规模', value: 80 },
  { label: '人才浓度', value: 80 },
  { label: '政策支持', value: 80 },
  { label: '资本热度', value: 60 },
  { label: '创新活力', value: 80 },
] as const

const portraitAxesForChart = computed(() => {
  const c = company.value
  if (c?.radar?.length) {
    return c.radar.map((r) => ({ label: r.label, value: r.value }))
  }
  return portraitFallbackAxes.map((a) => ({ label: a.label, value: a.value }))
})

/** 产业政策摘录（链接跳转对应门户或政策库） */
const industryPolicyRows = [
  {
    title: '国务院关于深入实施「人工智能+」行动的意见',
    source: '中国政府网 · 国务院政策文件库',
    date: '2025-08-26',
    url: 'https://www.gov.cn/zhengce/zhengceku/',
  },
  {
    title: '工业和信息化部关于进一步推动工业和信息化服务业健康发展的通知',
    source: '工业和信息化部',
    date: '2025-03-12',
    url: 'https://www.miit.gov.cn/',
  },
  {
    title: '安徽省加快新一代信息技术产业高质量发展的若干政策措施',
    source: '安徽省人民政府',
    date: '2024-11-08',
    url: 'https://www.ah.gov.cn/',
  },
  {
    title: '合肥市软件和信息技术服务业高质量发展扶持政策操作指南',
    source: '合肥市发展和改革委员会',
    date: '2024-09-20',
    url: 'https://fgw.hefei.gov.cn/',
  },
  {
    title: '国家发展改革委关于培育壮大战略性新兴产业集群的指导意见',
    source: '国家发展改革委',
    date: '2024-06-03',
    url: 'https://www.ndrc.gov.cn/',
  },
]

/** 重点企业榜参考名录（点击切换详情页企业主体） */
const keyEnterpriseList = [
  { displayName: '科大讯飞', queryName: '科大讯飞股份有限公司' },
  { displayName: '商汤科技', queryName: '商汤科技' },
  { displayName: '云从科技', queryName: '云从科技' },
  { displayName: '旷视科技', queryName: '旷视科技' },
] as const

function navigateToCompany(q: string) {
  const trimmed = q.trim()
  if (!trimmed) return
  rememberQuery(trimmed)
  router.push({ name: 'company-detail', query: { q: trimmed }, hash: '' })
}

function openKeyEnterprise(queryName: string) {
  navigateToCompany(queryName)
}

/** 持股比例文案解析为条形占比（如「12%」「100%」） */
function outboundRatioBarWidth(ratio: string): string {
  const m = ratio.match(/(\d+(?:\.\d+)?)\s*%/)
  if (!m) return '0%'
  const n = parseFloat(m[1])
  if (Number.isNaN(n)) return '0%'
  return `${Math.min(100, Math.max(0, n))}%`
}

/** 行业洞察摘要指标 */
const industryInsightKpis = [
  { label: '赛道投融资热度（同比）', value: '+18%', hint: '公开披露轮次加权' },
  { label: '创新产出（滚动12月专利）', value: '126 件', hint: '含发明与实用新型' },
  { label: '行业景气指数', value: '72', hint: '满分100 · 综合指数' },
] as const

/** 行业洞察条目 */
const industryInsightItems = [
  {
    kind: 'trend' as const,
    tag: '趋势',
    title: '人工智能产业链国产化替代节奏加快',
    summary:
      '底层框架与算力芯片采购意向同比上升，系统集成与行业解决方案订单向国产软硬件组合倾斜，交付周期有所缩短。',
    meta: '2026 · Q2 监测',
  },
  {
    kind: 'opportunity' as const,
    tag: '机会',
    title: '行业大模型场景落地窗口扩大',
    summary:
      '制造、政务、医疗等垂直场景 POC 转化率走高，中小厂商可通过联合体与渠道捆绑方式切入集成与运维环节。',
    meta: '近 30 日',
  },
  {
    kind: 'benchmark' as const,
    tag: '对标',
    title: '区域同类企业研发投入强度对比',
    summary:
      '区域内企业研发费用率中位数约 9.2%，高于全国软件和信息技术服务业均值约 1.6 个百分点，头部效应明显。',
    meta: '年报口径',
  },
  {
    kind: 'risk' as const,
    tag: '风险',
    title: '数据合规与出口管制条款更新',
    summary:
      '跨境云服务与训练数据出境安全评估周期拉长，涉外采购合同需预留合规评审与备案缓冲时间。',
    meta: '政策跟踪',
  },
]

const DUBEI_COMPANY_NAME = '安徽安大笃北信息科技有限责任公司'

type BizDynamicsRow = {
  date: string
  type: string
  title: string
  /** 纯文案（与 fields 二选一或仅存文案条目） */
  detail?: string
  /** 结构化字段，版式更易扫读 */
  fields?: { label: string; value: string }[]
}
type BiddingRow = { project: string; role: string; amount: string; purchaser: string; date: string }
type FinanceRow = { round: string; amount: string; investors: string; date: string }

const defaultBusinessDynamicsItems: BizDynamicsRow[] = [
  {
    date: '2026-04-28',
    type: '行政许可',
    title: '高新技术企业资质延续备案',
    detail: '主管部门形式审查通过，证书状态已在火炬中心备案库同步。',
  },
  {
    date: '2026-03-06',
    type: '抽查检查',
    title: '2025 年度「双随机」抽查结果公示',
    detail: '抽查事项均为即时公示类，未发现需责令改正事项。',
  },
  {
    date: '2026-01-20',
    type: '经营信息',
    title: '主营业务目录修订备案',
    detail: '新增「行业大模型应用集成」相关经营范围条目。',
  },
  {
    date: '2025-11-03',
    type: '资质证书',
    title: '软件能力成熟度（CS）等级证书换证',
    detail: '评估等级维持不变，有效期顺延三年。',
  },
]

const dubeiBusinessDynamicsItems: BizDynamicsRow[] = [
  {
    date: '2020-11-12',
    type: '资质证书',
    title: '质量管理体系认证',
    fields: [
      { label: '证书编号', value: 'UKS002-2020Q0994' },
      { label: '发证机构', value: '优卡斯国际认证（深圳）有限公司' },
      { label: '发证日期', value: '2020-11-12' },
      { label: '有效期至', value: '2023-11-11' },
      { label: '证书状态', value: '撤销' },
    ],
  },
  {
    date: '2023-05-23',
    type: '行政许可',
    title: '增值税防伪税控系统最高开票限额审批',
    fields: [
      { label: '决定文书 / 许可编号', value: '[合高新税]许变准字[2023]第[361]号' },
      { label: '有效期', value: '2023-05-23 至 2099-12-31' },
      { label: '许可机关', value: '国家税务总局合肥高新技术产业开发区税务局' },
      { label: '数据来源', value: '国家税务总局合肥市税务局' },
    ],
  },
  {
    date: '2015-08-04',
    type: '创投融资',
    title: '天使轮融资',
    fields: [
      { label: '融资金额', value: '330 万元' },
      { label: '企业估值', value: '未披露' },
      { label: '投资方', value: '众投基金、寰景科技' },
    ],
  },
]

const defaultBiddingItems: BiddingRow[] = [
  {
    project: '合肥市政务云平台扩容与迁移服务项目',
    role: '中标',
    amount: '¥ 1,286 万',
    purchaser: '合肥市数据资源局',
    date: '2026-03-15',
  },
  {
    project: '智慧园区物联网数据中台软件开发',
    role: '中标',
    amount: '¥ 428 万',
    purchaser: '合肥高新技术产业开发区管委会',
    date: '2026-02-08',
  },
  {
    project: '省级政务数据共享交换平台运维服务',
    role: '投标',
    amount: '—',
    purchaser: '安徽省数据资源管理局',
    date: '2026-01-22',
  },
]

const dubeiBiddingItems: BiddingRow[] = [
  {
    project: '安徽大学2023年网络内容管理项目公告',
    role: '中标',
    amount: '112.7 万元',
    purchaser: '安徽大学',
    date: '2023-12-14',
  },
  {
    project: '安徽大学2023年网络内容管理项目中标（成交）结果公告',
    role: '中标',
    amount: '112.7 万元',
    purchaser: '安徽大学',
    date: '2023-11-27',
  },
  {
    project: '安徽大学2021年安徽省教育新媒体联盟信息平台建设（二期）项目成交结果公告',
    role: '中标',
    amount: '49.28 万元',
    purchaser: '安徽大学',
    date: '2021-05-24',
  },
  {
    project: '安徽大学2019年新媒体联盟软件系统（一期）建设',
    role: '中标',
    amount: '78.8 万元',
    purchaser: '安徽大学',
    date: '2019-08-12',
  },
  {
    project: '安徽大学2019年新媒体联盟软件系统（一期）建设',
    role: '中标',
    amount: '78.8 万元',
    purchaser: '安徽大学',
    date: '2019-06-28',
  },
]

const defaultFinancingItems: FinanceRow[] = [
  {
    round: '战略融资',
    amount: '未披露',
    investors: '省级产业引导基金、智能网联产业投资方',
    date: '2025-11-02',
  },
  {
    round: 'B 轮',
    amount: '¥ 3.2 亿',
    investors: '领投机构、地方国资平台及两家财务投资人',
    date: '2024-08-18',
  },
  {
    round: 'A+ 轮',
    amount: '¥ 8,000 万',
    investors: '专注硬科技与软件的早期 VC',
    date: '2023-05-09',
  },
]

const dubeiFinancingItems: FinanceRow[] = [
  {
    round: '天使轮',
    amount: '330 万元',
    investors: '众投基金、寰景科技',
    date: '2015-08-04',
  },
]

const businessDynamicsItems = computed(() =>
  companyName.value === DUBEI_COMPANY_NAME ? dubeiBusinessDynamicsItems : defaultBusinessDynamicsItems
)

const biddingItems = computed(() =>
  companyName.value === DUBEI_COMPANY_NAME ? dubeiBiddingItems : defaultBiddingItems
)

const financingItems = computed(() =>
  companyName.value === DUBEI_COMPANY_NAME ? dubeiFinancingItems : defaultFinancingItems
)

/** 工商信息栅格单元（不含注册地址、经营范围） */
const basicInfoCells = computed(() => {
  const c = company.value
  if (!c) return [] as { label: string; value: string }[]
  type Cell = { label: string; value: string }
  const cells: Cell[] = [{ label: '统一社会信用代码', value: c.creditCode }]
  if (c.englishName) cells.push({ label: '英文名称', value: c.englishName })
  cells.push({ label: '法定代表人', value: c.legalPerson }, { label: '注册资本', value: c.capital })
  if (c.paidInCapital) cells.push({ label: '实缴资本', value: c.paidInCapital })
  cells.push({ label: '成立日期', value: c.established })
  if (c.registrationAuthority) cells.push({ label: '登记机关', value: c.registrationAuthority })
  if (c.approvalDate) cells.push({ label: '核准日期', value: c.approvalDate })
  if (c.orgCode) cells.push({ label: '组织机构代码', value: c.orgCode })
  if (c.taxpayerId) cells.push({ label: '纳税人识别号', value: c.taxpayerId })
  if (c.insuredPersons) cells.push({ label: '参保人数', value: c.insuredPersons })
  cells.push(
    { label: '经营状态', value: c.status },
    { label: '所属行业', value: c.industry },
    { label: '企业类型', value: c.companyType },
  )
  if (c.businessTerm) cells.push({ label: '营业期限', value: c.businessTerm })
  if (c.contactPhone) cells.push({ label: '联系电话', value: c.contactPhone })
  if (c.contactEmail) cells.push({ label: '电子邮箱', value: c.contactEmail })
  if (c.officialWebsite) cells.push({ label: '官方网站', value: c.officialWebsite })
  return cells
})

const CHANGE_RECORDS_PAGE_SIZE = 5
const changeRecordsPage = ref(1)

const IP_PAGE_SIZE = 10
const patentIpPage = ref(1)
const trademarkIpPage = ref(1)

watch(companyName, () => {
  changeRecordsPage.value = 1
  patentIpPage.value = 1
  softwareCopyrightIpPage.value = 1
  trademarkIpPage.value = 1
})

const changeRecordsPageStartIndex = computed(
  () => (changeRecordsPage.value - 1) * CHANGE_RECORDS_PAGE_SIZE
)

const changeRecordsPaged = computed(() => {
  const list = company.value?.changeRecords ?? []
  const start = changeRecordsPageStartIndex.value
  return list.slice(start, start + CHANGE_RECORDS_PAGE_SIZE)
})

const changeRecordsTotalPages = computed(() => {
  const n = company.value?.changeRecords.length ?? 0
  if (n === 0) return 0
  return Math.ceil(n / CHANGE_RECORDS_PAGE_SIZE)
})

function changeRecordsGoPrev() {
  if (changeRecordsPage.value > 1) changeRecordsPage.value -= 1
}

function changeRecordsGoNext() {
  const max = changeRecordsTotalPages.value
  if (changeRecordsPage.value < max) changeRecordsPage.value += 1
}

function ipCell(val: string | undefined) {
  const t = val?.trim()
  return t ? t : '—'
}

function trademarkHasPatternImage(url: string | undefined): boolean {
  const u = url?.trim()
  if (!u) return false
  if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return true
  if (u.startsWith('/')) return true
  return /\.(svg|png|jpe?g|webp|gif)$/i.test(u) || u.includes('brandmarks/')
}

function trademarkPatternSrc(url: string | undefined): string {
  const u = url?.trim()
  if (!u) return ''
  if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:')) return u
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/')
  return base + u.replace(/^\//, '')
}

function tmPatternInitial(name: string): string {
  const t = name.trim()
  if (!t) return '®'
  return t.length <= 2 ? t : t.slice(0, 2)
}

const patentIpStart = computed(() => (patentIpPage.value - 1) * IP_PAGE_SIZE)

const patentsIpPaged = computed(() => {
  const list = company.value?.patents ?? []
  const start = patentIpStart.value
  return list.slice(start, start + IP_PAGE_SIZE)
})

const patentIpTotalPages = computed(() => {
  const n = company.value?.patents.length ?? 0
  if (n === 0) return 0
  return Math.ceil(n / IP_PAGE_SIZE)
})

function patentIpPrev() {
  if (patentIpPage.value > 1) patentIpPage.value -= 1
}

function patentIpNext() {
  if (patentIpPage.value < patentIpTotalPages.value) patentIpPage.value += 1
}

const trademarkIpStart = computed(() => (trademarkIpPage.value - 1) * IP_PAGE_SIZE)

const trademarksIpPaged = computed(() => {
  const list = company.value?.trademarks ?? []
  const start = trademarkIpStart.value
  return list.slice(start, start + IP_PAGE_SIZE)
})

const trademarkIpTotalPages = computed(() => {
  const n = company.value?.trademarks.length ?? 0
  if (n === 0) return 0
  return Math.ceil(n / IP_PAGE_SIZE)
})

function trademarkIpPrev() {
  if (trademarkIpPage.value > 1) trademarkIpPage.value -= 1
}

function trademarkIpNext() {
  if (trademarkIpPage.value < trademarkIpTotalPages.value) trademarkIpPage.value += 1
}

const softwareCopyrightIpPage = ref(1)

const softwareCopyrightIpStart = computed(() => (softwareCopyrightIpPage.value - 1) * IP_PAGE_SIZE)

const softwareCopyrightsIpPaged = computed(() => {
  const list = company.value?.softwareCopyrights ?? []
  const start = softwareCopyrightIpStart.value
  return list.slice(start, start + IP_PAGE_SIZE)
})

const softwareCopyrightIpTotalPages = computed(() => {
  const n = company.value?.softwareCopyrights.length ?? 0
  if (n === 0) return 0
  return Math.ceil(n / IP_PAGE_SIZE)
})

function softwareCopyrightIpPrev() {
  if (softwareCopyrightIpPage.value > 1) softwareCopyrightIpPage.value -= 1
}

function softwareCopyrightIpNext() {
  if (softwareCopyrightIpPage.value < softwareCopyrightIpTotalPages.value) {
    softwareCopyrightIpPage.value += 1
  }
}

/** 供应链 — 上游 */
const supplyUpstreamItems = [
  { name: '合肥芯源微电子有限公司', category: '核心器件', relation: '战略合作' },
  { name: '华东云计算资源调度平台', category: '算力服务', relation: '框架协议' },
  { name: '深圳精密连接器股份有限公司', category: '硬件配套', relation: '批量采购' },
] as const

/** 供应链 — 下游 */
const supplyDownstreamItems = [
  { name: '某省政务服务和数据管理局', category: '政务数字化', relation: '长期客户' },
  { name: '长三角智能制造示范园区', category: '园区运营', relation: '项目共建' },
  { name: '两家国资控股智慧城市运营商', category: '系统集成', relation: '渠道合作' },
] as const

/** 企业概览侧栏：平铺子菜单（含舆情监测） */
const OVERVIEW_NAV_ITEMS = [
  { label: '基本信息', anchor: 'sec-basic-info' },
      { label: '司法风险', anchor: 'sec-legal-risk' },
  { label: '关联关系穿透', anchor: 'sec-relation-penetrate' },
      { label: '经营动态', anchor: 'sec-business-dynamics' },
      { label: '招投标', anchor: 'sec-bidding' },
  { label: '企业标签', anchor: 'sec-tags' },
      { label: '知识产权', anchor: 'sec-ip' },
      { label: '对外投资', anchor: 'sec-invest' },
  { label: '舆情监测', anchor: 'sec-sentiment-monitor' },
] as const

/** 详情页主内容存在的区块 id（URL hash / 首页快捷入口仍可达侧栏未列出的板块） */
const HASHABLE_SECTION_ANCHORS = new Set<string>([
  ...OVERVIEW_NAV_ITEMS.map((i) => i.anchor),
  'sec-industry-overview',
  'sec-industry-portrait',
  'sec-chain-enterprises',
  'sec-key-enterprises',
  'sec-industry-chain-graph',
  'sec-region-heatmap',
  'sec-industry-policy',
  'sec-investment-financing',
  'sec-supply-chain',
  'sec-industry-insight',
])

function anchorFromRouteHash(hash: string): string | null {
  if (!hash || !hash.startsWith('#')) return null
  const id = hash.slice(1)
  return HASHABLE_SECTION_ANCHORS.has(id) ? id : null
}

watch(
  companyName,
  () => {
    headerQuery.value = companyName.value
    const fromHash = anchorFromRouteHash(route.hash)
    activeNavAnchor.value = fromHash ?? 'sec-basic-info'
    overviewDonutSelectedIndex.value = null
    overviewDonutHoverIndex.value = null
  },
  { immediate: true }
)

watch(
  () => route.hash,
  () => {
    if (!company.value) return
    const a = anchorFromRouteHash(route.hash)
    if (a) activeNavAnchor.value = a
  }
)

function onNavLeafClick(anchor: string) {
  activeNavAnchor.value = anchor
  router.replace({ query: { ...route.query }, hash: `#${anchor}` })
}

function onHeaderSearch() {
  navigateToCompany(headerQuery.value)
}

function openAdvancedFilter() {
  filterOpen.value = true
}

function onFilterPickCompany(name: string) {
  navigateToCompany(name)
}
</script>

<template>
  <div v-if="company" class="detail-page">
    <header class="site-header">
      <RouterLink to="/" class="brand-link">
        <img
          class="brand-logo"
          :src="faviconUrl"
          alt=""
          width="40"
          height="40"
        />
        <span class="brand-title">企业 AI 智能体数据平台</span>
      </RouterLink>

      <div class="header-tools">
        <form class="header-search-form" @submit.prevent="onHeaderSearch">
          <div class="header-search-shell">
            <CompanySearchInput v-model="headerQuery" variant="header" />
            <button type="submit" class="header-search-submit">
              <svg class="header-search-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
                <path d="M20 20l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
              搜索
            </button>
          </div>
        </form>

        <button type="button" class="header-filter-btn" @click="openAdvancedFilter">
          <svg class="header-filter-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 5h16l-6.2 7.4V20l-3.6 1.8v-9.4L4 5z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" />
          </svg>
          高级筛选
        </button>

        <AuthGuestBar v-if="!isLoggedIn" />
        <UserMenuDropdown v-else />
      </div>
    </header>

    <div class="detail-top">
      <div class="title-row">
        <h1 class="company-name">{{ company.name }}</h1>
        <span class="status-pill">{{ company.status }}</span>
      </div>
     
    </div>

    <div class="detail-shell">
      <aside class="side-nav" aria-label="侧边导航">
        <div class="overview-nav-head">
          <NavMenuIcon name="building" />
          <span class="overview-nav-title">企业概览</span>
        </div>
        <nav class="overview-nav-list" aria-label="企业概览目录">
            <button
            v-for="item in OVERVIEW_NAV_ITEMS"
            :key="item.anchor"
              type="button"
            class="overview-nav-link"
            :class="{ 'is-current': activeNavAnchor === item.anchor }"
            @click="onNavLeafClick(item.anchor)"
              >
                <span class="acc-dot" aria-hidden="true" />
            {{ item.label }}
              </button>
        </nav>
      </aside>

      <main class="detail-main">
        <!-- 基本信息 -->
        <div id="sec-basic-info" v-show="activeNavAnchor === 'sec-basic-info'" class="anchor-target">
          <section id="sec-business" class="card section-card">
            <SectionHeading title="工商信息">
              <svg viewBox="0 0 24 24" fill="none"><path d="M4 21V10l8-5 8 5v11" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 21v-7h6v7" stroke="currentColor" stroke-width="1.75"/></svg>
            </SectionHeading>
            <div class="info-grid cols-3">
              <div v-for="(cell, i) in basicInfoCells" :key="`${cell.label}-${i}`" class="info-cell">
                <span class="lbl">{{ cell.label }}</span>
                <span class="val">{{ cell.value }}</span>
              </div>
              <div class="info-cell span-all">
                <span class="lbl">注册地址</span><span class="val">{{ company.address }}</span>
              </div>
              <div class="info-cell span-all scope-box">
                <span class="lbl">经营范围</span>
                <p class="scope-txt">{{ company.scope }}</p>
              </div>
            </div>
          </section>

          <section id="sec-shareholder" class="card section-card">
            <SectionHeading title="股东信息">
              <svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.75"/><circle cx="16" cy="9" r="2.5" stroke="currentColor" stroke-width="1.75"/><path d="M4 19c0-2.8 2.2-5 5-5M13 19c0-1.7 1.3-3 3-3" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>
            </SectionHeading>
            <div class="tbl-scroll">
              <table class="plain-table">
                <thead><tr><th>股东名称</th><th>股东类型</th><th>认缴出资额</th><th>持股比例</th><th>实缴出资额</th></tr></thead>
                <tbody>
                  <tr v-for="(row, i) in company.shareholders" :key="i">
                    <td>{{ row.name }}</td><td>{{ row.type }}</td><td>{{ row.subscribed }}</td><td>{{ row.ratio }}</td><td>{{ row.paidIn }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="sec-staff" class="card section-card">
            <SectionHeading title="主要人员">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 11a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" stroke-width="1.75"/><path d="M4 20l1.5-4.5A3 3 0 018.3 13h7.4a3 3 0 012.8 2.5L20 20" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>
            </SectionHeading>
            <div class="tbl-scroll">
              <table class="plain-table">
                <thead><tr><th>姓名</th><th>职务</th><th>任职日期</th></tr></thead>
                <tbody>
                  <tr v-for="(p, i) in company.staff" :key="i">
                    <td>{{ p.name }}</td><td>{{ p.title }}</td><td>{{ p.appointedDate }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="sec-change" class="card section-card">
            <SectionHeading title="变更记录">
              <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.75"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>
            </SectionHeading>
            <div v-if="company.changeRecords.length" class="change-records-block">
              <div class="tbl-scroll">
                <table class="plain-table change-records-table">
                  <thead>
                    <tr>
                      <th class="change-records-th-num">序号</th>
                      <th>变更日期</th>
                      <th>变更项目</th>
                      <th>变更前</th>
                      <th>变更后</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(rec, i) in changeRecordsPaged" :key="`${rec.date}-${rec.item}-${changeRecordsPageStartIndex + i}`">
                      <td class="change-records-td-num">{{ changeRecordsPageStartIndex + i + 1 }}</td>
                      <td>{{ rec.date }}</td>
                      <td>{{ rec.item }}</td>
                      <td class="change-records-cell-long">{{ rec.before }}</td>
                      <td class="change-records-cell-long">{{ rec.after }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <nav
                v-if="changeRecordsTotalPages > 1"
                class="change-records-pagination"
                aria-label="变更记录分页"
              >
                <button
                  type="button"
                  class="change-page-btn"
                  :disabled="changeRecordsPage <= 1"
                  @click="changeRecordsGoPrev"
                >
                  上一页
                </button>
                <span class="change-page-meta">
                  第 <strong>{{ changeRecordsPage }}</strong> 页，共 <strong>{{ changeRecordsTotalPages }}</strong> 页
                  <span class="change-page-count">（每页 {{ CHANGE_RECORDS_PAGE_SIZE }} 条，共 {{ company.changeRecords.length }} 条）</span>
                </span>
                <button
                  type="button"
                  class="change-page-btn"
                  :disabled="changeRecordsPage >= changeRecordsTotalPages"
                  @click="changeRecordsGoNext"
                >
                  下一页
                </button>
              </nav>
            </div>
            <p v-else class="muted-empty">暂无变更记录</p>
          </section>
        </div>

        <!-- 知识管理 -->
        <section id="sec-legal-risk" v-show="activeNavAnchor === 'sec-legal-risk'" class="card section-card anchor-target judicial-risk-section">
          <SectionHeading title="司法风险">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 3l9 4v5c0 5-4 10-9 11-5-1-9-6-9-11V7l9-4z" stroke="currentColor" stroke-width="1.75"/></svg>
          </SectionHeading>
          <div class="judicial-risk-stack">
            <JudicialRiskModule
              v-for="mod in JUDICIAL_RISK_MODULE_DEFS"
              :key="mod.key"
              :config="mod"
              :table="getJudicialTableDemo(company.name, company.risksEmpty, mod.key)"
            />
          </div>
        </section>

        <section id="sec-relation-penetrate" v-show="activeNavAnchor === 'sec-relation-penetrate'" class="card section-card anchor-target">
          <SectionHeading title="关联关系穿透"><svg viewBox="0 0 24 24" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.75"/><circle cx="16" cy="16" r="3" stroke="currentColor" stroke-width="1.75"/><path d="M10.5 10.5l3 3" stroke="currentColor" stroke-width="1.75"/></svg></SectionHeading>
          <div class="relation-summary" aria-label="持股与对外投资摘要">
            <section class="relation-summary-panel" aria-labelledby="relation-sh-heading">
              <div class="relation-summary-head">
                <h3 id="relation-sh-heading" class="relation-summary-title">股东结构</h3>
                <span class="relation-summary-badge">{{ company.shareholders.length }} 名股东</span>
              </div>
              <div v-if="company.shareholders.length" class="relation-sh-list">
                <div class="relation-sh-row relation-sh-row--head" aria-hidden="true">
                  <span>股东名称</span>
                  <span class="relation-sh-head-pct">持股比例</span>
                </div>
                <div
                  v-for="(s, i) in company.shareholders"
                  :key="`${i}-${s.name}`"
                  class="relation-sh-row"
                >
                  <div class="relation-sh-top">
                    <span class="relation-sh-name" :title="s.name">{{ s.name }}</span>
                    <span class="relation-sh-pct">{{ s.ratio }}</span>
                  </div>
                  <div class="relation-sh-track" role="presentation">
                    <span
                      class="relation-sh-fill"
                      :style="{ width: outboundRatioBarWidth(s.ratio) }"
                    />
                  </div>
                </div>
              </div>
              <p v-else class="relation-summary-empty">暂无股东结构公示信息</p>
        </section>
            <section class="relation-summary-panel" aria-labelledby="relation-out-heading">
              <div class="relation-summary-head">
                <h3 id="relation-out-heading" class="relation-summary-title">对外投资</h3>
                <span class="relation-summary-badge">{{ company.outboundInvest.length }} 项</span>
              </div>
              <div v-if="company.outboundInvest.length" class="relation-out-list">
                <article
                  v-for="(o, i) in company.outboundInvest"
                  :key="`${i}-${o.name}`"
                  class="relation-out-card"
                >
                  <div class="relation-out-top">
                    <span class="relation-out-name" :title="o.name">{{ o.name }}</span>
                    <div class="relation-out-right">
                      <span v-if="o.status" class="relation-out-status">{{ o.status }}</span>
                      <span class="relation-out-ratio">{{ o.ratio }}</span>
                    </div>
                  </div>
                  <div class="relation-out-track" role="presentation">
                    <span
                      class="relation-out-fill"
                      :style="{ width: outboundRatioBarWidth(o.ratio) }"
                    />
                  </div>
                  <p v-if="o.province || o.industry" class="relation-out-sub">
                    <template v-if="o.province">{{ o.province }}</template>
                    <template v-if="o.province && o.industry"> · </template>
                    <template v-if="o.industry">{{ o.industry }}</template>
                  </p>
                </article>
              </div>
              <p v-else class="relation-summary-empty">暂无对外投资公示信息</p>
        </section>
          </div>
          <p class="relation-chart-hint">下图谱为关联关系可视化，支持拖拽与缩放查看。</p>
          <div class="relation-chart-wrap">
            <RelationPenetrateChart
              :key="company.name"
              :company="company"
              :visible="activeNavAnchor === 'sec-relation-penetrate'"
            />
          </div>
          
        </section>
        <section id="sec-business-dynamics" v-show="activeNavAnchor === 'sec-business-dynamics'" class="card section-card anchor-target">
          <SectionHeading title="经营动态">
            <svg viewBox="0 0 24 24" fill="none"><path d="M4 14l4-4 4 4 8-8" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><path d="M4 19h16" stroke="currentColor" stroke-width="1.75"/></svg>
          </SectionHeading>
          <div class="viz-box biz-dynamics-panel">
            <ul class="biz-timeline">
              <li v-for="(row, i) in businessDynamicsItems" :key="i" class="biz-timeline-item">
                <div class="biz-timeline-axis" aria-hidden="true">
                  <span class="biz-timeline-dot" />
                  <span v-if="i < businessDynamicsItems.length - 1" class="biz-timeline-line" aria-hidden="true" />
                </div>
                <div class="biz-timeline-body">
                  <div class="biz-timeline-head">
                    <time class="biz-timeline-date" :datetime="row.date">{{ row.date }}</time>
                    <span class="biz-timeline-type">{{ row.type }}</span>
                  </div>
                  <h4 class="biz-timeline-title">{{ row.title }}</h4>
                  <ul v-if="row.fields?.length" class="biz-timeline-fields">
                    <li
                      v-for="(f, j) in row.fields"
                      :key="`${f.label}-${j}`"
                      class="biz-timeline-field"
                    >
                      <span class="biz-timeline-field-label">{{ f.label }}</span>
                      <span class="biz-timeline-field-value">{{ f.value }}</span>
                    </li>
                  </ul>
                  <p v-else-if="row.detail" class="biz-timeline-detail">{{ row.detail }}</p>
                </div>
              </li>
            </ul>
          </div>
        </section>
        <section id="sec-bidding" v-show="activeNavAnchor === 'sec-bidding'" class="card section-card anchor-target">
          <SectionHeading title="招投标">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 3l8 4v6c0 4-8 10-8 10S4 17 4 13V7l8-4z" stroke="currentColor" stroke-width="1.75"/></svg>
          </SectionHeading>
         
          <div class="viz-box bidding-panel">
            <div class="tbl-scroll">
              <table class="plain-table bidding-table">
                <thead>
                  <tr>
                    <th>项目名称</th>
                    <th>角色</th>
                    <th>金额（含税）</th>
                    <th>采购方 / 业主</th>
                    <th>日期</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, i) in biddingItems" :key="i">
                    <td class="bidding-cell-project">{{ row.project }}</td>
                    <td>
                      <span class="bidding-role" :class="row.role === '中标' ? 'is-win' : 'is-bid'">{{ row.role }}</span>
                    </td>
                    <td>{{ row.amount }}</td>
                    <td>{{ row.purchaser }}</td>
                    <td class="muted">{{ row.date }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
        <section id="sec-tags" v-show="activeNavAnchor === 'sec-tags'" class="card section-card anchor-target">
          <SectionHeading title="企业标签"><svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M8 21l-4-4V7h16v14l-4 4v-9H8v9z" stroke="currentColor" stroke-width="1.75"/></svg></SectionHeading>
          <div class="tag-row">
            <span
              v-for="(label, i) in company.tags"
              :key="`${i}-${label}`"
              class="pill"
              :class="`pill--${i % 6}`"
            >{{ label }}</span>
          </div>
        </section>
        <section id="sec-ip" v-show="activeNavAnchor === 'sec-ip'" class="card section-card anchor-target ip-section">
          <SectionHeading title="知识产权">
            <svg viewBox="0 0 24 24" fill="none"><path d="M9 18h6M9 21h6a2 2 0 002-2V9a7 7 0 10-14 0v10a2 2 0 002 2z" stroke="currentColor" stroke-width="1.75"/></svg>
          </SectionHeading>
          <p class="viz-note">专利与商标信息依据公开检索与备案数据同步展示。</p>
          <div class="ip-layout">
            <div class="ip-panel ip-panel--patent">
              <div class="ip-panel-head">
                <span class="ip-panel-mark" aria-hidden="true">P</span>
                <div class="ip-panel-head-text">
                  <h4 class="ip-panel-title">专利</h4>
                  <p class="ip-panel-count">{{ company.patents.length }} 项</p>
                </div>
              </div>
              <template v-if="company.patents.length">
                <div class="tbl-scroll ip-table-scroll">
                  <table class="plain-table ip-data-table">
                    <thead>
                      <tr>
                        <th class="ip-th-num">序号</th>
                        <th>发明名称</th>
                        <th>专利类型</th>
                        <th>法律状态</th>
                        <th>申请号</th>
                        <th>申请日期</th>
                        <th>公开(公告)号</th>
                        <th>公开(公告)日期</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(p, i) in patentsIpPaged" :key="`${patentIpStart + i}-${p.title}`">
                        <td class="ip-td-num">{{ patentIpStart + i + 1 }}</td>
                        <td class="ip-td-title">{{ p.title }}</td>
                        <td>{{ ipCell(p.patentType) }}</td>
                        <td>{{ ipCell(p.legalStatus) }}</td>
                        <td class="ip-td-mono">{{ ipCell(p.applicationNo) }}</td>
                        <td>{{ ipCell(p.applicationDate) }}</td>
                        <td class="ip-td-mono">{{ ipCell(p.publicationNo) }}</td>
                        <td>{{ ipCell(p.date) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <nav
                  v-if="patentIpTotalPages > 1"
                  class="change-records-pagination ip-pagination"
                  aria-label="专利分页"
                >
                  <button type="button" class="change-page-btn" :disabled="patentIpPage <= 1" @click="patentIpPrev">
                    上一页
                  </button>
                  <span class="change-page-meta">
                    第 <strong>{{ patentIpPage }}</strong> 页，共 <strong>{{ patentIpTotalPages }}</strong> 页
                    <span class="change-page-count">（每页 {{ IP_PAGE_SIZE }} 条）</span>
                  </span>
                  <button
                    type="button"
                    class="change-page-btn"
                    :disabled="patentIpPage >= patentIpTotalPages"
                    @click="patentIpNext"
                  >
                    下一页
                  </button>
                </nav>
              </template>
              <p v-else class="muted-empty ip-empty">暂无专利公示信息</p>
            </div>
            <div class="ip-panel ip-panel--copyright">
              <div class="ip-panel-head">
                <span class="ip-panel-mark ip-panel-mark--copy" aria-hidden="true">S</span>
                <div class="ip-panel-head-text">
                  <h4 class="ip-panel-title">软件著作权</h4>
                  <p class="ip-panel-count">{{ company.softwareCopyrights.length }} 项</p>
                </div>
              </div>
              <template v-if="company.softwareCopyrights.length">
                <div class="tbl-scroll ip-table-scroll">
                  <table class="plain-table ip-data-table ip-table-soft">
                    <thead>
                      <tr>
                        <th class="ip-th-num">序号</th>
                        <th>软件全称</th>
                        <th>软件简称</th>
                        <th>版本号</th>
                        <th>登记号</th>
                        <th>开发完成日期</th>
                        <th>首次发布日期</th>
                        <th>登记日期</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(row, i) in softwareCopyrightsIpPaged"
                        :key="`${softwareCopyrightIpStart + i}-${row.regNo}`"
                      >
                        <td class="ip-td-num">{{ softwareCopyrightIpStart + i + 1 }}</td>
                        <td class="ip-td-title">{{ row.fullName }}</td>
                        <td>{{ ipCell(row.shortName) }}</td>
                        <td class="ip-td-mono">{{ ipCell(row.version) }}</td>
                        <td class="ip-td-mono">{{ ipCell(row.regNo) }}</td>
                        <td>{{ ipCell(row.devCompleteDate) }}</td>
                        <td>{{ ipCell(row.firstPublishDate) }}</td>
                        <td>{{ ipCell(row.regDate) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <nav
                  v-if="softwareCopyrightIpTotalPages > 1"
                  class="change-records-pagination ip-pagination"
                  aria-label="软件著作权分页"
                >
                  <button
                    type="button"
                    class="change-page-btn"
                    :disabled="softwareCopyrightIpPage <= 1"
                    @click="softwareCopyrightIpPrev"
                  >
                    上一页
                  </button>
                  <span class="change-page-meta">
                    第 <strong>{{ softwareCopyrightIpPage }}</strong> 页，共
                    <strong>{{ softwareCopyrightIpTotalPages }}</strong> 页
                    <span class="change-page-count">（每页 {{ IP_PAGE_SIZE }} 条）</span>
                  </span>
                  <button
                    type="button"
                    class="change-page-btn"
                    :disabled="softwareCopyrightIpPage >= softwareCopyrightIpTotalPages"
                    @click="softwareCopyrightIpNext"
                  >
                    下一页
                  </button>
                </nav>
              </template>
              <p v-else class="muted-empty ip-empty">暂无软件著作权登记信息</p>
            </div>
            <div class="ip-panel ip-panel--tm">
              <div class="ip-panel-head">
                <span class="ip-panel-mark ip-panel-mark--tm" aria-hidden="true">®</span>
                <div class="ip-panel-head-text">
                  <h4 class="ip-panel-title">商标</h4>
                  <p class="ip-panel-count">{{ company.trademarks.length }} 项</p>
                </div>
              </div>
              <template v-if="company.trademarks.length">
               
                <div class="tbl-scroll ip-table-scroll">
                  <table class="plain-table ip-data-table ip-table-tm">
                    <thead>
                      <tr>
                        <th class="ip-th-num">序号</th>
                        <th class="ip-th-pattern">商标图案</th>
                        <th>商标名称</th>
                        <th>商标状态</th>
                        <th>申请/注册号</th>
                        <th>申请日期</th>
                        <th>国际分类</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(t, i) in trademarksIpPaged" :key="`${trademarkIpStart + i}-${t.name}`">
                        <td class="ip-td-num">{{ trademarkIpStart + i + 1 }}</td>
                        <td class="ip-tm-pattern-cell">
                          <img
                            v-if="trademarkHasPatternImage(t.patternUrl)"
                            :src="trademarkPatternSrc(t.patternUrl)"
                            alt=""
                            class="ip-tm-thumb"
                          />
                          <span
                            v-else
                            class="ip-tm-thumb-ph"
                            :title="t.name"
                            role="img"
                            :aria-label="`商标 ${t.name} 图案占位`"
                          >{{ tmPatternInitial(t.name) }}</span>
                        </td>
                        <td class="ip-td-title">{{ t.name }}</td>
                        <td class="ip-tm-status">{{ ipCell(t.status) }}</td>
                        <td class="ip-td-mono">{{ ipCell(t.regNo) }}</td>
                        <td>{{ ipCell(t.applicationDate) }}</td>
                        <td class="ip-tm-class">{{ ipCell(t.intClass) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <nav
                  v-if="trademarkIpTotalPages > 1"
                  class="change-records-pagination ip-pagination"
                  aria-label="商标分页"
                >
                  <button
                    type="button"
                    class="change-page-btn"
                    :disabled="trademarkIpPage <= 1"
                    @click="trademarkIpPrev"
                  >
                    上一页
                  </button>
                  <span class="change-page-meta">
                    第 <strong>{{ trademarkIpPage }}</strong> 页，共 <strong>{{ trademarkIpTotalPages }}</strong> 页
                    <span class="change-page-count">（每页 {{ IP_PAGE_SIZE }} 条）</span>
                  </span>
                  <button
                    type="button"
                    class="change-page-btn"
                    :disabled="trademarkIpPage >= trademarkIpTotalPages"
                    @click="trademarkIpNext"
                  >
                    下一页
                  </button>
                </nav>
              </template>
              <p v-else class="muted-empty ip-empty">暂无商标公示信息</p>
            </div>
          </div>
        </section>
        <section id="sec-invest" v-show="activeNavAnchor === 'sec-invest'" class="card section-card anchor-target invest-section">
          <SectionHeading title="对外投资">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 2v4M12 18v4M6 12H2M22 12h-4" stroke="currentColor" stroke-width="1.75"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.75"/></svg>
          </SectionHeading>
          <div class="viz-box invest-outbound-box">
            <ul class="invest-outbound-list">
              <li v-for="(row, i) in company.outboundInvest" :key="i" class="invest-outbound-card">
                <div class="invest-outbound-row">
                  <span class="invest-outbound-name">{{ row.name }}</span>
                  <span class="invest-outbound-ratio">{{ row.ratio }}</span>
                </div>
                <div
                  v-if="
                    row.status ||
                    row.subscribed ||
                    row.subscribedDate ||
                    row.province ||
                    row.industry
                  "
                  class="invest-outbound-meta"
                >
                  <div v-if="row.status" class="invest-meta-line">
                    <span class="invest-meta-lbl">状态</span>
                    <span
                      class="invest-meta-val"
                      :class="{ 'is-deregistered': row.status === '注销' }"
                    >{{ row.status }}</span>
                  </div>
                  <div v-if="row.subscribed" class="invest-meta-line">
                    <span class="invest-meta-lbl">认缴出资额</span>
                    <span class="invest-meta-val">{{ row.subscribed }}</span>
                  </div>
                  <div v-if="row.subscribedDate" class="invest-meta-line">
                    <span class="invest-meta-lbl">认缴出资日期</span>
                    <span class="invest-meta-val">{{ row.subscribedDate }}</span>
                  </div>
                  <div v-if="row.province" class="invest-meta-line">
                    <span class="invest-meta-lbl">所属省份</span>
                    <span class="invest-meta-val">{{ row.province }}</span>
                  </div>
                  <div v-if="row.industry" class="invest-meta-line">
                    <span class="invest-meta-lbl">所属行业</span>
                    <span class="invest-meta-val">{{ row.industry }}</span>
                  </div>
                </div>
                <div class="invest-outbound-track" role="presentation">
                  <span
                    class="invest-outbound-fill"
                    :style="{ width: outboundRatioBarWidth(row.ratio) }"
                  />
                </div>
              </li>
            </ul>
          </div>
        </section>

        <!-- 产业分析 ... -->
        <section id="sec-industry-overview" v-show="activeNavAnchor === 'sec-industry-overview'" class="card section-card anchor-target overview-section">
          <SectionHeading :title="overviewHeadline">
            <svg viewBox="0 0 24 24" fill="none"><path d="M4 18V11M12 18V7M20 18v-5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><path d="M2 21h20" stroke="currentColor" stroke-width="1.75"/></svg>
          </SectionHeading>


          <div class="overview-hover-scope" @mouseleave="onOverviewDonutChartLeave">
            <div class="overview-metrics-row">
              <button
                v-for="(row, i) in overviewIndustryMetrics"
                :key="row.label"
                type="button"
                class="overview-metric"
                :class="{ 'is-active': overviewDonutFocusIndex === i }"
                @click="onOverviewDonutSelect(i)"
                @mouseenter="overviewDonutHoverIndex = i"
              >
                <span class="overview-metric-label">{{ row.label }}</span>
                <span class="overview-metric-value">{{ row.displayValue }}</span>
              </button>
            </div>

            <div class="viz-box overview-donut-card">
              <div class="overview-legend-top" role="tablist" aria-label="产业指标">
              <button
                v-for="(arc, i) in overviewDonutArcs"
                :key="arc.label"
                type="button"
                role="tab"
                class="overview-legend-chip"
                :class="{ 'is-active': overviewDonutFocusIndex === i }"
                :aria-selected="overviewDonutFocusIndex === i"
                @click="onOverviewDonutSelect(i)"
                @mouseenter="overviewDonutHoverIndex = i"
              >
                <span class="overview-legend-swatch" :style="{ backgroundColor: arc.color }" aria-hidden="true" />
                <span class="overview-legend-text">{{ arc.label }}</span>
              </button>
              </div>

              <div class="overview-donut-stage">
              <div class="overview-donut-svg-wrap">
                <svg
                  class="overview-donut-svg"
                  viewBox="0 0 280 280"
                  preserveAspectRatio="xMidYMid meet"
                  role="img"
                >
                  <title>产业概览环形图</title>
                  <g v-for="(arc, i) in overviewDonutArcs" :key="i">
                    <path
                      :d="arc.d"
                      fill="none"
                      :stroke="arc.color"
                      :stroke-width="overviewDonutFocusIndex === i ? 42 : 36"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="overview-donut-seg"
                      :class="{
                        'is-selected': overviewDonutSelectedIndex === i,
                        'is-dimmed':
                          overviewDonutFocusIndex !== null && overviewDonutFocusIndex !== i,
                      }"
                      @click="onOverviewDonutSelect(i)"
                      @mouseenter="overviewDonutHoverIndex = i"
                    />
                  </g>
                  <text
                    v-if="overviewDonutFocus"
                    x="140"
                    y="138"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    class="donut-center-label"
                  >{{ overviewDonutFocus.label }}</text>
                  <text
                    v-else
                    x="140"
                    y="138"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    class="donut-center-placeholder"
                  >点击或悬停</text>
            </svg>

                <div
                  v-if="overviewDonutFocus"
                  class="overview-donut-tooltip"
                  :style="overviewDonutTooltipStyle"
                  role="status"
                  aria-live="polite"
                >
                  <p class="overview-tooltip-head">指标明细</p>
                  <div class="overview-tooltip-row">
                    <span class="overview-tooltip-dot" :style="{ backgroundColor: overviewDonutFocus.color }" />
                    <span class="overview-tooltip-name">{{ overviewDonutFocus.label }}</span>
                    <span class="overview-tooltip-val">{{ overviewDonutFocus.displayValue }}</span>
                  </div>
                  <p class="overview-tooltip-sub">占比 {{ overviewDonutFocus.percent }}%</p>
                </div>
              </div>
              </div>
            </div>
          </div>
        </section>
        <section id="sec-industry-portrait" v-show="activeNavAnchor === 'sec-industry-portrait'" class="card section-card anchor-target">
          <SectionHeading title="产业画像">
            <svg viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="7" rx="5" ry="3" stroke="currentColor" stroke-width="1.75"/><path d="M7 21c0-3 3-6 8-6h2" stroke="currentColor" stroke-width="1.75"/></svg>
          </SectionHeading>
         
          <div class="viz-box portrait-radar-wrap">
            <IndustryPortraitRadar
              :visible="activeNavAnchor === 'sec-industry-portrait'"
              :axes="portraitAxesForChart"
              series-name="产业竞争力"
            />
          </div>
        </section>
        <section id="sec-chain-enterprises" v-show="activeNavAnchor === 'sec-chain-enterprises'" class="card section-card anchor-target">
          <SectionHeading title="链上企业·AI产业链">
            <svg viewBox="0 0 24 24" fill="none"><circle cx="6" cy="12" r="2.5" stroke="currentColor" stroke-width="1.75"/><circle cx="18" cy="8" r="2.5" stroke="currentColor" stroke-width="1.75"/><circle cx="18" cy="16" r="2.5" stroke="currentColor" stroke-width="1.75"/><path d="M8.5 12h5M13 10l4-4M13 14l4 4" stroke="currentColor" stroke-width="1.5"/></svg>
          </SectionHeading>
          <div class="viz-box chain-tree-wrap">
            <ChainEnterpriseTree :visible="activeNavAnchor === 'sec-chain-enterprises'" />
          </div>
        </section>
        <section id="sec-key-enterprises" v-show="activeNavAnchor === 'sec-key-enterprises'" class="card section-card anchor-target">
          <SectionHeading title="重点企业榜">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 2l3 6 6 .5-4.5 4 1 6L12 16l-5.5 2.5 1-6L3 8.5 9 8l3-6z" stroke="currentColor" stroke-width="1.75"/></svg>
          </SectionHeading>
          <div class="viz-box key-enterprise-box">
            
            <div class="key-enterprise-chips" role="list">
              <button
                v-for="(row, i) in keyEnterpriseList"
                :key="i"
                type="button"
                class="key-enterprise-chip"
                role="listitem"
                @click="openKeyEnterprise(row.queryName)"
              >
                {{ row.displayName }}
              </button>
            </div>
          </div>
        </section>
        <section id="sec-industry-chain-graph" v-show="activeNavAnchor === 'sec-industry-chain-graph'" class="card section-card anchor-target">
          <SectionHeading title="产业链图谱">
            <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="10" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.75"/><rect x="15" y="4" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.75"/><rect x="15" y="16" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.75"/><path d="M9 13h6m0-5v13" stroke="currentColor" stroke-width="1.5"/></svg>
          </SectionHeading>
         
          <div class="viz-box chain-flow-wrap">
            <IndustryChainFlow />
          </div>
        </section>
        <section id="sec-region-heatmap" v-show="activeNavAnchor === 'sec-region-heatmap'" class="card section-card anchor-target">
          <SectionHeading title="区域热力">
            <svg viewBox="0 0 24 24" fill="none"><path d="M4 17l6-10 5 8 6-13v15H4z" stroke="currentColor" stroke-width="1.75" fill="rgba(239,68,68,0.12)"/></svg>
          </SectionHeading>
          
          <div class="viz-box china-heatmap-box">
            <ChinaRegionHeatmap :visible="activeNavAnchor === 'sec-region-heatmap'" />
          </div>
        </section>
        <section id="sec-industry-policy" v-show="activeNavAnchor === 'sec-industry-policy'" class="card section-card anchor-target">
          <SectionHeading title="产业政策">
            <svg viewBox="0 0 24 24" fill="none"><path d="M6 4h11v14H9l-5 5V4zM9 9h8M9 13h8" stroke="currentColor" stroke-width="1.75"/></svg>
          </SectionHeading>
         
          <ul class="policy-list">
            <li v-for="(row, i) in industryPolicyRows" :key="i" class="policy-row">
              <a
                class="policy-link"
                :href="row.url"
                target="_blank"
                rel="noopener noreferrer"
              >{{ row.title }}</a>
              <div class="policy-meta">
                <span class="policy-src">{{ row.source }}</span>
                <time class="policy-date" :datetime="row.date">{{ row.date }}</time>
              </div>
            </li>
          </ul>
        </section>
        <section id="sec-investment-financing" v-show="activeNavAnchor === 'sec-investment-financing'" class="card section-card anchor-target">
          <SectionHeading title="投融资">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="1.75"/></svg>
          </SectionHeading>
          <div class="viz-box finance-panel">
            <ul class="finance-card-list">
              <li v-for="(row, i) in financingItems" :key="i" class="finance-card">
                <div class="finance-card-top">
                  <span class="finance-round">{{ row.round }}</span>
                  <time class="finance-date" :datetime="row.date">{{ row.date }}</time>
                </div>
                <div class="finance-amount">{{ row.amount }}</div>
                <p class="finance-investors">{{ row.investors }}</p>
              </li>
            </ul>
          </div>
        </section>

        <section id="sec-supply-chain" v-show="activeNavAnchor === 'sec-supply-chain'" class="card section-card anchor-target">
          <SectionHeading title="供应链洞察">
            <svg viewBox="0 0 24 24" fill="none"><path d="M14 18V8H4v10M14 18h4l3-4v-4h-4" stroke="currentColor" stroke-width="1.75"/></svg>
          </SectionHeading>
          
          <div class="supply-grid">
            <div class="supply-column supply-column--up">
              <h4 class="supply-column-title">
                <span class="supply-column-badge">上游</span>
                供应商
              </h4>
              <ul class="supply-node-list">
                <li v-for="(row, i) in supplyUpstreamItems" :key="i" class="supply-node">
                  <div class="supply-node-name">{{ row.name }}</div>
                  <div class="supply-node-meta">
                    <span>{{ row.category }}</span>
                    <span class="supply-node-rel">{{ row.relation }}</span>
                  </div>
                </li>
              </ul>
            </div>
            <div class="supply-column supply-column--down">
              <h4 class="supply-column-title">
                <span class="supply-column-badge supply-column-badge--down">下游</span>
                客户 / 场景
              </h4>
              <ul class="supply-node-list">
                <li v-for="(row, i) in supplyDownstreamItems" :key="i" class="supply-node">
                  <div class="supply-node-name">{{ row.name }}</div>
                  <div class="supply-node-meta">
                    <span>{{ row.category }}</span>
                    <span class="supply-node-rel">{{ row.relation }}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>
        <section id="sec-sentiment-monitor" v-show="activeNavAnchor === 'sec-sentiment-monitor'" class="card section-card anchor-target sentiment-section">
          <SectionHeading title="舆情监测">
            <svg viewBox="0 0 24 24" fill="none"><path d="M21 15a4 4 0 01-7 3H8l-5 3V8a5 5 0 019-3 2 2 0 014 1v11z" stroke="currentColor" stroke-width="1.75"/></svg>
          </SectionHeading>
          
          <div class="viz-box sentiment-dash-wrap">
            <SentimentMonitorDashboard
              :visible="activeNavAnchor === 'sec-sentiment-monitor'"
              :news-rows="company.sentimentNews"
              :social-summary="company.sentimentSocialSummary"
            />
          </div>
        </section>
        <section id="sec-industry-insight" v-show="activeNavAnchor === 'sec-industry-insight'" class="card section-card anchor-target insight-section">
          <SectionHeading title="行业洞察">
            <svg viewBox="0 0 24 24" fill="none"><path d="M9 18h6M10 22h4M12 3a5 5 0 015 5c0 2-1.5 3.5-2.5 4.5L14 14h-4l-.5-1.5C8.5 11.5 7 10 7 8a5 5 0 015-5z" stroke="currentColor" stroke-width="1.75"/></svg>
          </SectionHeading>

          <div class="insight-kpi-row" role="list">
            <div
              v-for="(kpi, i) in industryInsightKpis"
              :key="i"
              class="insight-kpi-tile"
              role="listitem"
            >
              <span class="insight-kpi-value">{{ kpi.value }}</span>
              <span class="insight-kpi-label">{{ kpi.label }}</span>
              <span class="insight-kpi-hint">{{ kpi.hint }}</span>
            </div>
          </div>

          <div class="viz-box insight-board">
            <ul class="insight-card-list">
              <li
                v-for="(item, i) in industryInsightItems"
                :key="i"
                class="insight-card"
                :data-kind="item.kind"
              >
                <div class="insight-card-head">
                  <span class="insight-card-tag">{{ item.tag }}</span>
                  <span class="insight-card-meta">{{ item.meta }}</span>
                </div>
                <h4 class="insight-card-title">{{ item.title }}</h4>
                <p class="insight-card-body">{{ item.summary }}</p>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>

    <AdvancedFilterModal v-model:open="filterOpen" @select="onFilterPickCompany" />
  </div>
</template>

<style scoped>
.detail-page {
  --detail-x-gutter: 24px;
  display: flex;
  flex-direction: column;
  min-height: 100svh;
  background: #f5f7fa;
  color: var(--db-text);
}

.site-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 10px 24px;
  background: #fff;
  border-bottom: 1px solid #e8eaed;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: inherit;
  min-width: 0;
}

.brand-logo {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  flex-shrink: 0;
  display: block;
}

.brand-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--db-brand);
}

.header-tools {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  justify-content: flex-end;
  min-width: 0;
}

.header-search-form {
  flex: 1 1 280px;
  max-width: 480px;
  min-width: 160px;
}

.header-search-shell {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 5px 4px 14px;
  background: #f0f2f5;
  border-radius: 999px;
  border: 1px solid #e6e9ee;
}

.header-search-submit {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 14px;
  border: none;
  border-radius: 999px;
  background: #e4e7eb;
  font-size: 14px;
  font-weight: 600;
  color: #3d4a52;
  cursor: pointer;
}

.header-search-submit:hover {
  background: #d7dce2;
}

.header-filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid #e4e9f0;
  border-radius: 999px;
  background: #e8f0f8;
  font-size: 14px;
  font-weight: 600;
  color: var(--db-text);
  cursor: pointer;
}

.header-filter-btn:hover {
  background: #dce8f4;
}

.header-filter-ico {
  opacity: 0.85;
}

.detail-top {
  flex-shrink: 0;
  padding: 20px var(--detail-x-gutter);
  background: #fff;
  border-bottom: 1px solid #e8eaed;
}

.title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.company-name {
  margin: 0;
  font-size: clamp(20px, 2.8vw, 26px);
  font-weight: 700;
}

.status-pill {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #15803d;
  background: rgba(22, 163, 74, 0.12);
}

.action-row {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.ghost-btn {
  padding: 7px 14px;
  border: 1px solid #dfe3e8;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.detail-shell {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 268px minmax(0, 1fr);
  width: 100%;
  max-width: none;
  margin: 0;
  align-items: stretch;
}

@media (max-width: 920px) {
  .detail-shell {
    grid-template-columns: 1fr;
  }
  .side-nav {
    min-height: unset;
    border-right: none;
    border-bottom: 1px solid #e8eaed;
    max-height: 48vh;
    overflow-y: auto;
    position: sticky;
    top: 0;
    z-index: 4;
    background: #fff;
  }
}

.side-nav {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 12px 12px 12px var(--detail-x-gutter);
  border-right: 1px solid #eef0f3;
  background: #fff;
  text-align: left;
  overflow-y: auto;
}

.overview-nav-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px 12px;
  margin-bottom: 2px;
  border-bottom: 1px solid #eef0f3;
}

.overview-nav-head :deep(.nav-icon-wrap) {
  color: var(--db-primary);
}

.overview-nav-title {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: 0.02em;
}

.overview-nav-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 0 12px;
}

.overview-nav-link {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  text-align: left;
  font: inherit;
}

.overview-nav-link:hover {
  background: #f8fafc;
}

.overview-nav-link .acc-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: transparent;
  flex-shrink: 0;
}

.overview-nav-link.is-current {
  background: #e8f5e9;
  color: #1b5e20;
  font-weight: 600;
}

.overview-nav-link.is-current .acc-dot {
  background: #43a047;
}

.acc-unit {
  margin-bottom: 8px;
  border: 1px solid #eef0f4;
  border-radius: 10px;
  background: #fff;
}

.acc-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 11px 10px;
  border: none;
  background: #fff;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.acc-trigger-inner {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.acc-trigger-inner :deep(.nav-icon-wrap),
.nav-single :deep(.nav-icon-wrap) {
  color: var(--db-primary);
}

.acc-trigger.is-expanded .acc-arrow {
  transform: rotate(180deg);
}

.acc-arrow {
  flex-shrink: 0;
  color: #94a3b8;
  transition: transform 0.2s;
}

.acc-arrow.muted {
  opacity: 0.35;
}

.acc-body {
  padding: 6px 8px 10px;
  border-top: 1px solid #f4f6f8;
}

.acc-sublink {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 4px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  text-align: left;
}

.acc-sublink:hover {
  background: #f8fafc;
}

.acc-sublink .acc-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: transparent;
  flex-shrink: 0;
}

.acc-sublink.is-current {
  background: #e8f5e9;
  color: #1b5e20;
  font-weight: 600;
}

.acc-sublink.is-current .acc-dot {
  background: #43a047;
}

.nav-single {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 11px 10px;
  margin-bottom: 8px;
  border: 1px solid #eef0f4;
  border-radius: 10px;
  background: #fff;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
  text-align: left;
}

.nav-single:hover {
  background: #fafbfc;
}

.nav-single.is-current {
  border-color: #c8e6c9;
  background: #e8f5e9;
  color: #1b5e20;
}

.detail-main {
  padding: 16px 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.anchor-target {
  scroll-margin-top: 72px;
}

#sec-basic-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card.section-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eef0f3;
  padding: 18px 20px;
  box-shadow: 0 1px 4px rgba(15, 45, 56, 0.05);
}

.info-grid.cols-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

@media (max-width: 960px) {
  .info-grid.cols-3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 560px) {
  .info-grid.cols-3 {
    grid-template-columns: 1fr;
  }
}

.info-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.info-cell.span-all {
  grid-column: 1 / -1;
}
.lbl {
  font-size: 12px;
  color: #64748b;
}
.val {
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
  line-height: 1.45;
}
.scope-box .scope-txt {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: #334155;
}

.tbl-scroll {
  overflow-x: auto;
}
.plain-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.plain-table th,
.plain-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
  text-align: left;
  vertical-align: top;
}
.plain-table thead th {
  background: #f8fafc;
  font-weight: 600;
  color: #64748b;
}

.change-records-block {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.change-records-table {
  min-width: 720px;
}

.change-records-th-num,
.change-records-td-num {
  width: 3rem;
  text-align: center;
  white-space: nowrap;
}

.change-records-cell-long {
  max-width: 280px;
  line-height: 1.5;
  word-break: break-word;
}

.change-records-pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px 20px;
  padding: 4px 0 2px;
}

.change-page-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(0, 108, 77, 0.22);
  background: #fff;
  color: var(--db-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.change-page-btn:hover:not(:disabled) {
  background: rgba(0, 108, 77, 0.08);
  border-color: rgba(0, 108, 77, 0.35);
}

.change-page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.change-page-meta {
  font-size: 13px;
  color: #64748b;
  text-align: center;
  line-height: 1.5;
}

.change-page-meta strong {
  color: #334155;
  font-weight: 700;
}

.change-page-count {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  color: #94a3b8;
}

.muted-empty {
  margin: 0;
  font-size: 14px;
  color: #94a3b8;
}

.empty-soft {
  font-size: 14px;
  color: #94a3b8;
  padding: 8px 0;
}

.judicial-risk-stack {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.relation-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 0 0 14px;
}

@media (max-width: 900px) {
  .relation-summary {
    grid-template-columns: 1fr;
  }
}

.relation-summary-panel {
  border-radius: 12px;
  border: 1px solid #e8eef0;
  background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
  padding: 16px 16px 14px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}

.relation-summary-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
}

.relation-summary-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.02em;
}

.relation-summary-badge {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
}

.relation-summary-empty {
  margin: 4px 0 0;
  font-size: 13px;
  color: #94a3b8;
}

.relation-sh-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.relation-sh-row--head {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  padding: 0 0 8px;
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid #f1f5f9;
}

.relation-sh-head-pct {
  text-align: right;
  min-width: 4.5rem;
}

.relation-sh-row:not(.relation-sh-row--head) {
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.relation-sh-row:not(.relation-sh-row--head):last-child {
  border-bottom: none;
  padding-bottom: 2px;
}

.relation-sh-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.relation-sh-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.45;
  min-width: 0;
}

.relation-sh-pct {
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #006c4d;
}

.relation-sh-track {
  height: 6px;
  border-radius: 999px;
  background: #f1f5f9;
  overflow: hidden;
}

.relation-sh-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #34d399 0%, #006c4d 100%);
  transition: width 0.35s ease;
}

.relation-out-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.relation-out-card {
  margin: 0;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #eef2f6;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
}

.relation-out-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.relation-out-name {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.45;
  min-width: 0;
}

.relation-out-right {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.relation-out-status {
  font-size: 11px;
  font-weight: 600;
  color: #c2410c;
  padding: 2px 8px;
  border-radius: 6px;
  background: #ffedd5;
  border: 1px solid #fdba74;
}

.relation-out-ratio {
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #006c4d;
}

.relation-out-track {
  height: 6px;
  border-radius: 999px;
  background: #f1f5f9;
  overflow: hidden;
}

.relation-out-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #818cf8 0%, #4f46e5 100%);
  transition: width 0.35s ease;
}

.relation-out-sub {
  margin: 8px 0 0;
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.4;
}

.relation-chart-wrap {
  border: 1px solid #eef0f3;
  border-radius: 12px;
  background: #fafbfc;
  padding: 8px;
  overflow: hidden;
}

.relation-chart-hint {
  margin: 0 0 10px;
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.45;
}

.ph {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  line-height: 1.55;
}

.viz-note {
  margin: 0 0 12px;
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
}

.viz-box {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fafbfc;
  padding: 14px 16px;
}

.china-heatmap-box {
  padding: 8px 10px 12px;
}

.chain-tree-wrap {
  padding: 8px 10px 12px;
}

.chain-flow-wrap {
  padding: 10px 12px 14px;
}

.sentiment-dash-wrap {
  padding: 8px 10px 14px;
}

.sentiment-section.card.section-card {
  padding-bottom: 20px;
}

.portrait-radar-wrap {
  padding: 6px 8px 12px;
}

.policy-list {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
}

.policy-row {
  padding: 14px 0;
  border-bottom: 1px solid #f1f5f9;
}

.policy-row:last-child {
  border-bottom: none;
}

.policy-link {
  display: inline-block;
  font-size: 14px;
  font-weight: 600;
  color: #006c4d;
  text-decoration: none;
  line-height: 1.5;
}

.policy-link:hover {
  text-decoration: underline;
  color: #005239;
}

.policy-meta {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 12px;
  color: #64748b;
}

.policy-src {
  min-width: 0;
}

.policy-date {
  flex-shrink: 0;
  color: #94a3b8;
}

.key-enterprise-box {
  padding: 16px 18px 18px;
}

.key-enterprise-lead {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #64748b;
  text-transform: uppercase;
}

.key-enterprise-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.key-enterprise-chip {
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
    box-shadow 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.key-enterprise-chip:hover {
  border-color: #006c4d;
  background: #d1fae5;
  color: #064e3b;
  box-shadow: 0 6px 18px rgba(0, 108, 77, 0.12);
  transform: translateY(-1px);
}

.key-enterprise-chip:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 108, 77, 0.1);
}

.key-enterprise-chip:focus-visible {
  outline: 2px solid #006c4d;
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .key-enterprise-chip {
    transition: none;
  }
  .key-enterprise-chip:hover {
    transform: none;
  }
}

.insight-section.card.section-card {
  padding-bottom: 20px;
}

.insight-kpi-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 12px 0 16px;
}

.insight-kpi-tile {
  position: relative;
  padding: 14px 14px 12px;
  border-radius: 12px;
  border: 1px solid #e8eef0;
  background: linear-gradient(165deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 1px 2px rgba(15, 45, 56, 0.04);
  overflow: hidden;
}

.insight-kpi-tile::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #006c4d 0%, #34d399 100%);
  border-radius: 12px 0 0 12px;
}

.insight-kpi-value {
  display: block;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #006c4d;
  line-height: 1.15;
  margin-bottom: 6px;
}

.insight-kpi-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  line-height: 1.35;
}

.insight-kpi-hint {
  display: block;
  margin-top: 6px;
  font-size: 11px;
  color: #94a3b8;
}

.insight-board {
  padding: 14px 16px 16px;
}

.insight-card-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.insight-card {
  margin: 0;
  padding: 14px 14px 14px 16px;
  border-radius: 10px;
  border: 1px solid #eef2f6;
  background: #fff;
  border-left-width: 4px;
  border-left-style: solid;
  border-left-color: #cbd5e1;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.insight-card[data-kind='trend'] {
  border-left-color: #006c4d;
}

.insight-card[data-kind='opportunity'] {
  border-left-color: #059669;
}

.insight-card[data-kind='benchmark'] {
  border-left-color: #0d9488;
}

.insight-card[data-kind='risk'] {
  border-left-color: #ea580c;
}

.insight-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.insight-card-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #065f46;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
}

.insight-card[data-kind='risk'] .insight-card-tag {
  color: #9a3412;
  background: #fff7ed;
  border-color: #fdba74;
}

.insight-card-meta {
  flex-shrink: 0;
  font-size: 11px;
  color: #94a3b8;
}

.insight-card-title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.4;
}

.insight-card-body {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: #475569;
}

@media (max-width: 900px) {
  .insight-kpi-row {
    grid-template-columns: 1fr;
  }
}

.biz-dynamics-panel {
  padding: 8px 12px 14px;
}

.biz-timeline {
  list-style: none;
  margin: 0;
  padding: 0;
}

.biz-timeline-item {
  display: flex;
  gap: 14px;
  align-items: stretch;
}

.biz-timeline-item + .biz-timeline-item {
  margin-top: 4px;
}

.biz-timeline-axis {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 18px;
  flex-shrink: 0;
  padding-top: 4px;
}

.biz-timeline-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #006c4d;
  border: 2px solid #ecfdf5;
  box-shadow: 0 0 0 1px #a7f3d0;
}

.biz-timeline-line {
  flex: 1;
  width: 2px;
  min-height: 28px;
  margin: 4px 0 0;
  background: linear-gradient(180deg, #c8e6c9 0%, #e8f5e9 100%);
  border-radius: 1px;
}

.biz-timeline-body {
  flex: 1;
  min-width: 0;
  padding: 0 0 18px;
}

.biz-timeline-item:last-child .biz-timeline-body {
  padding-bottom: 4px;
}

.biz-timeline-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  margin-bottom: 6px;
}

.biz-timeline-date {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.biz-timeline-type {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.biz-timeline-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.4;
}

.biz-timeline-fields {
  margin: 0;
  padding: 12px 14px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #eef2f6;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px 20px;
  list-style: none;
}

.biz-timeline-field {
  margin: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.biz-timeline-field-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.02em;
}

.biz-timeline-field-value {
  font-size: 13px;
  line-height: 1.55;
  color: #334155;
  word-break: break-word;
}

.biz-timeline-detail {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #475569;
}

.bidding-panel {
  padding: 8px 0 10px;
}

.bidding-table td {
  vertical-align: middle;
}

.bidding-cell-project {
  font-weight: 500;
  color: #0f172a;
  max-width: 280px;
}

.bidding-role {
  display: inline-flex;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.bidding-role.is-win {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.bidding-role.is-bid {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.finance-panel {
  padding: 12px 14px 16px;
}

.finance-card-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.finance-card {
  margin: 0;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid #eef2f6;
  border-left: 4px solid #006c4d;
  background: linear-gradient(105deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.finance-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.finance-round {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #006c4d;
}

.finance-date {
  font-size: 11px;
  color: #94a3b8;
}

.finance-amount {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}

.finance-investors {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: #475569;
}

.supply-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 4px;
}

.supply-column {
  padding: 14px 16px 16px;
  border-radius: 12px;
  border: 1px solid #e8eef0;
  background: #fafbfc;
}

.supply-column--up {
  border-top: 3px solid #006c4d;
}

.supply-column--down {
  border-top: 3px solid #059669;
}

.supply-column-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
}

.supply-column-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.supply-column-badge--down {
  background: #f0fdf4;
  color: #047857;
  border-color: #86efac;
}

.supply-node-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.supply-node {
  padding: 10px 12px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #f1f5f9;
}

.supply-node-name {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.4;
  margin-bottom: 6px;
}

.supply-node-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
}

.supply-node-rel {
  font-weight: 600;
  color: #006c4d;
}

@media (max-width: 768px) {
  .supply-grid {
    grid-template-columns: 1fr;
  }

  .bidding-cell-project {
    max-width: none;
  }
}

.ip-section.card.section-card,
.invest-section.card.section-card {
  padding-bottom: 20px;
}

.ip-layout {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 4px;
}

.ip-panel {
  border-radius: 12px;
  border: 1px solid #e8eef0;
  background: linear-gradient(180deg, #ffffff 0%, #fafbfc 100%);
  padding: 16px 16px 14px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}

.ip-panel--patent {
  border-top: 3px solid #006c4d;
}

.ip-panel--tm {
  border-top: 3px solid #059669;
}

.ip-panel--copyright {
  border-top: 3px solid #0d9488;
}

.ip-panel-mark--copy {
  font-size: 16px;
  font-weight: 800;
  background: linear-gradient(145deg, #0d9488 0%, #14b8a6 100%);
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2);
}

.ip-table-soft thead th {
  background: #f2f2f2;
  color: #111827;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}

.ip-table-soft td {
  border-color: #e5e7eb;
}

.ip-panel-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.ip-panel-mark {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(145deg, #006c4d 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(0, 108, 77, 0.2);
}

.ip-panel-mark--tm {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(145deg, #059669 0%, #34d399 100%);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.18);
}

.ip-panel-head-text {
  min-width: 0;
}

.ip-panel-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.ip-panel-count {
  margin: 4px 0 0;
  font-size: 12px;
  color: #64748b;
}

.ip-table-scroll {
  margin: 0 -4px;
}

.ip-data-table {
  min-width: 880px;
  font-size: 12px;
}

.ip-table-soft {
  min-width: 960px;
}

.ip-tm-table-label {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: #dc2626;
  letter-spacing: 0.02em;
}

.ip-table-tm thead th {
  background: #f2f2f2;
  color: #111827;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
}

.ip-table-tm td {
  border-color: #e5e7eb;
}

.ip-tm-status,
.ip-tm-class {
  max-width: 10.5rem;
  line-height: 1.45;
  white-space: normal;
  word-break: break-word;
}

.ip-th-pattern {
  width: 4.5rem;
}

.ip-tm-pattern-cell {
  vertical-align: middle;
  text-align: center;
}

.ip-tm-thumb {
  display: block;
  width: 40px;
  height: 40px;
  margin: 0 auto;
  object-fit: contain;
  border-radius: 6px;
  border: 1px solid #e8eef0;
  background: #fff;
}

.ip-tm-thumb-ph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin: 0 auto;
  border-radius: 6px;
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
  font-size: 11px;
  font-weight: 700;
  color: var(--db-primary);
}

.ip-data-table th,
.ip-data-table td {
  vertical-align: top;
}

.ip-th-num,
.ip-td-num {
  width: 3rem;
  text-align: center;
  white-space: nowrap;
}

.ip-td-title {
  min-width: 160px;
  max-width: 280px;
  line-height: 1.45;
  word-break: break-word;
}

.ip-td-mono {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.ip-pagination {
  margin-top: 12px;
  padding-top: 2px;
}

.ip-empty {
  margin: 8px 0 0;
}

.invest-outbound-box {
  padding: 14px 16px 16px;
}

.invest-outbound-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.invest-outbound-card {
  margin: 0;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid #eef2f6;
  background: #fff;
  border-left: 4px solid #006c4d;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.invest-outbound-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
  padding: 8px 0 2px;
  border-top: 1px dashed #e2e8f0;
}

.invest-meta-line {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 12px;
  line-height: 1.45;
}

.invest-meta-lbl {
  flex-shrink: 0;
  width: 5.75rem;
  color: #94a3b8;
}

.invest-meta-val {
  color: #475569;
  min-width: 0;
}

.invest-meta-val.is-deregistered {
  font-weight: 600;
  color: #b45309;
}

.invest-outbound-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.invest-outbound-name {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.45;
  min-width: 0;
}

.invest-outbound-ratio {
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 700;
  color: #006c4d;
  padding: 4px 12px;
  border-radius: 999px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
}

.invest-outbound-track {
  height: 6px;
  border-radius: 999px;
  background: #f1f5f9;
  overflow: hidden;
}

.invest-outbound-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #34d399 0%, #006c4d 100%);
  transition: width 0.35s ease;
}


.sub-h {
  margin: 14px 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}
.sub-h:first-of-type {
  margin-top: 0;
}
.lite-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.lite-list li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}
.lite-list li:last-child {
  border-bottom: none;
}
.muted {
  color: #94a3b8;
  font-size: 13px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.overview-section .viz-note.overview-data-note {
  margin-top: -4px;
}

.overview-metrics-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

@media (max-width: 640px) {
  .overview-metrics-row {
    grid-template-columns: 1fr;
  }
}

.overview-metric {
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid #eef0f3;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
  text-align: left;
  cursor: pointer;
  font: inherit;
  transition:
    border-color 0.15s,
    box-shadow 0.15s,
    background 0.15s;
}

.overview-metric:focus-visible {
  outline: 2px solid var(--db-primary);
  outline-offset: 2px;
}

.overview-metric:hover {
  border-color: #dce4e9;
}

.overview-metric.is-active {
  border-color: rgba(0, 108, 77, 0.45);
  box-shadow: 0 0 0 1px rgba(0, 108, 77, 0.18);
  background: #f0fdf9;
}

.overview-metric-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.overview-metric-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--db-text);
  letter-spacing: 0.02em;
}

.overview-hover-scope {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.overview-donut-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.overview-legend-top {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 14px 20px;
  width: 100%;
}

.overview-legend-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  font: inherit;
  transition:
    background 0.15s,
    border-color 0.15s,
    box-shadow 0.15s;
}

.overview-legend-chip:hover {
  background: #f8fafc;
}

.overview-legend-chip:focus-visible {
  outline: 2px solid var(--db-primary);
  outline-offset: 2px;
}

.overview-legend-chip.is-active {
  background: #ecfdf5;
  border-color: rgba(0, 108, 77, 0.35);
  color: #065f46;
}

.overview-legend-swatch {
  width: 14px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

.overview-donut-stage {
  width: 100%;
  display: flex;
  justify-content: center;
}

.overview-donut-svg-wrap {
  position: relative;
  width: min(280px, 100%);
  max-width: 320px;
}

.overview-donut-svg {
  width: 100%;
  height: auto;
  display: block;
}

.donut-center-label {
  font-size: 15px;
  font-weight: 700;
  fill: #334155;
}

.donut-center-placeholder {
  font-size: 12px;
  fill: #94a3b8;
  font-weight: 500;
}

.overview-donut-tooltip {
  position: absolute;
  z-index: 3;
  min-width: 168px;
  padding: 12px 14px;
  border-radius: 10px;
  background: #fff;
  box-shadow:
    0 10px 28px rgba(15, 23, 42, 0.12),
    0 2px 8px rgba(15, 23, 42, 0.06);
  border: 1px solid #eef0f3;
  pointer-events: none;
}

.overview-tooltip-head {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 500;
  color: #94a3b8;
}

.overview-tooltip-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--db-text);
}

.overview-tooltip-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  flex-shrink: 0;
}

.overview-tooltip-name {
  flex: 1;
  min-width: 0;
  font-weight: 600;
}

.overview-tooltip-val {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #0f172a;
}

.overview-tooltip-sub {
  margin: 10px 0 0;
  font-size: 11px;
  color: #94a3b8;
}

.overview-donut-seg {
  cursor: pointer;
  transition:
    opacity 0.2s,
    stroke-width 0.15s ease,
    filter 0.15s;
}

.overview-donut-seg.is-dimmed {
  opacity: 0.38;
}

.overview-donut-seg.is-selected {
  filter: drop-shadow(0 2px 8px rgba(15, 23, 42, 0.18));
}

</style>
