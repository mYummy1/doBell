/**
 * 产业分析页：按子赛道切换的示例配置（锂电池等）。
 */

import {
  IA_FINANCING_ROWS,
  IA_KEY_ENTERPRISES,
  IA_POLICY_ROWS,
  IA_PORTRAIT_AXES,
} from './industryAnalysisNav'

export type IaPolicyRow = { title: string; source: string; date: string; url: string }
export type IaKeyEnterprise = { displayName: string; queryName: string }
export type IaFinanceRow = { round: string; amount: string; investors: string; date: string }
export type IaPortraitAxis = { label: string; value: number }

/** 新能源汽车 · 锂电池 */
export const NEV_BATTERY_LEAF_ID = 'nev-battery'

/** 锂电赛道：政策侧重产能规范、回收与新能源汽车长效机制（公开政策脉络示例） */
const BATTERY_POLICIES: IaPolicyRow[] = [
  {
    title: '锂离子电池行业规范条件（2024年本）',
    source: '工业和信息化部',
    date: '2024-06-19',
    url: 'https://www.miit.gov.cn/',
  },
  {
    title: '新能源汽车废旧动力电池综合利用行业规范条件',
    source: '工业和信息化部',
    date: '2023-12-15',
    url: 'https://www.miit.gov.cn/',
  },
  {
    title: '关于延续和优化新能源汽车车辆购置税减免政策的公告',
    source: '财政部 · 税务总局 · 工业和信息化部',
    date: '2023-06-19',
    url: 'https://www.gov.cn/',
  },
  {
    title: '新能源汽车产业发展规划（2021—2035年）',
    source: '国务院办公厅',
    date: '2020-11-02',
    url: 'https://www.gov.cn/',
  },
  {
    title: '关于加强电化学储能电站安全管理的通知',
    source: '国家能源局 · 应急管理部',
    date: '2022-04-26',
    url: 'https://www.nea.gov.cn/',
  },
]

/** A 股/港股锂电产业链代表性企业 */
const BATTERY_KEY_ENTERPRISES: IaKeyEnterprise[] = [
  { displayName: '宁德时代', queryName: '宁德时代新能源科技股份有限公司' },
  { displayName: '比亚迪', queryName: '比亚迪股份有限公司' },
  { displayName: '亿纬锂能', queryName: '惠州亿纬锂能股份有限公司' },
  { displayName: '中创新航', queryName: '中创新航科技集团股份有限公司' },
  { displayName: '欣旺达', queryName: '欣旺达电子股份有限公司' },
  { displayName: '国轩高科', queryName: '国轩高科股份有限公司' },
]

/** 锂电赛道近年典型资本运作条目（公开披露口径） */
const BATTERY_FINANCING: IaFinanceRow[] = [
  {
    round: '港股 IPO',
    amount: '募资约 13.6 亿港元',
    investors: '公开发售及机构投资者',
    date: '2024-10-24',
  },
  {
    round: '定向增发',
    amount: '约 ¥ 44 亿元',
    investors: '产业链战略投资者及公募基金',
    date: '2024-06-18',
  },
  {
    round: 'Pre-IPO',
    amount: '超 ¥ 10 亿元',
    investors: '产业资本、地方国资平台',
    date: '2024-03-12',
  },
  {
    round: 'B+ 轮',
    amount: '¥ 5 亿元',
    investors: '头部 VC、车企战略投资',
    date: '2023-11-08',
  },
]

/** 锂电赛道雷达基线：产能扩张期资本与创新维度相对偏高 */
const BATTERY_PORTRAIT_AXES: IaPortraitAxis[] = [
  { label: '产业规模', value: 88 },
  { label: '人才浓度', value: 76 },
  { label: '政策支持', value: 86 },
  { label: '资本热度', value: 91 },
  { label: '创新活力', value: 84 },
]

/** 与 china.json 省级名称对应的锂电产业集群热度权重（闽粤苏浙产能密集） */
export const BATTERY_REGION_HEAT: Record<string, number> = {
  福建省: 96,
  广东省: 92,
  江苏省: 90,
  浙江省: 87,
  四川省: 85,
  安徽省: 83,
  上海市: 84,
  江西省: 82,
  湖北省: 80,
  湖南省: 78,
  山东省: 77,
  重庆市: 79,
  天津市: 74,
  北京市: 73,
  河北省: 72,
  河南省: 71,
  广西壮族自治区: 75,
  陕西省: 70,
  辽宁省: 69,
  贵州省: 68,
  云南省: 72,
  吉林省: 66,
  黑龙江省: 64,
  山西省: 73,
  内蒙古自治区: 62,
  新疆维吾尔自治区: 58,
  宁夏回族自治区: 59,
  青海省: 56,
  海南省: 61,
  甘肃省: 60,
  西藏自治区: 52,
  台湾省: 55,
  香港特别行政区: 54,
  澳门特别行政区: 52,
}

