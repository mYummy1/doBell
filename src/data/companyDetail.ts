import { DUBEI_PATENT_ROWS, DUBEI_SOFTWARE_COPYRIGHT_ROWS, DUBEI_TRADEMARK_ROWS } from './ipCatalogDubei'

export interface ShareholderRow {
  name: string
  type: string
  ratio: string
  subscribed: string
  paidIn: string
}

export interface StaffRow {
  name: string
  title: string
  appointedDate: string
}

/** 工商变更记录（表格行） */
export interface ChangeRecordRow {
  /** 变更日期 */
  date: string
  /** 变更项目 */
  item: string
  /** 变更前 */
  before: string
  /** 变更后 */
  after: string
}

/** 专利公示表格行 */
export interface PatentRow {
  /** 发明名称 */
  title: string
  patentType?: string
  legalStatus?: string
  applicationNo?: string
  /** 申请日期 */
  applicationDate?: string
  /** 公开（公告）号 */
  publicationNo?: string
  /** 公开（公告）日期 */
  date: string
}

/** 计算机软件著作权登记表格行 */
export interface SoftwareCopyrightRow {
  /** 软件全称 */
  fullName: string
  /** 软件简称 */
  shortName?: string
  version: string
  /** 登记号 */
  regNo: string
  /** 开发完成日期 */
  devCompleteDate?: string
  /** 首次发布日期 */
  firstPublishDate?: string
  /** 登记日期 */
  regDate: string
}

/** 商标公示表格行 */
export interface TrademarkRow {
  /** 商标图案：图片 URL（http/https 或站内路径），缺省显示占位 */
  patternUrl?: string
  /** 商标名称 */
  name: string
  status?: string
  /** 申请/注册号 */
  regNo?: string
  applicationDate?: string
  /** 国际分类 */
  intClass?: string
}

/** 舆情监测 · 新闻动态表格行 */
export interface SentimentNewsRow {
  time: string
  event: string
  /** 备注/进展，可用换行分段 */
  remark: string
}

export interface RadarAxis {
  label: string
  value: number
}

/** 关联关系穿透图节点角色 */
export type RelationPenetrationNodeRole = 'target' | 'company' | 'person' | 'gov'

/** 关联关系穿透：节点（配合关系图 layout: none） */
export interface RelationPenetrationNode {
  id: string
  name: string
  role: RelationPenetrationNodeRole
  /** 画布坐标 */
  x: number
  y: number
  /** 名称上方说明（如实控人） */
  caption?: string
  /** 角标文案（如注销） */
  badge?: string
}

/** 关联关系穿透：边（source 持股流入 target） */
export interface RelationPenetrationLink {
  source: string
  target: string
  label: string
  dashed?: boolean
}

export interface RelationPenetrationSpec {
  nodes: RelationPenetrationNode[]
  links: RelationPenetrationLink[]
}

export interface OutboundRow {
  name: string
  ratio: string
  /** 被投资企业经营状态 */
  status?: string
  /** 认缴出资额 / 持股数（展示文案） */
  subscribed?: string
  /** 认缴出资日期 */
  subscribedDate?: string
  /** 所属省份 */
  province?: string
  /** 所属行业 */
  industry?: string
}

export interface CompanyDetailData {
  name: string
  status: string
  creditCode: string
  legalPerson: string
  capital: string
  established: string
  companyType: string
  industry: string
  address: string
  scope: string
  shareholders: ShareholderRow[]
  staff: StaffRow[]
  changeRecords: ChangeRecordRow[]
  patents: PatentRow[]
  /** 计算机软件著作权（有则展示） */
  softwareCopyrights: SoftwareCopyrightRow[]
  trademarks: TrademarkRow[]
  risksEmpty: boolean
  radar: RadarAxis[]
  outboundInvest: OutboundRow[]
  /** 企业标签展示用标签文案，顺序决定配色循环 */
  tags: string[]
  /** 以下为工商信息扩展字段，有则展示 */
  englishName?: string
  paidInCapital?: string
  registrationAuthority?: string
  approvalDate?: string
  orgCode?: string
  taxpayerId?: string
  insuredPersons?: string
  businessTerm?: string
  contactPhone?: string
  contactEmail?: string
  officialWebsite?: string
  /** 自定义关联关系穿透图（存在时优先于股东/对外投资自动生成） */
  relationPenetration?: RelationPenetrationSpec
  /** 舆情监测 · 新闻动态（有则展示表格） */
  sentimentNews?: SentimentNewsRow[]
  /** 舆情监测 · 社交媒体声量摘要文案 */
  sentimentSocialSummary?: string
}

