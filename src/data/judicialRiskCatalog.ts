/** 司法风险子模块配置（样式对齐公开检索类产品常用的信息架构） */

export type JudicialModuleKey =
  | 'court-hearing'
  | 'court-notice'
  | 'judgment'
  | 'enforced'
  | 'dishonest'
  | 'case-file'
  | 'consumption-limit'

export interface JudicialRiskTabDef {
  id: string
  label: string
  count: number
}

export interface JudicialRiskModuleDef {
  key: JudicialModuleKey
  title: string
  /** 标题旁总数（可与当前选中 tab 一致，仅占位展示） */
  headerCount: number
  tabs: JudicialRiskTabDef[]
  /** 右侧筛选下拉占位文案 */
  filters: string[]
}

/**
 * 筛选维度 → 枚举选项（演示数据，覆盖司法公示常见口径）
 * 键名须与各模块 `filters` 数组中的文案一致。
 */
export const JUDICIAL_SELECT_OPTIONS: Readonly<Record<string, readonly string[]>> = {
  身份: [
    '全部',
    '原告',
    '被告',
    '第三人',
    '申请执行人',
    '被执行人',
    '上诉人',
    '被上诉人',
    '申请人',
    '被申请人',
    '其他案件参与方',
  ],
  立案年份: ['全部', '2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019及更早'],
  裁判年份: ['全部', '2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019及更早'],
  公告年份: ['全部', '2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019及更早'],
  开庭时间: ['全部', '近30日', '近3个月', '近6个月', '近1年', '2026', '2025', '2024', '2023及更早'],
  案由: [
    '全部',
    '合同纠纷',
    '买卖合同纠纷',
    '借款合同纠纷',
    '建设工程合同纠纷',
    '劳动争议',
    '侵权责任纠纷',
    '与公司有关的纠纷',
    '知识产权权属、侵权纠纷',
    '适用特殊程序案件案由',
    '海事海商纠纷',
    '行政纠纷',
    '执行异议',
    '其他案由',
  ],
}

/** 按筛选维度标签解析下拉枚举；未知维度时仅提供「全部」 */
export function optionsForJudicialFilter(filterLabel: string): readonly string[] {
  return JUDICIAL_SELECT_OPTIONS[filterLabel] ?? (['全部'] as const)
}

export const JUDICIAL_RISK_MODULE_DEFS: JudicialRiskModuleDef[] = [
  {
    key: 'court-hearing',
    title: '开庭公告',
    headerCount: 0,
    tabs: [
      { id: 'current', label: '开庭公告', count: 0 },
      { id: 'history', label: '历史开庭公告', count: 0 },
    ],
    filters: ['身份', '开庭时间', '案由'],
  },
  {
    key: 'court-notice',
    title: '法院公告',
    headerCount: 0,
    tabs: [
      { id: 'current', label: '法院公告', count: 0 },
      { id: 'history', label: '历史法院公告', count: 0 },
    ],
    filters: ['身份', '公告年份', '案由'],
  },
  {
    key: 'judgment',
    title: '裁判文书',
    headerCount: 0,
    tabs: [
      { id: 'current', label: '裁判文书', count: 0 },
      { id: 'history', label: '历史裁判文书', count: 0 },
    ],
    filters: ['身份', '裁判年份', '案由'],
  },
  {
    key: 'enforced',
    title: '被执行人',
    headerCount: 0,
    tabs: [
      { id: 'current', label: '被执行人', count: 0 },
      { id: 'history', label: '历史被执行人', count: 0 },
    ],
    filters: ['身份', '立案年份', '案由'],
  },
  {
    key: 'dishonest',
    title: '失信被执行人',
    headerCount: 0,
    tabs: [
      { id: 'current', label: '失信被执行人', count: 0 },
      { id: 'history', label: '历史失信被执行人', count: 0 },
    ],
    filters: ['身份', '立案年份', '案由'],
  },
  {
    key: 'case-file',
    title: '立案信息',
    headerCount: 0,
    tabs: [
      { id: 'current', label: '立案信息', count: 0 },
      { id: 'history', label: '历史立案信息', count: 0 },
    ],
    filters: ['身份', '立案年份', '案由'],
  },
  {
    key: 'consumption-limit',
    title: '限制高消费',
    headerCount: 0,
    tabs: [
      { id: 'current', label: '限制高消费', count: 0 },
      { id: 'history', label: '历史限制高消费', count: 0 },
    ],
    filters: ['身份', '立案年份', '案由'],
  },
]

/** 表格式样演示（可选）；缺省为空状态 */
export interface JudicialTableSpec {
  columns: string[]
  rows: Record<string, string>[]
}

const SAMPLE_ROWS: Partial<Record<JudicialModuleKey, JudicialTableSpec>> = {
  judgment: {
    columns: ['案号', '案件名称', '裁判日期', '案由'],
    rows: [
      {
        案号: '(2024)皖01民终0001号',
        案件名称: '买卖合同纠纷二审判决',
        裁判日期: '2024-08-12',
        案由: '买卖合同纠纷',
      },
    ],
  },
}

/** 有司法公示样例的企业展示表格，其余模块仍为空状态 */
export function getJudicialTableDemo(
  companyName: string,
  risksEmpty: boolean,
  key: JudicialModuleKey
): JudicialTableSpec | null {
  if (risksEmpty || companyName !== '科大讯飞股份有限公司') return null
  return SAMPLE_ROWS[key] ?? null
}