export function iaPoliciesForLeaf(leafId: string | undefined): readonly IaPolicyRow[] {
  if (leafId === NEV_BATTERY_LEAF_ID) return BATTERY_POLICIES
  return IA_POLICY_ROWS
}

export function iaKeyEnterprisesForLeaf(leafId: string | undefined): readonly IaKeyEnterprise[] {
  if (leafId === NEV_BATTERY_LEAF_ID) return BATTERY_KEY_ENTERPRISES
  return IA_KEY_ENTERPRISES
}

export function iaFinancingForLeaf(leafId: string | undefined): readonly IaFinanceRow[] {
  if (leafId === NEV_BATTERY_LEAF_ID) return BATTERY_FINANCING
  return IA_FINANCING_ROWS
}

export function iaPortraitAxesBaseForLeaf(leafId: string | undefined): readonly IaPortraitAxis[] {
  if (leafId === NEV_BATTERY_LEAF_ID) return BATTERY_PORTRAIT_AXES
  return IA_PORTRAIT_AXES
}

export function iaPortraitLeadForLeaf(leafId: string | undefined): string {
  if (leafId === NEV_BATTERY_LEAF_ID) {
    return '五维雷达概括产能与订单能见度、研发与专利、政策窗口、融资活跃度及材料体系创新，刻画锂电赛道竞争位势。'
  }
  return '五维雷达对比规模、人才、政策、资本与创新，一览赛道结构与相对竞争力。'
}

/** 赛道分析右侧各区块标题下的说明文案 */
export type IaDetailFeatureId =
  | 'ia-feature-portrait'
  | 'ia-feature-chain'
  | 'ia-feature-key'
  | 'ia-feature-graph'
  | 'ia-feature-region'
  | 'ia-feature-policy'
  | 'ia-feature-finance'

const PANEL_LEAD_DEFAULT: Record<Exclude<IaDetailFeatureId, 'ia-feature-portrait'>, string> = {
  'ia-feature-chain':
    '按上游—中游—下游展开产业链节点树，便于查看分工与层级结构。',
  'ia-feature-key':
    '收录关注度较高的代表性企业，点击名称进入企业详情页。',
  'ia-feature-graph':
    '从左至右呈现关键环节与价值流向，辅助理解上下游衔接关系。',
  'ia-feature-region':
    '省级热度为站内综合指数，用于横向对比区域活跃程度。',
  'ia-feature-policy':
    '下列条目摘自部委及国家级公开文件，可在新窗口查阅原文。',
  'ia-feature-finance':
    '汇总近年公告披露的融资与资本运作信息，仅供参考，不构成投资建议。',
}

const PANEL_LEAD_BATTERY: Partial<Record<Exclude<IaDetailFeatureId, 'ia-feature-portrait'>, string>> = {
  'ia-feature-chain':
    '覆盖上游资源与材料、中游电芯与系统、下游应用及回收梯次等锂电典型环节。',
  'ia-feature-key':
    '重点企业选自锂电产业链龙头及港股/A 股代表性主体，点击跳转企业详情。',
  'ia-feature-graph':
    '呈现锂电池「材料—制造—系统—应用—回收」价值链流向。',
  'ia-feature-region':
    '闽粤苏浙川等产业集聚区热度相对偏高，可作区域对比参考。',
  'ia-feature-policy':
    '侧重锂电行业规范、综合利用与新能源汽车长效机制等政策脉络。',
  'ia-feature-finance':
    '侧重锂电材料扩产、储能与国际资本运作等公开披露案例。',
}

export function iaFeaturePanelLead(featureId: IaDetailFeatureId, leafId: string | undefined): string {
  if (featureId === 'ia-feature-portrait') {
    return iaPortraitLeadForLeaf(leafId)
  }
  if (leafId === NEV_BATTERY_LEAF_ID) {
    const b = PANEL_LEAD_BATTERY[featureId]
    if (b) return b
  }
  return PANEL_LEAD_DEFAULT[featureId]
}