function baseTemplate(name: string): CompanyDetailData {
  return {
    name,
    status: '存续',
    creditCode: '91340100MA2RN47W9X',
    legalPerson: '陈志远',
    capital: '5,000 万人民币',
    established: '2018-06-12',
    companyType: '有限责任公司（自然人投资或控股）',
    industry: '软件和信息技术服务业',
    address: '安徽省合肥市高新区创新大道与文曲路交汇处智能软件园 3 号楼',
    scope: `一般项目：技术服务、技术开发、技术咨询、技术交流、技术转让、技术推广；软件开发；信息系统集成服务；数据处理和存储支持服务。（除依法须经批准的项目外，凭营业执照依法自主开展经营活动）`,
    shareholders: [
      { name: '陆文凯', type: '自然人股东', ratio: '60%', subscribed: '3,000 万', paidIn: '—' },
      { name: '合肥睿思投资管理合伙企业（有限合伙）', type: '企业法人', ratio: '40%', subscribed: '2,000 万', paidIn: '—' },
    ],
    staff: [
      { name: '陈志远', title: '执行董事兼总经理', appointedDate: '2018-06-12 至今' },
      { name: '沈悦宁', title: '监事', appointedDate: '2018-06-12 至今' },
    ],
    changeRecords: [
      {
        date: '2024-12-10',
        item: '注册资本变更',
        before: '3,000 万人民币',
        after: '5,000 万人民币',
      },
    ],
    patents: [
      {
        title: '一种企业信息聚合与检索方法及装置',
        date: '2023-04-01',
        patentType: '发明专利',
        legalStatus: '授权',
        applicationNo: '—',
        applicationDate: '—',
        publicationNo: '—',
      },
      {
        title: '数据标注与模型训练管理系统',
        date: '2022-11-18',
        patentType: '发明专利',
        legalStatus: '授权',
        applicationNo: '—',
        applicationDate: '—',
        publicationNo: '—',
      },
    ],
    softwareCopyrights: [],
    trademarks: [
      { name: '笃联', intClass: '第 9 类', status: '已注册', regNo: '—', applicationDate: '—' },
      { name: 'DU-LINK', intClass: '第 42 类', status: '已注册', regNo: '—', applicationDate: '—' },
    ],
    risksEmpty: true,
    radar: [
      { label: '创新力', value: 72 },
      { label: '成长性', value: 68 },
      { label: '稳定性', value: 75 },
      { label: '规模', value: 55 },
      { label: '合规', value: 82 },
    ],
    outboundInvest: [
      { name: '合肥云链数据科技有限公司', ratio: '100%' },
      { name: '安徽智研新兴产业投资合伙企业（有限合伙）', ratio: '12%' },
    ],
    tags: ['高新技术企业', '科技型中小企业', '规上企业', '瞪羚企业'],
  }
}

