/** 产业分析页：功能导航与示例内容（与企业详情产业板块对应） */

export type IndustryAnalysisFeatureNavItem = {
  id: string
  label: string
  /** 侧栏副标题 */
  description: string
}

/** 选中具体子赛道后的分析模块（不含产业概览；概览在主页内容区） */
export const INDUSTRY_ANALYSIS_DETAIL_NAV: readonly IndustryAnalysisFeatureNavItem[] = [
  { id: 'ia-feature-portrait', label: '产业画像', description: '多维度竞争力雷达' },
  { id: 'ia-feature-chain', label: '链上企业', description: '产业链节点分布' },
  { id: 'ia-feature-key', label: '重点企业', description: '标杆企业速览' },
  { id: 'ia-feature-graph', label: '产业图谱', description: '上下游关系流' },
  { id: 'ia-feature-region', label: '区域热力', description: '省级热度分布' },
  { id: 'ia-feature-policy', label: '产业政策', description: '权威政策摘录' },
  { id: 'ia-feature-finance', label: '投融资', description: '融资轮次与时间线' },
] as const

export const IA_PORTRAIT_AXES = [
  { label: '产业规模', value: 80 },
  { label: '人才浓度', value: 80 },
  { label: '政策支持', value: 80 },
  { label: '资本热度', value: 60 },
  { label: '创新活力', value: 80 },
] as const

export const IA_POLICY_ROWS = [
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
] as const

export const IA_KEY_ENTERPRISES = [
  { displayName: '科大讯飞', queryName: '科大讯飞股份有限公司' },
  { displayName: '商汤科技', queryName: '商汤科技' },
  { displayName: '云从科技', queryName: '云从科技' },
  { displayName: '旷视科技', queryName: '旷视科技' },
] as const

export const IA_FINANCING_ROWS = [
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
] as const
