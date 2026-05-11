/** 产业分析：战略性新兴产业大类与子赛道及企业户数 */

export type IndustryLeaf = {
  id: string
  name: string
  /** 纳入本赛道统计的企业户数 */
  firmCount: number
}

export type IndustryGroup = {
  id: string
  title: string
  children: IndustryLeaf[]
}

export const INDUSTRY_ANALYSIS_CATALOG: readonly IndustryGroup[] = [
  {
    id: 'nev',
    title: '新能源汽车',
    children: [
      { id: 'nev-battery', name: '锂电池', firmCount: 41860 },
      { id: 'nev-icv', name: '智能网联汽车', firmCount: 28156 },
    ],
  },
  {
    id: 'ict',
    title: '新一代信息技术',
    children: [
      { id: 'ict-ic', name: '集成电路', firmCount: 51890 },
      { id: 'ict-5g', name: '5G', firmCount: 12408 },
      { id: 'ict-display', name: '新型显示', firmCount: 8965 },
      { id: 'ict-mobile', name: '移动通信', firmCount: 34210 },
    ],
  },
  {
    id: 'ai',
    title: '人工智能',
    children: [{ id: 'ai-core', name: '人工智能', firmCount: 29344 }],
  },
  {
    id: 'equipment',
    title: '高端装备制造',
    children: [
      { id: 'eq-rail', name: '轨道交通装备', firmCount: 6120 },
      { id: 'eq-im', name: '智能制造装备', firmCount: 38765 },
    ],
  },
  {
    id: 'green',
    title: '新能源及绿色低碳',
    children: [
      { id: 'gr-wind', name: '风力发电', firmCount: 8942 },
      { id: 'gr-pv', name: '光伏', firmCount: 45621 },
      { id: 'gr-h2', name: '氢能', firmCount: 5230 },
      { id: 'gr-env', name: '节能环保', firmCount: 67890 },
      { id: 'gr-bio', name: '生物质发电', firmCount: 2104 },
      { id: 'gr-apv', name: '先进光伏', firmCount: 11208 },
      { id: 'gr-storage', name: '储能', firmCount: 15670 },
    ],
  },
  {
    id: 'materials',
    title: '新材料',
    children: [{ id: 'mat-core', name: '新材料', firmCount: 72105 }],
  },
  {
    id: 'aerospace',
    title: '低空经济和商业航天',
    children: [
      { id: 'as-low', name: '低空经济', firmCount: 9845 },
      { id: 'as-equip', name: '航空航天装备', firmCount: 4321 },
      { id: 'as-space-info', name: '空天信息', firmCount: 2678 },
      { id: 'as-commercial', name: '商业航天', firmCount: 1566 },
      { id: 'as-sat', name: '卫星产业', firmCount: 3209 },
    ],
  },
  {
    id: 'smart-home',
    title: '智能家居',
    children: [{ id: 'sh-core', name: '智能家居', firmCount: 19876 }],
  },
  {
    id: 'bio',
    title: '生物医药',
    children: [
      { id: 'bio-device', name: '医疗器械', firmCount: 41230 },
      { id: 'bio-pharma', name: '医药制造', firmCount: 28560 },
    ],
  },
  {
    id: 'future',
    title: '未来产业',
    children: [
      { id: 'fu-q', name: '量子科技', firmCount: 892 },
      { id: 'fu-life', name: '生命科学', firmCount: 12440 },
      { id: 'fu-net', name: '未来网络', firmCount: 6780 },
    ],
  },
  {
    id: 'featured',
    title: '特色产业',
    children: [
      { id: 'fe-wire', name: '电线电缆', firmCount: 23450 },
      { id: 'fe-food', name: '绿色食品', firmCount: 56780 },
      { id: 'fe-digital', name: '数字创意', firmCount: 18920 },
    ],
  },
]

export function formatFirmCount(n: number): string {
  return n.toLocaleString('zh-CN')
}