const presets: Record<string, Partial<CompanyDetailData>> = {
  安徽安大笃北信息科技有限责任公司: {
    creditCode: '91340100336734307P',
    legalPerson: '陈天聪',
    capital: '573.32 万人民币',
    paidInCapital: '573.32 万人民币',
    established: '2015-03-19',
    approvalDate: '2015-03-19',
    companyType: '有限责任公司',
    industry: '软件和信息技术服务业',
    englishName: 'Anhui Anda Dubei Information Technology Co., Ltd.',
    registrationAuthority: '合肥市高新区市场监督管理局',
    orgCode: '33673430-7',
    taxpayerId: '91340100336734307P',
    insuredPersons: '少于50人',
    businessTerm: '长期',
    address: '合肥市高新区创新大道2800号创新产业园二期J1楼1001、1002室',
    contactPhone: '0551-64934677',
    contactEmail: '610917029@qq.com',
    officialWebsite: 'www.dobell.me',
    scope:
      '计算机、电子专业领域内的技术开发、技术服务；计算机网络工程、计算机软硬件的开发、移动互联网领域内的技术开发、技术服务。（依法须经批准的项目，经相关部门批准后方可开展经营活动）。',
    shareholders: [
      {
        name: '陈天聪',
        type: '法人股东',
        subscribed: '325 万人民币',
        ratio: '56.6874%',
        paidIn: '325 万',
      },
      {
        name: '赵海峰',
        type: '自然人股东',
        subscribed: '75 万人民币',
        ratio: '13.0817%',
        paidIn: '75 万',
      },
      {
        name: '倪盈盈',
        type: '自然人股东',
        subscribed: '75 万人民币',
        ratio: '13.0817%',
        paidIn: '75 万',
      },
      {
        name: '江苏中南天华众创空间发展有限公司',
        type: '合伙企业',
        subscribed: '73.32 万人民币',
        ratio: '12.7887%',
        paidIn: '73.32 万',
      },
      {
        name: '安徽大学资产经营有限公司',
        type: '合伙企业',
        subscribed: '25 万人民币',
        ratio: '4.3606%',
        paidIn: '25 万',
      },
    ],
    staff: [
      { name: '陈天聪', title: '董事长', appointedDate: '—' },
      { name: '罗纲', title: '董事', appointedDate: '—' },
      { name: '吴庆丰', title: '董事', appointedDate: '—' },
      { name: '赵海峰', title: '监事', appointedDate: '—' },
    ],
    changeRecords: [
      {
        date: '2023-10-14',
        item: '注册资本',
        before: '610.95 万元',
        after: '573.32 万元',
      },
      {
        date: '2023-10-14',
        item: '投资人（股权）变更',
        before: '上一版股东名册（章程备案）',
        after:
          '陈天聪 56.6874%；赵海峰 13.0817%；倪盈盈 13.0817%；江苏中南天华众创空间发展有限公司 12.7887%；安徽大学资产经营有限公司 4.3606%',
      },
      {
        date: '2022-08-16',
        item: '高级管理人员备案',
        before: '上一届董事、监事备案信息',
        after: '陈天聪（董事长）；罗纲、吴庆丰（董事）；赵海峰（监事）（以登记为准）',
      },
      {
        date: '2021-04-22',
        item: '经营范围',
        before: '计算机、电子领域内技术开发、技术服务；计算机网络工程、软硬件开发等',
        after: '在原经营范围基础上增加移动互联网领域内的技术开发、技术服务（以登记机关核定为准）',
      },
      {
        date: '2019-11-08',
        item: '联络员',
        before: '—',
        after: '联络员备案信息更新',
      },
      {
        date: '2018-11-12',
        item: '住所',
        before: '合肥市高新区黄山路与合作化路交口以东区域办公用房（以原证载为准）',
        after: '合肥市高新区创新大道2800号创新产业园二期J1楼1001、1002室',
      },
      {
        date: '2018-06-05',
        item: '实缴出资额公示',
        before: '—',
        after: '各股东实缴情况与认缴一致（以年报及登记公示为准）',
      },
      {
        date: '2017-03-20',
        item: '企业名称',
        before: '—',
        after: '安徽安大笃北信息科技有限责任公司（以核准通知书为准）',
      },
      {
        date: '2016-09-14',
        item: '章程备案',
        before: '上一版公司章程',
        after: '修订后的公司章程（股东会决议备案）',
      },
      {
        date: '2015-11-30',
        item: '投资人变更',
        before: '设立时股东结构',
        after: '增资扩股后的股东结构（以章程备案为准）',
      },
      {
        date: '2015-03-19',
        item: '设立登记',
        before: '—',
        after: '公司设立，领取营业执照',
      },
    ],
    patents: DUBEI_PATENT_ROWS,
    softwareCopyrights: DUBEI_SOFTWARE_COPYRIGHT_ROWS,
    trademarks: DUBEI_TRADEMARK_ROWS,
    outboundInvest: [
      {
        name: '湖北笃北信息科技有限责任公司',
        ratio: '69%',
        status: '注销',
        subscribed: '69 万元',
        subscribedDate: '2018-04-27',
        province: '湖北省',
        industry: '信息传输、软件和信息技术服务业',
      },
    ],
    risksEmpty: true,
    radar: [
      { label: '创新力', value: 62 },
      { label: '成长性', value: 58 },
      { label: '稳定性', value: 72 },
      { label: '规模', value: 42 },
      { label: '合规', value: 76 },
    ],
    relationPenetration: {
      nodes: [
        {
          id: '__center__',
          name: '安徽安大笃北信息科技有限责任公司',
          role: 'target',
          x: 460,
          y: 300,
        },
        {
          id: 'ob-hubei',
          name: '湖北笃北信息科技有限责任公司',
          role: 'company',
          x: 460,
          y: 460,
          badge: '注销',
        },
        {
          id: 'sh-chen',
          name: '陈天聪',
          role: 'person',
          x: 52,
          y: 218,
          caption: '实际控制人 · 受益所有人：56.6874%',
        },
        { id: 'sh-ni', name: '倪盈盈', role: 'person', x: 188, y: 218 },
        { id: 'sh-zhao', name: '赵海峰', role: 'person', x: 324, y: 218 },
        {
          id: 'sh-jszn',
          name: '江苏中南天华众创空间发展有限公司',
          role: 'company',
          x: 528,
          y: 218,
        },
        {
          id: 'sh-jiangyin',
          name: '江阴中南重工集团有限公司',
          role: 'company',
          x: 528,
          y: 118,
        },
        { id: 'sh-csz', name: '陈少忠', role: 'person', x: 448, y: 38 },
        { id: 'sh-zmf', name: '周满芬', role: 'person', x: 498, y: 38 },
        { id: 'sh-hcx', name: '黄成兴', role: 'person', x: 548, y: 38 },
        { id: 'sh-csy', name: '陈少云', role: 'person', x: 598, y: 38 },
        {
          id: 'sh-ahdx',
          name: '安徽大学资产经营有限公司',
          role: 'company',
          x: 762,
          y: 218,
        },
        {
          id: 'sh-ahgz',
          name: '安徽省国有资本运营控股集团有限公司',
          role: 'company',
          x: 698,
          y: 118,
        },
        { id: 'sh-ahuniv', name: '安徽大学', role: 'company', x: 868, y: 218 },
        {
          id: 'sh-sasac',
          name: '安徽省人民政府国有资产监督管理委员会',
          role: 'gov',
          x: 698,
          y: 38,
        },
      ],
      links: [
        { source: 'sh-chen', target: '__center__', label: '56.6874%' },
        { source: 'sh-ni', target: '__center__', label: '13.0817%' },
        { source: 'sh-zhao', target: '__center__', label: '13.0817%' },
        { source: 'sh-jszn', target: '__center__', label: '12.7887%' },
        { source: 'sh-jiangyin', target: 'sh-jszn', label: '100%' },
        { source: 'sh-csz', target: 'sh-jiangyin', label: '99.7619%' },
        { source: 'sh-zmf', target: 'sh-jiangyin', label: '0.1119%' },
        { source: 'sh-hcx', target: 'sh-jiangyin', label: '0.0714%' },
        { source: 'sh-csy', target: 'sh-jiangyin', label: '0.0476%' },
        { source: 'sh-ahdx', target: '__center__', label: '4.3606%' },
        { source: 'sh-ahgz', target: 'sh-ahdx', label: '60%' },
        { source: 'sh-ahuniv', target: 'sh-ahdx', label: '40%' },
        { source: 'sh-sasac', target: 'sh-ahgz', label: '100%' },
        { source: '__center__', target: 'ob-hubei', label: '控股 69%', dashed: true },
      ],
    },
    sentimentSocialSummary: '近30天提及量上升32%，正面舆情占比87%',
    sentimentNews: [
      {
        time: '2023年11月',
        event: '中标安徽大学 2023 年网络内容管理项目',
        remark:
          '中标金额 112.7 万元。具体服务内容：对全省高校网站群数据进行采集分析，并提供一年的免费部署、调试和技术培训。',
      },
      {
        time: '2024年起',
        event: '持续拓展业务，涉足政务、医疗、残疾人就业等领域',
        remark:
          '业务已覆盖全国十多个省市，核心产品包括政务教育新媒体平台、科研 AI 工作平台、网络零售数据服务和家庭医生数字化管理系统等。',
      },
      {
        time: '2020年5月',
        event: '为安徽大学“空中双选会”提供技术保障',
        remark: '公司提供了线上双选会的技术平台 (sxh.dobell.me)，助力该校毕业生就业。',
      },
      {
        time: '2019年5月',
        event: '业务拓展：为省内外 12 所高校打造特色 APP',
        remark: '当时的目标是整合资源，为国内外更多高校提供定制化校园服务。',
      },
      {
        time: '2019年10月',
        event: '受邀在全省教育系统会议上进行平台演示',
        remark: '公司向全省教育系统代表展示了其开发的新媒体和活动系统。',
      },
      {
        time: '2017年12月',
        event: '融资 1500 万元及联合多所高校发布多款产品',
        remark:
          '公司联合合肥工业大学、合肥师范学院、安徽医科大学、湖北师范大学等校园团队，发布了“嗨建大”“掌上合师”“掌上安医”等多款产品。\n此轮融资包括：\n1. 500 万元天使轮融资（投资方为上市公司中南集团）。\n2. 1000 万元创投发展基金。',
      },
      {
        time: '2019年12月',
        event: '接待中科大 MBA 创业沙龙',
        remark: '公司作为高新企业代表，分享了“科研星”等产品的发展经验。',
      },
      {
        time: '2018年6月',
        event: '旗下项目获“创青春”安徽省大学生创业大赛金奖',
        remark: '“安徽安大笃北信息科技有限责任公司”项目获得创业实践挑战赛金奖。',
      },
    ],
    tags: [
      '合肥高新技术产业开发区',
      '科技型中小企业',
      '信息传输、软件和信息技术服务业',
      '软件和信息技术服务业',
      '信息系统集成和物联网技术服务',
      '信息系统集成服务',
    ],
  },
  科大讯飞股份有限公司: {
    creditCode: '913400007117030788',
    legalPerson: '刘庆峰',
    capital: '231,069.4186 万人民币',
    established: '1999-12-30',
    companyType: '其他股份有限公司(上市)',
    industry: '软件和信息技术服务业',
    address: '安徽省合肥市高新区望江西路666号',
    shareholders: [
      { name: '中国移动通信有限公司', type: '企业法人', ratio: '10.52%', subscribed: '—', paidIn: '—' },
      { name: '刘庆峰', type: '自然人股东', ratio: '5.96%', subscribed: '—', paidIn: '—' },
      { name: '其他社会公众股', type: '其他', ratio: '—', subscribed: '—', paidIn: '—' },
    ],
    staff: [{ name: '刘庆峰', title: '董事长', appointedDate: '—' }],
    changeRecords: [],
    risksEmpty: false,
    radar: [
      { label: '创新力', value: 92 },
      { label: '成长性', value: 78 },
      { label: '稳定性', value: 88 },
      { label: '规模', value: 95 },
      { label: '合规', value: 85 },
    ],
    tags: ['上市企业', '国家技术创新示范企业', '人工智能骨干企业', '知识产权优势企业', '重点软件企业', '博士后工作站'],
  },
  京东方科技集团股份有限公司: {
    capital: '3,781,968.9014 万人民币',
    established: '1993-04-09',
    companyType: '其他股份有限公司(上市)',
    industry: '计算机、通信和其他电子设备制造业',
    address: '北京市朝阳区酒仙桥路10号',
    risksEmpty: true,
    shareholders: [{ name: '北京京东方投资发展有限公司', type: '企业法人', ratio: '—', subscribed: '—', paidIn: '—' }],
    radar: [
      { label: '创新力', value: 88 },
      { label: '成长性', value: 70 },
      { label: '稳定性', value: 90 },
      { label: '规模', value: 98 },
      { label: '合规', value: 86 },
    ],
    tags: ['上市企业', '制造业单项冠军', '绿色工厂', '智能制造试点'],
  },
  合肥智算科技有限公司: {
    capital: '10,000 万人民币',
    established: '2021-03-15',
    industry: '互联网和相关服务',
    address: '安徽省合肥市经开区智能科技园',
    radar: [
      { label: '创新力', value: 78 },
      { label: '成长性', value: 85 },
      { label: '稳定性', value: 62 },
      { label: '规模', value: 48 },
      { label: '合规', value: 80 },
    ],
    tags: ['科技型中小企业', '大数据企业', '双软认证', '创新型中小企业'],
  },
}

export function getCompanyDetail(name: string): CompanyDetailData {
  const base = baseTemplate(name)
  const extra = presets[name]
  if (!extra) return base
  return {
    ...base,
    ...extra,
    name,
    shareholders: extra.shareholders ?? base.shareholders,
    staff: extra.staff ?? base.staff,
    changeRecords: extra.changeRecords ?? base.changeRecords,
    patents: extra.patents ?? base.patents,
    softwareCopyrights: extra.softwareCopyrights ?? base.softwareCopyrights,
    trademarks: extra.trademarks ?? base.trademarks,
    radar: extra.radar ?? base.radar,
    outboundInvest: extra.outboundInvest ?? base.outboundInvest,
    tags: extra.tags ?? base.tags,
    relationPenetration: extra.relationPenetration ?? base.relationPenetration,
    sentimentNews: extra.sentimentNews ?? base.sentimentNews,
    sentimentSocialSummary: extra.sentimentSocialSummary ?? base.sentimentSocialSummary,
  }
}
